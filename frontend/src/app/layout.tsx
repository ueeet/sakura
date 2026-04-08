import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

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
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
