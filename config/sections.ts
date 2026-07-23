// Реестр секций — единственное место, знающее порядок сцен обоих состояний.
// Имена и порядок зафиксированы docs/implementation-plan.md; менять только через план.
import type { ComponentType } from "react";
import type { LandingState } from "@/content/types";
import { makeStub } from "@/components/sections/Stub";
import { approach, servicesGrid, licensing, cases } from "@/content/services";
import { capabilities, integration, useCases, partners } from "@/content/platform";

export interface SectionDef {
  id: string;
  label: string | null;
  Component: ComponentType;
}

// И1: все Component — заглушки. И3/И4 заменяют их по одному, не меняя id/порядок.
export const registry: Record<LandingState, SectionDef[]> = {
  services: [
    { id: "approach", label: approach.section.label, Component: makeStub(approach.section) },
    { id: "services", label: servicesGrid.section.label, Component: makeStub(servicesGrid.section) },
    { id: "licensing", label: licensing.section.label, Component: makeStub(licensing.section) },
    { id: "cases", label: cases.section.label, Component: makeStub(cases.section) },
  ],
  platform: [
    { id: "capabilities", label: capabilities.section.label, Component: makeStub(capabilities.section) },
    { id: "integration", label: integration.section.label, Component: makeStub(integration.section) },
    { id: "use-cases", label: useCases.section.label, Component: makeStub(useCases.section) },
    { id: "partners", label: partners.section.label, Component: makeStub(partners.section) },
  ],
};
