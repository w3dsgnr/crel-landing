"use client";

// Vendored: React Bits — ScrollStack (https://reactbits.dev, MIT).
// Источник: DavidHDev/react-bits, src/ts-tailwind/Components/ScrollStack/ScrollStack.tsx.
// Кастомизация Crel v3 (docs/design-direction.md §v3; известное больное место —
// связка с Lenis и cleanup при «Перепечатке»):
//  - собственный Lenis ВЫРЕЗАН: глобальный Lenis приложения (lib/lenis) скроллит
//    window, поэтому достаточно пассивных window-слушателей scroll/resize —
//    второй инстанс Lenis не создаётся, конфликтов склейки нет;
//  - режим только window-scroll (контейнерный режим оригинала удалён);
//  - offset карточек считается по цепочке offsetTop (layout-позиция), а не по
//    getBoundingClientRect: rect включает собственный transform карточки и в
//    оригинале даёт дрейф на первом же пине;
//  - mobile (<768) и prefers-reduced-motion: трансформы выключены, карточки —
//    обычный поток (reveal-грамматика делает своё);
//  - cleanup: слушатели снимаются, inline-стили карточек сбрасываются — при
//    переключении состояний «Перепечаткой» секция уходит без следов.
import React, { useLayoutEffect, useRef, useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";

export interface ScrollStackItemProps {
  itemClassName?: string;
  children: ReactNode;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({ children, itemClassName = "" }) => (
  <div
    className={`scroll-stack-card relative w-full origin-top ${itemClassName}`.trim()}
    style={{ backfaceVisibility: "hidden" }}
  >
    {children}
  </div>
);

interface ScrollStackProps {
  className?: string;
  children: ReactNode;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  rotationAmount?: number;
  blurAmount?: number;
  onStackComplete?: () => void;
}

const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = "",
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = "20%",
  scaleEndPosition = "10%",
  baseScale = 0.85,
  rotationAmount = 0,
  blurAmount = 0,
  onStackComplete,
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stackCompletedRef = useRef(false);
  const cardsRef = useRef<HTMLElement[]>([]);
  const lastTransformsRef = useRef(
    new Map<number, { translateY: number; scale: number; rotation: number; blur: number }>()
  );
  const isUpdatingRef = useRef(false);
  const tickingRef = useRef(false);

  const calculateProgress = useCallback((scrollTop: number, start: number, end: number) => {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  }, []);

  const parsePercentage = useCallback((value: string | number, containerHeight: number) => {
    if (typeof value === "string" && value.includes("%")) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(value as string);
  }, []);

  // layout-позиция без учёта transform (кастомизация: rect.top в оригинале
  // включает собственный translateY карточки и накапливает ошибку)
  const getElementOffset = useCallback((element: HTMLElement) => {
    let top = 0;
    let node: HTMLElement | null = element;
    while (node) {
      top += node.offsetTop;
      node = node.offsetParent as HTMLElement | null;
    }
    return top;
  }, []);

  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length || isUpdatingRef.current) return;

    isUpdatingRef.current = true;

    const scrollTop = window.scrollY;
    const containerHeight = window.innerHeight;
    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);

    const endElement = scrollerRef.current?.querySelector(".scroll-stack-end") as HTMLElement | null;
    const endElementTop = endElement ? getElementOffset(endElement) : 0;

    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      const cardTop = getElementOffset(card);
      const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
      const triggerEnd = cardTop - scaleEndPositionPx;
      const pinStart = cardTop - stackPositionPx - itemStackDistance * i;
      const pinEnd = endElementTop - containerHeight / 2;

      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale = baseScale + i * itemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

      let blur = 0;
      if (blurAmount) {
        let topCardIndex = 0;
        for (let j = 0; j < cardsRef.current.length; j++) {
          const jCardTop = getElementOffset(cardsRef.current[j]);
          const jTriggerStart = jCardTop - stackPositionPx - itemStackDistance * j;
          if (scrollTop >= jTriggerStart) {
            topCardIndex = j;
          }
        }

        if (i < topCardIndex) {
          const depthInStack = topCardIndex - i;
          blur = Math.max(0, depthInStack * blurAmount);
        }
      }

      let translateY = 0;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

      if (isPinned) {
        translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
      }

      const newTransform = {
        translateY: Math.round(translateY * 100) / 100,
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 100) / 100,
        blur: Math.round(blur * 100) / 100,
      };

      const lastTransform = lastTransformsRef.current.get(i);
      const hasChanged =
        !lastTransform ||
        Math.abs(lastTransform.translateY - newTransform.translateY) > 0.1 ||
        Math.abs(lastTransform.scale - newTransform.scale) > 0.001 ||
        Math.abs(lastTransform.rotation - newTransform.rotation) > 0.1 ||
        Math.abs(lastTransform.blur - newTransform.blur) > 0.1;

      if (hasChanged) {
        const transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`;
        const filter = newTransform.blur > 0 ? `blur(${newTransform.blur}px)` : "";

        card.style.transform = transform;
        card.style.filter = filter;

        lastTransformsRef.current.set(i, newTransform);
      }

      if (i === cardsRef.current.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });

    isUpdatingRef.current = false;
  }, [
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    onStackComplete,
    calculateProgress,
    parsePercentage,
    getElementOffset,
  ]);

  // rAF-коалесценция: scroll с Lenis приходит покадрово, считаем максимум раз в кадр
  const handleScroll = useCallback(() => {
    if (tickingRef.current) return;
    tickingRef.current = true;
    requestAnimationFrame(() => {
      tickingRef.current = false;
      updateCardTransforms();
    });
  }, [updateCardTransforms]);

  // мобайл и reduced-motion: без трансформ-пина, карточки — обычный поток.
  // Реактивно (state, не разовый расчёт): секция может смонтироваться до
  // ресайза окна или смены media query.
  const [inert, setInert] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const check = () => setInert(window.innerWidth < 768 || mq.matches);
    check();
    window.addEventListener("resize", check);
    mq.addEventListener("change", check);
    return () => {
      window.removeEventListener("resize", check);
      mq.removeEventListener("change", check);
    };
  }, []);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const cards = Array.from(scroller.querySelectorAll(".scroll-stack-card")) as HTMLElement[];
    cardsRef.current = cards;
    const transformsCache = lastTransformsRef.current;

    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`;
      }
      if (!inert) {
        card.style.willChange = "transform, filter";
        card.style.transformOrigin = "top center";
        card.style.backfaceVisibility = "hidden";
        card.style.transform = "translateZ(0)";
      }
    });

    if (inert) {
      return () => {
        cards.forEach((card) => {
          card.style.marginBottom = "";
        });
        cardsRef.current = [];
      };
    }

    // глобальный Lenis скроллит window → пассивных window-событий достаточно
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    updateCardTransforms();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      // следов не оставляем: «Перепечатка» уносит секцию чистой
      cards.forEach((card) => {
        card.style.transform = "";
        card.style.filter = "";
        card.style.willChange = "";
        card.style.marginBottom = "";
      });
      stackCompletedRef.current = false;
      cardsRef.current = [];
      transformsCache.clear();
      isUpdatingRef.current = false;
    };
  }, [itemDistance, handleScroll, updateCardTransforms, inert]);

  return (
    <div className={`relative w-full ${className}`.trim()} ref={scrollerRef}>
      {children}
      {/* маркер конца стека: до него держится пин последней карточки */}
      <div className="scroll-stack-end w-full" style={{ height: "40vh" }} />
    </div>
  );
};

export default ScrollStack;
