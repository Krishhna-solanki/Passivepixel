"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { heroState } from "@/lib/heroState";

/*
 * The Passive Pixel mark in 3D (icon grid: 260 × 280 units). Body + arrow are
 * extruded; the pixel squares become real cubes that float loose around it.
 */
// stem + bowl as ONE outline (with the counter as a hole) so there is no seam
const BODY = [
  "M0 40H38V0H140A60 60 0 0 1 200 60V100A60 60 0 0 1 140 160H40V200H0Z" +
    "M40 40V120H140A20 20 0 0 0 160 100V60A20 20 0 0 0 140 40Z",
];
const ARROW = "M24.3 164.3L116.9 71.8L108.4 63.3L148 52L136.7 91.6L128.2 83.1L35.7 175.7Z";
const PIXELS: { x: number; y: number; size: number }[] = [
  { x: 60, y: 220, size: 40 },
  { x: 20, y: 260, size: 40 },
  { x: 224, y: 124, size: 24 },
  { x: 252, y: 96, size: 16 },
];

const UNIT = 0.0165;
const CX = 110;
const CY = 140;
const DEPTH = 46;

function extrude(paths: string[], depth: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"><g transform="scale(1,-1)">${paths
    .map((d) => `<path d="${d}"/>`)
    .join("")}</g></svg>`;
  const shapes = new SVGLoader().parse(svg).paths.flatMap((p) => SVGLoader.createShapes(p));
  const geo = new THREE.ExtrudeGeometry(shapes, {
    depth,
    bevelEnabled: true,
    bevelThickness: 5,
    bevelSize: 3.5,
    bevelSegments: 6,
    curveSegments: 48,
  });
  geo.translate(-CX, CY, -depth / 2);
  geo.scale(UNIT, UNIT, UNIT);
  geo.computeVertexNormals();
  return geo;
}

const easeOutBack = (x: number) => {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

export function PSculpture({ reduced }: { reduced: boolean }) {
  const root = useRef<THREE.Group>(null!);
  const spin = useRef<THREE.Group>(null!);
  const arrowMat = useRef<THREE.MeshPhysicalMaterial>(null!);
  const pixelRefs = useRef<(THREE.Mesh | null)[]>([]);
  const kick = useRef(0); // rotation impulse from taps
  const lastPulse = useRef(0);
  const vel = useRef(0);
  const { size } = useThree();

  const body = useMemo(() => extrude(BODY, DEPTH), []);
  const arrow = useMemo(() => extrude([ARROW], DEPTH + 26), []);

  // Layout is based on the visible area at the camera's RESTING distance (10),
  // not the live camera (which starts far away during the intro fly-in).
  const viewH = 2 * 10 * Math.tan(THREE.MathUtils.degToRad(20));
  const viewport = { width: viewH * (size.width / Math.max(1, size.height)), height: viewH };
  const narrow = size.width < 768;
  const baseScale = narrow ? Math.min(0.44, viewport.width / 8.5) : Math.min(0.78, viewport.width / 15.5);
  const baseX = narrow ? 0.1 : viewport.width * 0.28;
  const baseY = narrow ? viewport.height * 0.27 : 0.05;

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const m = reduced ? 0 : 1;
    const p = heroState.progress;
    const px = reduced ? 0 : heroState.pointer.x;
    const py = reduced ? 0 : heroState.pointer.y;

    // intro: rises, scales up with a slight overshoot, unwinds a spin
    const ik = THREE.MathUtils.clamp((heroState.intro - 0.12) / 0.88, 0, 1);
    const ie = ik === 0 ? 0 : easeOutBack(ik);
    root.current.scale.setScalar(Math.max(0.0001, baseScale * ie));

    // tap → spin impulse
    const pulses = heroState.pulses;
    const latest = pulses.length ? pulses[pulses.length - 1].t : 0;
    if (!reduced && latest > lastPulse.current) {
      lastPulse.current = latest;
      kick.current += 0.9 * (heroState.pointer.x >= 0 ? 1 : -1);
    }
    kick.current = THREE.MathUtils.damp(kick.current, 0, 2.2, dt);
    vel.current = THREE.MathUtils.damp(vel.current, reduced ? 0 : heroState.velocity, 5, dt);
    const v = THREE.MathUtils.clamp(vel.current, -60, 60);

    root.current.position.set(
      baseX,
      baseY + Math.sin(t * 0.8) * 0.08 * m + p * 1.6 - (1 - ik) * 1.5,
      -p * 2,
    );

    const s = spin.current;
    s.rotation.y = THREE.MathUtils.damp(
      s.rotation.y,
      -0.38 + Math.sin(t * 0.35) * 0.18 * m + px * 0.4 + p * 1.4 + kick.current + v * 0.012 - (1 - ik) * 2.4,
      3,
      dt,
    );
    s.rotation.x = THREE.MathUtils.damp(s.rotation.x, 0.06 - py * 0.25 + p * 0.3 + v * 0.006, 3, dt);
    s.rotation.z = THREE.MathUtils.damp(s.rotation.z, -px * 0.06, 3, dt);

    // arrow breathes, flares on taps / fast scrolls
    if (arrowMat.current)
      arrowMat.current.emissiveIntensity =
        0.55 + Math.sin(t * 1.6) * 0.2 * m + Math.abs(kick.current) * 0.6 + Math.abs(v) * 0.01;

    pixelRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const px0 = PIXELS[i];
      const ox = (px0.x - CX) * UNIT;
      const oy = (CY - px0.y) * UNIT;
      const drift = 0.06 + i * 0.03 + Math.abs(kick.current) * 0.15;
      mesh.position.set(
        ox + Math.sin(t * 0.9 + i) * drift * m,
        oy + Math.cos(t * 0.7 + i * 1.7) * drift * m,
        Math.sin(t * 0.5 + i * 2) * 0.25 * m,
      );
      mesh.rotation.set(t * 0.2 * m * (i % 2 ? 1 : -1) + kick.current, t * 0.3 * m, 0);
    });
  });

  return (
    <group ref={root} scale={0.0001}>
      <group ref={spin}>
        <mesh geometry={body}>
          <meshPhysicalMaterial
            color="#a24bff"
            metalness={0.6}
            roughness={0.16}
            clearcoat={1}
            clearcoatRoughness={0.08}
            envMapIntensity={1.8}
            emissive="#3d0a80"
            emissiveIntensity={0.35}
          />
        </mesh>
        <mesh geometry={arrow}>
          <meshPhysicalMaterial
            ref={arrowMat}
            color="#e9a8ff"
            metalness={0.4}
            roughness={0.12}
            clearcoat={1}
            envMapIntensity={1.8}
            emissive="#d946ef"
            emissiveIntensity={0.55}
          />
        </mesh>
        {PIXELS.map((p, i) => (
          <RoundedBox
            key={i}
            ref={(el: THREE.Mesh | null) => {
              pixelRefs.current[i] = el;
            }}
            args={[p.size * UNIT, p.size * UNIT, p.size * UNIT]}
            radius={p.size * UNIT * 0.12}
            smoothness={3}
          >
            <meshPhysicalMaterial
              color={i < 2 ? "#8b35f5" : "#c34dff"}
              metalness={0.6}
              roughness={0.15}
              clearcoat={1}
              envMapIntensity={1.6}
              emissive="#3b0a8a"
              emissiveIntensity={0.3}
            />
          </RoundedBox>
        ))}
      </group>
    </group>
  );
}
