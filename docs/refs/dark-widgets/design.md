---
version: anydesign-1
name: Dark iOS-widget mockups (4 refs)
source: 4 изображения из чата 2026-08-12 — tip-калькулятор, фитнес-тулбокс, sleep report, кофейный рецепт
captured_at: 2026-08-12
description: |
  Тёмные «виджеты-приборы» в духе нативного iOS: почти чёрные суперэллипс-карточки,
  глубина через ступени серого вместо теней, крупные цифры как главный герой,
  моноширинный шрифт для денег и метаданных. Хром монохромен — цвет разрешён только
  данным: зелёный для денег/успеха, градиенты для шкал. Управление — светлые пилюли
  на тёмном, выбранное состояние = инверсия.

colors:
  surface-base: "#0A0A0A"
  surface-raised: "#1C1C1E"
  surface-overlay: "#2C2C2E"
  action-light: "#F2F2F3"
  text-primary: "#FFFFFF"
  text-muted: "#8E8E93"
  text-on-light: "#111111"
  hairline: "rgba(255,255,255,0.10)"
  money-green: "#30D158"
  alert-red: "#FF453A"
  data-orange: "#FF9F0A"
  data-blue: "#409CFF"
  data-purple: "#BF5AF2"

typography:
  numeral-xl:
    fontFamily: "SF Pro Display / проектный sans"
    fontSize: 40px
    fontWeight: 600
    letterSpacing: -0.01em
  numeral-md:
    fontFamily: "SF Pro Display / проектный sans"
    fontSize: 26px
    fontWeight: 600
  label:
    fontFamily: "SF Pro Text / проектный sans"
    fontSize: 13px
    fontWeight: 500
  label-caps:
    fontFamily: "SF Pro Text / проектный sans"
    fontSize: 11px
    fontWeight: 600
    letterSpacing: 0.06em
  value-mono:
    fontFamily: "SF Mono / проектный mono"
    fontSize: 13px
    fontWeight: 500

spacing:
  base: 4px
  scale: [4, 8, 12, 16, 20, 24, 32, 40]

rounded:
  control: 14px
  row: 18px
  card: 36px
  pill: 9999px

components:
  widget-card:
    backgroundColor: "{colors.surface-base}"
    rounded: "{rounded.card}"
    padding: 20px
  control-row:
    backgroundColor: "{colors.surface-raised}"
    rounded: "{rounded.row}"
    padding: 14px 16px
  chip:
    backgroundColor: "{colors.surface-overlay}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pill}"
    padding: 8px 14px
  button-pill-light:
    backgroundColor: "{colors.action-light}"
    textColor: "{colors.text-on-light}"
    rounded: "{rounded.pill}"
    padding: 10px 18px
  metric-row:
    backgroundColor: "{colors.surface-raised}"
    typography: "{typography.value-mono}"
    rounded: "{rounded.row}"
  stat-trio:
    typography: "{typography.numeral-md}"
    textColor: "{colors.text-primary}"
  toast-status:
    backgroundColor: "{colors.surface-base}"
    rounded: "{rounded.pill}"
    padding: 14px 20px
  stat-bar:
    backgroundColor: "{colors.surface-overlay}"
    rounded: "{rounded.pill}"
---

# Design Analysis — Dark iOS-widget mockups (4 refs)

> Analysis generated with the `anydesign` skill.
> Date: 2026-08-12
> Analysis emphasis: reconstruction + design system (перерисовка мокапов Capabilities)

---

## Source

- **Source type**: local images (4 шт., из чата)
- **Path / URL**: референсы: (1) tip-калькулятор с тостом «Bill has been paid», (2) фитнес-тулбокс с тремя карточками, (3) sleep report с bottom-sheet, (4) кофейный рецепт V60
- **Capture method**: direct vision
- **Detected limitations**: статичные кадры — hover/анимации не видны; точные hex приближены глазом (тёмные значения ±1 ступень)

---

## TL;DR

Нативный iOS-виджет как жанр: суперэллипс-карточки почти чёрного, глубина ступенями серого без теней, огромные цифры-герои, mono для денег и метаданных. Хром строго монохромен — цвет получает только смысловая величина (зелёные деньги, градиентные шкалы). Actionable: для мокапов Crel это значит — тёмная карточка-«прибор», один цветовой акцент на карточку, значения в mono.

---

## 1. Visual identity

### 1.1 Surface description

**Personality**: тактильный, приборный, нативно-мобильный, сдержанно-премиальный, дата-центричный.

**Mood**: спокойная уверенность «устройства, которое работает»; ощущение физической кнопки.

**Detectable stylistic references**: iOS 17+ виджеты / Apple Health, дизайн Dynamic Island; близко к работам студий типа Gleb Kuznetsov (fintech-виджеты на Dribbble).

**Information density**: сбалансированная — одна главная величина на экран, вторичное мелко и приглушено.

**Implicit positioning**: конечный пользователь консьюмерского финтеха/health — не разработчик.

**Confidence**: ✅ high

### 1.2 Brand voice / Atmosphere

Эта эстетика верит, что интерфейс — это прибор, а не страница: у прибора есть корпус (почти чёрный суперэллипс), органы управления (пилюли, степперы) и индикация (крупные цифры, шкалы). Всё остальное — шум, и его нет. Поэтому глубина строится не тенями «бумажной» метафоры, а ступенями материала: `{colors.surface-base}` (#0A0A0A) — корпус, `{colors.surface-raised}` (#1C1C1E) — приподнятый узел, `{colors.surface-overlay}` (#2C2C2E) — орган управления. Свет здесь — признак интерактивности: чем светлее элемент, тем «нажимаемее» он выглядит, вплоть до полностью светлой пилюли главного действия.

Вторая вера — цифра важнее слова. Величина набрана в 3–4 раза крупнее своего ярлыка; ярлык существует только чтобы цифру можно было прочитать без контекста. Деньги и технические метаданные всегда в mono — это голос машины, которая не ошибается в знаках после запятой.

### 1.3 The "ONE brand thing"

- **The thing**: правило «цвет = данные». Весь хром монохромен; хроматический момент один на экран и принадлежит величине — `{colors.money-green}` (#30D158) у суммы чаевых и чека оплаты, градиентные шкалы у калорий/BMI/сна.
- **Why it carries the brand**: убери правило — получится обычный тёмный дашборд; цветная цифра на монохромном приборе и создаёт ощущение «живого показания».
- **How everything else supports it**: серые ступени поверхностей и белая типографика нейтральны, чтобы единственное цветное показание считывалось мгновенно.
- **Where it appears (and where it deliberately doesn't)**: только в значениях и шкалах данных; никогда — в кнопках, фонах, заголовках (CTA либо светлая пилюля, либо тёмный ряд).

*Confidence*: ✅ high — выдержано во всех четырёх кадрах.

---

## 2. Design System (tokens)

### 2.1 Colors

| Token | Hex | Role | Where it appears | Confidence |
|---|---|---|---|---|
| `surface-base` | `#0A0A0A` | корпус виджета | карточка-прибор | ✅ high |
| `surface-raised` | `#1C1C1E` | приподнятый узел | ряды Split/метрик, тёмные CTA | ✅ high |
| `surface-overlay` | `#2C2C2E` | орган управления | чипы %, степперы, треки шкал | ⚠️ medium |
| `action-light` | `#F2F2F3` | главное действие / выбранное | светлые пилюли, выбранный чип | ✅ high |
| `text-primary` | `#FFFFFF` | цифры, заголовки | везде | ✅ high |
| `text-muted` | `#8E8E93` | ярлыки, вторичное | подписи | ✅ high |
| `text-on-light` | `#111111` | текст на светлой пилюле | CTA, выбранный чип | ✅ high |
| `hairline` | `rgba(255,255,255,0.10)` | разделители | списки шагов, строки | ✅ high |
| `money-green` | `#30D158` | деньги/успех | +$8.00, кольцо чека | ✅ high |
| `alert-red` | `#FF453A` | негативный сегмент | Awake в sleep-барах | ⚠️ medium |
| `data-orange` | `#FF9F0A` | шкалы данных | калории, BMI | ⚠️ medium |
| `data-blue` | `#409CFF` | шкалы данных | REM | ⚠️ medium |
| `data-purple` | `#BF5AF2` | шкалы данных | Deep, timeline | ⚠️ medium |

### 2.2 Typography

- **Detected family**: SF Pro (Display/Text) + SF Mono *(confidence: ⚠️ medium — визуально; в Crel замещается проектными sans/mono)*

| Token | Size | Weight | Line-height | Use |
|---|---|---|---|---|
| `numeral-xl` | ~40px | 600 | 1.0 | главная величина («40», «34.4») |
| `numeral-md` | ~26px | 600 | 1.1 | stat-trio, «7hr 30min» |
| `label` | ~13px | 500 | 1.3 | подписи рядов |
| `label-caps` | ~11px | 600 caps | 1.2 | «+ EATEN», «YOUR BMI» |
| `value-mono` | ~13px | 500 | 1.3 | $24.00, «$8.00 · 20% · 2 Person split», тайм-коды |

**Notable tracking**: лёгкий минус на крупных цифрах; +0.06em на caps-ярлыках.

### 2.3 Spacing

- **Inferred base unit**: 4px
- **Observable multiples**: 8, 12, 16, 20, 24, 32, 40
- **Consistency**: ✅ high — ровный внутренний ритм 16–20px между узлами

### 2.4 Radii

- `control`: ~14px (мелкие узлы внутри рядов)
- `row`: ~18px (ряды-узлы, метрики)
- `card`: ~36px (корпус виджета; суперэллипс-ощущение)
- `pill`: 9999px (чипы, кнопки, тост, треки шкал)

### 2.5 Elevation system

| Level | Name | Treatment | Use |
|---|---|---|---|
| 0 | Корпус | `{colors.surface-base}` (#0A0A0A), без тени | карточка-прибор |
| 1 | Узел | `{colors.surface-raised}` (#1C1C1E) | ряды, тёмные CTA |
| 2 | Контрол | `{colors.surface-overlay}` (#2C2C2E) | чипы, степперы |
| 3 | Действие | `{colors.action-light}` (#F2F2F3) | светлая пилюля, выбранный чип |

Теней нет вовсе — **глубина только сменой тона поверхности** (surface-tone elevation). Это ядро системы, не упрощение.

#### Decorative depth (non-functional)

- Атмосферный цветной blur-градиент (красная «дымка» кофейного экрана) — фон одного экрана целиком, поверх него хайрлайны и белый текст; никогда не миниатюризируется.
- Мягкий вертикальный градиент внутри карточек тулбокса (#1a1a1a → чуть светлее) — едва заметное «стекло».

### 2.6 Borders

- Рабочих бордеров нет; разделители — `{colors.hairline}` (rgba 255,255,255,.10) 1px.
- Исключение: тонкая светлая обводка тоста и колец прогресса.

### 2.7 Accessibility quick-check

- `text-primary` на `surface-base`: ~19.8:1 — AAA ✅
- `text-muted` на `surface-raised`: ~4.6:1 — AA ✅ (на пределе — не уменьшать ярлыки ниже 11px)
- `money-green` на `surface-base`: ~9.5:1 — AA ✅ (для 13px mono достаточно)

---

## 3. Components Inventory

### 3.1 Generic components

#### widget-card
- Корпус: `{colors.surface-base}`, радиус `{rounded.card}` (36px), внутренний паддинг ~20px
- Confidence: ✅ high

#### control-row
- Ряд-узел «ярлык слева — контрол справа» на `{colors.surface-raised}`, радиус `{rounded.row}`
- Пример: «Split between — 2 +/-»
- Confidence: ✅ high

#### chip
- Пилюля-опция на `{colors.surface-overlay}`; выбранная — инверсия в `{colors.action-light}` + `{colors.text-on-light}`
- Confidence: ✅ high

#### button-pill-light
- Главное действие: светлая пилюля `{colors.action-light}`, тёмный текст; встречается и тёмный вариант (Pay now на `{colors.surface-raised}`) для «спокойного» действия
- Confidence: ✅ high

#### metric-row
- Строка «ярлык — значение», значение в `{typography.value-mono}`; денежное значение может нести `{colors.money-green}`
- Confidence: ✅ high

#### stat-bar
- Пилюльный трек `{colors.surface-overlay}` с цветным сегментом-заливкой (градиент или семантический цвет)
- Confidence: ✅ high

### 3.2 Signature components

#### stat-trio
- **What it is**: ряд из трёх крупных величин `{typography.numeral-md}` с мелкими muted-подписями под ними (12 Steps / 1:18 Ratio / 03:00 Duration)
- **Why it's signature**: главный герой — цифры без всякой рамки; узнаётся мгновенно
- **Composition**: только типографика + `{colors.text-muted}`; никакого хрома
- **Where it appears**: шапки экранов-отчётов
- **Confidence**: ✅ high

#### toast-status
- **What it is**: отдельная пилюля-квиток вне корпуса: иконка + заголовок + mono-метаданные «$8.00 · 20% · 2 Person split» + зелёное кольцо-чек
- **Why it's signature**: чек как физический артефакт операции, оторванный от прибора
- **Composition**: `{rounded.pill}`, `{typography.value-mono}`, `{colors.money-green}`
- **Where it appears**: под виджетом после завершения операции
- **Confidence**: ✅ high

---

## 4. Layout & Composition

### 4.1 Grid & containers

- Один столбец, ширина мобильного экрана; корпус занимает ~90% ширины
- Вертикальный ритм внутри корпуса 16–20px; иерархия — размером цифры и ступенью поверхности, не цветом

### 4.2 Composition patterns

- «Прибор + квиток»: карточка-виджет, под ней отсоединённый тост-статус
- Стек одинаковых карточек (тулбокс) с чередованием «иконка-заголовок-значение / кнопка»
- Bottom-sheet поверх timeline (sleep)
- Полноэкранная атмосфера + список с хайрлайнами (кофе)

### 4.3 Responsive behavior

#### Breakpoints
Только мобильные кадры — ❓ low; для Crel не критично: мокапы живут в карточках фиксированной max-width (300–400px), т.е. «мобильная» вёрстка и есть целевая.

#### Touch targets
Контролы ≥ 44px (степперы, пилюли) — ✅; чипы ~36px — чуть ниже нормы, в мокапах допустимо.

#### Collapsing strategy
Не наблюдалась (один вьюпорт).

### 4.4 Image behavior

- Фотографий нет; иконки — эмодзи (тулбокс) либо SF Symbols-стиль (лаконичные глифы); данные-визуализации рисованные (шкалы, кольца), не растровые.

---

## 5. Reconstruction Notes

### Suggested stack

**Tailwind (v4, как в проекте) + существующие токены `.layer-v4`** — новый тёмный скоуп для мокапов по образцу `.layer-v4-invert`; шрифты проектные (sans + mono уже есть).

### Quick wins

- Ступени поверхностей и радиусы покрывают 80% вида: 4 серых + светлая пилюля.
- metric-row / chip / control-row — тривиальная флекс-вёрстка.
- Mono уже в проекте (CodeSnippet, значения) — правило «деньги в mono» ложится сразу.

### Tricky bits

- Суперэллипс-ощущение корпуса: обычный border-radius 36px близок, но углы iOS мягче — жить с 36px, не имитировать squircle SVG-масками (дорого).
- Тонкая настройка контраста `text-muted` на ступенях серого.
- Градиентные шкалы: держать в 1–2 карточках максимум, иначе «цвет = данные» девальвируется.
- Ruler-шкала степпера (тики) — декоративная деталь, делать SVG/border-ами, не картинкой.

### Implicit states to define

- Hover (в референсах нет — мокапы Crel могут дать лёгкое поднятие ступени: overlay → чуть светлее)
- Активное нажатие пилюли; пустые/loading-состояния не нужны (мокапы статичны/зациклены)

### Confidence map

| Layer | Confidence | Why |
|---|---|---|
| Identity | ✅ high | 4 согласованных кадра |
| Colors | ⚠️ medium | тёмные ступени приближены глазом |
| Typography | ⚠️ medium | семейство инференс, роли ясны |
| Components | ✅ high | повторяются между кадрами |
| Layout | ⚠️ medium | только мобильный вьюпорт (для мокапов достаточно) |

---

## 6. Do's and Don'ts

### Do

- **Глубину делать только ступенями поверхностей** `surface-base → raised → overlay → action-light`; теней в мокапах нет вовсе.
- **Один цветовой акцент на карточку** — и только у данных: сумма в `{colors.money-green}`, шкала градиентом. Хром монохромен.
- **Деньги, проценты, тайм-коды, метаданные — всегда `{typography.value-mono}`**.
- **Главная величина в 3–4 раза крупнее ярлыка** (`{typography.numeral-xl}` против `{typography.label}`).
- **Интерактивность кодировать светлотой**: чем светлее, тем нажимаемее; главное действие/выбранный чип — `{colors.action-light}` с инверсией текста.
- **Корпус — крупный радиус `{rounded.card}` (36px)**, внутренние узлы `{rounded.row}` (18px), контролы — пилюли: три масштаба скруглений сосуществуют намеренно.

### Don't

- **Не давать цвет кнопкам, фонам и заголовкам** — цвет зарезервирован за значениями и шкалами.
- **Не использовать тени/glow для elevation** — только тон поверхности.
- **Не ставить больше одной цветной шкалы-градиента на карточку** (в тулбоксе их три — но это три РАЗНЫЕ карточки).
- **Не набирать величины текстовым sans** — цифры-герои либо крупный sans-semibold, либо mono для точных значений; смешивать в одной строке нельзя.
- **Не опускать ярлыки ниже 11px** — `text-muted` на `surface-raised` уже на пределе AA.
- **Не рисовать бордеры вокруг узлов** — границы только хайрлайном между строками списка.

---

## 7. Open Questions

- Точные hex тёмных ступеней (±1 ступень возможна) — при вёрстке сверить скриншотом рядом с референсом.
- Шрифт замещаем проектным — подтвердить, что вес 600 у крупных цифр не конфликтует с weight-потолком слоя v4 (в todesktop-анализе потолок 600 — совпадает).
- Эмодзи-иконки тулбокса: для Crel скорее глифы/микротекстуры проекта — нужен выбор при первом мокапе.

---

## 8. Companion files

- [x] `design-tokens.json` — DTCG-токены рядом
- [ ] `design-a11y.md` — ключевые пары посчитаны в §2.7, отдельный файл не генерировался
- [ ] `design-screenshot.png` — источник в чате, локальных копий нет

---

*End of analysis.*
