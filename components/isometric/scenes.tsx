// Семь сцен услуг/платформы (спека §5, §7): одна метафора на сцену,
// грейскейл-база + 1–2 синих момента, зелёный — только статус.
// Задержки delay каскадируют сборку снизу-вверх (база → детали).
import { IsoBox, IsoScene, iso, FACES_GRAY, FACES_WHITE, FACES_ACCENT, FACES_OK, FACES_INK } from "./Iso";

/* Platform implementation: слои-плиты собираются в стек на базовой сетке */
export function IsoImplementation() {
  return (
    <IsoScene>
      <IsoBox x={-70} y={-70} w={140} d={140} h={10} faces={FACES_GRAY} delay={0} />
      <IsoBox x={-52} y={-52} z={26} w={104} d={104} h={10} faces={FACES_WHITE} delay={120} />
      <IsoBox x={-34} y={-34} z={52} w={68} d={68} h={10} faces={FACES_WHITE} delay={240} />
      <IsoBox x={-16} y={-16} z={78} w={32} d={32} h={10} faces={FACES_ACCENT} delay={360} />
    </IsoScene>
  );
}

/* Architecture consulting: чертёжная плоскость, блоки-узлы соединены рельсами */
export function IsoArchitecture() {
  const [ax, ay] = iso(-40, -40, 22);
  const [bx, by] = iso(44, -10, 22);
  const [cx2, cy2] = iso(-8, 44, 22);
  return (
    <IsoScene>
      <IsoBox x={-80} y={-80} w={160} d={160} h={6} faces={FACES_GRAY} delay={0} />
      {/* рельсы-связи по плоскости чертежа */}
      <g className="iso-part" style={{ transitionDelay: "140ms" }}>
        <path
          d={`M ${ax} ${ay} L ${bx} ${by} M ${bx} ${by} L ${cx2} ${cy2} M ${cx2} ${cy2} L ${ax} ${ay}`}
          stroke="#2e7cf6"
          strokeWidth="2"
          strokeDasharray="6 5"
          fill="none"
        />
      </g>
      <IsoBox x={-56} y={-56} z={6} w={32} d={32} h={16} faces={FACES_WHITE} delay={240} />
      <IsoBox x={28} y={-26} z={6} w={32} d={32} h={16} faces={FACES_WHITE} delay={320} />
      <IsoBox x={-24} y={28} z={6} w={32} d={32} h={16} faces={FACES_ACCENT} delay={400} />
    </IsoScene>
  );
}

/* Licensing and compliance: документ-плита проходит ворота, штамп-галочка */
export function IsoLicensing() {
  const [gx, gy] = iso(30, 6, 78);
  return (
    <IsoScene>
      <IsoBox x={-80} y={-40} w={160} d={80} h={8} faces={FACES_GRAY} delay={0} />
      {/* ворота: две стойки + перекладина */}
      <IsoBox x={-16} y={-38} z={8} w={12} d={12} h={64} faces={FACES_INK} delay={140} />
      <IsoBox x={-16} y={26} z={8} w={12} d={12} h={64} faces={FACES_INK} delay={200} />
      <IsoBox x={-16} y={-38} z={72} w={12} d={76} h={10} faces={FACES_INK} delay={280} />
      {/* документ-плита на пути через ворота */}
      <IsoBox x={-64} y={-16} z={8} w={44} d={32} h={6} faces={FACES_WHITE} delay={360} />
      <IsoBox x={16} y={-16} z={8} w={44} d={32} h={6} faces={FACES_WHITE} delay={440} />
      {/* штамп-галочка над прошедшим документом */}
      <g className="iso-part" style={{ transitionDelay: "520ms" }}>
        <circle cx={gx} cy={gy - 40} r="13" fill="#34c759" />
        <path
          d={`M ${gx - 6} ${gy - 40} l 4 5 l 8 -9`}
          stroke="#ffffff"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </IsoScene>
  );
}

/* Vendor selection: ряд блоков-кандидатов, выбранный приподнят и синий */
export function IsoVendors() {
  return (
    <IsoScene>
      <IsoBox x={-84} y={-42} w={168} d={84} h={8} faces={FACES_GRAY} delay={0} />
      <IsoBox x={-66} y={-20} z={8} w={30} d={30} h={22} faces={FACES_WHITE} delay={140} />
      <IsoBox x={-22} y={-20} z={8} w={30} d={30} h={22} faces={FACES_WHITE} delay={220} />
      <IsoBox x={22} y={-20} z={26} w={30} d={30} h={30} faces={FACES_ACCENT} delay={300} />
      <IsoBox x={66} y={-20} z={8} w={30} d={30} h={22} faces={FACES_WHITE} delay={380} />
    </IsoScene>
  );
}

/* Mobile apps: плита-смартфон, над ней парят виджет-плитки */
export function IsoMobile() {
  return (
    <IsoScene>
      <IsoBox x={-40} y={-64} w={80} d={128} h={10} faces={FACES_INK} delay={0} />
      <IsoBox x={-32} y={-56} z={10} w={64} d={112} h={3} faces={FACES_WHITE} delay={140} />
      <IsoBox x={-24} y={-40} z={40} w={30} d={30} h={8} faces={FACES_ACCENT} delay={280} />
      <IsoBox x={-2} y={2} z={56} w={26} d={26} h={8} faces={FACES_WHITE} delay={380} />
      <IsoBox x={-30} y={16} z={72} w={20} d={20} h={8} faces={FACES_WHITE} delay={460} />
    </IsoScene>
  );
}

/* Ongoing support: конвейер-лента со статус-шайбами, одна зелёная «ок» */
export function IsoSupport() {
  return (
    <IsoScene>
      <IsoBox x={-90} y={-24} w={180} d={48} h={12} faces={FACES_GRAY} delay={0} />
      <IsoBox x={-88} y={-22} z={12} w={176} d={44} h={3} faces={FACES_INK} delay={120} />
      <IsoBox x={-64} y={-12} z={15} w={26} d={26} h={10} faces={FACES_WHITE} delay={240} />
      <IsoBox x={-12} y={-12} z={15} w={26} d={26} h={10} faces={FACES_OK} delay={320} />
      <IsoBox x={40} y={-12} z={15} w={26} d={26} h={10} faces={FACES_WHITE} delay={400} />
    </IsoScene>
  );
}

/* Widget / White Label API (Capabilities): виджет-плита встраивается в чужую панель */
export function IsoWidgetEmbed() {
  return (
    <IsoScene>
      {/* чужая панель-хост с вырезом: рама из четырёх плит */}
      <IsoBox x={-80} y={-60} w={160} d={34} h={8} faces={FACES_WHITE} delay={0} />
      <IsoBox x={-80} y={26} w={160} d={34} h={8} faces={FACES_WHITE} delay={80} />
      <IsoBox x={-80} y={-26} w={44} d={52} h={8} faces={FACES_WHITE} delay={160} />
      <IsoBox x={36} y={-26} w={44} d={52} h={8} faces={FACES_WHITE} delay={240} />
      {/* виджет-плита опускается в вырез */}
      <IsoBox x={-30} y={-22} z={26} w={60} d={44} h={10} faces={FACES_ACCENT} delay={380} />
    </IsoScene>
  );
}
