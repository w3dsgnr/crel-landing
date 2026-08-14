"use client";

// Ряд-поле модалки контакта (спека 2026-08-13 §Визуальный словарь).
// Материал дословно из семейства стеклянных приборов: узел-строка ramp-виджета
// (RampWidgetGlass.tsx:79 — rounded-(--wg-radius-row) + --wg-surface-raised +
// px-4 py-3.5) с круглым глифом слева по образцу Stepper (RampWidgetGlass.tsx:27
// — size-9 rounded-full bg-(--wg-surface-overlay)). Токены --wg-* приходят
// каскадом с панели модалки: она несёт класс .widget-glass.
//
// Лейбл живёт ВНУТРИ ряда над инпутом (двухэтажный узел, как строка счёта в
// IbanAccountGlass): плавающих лейблов в языке проекта нет, а подпись обязана
// оставаться видимой во время ввода.
//
// ── Слой состояний и движения (проход 2026-08-13) ─────────────────────────
// Три жеста на поле и ни одного лишнего:
//   1. ошибка — раскрытие трека грида (accordion) + проявление текста;
//   2. вердикт — «щелчок» кольца (pop in) и прорисовка чека обводкой
//      (line drawing через stroke-dashoffset);
//   3. блокировка на отправке — только проявление, без движения.
// Значения — только токены: --d-quick / --ease-out-expo (появление) и
// --ease-swap (уход, смена состояния). Все транзишены под motion-safe:,
// поэтому при reduce они не объявлены вовсе и состояние переключается сразу;
// прятать их за matchMedia не нужно — гидрация тут ни при чём.
//
// Фокус НЕ анимируется сознательно: рамку приносит Tab, а это движение человек
// повторяет десятки раз за сессию — любая задержка на нём читается как тормоз
// (правило частоты: чем чаще человек видит такт, тем короче он должен быть,
// вплоть до нуля). Рамка живёт в outline, а outline в список анимируемых
// свойств ниже не входит — она приходит мгновенно по построению.
//
// Shake/wiggle на ошибку РЕШЕНО не делать. Он не сообщает ничего сверх цвета
// --v4-warn и раскрывшейся строки, то есть был бы движением ради движения;
// он требует @keyframes (не транзишена) и потому рвётся с нуля при быстром
// blur→правка→blur; и он дёргает ровно ту мишень, в которую человек сейчас
// целится курсором. Язык проекта — сдержанный transform-only без осцилляций
// (lib/reveal.ts, .iso-rise), громче всего в нём звучит .wg-pop на 180ms.
import { useEffect, useId, useState } from "react";
import type { FieldName } from "@/lib/validateContact";

export type FieldProps = {
  name: FieldName;
  label: string;
  placeholder: string;
  glyph: React.ReactNode; // круглый глиф слева (@ / персона / реплика)
  multiline?: boolean; // true → textarea
  value: string;
  onChange(v: string): void;
  onBlur(): void;
  error: string | null; // текст ошибки или null
  isValid: boolean; // прошло проверку И не пусто → кольцо-чек
  disabled?: boolean;
};

// автозаполнение по роли поля: браузерная подстановка — единственная «быстрая
// дорожка» формы, отключать её незачем. type="email" даёт правильную клавиатуру
// на тач-устройствах; нативную валидацию гасит noValidate на <form>.
const AUTOCOMPLETE: Record<FieldName, string> = {
  name: "name",
  email: "email",
  message: "off",
};

/** = --d-quick. Число нужно ровно одному таймеру (удержание текста ошибки на
 *  время схлопывания, см. ниже): читать токен из computed-стиля ради 200ms
 *  дороже, чем держать константу рядом с объяснением. */
const D_QUICK_MS = 200;

/** Кольцо-чек валидного поля — словарь тоста RampWidgetGlass.tsx:131-137,
 *  калибр уменьшен под ряд формы (32px рядом с 36px-глифом читались бы как
 *  пара равных объектов, а чек — это ответ прибора, а не второй элемент).
 *
 *  Смонтировано ВСЕГДА, видимость переключает active. Причина не в анимации, а
 *  в раскладке: условный монтаж менял бы ширину ряда в тот же кадр, в который
 *  мы показываем вердикт, — поле дёргалось бы ровно там, где должно быть
 *  спокойным. 28px слота зарезервированы всегда, появление чека не двигает ни
 *  одного пикселя вокруг.
 *
 *  Такт: кольцо щёлкает (opacity + scale 0.6→1 — дословно словарь .wg-pop,
 *  globals.css:577-585, «ничто не появляется из ничего»), чек дорисовывается
 *  следом обводкой (stroke-dashoffset при pathLength=1 — тот же приём, что
 *  дуга прогресса в KycFlowGlass.tsx:80-86). Задержка чека 80ms — калибр
 *  каскада приборов (chipDelay в KycFlowGlass.tsx:66); весь такт укладывается
 *  в 280ms, потолок отклика UI.
 *
 *  Задержка висит ТОЛЬКО на входе: transition-delay действует в обе стороны
 *  (ловушка, описанная в lib/usePlayOnce.ts), и на уходе кольцо погасло бы
 *  раньше, чем чек начал стираться.
 *
 *  Свойства перечислены как scale/translate, а НЕ transform: Tailwind v4 пишет
 *  утилиты трансформа в отдельные CSS-свойства (scale: var(--tw-scale-x) …),
 *  и transition-property: transform их не покрывает. */
function CheckRing({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-(--wg-accent) motion-safe:transition-[opacity,scale] motion-safe:duration-(--d-quick) ${
        active
          ? "scale-100 opacity-100 motion-safe:ease-(--ease-out-expo)"
          : "scale-60 opacity-0 motion-safe:ease-(--ease-swap)"
      }`}
    >
      <svg viewBox="0 0 12 12" className="size-3">
        <path
          d="M2 6.2 5 9l5-6"
          fill="none"
          stroke="var(--wg-accent)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          // pathLength=1 нормирует длину: дальше dasharray/dashoffset считаются
          // в долях пути и не зависят от геометрии галки
          pathLength={1}
          strokeDasharray={1}
          style={{ strokeDashoffset: active ? 0 : 1 }}
          className={`motion-safe:transition-[stroke-dashoffset] motion-safe:duration-(--d-quick) motion-safe:ease-(--ease-out-expo) ${
            active ? "motion-safe:delay-[80ms]" : ""
          }`}
        />
      </svg>
    </span>
  );
}

export function Field({
  name,
  label,
  placeholder,
  glyph,
  multiline = false,
  value,
  onChange,
  onBlur,
  error,
  isValid,
  disabled = false,
}: FieldProps) {
  // id генерируем, а не лепим из name: модалка в теории может быть смонтирована
  // не в одном экземпляре, а дубли id ломают связку label ↔ input
  const uid = useId();
  const inputId = `${uid}-input`;
  const errorId = `${uid}-error`;

  // Текст ошибки переживает схлопывание. Если снять его в тот же кадр, что и
  // трек грида, человек увидит, как сжимается ПУСТАЯ полоса в 24px — самый
  // заметный дефект всего такта. Держим последний текст ровно на длину
  // перехода и только потом отдаём живой регион пустым: оставлять прочитанную
  // ошибку в role="alert" насовсем нельзя, схлопнутый узел остаётся в дереве
  // доступности и читался бы в режиме обзора.
  const [held, setHeld] = useState<string | null>(error);
  useEffect(() => {
    if (error) {
      setHeld(error);
      return;
    }
    const t = window.setTimeout(() => setHeld(null), D_QUICK_MS);
    return () => window.clearTimeout(t);
  }, [error]);
  // живая ошибка приоритетнее удержанной: смена текста (required → invalid)
  // должна доезжать в тот же кадр, а не через таймер
  const shown = error ?? held;

  // общий набор атрибутов input/textarea: различаются только тегом и rows
  const shared = {
    id: inputId,
    name,
    value,
    placeholder,
    disabled,
    autoComplete: AUTOCOMPLETE[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    onBlur,
    "aria-invalid": error ? true : undefined,
    // describedby вешаем только при живой ошибке: пустой контейнер-alert в
    // описании поля читался бы скринридером как пауза без причины
    "aria-describedby": error ? errorId : undefined,
    className:
      "w-full bg-transparent text-[0.9375rem] text-(--wg-text) placeholder:text-(--wg-text-muted) outline-none disabled:cursor-not-allowed",
  };

  return (
    <div>
      {/* корпус ряда: has-[:focus-visible] вместо focus-within — рамка нужна
          клавиатуре, а не мыши; значения (2px accent, offset 2) те же, что у
          глобального правила фокуса в globals.css:99. Транзишен объявлен
          только на opacity: блокировка на время отправки — смена состояния
          (--ease-swap), а рамка фокуса обязана оставаться мгновенной. */}
      <div
        className={`flex gap-3 rounded-(--wg-radius-row) bg-(--wg-surface-raised) px-4 py-3.5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-(--wg-accent) motion-safe:transition-opacity motion-safe:duration-(--d-quick) motion-safe:ease-(--ease-swap) ${
          multiline ? "items-start" : "items-center"
        } ${disabled ? "opacity-60" : ""}`}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-(--wg-surface-overlay) text-(--wg-text-muted)">
          {glyph}
        </span>
        <div className="min-w-0 flex-1">
          <label htmlFor={inputId} className="block text-[0.8125rem] text-(--wg-text-muted)">
            {label}
          </label>
          {multiline ? (
            // rows фиксирован: авто-рост менял бы высоту панели во время ввода,
            // а панель модалки уже двигается по своей хореографии
            <textarea {...shared} rows={3} className={`${shared.className} resize-none`} />
          ) : (
            <input {...shared} type={name === "email" ? "email" : "text"} />
          )}
        </div>
        <CheckRing active={isValid} />
      </div>

      {/* Контейнер ошибки: grid-template-rows 0fr → 1fr — раскрытие без
          магических высот (спека §Хореография).
          role="alert" на постоянно смонтированном контейнере, а не на тексте:
          живой регион должен существовать ДО появления сообщения, иначе часть
          скринридеров пропускает первую ошибку.

          Единственное место, где мы анимируем layout-свойство. Осознанно:
          альтернативы — либо магическая высота (ломается на переносе строки),
          либо scaleY (сплющил бы буквы). Цена мала — один узел с одной строкой
          внутри модалки, не список и не скролл-связка.
          Асимметрия кривых: раскрытие --ease-out-expo (появление начинается
          сразу, отклик читается мгновенным), схлопывание --ease-swap — это уже
          не появление, а смена состояния, и по спеке им же закрывается сама
          модалка. Класс кривой меняется в том же коммите, что и трек, поэтому
          переход стартует уже с нужной. */}
      <div
        id={errorId}
        role="alert"
        className={`grid motion-safe:transition-[grid-template-rows] motion-safe:duration-(--d-quick) ${
          error ? "motion-safe:ease-(--ease-out-expo)" : "motion-safe:ease-(--ease-swap)"
        }`}
        style={{ gridTemplateRows: error ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          {/* --v4-warn объявлен в .layer-v4, но портал висит на <body> вне
              этого скоупа — токен переобъявлен на панели (globals.css:489).
              Текст не просто открывается шторкой, а выезжает из-под ряда:
              −4px → 0. Амплитуда — мелкий калибр словаря приборов
              (--wg-rise-y: 4px, globals.css:560; 8px на строке в 12px читались
              бы прыжком), направление — сверху, как у .wg-rise-drop, потому
              что сообщение физически выдаёт поле над ним. */}
          <p
            className={`px-4 pt-2 text-[0.75rem] text-(--v4-warn) motion-safe:transition-[opacity,translate] motion-safe:duration-(--d-quick) motion-safe:ease-(--ease-out-expo) ${
              error ? "translate-y-0 opacity-100" : "opacity-0 motion-safe:-translate-y-1"
            }`}
          >
            {shown}
          </p>
        </div>
      </div>
    </div>
  );
}
