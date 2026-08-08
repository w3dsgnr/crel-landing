# Слой v4 «светлый референс» — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Перевести Hero, Capabilities, ServicesGrid, UseCases и Integration на светлый стиль референсов todesktop (спека `docs/superpowers/specs/2026-08-08-light-reference-redesign-design.md`), заменив мокапы услуг изометрической SVG-инфографикой.

**Architecture:** Токены v4 вводятся скоуп-классом `.layer-v4`, который переопределяет CSS-переменные v3 на корнях затронутых секций — мокапы и ячейки перекрашиваются каскадом, без правки каждого компонента. Новые компоненты: `CardScene` (анатомия карточки референса), `MicroTexture` (фоновые моно-символы), изометрические примитивы + 7 сцен. Секции переписываются точечно; остальной лендинг остаётся на v3.

**Tech Stack:** Next.js (App Router), Tailwind v4 (`@theme`-токены), GSAP (не трогаем), inline-SVG для изометрии.

## Global Constraints

- Тексты и копирайт не изменяются; структура и порядок секций не изменяются (спека §10).
- Работаем в текущей ветке `merge/one-rail`, без worktree (dev-сервер привязан к `.claude/launch.json` → `crel-dev`).
- Тестового фреймворка нет (решение задокументировано): проверка каждой задачи = `npx tsc --noEmit`; сборка `npm run build` — в задачах, где указано.
- Один бренд-акцент в затронутых секциях: `#2E7CF6`. Зелёный `#34C759` — только статус «выполнено», оранжевый `#FF9F0A` — точечно. Цветных заливок карточек нет.
- Радиусы v4: chip 8 / panel 14 / card 26 / pill. Тень одна: `0 8px 24px rgb(0 0 0 / 0.06), 0 2px 6px rgb(0 0 0 / 0.04)` — только у панелей/предметов внутри сцен.
- Все новые анимации уважают `prefers-reduced-motion` (конечное состояние без движения).
- **Скриншот-протокол (спека §8):** пользователь не видит localhost. После каждой визуальной задачи: снять скриншоты в `docs/review/v4/` (см. Задачу 2), передать главному агенту; главный агент отправляет их пользователю в чат (SendUserFile) с подписью. Задача не закрыта без скриншотов.
- Вкладка превью живёт с `document.hidden=true`, rAF заторможен — анимации по таймингам не проверять; `shoot.py` эмулирует reduced-motion и снимает конечные состояния.
- Коммит после каждой задачи; сообщения на русском, `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task 1: Токен-слой v4 в `app/globals.css`

**Files:**
- Modify: `app/globals.css` (добавление в конец файла; существующие v3-блоки не трогать)

**Interfaces:**
- Produces: класс `.layer-v4` (вешается на корневой `<section>`), переменные `--v4-hairline`, `--v4-ghost`, `--v4-ok`, `--v4-warn`, классы `.v4-hairline`, `.iso-rise`, `.is-in`. Все существующие токен-имена (`--color-*`, `--radius-*`, `--shadow-mockup`, `--glow-*`) внутри скоупа получают v4-значения — компоненты внутри секций перекрашиваются без правок.

- [ ] **Step 1: Дописать v4-блок в конец `app/globals.css`**

```css
/* ── Слой v4 «светлый референс» (спека 2026-08-08) ─────────────────────────
   Скоуп-класс на корнях секций охвата: Hero, Capabilities, ServicesGrid,
   UseCases, Integration. Переопределяет токены v3 каскадом — мокапы и ячейки
   внутри перекрашиваются без правки компонентов. Источник значений:
   docs/refs/todesktop/design.md. Остальной лендинг остаётся на v3. */
.layer-v4 {
  /* нейтрали референса — тёплый ахромат вместо зелёного подтона */
  --color-bg: #ffffff;
  --color-bg-alt: #ececf1; /* поля внутри белых панелей (Field ramp-виджета) */
  --color-bg-mist: #f5f5f7; /* карточка-сцена */
  --color-surface: #ffffff; /* панель мокапа */
  --color-ink: #1d1d1f;
  --color-ink-900: #1d1d1f;
  --color-ink-forest: #1d1d1f; /* цветных заливок в v4 нет — текст всегда тёмный */
  --color-ink-soft: #6e6e73;
  --color-line: rgb(29 29 31 / 0.1);
  --color-grid: #d6d6db; /* cursor-grid hero — ghost-серебро */

  /* весь бывший зелёный веер схлопывается в один синий акцент */
  --color-pine-900: #1d1d1f;
  --color-pine-800: #1d1d1f;
  --color-pine-600: #6e6e73; /* лейблы секций — нейтральный muted */
  --color-accent: #2e7cf6;
  --color-accent-deep: #2e7cf6;
  --color-jade: #2e7cf6;
  --color-accent-bright: #2e7cf6;
  --color-teal: #2e7cf6;
  --color-cyan-glow: #2e7cf6;

  /* лестница радиусов референса: chip 8 / panel 14 / card 26 */
  --radius-s: 8px;
  --radius-m: 14px;
  --radius-l: 14px; /* MockupStage берёт --radius-l — панель */
  --radius-xl: 26px; /* карточка-сцена */
  --radius-2xl: 26px;

  /* glow-системы в v4 нет: цветные тени гасятся */
  --glow-s: 0 0 0 rgb(0 0 0 / 0);
  --glow-m: 0 0 0 rgb(0 0 0 / 0);
  --glow-l: 0 0 0 rgb(0 0 0 / 0);
  --glow-soft: 0 0 0 rgb(0 0 0 / 0);

  /* единственная тень системы — мягкий стек у панелей внутри сцен */
  --shadow-mockup: 0 8px 24px rgb(0 0 0 / 0.06), 0 2px 6px rgb(0 0 0 / 0.04);
  --shadow-panel: 0 8px 24px rgb(0 0 0 / 0.06), 0 2px 6px rgb(0 0 0 / 0.04);
  --shadow-panel-dark: 0 8px 24px rgb(0 0 0 / 0.06), 0 2px 6px rgb(0 0 0 / 0.04);

  /* v4-собственные роли (вне v3-имён) */
  --v4-hairline: #e4e4e7;
  --v4-ghost: #d6d6db;
  --v4-ok: #34c759;
  --v4-warn: #ff9f0a;
}

/* точка live внутри v4: функциональный зелёный, свечение мягче */
.layer-v4 .dot-live,
.layer-v4 .dot-live-bright {
  box-shadow:
    0 0 0 3px rgb(52 199 89 / 0.14),
    0 0 8px rgb(52 199 89 / 0.35);
}

/* «музейная табличка» карточки: линия ~64% по центру */
.v4-hairline {
  height: 1px;
  width: 64%;
  margin-inline: auto;
  background: var(--v4-hairline);
}

/* появление изометрической сцены: сборка снизу-вверх, transform-only.
   Части сцены получают transition-delay инлайном (IsoScene). */
.iso-rise .iso-part {
  opacity: 0;
  transform: translateY(14px);
  transition:
    opacity 0.5s var(--ease-out-expo),
    transform 0.5s var(--ease-out-expo);
}
.iso-rise.is-in .iso-part {
  opacity: 1;
  transform: translateY(0);
}
@media (prefers-reduced-motion: reduce) {
  .iso-rise .iso-part {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

- [ ] **Step 2: Проверить типы и сборку**

Run: `npx tsc --noEmit` → PASS (CSS типы не трогает, проверка на регрессии).
Run: `npm run build` → PASS, роут один: `/`.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat(v4): скоуп-класс layer-v4 — токены светлого референса поверх v3"
```

---

### Task 2: Скриншот-инфраструктура — `scripts/shoot.py` на актуальный роут

**Files:**
- Modify: `scripts/shoot.py:12` (маршруты `/services`, `/platform` удалены из приложения — снимаем `/`)

**Interfaces:**
- Produces: `python scripts/shoot.py docs/review/v4` кладёт `docs/review/v4/landing.png` (full-page, 1440×2x, reduced-motion). Все последующие задачи используют эту команду.

- [ ] **Step 1: Заменить словарь страниц**

В `scripts/shoot.py` заменить строку:

```python
pages = {"services": "/services", "platform": "/platform"}
```

на:

```python
pages = {"landing": "/"}
```

- [ ] **Step 2: Проверить прогон**

Запустить dev-сервер через preview-инструмент (конфиг `crel-dev` из `.claude/launch.json`), затем:

Run: `python scripts/shoot.py docs/review/v4-baseline`
Expected: `wrote docs/review/v4-baseline/landing.png` — базовый снимок «до» для сравнения.

- [ ] **Step 3: Commit (включая baseline-снимок)**

```bash
git add scripts/shoot.py docs/review/v4-baseline/
git commit -m "chore(review): shoot.py на единый роут /, baseline-снимок до v4"
```

---

### Task 3: `CardScene` + `MicroTexture`

**Files:**
- Create: `components/v4/CardScene.tsx`
- Create: `components/v4/MicroTexture.tsx`

**Interfaces:**
- Produces:
  - `CardScene({ title, body, illustration, texture?, contentClassName?, className? })` — серая карточка-сцена: иллюстрация сверху, титул/линия/описание по центру снизу. `texture` — вид `MicroTextureKind`.
  - `MicroTexture({ kind, className? })`, `type MicroTextureKind = "binary" | "ms" | "grid" | "amounts" | "iban" | "lines"` — абсолютный aria-hidden слой моно-символов цвета `--v4-ghost`.
- Consumes: класс `.v4-hairline` из Задачи 1.

- [ ] **Step 1: Написать `components/v4/MicroTexture.tsx`**

```tsx
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
```

- [ ] **Step 2: Написать `components/v4/CardScene.tsx`**

```tsx
// Анатомия карточки референса (docs/refs/todesktop/design.md §3.1):
// серая сцена без тени и рамки → иллюстрация (панели могут кадрироваться
// краем) → центрированный титул → hairline ~64% → muted-описание ≤3 строк.
// Дисциплина: сцена всегда --color-bg-mist, тень только у предметов внутри.
import type { ReactNode } from "react";
import { MicroTexture, type MicroTextureKind } from "./MicroTexture";

export function CardScene({
  title,
  body,
  illustration,
  texture,
  contentClassName = "",
  className = "",
}: {
  title: string;
  body: string;
  illustration: ReactNode;
  texture?: MicroTextureKind;
  /** доп. классы зоны иллюстрации (напр. items-end для кадрирования низом) */
  contentClassName?: string;
  className?: string;
}) {
  return (
    <div className={`flex h-full flex-col overflow-hidden rounded-(--radius-xl) bg-bg-mist ${className}`}>
      <div className="relative min-h-[220px] flex-1">
        {texture && <MicroTexture kind={texture} />}
        <div className={`relative flex h-full items-center justify-center p-8 ${contentClassName}`}>
          {illustration}
        </div>
      </div>
      <div className="px-8 pb-8 text-center">
        <h3 className="text-[1.3125rem] font-semibold tracking-[-0.01em]">{title}</h3>
        <div aria-hidden className="v4-hairline mt-4" />
        <p className="mx-auto mt-4 max-w-[55ch] text-[0.9375rem] leading-relaxed text-ink-soft">{body}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Проверить типы**

Run: `npx tsc --noEmit` → PASS.

- [ ] **Step 4: Commit**

```bash
git add components/v4/
git commit -m "feat(v4): CardScene и MicroTexture — анатомия карточки референса"
```

---

### Task 4: Изометрические примитивы `components/isometric/Iso.tsx`

**Files:**
- Create: `components/isometric/Iso.tsx`

**Interfaces:**
- Produces:
  - `iso(x, y, z): [px, py]` — проекция 30°.
  - `IsoBox({ x, y, z?, w, d, h, faces?, delay?, rx? })` — параллелепипед тремя гранями (`<g class="iso-part">`, transition-delay инлайном).
  - `IsoFaces` + пресеты `FACES_GRAY`, `FACES_WHITE`, `FACES_ACCENT`, `FACES_OK`, `FACES_INK`.
  - `IsoScene({ children, viewBox?, className? })` — svg-обёртка: IO вешает `.is-in` на корень `.iso-rise` (сборка снизу), тень-эллипс под сценой.
- Consumes: CSS `.iso-rise`/`.is-in`/`.iso-part` из Задачи 1.

- [ ] **Step 1: Написать `components/isometric/Iso.tsx`**

```tsx
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
```

- [ ] **Step 2: Проверить типы**

Run: `npx tsc --noEmit` → PASS.

- [ ] **Step 3: Commit**

```bash
git add components/isometric/Iso.tsx
git commit -m "feat(v4): изометрические примитивы — IsoBox/IsoScene, проекция 30°"
```

---

### Task 5: Семь изометрических сцен

**Files:**
- Create: `components/isometric/scenes.tsx`

**Interfaces:**
- Consumes: `IsoBox`, `IsoScene`, `iso`, пресеты граней из Задачи 4.
- Produces: `IsoImplementation`, `IsoArchitecture`, `IsoLicensing`, `IsoVendors`, `IsoMobile`, `IsoSupport`, `IsoWidgetEmbed` — компоненты без пропсов, каждый = `<IsoScene>` с составом фигур. Метафоры — спека §5 и §7.

- [ ] **Step 1: Написать `components/isometric/scenes.tsx`**

```tsx
// Семь сцен услуг/платформы (спека §5, §7): одна метафора на сцену,
// грейскейл-база + 1–2 синих момента, зелёный — только статус.
// Задержки delay каскадируют сборку снизу-вверх (база → детали).
import { IsoBox, IsoScene, iso, FACES_GRAY, FACES_WHITE, FACES_ACCENT, FACES_OK, FACES_INK } from "./Iso";

/* Platform implementation: слои-плиты собираются в стек на базовой сетке */
export function IsoImplementation() {
  return (
    <IsoScene>
      <IsoBox x={-70} y={-70} w={140} d={140} h={10} faces={FACES_GRAY} delay={0} />
      <IsoBox x={-52} y={-52} z={26} w={104} d={104} h={10} faces={FACES_WHITE} delay={120} />
      <IsoBox x={-34} y={-34} z={52} w={68} d={68} h={10} faces={FACES_WHITE} delay={240} />
      <IsoBox x={-16} y={-16} z={78} w={32} d={32} h={10} faces={FACES_ACCENT} delay={360} />
    </IsoScene>
  );
}

/* Architecture consulting: чертёжная плоскость, блоки-узлы соединены рельсами */
export function IsoArchitecture() {
  const [ax, ay] = iso(-40, -40, 22);
  const [bx, by] = iso(44, -10, 22);
  const [cx2, cy2] = iso(-8, 44, 22);
  return (
    <IsoScene>
      <IsoBox x={-80} y={-80} w={160} d={160} h={6} faces={FACES_GRAY} delay={0} />
      {/* рельсы-связи по плоскости чертежа */}
      <g className="iso-part" style={{ transitionDelay: "140ms" }}>
        <path
          d={`M ${ax} ${ay} L ${bx} ${by} M ${bx} ${by} L ${cx2} ${cy2} M ${cx2} ${cy2} L ${ax} ${ay}`}
          stroke="#2e7cf6"
          strokeWidth="2"
          strokeDasharray="6 5"
          fill="none"
        />
      </g>
      <IsoBox x={-56} y={-56} z={6} w={32} d={32} h={16} faces={FACES_WHITE} delay={240} />
      <IsoBox x={28} y={-26} z={6} w={32} d={32} h={16} faces={FACES_WHITE} delay={320} />
      <IsoBox x={-24} y={28} z={6} w={32} d={32} h={16} faces={FACES_ACCENT} delay={400} />
    </IsoScene>
  );
}

/* Licensing and compliance: документ-плита проходит ворота, штамп-галочка */
export function IsoLicensing() {
  const [gx, gy] = iso(30, 6, 78);
  return (
    <IsoScene>
      <IsoBox x={-80} y={-40} w={160} d={80} h={8} faces={FACES_GRAY} delay={0} />
      {/* ворота: две стойки + перекладина */}
      <IsoBox x={-16} y={-38} z={8} w={12} d={12} h={64} faces={FACES_INK} delay={140} />
      <IsoBox x={-16} y={26} z={8} w={12} d={12} h={64} faces={FACES_INK} delay={200} />
      <IsoBox x={-16} y={-38} z={72} w={12} d={76} h={10} faces={FACES_INK} delay={280} />
      {/* документ-плита на пути через ворота */}
      <IsoBox x={-64} y={-16} z={8} w={44} d={32} h={6} faces={FACES_WHITE} delay={360} />
      <IsoBox x={16} y={-16} z={8} w={44} d={32} h={6} faces={FACES_WHITE} delay={440} />
      {/* штамп-галочка над прошедшим документом */}
      <g className="iso-part" style={{ transitionDelay: "520ms" }}>
        <circle cx={gx} cy={gy - 40} r="13" fill="#34c759" />
        <path
          d={`M ${gx - 6} ${gy - 40} l 4 5 l 8 -9`}
          stroke="#ffffff"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </IsoScene>
  );
}

/* Vendor selection: ряд блоков-кандидатов, выбранный приподнят и синий */
export function IsoVendors() {
  return (
    <IsoScene>
      <IsoBox x={-84} y={-42} w={168} d={84} h={8} faces={FACES_GRAY} delay={0} />
      <IsoBox x={-66} y={-20} z={8} w={30} d={30} h={22} faces={FACES_WHITE} delay={140} />
      <IsoBox x={-22} y={-20} z={8} w={30} d={30} h={22} faces={FACES_WHITE} delay={220} />
      <IsoBox x={22} y={-20} z={26} w={30} d={30} h={30} faces={FACES_ACCENT} delay={300} />
      <IsoBox x={66} y={-20} z={8} w={30} d={30} h={22} faces={FACES_WHITE} delay={380} />
    </IsoScene>
  );
}

/* Mobile apps: плита-смартфон, над ней парят виджет-плитки */
export function IsoMobile() {
  return (
    <IsoScene>
      <IsoBox x={-40} y={-64} w={80} d={128} h={10} faces={FACES_INK} delay={0} />
      <IsoBox x={-32} y={-56} z={10} w={64} d={112} h={3} faces={FACES_WHITE} delay={140} />
      <IsoBox x={-24} y={-40} z={40} w={30} d={30} h={8} faces={FACES_ACCENT} delay={280} />
      <IsoBox x={-2} y={2} z={56} w={26} d={26} h={8} faces={FACES_WHITE} delay={380} />
      <IsoBox x={-30} y={16} z={72} w={20} d={20} h={8} faces={FACES_WHITE} delay={460} />
    </IsoScene>
  );
}

/* Ongoing support: конвейер-лента со статус-шайбами, одна зелёная «ок» */
export function IsoSupport() {
  return (
    <IsoScene>
      <IsoBox x={-90} y={-24} w={180} d={48} h={12} faces={FACES_GRAY} delay={0} />
      <IsoBox x={-88} y={-22} z={12} w={176} d={44} h={3} faces={FACES_INK} delay={120} />
      <IsoBox x={-64} y={-12} z={15} w={26} d={26} h={10} faces={FACES_WHITE} delay={240} />
      <IsoBox x={-12} y={-12} z={15} w={26} d={26} h={10} faces={FACES_OK} delay={320} />
      <IsoBox x={40} y={-12} z={15} w={26} d={26} h={10} faces={FACES_WHITE} delay={400} />
    </IsoScene>
  );
}

/* Widget / White Label API (Capabilities): виджет-плита встраивается в чужую панель */
export function IsoWidgetEmbed() {
  return (
    <IsoScene>
      {/* чужая панель-хост с вырезом: рама из четырёх плит */}
      <IsoBox x={-80} y={-60} w={160} d={34} h={8} faces={FACES_WHITE} delay={0} />
      <IsoBox x={-80} y={26} w={160} d={34} h={8} faces={FACES_WHITE} delay={80} />
      <IsoBox x={-80} y={-26} w={44} d={52} h={8} faces={FACES_WHITE} delay={160} />
      <IsoBox x={36} y={-26} w={44} d={52} h={8} faces={FACES_WHITE} delay={240} />
      {/* виджет-плита опускается в вырез */}
      <IsoBox x={-30} y={-22} z={26} w={60} d={44} h={10} faces={FACES_ACCENT} delay={380} />
    </IsoScene>
  );
}
```

- [ ] **Step 2: Проверить типы**

Run: `npx tsc --noEmit` → PASS.

- [ ] **Step 3: Commit**

```bash
git add components/isometric/scenes.tsx
git commit -m "feat(v4): семь изометрических сцен услуг и виджета"
```

---

### Task 6: ServicesGrid на v4 — изометрическая инфографика

**Files:**
- Modify: `components/sections/services/ServicesGrid.tsx` (полная замена содержимого)

**Interfaces:**
- Consumes: `CardScene` (Задача 3), сцены `IsoImplementation`…`IsoSupport` (Задача 5), `.layer-v4` (Задача 1).
- Produces: секция `02: services` без импортов StatusChecklist/VendorCompare/OpsFeed/WalletFragment (компоненты и поля контента остаются в репо — их снимет План 2).

- [ ] **Step 1: Переписать `components/sections/services/ServicesGrid.tsx`**

```tsx
"use client";

// 02: services — слой v4 «светлый референс»: шесть серых карточек-сцен
// с изометрической инфографикой услуг (спека 2026-08-08 §5). Интерфейсные
// мини-мокапы заменены сценами; их снятие из репо — забота Плана 2.
// Glow Magic Bento в v4 отключён (референс: сцены плоские, без свечения).
import { servicesGrid } from "@/content/services";
import { BentoGrid, BentoCard } from "@/components/vendor/MagicBento";
import { CardScene } from "@/components/v4/CardScene";
import type { MicroTextureKind } from "@/components/v4/MicroTexture";
import {
  IsoImplementation,
  IsoArchitecture,
  IsoLicensing,
  IsoVendors,
  IsoMobile,
  IsoSupport,
} from "@/components/isometric/scenes";

type Cell = (typeof servicesGrid.cells)[number];

function cellByTitle(title: string): Cell {
  const cell = servicesGrid.cells.find((c) => c.title === title);
  if (!cell) throw new Error(`services cell not found: ${title}`);
  return cell;
}

// сцена и текстура каждой услуги (метафоры — спека §5)
const SCENES: { title: string; scene: React.ReactNode; texture: MicroTextureKind; span: string }[] = [
  { title: "Platform implementation", scene: <IsoImplementation />, texture: "grid", span: "" },
  { title: "Architecture consulting", scene: <IsoArchitecture />, texture: "grid", span: "md:col-span-2" },
  { title: "Licensing and compliance", scene: <IsoLicensing />, texture: "binary", span: "md:col-span-2" },
  { title: "Vendor selection", scene: <IsoVendors />, texture: "ms", span: "" },
  { title: "Mobile apps", scene: <IsoMobile />, texture: "amounts", span: "" },
  { title: "Ongoing support", scene: <IsoSupport />, texture: "lines", span: "md:col-span-2" },
];

export function ServicesGrid() {
  return (
    <section className="layer-v4 bg-bg">
      <div className="mx-auto max-w-[1200px] px-5 pb-28 md:px-12 md:pb-40">
        <p className="text-label text-pine-600">{servicesGrid.section.label}</p>
        <h2 className="text-h2 mt-6 max-w-[16ch]">{servicesGrid.section.title}</h2>

        <BentoGrid
          enableSpotlight={false}
          enableBorderGlow={false}
          className="mt-16 grid grid-cols-1 gap-7 md:grid-cols-3"
        >
          {SCENES.map(({ title, scene, texture, span }) => {
            const cell = cellByTitle(title);
            return (
              <div key={title} data-reveal className={span}>
                <BentoCard enableStars={false} className="h-full rounded-(--radius-xl)">
                  <CardScene title={cell.title} body={cell.body} illustration={scene} texture={texture} />
                </BentoCard>
              </div>
            );
          })}
        </BentoGrid>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Проверить типы и сборку**

Run: `npx tsc --noEmit` → PASS.
Run: `npm run build` → PASS.

- [ ] **Step 3: Скриншоты этапа**

Dev-сервер (`crel-dev`) запущен → `python scripts/shoot.py docs/review/v4`
Expected: `docs/review/v4/landing.png`. Передать снимок главному агенту; главный агент отправляет пользователю в чат (SendUserFile) с подписью «ServicesGrid: изометрика на серых сценах». Дополнительно приложить кроп секции (скриншот из браузерной панели по якорю секции), если полная страница мелкая.

- [ ] **Step 4: Commit**

```bash
git add components/sections/services/ServicesGrid.tsx docs/review/v4/
git commit -m "feat(v4): ServicesGrid — изометрическая инфографика услуг на серых сценах"
```

---

### Task 7: Capabilities на v4

**Files:**
- Modify: `components/sections/shared/Capabilities.tsx` (полная замена содержимого)

**Interfaces:**
- Consumes: `CardScene`, `MicroTextureKind`, `IsoWidgetEmbed`, `.layer-v4`; живые мокапы KycFlow/RampWidget/IbanAccount/CardDuo/SellerTerminal + MockupStage (без изменений — кожу даёт токен-каскад).
- Produces: секция `01: capabilities` — 6 серых сцен, спаны бенто 3+3 / 4+2 / 2+4 сохранены; `AssetWindow` и `gates.png` из секции удалены.

- [ ] **Step 1: Переписать `components/sections/shared/Capabilities.tsx`**

```tsx
"use client";

// 01: capabilities — слой v4 «светлый референс»: единые серые карточки-сцены
// (CardScene), живые мокапы сохраняют поведение и очередь MockupStage — кожу
// перекрашивает токен-каскад .layer-v4. Ячейка Widget/White Label API —
// изометрическая сцена вместо генеративного ассета (спека §7).
import { capabilities } from "@/content/platform";
import { BentoGrid, BentoCard } from "@/components/vendor/MagicBento";
import { MockupStage } from "@/components/mockups/MockupStage";
import { KycFlow } from "@/components/mockups/KycFlow";
import { RampWidget } from "@/components/mockups/RampWidget";
import { CardDuo } from "@/components/mockups/CardDuo";
import { SellerTerminal } from "@/components/mockups/SellerTerminal";
import { IbanAccount } from "@/components/mockups/IbanAccount";
import { CardScene } from "@/components/v4/CardScene";
import type { MicroTextureKind } from "@/components/v4/MicroTexture";
import { IsoWidgetEmbed } from "@/components/isometric/scenes";

export function Capabilities() {
  const cells = capabilities.cells;
  const byMockup = (id: string | null) => cells.find((c) => c.mockup === id)!;
  const kyc = byMockup("kyc");
  const ramp = byMockup("ramp");
  const iban = byMockup("iban");
  const cards = byMockup("cards");
  const terminal = byMockup("terminal");
  const widget = byMockup(null);

  // ячейка = сцена: мокап-иллюстрация + тематическая текстура (спека §6)
  const grid: { cell: typeof kyc; span: string; texture: MicroTextureKind; illustration: React.ReactNode }[] = [
    { cell: kyc, span: "md:col-span-3", texture: "binary", illustration: <MockupStage className="w-full max-w-[340px]"><KycFlow /></MockupStage> },
    { cell: ramp, span: "md:col-span-3", texture: "amounts", illustration: <MockupStage className="w-full max-w-[340px]"><RampWidget /></MockupStage> },
    { cell: iban, span: "md:col-span-4", texture: "iban", illustration: <MockupStage className="w-full max-w-[400px]"><IbanAccount /></MockupStage> },
    { cell: cards, span: "md:col-span-2", texture: "grid", illustration: <MockupStage className="w-full max-w-[300px]"><CardDuo /></MockupStage> },
    { cell: terminal, span: "md:col-span-2", texture: "amounts", illustration: <MockupStage className="w-full max-w-[300px]"><SellerTerminal /></MockupStage> },
    { cell: widget, span: "md:col-span-4", texture: "grid", illustration: <IsoWidgetEmbed /> },
  ];

  return (
    <section className="layer-v4 bg-bg">
      <div className="mx-auto max-w-[1200px] px-5 py-28 md:px-12 md:py-40">
        <p className="text-label text-pine-600">{capabilities.section.label}</p>
        <h2 className="text-h2 mt-6 max-w-[18ch]">{capabilities.section.title}</h2>

        <BentoGrid
          enableSpotlight={false}
          enableBorderGlow={false}
          className="mt-16 grid grid-cols-1 gap-7 md:grid-cols-6"
        >
          {grid.map(({ cell, span, texture, illustration }) => (
            <div key={cell.title} data-reveal className={span}>
              <BentoCard enableStars={false} className="h-full rounded-(--radius-xl)">
                <CardScene title={cell.title} body={cell.body} illustration={illustration} texture={texture} />
              </BentoCard>
            </div>
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Проверить типы и сборку**

Run: `npx tsc --noEmit` → PASS.
Run: `npm run build` → PASS.

- [ ] **Step 3: Скриншоты этапа**

`python scripts/shoot.py docs/review/v4` → передать главному агенту → отправка пользователю с подписью «Capabilities: серые сцены, мокапы в новой коже, изометрический виджет».

- [ ] **Step 4: Commit**

```bash
git add components/sections/shared/Capabilities.tsx docs/review/v4/
git commit -m "feat(v4): Capabilities — серые сцены CardScene, изометрический Widget"
```

---

### Task 8: UseCases на v4

**Files:**
- Modify: `components/sections/shared/UseCases.tsx`

**Interfaces:**
- Consumes: `MicroTexture` (Задача 3), `.layer-v4`. Скраб/табы/roving tabindex/GSAP — без изменений.
- Produces: одна серая сцена-плита для всех табов; отличие табов — мокап + текстура.

- [ ] **Step 1: Заменить константу `SCENES` и локальный `<style>`**

Удалить блок (строки 31–39):

```tsx
// Сцена = заливка-задник + подпись зоны текста. Полная смена вселенной на таб:
// signal → светлая bloom → halo → abyss → pine (чередование тёмное/светлое).
const SCENES = [
  { plate: "grad-signal", dark: false },
  { plate: "bg-bg-mist scene-bloom", dark: false },
  { plate: "grad-halo", dark: false },
  { plate: "grad-abyss", dark: true },
  { plate: "card-pine", dark: true },
] as const;
```

и вставить на его место:

```tsx
// v4: одна серая сцена на все табы (референс — «предмет на серой сцене»);
// состояние различают мокап и тематическая micro-texture, не заливка.
const TEXTURES: MicroTextureKind[] = ["amounts", "ms", "iban", "binary", "grid"];
```

Добавить к импортам файла:

```tsx
import { MicroTexture, type MicroTextureKind } from "@/components/v4/MicroTexture";
```

Удалить строку локального рецепта сцены-2 (строка 142):

```tsx
      <style>{`.scene-bloom { background: radial-gradient(70% 90% at 80% 0%, rgb(0 201 167 / 0.14), rgb(0 201 167 / 0) 65%), var(--color-bg-mist); }`}</style>
```

- [ ] **Step 2: Обновить корень секции и разметку сцены**

Заменить `<section className="bg-bg">` на `<section className="layer-v4 bg-bg">`.

Заменить чтение сцены (строка `const scene = SCENES[active % SCENES.length];`) на:

```tsx
  const texture = TEXTURES[active % TEXTURES.length];
```

Заменить контейнер сцены (блок с `ref={sceneRef}`):

```tsx
                <div
                  ref={sceneRef}
                  key={tab.id}
                  className="relative flex items-center justify-center overflow-hidden rounded-(--radius-2xl) bg-bg-mist p-8 md:p-12 h-[420px] md:h-[min(520px,60vh)]"
                >
                  <MicroTexture kind={texture} />
                  <div className="relative w-full max-w-[380px]">
                    <MockupStage key={tab.id}>
                      <Mockup />
                    </MockupStage>
                  </div>
                </div>
```

- [ ] **Step 3: Проверить типы и сборку**

Run: `npx tsc --noEmit` → PASS. Run: `npm run build` → PASS.
Проверить в превью: клик по каждому из 5 табов — сцена серая, мокап белый, активный таб тёмный с синим `_`.

- [ ] **Step 4: Скриншоты этапа**

`python scripts/shoot.py docs/review/v4` + кропы 2–3 табов из браузерной панели → передать главному агенту → отправка пользователю «UseCases: одна серая сцена, различие табов — мокап и текстура».

- [ ] **Step 5: Commit**

```bash
git add components/sections/shared/UseCases.tsx docs/review/v4/
git commit -m "feat(v4): UseCases — единая серая сцена вместо цветных плит"
```

---

### Task 9: Hero на v4

**Files:**
- Modify: `components/landing/Hero.tsx`

**Interfaces:**
- Consumes: `.layer-v4`. `useTypewriter`-контракт не трогаем: в JSX аргумента остаётся константа `{hero.restArg}` (узлом владеет typewriter через `textContent`).
- Produces: hero на белом фоне, курсор `_` синий (токен-каскад), CursorGrid в ghost-серебре (токен-каскад `--color-grid`), CTA без glow (токен-каскад).

- [ ] **Step 1: Сменить фон секции**

Заменить (строка 75):

```tsx
    <section className="bg-bloom relative isolate">
```

на:

```tsx
    // v4: нейтральный белый фон; зелёный bloom — атрибут слоя v3
    <section className="layer-v4 relative isolate bg-bg">
```

- [ ] **Step 2: Проверить, что больше правок не нужно**

Курсор `text-accent`, CTA-глоу `--glow-m`, сетка `--color-grid` — всё берётся из токенов и перекрашивается скоупом. Убедиться в превью: курсор `_` синий и мигает; линии CursorGrid светло-серые; hover CTA без зелёной тени.

- [ ] **Step 3: Проверить типы и сборку**

Run: `npx tsc --noEmit` → PASS. Run: `npm run build` → PASS.

- [ ] **Step 4: Скриншоты этапа**

`python scripts/shoot.py docs/review/v4` → передать главному агенту → отправка пользователю «Hero: белый фон, синий курсор, ghost-сетка. Открытый вопрос спеки §12: оставить CursorGrid или убрать — реши по снимку».

- [ ] **Step 5: Commit**

```bash
git add components/landing/Hero.tsx docs/review/v4/
git commit -m "feat(v4): Hero — белый фон, синий курсор, ghost-сетка"
```

---

### Task 10: Integration на v4 — светлая код-панель

**Files:**
- Modify: `components/mockups/CodeSnippet.tsx` (вариант light)
- Modify: `components/sections/platform/Integration.tsx`

**Interfaces:**
- Consumes: `.layer-v4`.
- Produces: `CodeSnippet({ lines, variant? })`, `variant: "terminal" | "light"` (default `"terminal"` — тёмное окно нигде больше не используется, но контракт обратно совместим).

- [ ] **Step 1: Вариант подсветки в `components/mockups/CodeSnippet.tsx`**

Заменить блок `TOKEN_CLASS` (строки 13–19):

```tsx
// терминальная схема на --ink: контрасты AA проверены на #111
const TOKEN_CLASS: Record<TokenClass, string> = {
  kw: "text-[#5fd1e8]", // cyan: ключевые слова
  str: "text-accent-bright", // зелёный: строки
  cmt: "text-ink-invert/55", // серый: комментарии
  plain: "text-ink-invert/85",
};
```

на:

```tsx
// две схемы: terminal — тёмное окно v3; light — белая панель v4
// (референс «Identify code vulnerabilities»: синие ключевые слова,
// красные строки, серые комментарии на белом)
const TOKEN_SCHEMES: Record<"terminal" | "light", Record<TokenClass, string>> = {
  terminal: {
    kw: "text-[#5fd1e8]", // cyan: ключевые слова
    str: "text-accent-bright", // зелёный: строки
    cmt: "text-ink-invert/55", // серый: комментарии
    plain: "text-ink-invert/85",
  },
  light: {
    kw: "text-[#2e7cf6]",
    str: "text-[#e5484d]",
    cmt: "text-[#6e6e73]",
    plain: "text-[#1d1d1f]",
  },
};
```

Заменить сигнатуру и использования:

```tsx
export function CodeSnippet({
  lines,
  variant = "terminal",
}: {
  lines: string[];
  variant?: "terminal" | "light";
}) {
```

и в JSX заменить `className={TOKEN_CLASS[tok.c]}` на `className={TOKEN_SCHEMES[variant][tok.c]}`, а курсор печати `text-accent-bright` оставить (в v4-скоупе он синий токен-каскадом).

- [ ] **Step 2: Светлая панель в `components/sections/platform/Integration.tsx`**

Заменить корень секции `<section className="bg-bg-alt">` на `<section className="layer-v4 bg-bg-alt">`
(внутри скоупа `--color-bg-alt` = #ececf1 — светло-серая полоса секции сохраняется).

Заменить тёмное код-окно (строки 43–46):

```tsx
            {/* тёмное код-окно — grad-abyss: контраст-якорь на светлой странице */}
            <div className="grad-abyss mt-8 rounded-(--radius-m) p-6 text-ink-invert">
              <CodeSnippet lines={integration.snippet} />
            </div>
```

на:

```tsx
            {/* v4: белая код-панель со стековой тенью (референсная сцена кода) */}
            <div className="mt-8 rounded-(--radius-m) bg-surface p-6 shadow-(--shadow-mockup)">
              <CodeSnippet lines={integration.snippet} variant="light" />
            </div>
```

Карточки развилки (`rounded-(--radius-xl) bg-bg`) остаются — внутри скоупа это белые карточки на светло-сером фоне секции, что соответствует референсу.

- [ ] **Step 3: Проверить типы и сборку**

Run: `npx tsc --noEmit` → PASS. Run: `npm run build` → PASS.
В превью: печать кода идёт по светлой панели, ключевые слова синие, строки красные.

- [ ] **Step 4: Скриншоты этапа**

`python scripts/shoot.py docs/review/v4` → передать главному агенту → отправка пользователю «Integration: белая код-панель, светлая подсветка».

- [ ] **Step 5: Commit**

```bash
git add components/mockups/CodeSnippet.tsx components/sections/platform/Integration.tsx docs/review/v4/
git commit -m "feat(v4): Integration — светлая код-панель, вариант подсветки light"
```

---

### Task 11: Документы + финальная приёмка

**Files:**
- Modify: `docs/design-direction.md` (новая глава в начало содержательной части)
- Create: `docs/review/v4/landing.png` (финальный, перезаписывается)

**Interfaces:**
- Consumes: всё выше.

- [ ] **Step 1: Глава v4 в `docs/design-direction.md`**

Добавить после преамбулы документа (перед главой «Слой v3»):

```markdown
## Слой v4: светлый референс (частичный, 2026-08-08)

Действует для секций: Hero, Capabilities (01), UseCases (03), Integration,
ServicesGrid (02). Остальные секции — на «Слое v3: необанкинг» ниже.
Источник токенов и правил: `docs/refs/todesktop/design.md` (+ DTCG-токены рядом).
Спека и решения: `docs/superpowers/specs/2026-08-08-light-reference-redesign-design.md`.

Ядро: «предмет на серой сцене» — плоская серая карточка #F5F5F7 без тени,
внутри белые панели/изометрические фигуры со стековой тенью
`0 8px 24px .06 + 0 2px 6px .04`; один бренд-акцент #2E7CF6; зелёный #34C759
только как статус; радиусы 8/14/26/pill; micro-texture цветом #D6D6DB.
Реализация — скоуп-класс `.layer-v4` в `app/globals.css` (каскадное
переопределение токенов v3 на корнях секций).

Следствие: из брифа на 15 генеративных ассетов серии 2 (bento Platform) и
3 (services) отменены — их заменили кодовые SVG-сцены; серия 1 (approach)
остаётся до решения по секции Approach.
```

- [ ] **Step 2: Полная приёмка**

Run: `npx tsc --noEmit` → PASS.
Run: `npm run build` → PASS, роут `/`.
Ручной проход в превью: (1) очередь мокапов жива — за раз играет один; (2) клавиатура по табам UseCases работает, фокус синий; (3) reduced-motion (эмуляция в DevTools браузерной панели) — изометрика в конечном состоянии, курсор не мигает.

- [ ] **Step 3: Финальные скриншоты**

`python scripts/shoot.py docs/review/v4` → главный агент отправляет пользователю финальный полный снимок + напоминание об открытых вопросах спеки §12 (CursorGrid, стыки с v3-секциями).

- [ ] **Step 4: Commit**

```bash
git add docs/design-direction.md docs/review/v4/
git commit -m "docs(v4): глава светлого референса в design-direction, финальные снимки"
```

---

## Self-review (выполнен при написании)

- **Покрытие спеки:** §3 токены → Task 1; §4 CardScene → Task 3; §5 изометрика → Tasks 4–6; §6 мокапы → токен-каскад Task 1 + Task 10 (CodeSnippet — единственный мокап с хардкод-цветами; остальные семь берут цвета/радиусы/тени только из токенов — проверено чтением RampWidget/MockupStage и grep по grad-/glow- в mockups/); §7 секции → Tasks 6–10; §8 скриншоты → Global Constraints + шаг в каждой визуальной задаче; §9 документы → Task 11; §10 приёмка → Task 11.
- **Плейсхолдеры:** нет; каждый код-шаг содержит полный код или точную пару «заменить → на».
- **Согласованность типов:** `MicroTextureKind` един (Task 3 → 6, 7, 8); имена сцен `Iso*` едины (Task 5 → 6, 7); `variant` CodeSnippet определён и использован в Task 10; пропсы `BentoGrid enableSpotlight/enableBorderGlow` и `BentoCard enableStars` существуют (проверено в vendored-исходнике, строки 532–597).
```
