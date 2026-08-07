# План 1 — структурная перестройка под слияние

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Свести два состояния лендинга (`/services`, `/platform`) в одну страницу на одном адресе `/`, не создавая новых секций — существующие переезжают в новый порядок.

**Architecture:** Реестр секций становится плоским списком; состояние перестаёт управлять составом DOM и превращается в «выбранную ветку» для эха hero-команды и доводки скролла. Оркестратор перехода теряет каскады секций, `pushState` и подмену `title`, но сохраняет печать и каретку. Роутинг схлопывается: два маршрута удаляются, `app/page.tsx` из редирект-заглушки становится настоящим хостом.

**Tech Stack:** Next.js 16 (App Router, `output: "export"`), React 19, Tailwind v4, GSAP + ScrollTrigger, Lenis, TypeScript.

**Источник:** `docs/superpowers/specs/2026-08-07-merge-services-platform-design.md` (далее — спека). Этот план покрывает §10 «План 1». Секции `TwoWaysIn` и `Proof` в него **не входят** — они в Плане 2.

## Global Constraints

- **Адрес один: `/`.** `/services` и `/platform` удаляются, редиректы не делаются (спека §5).
- **Тумблер не пишет историю.** Ни `pushState`, ни `replaceState`, ни хэш. Кнопка «назад» уводит с сайта (спека §5).
- **`document.title` у страницы один** и не меняется при переключении ветки.
- **Точка доводки скролла:** десктоп — верхняя граница секции развилки; мобайл (< 768px) — начало выбранной ветки (спека §5).
- **Hero-команда:** `c:rel_` в покое; после клика аргумент остаётся до следующего клика, автовозврата нет (спека §5).
- **Копирайт не переписывается**, кроме перечисленного в Task 5. Тексты берутся дословно из `docs/content.md`.
- **Визуальный слой v3 не трогается:** токены, `MagicBento`, `ScrollStack`, мокапы, вёрстка секций — без изменений.
- **Каждая задача завершается зелёными `npx tsc --noEmit` и `npm run build`.** Ни один коммит не оставляет проект несобирающимся.

## Верификация: почему здесь нет юнит-тестов

В проекте **нет тестового фреймворка** — в `package.json` только `dev` / `build` / `start`, нет ни runner-а, ни конфига линта. Вводить vitest посреди структурного рефакторинга — это отдельная работа, которой заказчик не просил, и она не окупается: почти все изменения ниже — перемещение файлов, удаление кода и смена типов, где ошибки ловит компилятор, а остаток — это GSAP и скролл, которые в jsdom не проверяются осмысленно.

**Цикл верификации каждой задачи:**

1. `npx tsc --noEmit` — типы (ловит все переименования и смены сигнатур).
2. `npm run build` — сборка статического экспорта (ловит ошибки маршрутов и серверных границ).
3. Проверка в браузере с **точными ожидаемыми значениями** — команды даны в каждой задаче.

Если решишь всё-таки добавить тесты — это отдельная задача до Task 1, не внутри плана.

**Запуск dev-сервера:** не через `npm run dev` в терминале, а через инструмент preview (`preview_start` с именем `crel-dev` из `.claude/launch.json`). Скролл на странице ведёт Lenis, поэтому колесо мыши в автоматизации не двигает страницу — позицию задавать только через `window.scrollTo(...)` в консоли.

---

## Структура файлов

| Файл | Что с ним происходит |
|---|---|
| `lib/reveal.ts` | сигнатура `useReveal` теряет второй аргумент |
| `components/sections/shared/{Capabilities,UseCases,Approach,LicensingStack}.tsx` | переезжают из `platform/` и `services/` |
| `config/sections.ts` | `Record<LandingState, SectionDef[]>` → плоский `SectionDef[]` |
| `components/landing/SectionRenderer.tsx` | один список, без `data-section-index` |
| `lib/scrollToBranch.ts` | **новый** — доводка скролла к развилке/ветке |
| `lib/useSwitchOrchestrator.ts` | перестраивается: минус каскады, минус история, плюс доводка |
| `components/landing/Landing.tsx` | минус `stateFromPath`, `popstate`, `initial`; состояние → `LandingState \| null` |
| `app/services/page.tsx`, `app/platform/page.tsx` | удаляются |
| `app/page.tsx` | из редирект-заглушки в хост лендинга |
| `content/meta.ts` | удаляется, метаданные переезжают в `app/page.tsx` |
| `content/shared.ts` | `hero` / `finalCta` / `navAnchors` теряют ключевание по состоянию |
| `content/types.ts` | `HeroContent` / `FinalCtaContent` упрощаются |
| `components/landing/{Header,Hero,Toggle}.tsx`, `components/sections/shared/FinalCta.tsx` | перестают индексироваться состоянием |

---

## Task 1: Контракт `useReveal` — снять мигание при клике тумблера

**Files:**
- Modify: `lib/reveal.ts:12-43`
- Modify: `components/landing/Landing.tsx:53`

**Interfaces:**
- Consumes: ничего
- Produces: `useReveal(rootRef: RefObject<HTMLElement | null>): void` — один аргумент вместо двух

**Зачем.** Сейчас `useReveal(mainRef, state)` при каждой смене `state` безусловно выполняет `gsap.set(items, { y: 24, autoAlpha: 0 })` и заново вешает `ScrollTrigger.batch`. Пока смена состояния означала полную замену DOM, это было верно. После слияния секции не пересоздаются, а `state` продолжает меняться по клику — уже прочитанный контент будет прятаться и заново проявляться. Делаем первой задачей: она изолирована и чинит реальный баг ещё до остальных правок.

- [ ] **Step 1: Убрать `stateKey` из `useReveal`**

`lib/reveal.ts` — заменить сигнатуру и зависимости эффекта:

```ts
export function useReveal(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    ensureEases();
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      if (!items.length) return;
      gsap.set(items, { y: 24, autoAlpha: 0 });
      ScrollTrigger.batch(items, {
        start: "top bottom-=80",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            y: 0,
            autoAlpha: 1,
            duration: 0.6,
            ease: "crelOut",
            stagger: 0.06,
            overwrite: true,
          }),
      });
    }, root);

    return () => ctx.revert();
  }, [rootRef]);
}
```

Обнови комментарий в шапке файла: reveal инициализируется один раз на монтирование, DOM секций больше не пересоздаётся.

- [ ] **Step 2: Обновить вызов**

`components/landing/Landing.tsx:53` — было `useReveal(mainRef, state);`, стало:

```tsx
useReveal(mainRef);
```

- [ ] **Step 3: Типы**

Run: `npx tsc --noEmit`
Expected: без вывода (успех).

- [ ] **Step 4: Сборка**

Run: `npm run build`
Expected: `✓ Compiled successfully`, экспорт без ошибок.

- [ ] **Step 5: Проверить в браузере, что мигание ушло**

Открыть превью (`preview_start`, `crel-dev`), перейти на `/services`. В консоли:

```js
(() => {
  window.scrollTo(0, 2000);
  return new Promise(r => setTimeout(() => {
    const before = [...document.querySelectorAll('[data-reveal]')]
      .filter(el => getComputedStyle(el).opacity === '1').length;
    document.querySelector('[role="radiogroup"] button:last-of-type').click();
    setTimeout(() => {
      const after = [...document.querySelectorAll('[data-reveal]')]
        .filter(el => getComputedStyle(el).opacity === '1').length;
      r({ before, after });
    }, 100);
  }, 800));
})()
```

Expected: `after` не меньше `before` — видимые элементы не спрятались. До правки `after` был бы 0.

- [ ] **Step 6: Commit**

```bash
git add lib/reveal.ts components/landing/Landing.tsx
git commit -m "fix(reveal): инициализация один раз на монтирование, без реинициализации по состоянию"
```

---

## Task 2: Плоский реестр секций и переезд в `shared/`

**Files:**
- Move: `components/sections/platform/Capabilities.tsx` → `components/sections/shared/Capabilities.tsx`
- Move: `components/sections/platform/UseCases.tsx` → `components/sections/shared/UseCases.tsx`
- Move: `components/sections/services/Approach.tsx` → `components/sections/shared/Approach.tsx`
- Move: `components/sections/services/LicensingStack.tsx` → `components/sections/shared/LicensingStack.tsx`
- Modify: `config/sections.ts` (целиком)
- Modify: `components/landing/SectionRenderer.tsx` (целиком)

**Interfaces:**
- Consumes: `useReveal(rootRef)` из Task 1
- Produces: `export const sections: SectionDef[]` — плоский упорядоченный массив; `SectionDef = { id: string; label: string | null; Component: ComponentType }`

**Зачем.** Реестр — единственное место, знающее порядок сцен. Пока он ключуется состоянием, порядок §2 спеки выразить нельзя. Секции переезжают в `shared/`, потому что после слияния деления на `platform/` и `services/` не существует. Внутренности файлов не трогаем — только путь и импорты.

Порядок в этой задаче — уже целевой по §2 спеки, но развилка ещё не слита: `Integration` (ветка A) и `ServicesGrid` (ветка B) стоят двумя соседними секциями, `Cases` и `Partners` — тоже. Их сольёт План 2.

- [ ] **Step 1: Переместить четыре файла**

```bash
git mv components/sections/platform/Capabilities.tsx components/sections/shared/Capabilities.tsx
git mv components/sections/platform/UseCases.tsx components/sections/shared/UseCases.tsx
git mv components/sections/services/Approach.tsx components/sections/shared/Approach.tsx
git mv components/sections/services/LicensingStack.tsx components/sections/shared/LicensingStack.tsx
```

Внутри перемещённых файлов импорты вида `@/components/...` и `@/content/...` абсолютные — править не нужно. Проверить это на следующем шаге компилятором.

- [ ] **Step 2: Переписать `config/sections.ts` целиком**

```ts
// Реестр секций — единственное место, знающее порядок сцен объединённой страницы.
// Порядок задан спекой слияния §2: рельс → для кого → развилка → как работаем →
// комплаенс → доказательства. Развилка и блок доказательств пока состоят
// из двух секций каждый — их сольёт План 2.
import type { ComponentType } from "react";
import { approach, servicesGrid, licensing, cases } from "@/content/services";
import { capabilities, integration, useCases, partners } from "@/content/platform";
import { Approach } from "@/components/sections/shared/Approach";
import { Capabilities } from "@/components/sections/shared/Capabilities";
import { LicensingStack } from "@/components/sections/shared/LicensingStack";
import { UseCases } from "@/components/sections/shared/UseCases";
import { Integration } from "@/components/sections/platform/Integration";
import { Partners } from "@/components/sections/platform/Partners";
import { Cases } from "@/components/sections/services/Cases";
import { ServicesGrid } from "@/components/sections/services/ServicesGrid";

export interface SectionDef {
  id: string;
  label: string | null;
  Component: ComponentType;
}

export const sections: SectionDef[] = [
  { id: "the-rail", label: capabilities.section.label, Component: Capabilities },
  { id: "who-its-for", label: useCases.section.label, Component: UseCases },
  // развилка: ветка A (взять платформу) и ветка B (взять команду)
  { id: "two-ways-in", label: integration.section.label, Component: Integration },
  { id: "two-ways-in-team", label: servicesGrid.section.label, Component: ServicesGrid },
  { id: "how-we-work", label: approach.section.label, Component: Approach },
  { id: "compliance", label: licensing.section.label, Component: LicensingStack },
  // доказательства: пока две секции
  { id: "proof", label: cases.section.label, Component: Cases },
  { id: "proof-partners", label: partners.section.label, Component: Partners },
];
```

- [ ] **Step 3: Переписать `SectionRenderer.tsx` целиком**

Атрибут `data-section-index` удаляется: его единственный потребитель — `sections()` в оркестраторе, который обслуживает удаляемые каскады (Task 3).

```tsx
// Рендерит плоский реестр секций объединённой страницы.
import { sections } from "@/config/sections";

export function SectionRenderer() {
  return (
    <>
      {sections.map(({ id, Component }) => (
        <div key={id} id={id}>
          <Component />
        </div>
      ))}
    </>
  );
}
```

- [ ] **Step 4: Обновить вызов в `Landing.tsx`**

Было `<SectionRenderer state={state} />`, стало:

```tsx
<SectionRenderer />
```

- [ ] **Step 5: Типы**

Run: `npx tsc --noEmit`
Expected: без вывода. Если появятся ошибки о `data-section-index` — значит оркестратор всё ещё его читает; это нормально, он читает через `querySelectorAll` (строка, не тип), компилятор молчит. Обрабатывается в Task 3.

- [ ] **Step 6: Сборка**

Run: `npm run build`
Expected: `✓ Compiled successfully`.

- [ ] **Step 7: Проверить порядок секций в браузере**

Открыть `/services`, в консоли:

```js
[...document.querySelectorAll('main > div[id]')].map(d => d.id)
```

Expected ровно:
```
["the-rail","who-its-for","two-ways-in","two-ways-in-team","how-we-work","compliance","proof","proof-partners"]
```

Тумблер на этом шаге уже не меняет состав секций — обе ветки видны всегда. Это ожидаемое промежуточное состояние.

- [ ] **Step 8: Commit**

```bash
git add -A components/sections config/sections.ts components/landing/SectionRenderer.tsx
git commit -m "refactor(sections): плоский реестр в порядке слияния, четыре секции в shared/"
```

---

## Task 3: Перестройка оркестратора и доводка скролла

**Files:**
- Create: `lib/scrollToBranch.ts`
- Modify: `lib/useSwitchOrchestrator.ts` (целиком)
- Modify: `components/landing/Landing.tsx:20-23,39-46,64-72`

**Interfaces:**
- Consumes: `getLenis()` из `lib/lenis.ts`; `TypewriterHandle` из `lib/useTypewriter.ts` (методы `retype(next: string)`, `skipTo(final: string)`)
- Produces:
  - `scrollToBranch(branch: LandingState, opts?: { instant?: boolean }): void`
  - `useSwitchOrchestrator(args: { selected: LandingState | null; applySelected: (b: LandingState) => void; typewriter: TypewriterHandle; caretRef: RefObject<HTMLDivElement | null> }): { switchTo: (next: LandingState) => void }`

**Зачем.** Оркестратор сейчас на 40% состоит из машинерии, которой после слияния нет: exit/enter-каскады секций, React-замена состава, `pushState`, подмена `title`. Взамен появляется одно новое действие — доводка скролла к развилке. Это не сокращение, а перестройка: `finishInstantly` был построен вокруг очистки трансформов секций и пишется заново.

- [ ] **Step 1: Создать `lib/scrollToBranch.ts`**

```ts
"use client";

// Доводка скролла к развилке. Спека §5: на десктопе цель — верхняя граница
// секции развилки (обе ветки видны рядом); на мобиле — начало выбранной ветки,
// потому что там ветки стоят друг под другом и верхняя граница секции не
// показала бы выбранную.
import type { LandingState } from "@/content/types";
import { getLenis } from "./lenis";

/** высота плавающей стеклянной капсулы + воздух; совпадает с scroll-margin-top в globals.css */
const HEADER_CLEARANCE = 104;

const FORK_ID = "two-ways-in";

// План 2 сольёт обе ветки в одну секцию; до тех пор ветка B — отдельная секция
const BRANCH_ID: Record<LandingState, string> = {
  platform: "two-ways-in",
  services: "two-ways-in-team",
};

export function scrollToBranch(branch: LandingState, opts: { instant?: boolean } = {}) {
  const mobile = window.matchMedia("(max-width: 767px)").matches;
  const el = document.getElementById(mobile ? BRANCH_ID[branch] : FORK_ID);
  if (!el) return;

  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_CLEARANCE;
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(top, { duration: opts.instant ? 0 : 0.8 });
  } else {
    window.scrollTo({ top, behavior: "auto" });
  }
}
```

- [ ] **Step 2: Переписать `lib/useSwitchOrchestrator.ts` целиком**

```ts
"use client";

// Оркестратор выбора ветки. После слияния (спека §5) он больше не меняет состав
// секций и не трогает историю: адрес один, title один. Осталось три действия —
// перепечатка аргумента команды, проезд каретки и доводка скролла к развилке.
//  - «последний клик побеждает»: повторный клик мгновенно доводит до цели;
//  - reduced-motion: без печати и каретки, мгновенная доводка.
import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";
import { gsap } from "gsap";
import type { LandingState } from "@/content/types";
import type { TypewriterHandle } from "./useTypewriter";
import { ensureEases } from "./easing";
import { scrollToBranch } from "./scrollToBranch";

const ERASE_DELAY = 80; // пауза перед началом перепечатки
const CARET_DUR = 0.4;

interface OrchestratorArgs {
  selected: LandingState | null;
  applySelected: (next: LandingState) => void;
  typewriter: TypewriterHandle;
  caretRef: RefObject<HTMLDivElement | null>;
}

export function useSwitchOrchestrator({
  selected,
  applySelected,
  typewriter,
  caretRef,
}: OrchestratorArgs) {
  const animating = useRef(false);
  const timeouts = useRef<number[]>([]);
  const tweens = useRef<gsap.core.Tween[]>([]);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  const clearAll = useCallback(() => {
    timeouts.current.forEach((t) => window.clearTimeout(t));
    timeouts.current = [];
    tweens.current.forEach((t) => t.kill());
    tweens.current = [];
  }, []);

  const later = useCallback((fn: () => void, ms: number) => {
    timeouts.current.push(window.setTimeout(fn, ms));
  }, []);

  const track = useCallback((t: gsap.core.Tween) => {
    tweens.current.push(t);
    return t;
  }, []);

  // скип: мгновенно в конечное состояние цели (никогда не блокируем клик)
  const finishInstantly = useCallback(
    (target: LandingState) => {
      clearAll();
      typewriter.skipTo(target);
      if (caretRef.current) gsap.set(caretRef.current, { autoAlpha: 0 });
      animating.current = false;
      applySelected(target);
      scrollToBranch(target, { instant: true });
    },
    [applySelected, caretRef, clearAll, typewriter]
  );

  const switchTo = useCallback(
    (next: LandingState) => {
      if (next === selectedRef.current && !animating.current) {
        // ветка уже выбрана — повторный клик просто возвращает к развилке
        scrollToBranch(next);
        return;
      }

      if (animating.current) {
        finishInstantly(next);
        return;
      }

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        typewriter.skipTo(next);
        applySelected(next);
        scrollToBranch(next, { instant: true });
        return;
      }

      ensureEases();
      animating.current = true;
      applySelected(next);

      // каретка 140×2px проезжает по вьюпорту — маркер перехода
      if (caretRef.current) {
        track(
          gsap.fromTo(
            caretRef.current,
            { x: -140, autoAlpha: 1 },
            {
              x: window.innerWidth + 140,
              duration: CARET_DUR,
              ease: "crelSwap",
              onComplete: () => {
                if (caretRef.current) gsap.set(caretRef.current, { autoAlpha: 0 });
                animating.current = false;
              },
            }
          )
        );
      } else {
        animating.current = false;
      }

      later(() => typewriter.retype(next), ERASE_DELAY);
      scrollToBranch(next);
    },
    [applySelected, caretRef, finishInstantly, later, track, typewriter]
  );

  useEffect(() => clearAll, [clearAll]);

  return { switchTo };
}
```

Что исчезло по сравнению с прежней версией и почему — сверить глазами: `sections()` / `visibleSections()` (обслуживали каскады), `pendingEnter` и enter-стадия `useLayoutEffect`, exit-каскад, константы `STATE_SWAP_AT` / `ENTER_AT` / `EXIT_DUR` / `EXIT_STAGGER` / `ENTER_DUR` / `ENTER_STAGGER` / `ENTER_VISIBLE_COUNT` / `HERO_SWAP_DUR`, импорты `ScrollTrigger` и `meta`, `history.pushState`, `document.title`, опция `{ push }`, `mainRef`, `subWrapRef`, `scrollToTopInstant`.

- [ ] **Step 3: Обновить `Landing.tsx`**

Удалить `stateFromPath` (строки 20-23), обработчик `popstate` (строки 64-72) и импорт `scrollToTopInstant`, если он есть. Обновить вызов оркестратора:

```tsx
const { switchTo } = useSwitchOrchestrator({
  selected: state,
  applySelected: applyState,
  typewriter,
  caretRef,
});
```

`state` пока остаётся `LandingState` (не `| null`) — тип меняется в Task 5. `mainRef` остаётся: он нужен `useReveal`. `subWrapRef` остаётся: он нужен Hero для входной анимации, просто больше не передаётся в оркестратор.

- [ ] **Step 4: Типы**

Run: `npx tsc --noEmit`
Expected: без вывода. Если ругается на неиспользуемый импорт `meta` в `Landing.tsx` — удалить импорт.

- [ ] **Step 5: Сборка**

Run: `npm run build`
Expected: `✓ Compiled successfully`.

- [ ] **Step 6: Проверить доводку и отсутствие истории**

Открыть `/services`, в консоли:

```js
(() => {
  const url0 = location.href;
  const len0 = history.length;
  window.scrollTo(0, 0);
  document.querySelector('[role="radiogroup"] button:last-of-type').click();
  return new Promise(r => setTimeout(() => r({
    urlChanged: location.href !== url0,
    historyGrew: history.length > len0,
    scrolledTo: Math.round(window.scrollY),
    forkTop: Math.round(document.getElementById('two-ways-in').getBoundingClientRect().top + window.scrollY - 104),
  }), 1500));
})()
```

Expected: `urlChanged: false`, `historyGrew: false`, а `scrolledTo` отличается от `forkTop` не более чем на 4 px.

- [ ] **Step 7: Проверить скип повторным кликом**

```js
(() => {
  window.scrollTo(0, 0);
  const btns = document.querySelectorAll('[role="radiogroup"] button');
  btns[1].click();
  setTimeout(() => btns[0].click(), 120); // второй клик посреди анимации
  return new Promise(r => setTimeout(() => r({
    arg: document.querySelector('.text-display span').textContent,
    caretHidden: getComputedStyle(document.querySelector('header div[aria-hidden]')).opacity,
  }), 900));
})()
```

Expected: `arg` равен `"services"` (победил последний клик), `caretHidden` равен `"0"`.

- [ ] **Step 8: Commit**

```bash
git add lib/scrollToBranch.ts lib/useSwitchOrchestrator.ts components/landing/Landing.tsx
git commit -m "refactor(switch): оркестратор без каскадов и истории, доводка скролла к развилке"
```

---

## Task 4: Роутинг — один адрес

**Files:**
- Delete: `app/services/page.tsx`, `app/platform/page.tsx`, `content/meta.ts`
- Modify: `app/page.tsx` (целиком)

**Interfaces:**
- Consumes: `<Landing />` из `components/landing/Landing.tsx`
- Produces: единственный маршрут `/` с полными `metadata`

**Зачем.** Спека §5: адрес один. Лендинг не запущен, старые адреса никогда не были публичными — редиректы не нужны, и ограничение `output: "export"` (нет серверных редиректов) перестаёт быть проблемой. `app/page.tsx` перестаёт быть костылём с `meta refresh`.

`content/meta.ts` удаляется целиком: после Task 3 его единственным потребителем остался `app/page.tsx`, а метаданные удобнее держать рядом с маршрутом.

- [ ] **Step 1: Удалить маршруты и `meta.ts`**

```bash
git rm app/services/page.tsx app/platform/page.tsx content/meta.ts
rmdir app/services app/platform
```

- [ ] **Step 2: Переписать `app/page.tsx` целиком**

Описание берётся из объединяющей формулировки, которая уже стоит в `app/layout.tsx:24` (`content.md` §ОБЩЕЕ, вариант A) — она же подзаголовок hero (Task 5).

```tsx
import type { Metadata } from "next";
import { Landing } from "@/components/landing/Landing";

const DESCRIPTION =
  "Crel builds and runs digital asset infrastructure: a Swiss consulting practice and a platform, sharing one rail.";

export const metadata: Metadata = {
  title: "Crel — one rail, two ways in",
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Crel — one rail, two ways in",
    description: DESCRIPTION,
    type: "website",
  },
};

export default function HomePage() {
  return <Landing />;
}
```

**Проп `initial` не передаётся** — Task 5 сделает его необязательным. До Task 5 компилятор будет требовать проп, поэтому на этом шаге временно передай `initial="services"`, а в Task 5 убери. Это единственное место в плане с временным значением; оно живёт ровно одну задачу.

- [ ] **Step 3: Типы**

Run: `npx tsc --noEmit`
Expected: без вывода. Ошибка вида «Cannot find module '@/content/meta'» означает, что где-то остался импорт удалённого файла — найти через `grep -rn "content/meta" --include="*.ts*" .` и удалить.

- [ ] **Step 4: Сборка и проверка вывода экспорта**

Run: `npm run build`
Expected: `✓ Compiled successfully`. В сводке маршрутов должен остаться только `/` — строк `/services` и `/platform` быть не должно.

Дополнительно:

```bash
ls out/ && test ! -d out/services && test ! -d out/platform && echo "маршруты удалены"
```
Expected: печатает `маршруты удалены`.

- [ ] **Step 5: Проверить, что старые адреса отдают 404**

```bash
(cd out && python3 -m http.server 4173 &) && sleep 2
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4173/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4173/services
pkill -f "http.server 4173"
```
Expected: `200`, затем `404`. 404 здесь — правильное поведение: адрес никогда не был публичным, сохранять нечего.

- [ ] **Step 6: Commit**

```bash
git add -A app content/meta.ts
git commit -m "refactor(routing): один адрес /, маршруты состояний и content/meta удалены"
```

---

## Task 5: Контент и шапка/hero без ключевания состоянием

**Files:**
- Modify: `content/types.ts`, `content/shared.ts`
- Modify: `components/landing/Header.tsx`, `components/landing/Hero.tsx`, `components/landing/Toggle.tsx`, `components/landing/Landing.tsx`
- Modify: `components/sections/shared/FinalCta.tsx`
- Move: `components/sections/shared/FinalCta.tsx` остаётся на месте (уже в `shared/`)
- Modify: `app/page.tsx` (убрать временный проп из Task 4)

**Interfaces:**
- Consumes: `sections` из Task 2, `switchTo` из Task 3
- Produces:
  - `hero: { restArg: string; subtitle: string; ctaPrimary: string }`
  - `finalCta: { title: string; sub: string; ctaPrimary: string }`
  - `navAnchors: { label: string; id: string }[]`
  - `branchLabels: Record<LandingState, string>`
  - `Landing` без обязательных пропов; внутреннее состояние `LandingState | null`

**Зачем.** Три экспорта `content/shared.ts` имеют форму `Record<"services" | "platform", …>` — модель «две разные страницы». Её больше нет. Одновременно вводим состояние покоя: `null` = выбор не сделан, команда показывает `c:rel_`.

**Решения по копирайту, принятые здесь** (на вычитку заказчиком, но заглушек в коде не оставляем):
- подзаголовок hero — объединяющая формулировка (вариант A `content.md`);
- финальный CTA — заголовок services-версии `Tell us what you are building`: он направленно-нейтрален, тогда как `Put the rail under your product` говорит только о платформе;
- `Read the docs` в hero **не показывается**: интент один на страницу. Кнопка переедет в ветку A развилки в Плане 2, где она контекстна.

- [ ] **Step 1: Упростить типы**

`content/types.ts` — заменить два интерфейса:

```ts
export type LandingState = "services" | "platform";

export interface HeroContent {
  /** аргумент команды в покое: выбор ветки ещё не сделан */
  restArg: string;
  subtitle: string;
  ctaPrimary: string;
}

export interface FinalCtaContent {
  title: string;
  sub: string;
  ctaPrimary: string;
}
```

`SectionCopy` не трогаем.

- [ ] **Step 2: Переписать три экспорта `content/shared.ts`**

```ts
// Hero объединённой страницы: команда в покое — c:rel_, подзаголовок держит
// оба направления одной строкой (content.md §ОБЩЕЕ, вариант A).
export const hero: HeroContent = {
  restArg: "rel",
  subtitle:
    "Crel builds and runs digital asset infrastructure: a Swiss consulting practice and a platform, sharing one rail.",
  ctaPrimary: "Talk to us_",
};

export const finalCta: FinalCtaContent = {
  title: "Tell us what you are building",
  sub: "First call is a working session on your stack, not a pitch.",
  ctaPrimary: "Talk to us_",
};

// Якоря шапки: label — то, что видит человек; id — идентификатор секции.
// Разведены намеренно: вычислять id из текста нельзя (см. Header.tsx).
export const navAnchors: { label: string; id: string }[] = [
  { label: "the rail", id: "the-rail" },
  { label: "two ways in", id: "two-ways-in" },
  { label: "compliance", id: "compliance" },
  { label: "contact", id: "contact" },
];

// Заголовки веток развилки — единственный новый копирайт слияния (спека §3)
export const branchLabels: Record<LandingState, string> = {
  platform: "Take the platform",
  services: "Take the team",
};
```

Экспорт `toggle` и `footer` не меняются. Импорт типов в шапке файла дополнить `LandingState`.

- [ ] **Step 3: Обновить `Header.tsx`**

Три завязки на состояние плюс баг с пробелами:

```tsx
<a href="/" className="text-[1.15rem] font-bold tracking-[-0.02em]">
  c:rel<span className="inline-block">_</span>
</a>
```

Навигация — id берётся из данных, а не вычисляется из текста (прежний `anchor.replace(" ", "-")` без флага `/g` заменял только первый пробел и на пункте `two ways in` дал бы невалидный `#two-ways in`):

```tsx
<nav className="ml-auto hidden items-center gap-6 md:flex">
  {navAnchors.map(({ label, id }) => (
    <a
      key={id}
      href={`#${id}`}
      className="text-[0.875rem] lowercase text-ink-soft underline-offset-[6px] decoration-2 transition-colors duration-200 hover:text-ink hover:underline hover:decoration-accent"
    >
      {label}
    </a>
  ))}
</nav>
```

CTA-кнопка: `hero[state].ctaPrimary` → `hero.ctaPrimary`. Пропс `state` в `HeaderProps` меняет тип на `LandingState | null` (он ещё нужен `Toggle`).

- [ ] **Step 4: Обновить `Hero.tsx`**

Убрать `const content = hero[state]` → использовать `hero` напрямую. Аргумент команды:

```tsx
<div aria-hidden className="text-display select-none">
  c:
  {/* Значение в JSX намеренно константно: после монтирования этим узлом владеет
      useTypewriter (пишет в textContent напрямую). Если подставить сюда selected,
      React перезапишет текст в момент applySelected — аргумент сменится мгновенно,
      а следом typewriter начнёт стирать и печатать его заново. */}
  <span ref={argRef} suppressHydrationWarning>
    {hero.restArg}
  </span>
  <span ref={cursorRef} className="cursor-blink text-accent">
    _
  </span>
</div>
```

**Не пиши сюда `{selected ?? hero.restArg}`.** React диффит `"rel"` против `"rel"`, не трогает DOM, и мутация typewriter-а выживает — на этом всё и держится.

Проп переименовать `state` → `selected: LandingState | null`. Подзаголовок и primary CTA — из `hero`; блок `content.ctaSecondary && …` удалить целиком.

Слот справа показывается **всегда** (условие `state === "platform"` снимается — состояние больше не означает «другая страница», а пустая правая колонка ломает баланс сетки 7/5):

```tsx
<div className="col-span-12 md:col-span-5">
  <div className="mx-auto mt-12 w-full max-w-[380px] md:mt-0 md:ml-auto">
    <MockupStage key="hero-ramp">
      <RampWidget />
    </MockupStage>
  </div>
</div>
```

- [ ] **Step 5: Обновить `Toggle.tsx` и `FinalCta.tsx`**

`Toggle`: проп `state` → `selected: LandingState | null`; вычисление активного слова — `active={selected === "services"}`. Когда `selected` равен `null`, ни одно слово не активно — это честное отображение «выбор не сделан». `other` считать так:

```tsx
const other: LandingState = selected === "services" ? "platform" : "services";
```

`FinalCta`: убрать проп `state`, использовать `finalCta` напрямую; удалить ветку `c.ctaSecondary`.

- [ ] **Step 6: Обновить `Landing.tsx` и `app/page.tsx`**

```tsx
export function Landing() {
  const [selected, setSelected] = useState<LandingState | null>(null);
  ...
}
```

Проп `initial` удалить из сигнатуры; в `app/page.tsx` убрать временный `initial="services"` из Task 4. Передать `selected` в `Header`, `Hero`, и убрать проп у `FinalCta`.

- [ ] **Step 7: Типы**

Run: `npx tsc --noEmit`
Expected: без вывода. Компилятор здесь — основная страховка: любое место, где остался индекс по состоянию, всплывёт ошибкой.

- [ ] **Step 8: Сборка**

Run: `npm run build`
Expected: `✓ Compiled successfully`.

- [ ] **Step 9: Проверить состояние покоя и якоря**

Открыть `/`, в консоли:

```js
({
  restArg: document.querySelector('.text-display span').textContent,
  activeWords: [...document.querySelectorAll('[role="radio"]')].map(b => b.getAttribute('aria-checked')),
  anchors: [...document.querySelectorAll('header nav a')].map(a => a.getAttribute('href')),
  anchorsResolve: [...document.querySelectorAll('header nav a')]
    .map(a => a.getAttribute('href').slice(1))
    .map(id => id === 'contact' ? !!document.getElementById('contact') : !!document.getElementById(id)),
})
```

Expected: `restArg` равен `"rel"`; `activeWords` равен `["false","false"]`; `anchors` равен `["#the-rail","#two-ways-in","#compliance","#contact"]`; `anchorsResolve` — все `true` (ни одного битого якоря, включая трёхсловный).

- [ ] **Step 10: Проверить перепечатку из покоя**

```js
(() => {
  document.querySelector('[role="radiogroup"] button:last-of-type').click();
  return new Promise(r => setTimeout(() => r({
    arg: document.querySelector('.text-display span').textContent,
    checked: [...document.querySelectorAll('[role="radio"]')].map(b => b.getAttribute('aria-checked')),
  }), 1200));
})()
```

Expected: `arg` равен `"platform"`, `checked` равен `["false","true"]`.

- [ ] **Step 11: Commit**

```bash
git add content components/landing components/sections/shared/FinalCta.tsx app/page.tsx
git commit -m "refactor(content): единый hero/CTA/навигация, состояние покоя c:rel_"
```

---

## Task 6: Приёмка Плана 1

**Files:** только чтение и, при находках, точечные правки в уже изменённых файлах.

**Interfaces:**
- Consumes: всё, что сделано в Task 1-5
- Produces: отчёт о замерах, зафиксированный в описании коммита

**Зачем.** Критерии §9 спеки, применимые к Плану 1. Секции развилки и доказательств ещё не слиты — критерии, зависящие от `TwoWaysIn` и `Proof`, проверяются в Плане 2.

- [ ] **Step 1: Чистая сборка с нуля**

```bash
rm -rf .next out && npx tsc --noEmit && npm run build
```
Expected: обе команды без ошибок; в сводке маршрутов только `/`.

- [ ] **Step 2: Мёртвые ссылки на удалённое**

```bash
grep -rn "content/meta\|stateFromPath\|data-section-index\|scrollToTopInstant\|navAnchors\[" --include="*.ts" --include="*.tsx" . | grep -v node_modules
```
Expected: пусто. Любое совпадение — недоделка предыдущих задач.

- [ ] **Step 3: Замер высоты страницы на двух вьюпортах**

Спека §7: доминирующий член высоты — секция `who-its-for` (`WRAP_HEIGHT` = 550vh при пяти табах), она масштабируется от высоты экрана. Замерить и записать факт.

Для каждого из размеров окна 1440×900 и 1440×1080 выполнить:

```js
({
  viewport: [innerWidth, innerHeight],
  page: document.body.scrollHeight,
  useCases: document.getElementById('who-its-for').getBoundingClientRect().height,
  share: Math.round(document.getElementById('who-its-for').getBoundingClientRect().height / document.body.scrollHeight * 100) + '%',
})
```

Записать оба результата. Ожидаемый порядок: `page` ≈ 14 000–17 000, `share` ≈ 30-35%. Отклонение больше чем на четверть от этих чисел — повод пересмотреть §7 спеки, а не «подогнать».

- [ ] **Step 4: Клавиатура и фокус**

Пройти Tab-ом от начала страницы: логотип → два слова тумблера (стрелками переключаются) → четыре якоря → CTA шапки. У каждого элемента видна зелёная обводка фокуса. Стрелка вправо на тумблере переключает ветку и доводит скролл.

- [ ] **Step 5: `prefers-reduced-motion`**

Включить эмуляцию reduced motion в браузере, перезагрузить `/`, кликнуть тумблер.
Expected: аргумент команды меняется мгновенно (без посимвольной печати), каретка не появляется, скролл доезжает до развилки без плавности, курсор `_` не мигает.

- [ ] **Step 6: Мобильный вьюпорт**

Размер окна 375×812, перезагрузить. Кликнуть `platform`, затем `services`.
Expected: горизонтального скролла нет ни на одной секции; доводка ведёт к секции `two-ways-in` для `platform` и к `two-ways-in-team` для `services` (на мобиле цель — начало выбранной ветки).

Проверка отсутствия горизонтального скролла:

```js
document.documentElement.scrollWidth <= window.innerWidth
```
Expected: `true`.

- [ ] **Step 7: Commit отчёта**

Если правок не потребовалось — зафиксировать замеры в пустом коммите, чтобы цифры остались в истории:

```bash
git commit --allow-empty -m "chore: приёмка Плана 1 — замеры высоты и проверки доступности

Высота страницы: <подставить> px при 1440x900, <подставить> px при 1440x1080.
Доля секции who-its-for: <подставить>%.
Клавиатура, reduced-motion, 375px — пройдено."
```

---

## Что остаётся Плану 2

Не входит в этот план и не должно в нём появиться:

1. `components/sections/shared/TwoWaysIn.tsx` — слияние `Integration` и `ServicesGrid` в одну секцию с двумя ветками (спека §3): ветка A на `grad-abyss` с блоками Widget и White Label API и сниппетом, ветка B на `grad-signal` сеткой 2×3, правило равной высоты, кнопка `Read the docs` в ветке A.
2. `components/sections/shared/Proof.tsx` — слияние `Cases` и `Partners` (спека §4): featured-кейс на `grad-signal` слева, три компактных справа, лента логотипов и цитата под ними, H2 `Selected work` и H3 `Who we build with`.
3. Удаление поглощённых `Integration.tsx`, `ServicesGrid.tsx`, `Cases.tsx`, `Partners.tsx` и осиротевших мини-мокапов `StatusChecklist`, `VendorCompare`, `OpsFeed`, `WalletFragment` вместе с полями `miniMockup` / `miniCompare` / `hasUiFragment` / `statusFeed` в `content/services.ts`.
4. Схлопывание `two-ways-in` и `two-ways-in-team` в один id, `proof` и `proof-partners` — в один; упрощение `BRANCH_ID` в `lib/scrollToBranch.ts` до якорей внутри одной секции.
5. Критерии §9 спеки, зависящие от новых секций: равенство веток, норма насыщенности по обеим границам, иерархия заголовков в `Proof`.
