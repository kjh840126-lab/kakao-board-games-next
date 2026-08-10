import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: '카카오 보드게임 대여',
  description: '카카오 보드게임 대여 서비스',
  icons: {
    icon: '/favicon-kbg.ico',           // ⚡ 바꾼 파일 이름으로 지정
    apple: '/apple-touch-icon.png?v=3',
  },
  manifest: '/site.webmanifest?v=3',
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
        
        {/* ⚡ 변경된 신규 파일명으로 헤더 연결 */}
        <link rel="icon" href="/favicon-kbg.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=3" />
        <link rel="manifest" href="/site.webmanifest?v=3" />

        <link rel="preload" href="/fonts/KakaoRegular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/KakaoBold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}