// Рендерит плоский реестр секций объединённой страницы.
import { sections } from "@/config/sections";

export function SectionRenderer() {
  return (
    <>
      {sections.map(({ id, Component }) => (
        <div key={id} id={id}>
          <Component />
        </div>
      ))}
    </>
  );
}
