import type { Metadata } from 'next';
import { DM_Sans, Sora, Bricolage_Grotesque } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { GoogleOAuthWrapper } from '@/components/providers/GoogleOAuthWrapper';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-sans',
});

const sora = Sora({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-sora',
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-bricolage',
});

export const metadata: Metadata = {
  title: 'learnimo',
  description: 'Capture, organize, and recall your daily learnings',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${sora.variable} ${bricolage.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <GoogleOAuthWrapper>
            <AuthProvider>{children}</AuthProvider>
          </GoogleOAuthWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
