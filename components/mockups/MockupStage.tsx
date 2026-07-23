"use client";

// Обёртка живого мокапа: подложка --surface, радиус --r-xl, единственная тень
// системы. Очередь «один живой одновременно»: IO запускает прогон только когда
// предыдущий мокап отыграл (промис-цепочка), прогон один раз (once).
// static — для переиспользования в табах/развилке: сразу конечное состояние.
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export type MockupStagePhase = "idle" | "play" | "done";

const Ctx = createContext<{ stage: MockupStagePhase; complete: () => void }>({
  stage: "done",
  complete() {},
});

export const useMockupStage = () => useContext(Ctx);

// глобальная очередь прогонов
let chain: Promise<void> = Promise.resolve();
function enqueue(run: () => Promise<void>) {
  chain = chain.then(run, run);
}

export function MockupStage({
  children,
  className = "",
  isStatic = false,
}: {
  children: ReactNode;
  className?: string;
  isStatic?: boolean;
}) {
  const [stage, setStage] = useState<MockupStagePhase>(isStatic ? "done" : "idle");
  const ref = useRef<HTMLDivElement>(null);
  const releaseRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isStatic) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStage("done");
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        enqueue(
          () =>
            new Promise<void>((resolve) => {
              let settled = false;
              releaseRef.current = () => {
                if (!settled) {
                  settled = true;
                  resolve();
                }
              };
              setStage("play");
              // страховка: слот освобождается максимум через 4s (битых прогонов не копим)
              window.setTimeout(() => releaseRef.current?.(), 4000);
            })
        );
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [isStatic]);

  const complete = () => {
    setStage("done");
    releaseRef.current?.();
  };

  return (
    <div
      ref={ref}
      aria-hidden
      className={`rounded-(--radius-xl) bg-surface shadow-(--shadow-mockup) ${className}`}
    >
      <Ctx.Provider value={{ stage, complete }}>{children}</Ctx.Provider>
    </div>
  );
}
