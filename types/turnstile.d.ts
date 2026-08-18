// Типы клиентского API Cloudflare Turnstile (window.turnstile).
// Официального пакета типов у Cloudflare нет; описан ровно тот срез API,
// который использует lib/useTurnstile.ts — https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/
// Файл подхватывается tsconfig «**/*.ts», отдельного include не нужно.

type TurnstileTheme = "light" | "dark" | "auto";
type TurnstileSize = "normal" | "flexible" | "compact";
type TurnstileAppearance = "always" | "execute" | "interaction-only";

interface TurnstileRenderOptions {
  sitekey: string;
  /** токен готов — его и уносим в payload формы */
  callback?: (token: string) => void;
  /** сбой виджета (сеть, домен не в списке ключа и т. п.); код ошибки — строка */
  "error-callback"?: (code?: string) => void;
  /** токен протух (живёт ~5 минут); при refresh-expired: "auto" виджет сам возьмёт новый */
  "expired-callback"?: () => void;
  /** виджету понадобилось взаимодействие человека — сейчас он станет видимым */
  "before-interactive-callback"?: () => void;
  "after-interactive-callback"?: () => void;
  /** браузер не поддерживается — токена не будет */
  "unsupported-callback"?: () => void;
  theme?: TurnstileTheme;
  size?: TurnstileSize;
  appearance?: TurnstileAppearance;
  action?: string;
  cData?: string;
  /** скрытый input cf-turnstile-response внутри контейнера; нам не нужен — токен уходит из JS */
  "response-field"?: boolean;
  "response-field-name"?: string;
  "refresh-expired"?: "auto" | "manual" | "never";
  retry?: "auto" | "never";
  "retry-interval"?: number;
  language?: string;
  tabindex?: number;
  execution?: "render" | "execute";
}

interface Turnstile {
  /** возвращает widgetId для reset/remove; undefined, если контейнер не найден */
  render(container: HTMLElement | string, options: TurnstileRenderOptions): string | undefined;
  reset(widgetId?: string): void;
  remove(widgetId?: string): void;
  getResponse(widgetId?: string): string | undefined;
  isExpired(widgetId?: string): boolean;
  execute(container?: HTMLElement | string, options?: TurnstileRenderOptions): void;
  ready(cb: () => void): void;
}

interface Window {
  turnstile?: Turnstile;
}
