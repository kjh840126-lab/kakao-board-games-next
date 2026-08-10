'use client';

import { useEffect } from 'react';

export const useIosPwaPullToRefresh = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. iOS 기기 여부 확인
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    // 2. 홈 화면에 추가된 스탠드얼론(PWA) 모드인지 확인
    const isStandalone = 
      (window.navigator as any).standalone === true || 
      window.matchMedia('(display-mode: standalone)').matches;

    // ⚡ iOS이면서 홈 화면 추가(PWA) 모드일 때만 이벤트 동작! (안드로이드/일반 브라우저 영향 0)
    if (!isIos || !isStandalone) return;

    let startY = 0;
    let isPulling = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isPulling) return;

      const endY = e.changedTouches[0].clientY;
      const pullDistance = endY - startY;

      // 상단에서 아래로 130px 이상 세게 당겼을 때 새로고침 실행
      if (pullDistance > 130 && window.scrollY === 0) {
        window.location.reload();
      }

      isPulling = false;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);
};