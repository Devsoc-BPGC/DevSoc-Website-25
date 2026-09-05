"use client";

/**
 * PointField
 * Six thousand points that gather from a scattered cloud into the silhouette
 * of an image (the DevSoc mark), then drift very slowly and part around the
 * pointer. Runs on the GPU: the vertex shader owns the motion, the CPU only
 * updates a handful of uniforms per frame.
 *
 * <PointField image="/images/brand/mark.png" className="absolute inset-0" />
 *
 * Reduced motion or mobile: points sit at their targets, no drift.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { useIsMobile, useReducedMotion } from "@/lib/useMedia";

const vertex = /* glsl */ `
attribute vec3 aTarget;
attribute vec3 aScatter;
attribute float aSeed;
uniform float uProgress;
uniform float uTime;
uniform vec2 uPointer;
uniform float uRepel;
uniform float uPixelRatio;
uniform float uSize;
uniform float uStill;
varying float vAlpha;
varying float vAccent;
float ease(float t) { return 1.0 - pow(1.0 - t, 3.0); }
void main() {
  float d = aSeed * 0.55;
  float t = ease(clamp((uProgress - d) / (1.0 - d), 0.0, 1.0));
  vec3 p = mix(aScatter, aTarget, t);
  float drift = (1.0 - uStill) * 0.9;
  p.x += sin(uTime * 0.32 + aSeed * 6.2831) * 0.006 * drift;
  p.y += cos(uTime * 0.27 + aSeed * 12.0) * 0.006 * drift;
  vec2 toP = p.xy - uPointer;
  float dist = length(toP);
  float f = smoothstep(uRepel, 0.0, dist) * (1.0 - uStill);
  p.xy += normalize(toP + 1e-4) * f * uRepel * 0.55;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPixelRatio;
  vAlpha = 0.4 + 0.55 * t;
  vAccent = step(0.92, fract(aSeed * 7.0));
}`;

const fragment = /* glsl */ `
precision highp float;
uniform vec3 uColor;
uniform vec3 uAccent;
varying float vAlpha;
varying float vAccent;
void main() {
  float r = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.25, r) * vAlpha;
  if (a < 0.01) discard;
  gl_FragColor = vec4(mix(uColor, uAccent, vAccent), a);
}`;

type Shared = { pointer: THREE.Vector2; time: number };

function Points({
  samples,
  aspect,
  scale,
  count,
  still,
  shared,
  color,
  accent,
  size,
}: {
  samples: Float32Array;
  aspect: number;
  scale: number;
  count: number;
  still: boolean;
  shared: Shared;
  color: string;
  accent: string;
  size: number;
}) {
  const { viewport } = useThree();
  const geom = useRef<THREE.BufferGeometry>(null);

  const H = viewport.height * scale;
  const W = H * aspect;

  const attrs = useMemo(() => {
    const n = Math.min(count, samples.length / 2);
    const target = new Float32Array(n * 3);
    const scatter = new Float32Array(n * 3);
    const seed = new Float32Array(n);
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const sx = samples[i * 2];
      const sy = samples[i * 2 + 1];
      target[i * 3] = (sx - 0.5) * W;
      target[i * 3 + 1] = (0.5 - sy) * H;
      target[i * 3 + 2] = 0;
      const a = Math.random() * Math.PI * 2;
      const r = (0.6 + Math.random() * 0.9) * viewport.height * 0.7;
      scatter[i * 3] = Math.cos(a) * r;
      scatter[i * 3 + 1] = Math.sin(a) * r;
      scatter[i * 3 + 2] = 0;
      seed[i] = Math.random();
    }
    return { target, scatter, seed, pos, n };
  }, [samples, W, H, count, viewport.height]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uProgress: { value: 0 },
          uTime: { value: 0 },
          uPointer: { value: new THREE.Vector2(999, 999) },
          uRepel: { value: viewport.height * 0.14 },
          uPixelRatio: { value: 1 },
          uSize: { value: size },
          uStill: { value: still ? 1 : 0 },
          uColor: { value: new THREE.Color(color) },
          uAccent: { value: new THREE.Color(accent) },
        },
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const uniforms = material.uniforms as {
    uProgress: { value: number };
    uTime: { value: number };
    uPointer: { value: THREE.Vector2 };
    uRepel: { value: number };
    uPixelRatio: { value: number };
    uSize: { value: number };
    uStill: { value: number };
  };

  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    uniforms.uStill.value = still ? 1 : 0;
    if (still) {
      uniforms.uProgress.value = 1;
      return;
    }
    const tween = gsap.fromTo(uniforms.uProgress, { value: 0 }, { value: 1, duration: 2.6, ease: "power2.out", delay: 0.2 });
    return () => {
      tween.kill();
    };
  }, [still, uniforms]);

  useFrame((state, delta) => {
    shared.time += delta;
    uniforms.uTime.value = shared.time;
    uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    uniforms.uRepel.value = viewport.height * 0.14;
    uniforms.uPointer.value.copy(shared.pointer);
  });

  return (
    <points frustumCulled={false} material={material}>
      <bufferGeometry ref={geom}>
        <bufferAttribute attach="attributes-position" args={[attrs.pos, 3]} />
        <bufferAttribute attach="attributes-aTarget" args={[attrs.target, 3]} />
        <bufferAttribute attach="attributes-aScatter" args={[attrs.scatter, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[attrs.seed, 1]} />
      </bufferGeometry>
    </points>
  );
}

function PointerBridge({ shared }: { shared: Shared }) {
  const { viewport, gl } = useThree();
  useEffect(() => {
    const el = gl.domElement.parentElement ?? gl.domElement;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      shared.pointer.set(
        ((e.clientX - r.left) / r.width - 0.5) * viewport.width,
        (0.5 - (e.clientY - r.top) / r.height) * viewport.height,
      );
    };
    const leave = () => shared.pointer.set(999, 999);
    // Listen on the window so the field reacts even under other layers.
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerleave", leave);
    };
  }, [gl, viewport.width, viewport.height, shared]);
  return null;
}

/** Re-kicks the render loop when the canvas scrolls back into view. */
function KeepAlive({ visible }: { visible: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (visible) invalidate();
  }, [visible, invalidate]);
  return null;
}

/** Samples opaque pixels of an image into normalized (x, y) pairs. */
function useImageSamples(src: string, maxPoints: number) {
  const [data, setData] = useState<{ samples: Float32Array; aspect: number } | null>(null);
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      const w = 220;
      const h = Math.round((img.height / img.width) * w);
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, w, h);
      const px = ctx.getImageData(0, 0, w, h).data;
      const hits: number[] = [];
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) if (px[(y * w + x) * 4 + 3] > 110) hits.push(x, y);
      const n = Math.min(maxPoints, hits.length / 2);
      const out = new Float32Array(n * 2);
      for (let i = 0; i < n; i++) {
        const j = Math.floor(Math.random() * (hits.length / 2));
        // jitter inside the pixel so the field does not read as a grid
        out[i * 2] = (hits[j * 2] + Math.random()) / w;
        out[i * 2 + 1] = (hits[j * 2 + 1] + Math.random()) / h;
      }
      setData({ samples: out, aspect: w / h });
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src, maxPoints]);
  return data;
}

export function PointField({
  image,
  className,
  count = 9000,
  scale = 0.62,
  color = "#efe8d8",
  accent = "#79c7bb",
  size = 2.4,
  opacity = 0.7,
}: {
  image: string;
  className?: string;
  count?: number;
  /** Height of the mark as a share of the canvas height. */
  scale?: number;
  color?: string;
  accent?: string;
  size?: number;
  opacity?: number;
}) {
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const still = reduced || mobile;
  const data = useImageSamples(image, count);
  const shared = useRef<Shared>({ pointer: new THREE.Vector2(999, 999), time: 0 });
  const [visible, setVisible] = useState(true);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={box} className={className} style={{ opacity }} aria-hidden="true">
      {data ? (
        <Canvas
          orthographic
          camera={{ position: [0, 0, 5], zoom: 1 }}
          dpr={[1, 1.5]}
          gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
          frameloop={still ? "demand" : visible ? "always" : "never"}
          onCreated={(state) => {
            if (process.env.NODE_ENV !== "production") {
              const w = window as unknown as { __r3f?: unknown[] };
              (w.__r3f ??= []).push(state);
            }
          }}
        >
          <KeepAlive visible={visible} />
          <Points
            samples={data.samples}
            aspect={data.aspect}
            scale={scale}
            count={count}
            still={still}
            shared={shared.current}
            color={color}
            accent={accent}
            size={size}
          />
          {!still ? <PointerBridge shared={shared.current} /> : null}
        </Canvas>
      ) : null}
    </div>
  );
}
