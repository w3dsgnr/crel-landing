"use client";

// Оверлей легал-модалки: затемнение страницы + широкая стеклянная панель с
// текстом документа. Материал и хореография — дословно ContactModal.tsx
// (см. комментарии там): те же классы .contact-overlay/.contact-scrim/
// .contact-modal (globals.css §«Хореография модалки контакта») — это словарь
// движения проекта, не привязка к форме контакта. Разница — контент панели
// (документ вместо формы) и ширина (max-w-[760px] вместо max-w-[420px]).
//
// Фокус-трап, Esc, клик по подложке и шов ухода (transitionend + таймер-
// страховка) продублированы из ContactModal.tsx почти дословно. Дублирование
// сознательное (спека 2026-08-13 §Ограничения проекта) — кандидат на
// извлечение в общий примитив вместе с ContactModal, но это вне скоупа
// текущей волны.
import { useCallback, useEffect, useId, useRef } from "react";
import type { PointerEvent as ReactPointerEvent, ReactElement } from "react";
import { contact } from "@/content/shared";
import type { LegalDoc } from "@/content/types";
import { useScrollLock } from "@/lib/useScrollLock";

export type LegalModalState = "open" | "closing";

// Спека §Хореография: уход — 180ms --ease-swap, то же значение, что у
// .contact-overlay[data-state="closing"] .contact-modal в globals.css.
// Таймер — страховка на случай отсутствия transitionend (нет поддержки
// перехода или его срезала системная настройка), а не дубль события.
const EXIT_MS = 180;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function LegalModal({
  doc,
  state,
  onClose,
  onExited,
}: {
  doc: LegalDoc;
  state: LegalModalState;
  onClose(): void;
  onExited(): void;
}): ReactElement {
  const panelRef = useRef<HTMLDivElement>(null);
  // Скроллится оверлей (contact-overlay: overflow-y-auto), не панель — она сама
  // не прокручивается. Ссылка нужна только для сброса scrollTop при смене doc.id.
  const overlayRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Лок живёт ровно столько, сколько узел — см. ContactModal.
  useScrollLock(true);

  // Esc и фокус-трап — дословно ContactModal.tsx (кандидат на извлечение
  // вместе с ним). Слушаем документ, а не панель: после клика по затемнению
  // фокус может оказаться на body, и панельный листенер молчал бы.
  useEffect(() => {
    if (state !== "open") return;
    const panel = panelRef.current;
    if (!panel) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.getClientRects().length > 0
      );
      const active = document.activeElement;
      // панель как активный элемент считается «ни на чём», наравне с фокусом
      // снаружи — она сама tabIndex=-1 (см. ниже, фокус при открытии уходит
      // именно на неё: в документе нет поля, на которое стоило бы целиться)
      const outside = active === panel || !(active instanceof Node) || !panel.contains(active);

      if (!items.length) {
        event.preventDefault();
        panel.focus({ preventScroll: true });
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && (outside || active === first)) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && (outside || active === last)) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [state, onClose]);

  // Фокус при открытии — всегда на панель. В ContactModal выбор зависит от
  // указателя (поле vs панель), потому что там есть поле; здесь полей нет —
  // документ читают, а не заполняют, так что альтернативы для точного
  // указателя тоже нет.
  // doc.id в зависимостях: смена документа поверх уже открытой модалки должна
  // переобъявить фокус и сбросить прокрутку. Рефокус на панель заново озвучит
  // aria-labelledby (новый h2), если фокус до этого стоял не на ней; если уже
  // был на панели — повторный .focus() ничего не меняет. Прокручивается сам
  // оверлей, а не панель, поэтому scrollTop сбрасываем явно на нём — иначе
  // смена документа при прокрученном оверлее оставила бы читателя посреди
  // нового текста. Хореографию это не трогает, она на data-state — фокус и
  // scrollTop безопасны.
  useEffect(() => {
    if (state !== "open") return;
    panelRef.current?.focus({ preventScroll: true });
    if (overlayRef.current) overlayRef.current.scrollTop = 0;
  }, [state, doc.id]);

  // Шов ухода — дословно ContactModal: узел живёт до конца перехода и только
  // потом сообщает провайдеру.
  useEffect(() => {
    if (state !== "closing") return;
    const panel = panelRef.current;
    // reduced-motion: переходов нет по определению — уходим тем же кадром
    if (!panel || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onExited();
      return;
    }

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      onExited();
    };
    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target === panel) finish();
    };

    panel.addEventListener("transitionend", onTransitionEnd);
    const timer = window.setTimeout(finish, EXIT_MS + 60);
    return () => {
      panel.removeEventListener("transitionend", onTransitionEnd);
      window.clearTimeout(timer);
    };
  }, [state, onExited]);

  const onBackdropPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      if (!panelRef.current?.contains(event.target as Node)) onClose();
    },
    [onClose]
  );

  return (
    <div
      ref={overlayRef}
      data-state={state}
      onPointerDown={onBackdropPointerDown}
      className="contact-overlay fixed inset-0 z-50 flex overflow-y-auto overscroll-contain p-4 md:p-6"
    >
      <div
        aria-hidden
        className="contact-scrim fixed inset-0 bg-[rgb(29_29_31/0.28)] backdrop-blur-[20px]"
      />

      {/* Та же плотность стекла и хореография, что у .contact-modal — класс
          contact-modal сохранён, им и запускается переход. Шире через
          max-w-[760px] утилитой — спека прямым текстом требует утилиту,
          а не новый CSS-блок */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="contact-modal widget-glass relative m-auto w-full max-w-[760px] rounded-(--wg-radius-card) border border-(--wg-hairline) bg-(--wg-surface-base) p-6 backdrop-blur-xl md:p-9"
      >
        {/* крестик — тот же узел и калибр, что у ContactModal (.contact-close:
            зона нажатия 44px псевдоэлементом, hover/active — общие правила
            .contact-modal .contact-close в globals.css) */}
        <button
          type="button"
          onClick={onClose}
          aria-label={contact.close}
          className="contact-close absolute top-5 right-5 flex size-8 cursor-pointer items-center justify-center rounded-full bg-(--wg-surface-overlay) text-(--wg-text-muted)"
        >
          <svg
            viewBox="0 0 16 16"
            className="size-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M4.4 4.4 11.6 11.6M11.6 4.4 4.4 11.6" />
          </svg>
        </button>

        {/* pr-10: заголовок держится подальше от крестика, как в ContactModal */}
        <h2 id={titleId} className="pr-10 text-[1.375rem] font-semibold tracking-[-0.01em]">
          {doc.title}
        </h2>
        {/* «Last updated:» — часть значения doc.updated, а не JSX-текст: префикс
            в JSX был бы единственной строкой копирайта не из content/* во всём
            компоненте (правило соседей — см. комментарий ContactForm.tsx) */}
        <p className="mt-1 text-[0.8125rem] text-(--wg-text-muted)">{doc.updated}</p>
        <p className="mt-4 text-[0.875rem] leading-relaxed text-(--wg-text-muted)">{doc.intro}</p>

        <div className="mt-6 space-y-6">
          {doc.sections.map((section) => (
            <section key={section.heading}>
              <h3 className="text-[0.9375rem] font-semibold">{section.heading}</h3>
              {section.paras.map((para) => (
                <p key={para} className="mt-2 text-[0.875rem] leading-relaxed text-(--wg-text-muted)">
                  {para}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.875rem] leading-relaxed text-(--wg-text-muted)">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
