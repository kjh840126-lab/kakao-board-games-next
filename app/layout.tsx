import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: '카카오 보드게임 대여',
  description: '카카오 보드게임 대여 서비스',
  // ⚡ ?v=2 캐시 우회 파라미터 추가
  icons: {
    icon: '/favicon.ico?v=2',               // PC/모바일 브라우저 탭 파비콘
    apple: '/apple-touch-icon.png?v=2',    // 아이폰 & 안드로이드 겸용 홈 화면 아이콘
  },
  manifest: '/site.webmanifest?v=2',        // 안드로이드 웹앱 설정
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
        
        {/* ⚡ 캐시 무력화를 위한 ?v=2 파라미터 적용 */}
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
        <link rel="manifest" href="/site.webmanifest?v=2" />

        <link rel="preload" href="/fonts/KakaoRegular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/KakaoBold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}