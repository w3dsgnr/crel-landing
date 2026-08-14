"use client";

// Скролл-лок на время жизни оверлея. Стопора два, и оба обязательны:
//   1) Lenis — пока крутится его raf, он двигает страницу сам и никакой
//      overflow:hidden его не останавливает;
//   2) нативный overflow — getLenis() отдаёт null при prefers-reduced-motion
//      (lib/lenis.ts: инстанс там просто не создаётся), и без второго стопора
//      именно на reduced-motion фон под модалкой продолжил бы скроллиться.
// Ширина исчезнувшего скроллбара возвращается странице как padding-right, иначе
// весь контент дёргается вправо в момент открытия. Плавающая шапка (fixed) при
// этом уезжает на половину зазора, но она лежит ПОД затемнением с blur(20px) —
// на глаз этого сдвига нет, а компенсировать fixed-слои пришлось бы правкой
// чужих компонентов.
import { useEffect } from "react";
import { getLenis } from "./lenis";

export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;

    const lenis = getLenis();
    lenis?.stop();

    const { body, documentElement: html } = document;
    // зазор считаем ДО того, как полоса исчезла; у оверлейных скроллбаров
    // (macOS, тач) он честно равен нулю — компенсировать нечего
    const gap = window.innerWidth - html.clientWidth;
    // запоминаем инлайновые значения, а не сбрасываем в "" вслепую: лок обязан
    // быть симметричным — он снимается и при обычном закрытии, и при
    // размонтировании оверлея
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;

    // overflow вешаем на <body>: у <html> он остаётся visible, поэтому вьюпорт
    // забирает переполнение именно у body (html.h-full / body.min-h-full в layout)
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
      lenis?.start();
    };
  }, [active]);
}
