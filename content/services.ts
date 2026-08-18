// Тексты: docs/content.md §SERVICES — дословно, заголовки V1 (V2 в комментариях).
import type { CaseProject, SectionCopy } from "./types";

export const approach = {
  section: {
    label: "01: approach",
    title: "Architecture first, vendors second", // V2: "We build what we would run"
  } satisfies SectionCopy,
  principles: [
    {
      id: "audit",
      title: "Audit before architecture",
      body: "Every engagement starts with your flows, volumes and licensing reality, not a product pitch.",
    },
    {
      id: "multi-provider",
      title: "Multi-provider by default",
      body: "One provider is a single point of failure. We design stacks that survive vendor churn.",
    },
    {
      id: "compliance",
      title: "Compliance in the loop",
      body: "Regulatory scope is designed together with the build, not retrofitted after launch.",
    },
  ],
};

export const servicesGrid = {
  section: {
    label: "02: services",
    title: "Six ways we take you live", // V2: "From audit to running product"
  } satisfies SectionCopy,
  cells: [
    {
      title: "Platform implementation",
      body: "Crel Platform deployment and integration with your existing back office. Custom modules where the standard ones stop.",
      // чек-лист модулей деплоя (образец данных); «payouts» — кастомный модуль,
      // короткий лейбл: роль «custom» несёт пунктирный слот сцены
      miniMockup: [
        { label: "qasis kyc", chip: "enabled" },
        { label: "onramp / offramp", chip: "enabled" },
        { label: "payouts", chip: "in build" },
      ],
    },
    {
      title: "Architecture consulting",
      body: "A multi-provider payments and custody stack designed from an audit of your business, not from a template.",
    },
    {
      title: "Licensing and compliance",
      body: "MiCA CASP authorisation support, EMI partnerships, PCI DSS scoping, AML and Travel Rule programs. Detailed below.",
      // ячейка с мини-мокапом статусов (И3)
      miniMockup: [
        { label: "casp application", chip: "in review" },
        { label: "aml program", chip: "drafted" },
      ], // [VERIFY: допустимо ли показывать стадии, даже обезличенные]
    },
    {
      title: "Vendor selection",
      body: "Shortlists, pricing negotiations, coverage and SLA comparison, onboarding and due diligence. Run for you, decided with you.",
      // мини-сравнение провайдеров (образец данных, не реальные тарифы)
      miniCompare: [
        { name: "provider a", fee: "0.85%", selected: true },
        { name: "provider b", fee: "1.10%", selected: false },
        { name: "provider c", fee: "1.24%", selected: false },
      ],
    },
    {
      title: "Mobile apps",
      body: "Design and development of iOS and Android apps on top of your rail.",
      hasUiFragment: true, // ячейка с фрагментом UI (И3)
    },
    {
      title: "Ongoing support",
      body: "Monitoring, reconciliation, incident response and the rollout of new corridors and currencies.",
      // статус-лента (образец данных)
      statusFeed: [
        { label: "reconciliation", value: "2 431 / 2 431" },
        { label: "corridor chf → eur", value: "live" },
        { label: "incidents", value: "0 open" },
      ],
    },
  ],
};

export const licensing = {
  section: {
    label: "03: licensing",
    title: "Compliance, structured before it blocks you", // V2: "The regulatory track, run in parallel"
  } satisfies SectionCopy,
  // порядок массива = порядок тезисов в пинованной сцене LicensingStack
  cards: [
    // mark — ключ визуальной сцены тезиса (SCENES в LicensingStack): какой
    // предмет стоит в центре и какие ассеты вокруг него летают
    {
      title: "MiCA CASP and entity structuring",
      body: "We structure the applicant entity in Switzerland or the EU and guide your CASP authorisation, from policies to regulator dialogue.",
      track: "track: casp authorisation", // [VERIFY: публичность стадий]
      mark: "MiCA",
    },
    {
      title: "PCI DSS scope",
      body: "We scope your card data flows to the right SAQ level and keep sensitive data out of your systems.",
      track: "track: pci dss saq",
      mark: "PCI DSS",
    },
    {
      title: "EMI partnerships",
      body: "Fiat rails through partner EMIs: safeguarding accounts, IBAN issuing and card programs, before you hold a licence of your own.",
      track: "track: emi partnership", // [VERIFY: состав EMI-партнёрств]
      mark: "EMI",
    },
    {
      title: "AML, Travel Rule, KYC/KYB",
      body: "Risk-based AML program, Travel Rule messaging and KYC and KYB flows that satisfy your banking and regulatory counterparties.",
      track: "track: aml program",
      mark: "AML",
    },
  ],
};

// подтверждённые кейсы (тексты — бриф из чата 2026-08-13, вне docs/content.md):
// одна фактическая строка на проект, без цифр — номер строки выводится из
// позиции в массиве («01»…). Опциональный image (путь в /public) кладёт
// фото проекта в рельс ленты вместо глифа. url — сайт проекта, строка целиком
// кликабельна (проверены 2026-08-17: bitbeon.com, trientes.com, meinbit.io
// отвечают 200; teslapay.eu режет ботов 403, но домен подтверждён поиском)
const caseProjects: CaseProject[] = [
  {
    id: "bitbeon",
    name: "BitBeon",
    body: "Multi-currency wallet holding fiat and crypto in one balance — dedicated IBANs, SEPA and SWIFT transfers, virtual and plastic Mastercard.",
    url: "https://bitbeon.com",
    image: "/assets/works/bitbeon.png",
  },
  {
    id: "trientes",
    name: "Trientes",
    body: "Crypto and fiat wallet built around instant transfers and one-screen conversion between currencies.",
    url: "https://trientes.com",
    image: "/assets/works/trientes.png",
  },
  {
    id: "teslapay",
    name: "Tesla Pay",
    body: "Neobank with one account and up to ten virtual cards, plastic issuance and two-factor protection.",
    url: "https://www.teslapay.eu", // [VERIFY: teslapay.eu — тот ли это Tesla Pay, что в портфолио]
    image: "/assets/works/teslapay.png",
  },
  {
    // фактура — лендинг meinbit.io (2026-08-17): fiat + crypto в одном счёте,
    // IBAN, SEPA/SWIFT, до десяти Mastercard, VASP-регистрация в Польше
    id: "meinbit",
    name: "Meinbit",
    body: "Multi-currency account for Europe with fiat and crypto side by side — personal IBAN, SEPA and SWIFT payments, instant swaps and Mastercards funded from any balance.",
    url: "https://meinbit.io", // [VERIFY: meinbit.com в og:url сайта, но домен припаркован — рабочий хост .io]
    image: "/assets/works/meinbit.png",
  },
];

export const cases = {
  section: {
    label: "04: cases",
    title: "Selected work", // V2: "What we have shipped"
  } satisfies SectionCopy,
  projects: caseProjects,
};
