import type { Metadata } from "next";
import { Landing } from "@/components/landing/Landing";
import { meta } from "@/content/meta";

export const metadata: Metadata = {
  title: meta.platform.title,
  description: meta.platform.description,
};

export default function PlatformPage() {
  return <Landing initial="platform" />;
}
