// Фоновые микро-детали сцены (референс: бинарный дождь, MS-метки, сетка).
// Позиции детерминированы (SSR-стабильность); цвет --v4-ghost, никогда не
// мешают чтению; живут только в иллюстрационной зоне CardScene.
export type MicroTextureKind = "binary" | "ms" | "grid" | "amounts" | "iban" | "lines";

type Item = { x: number; y: number; t: string };

const ITEMS: Record<MicroTextureKind, Item[]> = {
  binary: [
    { x: 6, y: 10, t: "1" }, { x: 14, y: 26, t: "0" }, { x: 9, y: 46, t: "0" },
    { x: 16, y: 66, t: "1" }, { x: 7, y: 84, t: "1" }, { x: 86, y: 12, t: "0" },
    { x: 92, y: 30, t: "1" }, { x: 85, y: 52, t: "0" }, { x: 93, y: 72, t: "1" },
    { x: 87, y: 88, t: "0" }, { x: 24, y: 8, t: "0" }, { x: 76, y: 90, t: "1" },
  ],
  ms: [
    { x: 8, y: 14, t: "71MS" }, { x: 84, y: 10, t: "53MS" }, { x: 90, y: 42, t: "72MS" },
    { x: 6, y: 56, t: "60MS" }, { x: 82, y: 78, t: "81MS" }, { x: 12, y: 86, t: "93MS" },
  ],
  amounts: [
    { x: 7, y: 12, t: "+120.00" }, { x: 84, y: 16, t: "eur" }, { x: 88, y: 48, t: "+64.50" },
    { x: 6, y: 52, t: "chf" }, { x: 82, y: 84, t: "+380.00" }, { x: 10, y: 82, t: "usd" },
  ],
  iban: [
    { x: 8, y: 14, t: "CH93" }, { x: 86, y: 12, t: "0076" }, { x: 90, y: 46, t: "2011" },
    { x: 6, y: 54, t: "6238" }, { x: 84, y: 82, t: "5295" }, { x: 10, y: 84, t: "7" },
  ],
  lines: [
    { x: 6, y: 16, t: "1" }, { x: 6, y: 32, t: "2" }, { x: 6, y: 48, t: "3" },
    { x: 6, y: 64, t: "4" }, { x: 6, y: 80, t: "5" }, { x: 92, y: 24, t: "()" },
    { x: 90, y: 60, t: "{}" },
  ],
  grid: [],
};

export function MicroTexture({ kind, className = "" }: { kind: MicroTextureKind; className?: string }) {
  if (kind === "grid") {
    return (
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 select-none ${className}`}
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--v4-ghost) 1px, transparent 1px), linear-gradient(to bottom, var(--v4-ghost) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          opacity: 0.35,
        }}
      />
    );
  }
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 select-none ${className}`}>
      {ITEMS[kind].map((it, i) => (
        <span
          key={i}
          className="text-data absolute text-[0.6875rem] tracking-[0.08em]"
          style={{ left: `${it.x}%`, top: `${it.y}%`, color: "var(--v4-ghost)" }}
        >
          {it.t}
        </span>
      ))}
    </div>
  );
}
