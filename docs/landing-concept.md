# Crel — концепция лендинга (вход для writing-plans)

Основа: `docs/design-direction.md` (токены, принципы, хореография «Перепечатка») —
рекомендации приняты как рабочие решения: дефолт `/` → services, общий hero-каркас,
сброс скролла при переключении.

⚠️ `docs/content.md` в репозитории отсутствует — все тексты в этом документе структурные
плейсхолдеры по карте секций из design-direction. Копирайт подставляется без изменения
композиции; лимиты: заголовок секции ≤ 8 слов, абзац ≤ 25 слов, чек-пункт ≤ 10 слов.

Дизайн-рид (design-taste-frontend): B2B-финтех-лендинг для технических и комплаенс-аудиторий,
швейцарский минимализм + терминальная интонация, кастомная эстетика (без готовой дизайн-системы).
Дайлы: `DESIGN_VARIANCE 6 / MOTION_INTENSITY 6 / VISUAL_DENSITY 3`.
Стек: Next.js (App Router, SSG) + Tailwind v4 + Motion (`motion/react`) + GSAP только
в изолированных листьях. Тема: light, залочена (Page Theme Lock); dark-mode не делаем —
бренд ч/б на белом, это осознанное решение, не упущение.

Осознанное отступление от anti-slop-правил taste-скилла (задокументировано, не случайность):
лейблы секций `01: approach` — это фирменная CLI-система из design-direction (двоеточие как
структурный знак), а не декоративные eyebrow-нумерации. Правило взамен: у секции ровно один
лейбл, других eyebrow нет нигде; лейбл строчный, без капса.

---

## 1. Покадровая спецификация «Перепечатки»

Сценарий: пользователь кликает тумблер (пример: services → platform). Бюджет до полной
читабельности: **≤ 900ms**. Все фазы — только `transform` и `opacity` (плюс замена текстовых
нод в typewriter). Термины — по animation-vocabulary.

### 1.1. Таймлайн (t в ms от клика)

| t | Фаза | Элемент | Анимация | Длительность | Easing |
|---|---|---|---|---|---|
| 0 | клик | тумблер | курсор `_` перепрыгивает к новому слову (мгновенная релокация DOM-ноды); вес/цвет слов — **crossfade** | 200 | `--ease-swap` |
| 0 | клик | history | `pushState('/platform')`, `document.title` swap, `aria-live="polite"` анонс | — | — |
| 0 | скролл | window | если `scrollY > высоты hero` — **мгновенный** сброс наверх (`behavior: 'instant'`), в первом кадре, до старта каскадов; внутри hero — не трогаем | 0 | — |
| 0 → 400 | каретка | линия под шапкой | сегмент 140×2px `--ink` проезжает **translate** от x = −140 до x = 100vw; один проход, без повтора | 400 | `--ease-swap` |
| 0 → 120+ | exit | секции контента | **исходящий stagger-каскад**: opacity 1→0, translateY 0→+12px; анимируются только секции в вьюпорте (остальные заменяются мгновенно) | 120 на секцию, stagger 40, сверху вниз | `--ease-swap` |
| 80 → 400 | erase | hero-команда | **backspace**: `services` стирается посимвольно, 8 симв. × 40ms (`--t-char-fast`); `c:` и двоеточие неподвижны (ось); курсор горит непрерывно (не мигает) | 320 | **stepped** (дискретно по символу) |
| 280 → 720 | enter | секции нового состояния | **встречный stagger-каскад**: opacity 0→1, translateY −16px→0; только первые 3 секции вьюпорта, остальные монтируются без анимации (невидимы) | 400 на секцию, stagger 60 | `--ease-out` |
| 280 → 480 | swap | hero-подзаголовок + CTA | **crossfade** + translateY −8px→0 | 200 | `--ease-out` |
| 400 → 720 | type | hero-команда | набор `platform`: 8 симв. × 40ms; курсор горит | 320 | stepped |
| 720 → 1570 | idle | курсор hero | один полный **blink**-цикл 850ms `step-start`, затем постоянное мигание (idle) | 850, loop | `step-start` |

Контрольные точки: hero дочитывается к 720ms; первая секция готова к ~680ms; всё видимое —
к ~880ms. ✅ бюджет.

### 1.2. Скип повторным кликом (interruptible animation)

Правило: **последний клик побеждает, очереди нет**.
- Все активные твины убиваются (Motion: `controls.stop()`; таймеры typewriter: clear).
- Текст команды мгновенно ставится в конечную строку нового целевого состояния (без допечатки).
- Секции мгновенно монтируются в конечном состоянии (opacity 1, y 0).
- Каретка исчезает (не доезжает).
- Запускается только анимация курсора тумблера (200ms) — клик всегда получает фидбек.
- `pushState` выполняется на каждый клик (история честная), но title обновляется один раз
  на устоявшееся состояние.

### 1.3. prefers-reduced-motion

- Typewriter выключен: команда меняется **мгновенной заменой** текста.
- Каскады выключены: контент меняется одним **crossfade** всего `<main>` (opacity, 150ms) —
  либо мгновенно, если и это мешает (тестируем).
- Каретка не рендерится. Курсор `_` статичен (не мигает): мигание — тоже motion.
- Скролл-reveal по странице: элементы видимы сразу (`initial={false}`).

### 1.4. Первичная загрузка (не переключение)

- SSR/SSG отдаёт полный текст команды `c:services_` — никакой допечатки после гидрации
  (LCP-текст не трогаем, CLS = 0). Мотивированность: печать — фидбек на действие
  пользователя; на загрузке действия не было.
- Оживает только: курсор hero начинает blink; подзаголовок и CTA — **fade in + translateY**
  (400ms, stagger 60ms); шапка — fade in 150ms.
- Логотип в шапке `c:rel_` — статичный, курсор НЕ мигает: правило «один живой курсор
  в вьюпорте» — он принадлежит hero. (Фирменный idle-цикл 210ms/символ живёт только
  на заглушке crel.ch; на лендинге команда hero и есть носитель бренда.)

---

## 2. Сценарная арка состояний

Общая грамматика скролла (одинаковая интенсивность в обоих состояниях):
- Базовый приём — **scroll reveal** (opacity 0→1 + translateY 24px→0, 600ms, `--ease-out`,
  `viewport={{ once: true, amount: 0.3 }}`), внутри групп — **stagger** 60ms.
- По одному **pinned-моменту** на состояние (равный вес хореографии): Services —
  sticky-stack лицензий, Platform — живые мокапы капабилити.
- Параллакс, bounce, глитч — запрещены (принцип 7). Marquee — максимум одна на состояние
  (лента логотипов под hero).

### 2.0. Общий каркас (оба состояния)

| Сцена | Композиция | Скролл/жизнь |
|---|---|---|
| Шапка | 64px, однострочная: лого `c:rel_` (статика) · тумблер `[ services : platform ]` · 3-4 якоря · CTA-кнопка | sticky; фон при скролле: прозрачный → `--bg` с хайрлайном (150ms fade) |
| Hero-каркас | grid 12: левая колонка (7) — команда-display + H1-подзаголовок + пара CTA; правая (5) — слот состояния | вход по 1.4; курсор blink — единственная idle-анимация |
| Лента логотипов | под hero, grayscale, LogoLoop-**marquee** (медленная, ~40s/цикл, пауза на hover) | единственная marquee страницы |
| Финальный CTA | тёмная плоскость `--ink`, инверсия: заголовок + одна кнопка (hover: `_` подставляется к лейблу) | scroll reveal |
| Футер | credentials (плейсхолдер), контакты, юр. полоса; лейбл-стиль `--ink-soft` | без анимации |

Hero-дисциплина (taste-скилл): максимум 3 текстовых элемента — команда (display, декоративная,
`aria-hidden` + смысловой `<h1>` рядом), подзаголовок ≤ 20 слов, ряд CTA (primary + secondary,
интенты не дублируем: primary «talk to us», secondary «read the docs» — только в platform).

### 2.1. Состояние `services`

| # | Сцена | Композиция | Скролл-поведение |
|---|---|---|---|
| S0 | Hero: `c:services_` | правый слот пуст — воздух (editorial-manifesto вариант каркаса); подзаголовок: швейцарский консалтинг/внедрение | вход 1.4 |
| S1 | `01: approach` | вертикальный стек: H2 + 3 принципа строками с хайрлайнами (не карточки) | scroll reveal, stagger 60ms по строкам |
| S2 | `02: services` | bento 6 ячеек (2×3): внедрение · архитектурный консалтинг · лицензирование · vendor selection · мобильная разработка · сопровождение. Ровно 6 позиций = 6 ячеек. Разнообразие фонов: ячейка лицензирования — мини-мокап статусов, ячейка mobile — фрагмент UI приложения, остальные — типографика на `--bg-alt` | reveal, stagger 60ms; hover ячейки: translateY −2px, 200ms |
| S3 | `03: licensing` — **pinned-момент Services** | sticky-stack (канонический GSAP-скелет, `start: "top top"`, pin, scale 0.92 + opacity 0.55 у уходящей): 4 карточки лицензий — MiCA CASP · EMI · PCI DSS SAQ · AML/Travel Rule. В карточке: название, 2 строки сути, статус-строка `status: in_progress` (единственный CLI-акцент экрана) | **sticky-stack** (pin + scrub) |
| S4 | `04: cases` | 2 колонки: featured-кейс + 3 компактных (плейсхолдеры до материалов Roman); НЕ повторяет bento-семью S2 — другая сетка (2fr 1fr) | scroll reveal |
| S5 | CTA + футер | общий каркас | — |

### 2.2. Состояние `platform`

| # | Сцена | Композиция | Скролл-поведение |
|---|---|---|---|
| P0 | Hero: `c:platform_` | правый слот — живой мокап Ramp-виджета (§3.2); подзаголовок-формула «digital asset rail…» | вход 1.4; ticker в мокапе стартует при загрузке, один прогон |
| P1 | `01: capabilities` — **pinned-вес Platform** | bento 6 ячеек (2 ряда: 2+4 с разной шириной): QASIS KYC · on/offRamp · virtual accounts + IBANs · карты · seller terminal · widget/API. В 4 из 6 — кодовые мокапы (§3); яркость живёт в мокапах, ячейки плоские | reveal, stagger; микроанимации мокапов — **по входу в вьюпорт, один прогон** (не loop): правило «один живой мокап одновременно» через IntersectionObserver-очередь |
| P2 | `02: integration` | 2 колонки-развилки: Widget (мокап виджета, 3 чек-пункта) vs White Label API (тёмный код-сниппет, 3 чек-пункта). Единственная тёмная вставка состояния | scroll reveal; сниппет: **stagger** строк кода по 40ms (появление, не typewriter — код не «печатается», он уже написан) |
| P3 | `03: use cases` | табы-строка: wallets · exchanges · neobanks · remittance · payroll (5 = из брифа). Панель: слева заголовок «боль→решение» + чек-лист 4 пунктов, справа — соответствующий мокап (переиспользуем §3 с другим фокус-стейтом). Смена таба: **crossfade + translateY 8px**, 250ms, `--ease-out` (панель), активный таб — underline-слайд (**layout animation**, `layoutId`) | панель без скролл-эффектов (интерактив сам по себе) |
| P4 | `04: partners` | статичный грид логотипов 4×2 + одна цитата ≤ 3 строк с атрибуцией (имя + роль + компания) | scroll reveal |
| P5 | CTA + футер | общий каркас; primary CTA `get api keys_`? — нет: интент тот же «связаться» → один лейбл на страницу, secondary — «read the docs» | — |

Симметрия насыщенности: Services = 1 pinned-момент + 2 мокапа в bento; Platform = 5 мокапов,
но без второго pinned. Ритм чередования layout-семей внутри каждого состояния: стек-строки →
bento → sticky-stack/развилка → 2fr-грид/табы → инверсия CTA — ни одна семья не повторяется.

---

## 3. UI-мокапы Platform (кодом, правило OnRamper)

Общие правила: настоящие мини-компоненты (не div-имитация скриншота, а работающая
вёрстка с реальными данными) на подложке `--surface`, радиус `--r-xl: 12px`, тень
`0 24px 64px rgba(17,17,17,0.10)`, обрезаются краем ячейки (bleed ≥ 12%). Числа —
`tabular-nums` всегда. Данные правдоподобно-неровные (не 100%, не 1234): суммы вроде
1 480.00, проценты вроде 97.4%. Микроанимация: **один прогон при входе в вьюпорт**,
без бесконечных loop (кроме курсора hero); одновременно живёт максимум один мокап.

| Мокап | Что показывает | Композиция | Жизнь внутри |
|---|---|---|---|
| **QASIS KYC-флоу** | статусную ленту проверки | вертикальный чек-лист 4 шагов: `identity`, `liveness`, `aml screening`, `decision`; у каждого — статус-чип; правый верх — бейдж `qasis` | шаги переключаются в `passed` каскадом (**stagger** 300ms), последний — `clear`; один прогон |
| **Ramp-виджет** (hero P0 + P2) | обмен fiat↔crypto | две строки-поля «you send / you receive» с валютными чипами, строка курса, кнопка | **number ticker** суммы получения (600ms, tabular-nums); курсовая строка — crossfade раз в прогон |
| **Карты (virtual + plastic)** | карточный продукт | две карты внахлёст со сдвигом (virtual — контурная на `--bg-alt`, plastic — залитая `--ink` с белой типографикой); PAN точками, лого-плейсхолдер, чип Apple Pay/Google Pay под картами | статика; на hover верхняя карта translateY −4px (200ms). Никакого 3D-tilt, никакого shimmer |
| **Seller terminal** | приём платежа на телефоне | рамка телефона (CSS, узкая), внутри: сумма крупно, нумпад-сетка, кнопка `charge`; под рамкой чип `tap to pay` | сумма набирается ticker-ом 0 → 240.00 (800ms), затем кнопка — **press feedback** (scale 0.98) и статус `paid`; один прогон |
| **Virtual accounts / IBANs** | именной счёт per user | строка-карточка счёта: имя держателя, IBAN моноширинной группировкой (4-4-4…), бейдж `active`, под ней вторая строка приглушённо | IBAN «выдаётся»: цифры появляются **stepped**-группами по 4 (5 × 120ms) — единственный typewriter-родственник вне hero, мотивирован смыслом (генерация счёта); один прогон |

Каждый мокап — самостоятельный компонент (`components/mockups/*`), переиспользуется в P1
(компакт), P3 (расширенный фокус) и S2 (карточка лицензирования использует статус-чипы KYC-мокапа).

---

## 4. Аудит React Bits

Каталог снят с репозитория DavidHDev/react-bits (jsrepo-модель: код копируется в проект и
правится — «кастомизация» = редактирование исходника, зависимость не тянется).

### 4.1. TextType — вердикт по hero-команде

API сверен с исходником (`src/content/TextAnimations/TextType/TextType.jsx`):
`typingSpeed=50, deletingSpeed=30, pauseDuration=2000, loop, cursorCharacter,
cursorBlinkDuration, onSentenceComplete, startOnVisible…`. Механика — автономный цикл
type → pause → erase по массиву строк. **Контролируемого режима нет**: снаружи нельзя
скомандовать «сотри и напечатай X» — а это ядро «Перепечатки» (переход управляется кликом,
пропускается повторным кликом, синхронизируется с каскадами). Плюс его blink — GSAP-осцилляция
opacity (плавная), а наш блинк — `step-start` (жёсткий). Плюс SSR-требование «полный текст
в первом кадре» противоречит его авто-старту.

**Вердикт: «Перепечатку» пишем вручную** — хук `useTypewriter` (контролируемая машина
состояний: `idle | erasing | typing`, командный API `retype(next)`, `skip()`, колбэки фаз)
+ оркестратор перехода. TextType не импортируем даже для первичного набора (по 1.4 на
загрузке печати нет вообще). Исходник TextType используем как донор-референс обработки
таймеров/cleanup, не как зависимость.

### 4.2. Shortlist: берём с кастомизацией

| Компонент | Сцена | Роль | Что кастомизируем |
|---|---|---|---|
| **LogoLoop** (Animations) | лента логотипов под hero (общий каркас) | единственная marquee | скорость до ~40s/цикл; grayscale + opacity 0.6, hover: пауза + opacity 1; выпилить градиентные маски-края (у нас резкий крой); gap по сетке 24px |
| **CountUp / Counter** (TextAnimations/Components) | ticker сумм в Ramp-виджете и seller terminal | number ticker | duration 600-800ms, `--ease-out`; принудительно `tabular-nums`; убрать дефолтный spring-овершут — числа не «прыгают», а докручиваются; формат сумм с пробелом-разделителем |
| **ScrollStack** (Components) | S3 sticky-stack лицензий | референс пин-механики | вероятнее — собственная реализация по каноническому GSAP-скелету taste-скилла (`start: "top top"`, pin, scale 0.92/opacity 0.55); ScrollStack берём только если его scroll-математика чище — решение на этапе плана; дефолтные тени/радиусы под наши токены в любом случае |

### 4.3. Рассмотрены и отклонены (осознанно)

- **DecryptedText, ScrambledText, GlitchText, LetterGlitch, FaultyTerminal, ASCIIText** —
  терминальные по вкусу, но это «хакерская» эстетика, прямо запрещённая дизайн-языком.
- **SplitText, BlurText, ScrollReveal, ScrollFloat, AnimatedContent, FadeContent** — наша
  reveal-грамматика проще (translateY + fade через Motion `whileInView`, 10 строк) и должна
  быть единой; чужие обёртки дадут зоопарк easing-ов.
- **MagicBento, SpotlightCard, GlareHover, StarBorder, ElectricBorder, GlassSurface,
  FluidGlass** — glow/glass/спотлайты запрещены (принципы 6-7).
- **Все Backgrounds** (Aurora, Silk, DotGrid, Particles…) — фоны у нас тональные плоскости,
  любой шейдерный фон разрушает швейцарскую базу.
- **PillNav, GooeyNav, Dock, BubbleMenu, StaggeredMenu, TargetCursor, Crosshair,
  BlobCursor…** — навигация у нас минимальная своя; кастомные курсоры запрещены taste-скиллом.

### 4.4. Пишем полностью вручную

1. **`useTypewriter`** — контролируемая машина печати (ядро «Перепечатки», §4.1).
2. **`useSwitchOrchestrator`** — таймлайн перехода целиком: pushState/popstate, сброс скролла,
   каретка, exit/enter-каскады, скип, reduced-motion ветка, title-swap, aria-live.
3. **Тумблер** — radiogroup двух слов с осью-двоеточием, прыжок курсора, hover-подстановка `_`.
4. **Каретка под шапкой** — 140×2px translate-sweep.
5. **Скролл-грамматика** — единый `<Reveal>`-примитив на Motion (`whileInView`, stagger).
6. **Sticky-stack лицензий** — GSAP ScrollTrigger по каноническому скелету (если не ScrollStack).
7. **Все 5 мокапов** (§3) + их IntersectionObserver-очередь «один живой одновременно».
8. **Табы use cases** — underline через `layoutId`, панель crossfade.

---

## 5. Структура проекта под два состояния

Архитектурная схема (без кода) для writing-plans:

```
app/
  services/page.tsx        SSG → <Landing initial="services">, generateMetadata(services)
  platform/page.tsx        SSG → <Landing initial="platform">, generateMetadata(platform)
  page.tsx                 «/» → redirect на /services (permanent; при static-export —
                           лёгкий клиентский redirect + canonical)
  layout.tsx               шрифт (next/font, Space Grotesk), токены, <html lang>
components/
  landing/
    Landing.tsx            'use client' — владелец состояния: state = 'services'|'platform',
                           pushState/popstate, вызов оркестратора, scroll reset
    Header.tsx             лого (статичный) + Toggle + якоря + CTA; caret-слот
    Toggle.tsx             radiogroup, ось-двоеточие, курсор-прыжок
    Hero.tsx               команда (useTypewriter) + h1 + CTA + правый слот состояния
    SectionRenderer.tsx    маппит реестр секций текущего состояния, вешает exit/enter-вариант
  sections/
    services/ Approach.tsx ServicesGrid.tsx LicensingStack.tsx Cases.tsx
    platform/ Capabilities.tsx Integration.tsx UseCases.tsx Partners.tsx
    shared/   LogoBand.tsx FinalCta.tsx Footer.tsx
  mockups/   KycFlow.tsx RampWidget.tsx CardDuo.tsx SellerTerminal.tsx IbanAccount.tsx
  motion/    useTypewriter.ts useSwitchOrchestrator.ts Reveal.tsx
config/
  sections.ts              реестр: { services: [Approach, ServicesGrid, …], platform: […] }
content/
  services.ts platform.ts  типизированные контент-модули (тексты — когда придёт content.md)
  meta.ts                  title/description/og на состояние
```

Ключевые решения:
- **URL — источник истины.** `Landing` инициализируется пропсом маршрута; клик по тумблеру:
  `history.pushState` (без RSC-навигации Next — контент обоих состояний уже в бандле,
  это два маленьких контент-модуля) → state → оркестратор. `popstate` — тот же путь.
  Прямой заход на любой URL — полный SSG-HTML нужного состояния.
- **Состояние переключателя** живёт только в `Landing` (React state) — глобальный стор не
  нужен: один владелец, дети получают state пропсами/контекстом.
- **Реестр секций** (`config/sections.ts`) — единственное место, знающее порядок сцен;
  SectionRenderer и оркестратор каскадов работают от него (индекс секции = задержка stagger).
- **Motion vs GSAP:** Motion — вся reveal/каскад-грамматика; GSAP — только внутри
  `LicensingStack` (изолированный лист с cleanup). В одном дереве не смешиваем.
- **Метаданные:** SSG-страницы имеют полные meta; при клиентском переключении обновляем
  `document.title` (og-теги для скраперов уже корректны на своих URL).
- OG-image: рендерим кодом (next/og) — локап `c:rel_` + слово состояния, без генерации картинок.

---

## 6. Ассеты: генерация vs вёрстка

По умолчанию всё визуальное — код: 5 мокапов (§3), карты, фоны-плоскости, OG-image. Кандидаты
на фотореализм проверены на прибавку:

1. **Пластиковая карта (ячейка «карты», P1)** — единственный физический продукт на сайте,
   потенциально выигрывает от материальности. Вердикт: **опционально, вторая итерация**.
   Сначала верстаем CSS-версию (§3); если ячейка выглядит бедно — генерируем один ассет.
   Промпт-бриф: «matte black payment card, flat lay on light gray background (#F5F5F7),
   straight-on top view, soft single diffused shadow, no logo, no embossed numbers visible,
   no reflections, no gradient lighting, studio product photography, muted, Swiss minimal».
   Критерий «вписывается»: матовая поверхность без бликов, одна мягкая тень (совпадает с
   тенью мокапов), фон пиксельно равен `--bg-alt`, ракурс строго фронтальный или 15°;
   любой глянец/переливы/боке = отклоняем.
2. **Сцена seller terminal (телефон на прилавке)** — **не нужно.** Продукт здесь — интерфейс,
   кодовый мокап телефона показывает его точнее; лайфстайл-фото стало бы единственной
   фотографией сайта и чужеродным телом в ахроматической системе.
3. **Фоновые текстуры/сцены** — **не нужно.** Принцип 6: плоскости разделяются тоном.

---

## 7. Сводная таблица «сцена → эффекты → реализация»

| Сцена | Эффекты (термины) | Реализация |
|---|---|---|
| Переход состояний | typewriter backspace/retype (stepped), crossfade тумблера, caret sweep (translate), встречные stagger-каскады (exit 120/40, enter 400/60), interruptible skip | **вручную**: `useTypewriter` + `useSwitchOrchestrator` (Motion variants + таймеры) |
| Шапка | sticky, fade фона по скроллу | вручную (CSS + Motion) |
| Тумблер | курсор-прыжок, crossfade веса, hover `_` | **вручную** |
| Hero (оба) | вход: fade + translateY, stagger 60; blink курсора step-start | вручную (Motion + CSS keyframes) |
| Лента логотипов | marquee (loop, linear) | **React Bits LogoLoop** — кастом: 40s, grayscale, без масок |
| S1 approach | scroll reveal, stagger строк | вручную: `<Reveal>` |
| S2 services bento | scroll reveal, stagger; hover-lift | вручную: `<Reveal>` + CSS |
| S3 licensing | sticky-stack (pin + scrub, scale/opacity уходящей) | GSAP ScrollTrigger по канону taste-скилла (ScrollStack — только как референс) |
| S4 cases | scroll reveal | `<Reveal>` |
| P0 hero-мокап | number ticker (tabular-nums) | **React Bits CountUp** — кастом: без овершута |
| P1 capabilities | reveal + очередь «один живой мокап»: stagger статусов KYC, ticker, stepped-IBAN | вручную (мокапы §3) + CountUp |
| P2 integration | reveal; stagger строк сниппета | вручную |
| P3 use cases | crossfade + translateY панели, underline layout animation (`layoutId`) | вручную (Motion) |
| P4 partners | scroll reveal; цитата ≤ 3 строк | `<Reveal>` |
| CTA (оба) | reveal; hover CTA: подстановка `_` | вручную |
| Reduced motion | все фазы → мгновенная замена / один crossfade 150ms | ветка в оркестраторе + `useReducedMotion` в `<Reveal>` |

---

## 8. Pre-flight фиксации (что проверяем перед сдачей вёрстки)

Из taste-скилла, применимое к нашему кейсу — переносится в план как чек:
один живой курсор в вьюпорте · ни одного em-dash в UI-копи (дефисы) · CTA-интент один на
страницу состояния · заголовки ≤ 2 строк, подзаголовок hero ≤ 20 слов · layout-семьи не
повторяются внутри состояния · marquee одна · табличные цифры во всех мокапах · WCAG AA
контраст (`--ink-soft` на `--bg-alt` — проверить фактически) · `prefers-reduced-motion`
для всего выше hover-уровня · только transform/opacity · `min-h-[100dvh]` для hero ·
никаких `window.addEventListener('scroll')` — только Motion `useScroll`/ScrollTrigger/IO.

Открытое (не блокирует writing-plans): тексты из будущего `content.md`; материалы Roman
(логотипы, credentials); опциональный фото-ассет карты (§6.1) — решение после первой вёрстки.
