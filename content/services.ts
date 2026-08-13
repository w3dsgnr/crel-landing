// Тексты: docs/content.md §SERVICES — дословно, заголовки V1 (V2 в комментариях).
import type { SectionCopy } from "./types";

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
  cards: [
    // mark — водяной знак карточки-«документа» (гигантский призрачный
    // текст регуляции в углу белой карточки, LicensingStack v4)
    {
      title: "MiCA CASP and entity structuring",
      body: "We structure the applicant entity in Switzerland or the EU and guide your CASP authorisation, from policies to regulator dialogue.",
      track: "track: casp authorisation", // [VERIFY: публичность стадий]
      mark: "MiCA",
    },
    {
      title: "EMI partnerships",
      body: "Fiat rails through partner EMIs: safeguarding accounts, IBAN issuing and card programs, before you hold a licence of your own.",
      track: "track: emi partnership", // [VERIFY: состав EMI-партнёрств]
      mark: "EMI",
    },
    {
      title: "PCI DSS scope",
      body: "We scope your card data flows to the right SAQ level and keep sensitive data out of your systems.",
      track: "track: pci dss saq",
      mark: "PCI DSS",
    },
    {
      title: "AML, Travel Rule, KYC/KYB",
      body: "Risk-based AML program, Travel Rule messaging and KYC and KYB flows that satisfy your banking and regulatory counterparties.",
      track: "track: aml program",
      mark: "AML",
    },
  ],
};

export const cases = {
  section: {
    label: "04: cases",
    title: "Selected work", // V2: "What we have shipped"
  } satisfies SectionCopy,
  // [PLACEHOLDER: кейсы до материалов от Roman; цифры только из подтверждённых кейсов]
  featured: {
    client: "[Client]",
    task: "[One line: what we were asked to build]",
    result: "[One line: what went live]",
  },
  compact: [
    { client: "confidential", task: "[Task placeholder]", result: "[Result placeholder]" },
    { client: "[Client]", task: "[Task placeholder]", result: "[Result placeholder]" },
    { client: "[Client]", task: "[Task placeholder]", result: "[Result placeholder]" },
  ],
};
