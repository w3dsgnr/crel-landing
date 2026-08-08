// Анатомия карточки референса (docs/refs/todesktop/design.md §3.1):
// серая сцена без тени и рамки → иллюстрация (панели могут кадрироваться
// краем) → центрированный титул → hairline ~64% → muted-описание ≤3 строк.
// Дисциплина: сцена всегда --color-bg-mist, тень только у предметов внутри.
import type { ReactNode } from "react";
import { MicroTexture, type MicroTextureKind } from "./MicroTexture";

export function CardScene({
  title,
  body,
  illustration,
  texture,
  contentClassName = "",
  className = "",
}: {
  title: string;
  body: string;
  illustration: ReactNode;
  texture?: MicroTextureKind;
  /** доп. классы зоны иллюстрации (напр. items-end для кадрирования низом) */
  contentClassName?: string;
  className?: string;
}) {
  return (
    <div className={`flex h-full flex-col overflow-hidden rounded-(--radius-xl) bg-bg-mist ${className}`}>
      <div className="relative min-h-[220px] flex-1">
        {texture && <MicroTexture kind={texture} />}
        <div className={`relative flex h-full items-center justify-center p-8 ${contentClassName}`}>
          {illustration}
        </div>
      </div>
      <div className="px-8 pb-8 text-center">
        <h3 className="text-[1.3125rem] font-semibold tracking-[-0.01em]">{title}</h3>
        <div aria-hidden className="v4-hairline mt-4" />
        <p className="mx-auto mt-4 max-w-[55ch] text-[0.9375rem] leading-relaxed text-ink-soft">{body}</p>
      </div>
    </div>
  );
}
