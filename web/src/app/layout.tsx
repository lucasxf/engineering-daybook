import type { Metadata } from 'next';
import { DM_Sans, Sora, Bricolage_Grotesque } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { GoogleOAuthWrapper } from '@/components/providers/GoogleOAuthWrapper';

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const sora = Sora({ 
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const bricolage = Bricolage_Grotesque({ 
  subsets: ['latin'],
  variable: '--font-wordmark',
  display: 'swap',
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
