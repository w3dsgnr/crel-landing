// Семантика статус-чипов: успех/живое — акцент, процесс — нейтраль.
// Единственное место, где решается «какой чип зелёный».
const SUCCESS = new Set([
  "verified",
  "passed",
  "clear",
  "approved",
  "active",
  "paid",
  "enabled",
  "live",
  "selected",
]);

export function chipToneClass(label: string, onDark = false): string {
  if (!SUCCESS.has(label)) {
    return onDark ? "border-ink-invert/40 text-ink-invert" : "border-line text-ink";
  }
  return onDark
    ? "border-accent-bright/50 text-accent-bright"
    : "border-accent/35 text-accent-deep";
}
