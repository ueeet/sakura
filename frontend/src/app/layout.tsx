import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Сакура — Крупнейшая сеть саун в Набережных Челнах",
  description: "Сакура — сеть саун и бань в Набережных Челнах. Русские бани, финские сауны, турецкие хамамы. 9-й и 50-й комплексы.",
  openGraph: {
    title: "Сакура — Сеть саун",
    description: "Крупнейшая сеть саун в Набережных Челнах",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
