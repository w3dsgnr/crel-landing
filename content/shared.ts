// Тексты: docs/content.md §ОБЩЕЕ — дословно. Правки только после вычитки заказчиком.
import type { FinalCtaContent, HeroContent } from "./types";

export const toggle = {
  words: ["services", "platform"] as const,
  ariaLabel: "Choose direction: services or platform",
};

export const hero: Record<"services" | "platform", HeroContent> = {
  services: {
    commandArg: "services",
    subtitle:
      "Swiss consulting and engineering for digital asset products: architecture, licensing and implementation, from first audit to running rail.",
    ctaPrimary: "Talk to us_",
  },
  platform: {
    commandArg: "platform",
    subtitle:
      "The digital asset rail for financial applications: KYC, ramps, accounts, cards and payments behind one API.",
    ctaPrimary: "Talk to us_",
    ctaSecondary: "Read the docs", // [VERIFY: доки публичны к запуску?]
  },
};

export const finalCta: Record<"services" | "platform", FinalCtaContent> = {
  services: {
    title: "Tell us what you are building", // V2: "Start with the audit"
    sub: "First call is a working session on your stack, not a pitch.",
    ctaPrimary: "Talk to us_",
  },
  platform: {
    title: "Put the rail under your product", // V2: "One integration away from live"
    sub: "Sandbox access and integration plan follow the first technical call.", // [VERIFY: sandbox]
    ctaPrimary: "Talk to us_",
    ctaSecondary: "Read the docs",
  },
};

export const footer = {
  legal:
    "Crel [AG], [street, postcode] Zurich, Switzerland. [Company / VAT registration numbers]", // [VERIFY: credentials от Roman]
  complianceStrip:
    "[Placeholder: certifications / registrations, pending confirmation]", // [VERIFY]
  email: "info@crel.ch",
  copyright: "© Crel 2026",
};

export const navAnchors: Record<"services" | "platform", string[]> = {
  services: ["approach", "services", "licensing", "contact"],
  platform: ["capabilities", "integration", "use cases", "contact"],
};
