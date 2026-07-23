import type { Metadata } from "next";
import { Landing } from "@/components/landing/Landing";
import { meta } from "@/content/meta";

export const metadata: Metadata = {
  title: meta.services.title,
  description: meta.services.description,
};

export default function ServicesPage() {
  return <Landing initial="services" />;
}
