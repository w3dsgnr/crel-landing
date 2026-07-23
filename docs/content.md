# Crel — контент лендинга (EN)

Структура зеркалит карту секций из `docs/landing-concept.md`. Лимиты соблюдены: заголовок
секции ≤ 8 слов, абзац ≤ 25 слов, чек-пункт ≤ 10 слов, подзаголовок hero ≤ 20 слов,
цитата ≤ 3 строк. CLI-лейблы — строчные, формат `NN: name`. Em-dash в UI-строках нет.
Формулировки регуляторики — только «we structure / we guide / we support»; всё, что требует
подтверждения заказчика, помечено `[VERIFY]` по месту + сводный реестр в конце.

Выбор заголовков: у каждой секции V1/V2 — выбрать один, второй удалить при вёрстке.

---

## ОБЩЕЕ

### Тумблер

- Слова: `services` · `platform`
- `aria-label`: `Choose direction: services or platform`

### Hero — позиционирование (объединяет оба направления)

Используется как смысловая рамка: meta description корня, og-описания, при желании
подстрочник. Три варианта:

- **A (рекомендуемый):** `Crel builds and runs digital asset infrastructure: a Swiss
  consulting practice and a platform, sharing one rail.`
- **B:** `One team, two ways in. Consulting that ships compliant digital asset products,
  and the platform they run on.`
- **C:** `Swiss digital asset engineering. Take the platform, or take the team that
  builds on it.`

### Hero — состояние services

- Команда (display, декоративная): `c:services_`
- H1-подзаголовок (18 слов): `Swiss consulting and engineering for digital asset products:
  architecture, licensing and implementation, from first audit to running rail.`
- CTA primary: `Talk to us_`

### Hero — состояние platform

- Команда: `c:platform_`
- H1-подзаголовок (16 слов): `The digital asset rail for financial applications: KYC,
  ramps, accounts, cards and payments behind one API.`
- CTA primary: `Talk to us_` · CTA secondary: `Read the docs` [VERIFY: доки публичны к запуску?]

### Лента логотипов

Без заголовка (логотипы говорят сами; никаких «trusted by»). Плейсхолдеры до списка
от Roman Strekha. Grayscale.

### Финальный CTA

- services — V1: `Tell us what you are building` · V2: `Start with the audit`
  Подстрока (12 слов): `First call is a working session on your stack, not a pitch.`
  Кнопка: `Talk to us_`
- platform — V1: `Put the rail under your product` · V2: `One integration away from live`
  Подстрока (11 слов): `Sandbox access and integration plan follow the first technical call.`
  [VERIFY: sandbox существует?]
  Кнопки: `Talk to us_` · `Read the docs`

### Футер

- Юр. строка: `Crel [AG], [street, postcode] Zurich, Switzerland. [Company / VAT
  registration numbers]` [VERIFY: вся строка — credentials от Roman]
- Комплаенс-полоса: `[Placeholder: certifications / registrations, pending confirmation]`
  [VERIFY]
- Контакт: `info@crel.ch`
- Копирайт: `© Crel 2026`
- Якоря шапки, services: `approach` · `services` · `licensing` · `contact`
- Якоря шапки, platform: `capabilities` · `integration` · `use cases` · `contact`

---

## SERVICES

### 01: approach

- H2 V1: `Architecture first, vendors second` (4)
- H2 V2: `We build what we would run` (6)

Три принципа (строки с хайрлайнами):

1. **Audit before architecture** (3) — `Every engagement starts with your flows, volumes
   and licensing reality, not a product pitch.` (14)
2. **Multi-provider by default** (3) — `One provider is a single point of failure. We
   design stacks that survive vendor churn.` (15)
3. **Compliance in the loop** (4) — `Regulatory scope is designed together with the build,
   not retrofitted after launch.` (12)

### 02: services

- H2 V1: `Six ways we take you live` (6)
- H2 V2: `From audit to running product` (5)

Bento, 6 ячеек:

1. **Platform implementation** — `Crel Platform deployment and integration with your
   existing back office. Custom modules where the standard ones stop.` (18)
2. **Architecture consulting** — `A multi-provider payments and custody stack designed
   from an audit of your business, not from a template.` (18)
3. **Licensing and compliance** — `MiCA CASP authorisation support, EMI partnerships,
   PCI DSS scoping, AML and Travel Rule programs. Detailed below.` (17)
4. **Vendor selection** — `Shortlists, pricing negotiations, coverage and SLA comparison,
   onboarding and due diligence. Run for you, decided with you.` (18)
5. **Mobile apps** — `Design and development of iOS and Android apps on top of your rail.` (13)
6. **Ongoing support** — `Monitoring, reconciliation, incident response and the rollout
   of new corridors and currencies.` (13)

### 03: licensing (sticky-stack, 4 карточки)

- H2 V1: `Compliance, structured before it blocks you` (6)
- H2 V2: `The regulatory track, run in parallel` (6)

Карточка 1 — **MiCA CASP and entity structuring**
`We structure the applicant entity in Switzerland or the EU and guide your CASP
authorisation, from policies to regulator dialogue.` (20)
Статус-строка: `track: casp authorisation` [VERIFY: показывать ли публично стадии клиентских
кейсов; формулировка не заявляет лицензию Crel]

Карточка 2 — **EMI partnerships**
`Fiat rails through partner EMIs: safeguarding accounts, IBAN issuing and card programs,
before you hold a licence of your own.` (21) [VERIFY: состав EMI-партнёрств]
Статус-строка: `track: emi partnership`

Карточка 3 — **PCI DSS scope**
`We scope your card data flows to the right SAQ level and keep sensitive data out of
your systems.` (19)
Статус-строка: `track: pci dss saq`

Карточка 4 — **AML, Travel Rule, KYC/KYB**
`Risk-based AML program, Travel Rule messaging and KYC and KYB flows that satisfy your
banking and regulatory counterparties.` (18)
Статус-строка: `track: aml program`

### 04: cases

- H2 V1: `Selected work` (2)
- H2 V2: `What we have shipped` (4)

Featured-кейс + 3 компактных: `[PLACEHOLDER: кейсы до материалов от Roman]`. Поля каждой
карточки: клиент (или `confidential`), одна строка задачи ≤ 12 слов, одна строка результата
≤ 12 слов. Без выдуманных метрик: цифры только из подтверждённых кейсов. [VERIFY: какие
кейсы можно называть публично]

---

## PLATFORM

### 01: capabilities

- H2 V1: `Everything a financial app needs to move money` (8)
- H2 V2: `One rail, six building blocks` (5)

Bento, 6 ячеек:

1. **QASIS KYC** — `Identity, liveness and AML screening in one flow. Run QASIS end to
   end or bring your own provider.` (18) [VERIFY: поддержка сторонних KYC-провайдеров]
2. **On/off-ramp** — `Buy and sell flows between fiat and digital assets, embedded in
   your product under your brand.` (16)
3. **Virtual accounts and dynamic IBANs** — `Named accounts with a dedicated IBAN per
   user. Incoming wires credit balances automatically.` (13) [VERIFY: банковские партнёры
   выпуска IBAN]
4. **Cards** — `Virtual and plastic cards with Apple Pay and Google Pay, issued with
   licensed partners.` (14) [VERIFY: карточный эмитент-партнёр; доступность Apple Pay /
   Google Pay по рынкам]
5. **Seller terminal** — `A phone becomes the payment terminal: tap to pay, QR codes and
   payment links.` (14) [VERIFY: tap to pay по платформам/рынкам]
6. **Widget and White Label API** — `A drop-in widget to ship this week, or white label
   APIs when the interface is yours.` (17)

### 02: integration

- H2 V1: `Ship the widget or own the stack` (7)
- H2 V2: `Two ways in, one rail` (5)

**Widget** — подводка (10 слов): `Hosted flow inside your product. Fastest route to a
live rail.`
Чек-лист: `Prebuilt compliant flow` (3) · `Your branding, themed via parameters` (5) ·
`Live in days, not quarters` (5)

**White Label API** — подводка (8 слов): `Your interface, our infrastructure. Full control
of UX.`
Чек-лист: `Full control over UI and UX` (6) · `Webhooks for every state change` (5) ·
`Sandbox from day one` (4) [VERIFY: sandbox]

Код-сниппет (тёмная вставка):

```js
const crel = new CrelClient({ apiKey });

const order = await crel.orders.create({
  amount: "1000.00",
  currency: "EUR",
  asset: "USDC",
  network: "ethereum",
});
// webhook: order.settled
```
[VERIFY: имена сущностей API до публикации доков]

### 03: use cases (5 табов)

- H2 V1: `Built for apps that move money` (6)
- H2 V2: `Five audiences, one integration` (4)

**wallets** — `Ramps that live inside your wallet` (6)
`Embed buy and sell without sending users away. Your brand and flow, our rail
underneath.` (15)
Чеки: `Widget or white label API` · `KYC reuse across sessions` [VERIFY] ·
`Payouts to bank accounts` · `One contract, many corridors` [VERIFY: модель контракта]

**exchanges** — `Direct deposits for your traders` (5)
`Verified traders fund accounts with fiat and withdraw back to their bank, without
leaving your exchange.` (16)
Чеки: `Existing KYC passed via QASIS` [VERIFY] · `Named IBAN per trader` ·
`One API for in and out` · `Settlement reporting for finance teams`

**neobanks** — `Stablecoin balances, familiar banking UX` (5)
`Every user gets an account with a dedicated IBAN. Wires settle as stablecoin balances,
ready to spend.` (18)
Чеки: `Dynamic IBAN per user` · `Card spend from balances` [VERIFY] ·
`Apple Pay and Google Pay` [VERIFY] · `Reconciliation via webhooks`

**remittances** — `Stablecoin rails under local corridors` (5)
`Sender pays local, recipient receives local fiat. Stablecoins bridge the middle,
invisible to both sides.` (16)
Чеки: `Local pay-in methods` · `Bank payouts on the receiving side` ·
`Me-to-me and third-party flows` [VERIFY: коридоры и типы получателей] ·
`Corridor compliance, guided by our team`

**payrolls** — `Salary payouts in stablecoin or fiat` (6)
`A dedicated IBAN per employee. Pay it like any bank account; each employee chooses
the payout asset.` (17)
Чеки: `IBAN per employee, issued via API` · `Employee KYC handled in the flow` ·
`Stablecoin or local fiat payout` · `Bulk payouts via API`

### 04: partners

- H2 V1: `Who we build with` (4)
- H2 V2: `Partners and integrations` (3)

Грид логотипов 4×2: `[PLACEHOLDER: логотипы от Roman]`.
Цитата (плейсхолдер, ≤ 3 строк): `[PLACEHOLDER quote, 2-3 lines]`
Атрибуция: `[Name], [Role], [Company]` — имя + роль + компания обязательно.

---

## МИКРОТЕКСТЫ МОКАПОВ

### Ramp-виджет (hero P0, секция 02)

| Элемент | Текст |
|---|---|
| Лейбл поля 1 | `You send` |
| Значение 1 / чип | `1 000.00` / `EUR` |
| Лейбл поля 2 | `You receive` |
| Значение 2 / чип | `912.44` / `USDC` |
| Строка курса | `1 USDC = 1.0960 EUR, fees included` |
| Кнопка | `Continue` |
| Подпись | `powered by crel` |

### QASIS KYC-флоу

| Элемент | Текст |
|---|---|
| Заголовок мокапа | `qasis check` |
| Шаг 1 / чип | `identity document` / `verified` |
| Шаг 2 / чип | `liveness` / `passed` |
| Шаг 3 / чип | `aml screening` / `clear` |
| Шаг 4 / чип | `decision` / `approved` |

### Карты (virtual + plastic)

| Элемент | Текст |
|---|---|
| Plastic: бренд на карте | `orbia` (образец white-label клиента, вымышленный) |
| Plastic: PAN / срок | `•••• 4821` / `09/29` |
| Virtual: тег | `virtual` |
| Virtual: PAN | `•••• 2210` |
| Чипы под картами | `Apple Pay` · `Google Pay` [VERIFY] |

### Seller terminal

| Элемент | Текст |
|---|---|
| Сумма | `240.00 CHF` |
| Кнопка | `Charge` |
| Статус после прогона | `paid` |
| Тег | `tap to pay` [VERIFY] |

### Virtual accounts / IBANs

| Элемент | Текст |
|---|---|
| Заголовок | `virtual accounts` |
| Подстрока | `auto-credit on incoming wires` |
| Строка 1: имя / IBAN / чип | `Nadia Keller` / `DE89 3704 0044 0532 0130 00` / `active` |
| Строка 2 (приглушена): имя / IBAN / чип | `Liam Osei` / `GB29 NWBK 6016 1331 9268 19` / `active` |

IBANы — стандартные тестовые образцы (не реальные счета). Имена вымышленные,
локально-правдоподобные.

### Мини-мокап статусов в ячейке лицензирования (S2)

| Элемент | Текст |
|---|---|
| Строки | `casp application` / `in review` · `aml program` / `drafted` |

[VERIFY: допустимо ли показывать стадии, даже обезличенные]

---

## РЕЕСТР [VERIFY] — на подтверждение заказчику

Регуляторное правило соблюдено: нигде нет «we are licensed / regulated / authorised»;
только structure / guide / support / partner. Проверить перед публикацией:

1. **Футер:** юр. форма (AG?), адрес, регистрационные номера, комплаенс-бейджи — ждём от Roman.
2. **EMI-партнёрства (S3, карточка 2):** состав и публичность партнёров.
3. **Статус-строки лицензионного трека (S3, S2-мини-мокап):** можно ли показывать стадии
   клиентских кейсов, даже обезличенно.
4. **Кейсы (S4):** какие проекты можно называть; никаких цифр без подтверждения.
5. **IBAN-выпуск (P1):** банковские/EMI-партнёры и юрисдикции покрытия.
6. **Карты (P1, мокап):** эмитент-партнёр; фактическая доступность Apple Pay и Google Pay
   по целевым рынкам (заявление «with Apple Pay and Google Pay» без рынка — маркетинговый
   риск).
7. **Seller terminal (P1, мокап):** tap to pay — платформы (iOS Tap to Pay требует
   отдельного одобрения Apple по странам) и рынки.
8. **QASIS (P1):** поддержка сторонних KYC-провайдеров («bring your own provider»).
9. **KYC reuse (P3 wallets/exchanges):** переиспользование сессий/верификаций — есть ли
   функционально.
10. **Sandbox (P2, финальный CTA platform):** существует ли публичный sandbox к запуску.
11. **«One contract, many corridors» (P3 wallets):** модель контрактования.
12. **Ремитансы (P3):** какие коридоры реально покрыты; me-to-me vs third-party.
13. **API-сниппет (P2):** имена сущностей (`orders.create`, `order.settled`) — согласовать
    с реальным API до публикации.
14. **«Read the docs» (hero/CTA platform):** публичность документации к запуску.
