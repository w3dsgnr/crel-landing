// Адаптер захвата e-mail из финального блока.
//
// Зеркало lib/submitContact.ts и по причине, и по устройству: next.config.ts →
// output: "export", серверных роутов в этой модели нет вовсе, а провайдер
// рассылки владельцем ещё не выбран — значит единственный честный вариант тот
// же, что у формы контакта: форма доигрывает свой цикл, сеть не трогается.
//
// Отдельный модуль, а не флаг у submitContact: адресаты разные (письмо команде
// против списка рассылки) и эндпоинты у них будут разные — шов обязан быть
// свой. Когда эндпоинт появится, правится РОВНО одно место — шов ниже.

import type { SubmitResult } from "@/lib/submitContact";

/** email + одноразовый токен Cloudflare Turnstile (lib/useTurnstile.ts) —
 *  тот же контракт, что у ContactPayload: сервер проверяет токен через siteverify */
export type LeadPayload = { email: string; turnstileToken: string };

// Реэкспорт, чтобы форма финала брала и функцию, и её результат из одного
// модуля: тип у двух адаптеров общий, и разводить его по двум импортам значило
// бы тащить в финал зависимость от формы контакта.
export type { SubmitResult };

// Задержка заглушки — как в submitContact: фаза "submitting" обязана быть
// видимой, иначе кнопка мигает и человек не понимает, отправилось ли.
const STUB_LATENCY_MS = 900;

export async function submitLead(payload: LeadPayload): Promise<SubmitResult> {
  // ── ШОВ: подключение реального эндпоинта ──────────────────────────────────
  // Одна строка вместо двух строк заглушки ниже (ENDPOINT — CORS-адрес списка
  // рассылки: Buttondown / Mailchimp-прокси / собственный API на отдельном домене):
  //
  //   const res = await fetch(ENDPOINT, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
  //   return res.ok ? { ok: true } : { ok: false, error: `HTTP ${res.status}` };
  //
  // Эндпоинт ОБЯЗАН верифицировать payload.turnstileToken до записи в список
  // (см. тот же блок в submitContact.ts): POST …/turnstile/v0/siteverify с
  // секретом сервера, при !success — 4xx. Токен одноразовый, форма сбрасывает
  // виджет после каждой попытки.
  // ──────────────────────────────────────────────────────────────────────────

  // payload не читается: заглушке нечего с ним делать, но имя держим в сигнатуре —
  // шов выше подставляется без правки объявления функции.
  void payload;
  await new Promise((resolve) => setTimeout(resolve, STUB_LATENCY_MS));
  return { ok: true };
}
