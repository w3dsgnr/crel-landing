---
version: anydesign-1
name: Feature cards with gradient hover (approach reference)
source: два скриншота из чата 2026-08-13 (default-состояние + hover на карточке CMS)
captured_at: 2026-08-13
description: |
  Витринная сетка фич-карточек «спокойного каталога»: тёплые серые плиты с тонкими
  линейными иконками и текстом, прижатым к нижней кромке. Вся энергия системы спрятана
  в один жест — на hover карточка заливается вертикальным градиентом от белого верха
  к насыщенному оранжевому низу, и текст инвертируется в белый. Покой по умолчанию,
  цвет только как ответ на внимание.

colors:
  surface: "#FFFFFF"
  card: "#F5F4F1"
  text-primary: "#1A1A1A"
  text-muted: "#7A7A76"
  icon: "#1A1A1A"
  hover-ramp-top: "#F7F4EF"
  hover-ramp-mid: "#F5A96B"
  hover-ramp-deep: "#F2691D"
  hover-corner: "#E85D0F"
  text-on-hover: "#FFFFFF"
  crel-accent: "#2E7CF6"
  crel-accent-deep: "#2668D9"
  crel-card: "#F5F5F7"

typography:
  display:
    fontFamily: "geometric grotesque (Inter/Helvetica-класс)"
    fontSize: 56px
    fontWeight: 600
    letterSpacing: -0.02em
  subtitle:
    fontFamily: "geometric grotesque"
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.5
  card-label:
    fontFamily: "geometric grotesque"
    fontSize: 18px
    fontWeight: 400
  card-body:
    fontFamily: "geometric grotesque"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.45

spacing:
  base: 4px
  scale: [8, 16, 24, 32, 96]

rounded:
  card: 24px

components:
  section-header:
    textColor: "{colors.text-primary}"
    typography: "{typography.display}"
  feature-card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.card}"
    padding: 32px
  card-icon:
    color: "{colors.icon}"
---

# Design Analysis — Feature cards with gradient hover

> Analysis generated with the `anydesign` skill.
> Date: 2026-08-13
> Analysis emphasis: reconstruction (для редизайна секции Approach лендинга Crel)

---

## Source

- **Source type**: local image (2 скриншота из чата)
- **Path / URL**: переданы в диалоге; кадр 1 — default, кадр 2 — hover на карточке «CMS»
- **Capture method**: direct vision
- **Detected limitations**: только desktop-вьюпорт; виден один hover-кадр (одна карточка);
  правая карточка обрезана краем кадра — полная длина ряда неизвестна

---

## TL;DR

Спокойная витрина фич: тёплые серые карточки `{colors.card}` (#F5F4F1) с радиусом
`{rounded.card}` (24px), тонкой линейной иконкой сверху и текстовым блоком у нижней
кромки. Единственный энергетический жест — hover-заливка: вертикальный градиент от
почти белого верха `{colors.hover-ramp-top}` к насыщенному оранжевому низу
`{colors.hover-ramp-deep}`, при этом подпись и описание инвертируются в
`{colors.text-on-hover}`, а иконка остаётся тёмной. Для Crel жест переносится 1:1 со
сменой hue: оранжевая рампа → синяя `{colors.crel-accent}` / `{colors.crel-accent-deep}`.

---

## 1. Visual identity

### 1.1 Surface description

**Personality**: сдержанный, каталожный, инженерный, тёплый.

**Mood**: тихая уверенность — продукт не кричит, цвет выдаётся только в ответ на курсор.

**Detectable stylistic references**: Apple-класс маркетинговых карточек (нейтральные
плиты, текст внизу), линейная иконография в духе Lucide thin.

**Information density**: минималистичная — 4 смысловых блока на экран, огромный воздух
внутри карточки.

**Implicit positioning**: продуктовая платформа для строителей сайтов; говорит с
прагматиками, не с дизайнерами-эстетами.

**Confidence**: ✅ high

### 1.2 Brand voice / Atmosphere

Дизайн верит, что перечень возможностей сам по себе скучен — и не пытается это скрывать.
Карточки в покое почти пусты: иконка-метка сверху, две строки текста снизу, между ними —
намеренная пустота. Эта пустота и есть заявление: «нам не нужно заполнять плиту
скриншотами, чтобы вы поверили в фичу».

Вся эмоция делегирована взаимодействию. Градиент не существует в статике ни в одном
пикселе экрана — он появляется только под курсором, как подсветка товара, к которому
потянулся покупатель. Поэтому система может позволить себе тёплый ахромат во всём
остальном: цвет не размазан по странице, а сконденсирован в один отклик.

### 1.3 The "ONE brand thing"

- **The thing**: hover-заливка карточки — вертикальная градиентная рампа «белый верх →
  насыщенный цвет у нижней кромки», синхронная с инверсией текста в белый.
- **Why it carries the brand**: убрать её — останется анонимная сетка серых плит;
  именно отклик цветом на внимание отличает систему от любого шаблонного фичегрида.
- **How everything else supports it**: статика полностью ахроматична (серый + чёрный),
  иконки — тонкая линия без заливки, теней нет; ничто не конкурирует с рампой.
- **Where it appears (and where it deliberately doesn't)**: только на карточке под
  курсором, по одной за раз; заголовок, фон секции и иконки в жесте не участвуют.

*Confidence*: ✅ high

---

## 2. Design System (tokens)

### 2.1 Colors

| Token | Hex | Role | Where it appears | Confidence |
|---|---|---|---|---|
| `surface` | `#FFFFFF` | фон секции | вся сцена | ✅ high |
| `card` | `#F5F4F1` | плита карточки в покое | все карточки | ✅ high |
| `text-primary` | `#1A1A1A` | заголовок, описание карточки | H2, card-body | ✅ high |
| `text-muted` | `#7A7A76` | подзаголовок, лейбл карточки | subtitle, card-label | ✅ high |
| `hover-ramp-top` | `#F7F4EF` | верхний стоп hover-рампы | верх карточки под курсором | ⚠️ medium |
| `hover-ramp-mid` | `#F5A96B` | средний стоп | середина рампы | ⚠️ medium |
| `hover-ramp-deep` | `#F2691D` | нижний стоп | нижняя треть карточки | ⚠️ medium |
| `hover-corner` | `#E85D0F` | сгущение в нижнем-левом углу | угол текстового блока | ⚠️ medium |
| `text-on-hover` | `#FFFFFF` | текст на рампе | label + body под курсором | ✅ high |

Адаптация Crel (синий, зелёное/оранжевое не переносим — правило акцента):
`card` → `{colors.crel-card}` (#F5F5F7, = v4 `--color-bg-mist`), рампа →
`{colors.crel-accent}` (#2E7CF6) с сгущением `{colors.crel-accent-deep}` (#2668D9)
в углу текста — этот стоп уже аттестован в проекте: белый на #2668D9 = 5.17:1 (AA).

### 2.2 Typography

- **Detected family**: геометрический гротеск Inter/Helvetica-класса *(⚠️ medium —
  визуальная оценка; в Crel остаётся проектный гротеск var(--font-grotesk))*

**Observed scale:**

| Token | Size | Weight | Line-height | Use |
|---|---|---|---|---|
| `display` | ~56px | 600 | 1.1 | заголовок секции, с точкой на конце |
| `subtitle` | ~20px | 400 | 1.5 | серый подзаголовок под H2 |
| `card-label` | ~18px | 400 | 1.3 | имя фичи, muted |
| `card-body` | ~18px | 400 | 1.45 | описание, тёмное, 2 строки |

**Notable**: label и body — один кегль; иерархия внутри карточки строится только
цветом (muted vs primary), не размером.

### 2.3 Spacing

- Паддинг карточки ~32px по всем краям; текстовый блок прижат к низу (flex + mt-auto).
- Гэп между карточками ~24–28px; между заголовком и рядом ~96px.
- **Consistency**: ✅ high — шкала кратна 8.

### 2.4 Radii

- `card`: ~24px — единственный радиус сцены. В Crel → `--radius-xl` (26px, лестница v4).

### 2.5 Elevation system

| Level | Name | Treatment | Use |
|---|---|---|---|
| 0 | Flat | без тени и бордера | вся сцена, карточки в покое и в hover |

Система намеренно одноуровневая: глубина кодируется цветом рампы, не тенью.
❓ low: на hover-кадре карточка выглядит приподнятой на ~8–16px — возможен лёгкий
translateY-лифт (без тени).

### 2.6 Borders

Бордеров нет ни на одном элементе — карточка отделяется от белого фона только тоном
заливки `{colors.card}`.

### 2.7 Accessibility quick-check

- `text-primary` на `card`: ~15.9:1 — AAA ✅
- `text-muted` на `card`: ~4.6:1 — AA ✅
- `text-on-hover` на `hover-ramp-deep` (#F2691D): ~3.2:1 — ниже AA ❗ у референса;
  в адаптации Crel текстовая зона обязана сидеть на `crel-accent-deep` (#2668D9,
  5.17:1 AA) — сгущение угла под текстом это и обеспечивает.

---

## 3. Components Inventory

### 3.1 Generic components

#### section-header
- **Состав**: display-заголовок `{typography.display}` + серый подзаголовок
  `{typography.subtitle}` (~450px шириной)
- **Выравнивание**: в референсе левое; в адаптации Crel — по центру (решение задачи)
- **Confidence**: ✅ high

#### card-icon
- **Стиль**: линейная иконка ~26–28px, штрих ~1.8, цвет `{colors.icon}`, без заливки
- **Семантика**: буквальная метафора фичи (звёздочка ИИ, цилиндр БД, смартфон, лупа)
- **Позиция**: верхний-левый угол паддинга; на hover остаётся тёмной (верх рампы светлый)
- **Confidence**: ✅ high

### 3.2 Signature components

#### feature-card (карточка с градиент-ховером)
- **What it is**: плита `{colors.card}`, `{rounded.card}`, ~475×490px (почти квадрат);
  иконка сверху, пустая середина, label+body у нижней кромки
- **Why it's signature**: hover-рампа — «ONE brand thing» (§1.3); статичная карточка
  неотличима от шаблонной, весь характер в отклике
- **Composition**: hover = вертикальный linear-gradient
  (`{colors.hover-ramp-top}` 0% → `{colors.hover-ramp-mid}` ~55% →
  `{colors.hover-ramp-deep}` 100%) + радиальное сгущение `{colors.hover-corner}`
  в нижнем-левом углу, под текстом; label и body → `{colors.text-on-hover}`
- **Where it appears**: только в этой сетке, по одной активной карточке за раз
- **Confidence**: ✅ high (анатомия), ⚠️ medium (точные стопы рампы)

---

## 4. Layout & Composition

### 4.1 Grid & containers

- Контейнер ~1200–1300px; заголовочный блок и ряд карточек на одной левой оси (в
  референсе), вертикальный ритм заголовок→ряд ~96px.

### 4.2 Composition patterns

- H2 + подзаголовок, затем одиночный ряд карточек с горизонтальным переполнением
  (4-я карточка обрезана краем — карусель/overflow). Для Crel с тремя принципами
  переполнение не нужно: ровная сетка 3-up.

### 4.3 Responsive behavior

Only desktop material captured — брейкпоинты не наблюдаемы, ❓ low. Для Crel:
3-up (md+) → 1-up стопка (mobile), карточки сохраняют радиус и анатомию.

#### Touch targets

Карточка целиком — зона ≫44px; отдельных мелких контролов нет.

#### Collapsing strategy

Не наблюдаема; принимается стандарт проекта (grid-cols-1 → md:grid-cols-3).

### 4.4 Image behavior

- **Icons**: единственная графика сцены — линейные глифы (источник не определим:
  Lucide-класс или кастом). Фотографий и мокапов нет.

---

## 5. Reconstruction Notes

### Suggested stack

**Tailwind (проектный)** — сетка и типографика тривиальны; рампа — один CSS-класс
градиента + слой opacity.

### Quick wins

- Карточка в покое = уже существующие токены v4 (`--color-bg-mist`, `--radius-xl`).
- Инверсия текста — transition-colors на group-hover.

### Tricky bits

- background-градиент не анимируется напрямую — рампу класть отдельным absolute-слоем
  и вести его opacity 0→1 (transition var(--d-base) var(--ease-out-expo)).
- Сгущение угла обязано лежать под текстовым блоком: это не декор, а контраст (AA).
- Иконка НЕ инвертируется — верх рампы почти белый, тёмный штрих остаётся читаемым.

### Implicit states to define

- Фокус с клавиатуры: карточки Approach некликабельны — hover-жест не дублируется
  focus-состоянием, это допустимо.
- prefers-reduced-motion: transition opacity/color сохраняется (не движение),
  возможный translateY-лифт — глушить.

### Confidence map

| Layer | Confidence | Why |
|---|---|---|
| Identity | ✅ high | жест читается однозначно на двух кадрах |
| Colors | ⚠️ medium | стопы рампы сняты глазом с JPEG-градиента |
| Typography | ⚠️ medium | семейство визуально; кегли по пропорциям |
| Spacing | ✅ high | шкала кратна 8, паддинги очевидны |
| Components | ✅ high | обе карточки-состояния видны целиком |
| Layout | ❓ low | один вьюпорт, ряд обрезан кадром |

---

## 6. Do's and Don'ts

### Do

- **Держи статику полностью ахроматичной**: плита `{colors.card}`, тёмный текст, серый
  label — цвет существует только в hover-рампе.
- **Веди рампу строго вертикально, светлым верхом**: `{colors.hover-ramp-top}` у иконки,
  насыщение только к нижней кромке, где живёт текст.
- **Сгущай угол под текстом**: радиальный стоп `{colors.hover-corner}` (в Crel —
  `{colors.crel-accent-deep}`) обязан лежать под label+body — это контраст AA, не декор.
- **Инвертируй в белый только текст**: label и body → `{colors.text-on-hover}`,
  иконка остаётся `{colors.icon}`.
- **Строй иерархию карточки цветом при одном кегле**: label = muted, body = primary,
  размеры равны.
- **Прижимай текст к нижней кромке** (flex-col + mt-auto): пустая середина — часть
  анатомии, не недоделка.

### Don't

- **Не показывай градиент в статике** — ни на одной карточке до курсора; рампа
  существует только как отклик.
- **Не добавляй теней и бордеров**: единственный уровень глубины — тон заливки
  (§2.5, одноуровневая система).
- **Не инвертируй иконку на hover** — тёмный штрих на светлом верхе рампы и есть
  задуманный контраст.
- **Не переноси оранжевый в Crel**: жест адаптируется в акценте `{colors.crel-accent}`;
  чужой hue ломает правило единственного акцента v4.
- **Не заполняй середину карточки** скриншотами или списками — плотность референса
  минималистична намеренно.
- **Не зажигай несколько карточек сразу**: одна рампа на сцену, hover-состояние
  индивидуально.

---

## 7. Open Questions

- Есть ли лифт карточки на hover (translateY ~8–16px) — на кадре похоже, но это может
  быть параллакс скриншота; принято решение добавить лёгкий лифт с reduced-motion-гейтом.
- Длительность/easing hover-перехода не наблюдаемы в статике — берутся проектные
  `--d-base` / `--ease-out-expo`.
- Поведение ряда за 4-й карточкой (карусель? drag?) неизвестно — для Crel нерелевантно
  (3 карточки, ровная сетка).

---

## 8. Companion files

- [x] `design-tokens.json` — DTCG-токены референса + адаптационные значения Crel
- [ ] `design-a11y.md` — не генерируется отдельно: ключевые пары посчитаны в §2.7
- [ ] `design-screenshot.png` — источник остался в чате, файлов не передавалось

---

*End of analysis.*
