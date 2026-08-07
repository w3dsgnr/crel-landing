// Лента логотипов партнёров — общий каркас, под hero, без заголовка
// (логотипы говорят сами). Плейсхолдеры до материалов Roman.
// v3.5: рамочные линии сняты — ленту отделяет воздух.
import { LogoLoop } from "@/components/vendor/LogoLoop";

const PLACEHOLDERS = Array.from({ length: 8 }, (_, i) => i);

export function LogoBand() {
  return (
    <div className="py-10">
      <div className="mx-auto max-w-[1200px] px-5 md:px-12">
        <LogoLoop
          items={PLACEHOLDERS.map((i) => (
            <div
              key={i}
              className="flex h-10 w-[132px] items-center justify-center rounded-(--radius-s) bg-bg-mist text-label text-ink"
            >
              [logo]
            </div>
          ))}
        />
      </div>
    </div>
  );
}
