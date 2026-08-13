// Реестр секций — единственное место, знающее порядок сцен объединённой страницы.
// Порядок задан спекой слияния §2: рельс → для кого → развилка → как работаем →
// комплаенс → доказательства. Развилка пока состоит из двух секций — её сольёт
// План 2. Секция-плейсхолдер с логотипами снята спекой 2026-08-13: финал
// страницы берёт на себя роль социального доказательства.
import type { ComponentType } from "react";
import { approach, servicesGrid, licensing, cases } from "@/content/services";
import { capabilities, integration, useCases } from "@/content/platform";
import { Approach } from "@/components/sections/shared/Approach";
import { Capabilities } from "@/components/sections/shared/Capabilities";
import { LicensingStack } from "@/components/sections/shared/LicensingStack";
import { UseCases } from "@/components/sections/shared/UseCases";
import { Integration } from "@/components/sections/platform/Integration";
import { Cases } from "@/components/sections/services/Cases";
import { ServicesGrid } from "@/components/sections/services/ServicesGrid";

export interface SectionDef {
  id: string;
  label: string | null;
  Component: ComponentType;
}

export const sections: SectionDef[] = [
  { id: "the-rail", label: capabilities.section.label, Component: Capabilities },
  { id: "who-its-for", label: useCases.section.label, Component: UseCases },
  // развилка: ветка A (взять платформу) и ветка B (взять команду)
  { id: "two-ways-in", label: integration.section.label, Component: Integration },
  { id: "two-ways-in-team", label: servicesGrid.section.label, Component: ServicesGrid },
  { id: "how-we-work", label: approach.section.label, Component: Approach },
  { id: "compliance", label: licensing.section.label, Component: LicensingStack },
  { id: "proof", label: cases.section.label, Component: Cases },
];
