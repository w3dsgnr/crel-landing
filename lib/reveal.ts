"use client";

// Единая скролл-грамматика сайта: элементы с data-reveal появляются
// fade + translateY 24→0, 600ms, crelOut, stagger 60ms, один раз.
// Другой reveal-грамматики на сайте нет (принцип: один словарь движения).
// Инициализируется один раз на монтирование — DOM секций больше не пересоздаётся.
import { useEffect } from "react";
import type { RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ensureEases } from "./easing";

export function useReveal(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    ensureEases();
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      if (!items.length) return;
      gsap.set(items, { y: 24, autoAlpha: 0 });
      ScrollTrigger.batch(items, {
        start: "top bottom-=80",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            y: 0,
            autoAlpha: 1,
            duration: 0.6,
            ease: "crelOut",
            stagger: 0.06,
            overwrite: true,
          }),
      });
    }, root);

    return () => ctx.revert();
  }, [rootRef]);
}
