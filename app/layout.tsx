import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

// Variable-шрифт: плавное перетекание веса в тумблере (400↔500) без подмены глифов
const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  display: "swap",
});

// Моноширинный — только данные и статусы внутри мини-интерфейсов и код-блока.
// В вёрстке страницы не появляется: гротеск остаётся единственным текстовым шрифтом.
const mono = JetBrains_Mono({
  variable: "--font-mono-data",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Crel.",
  description:
    "Crel builds and runs digital asset infrastructure: a Swiss consulting practice and a platform, sharing one rail.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${grotesk.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
