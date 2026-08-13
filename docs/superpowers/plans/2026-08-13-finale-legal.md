# Финал страницы + легал: план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Снять секцию Partners, поставить синий полноэкранный финал (анимированный логотип, e-mail захват, talk to us), футер с навигацией и легал-ссылками, легальные документы как широкие модалки.

**Architecture:** Спека — `docs/superpowers/specs/2026-08-13-finale-legal-design.md` (обязательна к прочтению каждым исполнителем ЦЕЛИКОМ до первой правки). Три волны: контент → легал-модалки → финал+футер. Файловое владение волн не пересекается, кроме `Landing.tsx` и `globals.css` (последовательное исполнение).

**Tech Stack:** Next 16 (output: export), React 19, Tailwind v4 (токены в globals.css), GSAP/Lenis уже есть — новых зависимостей НЕТ.

## Global Constraints

- Прочитать `AGENTS.md`: перед кодом сверяться с `node_modules/next/dist/docs/` (нестандартная версия Next).
- Тестовой инфраструктуры в проекте нет. Проверка каждой задачи: `npm run build` (включает tsc) — зелёный, ноль новых warnings.
- Никаких новых зависимостей и никаких server actions / route handlers (`output: "export"`).
- Все цвета/радиусы/easing — только токены `app/globals.css`. Мелкий белый текст НЕ на `#2e7cf6` (3.94:1) — только на `#2668d9`+ (5.17:1). Вторичный текст на синем ≥ `white/85`.
- Копирайт UI — lowercase-тон проекта; юридический текст — обычный регистр. Весь текст живёт в `content/*`, в компонентах строк нет.
- Комментарии в коде — по-русски, в духе соседних файлов: фиксируют ограничения, не пересказывают строки.
- reduced-motion: конечное состояние без переходов (существующая грамматика).
- Коммит после каждой задачи (`git add` точечно, сообщение `feat(finale): …` / `feat(legal): …` / `chore(partners): …`).

---

### Task 1 (Агент 1): Снятие Partners + контентный слой

**Files:**
- Modify: `config/sections.ts` (снять запись `proof-partners`, импорты `Partners`, `partners`)
- Delete: `components/sections/platform/Partners.tsx`
- Modify: `content/platform.ts` (снять `export const partners`; `SectionCopy`-импорт оставить, он нужен соседям)
- Modify: `content/types.ts` (добавить типы ниже; `FinalCtaContent` НЕ трогать — его снимет Task 3)
- Modify: `content/shared.ts` (добавить `finale`, расширить `footer`; `finalCta` НЕ трогать)
- Create: `content/legal.ts`

**Interfaces (Produces — на них обопрутся Task 2 и 3):**

```ts
// content/types.ts — добавить:
export type LegalDocId = "privacy" | "cookies" | "terms" | "imprint";
export interface LegalSection { heading: string; paras: string[]; bullets?: string[] }
export interface LegalDoc {
  id: LegalDocId;
  title: string;
  updated: string; // "August 2026"
  intro: string;
  sections: LegalSection[];
}
export interface FinaleContent {
  sub: string;
  emailLead: string;
  emailPlaceholder: string;
  emailSubmit: string;
  emailSending: string;
  emailSuccess: string;
  emailErrorGeneric: string;
  consentPrefix: string;
  consentLinkLabel: string;
  ctaPrimary: string;
}
```

```ts
// content/legal.ts — каркас:
import type { LegalDoc, LegalDocId } from "./types";
export const legalDocs: Record<LegalDocId, LegalDoc> = { privacy: {…}, cookies: {…}, terms: {…}, imprint: {…} };
export const legalOrder: LegalDocId[] = ["privacy", "cookies", "terms", "imprint"];
```

```ts
// content/shared.ts — добавить (дословно):
export const finale: FinaleContent = {
  sub: "First call is a working session on your stack, not a pitch.",
  emailLead: "Not ready to talk? Leave an email — we write when there is something to show.",
  emailPlaceholder: "you@company.com",
  emailSubmit: "Subscribe",
  emailSending: "Sending",
  emailSuccess: "You're on the list. We write rarely.",
  emailErrorGeneric: "Could not subscribe. Write to info@crel.ch instead.",
  consentPrefix: "By subscribing you accept the ",
  consentLinkLabel: "privacy policy",
  ctaPrimary: "Talk to us_",
};

// footer — расширить объект (существующие поля не менять):
export const footer = {
  legal: "…как сейчас…",
  complianceStrip: "…как сейчас…",
  email: "info@crel.ch",
  copyright: "© Crel 2026",
  navLabel: "site",
  legalLabel: "legal",
  legalLinks: [
    { id: "privacy", label: "privacy" },
    { id: "cookies", label: "cookies" },
    { id: "terms", label: "terms" },
    { id: "imprint", label: "imprint" },
  ] satisfies { id: LegalDocId; label: string }[],
};
```

**Контент четырёх документов** — по спеке §Контент легала: EN, обычный регистр,
все реквизиты `[VERIFY: credentials от Roman]`, контролёр «Crel [AG], Zurich,
Switzerland [VERIFY]», контакт info@crel.ch. Privacy: перечислить РОВНО те
данные, что собирают формы (имя/e-mail/сообщение; e-mail подписки), основания
GDPR 6(1)(a)/6(1)(f), права art. 15–22 + отзыв согласия + жалоба в надзорный
орган, Swiss FADP, без профилирования. Cookies: сайт куки НЕ ставит (статика,
шрифты self-hosted, аналитики нет); при появлении куки — баннер до установки.
Terms: информационный сайт, IP, no warranties, ограничение ответственности,
право `[VERIFY: юрисдикция — Switzerland]`. Imprint: реквизиты `[VERIFY]`.
Объём: privacy 6–8 секций, cookies 3–4, terms 4–5, imprint 2–3. Не выдумывать
фактов: чего не знаем — `[VERIFY]`.

- [ ] Прочитать спеку целиком, `content/platform.ts`, `content/shared.ts`, `content/types.ts`, `config/sections.ts`
- [ ] Снять Partners (реестр, компонент, контент); `git grep -n "partners\|Partners"` — не осталось ссылок (docs/ не считаются)
- [ ] Добавить типы, `finale`, расширенный `footer`, `content/legal.ts`
- [ ] `npm run build` — зелёный
- [ ] Коммит: `chore(partners): секция снята` и `feat(finale): контентный слой финала и легала`

---

### Task 2 (Агент 2): Легал-модалки

**Files:**
- Create: `components/legal/LegalModalProvider.tsx`
- Create: `components/legal/LegalModal.tsx`
- Modify: `components/landing/Landing.tsx` (обернуть внутрь ContactModalProvider)
- Modify: `app/globals.css` (только блок легал-панели, в конец файла)

**Interfaces:**
- Consumes: `legalDocs`, `legalOrder` из `content/legal.ts`; типы из `content/types.ts`; классы `.contact-overlay/.contact-scrim/.contact-modal` (globals.css:494-697); `useScrollLock` из `lib/useScrollLock.ts`.
- Produces:

```ts
export function useLegalModal(): { openLegal(id: LegalDocId): void; close(): void };
export function LegalModalProvider(p: { children: React.ReactNode }): React.ReactElement;
```

**Как строить:** `ContactModalProvider.tsx` и `ContactModal.tsx` — прямой
образец: тот же портал, та же state-machine open/closing/exited, тот же
фокус-трап, Esc, клик по подложке, возврат фокуса на триггер, `useScrollLock`.
Дублирование трап-логики допущено сознательно (спека §Ограничения) — пометить
комментарием «кандидат на извлечение вместе с ContactModal». Отличия:
- контекст хранит `LegalDocId | null`; `openLegal(id)` при уже открытой
  модалке просто меняет документ (без перезапуска хореографии);
- панель: `contact-modal widget-glass legal-panel`, ширина `max-w-[760px]`,
  контент — заголовок, `updated`, intro, секции (`h3` + параграфы + списки)
  по типографике спеки §Визуальный словарь; длинный текст скроллится самим
  оверлеем (`overflow-y-auto` уже в рецепте оверлея);
- фокус при открытии — на панель (`tabIndex={-1}`), не на поле: полей нет.
- `.legal-panel` в globals.css: ТОЛЬКО ширина/отступы, если утилитами не
  выходит; хореографию не дублировать.

- [ ] Прочитать спеку, `ContactModalProvider.tsx`, `ContactModal.tsx`, globals.css:484-697
- [ ] Провайдер + модалка + обёртка в Landing.tsx
- [ ] Временная проверка руками не нужна — триггеры появятся в Task 3; собрать мини-проверку: в dev открыть через React DevTools нельзя — вместо этого ВРЕМЕННО ничего не встраивать, полагаться на build + Task 4
- [ ] `npm run build` — зелёный
- [ ] Коммит: `feat(legal): модалки легальных документов`

---

### Task 3 (Агент 3): Синий Finale + футер + submitLead

**Files:**
- Create: `components/sections/shared/Finale.tsx`
- Delete: `components/sections/shared/FinalCta.tsx`
- Modify: `components/sections/shared/Footer.tsx`
- Create: `lib/submitLead.ts`
- Modify: `components/landing/Landing.tsx` (`FinalCta` → `Finale`)
- Modify: `content/shared.ts` (снять `finalCta`), `content/types.ts` (снять `FinalCtaContent`)
- Modify: `app/globals.css` (+`.grad-finale`, `.text-finale`, стили формы финала — в конец)

**Interfaces:**
- Consumes: `finale`, `footer`, `navAnchors` из `content/shared.ts`; `useContactModal`; `useLegalModal` (Task 2); `validateField` из `lib/validateContact.ts`; `useTypewriter`, `useHeroCycle`; `SubmitResult` из `lib/submitContact.ts`.
- Produces:

```ts
// lib/submitLead.ts — зеркало lib/submitContact.ts (та же заглушка, тот же шов):
export type LeadPayload = { email: string };
export async function submitLead(payload: LeadPayload): Promise<SubmitResult>;
```

**Finale.tsx** (`id="contact"` остаётся на секции — якорь жив):
- Секция `grad-finale text-white min-h-dvh flex flex-col`, контент по центру
  (`my-auto`), контейнер `max-w-[1200px]` как у всех.
- `h2` со `sr-only` «Contact». Логотип — `aria-hidden`, `.text-finale`,
  разметка как в Hero: `c:` + `<span ref>` (SSG-текст `rel`) + курсор
  `cursor-blink` белый. `useTypewriter` + `useHeroCycle(tw, inView)`, где
  `inView` — IntersectionObserver threshold 0.35 на секции (цикл гаснет за
  экраном; reduced-motion уже внутри хука).
- Тезис `finale.sub` (белый), строка `finale.emailLead` (`white/85`).
- Форма: `<form aria-label="email updates">`, ряд `glass-tint rounded-(--radius-pill)`:
  input `type="email" autocomplete="email" aria-label` + белая пилюля-сабмит.
  Валидация на сабмите `validateField("email", v)`; ошибка — шторка
  `grid-template-rows` под рядом (`role="alert"`, белый текст); фазы
  idle/submitting/success как у ContactForm, success — строка
  `finale.emailSuccess` с кольцом-чеком (грамматика `.wg-pop`, белое кольцо).
- Рядом/ниже — кнопка `finale.ctaPrimary` → `useContactModal().open()`, белая
  пилюля `bg-white text-ink` (словарь hero-инверта).
- Строка согласия: `consentPrefix` + кнопка-ссылка `consentLinkLabel` →
  `useLegalModal().openLegal("privacy")` (подчёркивание, white/85).
- `data-reveal` на тезис/форму/CTA (грамматика reveal уже глобальная).

**Footer.tsx** — плоский `#2668d9` (утилита `bg-[#2668d9]` нельзя — завести
токен? НЕТ: использовать `.grad-finale`-базу нельзя тоже. Решение: в globals
`.bg-finale { background: #2668d9; }` рядом с `.grad-finale`, комментарий
«шов финала и футера — один цвет»). Содержимое: бренд `c:rel_`, юр-строка +
комплаенс-полоса (существующие `[VERIFY]`), `<nav aria-label={footer.navLabel}>`
по `navAnchors` (якоря `#id`), `<nav aria-label={footer.legalLabel}>` —
кнопки `footer.legalLinks` → `openLegal(id)`, mailto, копирайт. Весь текст
белый/white85, hover — как у текущего футера.

**globals.css:**
```css
/* финал: свечение бренда за логотипом, к низу — ровный #2668d9 (AA 5.17:1
   мелкому белому; чистый #2e7cf6 под текстом запрещён — правило v4) */
.grad-finale {
  background:
    radial-gradient(90% 60% at 50% 0%, rgb(46 124 246 / 0.9), rgb(46 124 246 / 0) 70%),
    #2668d9;
}
.bg-finale { background: #2668d9; }
.text-finale {
  font-size: clamp(2.75rem, 11vw, 9rem); /* 11vw — «c:platform_ не переносится на 360px» */
  line-height: 1; letter-spacing: -0.02em; font-weight: 700; white-space: nowrap;
}
```
Плюс шторка ошибки/успеха формы — по образцу `.contact-alert`/`.contact-success`
(классы с префиксом `.finale-`), reduced-motion — в общий блок.

- [ ] Прочитать спеку, Hero.tsx, FinalCta.tsx, Footer.tsx, ContactForm.tsx, useTypewriter/useHeroCycle, globals.css
- [ ] `lib/submitLead.ts`; Finale.tsx; Footer.tsx; globals.css; Landing.tsx; снять FinalCta/finalCta/FinalCtaContent (`git grep finalCta` — пусто)
- [ ] `npm run build` — зелёный
- [ ] Коммит: `feat(finale): синий финал с лого-циклом, e-mail захватом и футером`

---

### Task 4: Верификация (оркестратор)

- [ ] `npm run build` — зелёный
- [ ] dev-превью: финал (лого-цикл видим), e-mail: пустой сабмит → ошибка; валидный → success; talk to us → модалка контакта; футер-ссылки → легал-модалки (все 4), скролл длинного privacy; Esc/подложка закрывают
- [ ] Скриншоты desktop + mobile (375): финал, футер, легал-модалка, success формы — в чат
- [ ] Партнёров нет нигде; якоря шапки живы
