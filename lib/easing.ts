// Точные easing-токены design-direction §1 для GSAP (CustomEase, free с 3.13).
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";

let registered = false;

export function ensureEases() {
  if (registered) return;
  gsap.registerPlugin(CustomEase);
  // --ease-out-expo: появление
  CustomEase.create("crelOut", "0.16, 1, 0.3, 1");
  // --ease-swap: смены состояний, каретка
  CustomEase.create("crelSwap", "0.65, 0, 0.35, 1");
  registered = true;
}
