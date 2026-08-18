"use client";

// Стеклянная версия QASIS KYC — «прибор» (docs/refs/dark-widgets/design.md).
// Эмоциональный слой (итерация 2026-08-12): шапка вынесена в тёмный «островок»
// а-ля Dynamic Island, по его контуру — дуга прогресса обводкой (акцентный
// СИНИЙ Crel, память crel-accent-blue); строки шагов получили глифы-иконки.
// Статусы в mono; синим — только финальное решение, дуга и чек островка.
// Тексты — mockups.kyc дословно.
//
// Сцена (спека анимации карточек 01, 2026-08-13). Прибор изображает
// ЗАВЕРШЁННУЮ проверку, поэтому анимируются не строки, а ВЕРДИКТЫ: строки шагов
// существуют и до проверки, приходят ответы. Такты: четыре чипа каскадом →
// решение окрашивает строку → дуга прогресса замыкается в кольцо синхронно с
// щелчком чек-кольца островка. Решение 2026-08-17: конечное состояние дуги —
// 100% (все четыре чипа зелёные, в островке галка — 76% на статике этому
// противоречило); в static/SSR/reduced-motion полный круг сразу, в сцене
// стартовая поза 76% и ход .wg-arc (globals.css) — единственный paint-такт
// секции, оговорён там же.
import { mockups } from "@/content/platform";
import { usePlayOnce } from "@/lib/usePlayOnce";

// глифы шагов: id-карта, liveness-скан, щит AML, флажок решения (stroke 1.5,
// currentColor — наследуют muted/ink от строки)
const STEP_ICONS: Record<string, React.ReactNode> = {
  "identity document": (
    <>
      <rect x="1.5" y="3" width="13" height="10" rx="2" />
      <circle cx="5.5" cy="7" r="1.5" />
      <path d="M9 6h3.5M9 8.5h3.5M3.8 10.8c.4-1 .9-1.4 1.7-1.4s1.3.4 1.7 1.4" />
    </>
  ),
  liveness: (
    <>
      <path d="M1.5 5V3.5a2 2 0 0 1 2-2H5M11 1.5h1.5a2 2 0 0 1 2 2V5M14.5 11v1.5a2 2 0 0 1-2 2H11M5 14.5H3.5a2 2 0 0 1-2-2V11" />
      <circle cx="6" cy="7" r="0.5" fill="currentColor" />
      <circle cx="10" cy="7" r="0.5" fill="currentColor" />
      <path d="M6 10c.6.7 1.2 1 2 1s1.4-.3 2-1" />
    </>
  ),
  "aml screening": (
    <>
      <path d="M8 1.5 13.5 3.5v4c0 3.2-2.2 5.6-5.5 7-3.3-1.4-5.5-3.8-5.5-7v-4Z" />
      <path d="M5.8 7.8 7.4 9.4l3-3.2" />
    </>
  ),
  decision: (
    <>
      <path d="M3.5 14.5v-12" />
      <path d="M3.5 2.5h8.5l-2 3 2 3H3.5" />
    </>
  ),
};

// экспорт — глиф переиспользует фрагмент KYC в hero (HeroFloats.tsx),
// чтобы один шаг проверки рисовался одним и тем же знаком по всей странице
export function StepGlyph({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 16 16" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {STEP_ICONS[label]}
    </svg>
  );
}

export function KycFlowGlass() {
  const m = mockups.kyc;
  const last = m.steps[m.steps.length - 1];
  const { ref, playAttr } = usePlayOnce<HTMLDivElement>();
  // вердикты приходят по очереди: stagger 80ms — верхняя граница нормы,
  // на ней «по одному» читается чётко, а не сливается в один аккорд
  const chipDelay = (i: number) => `calc(var(--wg-t0) + ${i * 80}ms)`;
  return (
    <div ref={ref} data-play={playAttr} className="widget-glass w-full">
      {/* плоскость 1: островок — самостоятельная тёмная капсула над подложкой
          (та же двухплоскостная анатомия, что у ramp: корпус + квиток) */}
      <div className="relative">
          {/* дуга прогресса: ровно по контуру капсулы (stroke центрован на кромке),
              синяя. Высота капсулы зафиксирована (h-[60px] ниже),
              rx = (60 − stroke)/2 — иначе SVG клампит rx/ry независимо и рисует эллипс.
              pathLength=100 задаёт шкалу; dasharray "100 100" — сплошной контур,
              стартовое смещение (76%) и ход даёт .wg-arc, финиш — вместе с чеком
              (t0+520): старт t0+220, 500ms expo — на 300-й мс кривая уже на 98%,
              то есть глазу дуга замыкается ровно к щелчку, а не за 200 мс до него
              (замер 2026-08-17: при старте t0+20 кольцо стояло закрытым к t0+300) */}
          <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden>
            <rect
              className="wg-arc"
              style={{ transitionDelay: "calc(var(--wg-t0) + 220ms)" }}
              x="1.25" y="1.25"
              width="calc(100% - 2.5px)" height="calc(100% - 2.5px)"
              rx="28.75" ry="28.75"
              pathLength={100}
              fill="none"
              stroke="var(--wg-accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="100 100"
            />
          </svg>
          {/* тень — только у парящего островка (плоскость выше подложки) */}
          <div className="flex h-[60px] items-center gap-3 rounded-full bg-(--wg-action) pr-4 pl-3 shadow-[0_16px_32px_-12px_rgb(0_0_0/0.4)]">
            {/* глиф-монограмма в круге — как объект в островке */}
            <span className="flex size-9 items-center justify-center rounded-full bg-white/10 text-[0.8125rem] font-semibold text-(--wg-text-on-action)">
              c:
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[0.8125rem] leading-tight font-medium text-(--wg-text-on-action) lowercase">{m.header}</p>
              {/* [VERIFY: подстрока островка сгенерирована 2026-08-12] */}
              <p className="font-mono text-[0.6875rem] text-white/55">4 checks&ensp;·&ensp;~2 min</p>
            </div>
            {/* точка в предложении: ответ системы после того, как решение вынесено */}
            <span
              className="wg-pop flex size-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-(--wg-accent)"
              style={{ transitionDelay: "calc(var(--wg-t0) + 520ms)" }}
            >
              <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
                <path d="M2 6.2 5 9l5-6" fill="none" stroke="var(--wg-accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>
      {/* плоскость 2: белая стеклянная подложка с лентой шагов:
          глиф — ярлык — mono-статус; решение — синим */}
      <div className="mt-3 rounded-(--wg-radius-card) border border-(--wg-hairline) bg-(--wg-surface-base) px-5 py-2 backdrop-blur-xl">
        <div>
          {m.steps.map((s, i) => (
            <div
              key={s.label}
              className="flex items-center gap-3 border-b border-(--wg-hairline) py-3 text-[0.8125rem] lowercase last:border-b-0"
            >
              {/* глиф последней строки окрашивается вместе с приходом решения */}
              <span
                className={s === last ? "wg-ink text-(--wg-accent)" : "text-(--wg-text-muted)"}
                style={s === last ? { transitionDelay: chipDelay(i) } : undefined}
              >
                <StepGlyph label={s.label} />
              </span>
              <span className={`flex-1 ${s === last ? "font-medium" : "text-(--wg-text-muted)"}`}>{s.label}</span>
              {/* анимируется только вердикт: строка была и до проверки */}
              <span
                className={`wg-rise wg-rise-s font-mono text-[0.75rem] ${s === last ? "text-(--wg-accent)" : "text-(--wg-text)"}`}
                style={{ transitionDelay: chipDelay(i) }}
              >
                {s.chip}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
