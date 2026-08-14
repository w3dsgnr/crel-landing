"use client";

// Форма модалки контакта (спека 2026-08-13). Пластика — семейство стеклянных
// приборов: три ряда-узла (Field), тёмная пилюля действия по образцу
// RampWidgetGlass.tsx:105 и кольцо-чек вердикта дословно оттуда же (:131-137).
// Заголовок панели и кнопка закрытия — зона ContactModal (ему нужен id для
// aria-labelledby), здесь только тело формы.
//
// Тексты — content/shared.ts §contact, без единой строки в JSX: копирайт
// проекта живёт только в content/*.
import { useEffect, useRef, useState } from "react";
import { contact } from "@/content/shared";
import { submitContact, type ContactPayload, type SubmitResult } from "@/lib/submitContact";
import { validateAll, validateField, type FieldName } from "@/lib/validateContact";
import { Field } from "./Field";

export type FormPhase = "editing" | "submitting" | "success" | "error";

/** после успеха модалка закрывается сама (спека §Хореография: «~3s») */
const SUCCESS_CLOSE_MS = 3000;

/** Шаг очереди схлопывания рядов (спека §Отправка). 50ms — низ шкалы проекта
 *  (reveal идёт на 60ms): здесь очередь из четырёх узлов внутри одной панели,
 *  а не секция во весь экран, и на 60ms хвост уже начинает читаться как
 *  задержка отправки, а не как одно движение. */
const STAGGER_MS = 50;

// Глифы полей: инлайновый SVG в тоне проекта — тонкий stroke 1.5, скруглённые
// концы, currentColor (наследует --wg-text-muted у круга). Тот же приём, что
// STEP_ICONS в KycFlowGlass.tsx:22 — иконочных библиотек в проекте нет.
function Glyph({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

const GLYPHS: Record<FieldName, React.ReactNode> = {
  // персона
  name: (
    <Glyph>
      <circle cx="8" cy="5.4" r="2.6" />
      <path d="M2.9 13.9c0-2.7 2.3-4.3 5.1-4.3s5.1 1.6 5.1 4.3" />
    </Glyph>
  ),
  // «собака» — знак адреса, а не конверт: конверт означал бы отправку письма
  email: (
    <Glyph>
      <circle cx="8" cy="8" r="2.6" />
      <path d="M10.6 5.4v3.4c0 1.1.6 1.8 1.6 1.8 1.2 0 1.9-1.1 1.9-3 0-3.6-2.4-6.1-6.1-6.1S1.9 4.4 1.9 8s2.5 6.1 6.1 6.1c1.3 0 2.4-.3 3.3-.9" />
    </Glyph>
  ),
  // реплика: облако с хвостом и двумя строками текста
  message: (
    <Glyph>
      <path d="M14 4.5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h1v3l3.4-3H12a2 2 0 0 0 2-2Z" />
      <path d="M5.4 5.9h5.2M5.4 8.4h3.1" />
    </Glyph>
  ),
};

/** стрелка в круге у правого края пилюли (референс тёмной кнопки) */
function ActionArrow() {
  return (
    <span
      aria-hidden
      className="absolute top-1/2 right-2.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/15"
    >
      <svg
        viewBox="0 0 16 16"
        className="size-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3.2 8h9.6M9 4.2 12.8 8 9 11.8" />
      </svg>
    </span>
  );
}

/** Кольцо-чек успеха — дословно тост RampWidgetGlass.tsx:131-137 (полный
 *  калибр size-8: это вердикт всей операции, а не отметка поля).
 *  contact-success-ring — ручка для «щелчка» кольца в конце сцены (globals.css). */
function SuccessRing() {
  return (
    <span
      className="contact-success-ring flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-(--wg-accent)"
      aria-hidden
    >
      <svg viewBox="0 0 12 12" className="size-3.5">
        <path
          d="M2 6.2 5 9l5-6"
          fill="none"
          stroke="var(--wg-accent)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/**
 * Обёртка схлопывания ряда. Механика та же, что у контейнера ошибки в Field:
 * grid-template-rows 0fr → 1fr, клип во внутреннем div.
 *
 * Три уровня, а не два: отступ между рядами обязан схлопываться вместе с
 * рядом, но на самом grid-элементе padding пережил бы обнуление трека (борд-бокс
 * не сжимает паддинг — проверено, оставалось 8px на ряд). Поэтому клип пустой,
 * а pb-2 лежит на третьем узле внутри него.
 *
 * step — место ряда в очереди схлопывания, считая СНИЗУ (спека §Отправка:
 * «снизу вверх, stagger ~50ms»). Задержка уезжает в CSS переменной, а не в
 * transitionDelay: у ряда и у его клипа разные длительности и общая задержка —
 * одно значение на два правила (тот же приём, что --wg-t0 в Capabilities).
 */
function CollapsibleRow({
  collapsed,
  step = 0,
  children,
}: {
  collapsed: boolean;
  step?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="contact-row grid"
      style={
        {
          gridTemplateRows: collapsed ? "0fr" : "1fr",
          "--row-delay": `${step * STAGGER_MS}ms`,
        } as React.CSSProperties
      }
      inert={collapsed}
    >
      <div className="contact-row-clip overflow-hidden">
        <div className="pb-2">{children}</div>
      </div>
    </div>
  );
}

const EMPTY: ContactPayload = { name: "", email: "", message: "" };

export function ContactForm({ onClose }: { onClose(): void }) {
  const [values, setValues] = useState<ContactPayload>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [phase, setPhase] = useState<FormPhase>("editing");
  // текст провала отправки: адаптер возвращает свой, generic — на всякий случай
  const [failure, setFailure] = useState<string | null>(null);

  const busy = phase === "submitting";
  const done = phase === "success";

  // Ключ в errors существует, ТОЛЬКО пока ошибка показана: на этом стоит
  // «early revalidation» ниже, поэтому валидное поле ключ теряет, а не
  // получает undefined.
  const setError = (name: FieldName, message: string | null) =>
    setErrors((prev) => {
      if (message) return { ...prev, [name]: message };
      if (!(name in prev)) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });

  // Поля, которых человек КАСАЛСЯ (значение менялось хотя бы раз). Ref, а не
  // state: от «тронутости» не зависит ни один пиксель разметки — её читает
  // только обработчик blur в момент события, и заводить ре-рендер на первом
  // нажатии клавиши незачем. Набор живёт ровно столько же, сколько форма:
  // модалка размонтируется при закрытии, и следующее открытие начинается с
  // чистого листа — как и значения полей.
  const dirty = useRef<Set<FieldName>>(new Set());

  // Late validation / early revalidation (спека §Валидация): до первой
  // показанной ошибки поле молчит, после — переспрашивается на каждый ввод.
  // Логика намеренно разведена по двум ручкам change/blur.
  const change = (name: FieldName) => (v: string) => {
    dirty.current.add(name);
    setValues((prev) => ({ ...prev, [name]: v }));
    if (errors[name]) setError(name, validateField(name, v));
  };

  /**
   * Blur МОЛЧИТ на нетронутом пустом поле. Модалка ставит автофокус на первое
   * поле, и человек, кликнувший сразу в e-mail, получал под именем «Tell us who
   * is writing» — выговор за то, чего он ещё не делал (дефект найден на
   * скриншотах 2026-08-13). Требование при этом никуда не девается: на сабмите
   * validateAll показывает все три ошибки разом — вот там спрашивать законно.
   *
   * Условие «не трогали И пусто», а не просто «не трогали»: автозаполнение
   * браузера кладёт значение мимо нашего onChange, и такое поле остаётся
   * pristine. Непустое поле проверить на blur нужно — required-ошибку оно
   * породить не может по определению, а вот кривой подставленный адрес поймает.
   *
   * Ранний выход НЕ гасит уже показанную ошибку (до setError мы просто не
   * доходим): иначе проход табом по форме стирал бы то, что показал сабмит.
   */
  const blur = (name: FieldName) => () => {
    if (!dirty.current.has(name) && values[name].trim() === "") return;
    setError(name, validateField(name, values[name]));
  };

  // кольцо-чек только у непустого прошедшего поля: у пустого «валидно» нет
  const valid = (name: FieldName) => values[name].trim().length > 0 && !validateField(name, values[name]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // preventDefault, иначе статический экспорт просто перезагрузит страницу;
    // сабмит формой (а не onClick) нужен, чтобы работал Enter в полях
    e.preventDefault();
    if (busy || done) return;

    const found = validateAll(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setPhase("submitting");
    setFailure(null);
    const result: SubmitResult = await submitContact(values);
    if (result.ok) {
      setPhase("success");
      return;
    }
    // ошибка отправки не должна стирать введённое: поля остаются как были,
    // фаза возвращает кнопку в исходное состояние — повтор по той же кнопке
    setFailure(result.error || contact.errorGeneric);
    setPhase("error");
  };

  // «свежая ссылка»: таймер успеха не должен перезаводиться из-за того, что
  // родитель пересоздал onClose на очередном рендере
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  // success сам закрывает модалку: держать на экране прочитанный вердикт нечем
  useEffect(() => {
    if (phase !== "success") return;
    const t = window.setTimeout(() => closeRef.current(), SUCCESS_CLOSE_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  const fields: { name: FieldName; label: string; placeholder: string; multiline?: boolean }[] = [
    { name: "name", label: contact.nameLabel, placeholder: contact.namePlaceholder },
    { name: "email", label: contact.emailLabel, placeholder: contact.emailPlaceholder },
    { name: "message", label: contact.messageLabel, placeholder: contact.messagePlaceholder, multiline: true },
  ];

  return (
    // noValidate: нативные пузыри браузера конкурировали бы с нашими рядами
    // ошибок и не подчиняются языку модалки. data-phase — ручка для
    // анимационного прохода (хореография читает фазу из DOM, не из React).
    <form onSubmit={onSubmit} noValidate data-phase={phase} className="mt-5">
      {fields.map((f, i) => (
        // step считается снизу: кнопка уходит первой (step 0), за ней message,
        // email, name. Очередь идёт от места нажатия вверх — движение как бы
        // продолжает жест человека, а не спорит с ним.
        <CollapsibleRow key={f.name} collapsed={done} step={fields.length - i}>
          <Field
            name={f.name}
            label={f.label}
            placeholder={f.placeholder}
            multiline={f.multiline}
            glyph={GLYPHS[f.name]}
            value={values[f.name]}
            onChange={change(f.name)}
            onBlur={blur(f.name)}
            error={errors[f.name] ?? null}
            isValid={valid(f.name)}
            // в success поля тоже disabled: схлопнутый ряд остаётся в DOM,
            // а живой инпут внутри него ловил бы Tab
            disabled={busy || done}
          />
        </CollapsibleRow>
      ))}

      <CollapsibleRow collapsed={done} step={0}>
        {/* главное действие — тёмная пилюля (RampWidgetGlass.tsx:105) плюс круг
            со стрелкой у правого края; текст остаётся отцентрованным по ряду.
            contact-submit — ручка для hover/press-состояний в globals.css:
            нажатие обязано быть видимым, иначе 900ms заглушки читаются как
            «кнопка не сработала» */}
        <button
          type="submit"
          // на успехе тоже disabled: ряд схлопнут и inert, но фокус-трап модалки
          // отбирает кандидатов по :not([disabled]) — не отдаём ему пустой ряд
          disabled={busy || done}
          className="contact-submit relative w-full cursor-pointer rounded-full bg-(--wg-action) py-3.5 text-center text-[0.875rem] font-medium text-(--wg-text-on-action) disabled:cursor-not-allowed disabled:opacity-70"
        >
          {busy ? contact.sending : contact.submit}
          <ActionArrow />
        </button>
      </CollapsibleRow>

      {/* провал отправки — тот же механизм раскрытия, что у ошибок полей */}
      <div
        className="contact-alert grid"
        role="alert"
        style={{ gridTemplateRows: failure ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="pt-2 text-center text-[0.8125rem] text-(--v4-warn)">{failure}</p>
        </div>
      </div>

      {/* Вердикт: тот же «щелчок» кольца-чека, что закрывает сцену ramp-виджета.
          Живой регион смонтирован всегда, а содержимое приходит в момент
          успеха — тогда скринридер объявляет появление, а не молчит на смене
          видимости.
          Отсюда же способ анимации: contact-success-body приходит в DOM уже в
          конечном виде, и стартовую позу ему даёт @starting-style (globals.css).
          Раскрывать содержимое через data-phase было нельзя — пришлось бы
          держать текст успеха в разметке с самого начала, и живой регион
          промолчал бы. Обёртка одна на кольцо и текст: py-2 обязан лежать
          ВНУТРИ клипа третьим уровнем (см. CollapsibleRow). */}
      <div className="contact-success grid" style={{ gridTemplateRows: done ? "1fr" : "0fr" }}>
        <div className="overflow-hidden">
          <div role="status" aria-live="polite">
            {done && (
              <div className="contact-success-body flex items-center gap-3 py-2">
                <SuccessRing />
                <div className="min-w-0">
                  <p className="text-[0.9375rem] font-medium text-(--wg-text)">{contact.successTitle}</p>
                  <p className="mt-0.5 text-[0.8125rem] text-(--wg-text-muted)">{contact.successBody}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
