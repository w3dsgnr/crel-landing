"use client";

// Код-сниппет White Label API: терминальная подсветка + type-анимация.
// Решение заказчика (дизайн-проход): код печатает себя при входе в вьюпорт,
// цвета — как в терминале (cyan ключевые слова, зелёные строки, серый комментарий).
// SSR отдаёт полный подсвеченный код; прогон один раз, в общей очереди мокапов.
import { useEffect, useRef, useState } from "react";
import { enqueue } from "./MockupStage";

type Token = { t: string; c: TokenClass };
type TokenClass = "kw" | "str" | "cmt" | "plain";

// две схемы: terminal — тёмное окно v3; light — белая панель v4
// (референс «Identify code vulnerabilities»: синие ключевые слова,
// красные строки, серые комментарии на белом)
const TOKEN_SCHEMES: Record<"terminal" | "light", Record<TokenClass, string>> = {
  terminal: {
    kw: "text-[#5fd1e8]", // cyan: ключевые слова
    str: "text-accent-bright", // зелёный: строки
    cmt: "text-ink-invert/55", // серый: комментарии
    plain: "text-ink-invert/85",
  },
  light: {
    kw: "text-[#2e7cf6]",
    str: "text-[#e5484d]",
    cmt: "text-[#6e6e73]",
    plain: "text-[#1d1d1f]",
  },
};

const CHAR_MS = 12;

function tokenize(line: string): Token[] {
  if (line.trim().startsWith("//")) return [{ t: line, c: "cmt" }];
  const out: Token[] = [];
  // строки в кавычках → str; внутри остального — ключевые слова
  for (const part of line.split(/("[^"]*")/)) {
    if (!part) continue;
    if (part.startsWith('"')) {
      out.push({ t: part, c: "str" });
      continue;
    }
    for (const sub of part.split(/\b(const|await|new)\b/)) {
      if (!sub) continue;
      out.push({ t: sub, c: /^(const|await|new)$/.test(sub) ? "kw" : "plain" });
    }
  }
  return out;
}

export function CodeSnippet({
  lines,
  variant = "terminal",
}: {
  lines: string[];
  variant?: "terminal" | "light";
}) {
  const rootRef = useRef<HTMLPreElement>(null);
  const [typing, setTyping] = useState(false);
  const tokenLines = lines.map(tokenize);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        enqueue(
          () =>
            new Promise<void>((resolve) => {
              // плоский список целей: [индекс строки, индекс токена, длина префикса]
              const steps: [number, number, number][] = [];
              tokenLines.forEach((toks, li) =>
                toks.forEach((tok, ti) => {
                  for (let n = 1; n <= tok.t.length; n++) steps.push([li, ti, n]);
                })
              );
              setTyping(true);
              const spans = () =>
                el.querySelectorAll<HTMLElement>("[data-tok]");
              // очистить текст токенов перед печатью
              spans().forEach((s) => (s.textContent = ""));
              let i = 0;
              const timer = window.setInterval(() => {
                if (i >= steps.length) {
                  window.clearInterval(timer);
                  setTyping(false);
                  resolve();
                  return;
                }
                const [li, ti, n] = steps[i++];
                const span = el.querySelector<HTMLElement>(
                  `[data-tok="${li}-${ti}"]`
                );
                if (span) span.textContent = tokenLines[li][ti].t.slice(0, n);
              }, CHAR_MS);
              // страховка очереди
              window.setTimeout(() => {
                window.clearInterval(timer);
                spans().forEach((s, idx) => {
                  const [li, ti] = (s.dataset.tok ?? "0-0").split("-").map(Number);
                  s.textContent = tokenLines[li]?.[ti]?.t ?? "";
                  void idx;
                });
                setTyping(false);
                resolve();
              }, 3800);
            })
        );
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
    // tokenLines детерминированы от lines
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines.join("\n")]);

  return (
    <pre
      ref={rootRef}
      aria-hidden
      className="overflow-x-auto font-mono text-[0.8125rem] leading-relaxed"
    >
      {tokenLines.map((toks, li) => (
        <span key={li} className="block min-h-[1.2em]">
          {toks.map((tok, ti) => (
            <span key={ti} data-tok={`${li}-${ti}`} className={TOKEN_SCHEMES[variant][tok.c]}>
              {tok.t}
            </span>
          ))}
        </span>
      ))}
      {/* курсор печати: горит только во время прогона, потом исчезает
          (живой мигающий курсор на сайте один — в hero) */}
      {typing && <span className="text-accent-bright">_</span>}
    </pre>
  );
}
