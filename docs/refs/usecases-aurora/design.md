---
version: anydesign-1
name: UseCases aurora card
source: скриншот-референс секции Use Cases (чат, 2026-08-13)
captured_at: 2026-08-13
description: |
  Центрированная секция «03: use cases» слоя v4: заголовок и табы-чипсы по центру,
  под ними одна карточка на всю контентную сетку. Карточка — «аврора-сцена»:
  база белый→серый, поверх четыре размытых эллипса с линейными градиентами
  белый→цвет (жёлтый, коралловый, розовый, голубой). Внутри — центрированный
  контент кейса и студийный 3D-рендер, низ которого перекрыт рядом стеклянных чипов.

colors:
  surface-page: "#FFFFFF"
  card-base-from: "#FDFDFD"
  card-base-to: "#E9ECF1"
  ellipse-yellow: "#FFE066"
  ellipse-coral: "#FF8A5C"
  ellipse-rose: "#FF6B6B"
  ellipse-blue: "#8FB4F2"
  text-primary: "#1D1D1F"
  text-muted: "#6E6E73"
  chip-active-bg: "#1D1D1F"
  chip-active-text: "#FFFFFF"
  chip-idle-bg: "#F5F5F7"
  chip-idle-text: "#6E6E73"
  accent: "#2E7CF6"
  glass-chip-bg: "rgb(255 255 255 / 0.55)"
  glass-chip-border: "rgb(255 255 255 / 0.85)"

typography:
  section-display:
    fontFamily: "var(--font-grotesk), sans-serif"
    fontSize: "clamp(2.25rem, 4.5vw, 3.75rem)"
    fontWeight: 500
    letterSpacing: "-0.02em"
    lineHeight: 1.05
  case-title:
    fontFamily: "var(--font-grotesk), sans-serif"
    fontSize: "clamp(1.625rem, 2.8vw, 2.375rem)"
    fontWeight: 500
    letterSpacing: "-0.015em"
    lineHeight: 1.15
  case-body:
    fontFamily: "var(--font-grotesk), sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  chip:
    fontFamily: "var(--font-grotesk), sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
  glass-chip:
    fontFamily: "var(--font-grotesk), sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 500

spacing:
  base: 4px
  scale: [8, 12, 16, 24, 32, 48, 64, 96]

rounded:
  chip-pill: 999px
  glass-chip: 14px
  card: 40px

components:
  tab-chip:
    backgroundColor: "{colors.chip-idle-bg}"
    textColor: "{colors.chip-idle-text}"
    typography: "{typography.chip}"
    rounded: "{rounded.chip-pill}"
    padding: "8px 18px"
  aurora-card:
    backgroundColor: "linear {colors.card-base-from} -> {colors.card-base-to}"
    rounded: "{rounded.card}"
    padding: "64px 24px"
  glass-check-chip:
    backgroundColor: "{colors.glass-chip-bg}"
    border: "1px solid {colors.glass-chip-border}"
    textColor: "{colors.text-primary}"
    typography: "{typography.glass-chip}"
    rounded: "{rounded.glass-chip}"
    padding: "14px 24px"
---

# Design Analysis — UseCases aurora card

> Analysis generated with the `anydesign` skill.
> Date: 2026-08-13
> Analysis emphasis: reconstruction

---

## Source

- **Source type**: local image (скриншот в чате)
- **Path / URL**: `вложение чата — целевой макет секции Use Cases`
- **Capture method**: direct vision
- **Detected limitations**: только desktop-вьюпорт; hover/motion-состояния не видны

---

## TL;DR

Секция переходит от двухколоночной editorial-раскладки к центрированной «витрине»:
заголовок и табы по центру, весь кейс живёт внутри одной карточки шириной в контентную
сетку. Отличительный ход — фон карточки: нейтральный ramp `{colors.card-base-from}`
(#FDFDFD) → `{colors.card-base-to}` (#E9ECF1) с четырьмя размытыми эллипсами
белый→цвет, дающими эффект «нестандартного» аврора-градиента при почти белом верхе.

---

## 1. Visual identity

### 1.1 Surface description

**Personality**: студийный, витринный, мягко-оптимистичный, продуктовый.

**Mood**: спокойная уверенность с тёплым световым акцентом — «предмет в световом боксе».

**Detectable stylistic references**: Apple product-page центровка + пастельные aurora-фоны
современных финтех-лендингов (Mercury, Ramp promo-карточки).

**Information density**: минималистичная — один кейс на экран.

**Implicit positioning**: продуктовые команды финтеха; маркетинговая, не документационная подача.

**Confidence**: ✅ high

### 1.2 Brand voice / Atmosphere

Карточка ведёт себя как световой бокс фотостудии: свет (цвет) приходит из-за предмета,
а не поверх текста. Верхняя треть, где живёт типографика, остаётся почти белой — цвет
допускается только там, где он подсвечивает рендер и стеклянные чипы. Это переносит
v4-принцип «предмет на серой сцене» в следующую фазу: сцена перестала быть нейтральной,
но осталась подчинённой предмету.

Центровка всех уровней (заголовок секции → табы → заголовок кейса → предмет → чипы)
строит единую вертикальную ось: секция читается как слайд, а не как разворот. Взамен
двухколоночного editorial-ритма — витрина, где переключение таба меняет весь слайд целиком.

### 1.3 The "ONE brand thing"

- **The thing**: аврора-фон карточки — четыре эллипса с линейными градиентами белый→цвет
  (`{colors.ellipse-yellow}` #FFE066, `{colors.ellipse-coral}` #FF8A5C,
  `{colors.ellipse-rose}` #FF6B6B, `{colors.ellipse-blue}` #8FB4F2) на ramp-базе.
- **Why it carries the brand**: единственный многоцветный объект всего лендинга — без него
  карточка возвращается к обычной серой сцене v4.
- **How everything else supports it**: текст строго нейтральный (`{colors.text-primary}`
  #1D1D1F / `{colors.text-muted}` #6E6E73), чипы монохромные, предмет — ахромат с одним
  цветным элементом внутри.
- **Where it appears (and where it deliberately doesn't)**: только фон карточки use cases;
  не выносится на фон секции, не окрашивает текст и табы.

*Confidence*: ✅ high

---

## 2. Design System (tokens)

### 2.1 Colors

| Token | Hex | Role | Where it appears | Confidence |
|---|---|---|---|---|
| `surface-page` | `#FFFFFF` | фон секции | вокруг карточки | ✅ high |
| `card-base-from` | `#FDFDFD` | верх ramp-базы карточки | верхняя треть карточки | ⚠️ medium |
| `card-base-to` | `#E9ECF1` | низ ramp-базы карточки | нижняя кромка | ⚠️ medium |
| `ellipse-yellow` | `#FFE066` | эллипс, левый край | левая треть карточки | ⚠️ medium |
| `ellipse-coral` | `#FF8A5C` | эллипс, низ-лево | нижний левый сектор | ⚠️ medium |
| `ellipse-rose` | `#FF6B6B` | эллипс под предметом | центр-низ | ⚠️ medium |
| `ellipse-blue` | `#8FB4F2` | эллипс, правый низ | правый сектор | ⚠️ medium |
| `text-primary` | `#1D1D1F` | заголовки, текст чипов | вся типографика | ✅ high |
| `text-muted` | `#6E6E73` | лид кейса, неактивные табы | лид, табы | ✅ high |
| `chip-active-bg` | `#1D1D1F` | активный таб | ряд табов | ✅ high |
| `chip-active-text` | `#FFFFFF` | текст активного таба | ряд табов | ✅ high |
| `chip-idle-bg` | `#F5F5F7` | неактивный таб | ряд табов | ✅ high |
| `chip-idle-text` | `#6E6E73` | текст неактивного таба | ряд табов | ✅ high |
| `accent` | `#2E7CF6` | суффикс `_` в табах | табы | ✅ high (токен проекта) |
| `glass-chip-bg` | `rgb(255 255 255 / 0.55)` | стеклянные чек-чипы | низ карточки | ⚠️ medium |
| `glass-chip-border` | `rgb(255 255 255 / 0.85)` | кромка чек-чипов | низ карточки | ⚠️ medium |

### 2.2 Typography

- **Detected family**: геометрический гротеск — в проекте это `--font-grotesk`
  *(confidence: ✅ high — совпадает с действующей типографикой сайта)*

| Token | Size | Weight | Line-height | Use |
|---|---|---|---|---|
| `section-display` | clamp(2.25rem, 4.5vw, 3.75rem) | 500 | 1.05 | заголовок секции |
| `case-title` | clamp(1.625rem, 2.8vw, 2.375rem) | 500 | 1.15 | заголовок кейса в карточке |
| `case-body` | 1rem | 400 | 1.6 | лид кейса |
| `chip` | 0.875rem | 400 | 1 | табы (lowercase + `_`) |
| `glass-chip` | 0.9375rem | 500 | 1.2 | чек-чипы |

**Notable tracking**: −0.02em на display, −0.015em на заголовке кейса (действующая шкала v4).

### 2.3 Spacing

- **Inferred base unit**: 4px (Tailwind-шкала проекта)
- **Observable multiples**: 8, 12, 16, 24, 32, 48, 64, 96
- **Consistency**: ✅ high

### 2.4 Radii

- `chip-pill`: 999px (табы)
- `glass-chip`: 14px (чек-чипы — совпадает с `--radius-m` слоя v4)
- `card`: 40px (карточка-сцена; крупнее v4-лестницы 26px — витринный масштаб)

### 2.5 Elevation system

| Level | Name | Treatment | Use |
|---|---|---|---|
| 0 | Flat | без тени и рамки | секция, карточка |
| 1 | Glass | полупрозрачная заливка + белая кромка 1px, лёгкий blur | чек-чипы поверх рендера |

Система сознательно двухуровневая: глубину создаёт цвет фона, не тени —
продолжение правила v4 «glow-системы нет».

#### Decorative depth (non-functional)

Аврора-фон карточки (см. 1.3) — единственный декоративный слой глубины: эллипсы
с сильным blur лежат под контентом, верхняя треть остаётся белой, чтобы типографика
жила на нейтрали.

### 2.6 Borders

- В карточке и табах бордеров нет; единственная кромка — белая 1px у стеклянных чипов.

---

## 3. Components Inventory

### 3.1 Generic components

#### tab-chip
- **Variants**: idle (`{colors.chip-idle-bg}` #F5F5F7), active (`{colors.chip-active-bg}` #1D1D1F, текст белый)
- **Форма**: pill `{rounded.chip-pill}` (999px), padding ~8px 18px
- **Текст**: lowercase id + суффикс `_` цветом `{colors.accent}` (#2E7CF6)
- **Confidence**: ✅ high — совпадает с действующим чип-компонентом секции

#### aurora-card
- **Что это**: контейнер кейса шириной в контентную сетку, radius `{rounded.card}` (40px)
- **Фон**: ramp `{colors.card-base-from}`→`{colors.card-base-to}` + 4 эллипса (см. 3.2)
- **Внутренние отступы**: ~64px сверху, контент центрирован
- **Confidence**: ✅ high

#### glass-check-chip
- **Что это**: чек-строки кейса в виде стеклянных плашек `{rounded.glass-chip}` (14px)
- **Заливка**: `{colors.glass-chip-bg}`, кромка 1px `{colors.glass-chip-border}`, backdrop-blur
- **Ряд**: 4 штуки в строку на desktop, перекрывают нижнюю часть рендера
- **Confidence**: ⚠️ medium — прозрачность/блюр оценены на глаз

### 3.2 Signature components

#### Аврора-фон карточки
- **What it is**: ramp-база белый→серый + 4 абсолютных эллипса, каждый залит линейным
  градиентом белый→цвет (жёлтый / коралл / роза / голубой), сильный blur (~80–120px)
- **Why it's signature**: единственный многоцветный градиент на лендинге; создаёт эффект
  «нестандартного» градиента, недостижимого одной линейной заливкой
- **Composition**: цвет копится к нижним углам и за предметом; верхняя треть — белая
- **Where it appears**: только карточка use cases
- **Confidence**: ✅ high

---

## 4. Layout & Composition

### 4.1 Grid & containers

- Контентная сетка проекта: `max-w-[1200px]`, padding 20px mobile / 48px desktop — карточка
  занимает её целиком.
- Вертикальная ось: заголовок → табы (gap ~24px) → карточка (gap ~40px) → внутри карточки
  заголовок кейса → лид → рендер → чипы.

### 4.2 Composition patterns

- Центрированный stack всех уровней (слайд-подача).
- Предмет частично перекрыт рядом чипов — приём «ассет обрезан краем» из словаря проекта,
  здесь край — ряд чипов.

### 4.3 Responsive behavior

#### Breakpoints

| Name | Width | Key changes |
|---|---|---|
| Mobile | < 768px | табы — горизонтальный скролл или перенос по центру; чек-чипы 1–2 колонки; рендер ~280–320px |
| Desktop | ≥ 768px | чипы в один ряд, рендер ~420–520px |

❓ low — захвачен только desktop; мобильная раскладка спроектирована, не наблюдена.

#### Touch targets

- Табы ~36px высотой — ниже 44px; компенсировать padding'ом хит-зоны на mobile.
- Чек-чипы некликабельны — требования нет.

#### Collapsing strategy

- Ряд чек-чипов: 4-в-ряд → 2×2 → колонка.
- Карточка сохраняет radius 40px на всех вьюпортах (24–32px допустимо на mobile).

### 4.4 Image behavior

- **Product render**: студийный PNG (прозрачный корпус, синий элемент), центрирован,
  object-contain; масштаб — предмет занимает ~40% высоты карточки; низ перекрыт чипами.
- Иконок и фотографий нет.

---

## 5. Reconstruction Notes

### Suggested stack

**Tailwind v4 + токены `.layer-v4`** — секция уже в этом стеке; новые значения
(радиус 40px, цвета эллипсов) вводить локально в компоненте/через arbitrary values,
не расширяя глобальную v4-шкалу без решения.

### Quick wins

- Табы уже реализованы (roving tabindex, scrub) — меняется только выравнивание.
- Контент кейсов уже в `content/platform.ts`, рендеры в `public/assets/usecases/`.

### Tricky bits

- Эллипсы: blur ≥ 80px дорог — предпочесть radial/linear-gradient слои `background-image`
  вместо `filter: blur` на DOM-узлах.
- Перекрытие «рендер под чипами» — отрицательный margin/абсолютный ряд; на mobile
  перекрытие уменьшить или убрать.
- Смена контента таба должна анимироваться в духе действующей snappy-моторики (250–300ms).

### Implicit states to define

- Hover неактивного таба (взять действующий: `bg-ink/[0.09]`).
- Появление карточки при скролле (в духе соседних v4-секций).
- Reduced-motion: без анимаций смены.

### Confidence map

| Layer | Confidence | Why |
|---|---|---|
| Identity | ✅ high | ясный референс |
| Colors | ⚠️ medium | эллипсы оценены визуально с blur-смешением |
| Typography | ✅ high | действующая шкала проекта |
| Components | ✅ high | всё маппится на существующие |
| Layout | ⚠️ medium | mobile не наблюдён |

---

## 6. Do's and Don'ts

### Do

- **Держать верхнюю треть карточки белой.** Типографика живёт на нейтрали; цвет эллипсов
  копится к нижним углам и за предметом.
- **Красить аврору только через фоновые слои карточки.** Эллипсы — `background-image`
  или absolute-слои под контентом; текст и чипы остаются на `{colors.text-primary}`.
- **Сохранять действующий язык табов**: lowercase, суффикс `_` в `{colors.accent}`,
  активный — тёмная пилюля `{colors.chip-active-bg}`.
- **Стеклянные чипы держать читаемыми**: текст `{colors.text-primary}` на заливке
  ≥ 0.55 альфы; кромка 1px белая обязательна (правило «толщины стекла» v3.2).
- **Один аврора-объект на страницу.** Карточка use cases — единственный носитель
  многоцветного градиента; не тиражировать в соседние секции.

### Don't

- **Не вводить цвета эллипсов в UI-роли.** Жёлтый/коралл/роза/голубой — только фон;
  кнопок, текста и статусов этими цветами нет.
- **Не класть тени на карточку.** Глубина — цветом фона; тени в v4 только у панелей
  внутри сцен.
- **Не использовать `filter: blur()` на крупных DOM-узлах** — только градиентные
  фоновые слои (перф скролла).
- **Не окрашивать заголовок или лид** — цвет никогда не поверх текста.
- **Не ломать центровку на desktop** двухколоночными вставками — секция читается
  как один слайд.

---

## 7. Open Questions

- Точные цвета эллипсов: оценены под blur-смешением; после вёрстки сверить скриншотом
  с референсом и скорректировать стопы.
- Меняется ли палитра авроры при переключении таба (референс показывает один кадр) —
  принято решение: статичная, до обратной связи.
- Сохраняется ли scroll-scrub (pinned) режим desktop — в референсе не считывается;
  по умолчанию сохраняем действующую механику табов.

---

## 8. Companion files

- [x] `design-tokens.json` — DTCG-токены рядом с этим файлом
- [ ] `design-a11y.md` — не генерируется: текстовые пары совпадают с уже проверенной
  шкалой v4 (#1D1D1F на белом), новых текст/фон-пар нет
- [ ] `design-screenshot.png` — источник остаётся вложением чата
