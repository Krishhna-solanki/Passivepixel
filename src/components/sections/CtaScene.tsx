"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { heroState, seeded } from "@/lib/heroState";

// voxel "P" (8 wide × 9 tall), two layers deep, with the logo's loose pixels
const BITMAP = [
  "XXXXXX..",
  "XX...XX.",
  "XX...XX.",
  "XX...XX.",
  "XXXXXX..",
  "XX......",
  "XX......",
  "..X.....",
  "X.......",
];
const LOOSE: [number, number, number][] = [
  [7.3, 2.6, 0.5],
  [8.3, 1.6, 0.2],
];
const SIZE = 0.5;
const STEP = 0.56;

/** written by the DOM section: scroll progress and a click counter */
export type CtaShared = { assemble: number; bursts: number };

type Voxel = { home: THREE.Vector3; from: THREE.Vector3; rot: THREE.Euler; delay: number; color: THREE.Color };

const _d = new THREE.Object3D();
const _v = new THREE.Vector3();

function Sculpture({ shared, reduced, narrow }: { shared: RefObject<CtaShared>; reduced: boolean; narrow: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const group = useRef<THREE.Group>(null!);
  const pops = useRef<Float32Array | null>(null);
  const burstRef = useRef(0);
  const seenBursts = useRef(0);
  const geometry = useMemo(() => new RoundedBoxGeometry(SIZE, SIZE, SIZE, 3, 0.07), []);

  const voxels = useMemo<Voxel[]>(() => {
    const r = seeded(31);
    const cells: [number, number, number][] = [];
    BITMAP.forEach((row, y) =>
      row.split("").forEach((c, x) => {
        if (c === "X") for (let z = 0; z < 2; z++) cells.push([x, y, z]);
      }),
    );
    cells.push(...LOOSE);
    const cx = 3.5;
    const cy = 4;
    const a = new THREE.Color("#D946EF");
    const b = new THREE.Color("#6200EA");
    return cells.map(([x, y, z]) => {
      const home = new THREE.Vector3((x - cx) * STEP, (cy - y) * STEP, (z - 0.5) * STEP);
      // scattered start: a loose shell around the sculpture
      const dir = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize();
      const from = dir.multiplyScalar(5 + r() * 5).add(new THREE.Vector3(0, -2, -3));
      return {
        home,
        from,
        rot: new THREE.Euler(r() * 6, r() * 6, r() * 6),
        delay: ((8 - y) / 8) * 0.35 + r() * 0.2, // assembles bottom-up
        color: a.clone().lerp(b, Math.min(1, Math.max(0, (y + x * 0.4) / 11))),
      };
    });
  }, []);

  useLayoutEffect(() => {
    voxels.forEach((v, i) => mesh.current.setColorAt(i, v.color));
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [voxels]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const s = shared.current;
    if (!s) return;
    const n = voxels.length;
    if (!pops.current || pops.current.length !== n) pops.current = new Float32Array(n);
    const P = pops.current;
    const px = reduced ? 0 : heroState.pointer.x;
    const py = reduced ? 0 : heroState.pointer.y;
    const assemble = reduced ? 1 : s.assemble;
    if (s.bursts !== seenBursts.current) {
      seenBursts.current = s.bursts;
      if (!reduced) burstRef.current = 1;
    }
    burstRef.current = THREE.MathUtils.damp(burstRef.current, 0, 2.2, dt);
    const burstNow = burstRef.current;

    const g = group.current;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, -0.5 + px * 0.55 + Math.sin(t * 0.3) * 0.12 * (reduced ? 0 : 1), 3, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0.12 - py * 0.3, 3, dt);
    g.position.y = Math.sin(t * 0.7) * 0.08 * (reduced ? 0 : 1);
    g.updateMatrixWorld();

    for (let i = 0; i < n; i++) {
      const v = voxels[i];
      const k = THREE.MathUtils.clamp((assemble * 1.5 - v.delay) / 0.9, 0, 1);
      const e = 1 - Math.pow(1 - k, 3);

      // pointer: voxels near the cursor (in screen space) pop out towards the viewer
      _v.copy(v.home).applyMatrix4(g.matrixWorld).project(state.camera);
      const dist = Math.hypot(_v.x - px, (_v.y - py) * 0.8);
      const target = reduced ? 0 : Math.max(0, 1 - dist / 0.28) * 0.9 * e;
      P[i] = THREE.MathUtils.damp(P[i], target, 7, dt);

      const burst = burstNow * (0.8 + (i % 5) * 0.15);
      _d.position.set(
        THREE.MathUtils.lerp(v.from.x, v.home.x, e) + v.home.x * burst,
        THREE.MathUtils.lerp(v.from.y, v.home.y, e) + v.home.y * burst,
        THREE.MathUtils.lerp(v.from.z, v.home.z, e) + P[i] + (v.home.z + 0.6) * burst * 2,
      );
      _d.rotation.set(v.rot.x * (1 - e) + burst, v.rot.y * (1 - e) + burst * 0.7, v.rot.z * (1 - e));
      _d.scale.setScalar(0.35 + 0.65 * e);
      _d.updateMatrix();
      mesh.current.setMatrixAt(i, _d.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group} position={narrow ? [0, 2.2, 0] : [4, 0, 0]} scale={narrow ? 0.55 : 0.85}>
      <instancedMesh ref={mesh} args={[geometry, undefined, voxels.length]} frustumCulled={false}>
        <meshPhysicalMaterial
          metalness={0.5}
          roughness={0.16}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={2}
          emissive="#2a0866"
          emissiveIntensity={0.25}
        />
      </instancedMesh>
    </group>
  );
}

/** A few small cubes drifting around for depth. */
function Drift({ reduced }: { reduced: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const geometry = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 2, 0.12), []);
  const items = useMemo(() => {
    const r = seeded(77);
    return Array.from({ length: 26 }, () => ({
      x: -9 + r() * 18,
      y: -5 + r() * 10,
      z: -8 + r() * 5,
      s: 0.08 + r() * 0.25,
      sp: 0.1 + r() * 0.25,
      ph: r() * 6,
    }));
  }, []);
  useFrame((state) => {
    const t = state.clock.elapsedTime * (reduced ? 0 : 1);
    items.forEach((it, i) => {
      const y = ((it.y + 5 + t * it.sp) % 10) - 5;
      _d.position.set(it.x, y, it.z);
      _d.rotation.set(t * 0.3 + it.ph, t * 0.2 + it.ph, 0);
      _d.scale.setScalar(it.s);
      _d.updateMatrix();
      mesh.current.setMatrixAt(i, _d.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, items.length]} frustumCulled={false}>
      <meshPhysicalMaterial color="#8B35F5" metalness={0.5} roughness={0.2} clearcoat={1} envMapIntensity={1.6} />
    </instancedMesh>
  );
}

export default function CtaScene({ shared, active }: { shared: RefObject<CtaShared>; active: boolean }) {
  const reduced = useReducedMotion() ?? false;
  const [narrow] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      resize={{ offsetSize: true }}
      dpr={narrow ? [1, 1.5] : [1, 1.75]}
      camera={{ position: [0, 0, 12], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      aria-hidden
    >
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 6, 6]} intensity={1.1} color="#f0e6ff" />
      <pointLight position={[-4, 2, 5]} intensity={18} color="#c34dff" distance={20} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={5} color="#D946EF" position={[-6, 2, 3]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={4} color="#6200EA" position={[6, -1, 3]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={2.5} color="#ffffff" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 1.2, 1]} />
      </Environment>
      <Sculpture shared={shared} reduced={reduced} narrow={narrow} />
      <Drift reduced={reduced} />
    </Canvas>
  );
}
