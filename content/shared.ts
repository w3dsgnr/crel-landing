// Тексты: docs/content.md §ОБЩЕЕ — дословно. Правки только после вычитки заказчиком.
import type { FinalCtaContent, HeroContent, LandingState } from "./types";

export const toggle = {
  words: ["services", "platform"] as const,
  ariaLabel: "Choose direction: services or platform",
};

// Hero объединённой страницы: команда в покое — c:rel_, подзаголовок держит
// оба направления одной строкой (content.md §ОБЩЕЕ, вариант A).
export const hero: HeroContent = {
  restArg: "rel",
  subtitle:
    "Crel builds and runs digital asset infrastructure: a Swiss consulting practice and a platform, sharing one rail.",
  ctaPrimary: "Talk to us_",
};

export const finalCta: FinalCtaContent = {
  title: "Tell us what you are building",
  sub: "First call is a working session on your stack, not a pitch.",
  ctaPrimary: "Talk to us_",
};

export const footer = {
  legal:
    "Crel [AG], [street, postcode] Zurich, Switzerland. [Company / VAT registration numbers]", // [VERIFY: credentials от Roman]
  complianceStrip:
    "[Placeholder: certifications / registrations, pending confirmation]", // [VERIFY]
  email: "info@crel.ch",
  copyright: "© Crel 2026",
};

// Якоря шапки: label — то, что видит человек; id — идентификатор секции.
// Разведены намеренно: вычислять id из текста нельзя (см. Header.tsx).
export const navAnchors: { label: string; id: string }[] = [
  { label: "the rail", id: "the-rail" },
  { label: "two ways in", id: "two-ways-in" },
  { label: "compliance", id: "compliance" },
  { label: "contact", id: "contact" },
];

// Заголовки веток развилки — единственный новый копирайт слияния (спека §3)
export const branchLabels: Record<LandingState, string> = {
  platform: "Take the platform",
  services: "Take the team",
};
