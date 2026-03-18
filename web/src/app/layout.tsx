import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, DM_Sans, Sora } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { GoogleOAuthWrapper } from '@/components/providers/GoogleOAuthWrapper';

const bricolageGrotesque = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin'],
  weight: ['400', '700'],
});

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500'],
});

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  weight: ['600'],
});

export const metadata: Metadata = {
  title: {
    default: 'learnimo',
    template: '%s | learnimo',
  },
  description: 'Personal learning journal where you capture, organize, and recall what you learn',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning className={`${bricolageGrotesque.variable} ${dmSans.variable} ${sora.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <GoogleOAuthWrapper>
            <AuthProvider>{children}</AuthProvider>
          </GoogleOAuthWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
