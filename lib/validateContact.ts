// Правила валидации формы контакта (спека 2026-08-13 §Контракты).
// Возвращаем не ключ, а ГОТОВЫЙ текст ошибки из content.contact.errors:
// словарь «ключ → строка» в компоненте означал бы копирайт в двух местах, а
// весь текст проекта живёт в content/* (как mockups.* у стеклянных приборов).
import { contact } from "@/content/shared";
import type { ContactPayload } from "@/lib/submitContact";

export type FieldName = "name" | "email" | "message";

/**
 * Практичная проверка e-mail. Сознательно НЕ RFC-регексп: адрес всё равно
 * подтверждается только доставкой, а драконовский шаблон отсекает живые
 * адреса (плюс-алиасы, длинные TLD, юникод-домены). Проверяем ровно то, что
 * гарантированно указывает на опечатку: пробелы, ровно одна «собака»,
 * непустые части, домен из непустых меток с внятным TLD.
 */
function looksLikeEmail(value: string): boolean {
  if (/\s/.test(value)) return false;
  const parts = value.split("@");
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || !domain) return false;
  const labels = domain.split(".");
  // минимум две метки (есть точка), ни одна не пустая — «a@b..com» и «a@b.» мимо
  if (labels.length < 2 || labels.some((label) => label.length === 0)) return false;
  return labels[labels.length - 1].length >= 2;
}

/** null = валидно; строка = текст ошибки для показа под полем */
export function validateField(name: FieldName, value: string): string | null {
  // trim, потому что «   » — это пустое поле, а не сообщение
  const v = value.trim();
  switch (name) {
    case "name":
      return v ? null : contact.errors.nameRequired;
    case "email":
      // пустое и кривое — разные ошибки: человек должен понять, что чинить
      if (!v) return contact.errors.emailRequired;
      return looksLikeEmail(v) ? null : contact.errors.emailInvalid;
    case "message":
      return v ? null : contact.errors.messageRequired;
  }
}

/**
 * Проверка всей формы на сабмите. В результате только упавшие поля — пустой
 * объект читается как «можно отправлять» (Object.keys(...).length === 0).
 */
export function validateAll(p: ContactPayload): Partial<Record<FieldName, string>> {
  const out: Partial<Record<FieldName, string>> = {};
  (Object.keys(p) as FieldName[]).forEach((name) => {
    const error = validateField(name, p[name]);
    if (error) out[name] = error;
  });
  return out;
}
