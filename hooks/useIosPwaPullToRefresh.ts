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

    // ⚡ iOS PWA 모드가 아니면 완전히 동작 안 함 (안드로이드/일반 브라우저 영향 0%)
    if (!isIos || !isStandalone) return;

    let startY = 0;
    let isPulling = false;

    const handleTouchStart = (e: TouchEvent) => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
      // 최상단 근처 스크롤일 때만 감지 시작
      if (scrollTop <= 5) {
        startY = e.touches[0].clientY;
        isPulling = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;

      const currentY = e.touches[0].clientY;
      const pullDistance = currentY - startY;
      const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

      // ⚡ 터치 이동 중 상단에서 아래로 100px 이상 당겨진 순간 즉시 새로고침 실행!
      if (pullDistance > 100 && scrollTop <= 5) {
        isPulling = false; // 중복 실행 방지
        window.location.reload();
      }
    };

    const handleTouchEnd = () => {
      isPulling = false;
    };

    // iOS 사파리 스크롤 이벤트를 위해 document 레벨 등록
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);
};