import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'KBG',
  description: '카카오보드게임즈',
  icons: {
    icon: '/favicon.ico?v=10',
    apple: '/apple-touch-icon.png?v=10',
  },
  manifest: '/site.webmanifest?v=10',
  // ⚡ iOS 웹앱 하단 제어바 노출 설정 (capable: false)
  appleWebApp: {
    capable: false,
    title: 'KBG',
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta id="theme-color-meta" name="theme-color" content="#FEE500" />
        
        {/* ⚡ iOS Safari 제어바 강제 노출 메타 태그 */}
        <meta name="apple-mobile-web-app-capable" content="no" />
        
        <link rel="icon" href="/favicon.ico?v=10" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=10" />
        <link rel="manifest" href="/site.webmanifest?v=10" />

        <link rel="preload" href="/fonts/KakaoRegular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/KakaoBold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}