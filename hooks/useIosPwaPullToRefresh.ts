'use client';

import { useEffect } from 'react';

export const useIosPwaPullToRefresh = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = 
      (window.navigator as any).standalone === true || 
      window.matchMedia('(display-mode: standalone)').matches;

    // iOS PWA 모드일 때만 실행
    if (!isIos || !isStandalone) return;

    let startY = 0;
    let isPulling = false;

    const handleTouchStart = (e: TouchEvent) => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      // 화면 최상단(오차 1px 허용)일 때만 감지 시작
      if (scrollTop <= 1) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;

      const currentY = e.touches[0].clientY;
      const pullDistance = currentY - startY;
      
      // ⚡ 1. 아래로 당기는 중(pullDistance > 0)일 때만 개입
      if (pullDistance > 0) {
        // ⚡ 2. iOS 기본 고무줄 바운스 효과를 강제로 차단! (터치 이벤트를 JS가 독점)
        if (e.cancelable) {
          e.preventDefault();
        }
        
        // ⚡ 3. 80px 이상 당겨지면 즉시 새로고침
        if (pullDistance > 80) {
          isPulling = false;
          window.location.reload();
        }
      } else {
        // 위로 스크롤(페이지 아래로 이동)하는 경우 감지 해제하고 정상 스크롤 허용
        isPulling = false;
      }
    };

    const handleTouchEnd = () => {
      isPulling = false;
    };

    // ⚡ e.preventDefault()를 사용하기 위해 반드시 passive: false 옵션 적용
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);
};