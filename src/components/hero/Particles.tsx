"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { heroState, seeded } from "@/lib/heroState";

function dotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.6)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Fine glowing dust that rises through the scene and streaks with scroll. */
export function Particles({ count, reduced }: { count: number; reduced: boolean }) {
  const points = useRef<THREE.Points>(null!);
  const vel = useRef(0);
  const map = useMemo(() => dotTexture(), []);

  const { positions, speeds } = useMemo(() => {
    const r = seeded(23);
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = -14 + r() * 28;
      positions[i * 3 + 1] = -9 + r() * 18;
      positions[i * 3 + 2] = -10 + r() * 14;
      speeds[i] = 0.1 + r() * 0.35;
    }
    return { positions, speeds };
  }, [count]);

  useFrame((_, delta) => {
    if (reduced) return;
    const dt = Math.min(delta, 0.05);
    vel.current = THREE.MathUtils.damp(vel.current, heroState.velocity, 6, dt);
    const boost = 1 + Math.min(Math.abs(vel.current) * 0.08, 6);
    const dir = vel.current < -2 ? -1 : 1;
    const attr = points.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * dt * boost * dir;
      if (arr[i * 3 + 1] > 9) arr[i * 3 + 1] = -9;
      else if (arr[i * 3 + 1] < -9) arr[i * 3 + 1] = 9;
    }
    attr.needsUpdate = true;
    const pt = points.current;
    pt.rotation.y = THREE.MathUtils.damp(pt.rotation.y, heroState.pointer.x * 0.08, 3, dt);
    pt.rotation.x = THREE.MathUtils.damp(pt.rotation.x, -heroState.pointer.y * 0.05, 3, dt);
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={map}
        size={0.06}
        sizeAttenuation
        transparent
        depthWrite={false}
        opacity={0.75}
        color="#d9a6ff"
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
