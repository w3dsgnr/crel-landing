"use client";

// Оверлей модалки контакта: затемнение страницы + стеклянная панель с формой.
// Материал панели — тот же .widget-glass, что у мокапов-«приборов» секции
// capabilities (спека 2026-08-13 §Визуальный словарь); единственное отличие —
// плотность корпуса, она задана скоупом .contact-modal в globals.css.
//
// Движение целиком в CSS (globals.css §«Хореография модалки контакта»), здесь
// только его швы:
//   — data-state="open" | "closing" на корне оверлея;
//   — затемнение и панель разведены по разным узлам (у них разные такты:
//     подложка 200ms, панель 300ms со scale и стартом на +40ms позже);
//   — уход не размонтирует узел мгновенно: модалка ждёт конца перехода и только
//     потом зовёт onExited.
// Почему CSS, а не GSAP (он в проекте есть): переходы прерываемы и ретаргетятся
// на лету — повторное открытие поверх ещё не доигравшего ухода подхватывается
// с текущей позы, а не с нуля; плюс они живут вне главного потока.
import { useCallback, useEffect, useId, useRef } from "react";
import type { PointerEvent as ReactPointerEvent, ReactElement } from "react";
import { contact } from "@/content/shared";
import { useScrollLock } from "@/lib/useScrollLock";
import { ContactForm } from "./ContactForm";

export type ContactModalState = "open" | "closing";

// Спека §Хореография: уход — 180ms --ease-swap. Ровно это значение стоит в
// globals.css у .contact-overlay[data-state="closing"] .contact-modal; менять
// длительность нужно в двух местах сразу.
// Таймер — не дубль transitionend, а страховка: событие не придёт, если браузер
// не поддерживает переход (или его срезала системная настройка), и панель
// осталась бы в дереве навсегда. В обычном случае transitionend приходит первым.
const EXIT_MS = 180;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function ContactModal({
  state,
  onClose,
  onExited,
}: {
  state: ContactModalState;
  onClose(): void;
  onExited(): void;
}): ReactElement {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Лок живёт ровно столько, сколько узел: провайдер монтирует модалку на
  // открытие и держит всю фазу ухода. Снять раньше нельзя — фон дёрнулся бы
  // под ещё видимой панелью.
  useScrollLock(true);

  // Esc и фокус-трап. Слушаем документ, а не панель: после клика по затемнению
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

      // список пересобираем на каждый Tab: состав меняется по ходу формы
      // (поля становятся disabled на отправке, ряды схлопываются на успехе)
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.getClientRects().length > 0
      );
      const active = document.activeElement;
      // Панель как активный элемент считается «ни на чём», наравне с фокусом
      // снаружи. Сама она tabIndex=-1 и в очереди не стоит, но пока фокус на
      // ней, нативный Shift+Tab уходит к элементу ПЕРЕД панелью — то есть из
      // модалки наружу. На грубом указателе это состояние теперь возникает при
      // каждом открытии (фокус ставится на панель, а не в поле), так что дырой
      // трапа оно быть перестало и обязано оборачиваться на last.
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

  // Куда уходит фокус на открытии — зависит от указателя, и это не косметика.
  //
  // Точный указатель (мышь, трекпад): фокус на первое поле. Человек нажал
  // «talk to us», чтобы писать, и лишний Tab перед первой буквой — это трение.
  //
  // Грубый указатель (палец): фокус на саму панель. Фокус в поле немедленно
  // поднимает экранную клавиатуру, а она съедает нижнюю половину экрана —
  // на 375×812 панель занимает 503px из 812, с клавиатурой от неё не остаётся
  // почти ничего, и человек видит форму наполовину перекрытой ещё до того, как
  // решил, что заполнять. Панель фокусабельна (tabIndex=-1) и несёт role=dialog
  // с aria-labelledby: скринридер объявляет диалог, фокус-трап получает якорь
  // внутри панели, возврат фокуса на триггер работает как прежде.
  //
  // Критерий — (pointer: fine), то есть ОСНОВНОЙ указатель устройства: ноутбук
  // с сенсорным экраном остаётся «точным» и ведёт себя как десктоп, что и
  // требуется — клавиатура там физическая.
  useEffect(() => {
    if (state !== "open") return;
    const panel = panelRef.current;
    if (!panel) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const field = fine ? panel.querySelector<HTMLElement>("input, textarea") : null;
    (field ?? panel).focus({ preventScroll: true });
  }, [state]);

  // Шов ухода: узел живёт до конца перехода и только потом сообщает провайдеру.
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
      // проверяем «вне панели», а не target === currentTarget: затемнение —
      // отдельный узел, и клик по нему в корень оверлея не приходит
      if (!panelRef.current?.contains(event.target as Node)) onClose();
    },
    [onClose]
  );

  return (
    <div
      data-state={state}
      onPointerDown={onBackdropPointerDown}
      // m-auto у панели вместо items-center: при экране ниже панели авто-поля
      // схлопываются в ноль и верх панели остаётся доступным для скролла
      className="contact-overlay fixed inset-0 z-50 flex overflow-y-auto overscroll-contain p-4 md:p-6"
    >
      {/* затемнение отдельным узлом — у него собственный такт, панель едет позже */}
      <div
        aria-hidden
        className="contact-scrim fixed inset-0 bg-[rgb(29_29_31/0.28)] backdrop-blur-[20px]"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="contact-modal widget-glass relative m-auto w-full max-w-[420px] rounded-(--wg-radius-card) border border-(--wg-hairline) bg-(--wg-surface-base) p-6 backdrop-blur-xl md:p-7"
      >
        {/* Крестик. Esc и клик по затемнению закрывают модалку и без него, но у
            тача нет ни того, ни другого жеста в привычках — на телефоне это была
            бы комната без двери.
            Первым в разметке (а не последним) намеренно: фокус при открытии
            уходит на имя, и Shift+Tab с первого поля — кратчайший выход отсюда.
            Калибр — словарь .widget-glass: круг size-8 на --wg-surface-overlay,
            тот же, что у степперов ramp-виджета; stroke 1.5 как у глифов полей. */}
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

        {/* pr-10: заголовок держится подальше от крестика — на узком экране
            «Talk to us» и круг иначе встают вплотную */}
        <h2 id={titleId} className="pr-10 text-[1.375rem] font-semibold tracking-[-0.01em]">
          {contact.title}
        </h2>
        <p className="mt-2 text-[0.875rem] leading-relaxed text-(--wg-text-muted)">{contact.sub}</p>
        <ContactForm onClose={onClose} />
      </div>
    </div>
  );
}
