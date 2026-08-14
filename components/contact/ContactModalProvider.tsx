"use client";

// Контекст модалки контакта и её портал. Провайдер стоит в Landing — клиентская
// граница уже там, поэтому Header / Hero / Finale достают open() напрямую, без
// проброса колбэка через SectionRenderer и секции.
//
// Портал живёт в document.body и только пока модалка на экране: <body> размечен
// как min-h-full flex flex-col, и постоянный узел портала стал бы flex-item,
// растянувшим колонку. Отсюда же требование к оверлею быть fixed inset-0
// (спека 2026-08-13 §Ограничения проекта).
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { createPortal } from "react-dom";
import { ContactModal } from "./ContactModal";

interface ContactModalApi {
  isOpen: boolean;
  open(): void;
  close(): void;
}

const ContactModalContext = createContext<ContactModalApi | null>(null);

export function useContactModal(): ContactModalApi {
  const api = useContext(ContactModalContext);
  // не молчаливый no-op: кнопка вне провайдера — это ошибка сборки дерева,
  // а мёртвый CTA заметят только в проде
  if (!api) throw new Error("useContactModal() вызван вне <ContactModalProvider>");
  return api;
}

export function ContactModalProvider({ children }: { children: ReactNode }): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  // Фаза ухода. Логически модалка уже закрыта, но узел держится в дереве, пока
  // доигрывает переход: размонтирование — по колбэку onExited, не сразу.
  const [isClosing, setIsClosing] = useState(false);
  // Портала нет до монтирования: output: "export" прогоняет дерево на сборке,
  // где document отсутствует как понятие.
  const [isMounted, setIsMounted] = useState(false);
  // Элемент, с которого пришли. Кнопок-триггеров три (шапка, hero, финальный CTA) —
  // «вернуть фокус на CTA» без запоминания превратилось бы в угадывание.
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => setIsMounted(true), []);

  const open = useCallback(() => {
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    // повторное открытие поверх ещё не доигравшего ухода: отменяем уход,
    // модалка возвращается в open тем же узлом
    setIsClosing(false);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    if (!isOpen) return;
    setIsOpen(false);
    setIsClosing(true);
  }, [isOpen]);

  const handleExited = useCallback(() => {
    setIsClosing(false);
    // фокус возвращаем здесь, а не в close(): пока панель в дереве, ею владеет
    // фокус-трап, и триггер тут же потерял бы фокус на первом же Tab
    const trigger = triggerRef.current;
    triggerRef.current = null;
    trigger?.focus({ preventScroll: true });
  }, []);

  const api = useMemo<ContactModalApi>(() => ({ isOpen, open, close }), [isOpen, open, close]);

  return (
    <ContactModalContext.Provider value={api}>
      {children}
      {isMounted &&
        (isOpen || isClosing) &&
        createPortal(
          <ContactModal
            state={isOpen ? "open" : "closing"}
            onClose={close}
            onExited={handleExited}
          />,
          document.body
        )}
    </ContactModalContext.Provider>
  );
}
