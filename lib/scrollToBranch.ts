"use client";

// Доводка скролла к развилке. Спека §5: на десктопе цель — верхняя граница
// секции развилки (обе ветки видны рядом); на мобиле — начало выбранной ветки,
// потому что там ветки стоят друг под другом и верхняя граница секции не
// показала бы выбранную.
import type { LandingState } from "@/content/types";
import { getLenis } from "./lenis";

/** высота плавающей стеклянной капсулы + воздух; совпадает с scroll-margin-top в globals.css */
const HEADER_CLEARANCE = 104;

const FORK_ID = "two-ways-in";

// План 2 сольёт обе ветки в одну секцию; до тех пор ветка B — отдельная секция
const BRANCH_ID: Record<LandingState, string> = {
  platform: "two-ways-in",
  services: "two-ways-in-team",
};

export function scrollToBranch(branch: LandingState, opts: { instant?: boolean } = {}) {
  const mobile = window.matchMedia("(max-width: 767px)").matches;
  const el = document.getElementById(mobile ? BRANCH_ID[branch] : FORK_ID);
  if (!el) return;

  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_CLEARANCE;
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(top, { duration: opts.instant ? 0 : 0.8 });
  } else {
    window.scrollTo({ top, behavior: "auto" });
  }
}
