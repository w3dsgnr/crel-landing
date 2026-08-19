"use client";

// Финал страницы (спека 2026-08-13) — плоскость во весь экран: та же
// машина печати, что в hero, форма захвата e-mail и CTA модалки контакта.
// Заменяет FinalCta; якорь #contact переехал сюда вместе с ролью «конец
// разговора».
//
// Цвет (правка 2026-08-19): .grad-finale — чёрный #0a0a0a, как hero, с
// cursor-grid по движению курсора; до этого была синяя плоскость #2668d9 со
// свечением бренда. Белый текст на чёрном — AA с запасом; вторичный калибр
// остаётся white/90, словарь (белая пилюля, белые кольца) — тот же, что у
// инвертированного hero. Упоминания «#2668d9» в комментариях ниже — история
// расчётов контраста, на чёрном они выполняются с запасом.
//
// Директива "use client" здесь нужна не ради контекста модалок (Landing уже
// клиентский), а ради собственных хуков: машина печати, IntersectionObserver
// и состояние формы живут в этом модуле.
import { useEffect, useId, useRef, useState } from "react";
import { contact, finale, hero } from "@/content/shared";
import { submitLead, type SubmitResult } from "@/lib/submitLead";
import { validateField } from "@/lib/validateContact";
import { useTurnstile } from "@/lib/useTurnstile";
import { useContactModal } from "@/components/contact/ContactModalProvider";
import { useLegalModal } from "@/components/legal/LegalModalProvider";
import { useTypewriter } from "@/lib/useTypewriter";
import { useHeroCycle } from "@/lib/useHeroCycle";
import { CursorGrid } from "@/components/vendor/CursorGrid";

/** Фазы формы захвата. «error» фазой не является: провал отправки и ошибка
 *  валидации — это одна и та же шторка под рядом, а сам ряд остаётся живым и
 *  готовым к повтору (в отличие от модалки контакта, где фаза правит целой
 *  очередью схлопывания). */
type LeadPhase = "idle" | "submitting" | "success";

/** = --d-quick. Удержание текста ошибки на время схлопывания шторки —
 *  дословно приём Field.tsx: снимать текст в тот же кадр нельзя, иначе
 *  сжимается пустая полоса. */
const D_QUICK_MS = 200;

/** общий калибр белой пилюли CTA — тот же приём, что у LINK в Footer.tsx этого
 *  коммита: форма и hover едины, паддинги и лэйаут остаются за вызывающей
 *  стороной (кнопка ряда формы и CtaButton несут разную геометрию) */
const PILL =
  "rounded-(--radius-pill) bg-white text-[0.8125rem] lowercase tracking-[0.08em] text-ink transition-[background-color,transform] duration-(--d-quick) hover:-translate-y-px hover:bg-white/90";

/** Кольцо-чек успеха — словарь тоста приборов (ContactForm.tsx §SuccessRing),
 *  перекрашенный под синюю плоскость: обводка и галка белые. Акцентный синий
 *  здесь был бы невидим — та же причина, по которой бел курсор логотипа.
 *  finale-success-ring — ручка для «щелчка» в конце сцены (globals.css). */
function SuccessRing() {
  return (
    <span
      aria-hidden
      className="finale-success-ring flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-white"
    >
      <svg viewBox="0 0 12 12" className="size-3.5">
        <path
          d="M2 6.2 5 9l5-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Finale() {
  const { open } = useContactModal();
  const { openLegal } = useLegalModal();

  const sectionRef = useRef<HTMLElement>(null);
  const argRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const [inView, setInView] = useState(false);
  const typewriter = useTypewriter(argRef, cursorRef);
  // Цикл гейтится вьюпортом (спека §Motion): за экраном таймеры не тикают.
  // Единственный санкционированный бесконечный цикл сайта — машина печати, и
  // держать вторую копию работающей на невидимой секции незачем.
  useHeroCycle(typewriter, inView);

  // Уход за экран возвращает аргумент в исходное «rel». Без этого цикл при
  // возврате стартовал бы с шага 0 («rel» → «platform»), считая длину стирания
  // по WORDS[0], а на экране стояло бы другое слово — таймеры разъехались бы с
  // печатью. Сброс невидим по определению: секции в кадре нет.
  // Машина печати через ref (приём самого useHeroCycle): она отдаёт новый
  // объект на каждый рендер, а сброс обязан случаться только на смене видимости.
  const typewriterRef = useRef(typewriter);
  typewriterRef.current = typewriter;
  useEffect(() => {
    if (!inView) typewriterRef.current.skipTo(hero.restArg);
  }, [inView]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    // isIntersecting переключается на границе 0 — порог тут ни на что не
    // влияет. Фактическое поведение: цикл заводится с первого видимого
    // пикселя секции и глохнет, только когда она целиком уходит за экран.
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<LeadPhase>("idle");
  const uid = useId();
  const errorId = `${uid}-error`;

  const busy = phase === "submitting";
  const done = phase === "success";

  // Капча Cloudflare Turnstile (lib/useTurnstile.ts) — та же, что в модалке
  // контакта. Финал смонтирован с первого кадра, поэтому виджет включается
  // только когда секция ХОТЬ РАЗ показалась на экране (флаг липкий: уход за
  // экран не должен снимать уже полученный токен). interaction-only — виджет
  // невидим, пока Cloudflare не попросит клика; тогда он раскроется под рядом
  // формы. Тема dark: плоскость чёрная (2026-08-19), светлая плашка Turnstile
  // здесь читалась бы пятном. size flexible — на всю
  // ширину ряда (max-w 460px), фиксированные 300px не сошлись бы с пилюлей.
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (inView) setSeen(true);
  }, [inView]);
  const captcha = useTurnstile({ theme: "dark", size: "flexible", action: "lead", enabled: seen });
  // Кнопка невалидна без токена. Провал самой капчи (скрипт заблокирован,
  // ключ не для домена) — тем же текстом-шторкой, что и провал отправки; на
  // aria-invalid поля он не влияет: адрес тут ни при чём.
  const captchaError = captcha.status === "error" && !done ? finale.emailVerifyError : null;

  // WCAG 2.4.3 (порядок фокуса): на успехе кнопка сабмита, на которой стоял
  // фокус, становится disabled — браузер снимает фокус на body, и Tab по
  // странице начинался бы заново с начала документа. Уводим фокус на строку
  // успеха явно; tabIndex=-1 на ней держит её вне таб-порядка — это
  // программный якорь для скринридера, а не интерактивный элемент.
  useEffect(() => {
    if (done) successRef.current?.focus({ preventScroll: true });
  }, [done]);

  // Текст ошибки переживает схлопывание шторки — см. Field.tsx: живой регион
  // отдаём пустым только после перехода, иначе схлопывается пустая полоса.
  const [held, setHeld] = useState<string | null>(null);
  useEffect(() => {
    if (error) {
      setHeld(error);
      return;
    }
    const t = window.setTimeout(() => setHeld(null), D_QUICK_MS);
    return () => window.clearTimeout(t);
  }, [error]);
  // ошибка поля/отправки приоритетнее ошибки капчи: она свежее по времени
  const shownError = error ?? held ?? captchaError;
  const alertOpen = Boolean(error || captchaError);

  const change = (v: string) => {
    setEmail(v);
    // late validation / early revalidation — грамматика формы контакта:
    // до первой показанной ошибки поле молчит, после — переспрашивается
    if (error) setError(validateField("email", v));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // preventDefault, иначе статический экспорт просто перезагрузит страницу
    e.preventDefault();
    if (busy || done) return;

    const found = validateField("email", email);
    setError(found);
    if (found) return;
    // кнопка и так disabled без токена; страховка от Enter в поле
    const turnstileToken = captcha.token;
    if (!turnstileToken) return;

    setPhase("submitting");
    const result: SubmitResult = await submitLead({ email, turnstileToken });
    // токен одноразовый — виджет сбрасывается после любого исхода
    captcha.reset();
    if (result.ok) {
      setPhase("success");
      return;
    }
    // адрес остаётся в поле: повтор — по той же кнопке
    setError(result.error || finale.emailErrorGeneric);
    setPhase("idle");
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      // min-h-dvh + my-auto у контейнера: финал занимает экран целиком, контент
      // стоит по его центру. Футер ниже несёт тот же #2668d9 — шва не видно.
      className="grad-finale relative isolate flex min-h-dvh flex-col text-white"
    >
      {/* cursor-grid как в hero (правка 2026-08-19): клетки вспыхивают под
          курсором на чёрной плоскости; события — с секции, слой -z-10 под
          контентом (isolate) */}
      <CursorGrid />
      <div className="mx-auto my-auto w-full max-w-[1200px] px-5 py-28 md:px-12">
        {/* смысл секции для скринридера: логотип ниже — декорация */}
        <h2 className="sr-only">{finale.srTitle}</h2>

        {/* Разметка машины печати — дословно hero: "c:" статичен, аргументом
            после монтирования владеет useTypewriter (пишет в textContent).
            Курсор акцентный синий, как в hero (плоскость чёрная с 2026-08-19;
            на прежней синей был белым). */}
        <div aria-hidden className="text-finale select-none">
          c:
          <span ref={argRef} suppressHydrationWarning>
            {hero.restArg}
          </span>
          <span ref={cursorRef} className="cursor-blink text-accent">
            _
          </span>
        </div>

        <p data-reveal className="mt-8 max-w-[46ch] text-[1.0625rem] leading-relaxed">
          {finale.sub}
        </p>

        <div data-reveal className="mt-12 max-w-[460px]">
          {/* вторичный калибр — white/90, а не /85: на #2668d9 замер даёт 4.51:1
              против 4.20:1, и только первое проходит AA для мелкого текста.
              Спека называет /85 полом вторичного — здесь пол поднят до
              ближайшего значения, которое держит норму */}
          <p className="text-[0.875rem] leading-relaxed text-white/90">{finale.emailLead}</p>

          {/* noValidate: нативные пузыри браузера конкурировали бы со шторкой
              ошибки и не подчиняются языку сайта. data-phase / data-alert —
              ручки для хореографии: она читает состояние из DOM, не из React. */}
          <form
            aria-label={finale.formAria}
            onSubmit={onSubmit}
            noValidate
            data-phase={phase}
            data-alert={alertOpen ? "on" : "off"}
            className="mt-4"
          >
            <div className="finale-row grid" style={{ gridTemplateRows: done ? "0fr" : "1fr" }} inert={done}>
              <div className="finale-row-clip overflow-hidden">
                {/* стекло на цветной плоскости — существующий рецепт .glass-tint;
                    кнопка сидит внутри пилюли, поэтому корпус на p-1.5 */}
                <div className="glass-tint flex items-center gap-2 rounded-(--radius-pill) py-1.5 pr-1.5 pl-5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-white">
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    // видимой подписи у ряда нет: у поля есть aria-label, но
                    // видимую роль несёт placeholder — поэтому он держит AA
                    // (white/90 = 4.51:1 на #2668d9), а не декоративные /70;
                    // имя для скринридера — тот же лейбл, что у поля в модалке
                    aria-label={contact.emailLabel}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    placeholder={finale.emailPlaceholder}
                    value={email}
                    onChange={(e) => change(e.target.value)}
                    // на успехе тоже disabled: схлопнутый ряд остаётся в DOM, и
                    // там, где inert не поддержан, живой инпут ловил бы Tab
                    disabled={busy || done}
                    className="min-w-0 flex-1 bg-transparent text-[0.9375rem] text-white outline-none placeholder:text-white/90 disabled:cursor-not-allowed"
                  />
                  {/* белая пилюля — словарь инвертированного CTA (hero на чёрном) */}
                  <button
                    type="submit"
                    // без токена капчи — тоже disabled: до первого показа
                    // секции и ~секунду после (Turnstile молча проходит проверку)
                    disabled={busy || done || captcha.token === null}
                    className={`shrink-0 cursor-pointer ${PILL} px-5 py-2.5 disabled:cursor-not-allowed disabled:opacity-70`}
                  >
                    {busy ? finale.emailSending : finale.emailSubmit}
                  </button>
                </div>
              </div>
            </div>

            {/* Контейнер капчи — под рядом, на всю его ширину (size flexible).
                В interaction-only он пуст по высоте, пока Turnstile не попросит
                клика; отступ сверху даём только на это время, чтобы в чистой
                форме между рядом и шторкой ошибки не стоял пустой зазор */}
            <div ref={captcha.containerRef} className={captcha.interactive && !done ? "pt-3" : ""} />

            {/* шторка ошибки: grid-template-rows 0fr → 1fr, как у поля формы
                контакта. Цвет предупреждения на синем взять неоткуда
                (--v4-warn читался бы как декор) — текст белый, роль несёт
                role="alert" на постоянно смонтированном контейнере */}
            <div
              id={errorId}
              role="alert"
              className="finale-alert grid"
              style={{ gridTemplateRows: alertOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="px-5 pt-2 text-[0.8125rem]">{shownError}</p>
              </div>
            </div>

            {/* Вердикт: ряд схлопывается, на его месте прирастает строка с
                кольцом-чеком. Живой регион смонтирован всегда, содержимое
                приходит в момент успеха — иначе часть скринридеров молчит.
                Стартовую позу телу даёт @starting-style (globals.css). */}
            <div className="finale-success grid" style={{ gridTemplateRows: done ? "1fr" : "0fr" }}>
              <div className="overflow-hidden">
                {/* role="status" уже подразумевает aria-live="polite" — явный
                    дубль старые скринридеры объявляют дважды */}
                <div role="status">
                  {done && (
                    <div
                      ref={successRef}
                      tabIndex={-1}
                      className="finale-success-body flex items-center gap-3"
                    >
                      <SuccessRing />
                      <p className="text-[0.9375rem]">{finale.emailSuccess}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* согласие: подчёркнутая кнопка открывает privacy-модалку.
                type="button" обязателен — внутри формы это был бы сабмит */}
            <p className="mt-3 text-[0.75rem] leading-relaxed text-white/90">
              {finale.consentPrefix}
              <button
                type="button"
                onClick={() => openLegal("privacy")}
                className="cursor-pointer underline underline-offset-2 transition-colors duration-(--d-quick) hover:text-white"
              >
                {finale.consentLinkLabel}
              </button>
            </p>
          </form>
        </div>

      </div>

      {/* второй путь того же разговора: не письмо в список, а прямой контакт.
          CTA вынесен из контейнера: это отдельный блок-кнопка на всю ширину
          плоскости, край в край, под контентом финала (см. CtaButton) */}
      <CtaButton label={finale.ctaPrimary} onClick={open} />
    </section>
  );
}

/** CTA финала — кнопка во весь экран: полоса на всю ширину плоскости, край в
 *  край, высотой в большую часть вьюпорта, текст display-калибра. В покое она
 *  и есть плоскость финала (тот же синий, шва с футером по-прежнему нет), а
 *  глиф «_» мигает белым — та же грамматика курсора, что у логотипа выше.
 *  Единственный жест — инверсия по наведению/фокусу: полоса становится белой,
 *  текст — синим #2668d9 (словарь белой пилюли, растянутый до экрана).
 *  Геометрия, инверсия и фокус — .finale-cta в globals.css: глобальное белое
 *  кольцо фокуса на белой полосе было бы невидимо. */
function CtaButton({ label, onClick }: { label: string; onClick(): void }) {
  const text = label.endsWith("_") ? label.slice(0, -1) : label;
  const hasCursor = label.endsWith("_");
  return (
    // cursor-pointer — компенсация preflight Tailwind v4: у <button> его нет.
    // w-full: секция — flex-col, кнопка растягивается на всю плоскость сама.
    <button
      type="button"
      onClick={onClick}
      data-reveal
      className="finale-cta flex w-full cursor-pointer items-center justify-center px-5 md:px-12"
    >
      <span className="text-finale-cta">
        {text}
        {hasCursor && (
          <span aria-hidden className="cursor-blink">
            _
          </span>
        )}
      </span>
    </button>
  );
}
