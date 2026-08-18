"use client";

// Парящие мини-интерфейсы по бокам центрированного hero (редизайн 2026-08-18,
// референс Arlo): компактные фрагменты приборов из Capabilities на матовом
// стекле поверх чёрной плоскости. Контракт: четыре компонента без пропсов —
// по два на сторону (A — верхняя, B — нижняя), каждый — один корневой div
// шириной 220–260px и высотой ~90–150px. Позиционирование, наклон и
// aria-hidden — у обёрток в Hero.tsx; здесь только содержимое и материал
// (.hero-float, globals.css § «Hero floats»).
//
// Это не виджеты, а их фрагменты (правка 2026-08-18: карта orbia снята —
// «не в тему», все четыре — интерфейсные фрагменты приборов):
//   LeftA  — QASIS KYC: островок + строки вердикта (KycFlowGlass);
//   LeftB  — Virtual accounts: одна строка счёта с IBAN (IbanAccountGlass);
//   RightA — тост-квиток ramp «Order settled» (RampWidgetGlass);
//   RightB — код-панель white label API «POST /v1/ramp → 201» (WidgetApiGlass).
// Тексты — mockups.* дословно; микротексты, которых нет в контенте (квиток,
// строки кода), импортируются из самих приборов, а не переписываются. Глифы
// общие (StepGlyph), чтобы hero и capabilities говорили одними знаками.
// Материал единый; для ритма две плашки несут тёмный островок (KYC, IBAN),
// а API-панель — целиком тёмная (.hf-dark), как её код-панель в capabilities.
//
// Моушн — только по наведению и только CSS (правила .hero-float:hover в
// globals.css). Правило проекта: hover ОТВЕЧАЕТ, а не украшает — здесь он
// переигрывает финальный такт сцены прибора: у KYC решение подсвечивается и
// чек-кольцо щёлкает, у IBAN номер печатается заново и точка статуса
// щёлкает, у квитка окрашивается сумма и щёлкает чек, у API приходит ответ.
// Обёртки в Hero — pointer-events-none, плашка возвращает себе
// pointer-events сама (.hero-float), иначе hover не дошёл бы.
import { mockups } from "@/content/platform";
import { StepGlyph } from "./KycFlowGlass";
import { TOAST } from "./RampWidgetGlass";
import { API_LINES } from "./WidgetApiGlass";

/** Чек-кольцо семейства: на покое пустое и белое, по наведению — синее с галкой
 *  (.hf-ring / .hf-check). Один и тот же «щелчок вердикта» у KYC и у квитка. */
function CheckRing({ size = "size-6" }: { size?: string }) {
  return (
    <span className={`hf-ring flex ${size} shrink-0 items-center justify-center rounded-full border-[1.5px]`}>
      <svg viewBox="0 0 12 12" className="hf-check size-2.5" aria-hidden>
        <path d="M2 6.2 5 9l5-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/** Верхняя левая — фрагмент QASIS KYC: тёмный островок + строки
 *  «identity document» и «decision». Hover переигрывает вердикт. */
export function HeroFloatLeftA() {
  const m = mockups.kyc;
  const first = m.steps[0];
  const last = m.steps[m.steps.length - 1];
  return (
    <div className="hero-float w-[240px] p-2.5">
      {/* островок: капсула темнее стекла (на чёрной плоскости «тёмный островок»
          читается как углубление, а не как пятно) */}
      <div className="flex h-12 items-center gap-2.5 rounded-full border border-white/10 bg-black/60 pr-2.5 pl-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[0.75rem] font-semibold text-white">
          c:
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.75rem] leading-tight font-medium text-white lowercase">{m.header}</p>
          {/* [VERIFY: подстрока островка сгенерирована 2026-08-12] — та же, что в KycFlowGlass */}
          <p className="font-mono text-[0.625rem] leading-tight text-white/55">4 checks&ensp;·&ensp;~2 min</p>
        </div>
        {/* hover переигрывает вердикт, повторный hover — снова */}
        <CheckRing />
      </div>
      {/* лента вердиктов: первая проверка приглушена, решение — рабочая строка */}
      <div className="mt-1 px-2.5">
        <div className="flex items-center gap-2.5 border-b border-white/10 py-2.5 text-[0.75rem] text-white/60 lowercase">
          <StepGlyph label={first.label} />
          <span className="flex-1">{first.label}</span>
          <span className="font-mono text-[0.6875rem] text-white/80">{first.chip}</span>
        </div>
        <div className="hf-ink flex items-center gap-2.5 py-2.5 text-[0.75rem] text-white lowercase">
          <StepGlyph label={last.label} />
          <span className="flex-1 font-medium">{last.label}</span>
          <span className="font-mono text-[0.6875rem]">{last.chip}</span>
        </div>
      </div>
    </div>
  );
}

/** Нижняя левая — фрагмент Virtual accounts: шапка прибора + один счёт
 *  (имя, статус, IBAN) тёмным узлом. Hover — «выдача счёта» заново: номер
 *  печатается поверх (.hf-type — вайп поверх приглушённой копии), затем
 *  точка статуса щёлкает и загорается синим. */
export function HeroFloatLeftB() {
  const m = mockups.iban;
  const row = m.rows[0];
  return (
    // --hf-ry: плашка чуть отвёрнута от зрителя, по наведению доворачивается
    <div className="hero-float w-[260px] p-3.5" style={{ "--hf-ry": "-4deg" } as React.CSSProperties}>
      <div className="flex items-baseline justify-between">
        <p className="text-[0.75rem] leading-none font-medium lowercase">{m.header}</p>
        <p className="font-mono text-[0.625rem] leading-none text-white/45 lowercase">{m.sub}</p>
      </div>
      {/* узел счёта — тёмный островок, как приподнятый ряд в приборе */}
      <div className="mt-3 rounded-[12px] border border-white/10 bg-black/60 px-3 py-2.5">
        <div className="flex items-center justify-between text-[0.75rem]">
          <span className="font-medium">{row.name}</span>
          <span className="hf-status flex items-center gap-1.5 font-mono text-[0.625rem] lowercase">
            <span className="hf-dot size-1.5 rounded-full" aria-hidden />
            {row.chip}
          </span>
        </div>
        {/* IBAN: приглушённая копия на покое; поверх — белая копия, срезанная
            маской до нуля, по наведению печатается слева направо (та же маска,
            что .wg-type в приборе — только маска, никогда посимвольно) */}
        <p className="relative mt-1.5 font-mono text-[0.6875rem] whitespace-nowrap tracking-[0.02em] text-white/55 tabular-nums">
          {row.iban}
          <span className="hf-type absolute inset-0 text-white" aria-hidden>
            {row.iban}
          </span>
        </p>
      </div>
    </div>
  );
}

/** Верхняя правая — тост-квиток ramp: «Order settled», строка суммы и условий,
 *  чек-кольцо. Hover: сумма окрашивается в акцент, чек щёлкает (общая морфема с
 *  KYC — «щелчок вердикта»). */
export function HeroFloatRightA() {
  const m = mockups.ramp;
  return (
    <div className="hero-float w-[270px] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.8125rem] leading-none font-medium">{TOAST.title}</p>
        <CheckRing size="size-7" />
      </div>
      <p className="mt-3 border-t border-white/10 pt-3 font-mono text-[0.6875rem] whitespace-nowrap text-white/55 tabular-nums">
        {/* сумма — рабочая строка квитка (.hf-ink → акцент), условия приглушены */}
        <span className="hf-ink text-white">
          {m.receiveValue} {m.receiveChip}
        </span>
        &ensp;·&ensp;{TOAST.terms}
      </p>
    </div>
  );
}

/** Нижняя правая — код-панель white label API: запрос, тело, ответ. Тёмная
 *  плашка (.hf-dark) — рифма с код-панелью WidgetApiGlass. Hover: строка ответа
 *  «приходит» — приподнимается и окрашивается в акцент (.hf-resp). */
export function HeroFloatRightB() {
  const m = mockups.ramp;
  return (
    <div
      className="hero-float hf-dark w-[260px] p-3.5 font-mono text-[0.6875rem] leading-relaxed"
      style={{ "--hf-ry": "4deg" } as React.CSSProperties}
    >
      <div className="flex gap-1.5" aria-hidden>
        <span className="size-2 rounded-full bg-white/15" />
        <span className="size-2 rounded-full bg-white/15" />
        <span className="size-2 rounded-full bg-white/15" />
      </div>
      <div className="mt-2.5">
        <p>{API_LINES.request}</p>
        <p className="whitespace-nowrap text-white/45">
          {"{"} amount: {m.sendValue}, currency: {m.sendChip.toLowerCase()} {"}"}
        </p>
        {/* ответ на покое ждёт приглушённым, по наведению приходит */}
        <p className="hf-resp mt-1">{API_LINES.response}</p>
      </div>
    </div>
  );
}
