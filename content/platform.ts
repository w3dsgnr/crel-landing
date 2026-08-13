// Тексты: docs/content.md §PLATFORM и §МИКРОТЕКСТЫ МОКАПОВ — дословно, заголовки V1.
import type { SectionCopy } from "./types";

export const capabilities = {
  section: {
    label: "01: capabilities",
    title: "Everything a financial app needs to move money", // V2: "One rail, six building blocks"
    sub: "Compliance, accounts, cards and payouts — six blocks that ship through one integration and read to your users as one product.", // [VERIFY: тезис сгенерирован 2026-08-12, вычитка заказчиком]
  } satisfies SectionCopy,
  cells: [
    {
      title: "QASIS KYC",
      body: "Identity, liveness and AML screening in one flow. Run QASIS end to end or bring your own provider.", // [VERIFY: сторонние KYC-провайдеры]
      mockup: "kyc" as const,
    },
    {
      title: "On/off-ramp",
      body: "Buy and sell flows between fiat and digital assets, embedded in your product under your brand.",
      mockup: "ramp" as const,
    },
    {
      title: "Virtual accounts and dynamic IBANs",
      body: "Named accounts with a dedicated IBAN per user. Incoming wires credit balances automatically.", // [VERIFY: банковские партнёры выпуска IBAN]
      mockup: "iban" as const,
    },
    {
      title: "Cards",
      body: "Virtual and plastic cards with Apple Pay and Google Pay, issued with licensed partners.", // [VERIFY: эмитент; Apple/Google Pay по рынкам]
      mockup: "cards" as const,
    },
    {
      title: "Seller terminal",
      body: "A phone becomes the payment terminal: tap to pay, QR codes and payment links.", // [VERIFY: tap to pay по платформам/рынкам]
      mockup: "terminal" as const,
    },
    {
      title: "Widget and White Label API",
      body: "A drop-in widget to ship this week, or white label APIs when the interface is yours.",
      mockup: null,
    },
  ],
};

export const integration = {
  section: {
    label: "02: integration",
    title: "Ship the widget or own the stack", // V2: "Two ways in, one rail"
  } satisfies SectionCopy,
  widget: {
    title: "Widget",
    lead: "Hosted flow inside your product. Fastest route to a live rail.",
    // порядок = раскладка чипов референса: короткие в первый ряд, длинный вторым
    checks: [
      "Prebuilt compliant flow",
      "Live in days, not quarters",
      "Your branding, themed via parameters",
    ],
  },
  api: {
    title: "White Label API",
    lead: "Your interface, our infrastructure. Full control of UX.",
    checks: [
      "Full control over UI and UX",
      "Sandbox from day one", // [VERIFY: sandbox]
      "Webhooks for every state change",
    ],
  },
  // [VERIFY: имена сущностей API до публикации доков]
  snippet: [
    'const crel = new CrelClient({ apiKey });',
    "",
    "const order = await crel.orders.create({",
    '  amount: "1000.00",',
    '  currency: "EUR",',
    '  asset: "USDC",',
    '  network: "ethereum",',
    "});",
    "// webhook: order.settled",
  ],
};

export const useCases = {
  section: {
    label: "03: use cases",
    title: "Built for apps that move money", // V2: "Five audiences, one integration"
  } satisfies SectionCopy,
  tabs: [
    {
      id: "wallets",
      title: "Ramps that live inside your wallet",
      body: "Embed buy and sell without sending users away. Your brand and flow, our rail underneath.",
      checks: [
        "Widget or white label API",
        "KYC reuse across sessions", // [VERIFY]
        "Payouts to bank accounts",
        "One contract, many corridors", // [VERIFY: модель контракта]
      ],
      mockup: "ramp" as const,
    },
    {
      id: "exchanges",
      title: "Direct deposits for your traders",
      body: "Verified traders fund accounts with fiat and withdraw back to their bank, without leaving your exchange.",
      checks: [
        "Existing KYC passed via QASIS", // [VERIFY]
        "Named IBAN per trader",
        "One API for in and out",
        "Settlement reporting for finance teams",
      ],
      mockup: "iban" as const,
    },
    {
      id: "neobanks",
      title: "Stablecoin balances, familiar banking UX",
      body: "Every user gets an account with a dedicated IBAN. Wires settle as stablecoin balances, ready to spend.",
      checks: [
        "Dynamic IBAN per user",
        "Card spend from balances", // [VERIFY]
        "Apple Pay and Google Pay", // [VERIFY]
        "Reconciliation via webhooks",
      ],
      mockup: "cards" as const,
    },
    {
      id: "remittances",
      title: "Stablecoin rails under local corridors",
      body: "Sender pays local, recipient receives local fiat. Stablecoins bridge the middle, invisible to both sides.",
      checks: [
        "Local pay-in methods",
        "Bank payouts on the receiving side",
        "Me-to-me and third-party flows", // [VERIFY: коридоры]
        "Corridor compliance, guided by our team",
      ],
      mockup: "ramp" as const,
    },
    {
      id: "payrolls",
      title: "Salary payouts in stablecoin or fiat",
      body: "A dedicated IBAN per employee. Pay it like any bank account; each employee chooses the payout asset.",
      checks: [
        "IBAN per employee, issued via API",
        "Employee KYC handled in the flow",
        "Stablecoin or local fiat payout",
        "Bulk payouts via API",
      ],
      mockup: "terminal" as const,
    },
  ],
};

export const partners = {
  section: {
    label: "04: partners",
    title: "Who we build with", // V2: "Partners and integrations"
  } satisfies SectionCopy,
  // [PLACEHOLDER: логотипы от Roman]
  quote: {
    text: "[PLACEHOLDER quote, 2-3 lines]",
    attribution: "[Name], [Role], [Company]",
  },
};

/* Микротексты мокапов — docs/content.md, дословно */
export const mockups = {
  ramp: {
    sendLabel: "You send",
    sendValue: "1 000.00",
    sendChip: "EUR",
    receiveLabel: "You receive",
    receiveValue: "912.44",
    receiveChip: "USDC",
    rate: "1 USDC = 1.0960 EUR, fees included",
    button: "Continue",
    footnote: "powered by crel",
  },
  kyc: {
    header: "qasis check",
    steps: [
      { label: "identity document", chip: "verified" },
      { label: "liveness", chip: "passed" },
      { label: "aml screening", chip: "clear" },
      { label: "decision", chip: "approved" },
    ],
  },
  cards: {
    plasticBrand: "orbia", // вымышленный white-label клиент
    plasticPan: "•••• 4821",
    plasticExpiry: "09/29",
    virtualTag: "virtual",
    virtualPan: "•••• 2210",
    chips: ["Apple Pay", "Google Pay"], // [VERIFY]
  },
  terminal: {
    amount: "240.00",
    currency: "CHF",
    button: "Charge",
    paidStatus: "paid",
    tag: "tap to pay", // [VERIFY]
  },
  iban: {
    header: "virtual accounts",
    sub: "auto-credit on incoming wires",
    rows: [
      // тестовые IBAN-образцы, не реальные счета
      { name: "Nadia Keller", iban: "DE89 3704 0044 0532 0130 00", chip: "active" },
      { name: "Liam Osei", iban: "GB29 NWBK 6016 1331 9268 19", chip: "active", dimmed: true },
    ],
  },
};
