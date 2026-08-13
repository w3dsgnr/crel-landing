// Тексты: docs/content.md §ОБЩЕЕ — дословно. Правки только после вычитки заказчиком.
import type {
  FinaleContent,
  HeroContent,
  LandingState,
  LegalDocId,
} from "./types";

// Hero объединённой страницы: команда в покое — c:rel_, подзаголовок держит
// оба направления одной строкой (content.md §ОБЩЕЕ, вариант A).
export const hero: HeroContent = {
  restArg: "rel",
  subtitle:
    "Crel builds and runs digital asset infrastructure: a Swiss consulting practice and a platform, sharing one rail.",
  ctaPrimary: "Talk to us_",
};

// Синий финальный блок (спека 2026-08-13), заменил собой FinalCta: логотип-циклер +
// форма захвата e-mail + CTA модалки контакта.
export const finale: FinaleContent = {
  sub: "First call is a working session on your stack, not a pitch.",
  emailLead: "Not ready to talk? Leave an email — we write when there is something to show.",
  emailPlaceholder: "you@company.com",
  emailSubmit: "Subscribe",
  emailSending: "Sending",
  emailSuccess: "You're on the list. We write rarely.",
  emailErrorGeneric: "Could not subscribe. Write to info@crel.ch instead.",
  consentPrefix: "By subscribing you accept the ",
  consentLinkLabel: "privacy policy",
  ctaPrimary: "Talk to us_",
};

export const footer = {
  legal:
    "Crel [AG], [street, postcode] Zurich, Switzerland. [Company / VAT registration numbers]", // [VERIFY: credentials от Roman]
  complianceStrip:
    "[Placeholder: certifications / registrations, pending confirmation]", // [VERIFY]
  email: "info@crel.ch",
  copyright: "© Crel 2026",
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
