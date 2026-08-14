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

export type ContactPayload = { name: string; email: string; message: string };
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
  // ──────────────────────────────────────────────────────────────────────────

  // payload не читается: заглушке нечего с ним делать, но имя держим в сигнатуре —
  // шов выше подставляется без правки объявления функции.
  void payload;
  await new Promise((resolve) => setTimeout(resolve, STUB_LATENCY_MS));
  return { ok: true };
}
