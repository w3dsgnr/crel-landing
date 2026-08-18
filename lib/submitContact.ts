// Адаптер отправки формы контакта.
//
// Это заглушка, и она такая не по недосмотру: next.config.ts → output: "export",
// сборка кладётся статикой на любой хост — route handlers и server actions в этой
// модели не существуют вовсе (спека 2026-08-13 §Ограничения проекта). Пока почтовый
// провайдер не выбран владельцем, единственный честный вариант — не изображать
// сетевой запрос: форма доигрывает свой цикл, сеть не трогается.
//
// Когда эндпоинт появится, правится РОВНО одно место — шов внутри submitContact.
// Контракт наружу не меняется: ContactForm уже умеет и ok, и error.

/** поля, которые вводит человек — ими оперируют форма и валидация */
export type ContactFields = { name: string; email: string; message: string };
/** то, что уходит на эндпоинт: поля + одноразовый токен Cloudflare Turnstile
 *  (lib/useTurnstile.ts); сервер обязан проверить его через siteverify */
export type ContactPayload = ContactFields & { turnstileToken: string };
export type SubmitResult = { ok: true } | { ok: false; error: string };

// Задержка заглушки. Смысл не в правдоподобии, а в том, что фаза "submitting"
// обязана быть видимой: без неё кнопка мигает и человек не понимает, отправилось ли.
const STUB_LATENCY_MS = 900;

export async function submitContact(payload: ContactPayload): Promise<SubmitResult> {
  // ── ШОВ: подключение реального эндпоинта ──────────────────────────────────
  // Одна строка вместо двух строк заглушки ниже (ENDPOINT — CORS-адрес формы:
  // Formspree / прокси Resend / собственный API на отдельном домене):
  //
  //   const res = await fetch(ENDPOINT, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
  //   return res.ok ? { ok: true } : { ok: false, error: `HTTP ${res.status}` };
  //
  // Эндпоинт ОБЯЗАН верифицировать payload.turnstileToken до отправки письма:
  //   POST https://challenges.cloudflare.com/turnstile/v0/siteverify
  //   body: { secret: TURNSTILE_SECRET_KEY, response: payload.turnstileToken, remoteip }
  //   → { success: boolean, action, ... }; при !success отвечать 4xx, форма
  //   покажет errorGeneric. Секрет живёт только на сервере (не NEXT_PUBLIC_).
  //   Токен одноразовый и живёт ~5 минут — форма сбрасывает виджет после каждой
  //   попытки, повторно один токен не приходит.
  // ──────────────────────────────────────────────────────────────────────────

  // payload не читается: заглушке нечего с ним делать, но имя держим в сигнатуре —
  // шов выше подставляется без правки объявления функции.
  void payload;
  await new Promise((resolve) => setTimeout(resolve, STUB_LATENCY_MS));
  return { ok: true };
}
