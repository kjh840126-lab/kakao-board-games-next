'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useIosPwaPullToRefresh } from '../hooks/useIosPwaPullToRefresh';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function Providers({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // ⚡ iOS 사파리 홈 화면 추가(PWA) 모드에서만 안전하게 동작하는 당겨서 새로고침
  // useIosPwaPullToRefresh();

  useEffect(() => {
    setMounted(true);
    const savedTheme = (localStorage.getItem('kakao_bg_theme') as Theme) || 'light';
    setThemeState(savedTheme);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('kakao_bg_theme', newTheme);
    if (typeof document !== 'undefined') {
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme: theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'light' as Theme,
      setTheme: () => {},
      resolvedTheme: 'light' as Theme,
    };
  }
  return context;
};