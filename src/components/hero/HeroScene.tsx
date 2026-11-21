"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useReducedMotion } from "framer-motion";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";
import { heroState, nowSec, signalSceneReady } from "@/lib/heroState";
import { Particles } from "./Particles";
import { PixelField } from "./PixelField";
import { PSculpture } from "./PSculpture";

const _target = new THREE.Vector3();

/** Light that follows the pointer / finger and flashes on taps. */
function PointerLight({ reduced }: { reduced: boolean }) {
  const light = useRef<THREE.PointLight>(null!);
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const x = reduced ? 3 : heroState.pointer.x * 7;
    const y = reduced ? 2 : heroState.pointer.y * 4.5;
    _target.set(x, y, 4);
    light.current.position.lerp(_target, 1 - Math.exp(-5 * dt));
    const pulses = heroState.pulses;
    const age = pulses.length ? nowSec() - pulses[pulses.length - 1].t : 99;
    const flash = reduced ? 0 : Math.max(0, 1 - age / 0.6);
    light.current.intensity = 22 + flash * 70;
  });
  return <pointLight ref={light} color="#c34dff" intensity={22} distance={16} decay={2} />;
}

/** Intro fly-in + pointer drift + scroll dolly. */
function CameraRig({ reduced }: { reduced: boolean }) {
  useFrame(({ camera }, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = heroState.progress;
    const intro = heroState.intro;
    const px = reduced ? 0 : heroState.pointer.x;
    const py = reduced ? 0 : heroState.pointer.y;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, px * 0.35, 3, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, py * 0.2 - p * 0.8, 3, dt);
    // intro is already eased by GSAP, so apply it directly
    camera.position.z = 10 + (1 - intro) * 12 - p * 2.5;
    camera.lookAt(0, -p * 0.3, 0);
  });
  return null;
}

function Ready() {
  const fired = useRef(false);
  useFrame(() => {
    if (fired.current) return;
    fired.current = true;
    requestAnimationFrame(() => signalSceneReady());
  });
  return null;
}

export default function HeroScene({ active = true }: { active?: boolean }) {
  const reduced = useReducedMotion() ?? false;
  const [mobile] = useState(() => window.matchMedia("(max-width: 767px)").matches);

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      resize={{ offsetSize: true }}
      dpr={mobile ? [1, 1.5] : [1, 1.75]}
      camera={{ position: [0, 0, 22], fov: 40, near: 0.1, far: 80 }}
      gl={{ antialias: mobile, powerPreference: "high-performance", alpha: false }}
      onCreated={({ scene }) => {
        scene.background = new THREE.Color("#08080D");
      }}
      aria-hidden
    >
      <fog attach="fog" args={["#08080D", 17, 40]} />
      <ambientLight intensity={0.15} />
      <directionalLight position={[6, 8, 6]} intensity={1.2} color="#f0e6ff" />
      <PointerLight reduced={reduced} />
      <CameraRig reduced={reduced} />

      <Suspense fallback={null}>
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={5} color="#D946EF" position={[-6, 2, 3]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
          <Lightformer form="rect" intensity={4} color="#6200EA" position={[6, -1, 3]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} />
          <Lightformer form="rect" intensity={2.5} color="#ffffff" position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[12, 1.2, 1]} />
          <Lightformer form="ring" intensity={3} color="#C34DFF" position={[2, 1, 6]} scale={2.5} />
          <Lightformer form="rect" intensity={1.2} color="#8B35F5" position={[0, 0, -10]} scale={[20, 20, 1]} />
        </Environment>

        <PixelField count={mobile ? 90 : 260} reduced={reduced} />
        <PSculpture reduced={reduced} />
        <Particles count={mobile ? 220 : 520} reduced={reduced} />
        <Ready />

        {!mobile && (
          <EffectComposer multisampling={4}>
            <Bloom mipmapBlur luminanceThreshold={0.75} luminanceSmoothing={0.2} intensity={0.6} />
            <Vignette offset={0.25} darkness={0.75} />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  );
}
