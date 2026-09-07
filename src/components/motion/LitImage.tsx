"use client";

/**
 * LitImage
 * A three.js plane that shows one of several images and swaps between them.
 *
 * Two rules, both learned the hard way. Nothing warps: a lens ripple across a
 * face reads as a defect, not an effect, so the swap is a grain sweep that
 * dissolves one plate into the next while both stay perfectly straight. And
 * the pointer carries a light rather than a distortion: where it falls the
 * grade lifts and the picture warms, so moving over a portrait is like
 * walking a lamp across it. That is the whole site in one gesture.
 *
 * <LitImage images={[{src, alt}, ...]} index={active} className="aspect-[4/5]" />
 *
 * Controlled: change `index` and it transitions. Textures are preloaded
 * outside the canvas so the WebGL context is created exactly once.
 * Fallback (no WebGL, reduced motion, `simple`, or while loading): stacked
 * <img> with an opacity crossfade. The canvas pauses when off screen.
 */

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useMedia";

export type LitSource = { src: string; alt: string };

const vertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const fragment = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTexA;
uniform sampler2D uTexB;
uniform float uAspectA;
uniform float uAspectB;
uniform float uPlaneAspect;
uniform float uProgress;
uniform vec2 uPointer;
uniform float uHover;
uniform float uTint;
uniform vec3 uTintColor;
uniform vec3 uWarmColor;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

/** object-fit: cover, in uv space. */
vec2 cover(vec2 uv, float planeAspect, float texAspect) {
  vec2 s = planeAspect > texAspect ? vec2(1.0, texAspect / planeAspect) : vec2(planeAspect / texAspect, 1.0);
  return (uv - 0.5) * s + 0.5;
}

void main() {
  vec2 uv = vUv;
  float p = smoothstep(0.0, 1.0, uProgress);

  // The arriving plate settles out of a hair of scale and the leaving one
  // drifts back. Uniform scale only, so no straight line ever bends.
  vec2 uvA = cover((uv - 0.5) * (1.0 + 0.030 * p) + 0.5, uPlaneAspect, uAspectA);
  vec2 uvB = cover((uv - 0.5) * (1.030 - 0.030 * p) + 0.5, uPlaneAspect, uAspectB);
  vec4 a = texture2D(uTexA, uvA);
  vec4 b = texture2D(uTexB, uvB);

  // A soft edge sweeps up the frame and grain breaks it, so the swap reads
  // as a film dissolve. It reaches exactly 0 at the start and 1 at the end.
  float grain = noise(uv * 240.0) * 0.10 + noise(uv * 6.0) * 0.14;
  float lead = uv.y * 0.55 + uv.x * 0.20;
  float m = smoothstep(0.0, 1.0, clamp((p * 1.45 - (lead * 0.55 + grain)) / 0.42, 0.0, 1.0));
  vec4 col = mix(a, b, m);

  // The lamp. A soft pool of light under the pointer.
  vec2 toP = uv - uPointer;
  toP.x *= uPlaneAspect;
  float lamp = exp(-dot(toP, toP) * 8.0) * uHover;

  // Duotone at rest, resolving to colour where the lamp falls.
  float l = dot(col.rgb, vec3(0.299, 0.587, 0.114));
  vec3 graded = mix(vec3(l * 1.02), uTintColor * (0.55 + l * 1.5), 0.6);
  col.rgb = mix(col.rgb, graded, uTint * (1.0 - lamp));
  col.rgb += uWarmColor * lamp * 0.10 * (0.35 + l);

  float vig = smoothstep(0.95, 0.35, length((vUv - 0.5) * vec2(1.0, 0.9)));
  col.rgb *= 0.86 + 0.14 * vig;
  gl_FragColor = col;
}`;

type Uniforms = {
  uTexA: { value: THREE.Texture };
  uTexB: { value: THREE.Texture };
  uAspectA: { value: number };
  uAspectB: { value: number };
  uPlaneAspect: { value: number };
  uProgress: { value: number };
  uPointer: { value: THREE.Vector2 };
  uHover: { value: number };
  uTint: { value: number };
  uTintColor: { value: THREE.Color };
  uWarmColor: { value: THREE.Color };
};

function aspectOf(t: THREE.Texture) {
  const img = t.image as { width?: number; height?: number } | undefined;
  return img?.width && img?.height ? img.width / img.height : 1;
}

type Shared = {
  pointer: { x: number; y: number; hover: number };
  tint: number;
};

function Plane({ textures, index, shared }: { textures: THREE.Texture[]; index: number; shared: Shared }) {
  const { viewport } = useThree();
  const prev = useRef(index);

  // The material is created once and owned here, so every uniform write below
  // lands on the exact object the renderer reads.
  const material = useMemo(() => {
    const t = textures[index];
    const asp = aspectOf(t);
    const uniforms: Uniforms = {
      uTexA: { value: t },
      uTexB: { value: t },
      uAspectA: { value: asp },
      uAspectB: { value: asp },
      uPlaneAspect: { value: 1 },
      uProgress: { value: 0 },
      uPointer: { value: new THREE.Vector2(-10, -10) },
      uHover: { value: 0 },
      uTint: { value: shared.tint },
      uTintColor: { value: new THREE.Color("#2f6b68") },
      uWarmColor: { value: new THREE.Color("#ff8a3d") },
    };
    return new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: fragment, transparent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const u = material.uniforms as unknown as Uniforms;

  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    if (index === prev.current) return;
    const from = textures[prev.current];
    const to = textures[index];
    prev.current = index;
    gsap.killTweensOf(u.uProgress);
    u.uTexA.value = from;
    u.uAspectA.value = aspectOf(from);
    u.uTexB.value = to;
    u.uAspectB.value = aspectOf(to);
    u.uProgress.value = 0;
    gsap.to(u.uProgress, { value: 1, duration: 1.2, ease: "power2.inOut" });
  }, [index, textures, u]);

  useFrame(() => {
    u.uPlaneAspect.value = viewport.width / viewport.height;
    u.uPointer.value.set(shared.pointer.x, shared.pointer.y);
    u.uHover.value += (shared.pointer.hover - u.uHover.value) * 0.07;
    u.uTint.value += (shared.tint - u.uTint.value) * 0.05;
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]} material={material}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
}

/** Re-kicks the render loop when the canvas scrolls back into view. */
function KeepAlive({ visible }: { visible: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (visible) invalidate();
  }, [visible, invalidate]);
  return null;
}

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Loads all textures once, outside the canvas, so the context is never remounted. */
function useTextures(srcs: string[], enabled: boolean) {
  const [textures, setTextures] = useState<THREE.Texture[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    const loader = new THREE.TextureLoader();
    let loaded: THREE.Texture[] = [];
    Promise.all(srcs.map((s) => loader.loadAsync(s)))
      .then((ts) => {
        if (!alive) {
          ts.forEach((t) => t.dispose());
          return;
        }
        for (const t of ts) {
          t.colorSpace = THREE.SRGBColorSpace;
          t.minFilter = THREE.LinearFilter;
          t.generateMipmaps = false;
          t.needsUpdate = true;
        }
        loaded = ts;
        setTextures(ts);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
      loaded.forEach((t) => t.dispose());
    };
  }, [srcs, enabled]);
  return { textures, failed };
}

export function LitImage({
  images,
  index,
  className,
  simple = false,
  priority = false,
  tint = 0,
}: {
  images: LitSource[];
  index: number;
  className?: string;
  /** Force the CSS crossfade (used on mobile). */
  simple?: boolean;
  priority?: boolean;
  /** 0 to 1: verdigris duotone at rest, resolving to colour under the lamp. */
  tint?: number;
}) {
  const reduced = useReducedMotion();
  const [gl, setGl] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(true);
  const box = useRef<HTMLDivElement>(null);
  const shared = useRef<Shared>({ pointer: { x: -10, y: -10, hover: 0 }, tint });
  shared.current.tint = tint;

  useEffect(() => setGl(supportsWebGL()), []);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "20%" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const wantCanvas = gl === true && !reduced && !simple;
  const srcs = useMemo(() => images.map((i) => i.src), [images]);
  const { textures, failed } = useTextures(srcs, wantCanvas);
  const useCanvas = wantCanvas && !failed && textures !== null;
  const safeIndex = Math.min(Math.max(0, index), images.length - 1);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const s = shared.current;
    s.pointer.x = (e.clientX - r.left) / r.width;
    s.pointer.y = 1 - (e.clientY - r.top) / r.height;
    s.pointer.hover = 1;
  };
  const onLeave = () => {
    shared.current.pointer.hover = 0;
  };

  return (
    <div
      ref={box}
      className={`relative overflow-hidden bg-raised ${className ?? ""}`}
      onPointerMove={useCanvas ? onMove : undefined}
      onPointerLeave={useCanvas ? onLeave : undefined}
      role="img"
      aria-label={images[safeIndex]?.alt}
    >
      {useCanvas && textures ? (
        <Canvas
          orthographic
          camera={{ position: [0, 0, 5], zoom: 1 }}
          dpr={[1, 1.5]}
          gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
          frameloop={visible ? "always" : "never"}
          className="!absolute inset-0"
          onCreated={(state) => {
            if (process.env.NODE_ENV !== "production") {
              const w = window as unknown as { __r3f?: unknown[] };
              (w.__r3f ??= []).push(state);
            }
          }}
        >
          <KeepAlive visible={visible} />
          <Plane textures={textures} index={safeIndex} shared={shared.current} />
        </Canvas>
      ) : (
        <div className={tint > 0 ? "duotone absolute inset-0" : "absolute inset-0"}>
          <Fallback images={images} index={safeIndex} priority={priority} />
        </div>
      )}
    </div>
  );
}

function Fallback({ images, index, priority }: { images: LitSource[]; index: number; priority: boolean }) {
  return (
    <>
      {images.map((img, i) => (

        <img
          key={img.src}
          src={img.src}
          alt={i === index ? img.alt : ""}
          loading={priority && i === index ? "eager" : "lazy"}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ opacity: i === index ? 1 : 0 }}
        />
      ))}
    </>
  );
}
