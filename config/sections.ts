// Реестр секций — единственное место, знающее порядок сцен обоих состояний.
// Имена и порядок зафиксированы docs/implementation-plan.md; менять только через план.
import type { ComponentType } from "react";
import type { LandingState } from "@/content/types";
import { makeStub } from "@/components/sections/Stub";
import { approach, servicesGrid, licensing, cases } from "@/content/services";
import { capabilities, integration, useCases, partners } from "@/content/platform";
import { Approach } from "@/components/sections/services/Approach";
import { ServicesGrid } from "@/components/sections/services/ServicesGrid";
import { LicensingStack } from "@/components/sections/services/LicensingStack";
import { Cases } from "@/components/sections/services/Cases";

export interface SectionDef {
  id: string;
  label: string | null;
  Component: ComponentType;
}

// И3: services — реальные секции. И4 заменит заглушки platform.
export const registry: Record<LandingState, SectionDef[]> = {
  services: [
    { id: "approach", label: approach.section.label, Component: Approach },
    { id: "services", label: servicesGrid.section.label, Component: ServicesGrid },
    { id: "licensing", label: licensing.section.label, Component: LicensingStack },
    { id: "cases", label: cases.section.label, Component: Cases },
  ],
  platform: [
    { id: "capabilities", label: capabilities.section.label, Component: makeStub(capabilities.section) },
    { id: "integration", label: integration.section.label, Component: makeStub(integration.section) },
    { id: "use-cases", label: useCases.section.label, Component: makeStub(useCases.section) },
    { id: "partners", label: partners.section.label, Component: makeStub(partners.section) },
  ],
};
