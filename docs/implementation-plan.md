# Crel Landing — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (по решению
> заказчика). Шаги — чекбоксы `- [ ]`. После каждого инкремента — СТОП и проверка заказчиком
> в браузере; следующий инкремент не начинается без явного «дальше».

**Goal:** Полный двухсостоянческий лендинг Crel (/services + /platform) с фирменным
переключателем «Перепечатка» — демо для заказчика, сердце демо — переключатель.

**Architecture:** Next.js App Router, SSG обоих маршрутов (полный HTML каждого состояния);
клиентское переключение через `history.pushState` без перезагрузки; один клиентский
оркестратор владеет состоянием и таймлайном перехода. Один анимационный движок — GSAP
(+ ScrollTrigger) поверх Lenis; Motion не используется нигде (консолидация по решению
заказчика, отличие от landing-concept §5 — осознанное).

**Tech Stack:** React 18+ / Next.js (App Router, static export) · Tailwind v4
(`@tailwindcss/postcss`) · GSAP + ScrollTrigger · Lenis · next/font (Space Grotesk).
Вендорим (копируем в репо и правим, не зависимость): React Bits LogoLoop, CountUp.
ScrollStack — только референс пин-механики, в код не попадает.

## Global Constraints (действуют в каждой задаче)

- **Токены — единственный источник стиля.** Все значения из `design-direction.md §1`:
  цвета (`--bg #FFFFFF`, `--bg-alt #F5F5F7`, `--bg-deep #ECECEF`, `--surface #FCFCFD`,
  `--ink #111111`, `--ink-soft #6A6A70`), радиусы 2/4/8/12, тень мокапов
  `0 24px 64px rgba(17,17,17,.10)` (единственная тень в системе), motion-токены
  (`--t-char-fast 40ms`, `--t-blink 850ms step-start`, `--d-quick 200 / -base 400 / -page 700`,
  `--ease-out cubic-bezier(.16,1,.3,1)`, `--ease-swap cubic-bezier(.65,0,.35,1)`).
- **Правило design-taste на каждую секцию:** никаких дефолтных теней/радиусов/hover-паттернов
  «из коробки» (Tailwind-дефолты, вендорные стили LogoLoop/CountUp — вычищаются). Если у
  элемента нет решения в токенах — исполнитель НЕ берёт шаблонное, а останавливается и
  предлагает вариант в языке Crel заказчику.
- **Перформанс-бюджет:** анимируются только `transform`/`opacity`; 60fps на скролле и на
  «Перепечатке» (проверка DevTools Performance); никаких `window.addEventListener('scroll')`
  (только ScrollTrigger/IntersectionObserver/Lenis-хук); мокапы и их таймлайны
  lazy-инициализируются по IntersectionObserver; LCP = текст hero, SSG отдаёт полный текст
  команды, никакая анимация не блокирует первый рендер (шрифт `display: swap`, GSAP-код
  инициализируется после гидрации).
- **Контент:** из `content.md` как есть; заголовки — вариант V1 по умолчанию (V2 остаётся
  в комментарии, заказчик меняет точечно после вычитки). `[VERIFY]`-места переносятся в
  вёрстку как видимые плейсхолдеры в квадратных скобках.
- **Копи-правила:** ни одного em-dash в UI-строках; CLI-лейблы строчные `NN: name`; один
  живой (мигающий) курсор в вьюпорте; лейбл-система секций — ровно один лейбл на секцию.
- **A11y:** тумблер — radiogroup; `aria-live="polite"` анонс состояния;
  `prefers-reduced-motion` — ветка в каждой анимационной задаче (мгновенная замена);
  контраст `--ink-soft`/`--bg-alt` проверить фактически (WCAG AA).
- Git: репозиторий инициализируется в И1; коммит после каждой задачи.

## File Structure (карта всего проекта)

```
app/
  layout.tsx                  шрифт, глобальные токены (globals.css), <html lang="en">
  page.tsx                    «/» → redirect /services
  services/page.tsx           SSG: <Landing initial="services"> + metadata
  platform/page.tsx           SSG: <Landing initial="platform"> + metadata
components/landing/
  Landing.tsx                 'use client': состояние, pushState/popstate, Lenis-провайдер
  Header.tsx                  лого (статичный c:rel_), Toggle, якоря, CTA, caret-слот
  Toggle.tsx                  ось-двоеточие, курсор-прыжок, hover `_`, radiogroup
  Hero.tsx                    команда + h1 + CTA + правый слот состояния
  SectionRenderer.tsx         маппит реестр, вешает data-атрибуты каскада
components/sections/
  services/Approach.tsx ServicesGrid.tsx LicensingStack.tsx Cases.tsx
  platform/Capabilities.tsx Integration.tsx UseCases.tsx Partners.tsx
  shared/LogoBand.tsx FinalCta.tsx Footer.tsx
components/mockups/
  KycFlow.tsx RampWidget.tsx CardDuo.tsx SellerTerminal.tsx IbanAccount.tsx
  MockupStage.tsx             IO-очередь «один живой одновременно»
components/vendor/
  LogoLoop.tsx CountUp.tsx    вендоренные и перекрашенные React Bits
lib/
  useTypewriter.ts            контролируемая машина печати
  useSwitchOrchestrator.ts    полный таймлайн «Перепечатки»
  reveal.ts                   единая скролл-грамматика (ScrollTrigger.batch по data-reveal)
  lenis.ts                    Lenis ⇄ ScrollTrigger склейка, reduced-motion выключатель
config/sections.ts            реестр: state → SectionDef[]
content/
  services.ts platform.ts shared.ts   типизированные модули из content.md
  meta.ts                     title/description на состояние
styles/globals.css            @theme токены Tailwind v4, keyframes blink
```

Ключевые интерфейсы (имена фиксированы, менять нельзя — на них опираются соседние задачи):

- `type LandingState = 'services' | 'platform'`
- `config/sections.ts`: `type SectionDef = { id: string; label: string | null;
  Component: React.ComponentType }`, `export const registry: Record<LandingState, SectionDef[]>`
- `useTypewriter(ref, opts) → { retype(next: string): Promise<void>; skipTo(final: string): void;
  phase: 'idle'|'erasing'|'typing' }` — печатает только аргумент после `c:`, префикс не трогает
- `useSwitchOrchestrator() → { switchTo(next: LandingState): void }` — владеет history,
  скролл-сбросом, кареткой, каскадами, вызовами typewriter, скипом, reduced-motion веткой
- `MockupStage`: `{ play(): Promise<void>; reset(): void }` — контракт каждого мокапа

---

## И1 — Каркас

### Task 1.1: Скаффолд, токены, шрифт

**Files:** Create: весь скелет Next.js, `styles/globals.css`, `app/layout.tsx`, конфиги
(Tailwind v4 через `@tailwindcss/postcss`, `next.config` c `output: 'export'`).

- [ ] `git init` + Next.js скаффолд (TypeScript, App Router, без лишних примеров)
- [ ] Space Grotesk через `next/font` (700/500/400), `display: swap`
- [ ] Все токены design-direction §1 как CSS-переменные в `@theme`; keyframes `blink`
      (`step-start`, 850ms); типографическая шкала (display clamp 56→112 / H2 40–64 /
      card 24–28 / body 16–17 / label 12–13 + трекинги)
- [ ] Смоук-страница токенов не делаем (YAGNI) — проверка на реальных секциях
- [ ] Commit

### Task 1.2: Маршруты, реестр секций, контент-модули

**Files:** Create: `app/services/page.tsx`, `app/platform/page.tsx`, `app/page.tsx`,
`config/sections.ts`, `content/*.ts` (тексты из `content.md`, V1-заголовки, `[VERIFY]`
как строки-плейсхолдеры), `components/landing/SectionRenderer.tsx`.

- [ ] Контент-модули: типизированный перенос content.md (shared/services/platform + meta)
- [ ] Реестр: services → [Approach, ServicesGrid, LicensingStack, Cases] · platform →
      [Capabilities, Integration, UseCases, Partners]; на этом этапе все Component —
      заглушки: плоскость `--bg-alt`, CLI-лейбл `NN: name`, H2 из контента
- [ ] Обе страницы рендерят `<Landing initial>` + `generateMetadata` из `content/meta.ts`;
      `/` — redirect на `/services`
- [ ] Commit

### Task 1.3: Landing-оркестратор (без анимации), Lenis

**Files:** Create: `components/landing/Landing.tsx`, `Header.tsx` (лого + временный
текстовый тумблер + якоря), `lib/lenis.ts`.

- [ ] `Landing`: state из пропса; `switchTo`: `history.pushState` → мгновенная замена
      секций → `document.title` swap; `popstate` — тот же путь; скролл-сброс instant
      если `scrollY > innerHeight`
- [ ] Lenis: инициализация, `lenis.on('scroll', ScrollTrigger.update)`, gsap.ticker-связка;
      при `prefers-reduced-motion` Lenis не стартует (нативный скролл)
- [ ] Header sticky 64px, однострочный, фон прозрачный → `--bg` c хайрлайном после скролла
- [ ] Commit

**✅ Критерий готовности И1 (браузер):** `next build` статикой без ошибок; `/services` и
`/platform` открываются напрямую и показывают разные наборы секций-заглушек с CLI-лейблами
и типографикой Space Grotesk; клик по временному тумблеру мгновенно меняет контент и URL
без перезагрузки; back/forward браузера работают; title меняется; скролл мягкий (Lenis),
в reduced-motion — нативный. **СТОП — проверка заказчика.**

---

## И2 — Hero + тумблер + «Перепечатка» (сердце демо)

### Task 2.1: Тумблер

**Files:** Create: `components/landing/Toggle.tsx`; Modify: `Header.tsx`.

- [ ] Форма: рамка 1px `--line`, радиус `--r-m 4px`, два строчных слова, двоеточие-ось
      по центру (всегда `--ink`); активное слово `--ink` w500 + курсор `_`, неактивное
      `--ink-soft` w400; никакой скользящей пилюли
- [ ] Переключение: crossfade веса/цвета 200ms `--ease-swap`; курсор-нода перепрыгивает
      к активному слову; hover неактивного — `_` подставляется к слову
- [ ] A11y: radiogroup, стрелки/Space, фокус остаётся на тумблере, `aria-live` анонс
- [ ] Commit

### Task 2.2: Hero + useTypewriter

**Files:** Create: `components/landing/Hero.tsx`, `lib/useTypewriter.ts`.

- [ ] Hero-сетка 12: слева команда-display (`c:` + аргумент + `_`, `aria-hidden`) +
      смысловой `<h1>`-подзаголовок + CTA-ряд из контента; справа — слот состояния
      (в И2 пустой; для platform заполнится в И4)
- [ ] SSG: полный текст команды в HTML (LCP), гидрация ничего не перепечатывает
- [ ] `useTypewriter`: машина `idle|erasing|typing`, `retype()` (стирание 40ms/симв →
      набор 40ms/симв, `c:` неподвижен), `skipTo()` (мгновенная установка финальной
      строки, снятие таймеров); курсор: горит при работе, blink-класс в паузе
- [ ] Вход при загрузке: подзаголовок и CTA fade+translateY 400ms stagger 60ms (GSAP,
      после гидрации); курсор начинает blink; лого в шапке — статичный `_` без мигания
- [ ] Commit

### Task 2.3: useSwitchOrchestrator — покадровый таймлайн

**Files:** Create: `lib/useSwitchOrchestrator.ts`; Modify: `Landing.tsx`,
`SectionRenderer.tsx`, `Header.tsx` (caret-слот).

Реализуется таблица landing-concept §1.1 дословно:

- [ ] t=0: pushState, title, aria-live; скролл-сброс instant (правило «глубже hero»);
      каретка 140×2px `--ink` под шапкой: translate −140 → 100vw, 400ms `--ease-swap`
- [ ] Exit-каскад: только секции в вьюпорте, opacity→0 + y+12, 120ms, stagger 40ms
      сверху вниз (`--ease-swap`); остальные — мгновенная замена
- [ ] t=80: `typewriter.retype(newArg)` (320+320ms)
- [ ] t=280: enter-каскад первых 3 видимых секций (opacity 0→1, y −16→0, 400ms,
      stagger 60ms, `--ease-out`); hero-подзаголовок/CTA crossfade 200ms
- [ ] Скип «последний клик побеждает»: `gsap.killTweensOf` всего активного +
      `typewriter.skipTo` + мгновенный монтаж секций; фидбек остаётся только у тумблера;
      без очереди
- [ ] Reduced-motion ветка: без печати/каскадов/каретки — мгновенная замена + crossfade
      `<main>` 150ms; курсор статичен
- [ ] `ScrollTrigger.refresh()` после смены контента
- [ ] Commit

**✅ Критерий готовности И2 (браузер):** клик по тумблеру запускает полную «Перепечатку»:
двоеточие и `c` неподвижны, аргумент стирается и набирается посимвольно, каретка проезжает
под шапкой, секции уходят/приходят встречными каскадами; всё видимое читабельно ≤ 900ms
(замер Performance-записью); повторный клик мгновенно доводит до конечного состояния без
очереди; blink курсора — жёсткий (step-start), только в паузе; в эмуляции reduced-motion —
мгновенная замена без печати; back/forward проигрывают тот же переход; 60fps в записи
Performance. **СТОП — проверка заказчика.**

---

## И3 — Секции Services

### Task 3.1: Скролл-грамматика (общая для всех секций)

**Files:** Create: `lib/reveal.ts`.

- [ ] Единый инициализатор: элементы с `data-reveal` → `ScrollTrigger.batch`
      (opacity 0→1, y 24→0, 600ms `--ease-out`, stagger 60ms, once); реинициализация
      после переключения состояния; reduced-motion → элементы видимы сразу
- [ ] Commit

### Task 3.2: Approach + ServicesGrid

**Files:** Create: `components/sections/services/Approach.tsx`, `ServicesGrid.tsx`;
Modify: `config/sections.ts` (замена заглушек).

- [ ] Approach: вертикальный стек, H2 + 3 строки-принципа с хайрлайнами `--line`
      (не карточки), reveal-stagger по строкам
- [ ] ServicesGrid: bento 6 ячеек 2×3, гэп 24px, фон `--bg-alt`, радиус `--r-l 8px`,
      без теней; hover: y −2px 200ms; ячейка «Licensing» — мини-мокап статусов
      (2 строки из content.md, чипы), ячейка «Mobile apps» — фрагмент UI на `--surface`
      с фирменной тенью; тексты из `content/services.ts`
- [ ] Commit

### Task 3.3: LicensingStack (sticky-stack, pinned-момент Services)

**Files:** Create: `components/sections/services/LicensingStack.tsx`.

- [ ] 4 карточки из content.md (MiCA CASP + структурирование · EMI · PCI DSS · AML/Travel
      Rule/KYC-KYB) со статус-строками `track: …` — единственный CLI-акцент экрана
- [ ] Пин-механика по каноническому скелету (ScrollStack — только референс):
      `start: 'top top'`, pin, pinSpacing off, уходящая карточка scale→0.92 +
      opacity→0.55 scrub-ом по приходу следующей; cleanup при размонтировании
      (переключение состояния!) и `ScrollTrigger.refresh` после
- [ ] Commit

### Task 3.4: Cases

**Files:** Create: `components/sections/services/Cases.tsx`.

- [ ] Сетка 2fr/1fr (не повторяет bento-семью): featured + 3 компактных, поля-плейсхолдеры
      `[PLACEHOLDER…]` из content.md, reveal
- [ ] Commit

**✅ Критерий готовности И3 (браузер):** на `/services` все 4 секции с реальным контентом;
sticky-stack пинится ровно у верха вьюпорта, карточки стекуются со scrub-ом без прыжков;
после переключения platform→services стек работает заново (нет мёртвых ScrollTrigger);
reveal-грамматика единая; в reduced-motion всё видимо без анимаций; 60fps скролла через
секцию стека. **СТОП — проверка заказчика.**

---

## И4 — Секции Platform (мокапы, сниппет, табы)

### Task 4.1: MockupStage + CountUp (вендор)

**Files:** Create: `components/mockups/MockupStage.tsx`, `components/vendor/CountUp.tsx`.

- [ ] `MockupStage`: обёртка мокапа (подложка `--surface`, радиус `--r-xl 12px`, фирменная
      тень, bleed-крой краем ячейки); IO-очередь: глобальный менеджер пускает `play()`
      только одному мокапу одновременно, прогон один раз (once), reduced-motion → сразу
      конечное состояние
- [ ] CountUp: вендорим исходник React Bits, вычищаем дефолты: без овершута, 600–800ms
      `--ease-out`, принудительный `tabular-nums`, формат `1 000.00`
- [ ] Commit

### Task 4.2: Пять мокапов

**Files:** Create: `components/mockups/{KycFlow,RampWidget,CardDuo,SellerTerminal,IbanAccount}.tsx`.

Все микротексты — из content.md §«Микротексты мокапов», дословно. Контракт: `play()/reset()`.

- [ ] KycFlow: 4 строки-шага, чипы статусов включаются stagger-ом 300ms
- [ ] RampWidget: два поля с чипами валют, строка курса, кнопка; CountUp на `912.44`
- [ ] CardDuo: CSS-версия (plastic `--ink` + virtual контурная, внахлёст); hover верхней
      y −4px; БЕЗ 3D-tilt/шиммера; фото-ассет — вторая итерация, вне этого плана
- [ ] SellerTerminal: рамка телефона CSS, сумма CountUp 0→240.00, press-feedback кнопки
      (scale .98), статус `paid`
- [ ] IbanAccount: строка счёта, IBAN появляется stepped-группами по 4 симв. × 120ms
- [ ] Commit (можно по мокапу)

### Task 4.3: Capabilities + Integration

**Files:** Create: `components/sections/platform/Capabilities.tsx`, `Integration.tsx`;
Modify: `Hero.tsx` (правый слот platform = RampWidget), `config/sections.ts`.

- [ ] Capabilities: bento 6 ячеек (ряды 2+4, разная ширина), 4 ячейки с мокапами через
      MockupStage, 2 типографические; reveal + IO-очередь работают вместе
- [ ] Integration: развилка 2 колонки (Widget: мокап + 3 чека · API: тёмный сниппет
      `--ink` с кодом из content.md + 3 чека); строки сниппета появляются stagger 40ms
      (не typewriter); единственная тёмная вставка состояния
- [ ] Hero правый слот: RampWidget, прогон при загрузке один раз
- [ ] Commit

### Task 4.4: UseCases (табы) + Partners

**Files:** Create: `components/sections/platform/UseCases.tsx`, `Partners.tsx`.

- [ ] Табы 5 аудиторий: строчные лейблы, активный — underline-слайд (transform по
      измеренной позиции, GSAP 200ms `--ease-swap`); панель: crossfade + y8, 250ms;
      контент таба: заголовок + абзац + 4 чека + мокап справа (переиспользование §4.2
      с другим фокусом); клавиатура: стрелки по табам
- [ ] Partners: статичный грид логотипов-плейсхолдеров 4×2 + цитата-плейсхолдер
      (≤ 3 строк, атрибуция имя/роль/компания), reveal
- [ ] Commit

**✅ Критерий готовности И4 (браузер):** `/platform` полный; в hero живой RampWidget
(ticker один прогон); при скролле Capabilities мокапы оживают строго по одному
(проверка: два мокапа в вьюпорте — второй ждёт окончания первого); IBAN печатается
группами, терминал набирает сумму и «платит», KYC-статусы каскадом; табы переключаются
с underline-слайдом и crossfade-панелью, стрелки клавиатуры работают; сниппет читабелен,
строки появляются каскадом; переключение состояний посреди прогона мокапа не оставляет
битых таймлайнов (killTweens в cleanup). **СТОП — проверка заказчика.**

---

## И5 — Общие блоки

### Task 5.1: LogoBand (LogoLoop вендор)

**Files:** Create: `components/vendor/LogoLoop.tsx`, `components/sections/shared/LogoBand.tsx`.

- [ ] Вендорим LogoLoop, кастом: цикл ~40s linear, grayscale + opacity .6, hover — пауза
      + opacity 1, градиентные маски краёв удалены (резкий крой), gap 24px; логотипы —
      плейсхолдеры-плашки до материалов Roman; без заголовка; единственная marquee
- [ ] Commit

### Task 5.2: FinalCta + Footer

**Files:** Create: `components/sections/shared/FinalCta.tsx`, `Footer.tsx`;
Modify: `config/sections.ts` (общие блоки в оба состояния).

- [ ] FinalCta: тёмная плоскость `--ink`, инверсия, заголовок по состоянию из контента,
      кнопка `Talk to us_` (hover: `_` подставляется, 200ms); platform — плюс secondary
      `Read the docs`
- [ ] Footer: юр. строка и комплаенс-полоса как видимые `[VERIFY]`-плейсхолдеры из
      content.md, `info@crel.ch`, © Crel 2026, без анимаций
- [ ] Commit

**✅ Критерий готовности И5 (браузер):** оба состояния — полные страницы сверху донизу;
лента логотипов ползёт медленно, останавливается на hover, в reduced-motion статична;
CTA-блоки инвертированы и различаются текстом по состояниям; футер общий, переключение
его не трогает; `[VERIFY]`-плейсхолдеры видимы (осознанно, до данных заказчика).
**СТОП — проверка заказчика.**

---

## И6 — Мобильный проход + reduced-motion аудит + перформанс

### Task 6.1: Мобильная хореография (< 768px)

**Files:** Modify: все секции, `Hero.tsx`, `Toggle.tsx`, `LicensingStack.tsx`.

- [ ] Hero: clamp работает до 360px ширины, команда не переносится (при нехватке —
      уменьшение нижней границы clamp, не перенос)
- [ ] Тумблер: остаётся в шапке двумя словами; touch-цель ≥ 44px
- [ ] Bento → одна колонка; сетка кейсов 2fr/1fr → стек; табы → горизонтальный
      scroll-snap строки табов
- [ ] LicensingStack: pin отключается < md → простые карточки с reveal (пин на тач —
      источник дёрганья); «Перепечатка»: каскады те же, каретка та же
- [ ] Commit

### Task 6.2: prefers-reduced-motion — сквозной аудит

**Files:** Modify: точечно по результатам аудита.

- [ ] Чек-лист по всем поверхностям: печать/каскады/каретка (И2-ветка), reveal, sticky-stack,
      мокапы (конечное состояние сразу), LogoLoop (статичный ряд), Lenis (выключен),
      blink (курсор статичен) — эмуляция в DevTools + системная настройка
- [ ] Commit

### Task 6.3: Перформанс-финализация

**Files:** Modify: точечно.

- [ ] Lighthouse: LCP < 2.5s (LCP-элемент — hero-текст), CLS < 0.1 (шрифт swap +
      зарезервированные габариты мокапов), INP < 200ms
- [ ] Performance-запись: 60fps на «Перепечатке» и на скролле через sticky-stack и
      Capabilities (мид-девайс троттлинг 4×)
- [ ] Аудит: нет `will-change`-спама; ScrollTrigger-инстансы убиваются при переключении
      (счётчик `ScrollTrigger.getAll().length` стабилен после 10 переключений)
- [ ] Пре-флайт из landing-concept §8: один курсор · нет em-dash · один CTA-интент ·
      layout-семьи не повторяются · marquee одна · tabular-nums · контраст AA
- [ ] Commit

**✅ Критерий готовности И6 (браузер):** на 375px всё читабельно и работает, включая
переключатель; reduced-motion превращает сайт в статичный без потери контента;
Lighthouse-цели достигнуты; 10 переключений подряд не деградируют fps и не копят
ScrollTrigger-ы. **СТОП — финальная приёмка.**

---

## Self-review план-против-спеки

- Покрытие: все сцены landing-concept §2 и §7 имеют задачи (общий каркас — И1/И2/И5;
  Services S1–S5 — И3; Platform P0–P5 — И4; переход §1 — И2; reduced-motion §1.3 — И2+И6).
- Контент: каждый текст берётся из content.md; `[VERIFY]` — видимые плейсхолдеры (И2/И5).
- Флаги учтены: карта CSS-first (Task 4.2, фото — вне плана), React Bits только
  LogoLoop+CountUp вендором (Task 5.1/4.1), ScrollStack — референс (Task 3.3).
- Стек-отличие от landing-concept задокументировано в шапке (GSAP-only + Lenis).
- Открытое до утверждения: выбор V1/V2 заголовков (дефолт V1) и материалы Roman —
  не блокируют старт И1.
