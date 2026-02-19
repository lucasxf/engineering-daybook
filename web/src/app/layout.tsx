import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { GoogleOAuthWrapper } from '@/components/providers/GoogleOAuthWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Engineering Daybook',
  description: 'Capture, organize, and recall your daily learnings',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <GoogleOAuthWrapper>
            <AuthProvider>{children}</AuthProvider>
          </GoogleOAuthWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
