// Лента логотипов партнёров — общий каркас, под hero, без заголовка
// (логотипы говорят сами). Плейсхолдеры до материалов Roman.
import { LogoLoop } from "@/components/vendor/LogoLoop";

const PLACEHOLDERS = Array.from({ length: 8 }, (_, i) => i);

export function LogoBand() {
  return (
    <div className="border-y border-line py-6">
      <div className="mx-auto max-w-[1200px] px-5 md:px-12">
        <LogoLoop
          items={PLACEHOLDERS.map((i) => (
            <div
              key={i}
              className="flex h-10 w-[132px] items-center justify-center rounded-(--radius-m) bg-bg-alt text-label text-ink"
            >
              [logo]
            </div>
          ))}
        />
      </div>
    </div>
  );
}
