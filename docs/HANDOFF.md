# Handoff — состояние проекта на 2026-08-08

Документ для продолжения работы в новой сессии / на другой машине. Контекст разговора
не переезжает — здесь всё, что нужно, чтобы подхватить работу без него.

## Где мы

Ветка **`merge/one-rail`** — выполнен и принят **План 1** слияния двух состояний лендинга
в одну страницу. Финальное ревью всей ветки: APPROVED FOR MERGE, 0 critical/important.

```
4ce2930  chore: приёмка Плана 1 — замеры, доступность, точечные правки
5691562  refactor(content): единый hero/CTA/навигация, состояние покоя c:rel_
f127300  refactor(routing): один адрес /, маршруты состояний и content/meta удалены
979865b  refactor(switch): оркестратор без каскадов и истории, доводка скролла к развилке
0c21494  refactor(sections): плоский реестр в порядке слияния, четыре секции в shared/
f97f082  fix(reveal): инициализация один раз на монтирование
7717b20  design(v3): baseline необанкинг-слоя (токены, стекло, bento, ScrollStack, use-cases)
```

`master` отстаёт: на нём спека и план (edab380), но не работа ветки.

## Ключевые документы (по порядку чтения)

1. `docs/design-direction.md` — **«Слой v3: необанкинг»** — действующий визуальный слой
   (палитра pine→вольтаж→cyan, стекло, glow, радиусы, бенто-чередование) + бриф на
   15 генеративных ассетов. Слои «Заряд»/«Сдержанный» — архив.
2. `docs/superpowers/specs/2026-08-07-merge-services-platform-design.md` — спека слияния
   «один рельс, два входа». **Переопределяет три пункта design-direction** (§3.3 карта
   секций, §3.5 URL-стратегия, §3.5 скролл-сброс) — таблица в её преамбуле.
3. `docs/superpowers/plans/2026-08-07-merge-plan-1-structural.md` — выполненный План 1.
4. Артефакт-презентация структуры для заказчика:
   https://claude.ai/code/artifact/63389187-dc7a-43a5-9638-78b54f41cc97
   (диаграмма «до/после» — показывать заказчику её первой).

## Открытое решение (ждёт хозяина репо)

Интеграция ветки: влить `merge/one-rail` в `master` локально / открыть PR / оставить.
Меню было предъявлено, ответ не получен — ветка сохранена как есть.

## Что дальше по работе

**План 2 (ещё НЕ написан — нужен writing-plans от спеки §10 «План 2»):**
- `components/sections/shared/TwoWaysIn.tsx` — слить `Integration` + `ServicesGrid`
  в одну секцию-развилку (спека §3: ветка A grad-abyss с Widget + White Label API +
  сниппет + кнопка `Read the docs`; ветка B grad-signal, сетка 2×3; правило равенства).
- `components/sections/shared/Proof.tsx` — слить `Cases` + `Partners` (спека §4).
- Удалить поглощённые секции и осиротевшие мини-мокапы (`StatusChecklist`,
  `VendorCompare`, `OpsFeed`, `WalletFragment` + их поля в `content/services.ts`).
- При схлопывании id: обновить `BRANCH_ID`/`FORK_ID` в `lib/scrollToBranch.ts`
  и `navAnchors` в `content/shared.ts` (финальное ревью пометило это единственным
  местом синхронизации).

**Ручные проверки в обычном браузере** (среда автопроверки держала вкладку скрытой,
rAF заморожен — три пункта не наблюдались вживую):
1. Доводка скролла на десктопе приземляется на верх `#two-ways-in` минус 104px.
2. Фокус-обводка якорей шапки — зелёная (`--color-accent`), не серая.
3. При системном reduced-motion курсор `_` не мигает (CSS-медиа, JS-подменой не проверить).

**Отложенные миноры** (из финального ревью, не блокируют):
- Стрелки тумблера из состояния покоя не различают направление (любая → services), `Toggle.tsx`.
- Устаревший комментарий «секция монтируется Перепечаткой» в `UseCases.tsx:80`.
- Клик в хвосте печати (~400-720ms) переигрывает retype вместо скипа (исход корректен).
- `app/page.tsx`: нет `metadataBase`/`og:image`.

**Вопросы заказчику** (спека + design-direction §4):
- Применимость пяти аудиторий Platform к консалтингу (спека §2, открытый вопрос).
- Вычитка: `Take the platform` / `Take the team` + новые пункты навигации.
- Материал генеративных ассетов: «глянцевое стекло» vs запрет 3D (design-direction §4 п.8).
- Сведение двух заголовков финального CTA к одному (выбран `Tell us what you are building`).

**Прочий хвост:** перенумерация позиционных меток реестра `[VERIFY]` в `docs/content.md`;
пометка `docs/landing-concept.md` как устаревшего (описывает use-cases до pinned-скраба);
генерация 15 ассетов по брифу из design-direction (плейсхолдеры лежат в
`public/assets/approach/`).

## Практика работы с этим проектом (выучено сессией)

- **Dev-сервер** — только через preview-инструмент, конфиг `.claude/launch.json`
  (имя `crel-dev`). Скролл ведёт Lenis: колесо в автоматизации страницу не двигает,
  позиция — `window.scrollTo(...)` в консоли.
- **Вкладка превью живёт с `document.hidden=true`**, rAF заторможен: GSAP/Lenis-анимации
  не проверяются таймингами. Рабочая техника — синхронные маркеры (inline-style от
  `gsap.set`, вычисленный target доводки) и A/B через `git stash`.
- **Аргумент hero-команды** (`Hero.tsx`): узлом владеет `useTypewriter` через
  `textContent` — в JSX только константа `{hero.restArg}`, никогда `{selected ?? ...}`.
- Проверки проекта: `npx tsc --noEmit` + `npm run build` (тестового фреймворка нет,
  решение задокументировано в плане). Роут после сборки один: `/`.
- В git-конфиге есть **stale worktree** `claude/vigilant-sammet-23994f` со старого пути
  на Desktop — грепы по репо иногда цепляют его копии; не трогать ветку, регистрацию
  можно `git worktree prune`, если каталога больше нет.

## Настройка новой машины (Windows)

Канал переезда — **только GitHub**: SSD отформатирован под macOS (APFS), Windows его
не прочитает. `origin` = `https://github.com/w3dsgnr/crel-landing.git`, обе ветки запушены.

```
git clone https://github.com/w3dsgnr/crel-landing.git
cd crel-landing
git checkout merge/one-rail
npm install
```

Специфика Windows, проверено перед переездом:

- **Переносы строк.** В корне лежит `.gitattributes` с `* text=auto eol=lf` — Git for
  Windows не будет переписывать LF→CRLF независимо от локального `autocrlf`. Весь репо
  уже на LF (ренормализация прошла без изменений).
- **Симлинк скилла.** `.claude/skills/ui-ux-pro-max` — symlink на
  `.agents/skills/ui-ux-pro-max` (сама папка скилла целиком в git, 43 файла — данные
  не теряются). Windows-git без Developer Mode выкачает симлинк как текстовый файл-заглушку,
  и скилл не найдётся. Лечение — junction, админ-права не нужны (cmd, не PowerShell):

  ```
  del .claude\skills\ui-ux-pro-max
  mklink /J .claude\skills\ui-ux-pro-max .agents\skills\ui-ux-pro-max
  ```

  Либо включить Developer Mode + `git config core.symlinks true` до clone.
- **Имена файлов** проверены на NTFS-совместимость (запрещённые символы, хвостовые
  точки/пробелы, длина путей) — конфликтов нет.
- Скиллу `ui-ux-pro-max` нужен Python 3 в PATH (на Windows часто `py -3` — его скрипт
  это предусматривает).
- Пользовательские скиллы (`~/.claude/skills/`) не в репо: superpowers-набор
  (brainstorming, writing-plans, subagent-driven-development, executing-plans,
  finishing-a-development-branch, frontend-design, using-superpowers). Без них — обычный
  рабочий процесс.
- MCP-коннекторы требуют повторной авторизации на новой машине (`/mcp` в интерактивной
  сессии); для работы над лендингом ни один не обязателен.
- Артефакт доступен из аккаунта claude.ai с любой машины.
- Stale worktree `claude/vigilant-sammet-23994f` существует только на старом маке;
  на свежем clone его не будет. Уникального контента на этой ветке нет: её единственный
  коммит `7d4a029` (design(taste), 23 июля — chipTone, CodeSnippet, правило зелёного
  акцента) давно в истории `master` и уже на GitHub. Терять нечего.
