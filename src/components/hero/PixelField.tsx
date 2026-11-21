"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { heroState, inputStrength, nowSec, seeded } from "@/lib/heroState";

const PALETTE = ["#C34DFF", "#8B35F5", "#A020F0", "#6200EA", "#D946EF", "#7B3CFF"];
const SPAN_Y = 22; // vertical wrap range (local units)

// interaction tuning
const PUSH_RADIUS = 3.4; // world units around the pointer ray
const PUSH_FORCE = 1.9;
const PULSE_LIFE = 2.4; // seconds
const PULSE_SPEED = 8; // world units / s
const PULSE_WIDTH = 1.8;
const PULSE_FORCE = 2.8;

type Cube = { x: number; y: number; z: number; s: number; speed: number; wobble: number; phase: number };

// scratch objects (module level: allocated once, never part of React state)
const _w = new THREE.Vector3();
const _d = new THREE.Vector3();
const _push = new THREE.Vector3();
const _ray = new THREE.Vector3();
const _invQ = new THREE.Quaternion();
const _dummy = new THREE.Object3D();
const _pulseRays = Array.from({ length: 6 }, () => ({ dir: new THREE.Vector3(), r: 0, a: 0 }));

/** distance from point _w to the ray (camera → dir); leaves the perpendicular vector in _d */
function rayDistance(origin: THREE.Vector3, dir: THREE.Vector3) {
  _d.copy(_w).sub(origin);
  _d.addScaledVector(dir, -_d.dot(dir));
  return _d.length();
}

/**
 * Drifting field of glossy cubes that reacts to everything:
 * pointer/touch pushes cubes away, taps send a shockwave, scrolling speeds up
 * the drift and tilts the field, and the intro flies the cubes in from depth.
 */
export function PixelField({ count, reduced }: { count: number; reduced: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const group = useRef<THREE.Group>(null!);
  const geometry = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 3, 0.09), []);
  const offsets = useRef<Float32Array | null>(null);
  const tilts = useRef<Float32Array | null>(null);
  const travel = useRef(0);
  const vel = useRef(0);

  const cubes = useMemo<Cube[]>(() => {
    const r = seeded(7);
    const snap = (v: number) => Math.round(v * 2) / 2;
    return Array.from({ length: count }, () => ({
      x: snap(-17 + r() * 34),
      y: -SPAN_Y / 2 + r() * SPAN_Y,
      z: snap(-12 + r() * 11),
      s: 0.14 + Math.pow(r(), 2.4) * 1.25,
      speed: 0.12 + r() * 0.22,
      wobble: 0.04 + r() * 0.08,
      phase: r() * Math.PI * 2,
    }));
  }, [count]);

  useLayoutEffect(() => {
    const r = seeded(11);
    const c = new THREE.Color();
    cubes.forEach((_, i) => {
      c.set(PALETTE[Math.floor(r() * PALETTE.length)]);
      c.offsetHSL(0, 0, (r() - 0.5) * 0.08);
      mesh.current.setColorAt(i, c);
    });
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [cubes]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const now = nowSec();
    const cam = state.camera;
    const n = cubes.length;
    const m = reduced ? 0 : 1;

    if (!offsets.current || offsets.current.length !== n * 3) {
      offsets.current = new Float32Array(n * 3);
      tilts.current = new Float32Array(n);
    }
    const O = offsets.current;
    const T = tilts.current!;

    vel.current = THREE.MathUtils.damp(vel.current, heroState.velocity, 6, dt);
    const v = reduced ? 0 : THREE.MathUtils.clamp(vel.current, -80, 80);
    travel.current += dt * m + v * 0.0025;

    const intro = heroState.intro;
    const p = heroState.progress;
    const px = reduced ? 0 : heroState.pointer.x;
    const py = reduced ? 0 : heroState.pointer.y;
    const strength = reduced ? 0 : inputStrength(now);

    // whole field: pointer parallax, scroll tilt, scroll-out lift
    const g = group.current;
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0.55 - py * 0.12 + p * 0.3 + v * 0.0015, 3, dt);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, -0.62 + px * 0.16, 3, dt);
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, -v * 0.001, 3, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, p * 3, 4, dt);
    g.updateMatrixWorld();
    _invQ.copy(g.quaternion).invert();

    // pointer ray + active shockwave rays
    _ray.set(px, py, 0.5).unproject(cam).sub(cam.position).normalize();
    let np = 0;
    if (!reduced) {
      for (const pl of heroState.pulses) {
        const age = now - pl.t;
        if (age < 0 || age > PULSE_LIFE || np >= _pulseRays.length) continue;
        const pr = _pulseRays[np++];
        pr.dir.set(pl.x, pl.y, 0.5).unproject(cam).sub(cam.position).normalize();
        pr.r = age * PULSE_SPEED;
        pr.a = 1 - age / PULSE_LIFE;
      }
    }

    for (let i = 0; i < n; i++) {
      const c = cubes[i];
      const y = ((((c.y + SPAN_Y / 2 + c.speed * travel.current) % SPAN_Y) + SPAN_Y) % SPAN_Y) - SPAN_Y / 2;

      // intro: cubes fly in from deep behind, staggered
      const k = THREE.MathUtils.clamp(intro * 1.7 - (i / n) * 0.7, 0, 1);
      const e = 1 - Math.pow(1 - k, 3);
      const lz = c.z - (1 - e) * 14;

      _w.set(c.x, y, lz).applyMatrix4(g.matrixWorld);
      _push.set(0, 0, 0);

      if (strength > 0) {
        const dist = rayDistance(cam.position, _ray);
        if (dist < PUSH_RADIUS && dist > 1e-4) {
          const f = Math.pow(1 - dist / PUSH_RADIUS, 2) * PUSH_FORCE * strength;
          _push.addScaledVector(_d, f / dist);
        }
      }
      for (let j = 0; j < np; j++) {
        const pr = _pulseRays[j];
        const dist = rayDistance(cam.position, pr.dir);
        const kk = 1 - Math.abs(dist - pr.r) / PULSE_WIDTH;
        if (kk > 0 && dist > 1e-4) _push.addScaledVector(_d, (kk * PULSE_FORCE * pr.a) / dist);
      }

      _push.applyQuaternion(_invQ);
      const len = _push.length();
      const i3 = i * 3;
      O[i3] = THREE.MathUtils.damp(O[i3], _push.x, 5, dt);
      O[i3 + 1] = THREE.MathUtils.damp(O[i3 + 1], _push.y, 5, dt);
      O[i3 + 2] = THREE.MathUtils.damp(O[i3 + 2], _push.z, 5, dt);
      T[i] = THREE.MathUtils.damp(T[i], len * 0.9 + v * 0.012, 4, dt);

      const bob = Math.sin(t * 0.6 + c.phase) * c.wobble * m;
      _dummy.position.set(c.x + O[i3], y + bob + O[i3 + 1], lz + O[i3 + 2]);
      _dummy.rotation.set(bob * 0.6 + T[i], bob * 0.8 + T[i] * 0.7, T[i] * 0.3);
      _dummy.scale.setScalar(c.s * e);
      _dummy.updateMatrix();
      mesh.current.setMatrixAt(i, _dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group} rotation={[0.55, -0.62, 0]}>
      <instancedMesh ref={mesh} args={[geometry, undefined, count]} frustumCulled={false}>
        <meshPhysicalMaterial
          metalness={0.45}
          roughness={0.18}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={2.2}
          color="#ffffff"
        />
      </instancedMesh>
    </group>
  );
}
