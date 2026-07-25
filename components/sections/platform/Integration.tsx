// 02: integration — развилка Widget vs White Label API.
// Сниппет — единственная тёмная контентная вставка состояния; моноширинный шрифт
// допустим только здесь (это код, не body-текст).
import { integration } from "@/content/platform";
import { MockupStage } from "@/components/mockups/MockupStage";
import { RampWidget } from "@/components/mockups/RampWidget";
import { CodeSnippet } from "@/components/mockups/CodeSnippet";

function Checks({ items }: { items: string[] }) {
  return (
    <div className="mt-6">
      {items.map((c) => (
        <p key={c} className="border-t border-line py-3 text-[0.9375rem]">
          {c}
        </p>
      ))}
    </div>
  );
}

export function Integration() {
  return (
    <section className="bg-bg-alt">
      <div className="mx-auto max-w-[1200px] px-5 py-28 md:px-12 md:py-40">
        <p className="text-label text-ink-soft">{integration.section.label}</p>
        <h2 className="text-h2 mt-6 max-w-[16ch]">{integration.section.title}</h2>
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div data-reveal className="rounded-(--radius-l) border border-line bg-bg p-8 md:p-10">
            <h3 className="text-card-title">{integration.widget.title}</h3>
            <p className="mt-3 text-[0.9375rem] text-ink-soft">{integration.widget.lead}</p>
            <Checks items={integration.widget.checks} />
            <div className="mx-auto mt-8 max-w-[340px]">
              <MockupStage isStatic>
                <RampWidget />
              </MockupStage>
            </div>
          </div>
          <div data-reveal className="rounded-(--radius-l) border border-line bg-bg p-8 md:p-10">
            <h3 className="text-card-title">{integration.api.title}</h3>
            <p className="mt-3 text-[0.9375rem] text-ink-soft">{integration.api.lead}</p>
            <Checks items={integration.api.checks} />
            {/* Цвет v2: тёмное код-окно — grad-window-ink (зелёный лит-край вместо плоского #111) */}
            <div className="grad-window-ink mt-8 rounded-(--radius-xl) p-6 text-ink-invert">
              <CodeSnippet lines={integration.snippet} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
