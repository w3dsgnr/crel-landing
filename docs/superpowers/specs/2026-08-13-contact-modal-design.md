# Модалка захвата контакта (Talk to us)

Дата: 2026-08-13. Ветка: `merge/one-rail`.

## Задача

Кнопка «Talk to us» перестаёт быть якорем/mailto и открывает модальную форму:
контент страницы затемняется и блюрится, поверх всплывает светлая стеклянная
панель — имя, e-mail, сообщение, кнопка отправки. Валидация e-mail имеет
собственные состояния и анимации; отправка схлопывает поля и раскрывает
сообщение об успехе.

Референс пластики — карточки секции «Everything a financial app needs to move
money» (`components/sections/shared/Capabilities.tsx` → мокапы
`components/mockups/*Glass.tsx`, токены `.widget-glass` в `app/globals.css:455`).

## Ограничения проекта (проверено)

- `next.config.ts` → `output: "export"`. **Серверных роутов и server actions нет.**
  Отправка идёт через клиентский адаптер-заглушку (решение владельца).
- Зависимости: `gsap ^3.15`, `lenis ^1.3.25`, `next 16.2.11`, `react 19.2.4`.
  **framer-motion / motion / radix / vaul в проекте нет и не добавляются.**
  Анимации — CSS-transition с токенами проекта, GSAP только если без него никак.
- Модалок, порталов, форм и скролл-лока в кодовой базе не существует — всё
  заводится с нуля.
- `app/layout.tsx`: `<body class="min-h-full flex flex-col">`. Портал-узел
  становится flex-item → оверлей **обязан** быть `fixed inset-0`.
- `lib/lenis.ts` → `getLenis()` возвращает `null` при `prefers-reduced-motion:
  reduce` (Lenis тогда не создаётся). Любой скролл-лок обязан иметь нативный
  fallback, иначе на reduced-motion фон продолжит скроллиться.
- `components/landing/Landing.tsx` — `"use client"`. Всё, что он импортирует
  (Header, Hero, FinalCta, Footer), уже внутри клиентской границы: контекст
  доедет без переноса директив.

## Архитектура

```
Landing.tsx (client)
└── ContactModalProvider              ← контекст + портал
    ├── children (Header / main / Footer)  ← вызывают useContactModal().open()
    └── createPortal(<ContactModal/>, document.body)   ← только когда открыто
        └── ContactForm
            └── Field × 3
```

### Файлы

| Файл | Роль | Владелец-агент |
|---|---|---|
| `components/contact/ContactModalProvider.tsx` | контекст, портал, монтирование | A |
| `components/contact/ContactModal.tsx` | оверлей, фокус-трап, Esc, клик вне, появление/исчезание | A создаёт, D анимирует |
| `components/contact/ContactForm.tsx` | состояние формы, сабмит, хореография схлопывания | B создаёт, D анимирует |
| `components/contact/Field.tsx` | ряд-инпут + состояния валидации | B создаёт, C состояния |
| `lib/submitContact.ts` | адаптер отправки (заглушка) | A |
| `lib/useScrollLock.ts` | Lenis stop/start + нативный fallback | A |
| `lib/validateContact.ts` | правила валидации | C |
| `content/shared.ts`, `content/types.ts` | тексты | A |

## Контракты (фиксированы, менять нельзя)

```ts
// lib/submitContact.ts
export type ContactPayload = { name: string; email: string; message: string };
export type SubmitResult = { ok: true } | { ok: false; error: string };
export function submitContact(p: ContactPayload): Promise<SubmitResult>;

// lib/validateContact.ts
export type FieldName = "name" | "email" | "message";
/** null = валидно; строка = ключ/текст ошибки для показа под полем */
export function validateField(name: FieldName, value: string): string | null;
export function validateAll(p: ContactPayload): Partial<Record<FieldName, string>>;

// components/contact/ContactModalProvider.tsx
export function useContactModal(): {
  isOpen: boolean;
  open(): void;
  close(): void;
};
export function ContactModalProvider(p: { children: React.ReactNode }): React.ReactElement;

// components/contact/Field.tsx
export type FieldProps = {
  name: FieldName;
  label: string;
  placeholder: string;
  glyph: React.ReactNode;        // круглый глиф слева (@ / персона / реплика)
  multiline?: boolean;            // true → textarea
  value: string;
  onChange(v: string): void;
  onBlur(): void;
  error: string | null;           // текст ошибки или null
  isValid: boolean;               // прошло проверку И не пусто → кольцо-чек
  disabled?: boolean;
};

// lib/useScrollLock.ts
export function useScrollLock(active: boolean): void;
```

Состояние формы (внутри `ContactForm`):
`type FormPhase = "editing" | "submitting" | "success" | "error"`.

## Визуальный словарь (значения дословные, ничего нового не изобретаем)

Все значения ниже уже существуют в `app/globals.css` в скоупе `.widget-glass`
(строки 455-490). Панель модалки получает класс `widget-glass` и одно
скоуп-переопределение токена — по тому же приёму, что `.layer-v4-invert
.widget-glass` (globals.css:481-483).

| Роль | Значение |
|---|---|
| Затемнение фона | `background: rgb(29 29 31 / 0.28)`, `backdrop-filter: blur(20px)` |
| Панель | `border-radius: var(--wg-radius-card)` = 36px; `border: 1px solid var(--wg-hairline)`; `backdrop-filter: blur(24px)` (`backdrop-blur-xl`) |
| Фон панели | `--wg-surface-base: rgb(255 255 255 / 0.82)` — переопределение в скоупе `.contact-modal`; базовые `.55` на затемнённом фоне не держат контраст текста |
| Поле (ряд) | `border-radius: var(--wg-radius-row)` = 18px; `background: var(--wg-surface-raised)` = `rgb(255 255 255 / .75)`; `padding: 14px 16px` (`px-4 py-3.5`) |
| Глиф поля | `size-9 rounded-full bg-(--wg-surface-overlay)`, цвет `--wg-text-muted` |
| Кнопка отправки | `rounded-full bg-(--wg-action)` = `#1d1d1f`, текст `--wg-text-on-action`, `py-3.5 text-[0.875rem] font-medium` |
| Текст | ink `--wg-text` `#1d1d1f`; muted `--wg-text-muted` `#6e6e73`; акцент `--wg-accent` `#2e7cf6` |
| Ошибка | `--v4-warn` `#ff9f0a` (токен уже есть в `.layer-v4`) |
| Кольцо-чек успеха | дословно из `RampWidgetGlass.tsx:93-97`: `size-8 rounded-full border-2 border-(--wg-accent)` + `<path d="M2 6.2 5 9l5-6" stroke="var(--wg-accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>` |

Шрифты: гротеск по умолчанию; `font-mono` (`--font-mono-data`) только для
данных/статусов — в полях формы **не применять**.

## Motion-токены (только эти)

- `--ease-out-expo` `cubic-bezier(0.16, 1, 0.3, 1)` — появление
- `--ease-swap` `cubic-bezier(0.65, 0, 0.35, 1)` — смена состояний, закрытие
- `--d-quick` 200ms · `--d-base` 400ms
- Принятая грамматика проекта: появление 0.4-0.7s, `y` 12-24px, stagger 60ms

### Хореография

**Открытие.** Подложка `opacity 0→1` 200ms. Панель `opacity 0→1`,
`scale .96→1`, `translateY 8→0` — 300ms `--ease-out-expo`, старт +40ms после
подложки.

**Закрытие.** Быстрее открытия: 180ms `--ease-swap`, панель `scale 1→.98`,
`translateY 0→6`, подложка гаснет одновременно. Размонтирование — после
завершения перехода (`transitionend` или таймер, не раньше).

**Валидация.** Late validation / early revalidation: поле проверяется на
`blur`; после первой показанной ошибки — на каждый `input`. Сообщение ошибки
раскрывается через `grid-template-rows: 0fr → 1fr` (без магических высот).
Валидное непустое поле — кольцо-чек справа внутри поля.

**Отправка.** `submitting` → кнопка переходит в прогресс, поля `disabled`.
`success` → ряды схлопываются снизу вверх (`grid-template-rows` + `opacity`,
stagger ~50ms), панель доезжает до компактной высоты, проявляется кольцо-чек и
текст успеха. Закрытие — по кнопке и автоматически через ~3s.

**prefers-reduced-motion: reduce.** Никаких переходов: состояния
переключаются мгновенно, содержимое сразу в конечном виде. Модель — как
`lib/usePlayOnce.ts`: SSR / no-JS / reduced-motion = конечное состояние.

## Доступность

- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` на заголовок панели.
- Фокус уходит на первое поле при открытии, возвращается на кнопку-триггер при
  закрытии (триггер запоминается в провайдере).
- Фокус-трап по Tab/Shift+Tab внутри панели; Esc закрывает; клик по подложке
  закрывает, клик по панели — нет.
- Ошибки — `aria-invalid` + `aria-describedby` на поле; контейнер ошибки
  `role="alert"`. Успех — `role="status"` / `aria-live="polite"`.
- Кнопка-триггер: `<button type="button">`, не `<a>`.

## Точки подключения

| Файл | Было | Стало |
|---|---|---|
| `components/landing/Landing.tsx` | фрагмент | обёрнут в `ContactModalProvider` |
| `components/landing/Header.tsx:43` | `<a href="#contact">` | `<button onClick={open}>`, классы без изменений |
| `components/landing/Hero.tsx:23-48` (`Cta`) | `<a href="#contact">` | `<button onClick={open}>` |
| `components/sections/shared/FinalCta.tsx:7-33` (`CtaButton`) | `<a href="mailto:info@crel.ch">` | `<button onClick={open}>` |

`id="contact"` на секции `FinalCta.tsx:37` **остаётся** — на него ведут ссылки
и он часть скролл-структуры. Ссылка в футере остаётся `mailto` (решение
владельца). Мёртвая ветка `primary={false}` в `Cta`/`CtaButton` не трогается —
это вне скоупа.

## Тексты (`content/shared.ts`)

```ts
contact: {
  title: "Talk to us",
  sub: "…",
  nameLabel / namePlaceholder,
  emailLabel / emailPlaceholder,
  messageLabel / messagePlaceholder,
  submit: "Send",
  sending: "Sending",
  successTitle / successBody,
  errorGeneric,
  errors: { nameRequired, emailRequired, emailInvalid, messageRequired },
}
```

Регистр и тон — как в остальном контенте: lowercase-лейблы, короткие фразы.

## Вне скоупа

- Реальный почтовый провайдер и смена модели деплоя.
- Рефактор `Cta`/`CtaButton` в общий компонент.
- Капча, rate limiting, аналитика.
