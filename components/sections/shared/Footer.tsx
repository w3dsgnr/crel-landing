// Футер — общий, без анимаций. Юр. строка и комплаенс-полоса — видимые
// [VERIFY]-плейсхолдеры до credentials от Roman (content.md).
//
// Спека 2026-08-13: футер стоит на плоскости финала — плоский #2668d9
// (.bg-finale), тот же цвет, что у нижнего края .grad-finale, поэтому шва
// между секцией и футером не видно. Разделительных линий нет вовсе: блоки
// отделены воздухом (правило v3.5), а весь текст — белый либо white/90:
// вторичный калибр спеки (/85) на #2668d9 даёт 4.20:1 и не проходит AA для
// мелкого текста, ближайшее значение, которое проходит, — /90 (4.51:1).
//
// Директива "use client" не нужна: Footer импортируется из Landing.tsx,
// который уже клиентский, — модуль целиком внутри клиентской границы, и
// контекст легал-модалки доезжает без переноса директив.
import { footer, navAnchors } from "@/content/shared";
import { useLegalModal } from "@/components/legal/LegalModalProvider";

/** общий калибр ссылок обеих групп: мелкая строчная строка, hover — до белого */
const LINK = "text-[0.875rem] lowercase text-white/90 transition-colors duration-(--d-quick) hover:text-white";

export function Footer() {
  const { openLegal } = useLegalModal();
  return (
    <footer className="bg-finale text-white">
      <div className="mx-auto max-w-[1200px] px-5 py-16 md:px-12">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div>
            <p className="text-[1.05rem] font-bold tracking-[-0.02em]">c:rel_</p>
            {/* адрес остаётся живой ссылкой: модалка контакта — не единственный
                путь, почтовый клиент никто не отменял */}
            <a href={`mailto:${footer.email}`} className={`mt-4 inline-block ${LINK} tracking-[0.12em]`}>
              {footer.email}
            </a>
          </div>

          <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
            {/* две группы ссылок — два landmark'а: навигация по секциям и
                легальные документы озвучиваются раздельно (спека §Доступность) */}
            <nav aria-label={footer.navLabel} className="flex flex-col items-start gap-3">
              {navAnchors.map(({ label, id }) => (
                <a key={id} href={`#${id}`} className={LINK}>
                  {label}
                </a>
              ))}
            </nav>
            {/* легал — кнопки, а не ссылки: документы живут в модалке, отдельных
                страниц у них нет (output: "export", один документ = один UI).
                cursor-pointer — компенсация preflight Tailwind v4. */}
            <nav aria-label={footer.legalLabel} className="flex flex-col items-start gap-3">
              {footer.legalLinks.map(({ id, label }) => (
                <button key={id} type="button" onClick={() => openLegal(id)} className={`cursor-pointer ${LINK}`}>
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[52ch] text-[0.8125rem] leading-relaxed text-white/90">
            <p>{footer.legal}</p>
            <p className="mt-2">{footer.complianceStrip}</p>
          </div>
          <p className="text-[0.75rem] text-white/90">{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
