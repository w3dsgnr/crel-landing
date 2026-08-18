"use client";

// Спекулярная кнопка. Адаптация React Bits SpecularButton (там ogl/WebGL) на
// CSS + минимальный JS: стеклянный корпус (tint + backdrop blur), тонкая
// статичная кромка baseColor и поверх неё — два коротких штриха-блика
// (яркий смотрит на курсор, второй симметричный на +180° тусклее — rim-light),
// нарисованных conic-gradient и обрезанных маской до кольца толщиной thickness.
// Блик проявляется по расстоянию до кромки (proximity) и следует за курсором
// (followMouse; при false угол фиксирован сверху, яркость всё равно по proximity).
// JS пишет только css-переменные на элемент (--sb-angle, --sb-glow), без
// React-state: один пассивный pointermove на window + rAF-лерп угла; rAF живёт,
// пока переменные догоняют цель.
// autoAnimate (медленное вращение блика без курсора) — только по пропсу:
// правило проекта — без бесконечных циклов, в hero не включаем.
// Reduced-motion и coarse pointer: слушателей нет, блик статичен (тусклый рим).
import { useEffect, useRef } from "react";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

export interface SpecularButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  className?: string;
  /** радиус корпуса, px; по умолчанию — пилюля */
  radius?: number;
  /** цвет и плотность стекла корпуса, размытие фона за ним */
  tint?: string;
  tintOpacity?: number;
  blur?: number;
  textColor?: string;
  /** цвет блика на кромке */
  lineColor?: string;
  /** цвет статичной кромки под бликом */
  baseColor?: string;
  /** общая яркость блика (множитель --sb-glow), 0..1 */
  intensity?: number;
  /** ширина яркого штриха, град */
  shineSize?: number;
  /** длина затухания по обе стороны от штриха, град */
  shineFade?: number;
  /** толщина кромки, px */
  thickness?: number;
  /** дистанция от кромки, с которой блик начинает проявляться, px */
  proximity?: number;
  followMouse?: boolean;
  autoAnimate?: boolean;
  /** скорость autoAnimate, рад/с (0.35 ≈ оборот за 18 с) */
  speed?: number;
  "aria-label"?: string;
}

const LERP = 0.18; // доля пути за кадр — угол догоняет курсор мягко, без хвоста
const EPS_ANGLE = 0.05;
const EPS_GLOW = 0.002;
const STATIC_GLOW = 0.45; // тусклый рим при reduced-motion / touch / autoAnimate

// Стили инжектируются компонентом (как в MagicBento) — скоуп по классу .specular-btn.
// Кромка: маска «content-box исключить из padding-box» оставляет кольцо шириной
// padding = thickness. Штрихи стоят на 90° и 270° conic-градиента, а сам градиент
// повёрнут на (--sb-angle − 90°): так оба штриха целиком в диапазоне 0–360 и не
// рвутся на шве при любом угле.
const SPECULAR_STYLE = `
  @property --sb-angle {
    syntax: "<angle>";
    inherits: false;
    initial-value: 0deg;
  }
  .specular-btn {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    border: 0;
    border-radius: var(--sb-radius);
    color: var(--sb-text);
    background: color-mix(in srgb, var(--sb-tint) calc(var(--sb-tint-a) * 100%), transparent);
    -webkit-backdrop-filter: blur(var(--sb-blur));
    backdrop-filter: blur(var(--sb-blur));
  }
  .specular-btn__rim,
  .specular-btn__shine {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: var(--sb-th);
    pointer-events: none;
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask-composite: exclude;
  }
  .specular-btn__rim {
    background: var(--sb-base);
    z-index: 1;
  }
  .specular-btn__shine {
    z-index: 2;
    opacity: var(--sb-glow);
    transition: opacity 160ms ease;
    background: conic-gradient(
      from calc(var(--sb-angle) - 90deg),
      transparent 0deg,
      transparent calc(90deg - var(--sb-half) - var(--sb-fade)),
      color-mix(in srgb, var(--sb-line) 55%, transparent) calc(90deg - var(--sb-half) - var(--sb-fade) * 0.35),
      var(--sb-line) calc(90deg - var(--sb-half)),
      var(--sb-line) calc(90deg + var(--sb-half)),
      color-mix(in srgb, var(--sb-line) 55%, transparent) calc(90deg + var(--sb-half) + var(--sb-fade) * 0.35),
      transparent calc(90deg + var(--sb-half) + var(--sb-fade)),
      transparent calc(270deg - var(--sb-half) - var(--sb-fade)),
      color-mix(in srgb, var(--sb-line) 35%, transparent) calc(270deg - var(--sb-half)),
      color-mix(in srgb, var(--sb-line) 35%, transparent) calc(270deg + var(--sb-half)),
      transparent calc(270deg + var(--sb-half) + var(--sb-fade)),
      transparent 360deg
    );
  }
  .specular-btn__label {
    position: relative;
    z-index: 3;
    display: inline-flex;
    align-items: baseline;
  }
  .specular-btn[data-sb-spin] .specular-btn__shine {
    animation: sb-spin var(--sb-spin-dur) linear infinite;
  }
  @keyframes sb-spin {
    from { --sb-angle: 0deg; }
    to { --sb-angle: 360deg; }
  }
  @media (prefers-reduced-motion: reduce) {
    .specular-btn__shine {
      transition: none;
      animation: none !important;
    }
  }
`;

export function SpecularButton({
  children,
  onClick,
  type = "button",
  className = "",
  radius = 999,
  tint = "#0a0a0a",
  tintOpacity = 0.72,
  blur = 16,
  textColor = "#ffffff",
  lineColor = "#ffffff",
  baseColor = "rgb(255 255 255 / 0.22)",
  intensity = 1,
  shineSize = 10,
  shineFade = 40,
  thickness = 1,
  proximity = 260,
  followMouse = true,
  autoAnimate = false,
  speed = 0.35,
  "aria-label": ariaLabel,
}: SpecularButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    // live — слушатели курсора вообще нужны (яркость по proximity);
    // угол следует за курсором только при followMouse
    const live = !reduced && !coarse;

    // статика: блик — тусклый рим сверху; autoAnimate крутит его css-анимацией
    if (autoAnimate && !reduced) {
      el.dataset.sbSpin = "";
      el.style.setProperty("--sb-spin-dur", `${(Math.PI * 2) / Math.max(speed, 0.01)}s`);
    }
    if (!live) {
      el.style.setProperty("--sb-glow", String(STATIC_GLOW * intensity));
      return () => {
        delete el.dataset.sbSpin;
      };
    }

    // текущее/целевое состояние — только в замыкании, React о нём не знает
    let angle = 0; // непрерывный (без wrap) — лерп идёт по короткой дуге
    let targetAngle = 0;
    let glow = 0;
    let targetGlow = 0;
    let px = -1e9;
    let py = -1e9;
    let raf = 0;
    let dirty = false;

    const measure = () => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      // расстояние до ближайшей точки прямоугольника (внутри — 0)
      const dx = Math.max(r.left - px, 0, px - r.right);
      const dy = Math.max(r.top - py, 0, py - r.bottom);
      const dist = Math.hypot(dx, dy);
      targetGlow = Math.min(1, Math.max(0, 1 - dist / proximity)) * intensity;
      // без слежения угол фиксирован сверху (0deg)
      if (!followMouse) return;
      // conic: 0° сверху, по часовой; atan2 экранных координат: 0 — вправо
      const a = (Math.atan2(py - cy, px - cx) * 180) / Math.PI + 90;
      // укладываем разницу в [-180, 180] — доворот всегда по короткой дуге
      let d = (a - angle) % 360;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      targetAngle = angle + d;
    };

    const tick = () => {
      raf = 0;
      if (dirty) {
        dirty = false;
        measure();
      }
      // при autoAnimate угол ведёт css-анимация, JS перехватывает только вблизи
      const near = targetGlow > EPS_GLOW;
      if (autoAnimate) {
        if (near) el.removeAttribute("data-sb-spin");
        else el.dataset.sbSpin = "";
      }
      const da = targetAngle - angle;
      const dg = targetGlow - glow;
      angle += Math.abs(da) < EPS_ANGLE ? da : da * LERP;
      glow += Math.abs(dg) < EPS_GLOW ? dg : dg * 0.35;
      el.style.setProperty("--sb-angle", `${angle.toFixed(2)}deg`);
      el.style.setProperty("--sb-glow", glow.toFixed(3));
      if (Math.abs(targetAngle - angle) > 0 || Math.abs(targetGlow - glow) > 0) {
        raf = requestAnimationFrame(tick);
      }
    };
    const schedule = () => {
      dirty = true;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      schedule();
    };
    // курсор ушёл из окна — блик гаснет
    const onOut = (e: PointerEvent) => {
      if (e.relatedTarget) return;
      px = -1e9;
      py = -1e9;
      schedule();
    };
    // кнопка уехала под неподвижным курсором (Lenis) — пересчёт по последней точке
    const onScroll = () => {
      if (px > -1e8) schedule();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      delete el.dataset.sbSpin;
    };
  }, [followMouse, autoAnimate, speed, intensity, proximity]);

  const vars = {
    "--sb-radius": `${radius}px`,
    "--sb-tint": tint,
    "--sb-tint-a": tintOpacity,
    "--sb-blur": `${blur}px`,
    "--sb-text": textColor,
    "--sb-line": lineColor,
    "--sb-base": baseColor,
    "--sb-half": `${shineSize / 2}deg`,
    "--sb-fade": `${shineFade}deg`,
    "--sb-th": `${thickness}px`,
    "--sb-glow": 0,
    "--sb-angle": "0deg",
  } as CSSProperties;

  return (
    <>
      <style>{SPECULAR_STYLE}</style>
      <button
        ref={ref}
        type={type}
        onClick={onClick}
        aria-label={ariaLabel}
        className={`specular-btn ${className}`}
        style={vars}
      >
        <span aria-hidden className="specular-btn__rim" />
        <span aria-hidden className="specular-btn__shine" />
        <span className="specular-btn__label">{children}</span>
      </button>
    </>
  );
}
