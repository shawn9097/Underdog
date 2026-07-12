"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import type { DescentState } from "./state";
import { mulberry32 } from "./state";

/**
 * The single WebGL canvas behind the whole page.
 * - THE FALL: two parallax layers of discarded debris tumbling upward past
 *   the camera, plus velocity-reactive speed lines.
 * - After IMPACT: the debris becomes a field of gold embers rising through
 *   Underdog City and the throne.
 * Everything is driven by the shared DescentState mutated by ScrollTrigger.
 */

interface Shared {
  t: number;
  vel: number;
  reduced: boolean;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Global fade for the debris field: in during the fall, out at impact. */
function debrisFade(state: DescentState) {
  return (
    clamp01((state.fall - 0.005) * 14) *
    (1 - clamp01((state.impact - 0.18) * 4.5))
  );
}

function Rig({ state, shared }: { state: DescentState; shared: Shared }) {
  const { camera } = useThree();
  useFrame((_, dt) => {
    if (!shared.reduced) shared.t += dt;
    shared.vel += (state.vel - shared.vel) * 0.09;
    state.vel *= 0.92; // decay between scroll events
    const falling = state.fall > 0.01 && state.impact < 0.2 ? 1 : 0;
    const amp = shared.reduced ? 0 : shared.vel * 0.22 * falling;
    camera.position.x = Math.sin(shared.t * 7.3) * amp;
    camera.position.y = Math.cos(shared.t * 9.1) * amp * 0.7;
  });
  return null;
}

interface DebrisProps {
  state: DescentState;
  shared: Shared;
  count: number;
  span: number;
  area: number;
  depth: [number, number];
  size: [number, number];
  speed: number;
  baseOpacity: number;
  seed: number;
}

function DebrisLayer({
  state,
  shared,
  count,
  span,
  area,
  depth,
  size,
  speed,
  baseOpacity,
  seed,
}: DebrisProps) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const { geom, mat, items } = useMemo(() => {
    const rnd = mulberry32(seed);
    const geom = new THREE.TetrahedronGeometry(1, 0);
    const mat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const items = Array.from({ length: count }, () => ({
      x: (rnd() * 2 - 1) * area,
      y0: rnd() * span,
      z: depth[0] + rnd() * (depth[1] - depth[0]),
      s: size[0] + rnd() * (size[1] - size[0]),
      rx: rnd() * Math.PI * 2,
      ry: rnd() * Math.PI * 2,
      vr: (rnd() * 2 - 1) * 1.3,
      wob: rnd() * Math.PI * 2,
      f: 0.7 + rnd() * 0.6,
    }));
    return { geom, mat, items };
  }, [count, span, area, depth, size, seed]);

  useEffect(() => () => {
    geom.dispose();
    mat.dispose();
  }, [geom, mat]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colA = useMemo(() => new THREE.Color("#241f2b"), []);
  const colB = useMemo(() => new THREE.Color("#cdd5de"), []);

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const target = debrisFade(state) * baseOpacity;
    mat.opacity += (target - mat.opacity) * 0.1;
    mesh.visible = mat.opacity > 0.012;
    if (!mesh.visible) return;
    mat.color.lerpColors(colA, colB, clamp01((state.fall - 0.04) * 4));
    const rise = state.fall * speed * span;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const y = ((((it.y0 + rise * it.f) % span) + span) % span) - span / 2;
      dummy.position.set(
        it.x + Math.sin(shared.t * 0.4 + it.wob) * 0.35,
        y,
        it.z
      );
      dummy.rotation.set(
        it.rx + shared.t * it.vr,
        it.ry + shared.t * it.vr * 0.7,
        0
      );
      dummy.scale.setScalar(it.s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geom, mat, count]} frustumCulled={false} />;
}

function SpeedLines({
  state,
  shared,
  count,
}: {
  state: DescentState;
  shared: Shared;
  count: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const span = 26;
  const { geom, mat, items } = useMemo(() => {
    const rnd = mulberry32(907);
    const geom = new THREE.BoxGeometry(0.016, 1, 0.016);
    const mat = new THREE.MeshBasicMaterial({
      color: "#dfe6ee",
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const items = Array.from({ length: count }, () => ({
      x: (rnd() * 2 - 1) * 10,
      y0: rnd() * span,
      z: -3 - rnd() * 7,
      len: 2 + rnd() * 3.4,
      f: 1.4 + rnd() * 1.2,
    }));
    return { geom, mat, items };
  }, [count]);

  useEffect(() => () => {
    geom.dispose();
    mat.dispose();
  }, [geom, mat]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const target = debrisFade(state) * shared.vel * 0.55;
    mat.opacity += (target - mat.opacity) * 0.16;
    mesh.visible = mat.opacity > 0.01;
    if (!mesh.visible) return;
    const rise = state.fall * 2.4 * span;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const y = ((((it.y0 + rise * it.f) % span) + span) % span) - span / 2;
      dummy.position.set(it.x, y, it.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, it.len * (0.6 + shared.vel * 1.2), 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geom, mat, count]} frustumCulled={false} />;
}

function Embers({
  state,
  shared,
  count,
}: {
  state: DescentState;
  shared: Shared;
  count: number;
}) {
  const ref = useRef<THREE.Points>(null);
  const { geo, mat, speeds, positions } = useMemo(() => {
    const rnd = mulberry32(431);
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rnd() * 2 - 1) * 13;
      positions[i * 3 + 1] = (rnd() * 2 - 1) * 9;
      positions[i * 3 + 2] = -2 - rnd() * 12;
      speeds[i] = 0.15 + rnd() * 0.5;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: "#f5c84c",
      size: 0.085,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    return { geo, mat, speeds, positions };
  }, [count]);

  useEffect(() => () => {
    geo.dispose();
    mat.dispose();
  }, [geo, mat]);

  useFrame((_, dt) => {
    const pts = ref.current;
    if (!pts) return;
    const target = clamp01((state.impact - 0.42) * 3.2) * 0.8;
    mat.opacity += (target - mat.opacity) * 0.06;
    pts.visible = mat.opacity > 0.01;
    if (!pts.visible || shared.reduced) return;
    for (let i = 0; i < count; i++) {
      let y = positions[i * 3 + 1] + speeds[i] * dt;
      if (y > 9) y = -9;
      positions[i * 3 + 1] = y;
      positions[i * 3] += Math.sin(shared.t * 0.6 + i) * dt * 0.06;
    }
    geo.attributes.position.needsUpdate = true;
  });

  return <points ref={ref} args={[geo, mat]} frustumCulled={false} />;
}

export default function FallScene({ state }: { state: DescentState }) {
  const [frameloop, setFrameloop] = useState<"always" | "never">("always");

  useEffect(() => {
    const onVis = () => setFrameloop(document.hidden ? "never" : "always");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const mobile = useMemo(
    () => typeof window !== "undefined" && window.innerWidth < 768,
    []
  );
  const shared = useMemo<Shared>(
    () => ({
      t: 0,
      vel: 0,
      reduced:
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    }),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[1]" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        frameloop={frameloop}
        camera={{ position: [0, 0, 10], fov: 62 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <Rig state={state} shared={shared} />
        <DebrisLayer
          state={state}
          shared={shared}
          count={mobile ? 70 : 180}
          span={30}
          area={11}
          depth={[-3, -8]}
          size={[0.09, 0.4]}
          speed={2.2}
          baseOpacity={0.95}
          seed={101}
        />
        <DebrisLayer
          state={state}
          shared={shared}
          count={mobile ? 55 : 150}
          span={40}
          area={20}
          depth={[-9, -18]}
          size={[0.12, 0.52]}
          speed={1.2}
          baseOpacity={0.5}
          seed={211}
        />
        <SpeedLines state={state} shared={shared} count={mobile ? 16 : 34} />
        <Embers state={state} shared={shared} count={mobile ? 110 : 230} />
      </Canvas>
    </div>
  );
}
