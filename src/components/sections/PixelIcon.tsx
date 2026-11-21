import type { CSSProperties } from "react";

const FACES: { t: string; bg: string }[] = [
  // front, back, right, left, top, bottom
  { t: "translateZ(var(--h))", bg: "linear-gradient(135deg,#a24bff,#7a2cf0)" },
  { t: "rotateY(180deg) translateZ(var(--h))", bg: "#4a10b8" },
  { t: "rotateY(90deg) translateZ(var(--h))", bg: "linear-gradient(135deg,#6d22e8,#4a10b8)" },
  { t: "rotateY(-90deg) translateZ(var(--h))", bg: "linear-gradient(135deg,#b45cff,#8b35f5)" },
  { t: "rotateX(90deg) translateZ(var(--h))", bg: "linear-gradient(135deg,#e9a8ff,#c34dff)" },
  { t: "rotateX(-90deg) translateZ(var(--h))", bg: "#3a0c90" },
];
const ACCENT_TOP = "linear-gradient(135deg,#ffffff,#f0c6ff)";
const ACCENT_FRONT = "linear-gradient(135deg,#e879f9,#c34dff)";

/**
 * A small CSS-3D cluster of glossy pixel cubes (no WebGL).
 * Spreads apart and tilts when its card is hovered (or `.is-active` on touch).
 */
export function PixelIcon({ cubes, size = 34 }: { cubes: [number, number, number][]; size?: number }) {
  const n = cubes.length;
  const mean = cubes.reduce((a, c) => [a[0] + c[0] / n, a[1] + c[1] / n, a[2] + c[2] / n], [0, 0, 0]);

  return (
    <div
      aria-hidden
      className="relative grid h-48 place-items-center [--spread:1] [perspective:900px] group-hover:[--spread:1.45] group-[.is-active]:[--spread:1.45]"
    >
      <div className="[transform-style:preserve-3d] [transform:rotateX(-24deg)] transition-transform duration-700 ease-out-expo group-hover:[transform:rotateX(-38deg)] group-[.is-active]:[transform:rotateX(-38deg)]">
        <div className="animate-[spinY_18s_linear_infinite] [transform-style:preserve-3d]">
          {cubes.map((c, i) => {
            const [x, y, z] = [c[0] - mean[0], c[1] - mean[1], c[2] - mean[2]];
            const accent = i === n - 1;
            const style = {
              "--h": `${size / 2}px`,
              width: size,
              height: size,
              left: -size / 2,
              top: -size / 2,
              transform: `translate3d(calc(${x * size * 1.04}px * var(--spread)), calc(${y * size * 1.04}px * var(--spread)), calc(${z * size * 1.04}px * var(--spread)))`,
              transitionDelay: `${i * 25}ms`,
            } as CSSProperties;
            return (
              <div
                key={i}
                className="absolute [transform-style:preserve-3d] transition-transform duration-700 ease-out-expo"
                style={style}
              >
                {FACES.map((f, k) => (
                  <i
                    key={k}
                    className="absolute inset-0 rounded-[4px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] [backface-visibility:hidden]"
                    style={{
                      transform: f.t,
                      background: accent && k === 4 ? ACCENT_TOP : accent && k === 0 ? ACCENT_FRONT : f.bg,
                    }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
      {/* soft floor glow */}
      <div className="pointer-events-none absolute bottom-4 h-6 w-32 rounded-full bg-electric/40 blur-2xl transition-opacity duration-700 group-hover:opacity-100 md:opacity-60" />
    </div>
  );
}
