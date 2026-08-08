"use client";

// Изометрия 30° из простых фигур (спека §5): плиты и блоки тремя гранями.
// Объём — три тона грани (верх светлее, право темнее), без 3D-рендера.
// Появление: IsoScene вешает .is-in по IO — части «собираются» снизу-вверх
// с каскадом transition-delay; reduced-motion получает конечное состояние.
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

const CX = 0.866; // cos 30°
const SY = 0.5; // sin 30°

export function iso(x: number, y: number, z: number): [number, number] {
  return [(x - y) * CX, (x + y) * SY - z];
}

const pts = (list: [number, number][]) => list.map(([a, b]) => `${a.toFixed(2)},${b.toFixed(2)}`).join(" ");

export type IsoFaces = { top: string; left: string; right: string };

export const FACES_GRAY: IsoFaces = { top: "#f2f2f5", left: "#e3e3e9", right: "#d4d4db" };
export const FACES_WHITE: IsoFaces = { top: "#ffffff", left: "#ededf1", right: "#e0e0e6" };
export const FACES_ACCENT: IsoFaces = { top: "#5b99f8", left: "#2e7cf6", right: "#1f66d6" };
export const FACES_OK: IsoFaces = { top: "#5fd382", left: "#34c759", right: "#28a648" };
export const FACES_INK: IsoFaces = { top: "#3c3c41", left: "#2a2a2e", right: "#1d1d1f" };

export function IsoBox({
  x,
  y,
  z = 0,
  w,
  d,
  h,
  faces = FACES_WHITE,
  delay = 0,
}: {
  x: number;
  y: number;
  z?: number;
  w: number;
  d: number;
  h: number;
  faces?: IsoFaces;
  /** каскад сборки, мс */
  delay?: number;
}) {
  const top: [number, number][] = [iso(x, y, z + h), iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x, y + d, z + h)];
  const left: [number, number][] = [iso(x, y + d, z), iso(x, y + d, z + h), iso(x, y, z + h), iso(x, y, z)];
  // видимая «правая» грань изометрии — фронтальная (y+d)
  const right: [number, number][] = [iso(x, y + d, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x, y + d, z + h)];
  return (
    <g className="iso-part" style={{ transitionDelay: `${delay}ms` }}>
      <polygon points={pts(left)} fill={faces.left} />
      <polygon points={pts(right)} fill={faces.right} />
      <polygon points={pts(top)} fill={faces.top} />
    </g>
  );
}

export function IsoScene({
  children,
  viewBox = "-150 -110 300 220",
  className = "",
}: {
  children: ReactNode;
  viewBox?: string;
  className?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        setInView(true);
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      aria-hidden
      viewBox={viewBox}
      className={`iso-rise h-auto w-full max-w-[340px] ${inView ? "is-in" : ""} ${className}`}
    >
      {/* мягкая тень-подложка сцены (единственная тень — у предмета, не у карточки) */}
      <ellipse className="iso-part" cx="0" cy="86" rx="120" ry="18" fill="rgb(0 0 0 / 0.05)" />
      {children}
    </svg>
  );
}
