// src/app/layout.tsx 하단이나 적절한 위치에 추가
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}