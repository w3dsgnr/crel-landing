// Лента логотипов партнёров — общий каркас, под hero, без заголовка
// (логотипы говорят сами). Плейсхолдеры до материалов Roman.
// Анатомия Krida: серая полоса во всю ширину «выступает» из-под hero —
// подтянута вверх на высоту радиуса (-mt-12 = --v4-radius-hero), hero с z-10
// перекрывает её верх, скруглённые углы читаются на сером. Скоуп layer-v4 —
// лента живёт в токенах светлого референса (bg-mist #f5f5f7).
import { LogoLoop } from "@/components/vendor/LogoLoop";

const PLACEHOLDERS = Array.from({ length: 8 }, (_, i) => i);

export function LogoBand() {
  return (
    // pt-22 = 48px под hero + ~40px воздуха до логотипов
    <div className="layer-v4 -mt-12 bg-bg-mist pt-22 pb-10">
      <div className="mx-auto max-w-[1200px] px-5 md:px-12">
        <LogoLoop
          items={PLACEHOLDERS.map((i) => (
            <div
              key={i}
              // на серой полосе mist-плитка сливается — плейсхолдер белый (surface)
              className="flex h-10 w-[132px] items-center justify-center rounded-(--radius-s) bg-surface text-label text-ink"
            >
              [logo]
            </div>
          ))}
        />
      </div>
    </div>
  );
}
