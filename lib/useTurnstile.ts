"use client";

// Капча обеих форм — Cloudflare Turnstile (контакт-модалка и подписка финала).
//
// Почему Turnstile: сборка output: "export" — серверных роутов нет, значит
// защита от ботов может быть только клиентским виджетом с токеном, который
// проверит эндпоинт из шва submitContact/submitLead. Turnstile бесплатен, без
// «выбери светофоры» (обычно вообще невидим), не тянет куки Google.
//
// Устройство:
//   — скрипт api.js грузится ЛЕНИВО и один раз: промис висит на модуле, первый
//     вызов хука его создаёт, остальные ждут тот же. Ничего не подгружается,
//     пока на экране нет формы — модалка монтируется по клику, финал далеко внизу;
//   — виджет рендерится явно (render=explicit) в контейнер, который отдаёт форма
//     (containerRef на пустой div), и снимается на размонтировании;
//   — наружу: token (null, пока его нет), status, interactive и reset().
//
// Ключ — NEXT_PUBLIC_TURNSTILE_SITE_KEY, инлайнится при next build (см. .env.example).
// Без ключа берётся тестовый ключ Cloudflare — он всегда проходит и позволяет
// прогонять формы локально; на проде обязателен настоящий, иначе токен «1x…»
// siteverify не примет.
import { useCallback, useEffect, useRef, useState } from "react";

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/** Тестовый sitekey Cloudflare «visible, always passes» — только фолбэк для
 *  локальной разработки, см. https://developers.cloudflare.com/turnstile/troubleshooting/testing/ */
const TEST_SITE_KEY = "1x00000000000000000000AA";

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || TEST_SITE_KEY;

/** Скрипт подгружаем один раз на страницу: промис живёт в модуле. Ловим и
 *  провал загрузки (адблок режет challenges.cloudflare.com, оффлайн) — форма
 *  обязана уметь сказать «проверка не прошла», а не висеть с мёртвой кнопкой. */
let scriptPromise: Promise<Turnstile> | null = null;

function loadTurnstile(): Promise<Turnstile> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<Turnstile>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => {
      // при render=explicit объект готов к моменту load; страховка на случай,
      // если Cloudflare сдвинет момент инициализации — тогда ждём ready()
      const t = window.turnstile;
      if (t) resolve(t);
      else reject(new Error("turnstile: script loaded without window.turnstile"));
    };
    s.onerror = () => {
      // сброс, чтобы следующее монтирование формы попробовало снова
      scriptPromise = null;
      reject(new Error("turnstile: script failed to load"));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export type TurnstileStatus =
  /** скрипт грузится / виджет ещё не отдал токен */
  | "loading"
  /** токен на руках, можно отправлять */
  | "ready"
  /** токен протух; при refresh-expired: "auto" виджет сам возьмёт новый */
  | "expired"
  /** скрипт не загрузился, ключ не подходит домену, браузер не поддержан */
  | "error";

export type UseTurnstileOptions = {
  theme?: TurnstileTheme;
  size?: TurnstileSize;
  /** interaction-only: виджет невидим, пока не понадобится клик человека — по
   *  умолчанию так везде, чтобы капча не мозолила глаза в чистой форме */
  appearance?: TurnstileAppearance;
  /** метка действия для siteverify (contact / lead) — по ней сервер отличает формы */
  action?: string;
  /** false — ничего не грузим и не рендерим (форма далеко за экраном); при
   *  переходе в true виджет монтируется. Модалке не нужно: она сама живёт
   *  только по клику; финалу — нужно, он смонтирован с первого кадра страницы */
  enabled?: boolean;
};

export function useTurnstile({
  theme = "light",
  size = "flexible",
  appearance = "interaction-only",
  action,
  enabled = true,
}: UseTurnstileOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<TurnstileStatus>("loading");
  // виджету понадобился клик — он стал видимым; формы дают ему воздух только в
  // этот момент, иначе пустой контейнер interaction-only занимал бы отступ впустую
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!enabled || !el) return;
    let cancelled = false;

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled) return;
        widgetIdRef.current = turnstile.render(el, {
          sitekey: TURNSTILE_SITE_KEY,
          theme,
          size,
          appearance,
          action,
          "response-field": false,
          callback: (t) => {
            setToken(t);
            setStatus("ready");
            setInteractive(false);
          },
          "expired-callback": () => {
            setToken(null);
            setStatus("expired");
          },
          "error-callback": () => {
            setToken(null);
            setStatus("error");
          },
          "unsupported-callback": () => {
            setToken(null);
            setStatus("error");
          },
          "before-interactive-callback": () => setInteractive(true),
          "after-interactive-callback": () => setInteractive(false),
        });
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      const id = widgetIdRef.current;
      widgetIdRef.current = undefined;
      // remove, а не reset: контейнер уходит вместе с формой (модалка
      // размонтируется на закрытии), висячий iframe остался бы в памяти
      if (id !== undefined) window.turnstile?.remove(id);
    };
  }, [theme, size, appearance, action, enabled]);

  /** Сброс после попытки отправки — токен одноразовый: siteverify второй раз
   *  его не примет, значит на повтор (после ошибки) нужен новый. */
  const reset = useCallback(() => {
    setToken(null);
    setStatus("loading");
    const id = widgetIdRef.current;
    if (id !== undefined) window.turnstile?.reset(id);
  }, []);

  return { containerRef, token, status, interactive, reset };
}
