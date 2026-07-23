"use client";

// Маппит реестр секций текущего состояния. data-section-index используется
// оркестратором «Перепечатки» (И2) для встречных stagger-каскадов.
import { registry } from "@/config/sections";
import type { LandingState } from "@/content/types";

export function SectionRenderer({ state }: { state: LandingState }) {
  return (
    <>
      {registry[state].map(({ id, Component }, i) => (
        <div key={`${state}-${id}`} id={id} data-section-index={i}>
          <Component />
        </div>
      ))}
    </>
  );
}
