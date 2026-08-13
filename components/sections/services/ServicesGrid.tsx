"use client";

// 02: services — слой v4 «светлый референс»: шесть серых карточек-сцен
// с изометрической инфографикой услуг (спека 2026-08-08 §5). Интерфейсные
// мини-мокапы заменены сценами; их снятие из репо — забота Плана 2.
// Glow Magic Bento в v4 отключён (референс: сцены плоские, без свечения).
import { servicesGrid } from "@/content/services";
import { BentoGrid, BentoCard } from "@/components/vendor/MagicBento";
import { CardScene } from "@/components/v4/CardScene";
import type { MicroTextureKind } from "@/components/v4/MicroTexture";
import { ImplementationScene } from "@/components/v4/scenes/ImplementationScene";
import { ArchitectureScene } from "@/components/v4/scenes/ArchitectureScene";
import { LicensingScene } from "@/components/v4/scenes/LicensingScene";
import { VendorScene } from "@/components/v4/scenes/VendorScene";
import { MobileScene } from "@/components/v4/scenes/MobileScene";
import { SupportScene } from "@/components/v4/scenes/SupportScene";

type Cell = (typeof servicesGrid.cells)[number];

function cellByTitle(title: string): Cell {
  const cell = servicesGrid.cells.find((c) => c.title === title);
  if (!cell) throw new Error(`services cell not found: ${title}`);
  return cell;
}

// сцена и текстура каждой услуги (метафоры — спека §5)
const SCENES: { title: string; scene: React.ReactNode; texture: MicroTextureKind; span: string }[] = [
  { title: "Platform implementation", scene: <ImplementationScene />, texture: "grid", span: "" },
  { title: "Architecture consulting", scene: <ArchitectureScene />, texture: "grid", span: "md:col-span-2" },
  { title: "Licensing and compliance", scene: <LicensingScene />, texture: "binary", span: "md:col-span-2" },
  { title: "Vendor selection", scene: <VendorScene />, texture: "ms", span: "" },
  { title: "Mobile apps", scene: <MobileScene />, texture: "amounts", span: "" },
  { title: "Ongoing support", scene: <SupportScene />, texture: "lines", span: "md:col-span-2" },
];

export function ServicesGrid() {
  return (
    <section className="layer-v4 bg-bg">
      <div className="mx-auto max-w-[1200px] px-5 py-28 md:px-12 md:py-40">
        {/* лейбл секции удалён, заголовок по центру — грамматика шапок 2026-08-13
            (как Approach); поле label в контенте живо — его читает реестр навигации */}
        <h2 className="text-h2 mx-auto max-w-[20ch] text-center">{servicesGrid.section.title}</h2>

        <BentoGrid
          enableSpotlight={false}
          enableBorderGlow={false}
          className="mt-16 grid grid-cols-1 gap-7 md:grid-cols-3"
        >
          {SCENES.map(({ title, scene, texture, span }) => {
            const cell = cellByTitle(title);
            return (
              <div key={title} data-reveal className={span}>
                <BentoCard enableStars={false} className="h-full rounded-(--radius-xl)">
                  <CardScene title={cell.title} body={cell.body} illustration={scene} texture={texture} />
                </BentoCard>
              </div>
            );
          })}
        </BentoGrid>
      </div>
    </section>
  );
}
