import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans, Sora } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-sans",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-sora",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-bricolage",
});

export const metadata: Metadata = {
  title: "Criar conta | learnimo",
  description: "Capture e expanda seu conhecimento com o learnimo.",
  themeColor: "#0F1B2D",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${sora.variable} ${bricolage.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
