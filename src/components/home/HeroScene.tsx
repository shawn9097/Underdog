"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Ambient hero background — the old descent's debris field, reframed.
 * No ScrollTriggers, no shared page state: a slow idle drift driven by a
 * local clock. The discarded sink; gold embers rise. Pauses when the tab
 * is hidden or the hero scrolls out of view; renders one static frame
 * under prefers-reduced-motion.
 */

/** Deterministic PRNG (same recipe the descent used). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Shared {
  t: number;
  reduced: boolean;
}

function Rig({ shared }: { shared: Shared }) {
  const { camera } = useThree();
  useFrame((_, dt) => {
    if (shared.reduced) return;
    shared.t += Math.min(dt, 0.05);
    camera.position.x = Math.sin(shared.t * 0.12) * 0.4;
    camera.position.y = Math.cos(shared.t * 0.09) * 0.25;
  });
  return null;
}

interface DriftItem {
  x: number;
  y0: number;
  z: number;
  s: number;
  rx: number;
  ry: number;
  vr: number;
  wob: number;
  f: number;
}

interface DriftProps {
  shared: Shared;
  count: number;
  span: number;
  area: number;
  depth: [number, number];
  size: [number, number];
  /** world units per second the layer sinks. */
  fall: number;
  opacity: number;
  color: string;
  seed: number;
}

/** The discarded — dark shards sinking slowly past the mask. */
function DriftLayer({
  shared,
  count,
  span,
  area,
  depth,
  size,
  fall,
  opacity,
  color,
  seed,
}: DriftProps) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const { geom, mat, items } = useMemo(() => {
    const rnd = mulberry32(seed);
    const geom = new THREE.TetrahedronGeometry(1, 0);
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
    });
    const items: DriftItem[] = Array.from({ length: count }, () => ({
      x: (rnd() * 2 - 1) * area,
      y0: rnd() * span,
      z: depth[0] + rnd() * (depth[1] - depth[0]),
      s: size[0] + rnd() * (size[1] - size[0]),
      rx: rnd() * Math.PI * 2,
      ry: rnd() * Math.PI * 2,
      vr: (rnd() * 2 - 1) * 0.24,
      wob: rnd() * Math.PI * 2,
      f: 0.6 + rnd() * 0.8,
    }));
    return { geom, mat, items };
  }, [count, span, area, depth, size, opacity, color, seed]);

  useEffect(
    () => () => {
      geom.dispose();
      mat.dispose();
    },
    [geom, mat]
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = shared.t;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const cycled =
        ((((it.y0 - t * fall * it.f) % span) + span) % span) - span / 2;
      dummy.position.set(
        it.x + Math.sin(t * 0.3 + it.wob) * 0.45,
        cycled,
        it.z
      );
      dummy.rotation.set(it.rx + t * it.vr, it.ry + t * it.vr * 0.7, 0);
      dummy.scale.setScalar(it.s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[geom, mat, count]} frustumCulled={false} />
  );
}

/** The gilded — gold embers rising out of the bottom of the frame. */
function Embers({ shared, count }: { shared: Shared; count: number }) {
  const ref = useRef<THREE.Points>(null);
  const { geo, mat, speeds, positions } = useMemo(() => {
    const rnd = mulberry32(431);
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rnd() * 2 - 1) * 13;
      positions[i * 3 + 1] = (rnd() * 2 - 1) * 9;
      positions[i * 3 + 2] = -2 - rnd() * 12;
      speeds[i] = 0.12 + rnd() * 0.42;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: "#f5c84c",
      size: 0.085,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    return { geo, mat, speeds, positions };
  }, [count]);

  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat]
  );

  useFrame((_, dt) => {
    const pts = ref.current;
    if (!pts || shared.reduced) return;
    const step = Math.min(dt, 0.05);
    for (let i = 0; i < count; i++) {
      let y = positions[i * 3 + 1] + speeds[i] * step;
      if (y > 9) y = -9;
      positions[i * 3 + 1] = y;
      positions[i * 3] += Math.sin(shared.t * 0.6 + i) * step * 0.05;
    }
    geo.attributes.position.needsUpdate = true;
  });

  return <points ref={ref} args={[geo, mat]} frustumCulled={false} />;
}

type Frameloop = "always" | "demand" | "never";

export default function HeroScene() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const inViewRef = useRef(true);

  const shared = useMemo<Shared>(
    () => ({
      t: 0,
      reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    }),
    []
  );
  const mobile = useMemo(() => window.innerWidth < 768, []);
  const active: Frameloop = shared.reduced ? "demand" : "always";
  const [frameloop, setFrameloop] = useState<Frameloop>(active);

  useEffect(() => {
    const update = () =>
      setFrameloop(document.hidden || !inViewRef.current ? "never" : active);
    const io = new IntersectionObserver(
      (entries) => {
        inViewRef.current = entries[0]?.isIntersecting ?? true;
        update();
      },
      { rootMargin: "120px" }
    );
    if (wrapRef.current) io.observe(wrapRef.current);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [active]);

  return (
    <div ref={wrapRef} className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        frameloop={frameloop}
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <Rig shared={shared} />
        <DriftLayer
          shared={shared}
          count={mobile ? 44 : 110}
          span={26}
          area={11}
          depth={[-3, -8]}
          size={[0.09, 0.34]}
          fall={0.34}
          opacity={0.6}
          color="#39323f"
          seed={101}
        />
        <DriftLayer
          shared={shared}
          count={mobile ? 34 : 90}
          span={36}
          area={19}
          depth={[-9, -18]}
          size={[0.12, 0.46]}
          fall={0.2}
          opacity={0.34}
          color="#2a2531"
          seed={211}
        />
        {/* a few gilded shards among the discarded */}
        <DriftLayer
          shared={shared}
          count={mobile ? 8 : 16}
          span={30}
          area={12}
          depth={[-4, -10]}
          size={[0.05, 0.14]}
          fall={0.26}
          opacity={0.5}
          color="#8a6a1f"
          seed={731}
        />
        <Embers shared={shared} count={mobile ? 80 : 160} />
      </Canvas>
    </div>
  );
}
