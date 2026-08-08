// 02: integration — развилка Widget vs White Label API.
// Сниппет — единственная тёмная контентная вставка состояния; моноширинный шрифт
// допустим только здесь (это код, не body-текст). v3.5: чек-строки — ячейки,
// не строки с хайрлайнами; код-окно — grad-abyss (тёмный якорь секции).
import { integration } from "@/content/platform";
import { MockupStage } from "@/components/mockups/MockupStage";
import { RampWidget } from "@/components/mockups/RampWidget";
import { CodeSnippet } from "@/components/mockups/CodeSnippet";

function Checks({ items }: { items: string[] }) {
  return (
    <div className="mt-6 flex flex-col gap-2">
      {items.map((c) => (
        <p key={c} className="rounded-(--radius-s) bg-bg-mist px-4 py-3 text-[0.9375rem]">
          {c}
        </p>
      ))}
    </div>
  );
}

export function Integration() {
  return (
    <section className="layer-v4 bg-bg-alt">
      <div className="mx-auto max-w-[1200px] px-5 py-28 md:px-12 md:py-40">
        <p className="text-label text-pine-600">{integration.section.label}</p>
        <h2 className="text-h2 mt-6 max-w-[16ch]">{integration.section.title}</h2>
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div data-reveal className="rounded-(--radius-xl) bg-bg p-8 md:p-10">
            <h3 className="text-card-title">{integration.widget.title}</h3>
            <p className="mt-3 text-[0.9375rem] text-ink-soft">{integration.widget.lead}</p>
            <Checks items={integration.widget.checks} />
            <div className="mx-auto mt-8 max-w-[340px]">
              <MockupStage isStatic>
                <RampWidget />
              </MockupStage>
            </div>
          </div>
          <div data-reveal className="rounded-(--radius-xl) bg-bg p-8 md:p-10">
            <h3 className="text-card-title">{integration.api.title}</h3>
            <p className="mt-3 text-[0.9375rem] text-ink-soft">{integration.api.lead}</p>
            <Checks items={integration.api.checks} />
            {/* v4: белая код-панель со стековой тенью (референсная сцена кода) */}
            <div className="mt-8 rounded-(--radius-m) bg-surface p-6 shadow-(--shadow-mockup)">
              <CodeSnippet lines={integration.snippet} variant="light" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
