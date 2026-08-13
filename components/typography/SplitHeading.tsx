"use client";

// Заголовок секции с появлением по приёму React Bits SplitText:
// посимвольный подъём из-под базовой линии со stagger'ом, один раз при входе
// в вьюпорт (IntersectionObserver + gsap, easing crelOut — словарь движения
// сайта). Слова — inline-block (не рвутся при переносе), перенос строки —
// перед словом breakBefore. UseCases держит собственную инлайн-копию приёма:
// его заголовок живёт внутри pinned-scrub и перезапускается при смене режима.
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ensureEases } from "@/lib/easing";

export function SplitHeading({
  text,
  breakBefore,
  className,
}: {
  text: string;
  breakBefore?: string;
  className?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    ensureEases();
    const chars = el.querySelectorAll<HTMLElement>("[data-char]");
    if (!chars.length) return;
    gsap.set(chars, { y: "0.7em", autoAlpha: 0 });
    let tween: gsap.core.Tween | null = null;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        tween = gsap.to(chars, {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          ease: "crelOut",
          stagger: 0.02,
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      tween?.kill();
      gsap.set(chars, { clearProps: "all" });
    };
  }, []);

  // спаны aria-hidden, скринридер читает aria-label целиком
  const words = text.split(" ");
  return (
    <h2 ref={ref} aria-label={text} className={className}>
      {words.map((w, wi) => (
        <span key={wi} aria-hidden>
          {w === breakBefore && <br />}
          <span className="inline-block whitespace-pre">
            {[...w].map((c, ci) => (
              <span key={ci} data-char className="inline-block will-change-transform">
                {c}
              </span>
            ))}
            {wi < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </h2>
  );
}
