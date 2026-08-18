// Тексты: docs/content.md §ОБЩЕЕ — дословно. Правки только после вычитки заказчиком.
import type {
  ContactContent,
  FinaleContent,
  HeroBranch,
  HeroContent,
  LandingState,
  LegalDocId,
} from "./types";

// Hero объединённой страницы: команда в покое — c:rel_, подзаголовок держит
// оба направления одной строкой (content.md §ОБЩЕЕ, вариант A). После таба
// platform | services (2026-08-18) subtitle — fallback/общая формула, в hero
// показываются heroBranches; ctaPrimary остаётся у капсулы шапки.
export const hero: HeroContent = {
  restArg: "rel",
  subtitle:
    "Crel builds and runs digital asset infrastructure: a Swiss consulting practice and a platform, sharing one rail.",
  ctaPrimary: "Talk to us_",
};

// Ветки hero под табом (референс Arlo «Messages / Slack»): подзаголовок и CTA
// меняются вместе с прибором под текстом; CTA ведёт к развилке (scrollToBranch).
// [VERIFY: подзаголовки и лейблы CTA написаны 2026-08-18 в тоне content.md §ОБЩЕЕ]
export const heroBranches: Record<LandingState, HeroBranch> = {
  platform: {
    tab: "platform",
    subtitle:
      "One platform for on- and off-ramps, KYC and cards: a drop-in widget or a white label API on a Swiss-regulated rail.",
    cta: "See the platform_",
  },
  services: {
    tab: "services",
    subtitle:
      "A Swiss consulting practice for digital assets: licensing, architecture and implementation, run by the team that operates the rail.",
    cta: "See the services_",
  },
};

// Синий финальный блок (спека 2026-08-13), заменил собой FinalCta: логотип-циклер +
// форма захвата e-mail + CTA модалки контакта.
export const finale: FinaleContent = {
  srTitle: "Contact",
  formAria: "email updates",
  sub: "First call is a working session on your stack, not a pitch.",
  emailLead: "Not ready to talk? Leave an email — we write when there is something to show.",
  emailPlaceholder: "you@company.com",
  emailSubmit: "Subscribe",
  emailSending: "Sending",
  emailSuccess: "You're on the list. We write rarely.",
  emailErrorGeneric: "Could not subscribe. Write to info@crel.ch instead.",
  // капча Turnstile: обычно невидима, текст всплывает только если её скрипт
  // заблокирован или проверка провалилась. [VERIFY: вычитка заказчиком]
  emailVerifyError: "Verification did not load. Reload the page or write to info@crel.ch.",
  consentPrefix: "By subscribing you accept the ",
  consentLinkLabel: "privacy policy",
  ctaPrimary: "Talk to us_",
};

// Модалка контакта. Единственный блок этого файла, которого нет в docs/content.md:
// формы в исходном копирайте не было — тексты собраны по тону соседей (лейборы
// строчные, как якоря шапки; ошибки — констатация, без «пожалуйста» и без
// восклицаний). [VERIFY: вычитка заказчиком, спека 2026-08-13 §Тексты]
export const contact: ContactContent = {
  title: "Talk to us",
  sub: "Tell us what you are building. No pitch, just a working conversation.",
  nameLabel: "name",
  namePlaceholder: "Your name",
  emailLabel: "email",
  emailPlaceholder: "you@company.com",
  messageLabel: "message",
  messagePlaceholder: "What are you building?",
  submit: "Send",
  sending: "Sending",
  close: "Close",
  successTitle: "Message sent",
  successBody: "We reply within one business day.",
  errorGeneric: "Could not send. Write to info@crel.ch and we will pick it up there.",
  // капча Turnstile — см. finale.emailVerifyError [VERIFY]
  verifyError: "Verification did not load. Reload the page or write to info@crel.ch.",
  errors: {
    nameRequired: "Tell us who is writing",
    emailRequired: "We need an address to reply to",
    emailInvalid: "This address looks incomplete",
    messageRequired: "A line or two is enough",
  },
};

export const footer = {
  legal:
    "Crel [AG], [street, postcode] Zurich, Switzerland. [Company / VAT registration numbers]", // [VERIFY: credentials от Roman]
  // Реквизиты футера парами «label · value» (docs/refs/footer-milkyway/design.md):
  // та же строка legal, разбитая на моно-колонки. Значения — [VERIFY] до
  // credentials от Roman; label'ы уже финальные.
  meta: [
    { label: "studio", value: "Zurich, Switzerland" }, // [VERIFY: улица, индекс]
    { label: "reg.", value: "[company no.]" }, // [VERIFY]
    { label: "vat", value: "[VAT no.]" }, // [VERIFY]
  ] as { label: string; value: string }[],
  complianceStrip:
    "[Placeholder: certifications / registrations, pending confirmation]", // [VERIFY]
  email: "info@crel.ch",
  copyright: "© Crel 2026",
  // Заголовок шапки футера и слово вордмарка (курсор «_» дорисовывает разметка,
  // как в Header: LOGO_WORD + курсор)
  heading: "Contact",
  wordmark: "c:rel",
  // Расширение спекой 2026-08-13: футер финала — две группы ссылок
  // (навигация по секциям и легал-модалки, см. content/legal.ts).
  navLabel: "site",
  legalLabel: "legal",
  legalLinks: [
    { id: "privacy", label: "privacy" },
    { id: "cookies", label: "cookies" },
    { id: "terms", label: "terms" },
    { id: "imprint", label: "imprint" },
  ] satisfies { id: LegalDocId; label: string }[],
};

// Якоря шапки: label — то, что видит человек; id — идентификатор секции
// из config/sections.ts. Разведены намеренно: вычислять id из текста нельзя.
// «contact» в якорях нет — на него ведёт CTA-pill «talk to us» рядом.
export const navAnchors: { label: string; id: string }[] = [
  { label: "the rail", id: "the-rail" },
  { label: "who it's for", id: "who-its-for" },
  { label: "two ways in", id: "two-ways-in" },
  { label: "how we work", id: "how-we-work" },
  { label: "compliance", id: "compliance" },
  { label: "proof", id: "proof" },
];

// Заголовки веток развилки — единственный новый копирайт слияния (спека §3)
export const branchLabels: Record<LandingState, string> = {
  platform: "Take the platform",
  services: "Take the team",
};
