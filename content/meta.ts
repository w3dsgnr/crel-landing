import type { LandingState } from "./types";

export const meta: Record<LandingState, { title: string; description: string }> = {
  services: {
    title: "Crel: services",
    description:
      "Swiss consulting and engineering for digital asset products: architecture, licensing and implementation, from first audit to running rail.",
  },
  platform: {
    title: "Crel: platform",
    description:
      "The digital asset rail for financial applications: KYC, ramps, accounts, cards and payments behind one API.",
  },
};
