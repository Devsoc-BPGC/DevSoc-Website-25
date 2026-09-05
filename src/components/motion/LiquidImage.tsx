"use client";

/**
 * LiquidImage
 * A three.js plane that shows one of several images and melts between
 * them. The crossfade displaces both images with flowing noise that peaks
 * mid-transition, and pointer movement drops ripples that refract the
 * picture for a moment. The "liquid cursor reactive image swap".
 *
 * <LiquidImage images={[{src, alt}, ...]} index={active} className="aspect-[4/5]" />
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

export type LiquidSource = { src: string; alt: string };

const MAX_RIPPLES = 8;

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
uniform float uTime;
uniform vec2 uPointer;
uniform float uHover;
uniform float uTint;
uniform vec3 uTintColor;
uniform vec4 uRipples[${MAX_RIPPLES}];

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
vec2 cover(vec2 uv, float planeAspect, float texAspect) {
  vec2 s = planeAspect > texAspect ? vec2(1.0, texAspect / planeAspect) : vec2(planeAspect / texAspect, 1.0);
  return (uv - 0.5) * s + 0.5;
}
void main() {
  vec2 uv = vUv;
  vec2 disp = vec2(0.0);
  for (int i = 0; i < ${MAX_RIPPLES}; i++) {
    vec4 rp = uRipples[i];
    float age = uTime - rp.z;
    if (rp.w <= 0.0 || age < 0.0 || age > 2.4) continue;
    vec2 d = uv - rp.xy;
    d.x *= uPlaneAspect;
    float dist = length(d);
    float wave = sin(dist * 34.0 - age * 7.0) * exp(-age * 1.6) * exp(-dist * 6.0);
    disp += normalize(d + 1e-5) * wave * 0.018 * rp.w;
  }
  vec2 toP = uv - uPointer;
  toP.x *= uPlaneAspect;
  float pd = length(toP);
  disp += normalize(toP + 1e-5) * exp(-pd * 5.0) * 0.012 * uHover;

  float k = uProgress * (1.0 - uProgress) * 4.0;
  float n = noise(uv * 3.0 + uTime * 0.15) - 0.5;
  float n2 = noise(uv * 5.0 - uTime * 0.1 + 7.3) - 0.5;
  vec2 flow = vec2(n, n2) * 0.16 * k;

  vec2 uvA = cover(uv + disp + flow, uPlaneAspect, uAspectA);
  vec2 uvB = cover(uv + disp - flow, uPlaneAspect, uAspectB);
  vec4 a = texture2D(uTexA, uvA);
  vec4 b = texture2D(uTexB, uvB);
  float m = smoothstep(0.0, 1.0, uProgress);
  // noisy threshold that still reaches exactly 0 at the start and 1 at the end
  float thr = noise(uv * 2.5 + 3.1);
  float edge = smoothstep(0.0, 1.0, clamp((m - thr * 0.4) / 0.6, 0.0, 1.0));
  vec4 col = mix(a, b, mix(m, edge, 0.6));
  // optional duotone: grade to the verdigris shadows, resolve to colour under the pointer
  float l = dot(col.rgb, vec3(0.299, 0.587, 0.114));
  vec3 graded = mix(vec3(l * 0.85), uTintColor * (0.3 + l * 1.4), 0.7);
  col.rgb = mix(col.rgb, graded, uTint);
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
  uTime: { value: number };
  uPointer: { value: THREE.Vector2 };
  uHover: { value: number };
  uTint: { value: number };
  uTintColor: { value: THREE.Color };
  uRipples: { value: THREE.Vector4[] };
};

function aspectOf(t: THREE.Texture) {
  const img = t.image as { width?: number; height?: number } | undefined;
  return img?.width && img?.height ? img.width / img.height : 1;
}

type Shared = {
  pointer: { x: number; y: number; hover: number };
  ripples: THREE.Vector4[];
  clock: { t: number };
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
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(-10, -10) },
      uHover: { value: 0 },
      uTint: { value: shared.tint },
      uTintColor: { value: new THREE.Color("#2f6b68") },
      uRipples: { value: shared.ripples },
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
    gsap.to(u.uProgress, { value: 1, duration: 1.4, ease: "power2.inOut" });
  }, [index, textures, u]);

  useFrame((_, delta) => {
    shared.clock.t += delta;
    u.uTime.value = shared.clock.t;
    u.uPlaneAspect.value = viewport.width / viewport.height;
    u.uPointer.value.set(shared.pointer.x, shared.pointer.y);
    u.uHover.value += (shared.pointer.hover - u.uHover.value) * 0.08;
    const tintTarget = shared.tint * (1 - shared.pointer.hover);
    u.uTint.value += (tintTarget - u.uTint.value) * 0.05;
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

export function LiquidImage({
  images,
  index,
  className,
  simple = false,
  priority = false,
  tint = 0,
}: {
  images: LiquidSource[];
  index: number;
  className?: string;
  /** Force the CSS crossfade (used on mobile). */
  simple?: boolean;
  priority?: boolean;
  /** 0 to 1: verdigris duotone at rest, resolving to colour under the pointer. */
  tint?: number;
}) {
  const reduced = useReducedMotion();
  const [gl, setGl] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(true);
  const box = useRef<HTMLDivElement>(null);
  const shared = useRef<Shared>({
    pointer: { x: -10, y: -10, hover: 0 },
    ripples: Array.from({ length: MAX_RIPPLES }, () => new THREE.Vector4(0, 0, -100, 0)),
    clock: { t: 0 },
    tint,
  });
  shared.current.tint = tint;
  const rippleCursor = useRef(0);
  const last = useRef<{ x: number; y: number; t: number } | null>(null);

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
    const x = (e.clientX - r.left) / r.width;
    const y = 1 - (e.clientY - r.top) / r.height;
    const s = shared.current;
    s.pointer.x = x;
    s.pointer.y = y;
    s.pointer.hover = 1;
    const now = s.clock.t;
    const l = last.current;
    if (l) {
      const v = Math.hypot(x - l.x, y - l.y) / Math.max(0.016, now - l.t);
      if (v > 0.35 && now - l.t > 0.05) {
        const rp = s.ripples[rippleCursor.current % MAX_RIPPLES];
        rp.set(x, y, now, Math.min(1, v * 0.25));
        rippleCursor.current += 1;
        last.current = { x, y, t: now };
      }
    } else last.current = { x, y, t: now };
  };
  const onLeave = () => {
    shared.current.pointer.hover = 0;
    last.current = null;
  };

  return (
    <div
      ref={box}
      className={`relative overflow-hidden bg-soot ${className ?? ""}`}
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

function Fallback({ images, index, priority }: { images: LiquidSource[]; index: number; priority: boolean }) {
  return (
    <>
      {images.map((img, i) => (
        // eslint-disable-next-line @next/next/no-img-element
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
