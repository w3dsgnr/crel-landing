// Футер — общий, без анимаций. Реквизиты и комплаенс-полоса — видимые
// [VERIFY]-плейсхолдеры до credentials от Roman (content.md).
//
// Редизайн 2026-08-18 по референсу milkyway (docs/refs/footer-milkyway/
// design.md): плакат в раме. Рама — синяя плоскость финала (.bg-finale,
// #2668d9): футер продолжает плоскость Finale без шва (решение 2026-08-18,
// вместо чёрной bookend-рамы). Внутри —
// светлая карточка bg-mist со скруглёнными ВЕРХНИМИ углами того же радиуса,
// что низ hero, отступ от рамы по бокам и сверху равный, до низа страницы.
// Три яруса: шапка (заголовок + моно-реквизиты) / контакт (e-mail + ссылки)
// / вордмарк, у которого видна только верхняя половина — карточка режет его
// нижним краем, и слово читается как объект. Единственная линия блока —
// hairline под e-mail; остальное разведено воздухом (правило v3.5).
// Моушна нет вовсе, кроме цвета ссылок: блок — точка покоя после финала.
//
// Карточка — .layer-v4 со светлыми токенами; .bg-finale задаёт белый color
// на плоскости, поэтому text-ink на карточке выставлен явно.
//
// Директива "use client" не нужна: Footer импортируется из Landing.tsx,
// который уже клиентский, — модуль целиком внутри клиентской границы, и
// контекст легал-модалки доезжает без переноса директив.
import { footer, navAnchors } from "@/content/shared";
import { useLegalModal } from "@/components/legal/LegalModalProvider";

/** общий калибр ссылок обеих групп: мелкая строчная строка, hover — до ink */
const LINK = "text-[0.8125rem] lowercase text-ink-soft transition-colors duration-(--d-quick) hover:text-ink";

/** отступ карточки от рамы — ~3% ширины референса, ограничен 16..60px */
const INSET = "clamp(16px,3vw,60px)";
/** воздух между ярусами — ~150px на 2000 референса */
const TIER = "clamp(3rem,7vw,9rem)";

export function Footer() {
  const { openLegal } = useLegalModal();
  return (
    <footer className="layer-v4 bg-finale" style={{ padding: `${INSET} ${INSET} 0` }}>
      <div className="layer-v4 overflow-hidden rounded-t-(--v4-radius-hero) bg-bg-mist text-ink">
        {/* ярус 1: заголовок слева, реквизиты моно справа; ниже md — в столбик */}
        <div className="px-[clamp(1.25rem,2.5vw,3rem)] pt-[clamp(2.5rem,5vw,6rem)]">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <h2 className="text-[clamp(3rem,5.5vw,7rem)] font-medium uppercase leading-none tracking-[-0.02em]">
              {footer.heading}
            </h2>
            <div className="text-[0.8125rem] uppercase leading-[1.5] tracking-[0.06em]">
              <dl className="flex flex-wrap gap-x-10 gap-y-4 md:justify-end">
                {footer.meta.map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-ink-soft">{label}</dt>
                    <dd className="text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
              {/* copyright и комплаенс-полоса — служебные строки рядом с реквизитами */}
              <p className="mt-4 text-ink-soft md:text-right">{footer.copyright}</p>
              <p className="mt-1 max-w-[52ch] normal-case text-ink-soft md:ml-auto md:text-right">
                {footer.complianceStrip}
              </p>
            </div>
          </div>

          {/* ярус 2: e-mail крупно с hairline на ширину строки + две группы
              ссылок — два landmark'а: навигация по секциям и легальные
              документы озвучиваются раздельно (спека §Доступность) */}
          <div
            className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between"
            style={{ marginTop: TIER }}
          >
            {/* адрес остаётся живой ссылкой: модалка контакта — не единственный
                путь, почтовый клиент никто не отменял */}
            <a
              href={`mailto:${footer.email}`}
              className="inline-block max-w-full self-start whitespace-nowrap border-b border-line pb-[0.3em] text-[clamp(1.25rem,1.8vw,2rem)] font-medium uppercase leading-none tracking-[-0.01em] text-ink transition-colors duration-(--d-quick) hover:text-ink-soft"
            >
              {footer.email}
            </a>

            <div className="flex gap-12 sm:gap-16">
              <nav aria-label={footer.navLabel} className="flex flex-col items-start gap-2">
                {navAnchors.map(({ label, id }) => (
                  <a key={id} href={`#${id}`} className={LINK}>
                    {label}
                  </a>
                ))}
              </nav>
              {/* легал — кнопки, а не ссылки: документы живут в модалке, отдельных
                  страниц у них нет (output: "export", один документ = один UI).
                  cursor-pointer — компенсация preflight Tailwind v4. */}
              <nav aria-label={footer.legalLabel} className="flex flex-col items-start gap-2">
                {footer.legalLinks.map(({ id, label }) => (
                  <button key={id} type="button" onClick={() => openLegal(id)} className={`cursor-pointer ${LINK}`}>
                    {label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* ярус 3: вордмарк, срезанный пополам. line-height 1 + отрицательный
              margin-bottom: нижняя часть строки выходит за карточку и режется её
              overflow-hidden — низ страницы = срез. Величина −0.4em считана по
              метрикам Space Grotesk (baseline на 0.85em от верха строки при
              line-height 1, x-height 0.5em): срез проходит ровно по середине
              строчных, как в референсе. Кегль в vw, поэтому высота известна до
              загрузки шрифта (CLS нет). Декоративен — aria-hidden.
              Без «_» (решение 2026-08-18): курсор под baseline ушёл бы под срез,
              а поднятый relative-сдвигом перекрывал своим inline-боксом ссылки
              ярусом выше. Кегль подобран так, чтобы «c:rel» легло на всю ширину
              карточки (100vw − 2·INSET). */}
          <p
            aria-hidden
            className="-mb-[0.4em] text-[46vw] font-bold leading-none tracking-[-0.04em] whitespace-nowrap select-none"
            style={{ marginTop: TIER }}
          >
            {footer.wordmark}
          </p>
        </div>
      </div>
    </footer>
  );
}
