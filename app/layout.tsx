import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: '카카오 보드게임 대여',
  description: '카카오 보드게임 대여 서비스',
};

// ⚡ UI 변경 없이 모바일 텍스트창 클릭 시 화면 줌인만 차단하는 설정
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
        {/* 웹폰트 미리 로드로 새로고침 시 폰트 풀림 현상 방지 */}
        <link rel="preload" href="/fonts/KakaoRegular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/KakaoBold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}