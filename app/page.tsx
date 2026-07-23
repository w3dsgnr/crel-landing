// Дефолт корня: services (design-direction §3.5, рабочее решение).
// Static export не поддерживает серверный redirect — лёгкий клиентский + canonical.
export const metadata = {
  title: "Crel.",
  alternates: { canonical: "/services" },
};

export default function RootRedirect() {
  return (
    <>
      <meta httpEquiv="refresh" content="0;url=/services" />
      <script
        dangerouslySetInnerHTML={{ __html: 'window.location.replace("/services");' }}
      />
      <p className="p-8 text-label">
        <a href="/services">crel: services_</a>
      </p>
    </>
  );
}
