# Финал страницы: синий блок, футер, легал-модалки. Снятие Partners

Дата: 2026-08-13. Ветка: `merge/one-rail`.

## Задача

1. Снять секцию Partners (`proof-partners`) целиком: грид `[logo]`-плейсхолдеров
   и цитату-заглушку — обе живут в одном компоненте.
2. Финал страницы — синий полноэкранный блок: большой логотип `c:rel_`,
   анимированный той же машиной печати, что hero (цикл rel → platform →
   services), форма захвата e-mail и кнопка «Talk to us_», открывающая
   существующую модалку контакта. Заменяет собой `FinalCta`.
3. Стандартный футер: кредитсы, навигация по секциям, легальные ссылки,
   контакт. Стоит на той же синей плоскости — визуально одно целое с финалом.
4. Легальные документы (privacy, cookie policy, terms, imprint) — модалки той
   же хореографии, что модалка контакта, но шире. Контент — EN, по нормам
   GDPR/ePrivacy + Swiss FADP, реквизиты — `[VERIFY]`-плейсхолдеры до
   credentials от Roman.

## Ограничения проекта (проверено)

- `output: "export"` — серверных роутов нет; отправка e-mail — заглушка-адаптер
  по образцу `lib/submitContact.ts` (шов для будущего эндпоинта).
- Зависимости фиксированы: gsap, lenis. Ничего не добавляем.
- Контрасты синего (правило уже в `globals.css`): чистый `#2e7cf6` даёт 3.94:1
  для мелкого белого текста — **запрещён под текстом**; `#2668d9` даёт 5.17:1
  (AA). Крупный display-текст (логотип) может стоять и на `#2e7cf6`-свечении.
- Контракты спеки 2026-08-13 (contact modal) не меняются. Рефактор
  `ContactModal` вне скоупа: легал-модалка повторяет его паттерны
  (фокус-трап, шов ухода) с комментарием о кандидате на извлечение.
- Хореография модалки уже описана классами `.contact-overlay` /
  `.contact-scrim` / `.contact-modal` в globals.css — легал-модалка реюзает эти
  классы (это словарь движения, не привязка к форме), ширину задаёт утилитой.
- Reveal-грамматика: `data-reveal` внутри `main` (`useReveal`).
- Motion-дисциплина: единственный санкционированный бесконечный цикл — машина
  печати hero; в финале тот же цикл, но **гейт по вьюпорту** (IO): за экраном
  таймеры не тикают. reduced-motion → статичное `rel` (уже внутри
  `useHeroCycle`).

## Архитектура

```
Landing.tsx (client)
└── ContactModalProvider
    └── LegalModalProvider                  ← новый: контекст + портал
        ├── Header / main / Footer
        │   ├── main: Hero → LogoBand → SectionRenderer → Finale (id="contact")
        │   └── Footer (вне main — landmark contentinfo)
        └── createPortal(<LegalModal doc/>, body)  ← когда открыто
```

### Файлы

| Файл | Действие | Агент |
|---|---|---|
| `config/sections.ts` | − `proof-partners`, − импорты Partners/partners | 1 |
| `components/sections/platform/Partners.tsx` | удалить | 1 |
| `content/platform.ts` | − `export const partners` | 1 |
| `content/shared.ts` | − `finalCta`, + `finale`, + `footer.nav/legalLinks` | 1 |
| `content/types.ts` | − `FinalCtaContent`, + `FinaleContent`, + легал-типы | 1 |
| `content/legal.ts` | новый: 4 документа | 1 |
| `components/legal/LegalModalProvider.tsx` | новый | 2 |
| `components/legal/LegalModal.tsx` | новый | 2 |
| `app/globals.css` | + `.grad-finale`, `.text-finale`, легал-ширина | 2, 3 |
| `components/sections/shared/FinalCta.tsx` | удалить | 3 |
| `components/sections/shared/Finale.tsx` | новый | 3 |
| `components/sections/shared/Footer.tsx` | редизайн на синем + легал-ссылки | 3 |
| `lib/submitLead.ts` | новый: заглушка по образцу submitContact | 3 |
| `components/landing/Landing.tsx` | провайдер + Finale вместо FinalCta | 2, 3 |

## Контракты (фиксированы)

```ts
// content/types.ts
export type LegalDocId = "privacy" | "cookies" | "terms" | "imprint";
export interface LegalSection { heading: string; paras: string[]; bullets?: string[] }
export interface LegalDoc {
  id: LegalDocId;
  title: string;
  updated: string;          // "August 2026" — без дней, до вычитки
  intro: string;
  sections: LegalSection[];
}
export interface FinaleContent {
  sub: string;              // тезис под логотипом
  emailLead: string;        // микрострока над формой
  emailPlaceholder: string;
  emailSubmit: string;
  emailSuccess: string;
  emailErrorGeneric: string;
  consentPrefix: string;    // "by subscribing you accept the "
  consentLinkLabel: string; // "privacy policy"
  ctaPrimary: string;       // "Talk to us_"
}

// components/legal/LegalModalProvider.tsx
export function useLegalModal(): {
  openLegal(id: LegalDocId): void;
  close(): void;
};

// lib/submitLead.ts — зеркало submitContact
export type LeadPayload = { email: string };
export function submitLead(p: LeadPayload): Promise<SubmitResult>; // SubmitResult реэкспорт/импорт из submitContact
```

Валидация e-mail — реюз `validateField("email", v)` из `lib/validateContact.ts`
(тексты ошибок оттуда же — новых правил не заводим).

## Визуальный словарь

| Роль | Значение |
|---|---|
| Плоскость финала | `.grad-finale`: база `#2668d9`, radial-свечение `rgb(46 124 246 / …)` за логотипом (верхняя треть), к низу — ровный `#2668d9` без градиента (шов с футером невидим) |
| Футер | flat `#2668d9`, продолжение плоскости; никаких линий — отделение воздухом |
| Логотип | `.text-finale`: как `.text-display`, но `font-size: clamp(2.75rem, 11vw, 9rem)` (11vw — калибр «c:platform_ не переносится на 360px», поднят только потолок); белый; курсор белый (акцентный синий на синем невидим) |
| Текст на синем | основной `#ffffff`; вторичный — `rgb(255 255 255 / 0.85)`, ниже не опускаться (AA на `#2668d9`) |
| Ряд e-mail | `glass-tint` (существующий рецепт стекла на тёмном/цветном), `rounded-(--radius-pill)`; input прозрачный, placeholder `white/70` (не несёт информации — допустим) |
| Кнопка сабмита | белая пилюля `bg-white text-ink` в ряду справа |
| Talk to us | тот же словарь CTA, что в hero-инверте: белая пилюля primary |
| Ошибка формы | `#ffd60a`-семейство нельзя — на синем берём белый текст ошибки + `role="alert"`; маркер — как в Field: шторка `grid-template-rows` |
| Панель легал-модалки | `contact-modal widget-glass` (тот же словарь), ширина `max-w-[760px]`; длинный контент скроллится самим оверлеем (`overflow-y-auto` уже есть) |
| Типографика легала | заголовок панели как у contact; h3 секций `text-[0.9375rem] font-semibold`; параграфы `text-[0.875rem] leading-relaxed text-(--wg-text-muted)` |

## Motion

- Вход блока: `data-reveal` на тезис/форму/CTA — существующая грамматика.
- Логотип: SSG отдаёт `c:rel_` статично; `useTypewriter` + `useHeroCycle`,
  `active` = «секция во вьюпорте» (IntersectionObserver, threshold 0.35).
  Вышел из вьюпорта — цикл гаснет (`stop()`), вернулся — перезапуск.
- Сабмит e-mail: `submitting` — кнопка в прогресс (как contact-submit);
  `success` — ряд схлопывается в строку успеха с кольцом-чеком (грамматика
  `.wg-pop` / contact-success, укороченная); `error` — шторка под рядом.
- Легал-модалка: хореография контактной один в один (классы реюзаются).
- reduced-motion: всё статично — уже покрыто существующими правилами.

## Доступность

- Логотип — `aria-hidden` (декорация, как в hero); смысловой заголовок финала
  не нужен: `h2` уровня секции — визуально скрытый (`sr-only`) «Contact».
- Форма: `<form>` с `aria-label`; input `type="email"` +
  `autocomplete="email"`, видимой подписи нет → `aria-label`; ошибка
  `aria-invalid` + `aria-describedby`, контейнер `role="alert"`; успех
  `role="status"`.
- Футер: `<footer>` вне `main`; две группы `<nav aria-label="site">` и
  `<nav aria-label="legal">`. Легал-ссылки — `<button>` (открывают модалку).
- Легал-модалка: `role="dialog"`, `aria-modal`, `aria-labelledby`, фокус-трап,
  Esc, клик по подложке, возврат фокуса на триггер — как у контактной.

## Контент легала (EN, `content/legal.ts`)

Общие правила: юридический текст — обычный регистр (не lowercase-тон UI);
никаких выдуманных реквизитов — всё фактическое в `[VERIFY]`; контролёр —
«Crel [AG], Zurich, Switzerland [VERIFY]»; контакт — info@crel.ch.

- **Privacy Policy**: контролёр; какие данные собираются (форма контакта: имя,
  e-mail, сообщение; захват e-mail: адрес); цели и правовые основания (GDPR
  art. 6(1)(a) consent, 6(1)(f) legitimate interest); хранение; права
  субъектов (art. 15–22, отзыв согласия, жалоба в надзорный орган); передачи и
  Swiss FADP; отсутствие профилирования; изменения политики.
- **Cookie Policy**: сайт statically-exported, куки и трекеры **не ставит**
  (шрифты self-hosted, аналитики нет); что изменится при появлении куки
  (баннер согласия до установки); ссылки на браузерные настройки.
- **Terms of Use**: информационный характер сайта, IP, допустимое
  использование, no warranties / liability, applicable law `[VERIFY:
  юрисдикция]`.
- **Imprint**: реквизиты компании `[VERIFY]`, контакт, ответственный за
  контент.

Согласие в форме захвата: строка `consentPrefix + consentLinkLabel` под рядом
e-mail; ссылка-кнопка открывает privacy-модалку.

## Порядок исполнения (владение файлами без пересечений внутри волны)

1. **Агент 1** — снятие Partners + весь контент (`config/sections.ts`,
   `content/*`). Самодостаточен, билд остаётся зелёным (FinalCta временно
   читает `finale.sub`? — нет: `finalCta` удаляется вместе с заменой, поэтому
   Агент 1 НЕ трогает `finalCta`, только помечает; удаление — Агент 3).
   Уточнение: Агент 1 добавляет новое (`finale`, `legal`, типы), удаляет
   partners; `finalCta` и его тип остаются до Агента 3.
2. **Агент 2** — легал-модалки (`components/legal/*`, глобальные стили
   легал-ширины, обёртка провайдера в `Landing.tsx`).
3. **Агент 3** — `Finale` + футер + `submitLead` + `.grad-finale` /
   `.text-finale`, снятие `FinalCta` и `finalCta`/`FinalCtaContent`.
4. Верификация: `npm run build`, скриншоты (desktop/mobile, hover — с
   reduced-motion по правилу Playwright+Lenis), скриншоты в чат.

## Вне скоупа

- Реальный провайдер рассылки/почты (шов в submitLead).
- Cookie-баннер: куки не ставятся — баннер не требуется; факт зафиксирован в
  Cookie Policy. Появится вместе с первой кукой.
- Рефактор ContactModal под общий Dialog-примитив.
- Вычитка юридических текстов юристом (обязательна до продакшена — [VERIFY]).
