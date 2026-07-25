"use client";

// Cursor-grid фон hero. Адаптация React Bits CursorGrid (canvas, без зависимостей):
// клетки решётки вспыхивают у курсора и гаснут; клик — расходящееся кольцо.
// Урезано под проект: один цвет линий (серебро --grid), без статичной решётки
// и заливок — фон секции не меняется. Слой пассивен (pointer-events-none),
// события снимаются с родительской секции; reduced-motion отключает слой
// целиком. rAF живёт только пока есть видимые клетки.
import { useEffect, useRef } from "react";

const HOLD_MS = 400; // клетка держит яркость после касания
const FADE_MS = 800; // затем гаснет
const PULSE_SPEED = 600; // px/s — скорость кольца по клику

const smoothstep = (t: number) => t * t * (3 - 2 * t);

function hexToRgb(hex: string): [number, number, number] {
  const num = parseInt(hex.replace("#", "").slice(0, 6), 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function CursorGrid({
  color = "#bfbeca",
  cellSize = 64,
  radius = 160,
  lineWidth = 1,
  maxOpacity = 1,
}: {
  /** fallback; фактический цвет читается из токена --color-grid */
  color?: string;
  cellSize?: number;
  radius?: number;
  lineWidth?: number;
  maxOpacity?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const target = container?.parentElement; // события — с секции, слой пассивен
    if (!container || !canvas || !target) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const token = getComputedStyle(container).getPropertyValue("--color-grid").trim();
    const [cr, cg, cb] = hexToRgb(token || color);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // состояние решётки: alpha + время касания на клетку, row-major
    let cols = 0;
    let rows = 0;
    let offX = 0;
    let offY = 0;
    let w = 0;
    let h = 0;
    let alphas = new Float32Array(0);
    let touched = new Float64Array(0);
    const pulses: { x: number; y: number; t0: number }[] = [];
    let raf = 0;
    let running = false;
    let lastFrame = 0;

    const rebuild = () => {
      w = container.offsetWidth;
      h = container.offsetHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / cellSize) + 1;
      rows = Math.ceil(h / cellSize) + 1;
      // решётка центрируется — крайние клетки кропятся симметрично
      offX = (w - cols * cellSize) / 2;
      offY = (h - rows * cellSize) / 2;
      alphas = new Float32Array(cols * rows);
      touched = new Float64Array(cols * rows);
    };

    const cellCenter = (i: number): [number, number] => [
      offX + (i % cols) * cellSize + cellSize / 2,
      offY + Math.floor(i / cols) * cellSize + cellSize / 2,
    ];

    // зажечь клетки в радиусе: яркость — smoothstep от расстояния до курсора
    const energize = (x: number, y: number) => {
      const now = performance.now();
      const minCol = Math.max(0, Math.floor((x - radius - offX) / cellSize));
      const maxCol = Math.min(cols - 1, Math.floor((x + radius - offX) / cellSize));
      const minRow = Math.max(0, Math.floor((y - radius - offY) / cellSize));
      const maxRow = Math.min(rows - 1, Math.floor((y + radius - offY) / cellSize));
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          const i = r * cols + c;
          const [cx, cy] = cellCenter(i);
          const dist = Math.hypot(cx - x, cy - y);
          if (dist > radius) continue;
          const level = smoothstep(1 - dist / radius) * maxOpacity;
          if (level > alphas[i]) alphas[i] = level;
          touched[i] = now;
        }
      }
    };

    const draw = (now: number) => {
      const dt = Math.min(now - lastFrame, 50);
      lastFrame = now;
      ctx.clearRect(0, 0, w, h);

      // кольцо клика передаёт энергию клеткам, через которые проходит
      for (let pi = pulses.length - 1; pi >= 0; pi--) {
        const pulse = pulses[pi];
        const ringR = ((now - pulse.t0) / 1000) * PULSE_SPEED;
        if (ringR > Math.hypot(w, h)) {
          pulses.splice(pi, 1);
          continue;
        }
        const band = cellSize;
        const minCol = Math.max(0, Math.floor((pulse.x - ringR - band - offX) / cellSize));
        const maxCol = Math.min(cols - 1, Math.floor((pulse.x + ringR + band - offX) / cellSize));
        const minRow = Math.max(0, Math.floor((pulse.y - ringR - band - offY) / cellSize));
        const maxRow = Math.min(rows - 1, Math.floor((pulse.y + ringR + band - offY) / cellSize));
        for (let r = minRow; r <= maxRow; r++) {
          for (let c = minCol; c <= maxCol; c++) {
            const i = r * cols + c;
            const [cx, cy] = cellCenter(i);
            const dist = Math.hypot(cx - pulse.x, cy - pulse.y);
            if (Math.abs(dist - ringR) < band / 2 && maxOpacity > alphas[i]) {
              alphas[i] = maxOpacity;
              touched[i] = now;
            }
          }
        }
      }

      let anyVisible = pulses.length > 0;
      const fadeStep = dt / FADE_MS;
      const half = cellSize / 2;

      for (let i = 0; i < alphas.length; i++) {
        let a = alphas[i];
        if (a <= 0) continue;
        if (now - touched[i] > HOLD_MS) {
          a = Math.max(0, a - fadeStep);
          alphas[i] = a;
          if (a <= 0) continue;
        }
        anyVisible = true;
        const [cx, cy] = cellCenter(i);
        // центр клетки ярче, к углам гаснет
        const gradient = ctx.createRadialGradient(cx, cy, half * 0.1, cx, cy, cellSize);
        gradient.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${a})`);
        gradient.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
        ctx.beginPath();
        ctx.rect(cx - half + 0.5, cy - half + 0.5, cellSize - 1, cellSize - 1);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }

      if (anyVisible) {
        raf = requestAnimationFrame(draw);
      } else {
        running = false;
        ctx.clearRect(0, 0, w, h);
      }
    };

    const wake = () => {
      if (running) return;
      running = true;
      lastFrame = performance.now();
      raf = requestAnimationFrame(draw);
    };

    const toLocal = (e: PointerEvent): [number, number] => {
      const rect = canvas.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top];
    };

    const onPointerMove = (e: PointerEvent) => {
      const [x, y] = toLocal(e);
      energize(x, y);
      wake();
    };

    const onPointerDown = (e: PointerEvent) => {
      const [x, y] = toLocal(e);
      pulses.push({ x, y, t0: performance.now() });
      wake();
    };

    const ro = new ResizeObserver(rebuild);
    ro.observe(container);
    rebuild();

    target.addEventListener("pointermove", onPointerMove);
    target.addEventListener("pointerdown", onPointerDown);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      target.removeEventListener("pointermove", onPointerMove);
      target.removeEventListener("pointerdown", onPointerDown);
    };
  }, [color, cellSize, radius, lineWidth, maxOpacity]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
