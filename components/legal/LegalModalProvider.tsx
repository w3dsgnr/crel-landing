"use client";

// Контекст легал-модалки и её портал. Прямой аналог ContactModalProvider —
// тот же портал в <body>, та же state-machine open/closing/exited, то же
// обоснование fixed inset-0 у оверлея (спека 2026-08-13 §Ограничения
// проекта). Отличие в одном: модалка контакта — одна форма, легал-модалка —
// один UI на четыре документа, поэтому контекст хранит ещё и то, какой из
// них сейчас открыт.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { createPortal } from "react-dom";
import type { LegalDocId } from "@/content/types";
import { legalDocs } from "@/content/legal";
import { LegalModal } from "./LegalModal";

interface LegalModalApi {
  openLegal(id: LegalDocId): void;
  close(): void;
}

const LegalModalContext = createContext<LegalModalApi | null>(null);

export function useLegalModal(): LegalModalApi {
  const api = useContext(LegalModalContext);
  // не молчаливый no-op: ссылка на легал вне провайдера — ошибка сборки
  // дерева, а мёртвая ссылка в футере иначе всплывёт только в проде
  if (!api) throw new Error("useLegalModal() вызван вне <LegalModalProvider>");
  return api;
}

export function LegalModalProvider({ children }: { children: ReactNode }): ReactElement {
  // Какой документ показываем. null — ничего не открывали ни разу; после
  // первого openLegal больше не возвращается в null (в отличие от isOpen),
  // потому что доигрывающему уходу узел ещё нужен — id для его контента.
  const [docId, setDocId] = useState<LegalDocId | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  // Фаза ухода — см. ContactModalProvider: логически модалка уже закрыта, но
  // узел держится в дереве, пока доигрывает переход.
  const [isClosing, setIsClosing] = useState(false);
  // Портала нет до монтирования: output: "export" прогоняет дерево на сборке,
  // где document отсутствует как понятие.
  const [isMounted, setIsMounted] = useState(false);
  // Элемент, с которого пришли. Легал-ссылок минимум пять (футер × 4, плюс
  // consent-ссылка в форме захвата e-mail финала) — «вернуть фокус на
  // ссылку» без запоминания превратилось бы в угадывание.
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => setIsMounted(true), []);

  const openLegal = useCallback(
    (id: LegalDocId) => {
      // Триггер захватываем только если модалка была полностью закрыта:
      // если она уже открыта (смена документа ссылкой внутри панели) или ещё
      // доигрывает уход, document.activeElement — узел внутри портала, и
      // фокус на выходе попал бы на демонтированный узел, то есть в body.
      if (!isOpen && !isClosing) {
        triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      }
      setDocId(id);
      // тот же документ уже на экране — просто меняем контент, хореография
      // (см. LegalModal) не перезапускается, потому что isOpen не трогаем;
      // другой документ при открытой модалке — тоже смена контента, без ухода
      // и повторного прихода панели
      setIsClosing(false);
      setIsOpen(true);
    },
    [isOpen, isClosing]
  );

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

  const api = useMemo<LegalModalApi>(() => ({ openLegal, close }), [openLegal, close]);

  return (
    <LegalModalContext.Provider value={api}>
      {children}
      {isMounted &&
        docId &&
        (isOpen || isClosing) &&
        createPortal(
          <LegalModal
            doc={legalDocs[docId]}
            state={isOpen ? "open" : "closing"}
            onClose={close}
            onExited={handleExited}
          />,
          document.body
        )}
    </LegalModalContext.Provider>
  );
}
