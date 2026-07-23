// 02: integration — развилка Widget vs White Label API.
// Сниппет — единственная тёмная контентная вставка состояния; моноширинный шрифт
// допустим только здесь (это код, не body-текст).
import { integration } from "@/content/platform";
import { MockupStage } from "@/components/mockups/MockupStage";
import { RampWidget } from "@/components/mockups/RampWidget";

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
      <div className="mx-auto max-w-[1200px] px-5 py-24 md:px-12 md:py-36">
        <p className="text-label text-ink-soft">{integration.section.label}</p>
        <h2 className="text-h2 mt-6 max-w-[16ch]">{integration.section.title}</h2>
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div data-reveal className="rounded-(--radius-l) bg-bg p-8 md:p-10">
            <h3 className="text-card-title">{integration.widget.title}</h3>
            <p className="mt-3 text-[0.9375rem] text-ink-soft">{integration.widget.lead}</p>
            <Checks items={integration.widget.checks} />
            <div className="mx-auto mt-8 max-w-[340px]">
              <MockupStage isStatic>
                <RampWidget />
              </MockupStage>
            </div>
          </div>
          <div data-reveal className="rounded-(--radius-l) bg-bg p-8 md:p-10">
            <h3 className="text-card-title">{integration.api.title}</h3>
            <p className="mt-3 text-[0.9375rem] text-ink-soft">{integration.api.lead}</p>
            <Checks items={integration.api.checks} />
            <div className="mt-8 rounded-(--radius-xl) bg-ink p-6 text-ink-invert">
              <pre className="overflow-x-auto font-mono text-[0.8125rem] leading-relaxed">
                {integration.snippet.map((line, i) => (
                  <span key={i} data-reveal className="block min-h-[1.2em]">
                    {line}
                  </span>
                ))}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
