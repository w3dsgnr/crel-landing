"use client";

// Обёртка живого мокапа: подложка --surface, радиус --r-xl, единственная тень
// системы. Очередь «один живой одновременно»: IO запускает прогон только когда
// предыдущий мокап отыграл (промис-цепочка). Ревизия «живые карточки» (Cash App):
// после первого прогона мокап живёт idle-циклом — переигрывает сценарий через
// паузу, но повторы идут через ту же очередь, так что в кадре по-прежнему один
// живой. Вне вьюпорта и при document.hidden цикл спит, слот очереди не жжётся.
// static — для переиспользования в табах/развилке: сразу конечное состояние.
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export type MockupStagePhase = "idle" | "play" | "done";

const Ctx = createContext<{ stage: MockupStagePhase; complete: () => void }>({
  stage: "done",
  complete() {},
});

export const useMockupStage = () => useContext(Ctx);

// глобальная очередь прогонов («один живой одновременно»); экспортируется
// для не-surface участников очереди (код-сниппет)
let chain: Promise<void> = Promise.resolve();
export function enqueue(run: () => Promise<void>) {
  chain = chain.then(run, run);
}

// idle-цикл: пауза между повторами + разброс, чтобы карточки не бились в такт
const REST_MS = 5500;
const JITTER_MS = 2500;

export function MockupStage({
  children,
  className = "",
  isStatic = false,
  loop = !isStatic,
}: {
  children: ReactNode;
  className?: string;
  isStatic?: boolean;
  loop?: boolean;
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
    let disposed = false;
    let started = false;
    let visible = false;
    let waiting = false; // цикл приостановлен: карточка ушла с экрана
    let timer: number | undefined;

    const schedule = (ms = REST_MS + Math.random() * JITTER_MS) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => enqueue(play), ms);
    };

    const play = () =>
      new Promise<void>((resolve) => {
        if (disposed) {
          resolve();
          return;
        }
        if (!visible || document.hidden) {
          // карточки нет на экране / вкладка в фоне — слот не занимаем,
          // таймеры не крутим (фоновый троттлинг); IO или visibilitychange
          // возобновят цикл
          waiting = true;
          resolve();
          return;
        }
        let settled = false;
        releaseRef.current = () => {
          if (settled) return;
          settled = true;
          // гарантированный сброс в done: следующий play перезапустит эффекты детей
          setStage("done");
          resolve();
          if (loop && !disposed) schedule();
        };
        setStage("play");
        // страховка: слот освобождается максимум через 4s (битых прогонов не копим)
        window.setTimeout(() => releaseRef.current?.(), 4000);
      });

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) return;
        if (!started) {
          started = true;
          enqueue(play); // первый прогон — сразу по появлению
        } else if (waiting) {
          waiting = false;
          schedule(); // вернулись на экран — возобновить idle-цикл
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    // возврат вкладки из фона: быстрый resume (1.2–2s), не полный REST
    const onVisibility = () => {
      if (document.hidden || !waiting) return;
      waiting = false;
      schedule(1200 + Math.random() * 800);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      disposed = true;
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearTimeout(timer);
      releaseRef.current?.(); // не держим очередь при анмаунте
    };
  }, [isStatic, loop]);

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
