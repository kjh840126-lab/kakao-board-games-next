import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: '카카오 보드게임 대여',
  description: '카카오 보드게임 대여 서비스',
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
        {/* 사파리 웹킷 폰트 로드 차단 방지용 카카오 및 프리텐다드 폰트 직접 주입 */}
        <link rel="stylesheet" href="https://t1.daumcdn.net/kakao_game/kakao/font/font.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}