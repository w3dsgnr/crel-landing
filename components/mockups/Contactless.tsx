// Контактлесс-дуги — общий глиф-индикатор двух приборов capabilities:
// на пластике Cards (акцентный, «карта готова к тапу») и в шапке Seller
// terminal (белый, «терминал слушает NFC» перед paid). Один компонент, чтобы
// геометрия дуг была одна и та же — иначе два прибора говорят на разных глифах.
// Загораются один раз каскадом .wg-fade (stagger 55ms) от заданного смещения
// сцены. Цикл запрещён: вечно излучающий контактлесс уводит секцию в
// крипто-виджет. Иерархия яркости дуг 0.45 / 0.7 / 1 — атрибутами, потому что
// в правилах .wg-* конечных значений opacity нет (спека §3).
export function Contactless({
  at,
  stroke = "var(--wg-accent)",
  className = "size-4",
}: {
  /** смещение первой дуги от --wg-t0, мс; следующие — +55 каждая */
  at: number;
  stroke?: string;
  className?: string;
}) {
  const arc = (i: number) => ({ transitionDelay: `calc(var(--wg-t0) + ${at + i * 55}ms)` });
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <path className="wg-fade" style={arc(0)} d="M3.5 5.5a7.5 7.5 0 0 1 0 5" opacity="0.45" />
      <path className="wg-fade" style={arc(1)} d="M6.5 4.2a10 10 0 0 1 0 7.6" opacity="0.7" />
      <path className="wg-fade" style={arc(2)} d="M9.5 2.9a12.8 12.8 0 0 1 0 10.2" />
    </svg>
  );
}
