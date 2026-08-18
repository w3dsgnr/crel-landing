"use client";

// Кодовый терминал ветки services в hero (таб platform | services, 2026-08-18):
// тёмное окно во всю ширину слота прибора (540 на десктопе — коду нужна строка,
// ramp в том же слоте уже) и так же уходит под нижний срез секции. Код — integration.snippet (content/platform.ts,
// White Label API) дословно, токенизатор и терминальная схема — из CodeSnippet.
//
// Печать посимвольная и честная: окно монтируется заново при каждом переключении
// на services (key по ветке в Hero) и печатает код один раз — при показе; без
// циклов и переигровок. Посимвольно, а не вайпом строк .wg-type: в hero окно
// крупное и стоит одно, машинка здесь читается как «код набирается», а не как
// джиттер. Reduced-motion и SSR — сразу полный текст (как у CodeSnippet).
import { useEffect, useState } from "react";
import { integration } from "@/content/platform";
import { tokenize } from "./CodeSnippet";
import type { TokenClass } from "./CodeSnippet";

// Схема терминала CodeSnippet здесь не годится: её plain/cmt — text-ink-invert,
// а в layer-v4-invert (hero чёрный) ink-invert сам тёмный. Цвета — те же роли,
// но абсолютные: белый текст, cyan ключевые слова, зелёные строки.
const SCHEME: Record<TokenClass, string> = {
  kw: "text-[#5fd1e8]",
  str: "text-accent-bright",
  cmt: "text-white/45",
  plain: "text-white/85",
};

const CHAR_MS = 14;
// пустая строка — один такт паузы, чтобы печать «дышала» между блоками
const BLANK_STEP = 1;

const LINES = integration.snippet.map(tokenize);
const STEPS = LINES.map((toks) =>
  Math.max(BLANK_STEP, toks.reduce((n, t) => n + t.t.length, 0))
);
const TOTAL = STEPS.reduce((a, b) => a + b, 0);

export function HeroCodeTerminal() {
  // Infinity — весь текст виден (SSR, no-JS, reduced-motion)
  const [typed, setTyped] = useState<number>(Infinity);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let n = 0;
    setTyped(0);
    const timer = window.setInterval(() => {
      n += 1;
      setTyped(n);
      if (n >= TOTAL) window.clearInterval(timer);
    }, CHAR_MS);
    return () => window.clearInterval(timer);
  }, []);

  const typing = typed < TOTAL;
  let offset = 0;

  return (
    <div className="w-full">
      {/* корпус: тот же градиент, что у код-панели WidgetApiGlass; min-h больше
          окна слота — низ режется срезом секции, как у ramp */}
      <div className="min-h-[420px] rounded-[22px] bg-[linear-gradient(160deg,#26262b_0%,#161619_100%)] p-4 text-white md:p-5 shadow-[0_24px_48px_-16px_rgb(0_0_0/0.6)] ring-1 ring-white/[0.06]">
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="size-2 rounded-full bg-white/15" />
          <span className="size-2 rounded-full bg-white/15" />
          <span className="size-2 rounded-full bg-white/15" />
          {/* [VERIFY: имя файла в шапке терминала] */}
          <span className="ml-3 font-mono text-[0.6875rem] text-white/35">ramp.ts</span>
        </div>
        <pre aria-hidden // на 375px слот ~335px: самая длинная строка сниппета (40 знаков) влезает только в 11px; что не влезло — режет overflow-hidden
          className="mt-4 overflow-hidden font-mono text-[0.6875rem] leading-relaxed md:text-[0.8125rem]">
          {LINES.map((toks, li) => {
            const lineStart = offset;
            offset += STEPS[li];
            return (
              <span key={li} className="block min-h-[1.2em]">
                {toks.map((tok, ti) => {
                  // сколько символов этого токена уже «набрано»
                  const before = toks.slice(0, ti).reduce((n, t) => n + t.t.length, 0);
                  const shown = Math.max(0, Math.min(tok.t.length, typed - lineStart - before));
                  return (
                    <span key={ti} className={SCHEME[tok.c]}>
                      {tok.t.slice(0, shown)}
                    </span>
                  );
                })}
                {/* курсор печати идёт за последним набранным символом */}
                {typing && typed >= lineStart && typed < lineStart + STEPS[li] && (
                  <span className="text-accent-bright">_</span>
                )}
              </span>
            );
          })}
        </pre>
      </div>
    </div>
  );
}
