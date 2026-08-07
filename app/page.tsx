import type { Metadata } from "next";
import { Landing } from "@/components/landing/Landing";

const DESCRIPTION =
  "Crel builds and runs digital asset infrastructure: a Swiss consulting practice and a platform, sharing one rail.";

export const metadata: Metadata = {
  title: "Crel — one rail, two ways in",
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Crel — one rail, two ways in",
    description: DESCRIPTION,
    type: "website",
  },
};

export default function HomePage() {
  return <Landing initial="services" />;
}
