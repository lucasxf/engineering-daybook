import type { Metadata } from "next";
import { Sora, DM_Sans, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-sora",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: "learnimo — Ver Aprendizado",
  description: "Visualize e gerencie um aprendizado no learnimo, o diário pessoal de aprendizado.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${sora.variable} ${bricolage.variable} font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
