'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { UserData, Game, Rental, Notice, ReportData, BoardSite, UserRating, Role, GameStatus } from './types';
import { FixedHeader, FixedBottomNav } from './components/HeaderNav';

import { GamesTab } from './components/tabs/GamesTab';
import { ReturnsTab } from './components/tabs/ReturnsTab';
import { RankingTab } from './components/tabs/RankingTab';
import { SitesTab } from './components/tabs/SitesTab';
import { AdminTab } from './components/tabs/AdminTab';
import { AuthScreen } from './components/AuthScreen';
import { ModalsContainer } from './components/ModalsContainer';

import { ShoppingCart, Star } from 'lucide-react';

const ALLOWED_EMAIL_DOMAINS = ['kakaocorp.com', 'kakaoenterprise.com', 'kakaomobility.com', 'kakaopaycorp.com', 'kakaoent.com'];
const LOGIN_LOGO_URL = '/logo.png';
const currentYear = new Date().getFullYear();

const AVAILABLE_GENRES = ['가족게임', '머더미스터리', '전략게임', '추리/마피아', '테마/모험', '파티게임', '협력게임'];

const checkIsIosDevice = () => {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
};

const getTodayKST = () => {
  const formatter = new Intl.DateTimeFormat('en-CA', { 
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(new Date());
};

const getKSTIsoString = () => {
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstDate = new Date(now.getTime() + kstOffset);
  return kstDate.toISOString().replace('Z', '+09:00');
};

const toPureDateStr = (dateStr: string | null | undefined) => {
  if (!dateStr) return '';
  return String(dateStr).split('T')[0].split(' ')[0].substring(0, 10);
};

const getDaysDifference = (dateStr1: string, dateStr2: string) => {
  const clean1 = toPureDateStr(dateStr1);
  const clean2 = toPureDateStr(dateStr2);
  if (!clean1 || !clean2) return 0;

  const [y1, m1, d1] = clean1.split('-').map(Number);
  const [y2, m2, d2] = clean2.split('-').map(Number);
  
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  
  return Math.round((utc1 - utc2) / (1000 * 60 * 60 * 24));
};

const calcPenaltyEndDate = (baseDateStr: string, addDays: number) => {
  const cleanBase = toPureDateStr(baseDateStr) || getTodayKST();
  const [y, m, d] = cleanBase.split('-').map(Number);
  
  const targetUtcMs = Date.UTC(y, m - 1, d) + (addDays * 1000 * 60 * 60 * 24);
  const targetDate = new Date(targetUtcMs);
  
  const year = targetDate.getUTCFullYear();
  const month = String(targetDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getUTCDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

const StarRating = ({ rating = 0, size = 12, colorClass = "text-rose-500" }: { rating?: number; size?: number; colorClass?: string }) => {
  const safeRating = Number(rating) || 0;
  return (
    <div className="flex items-center gap-0.5 inline-flex">
      {[1, 2, 3, 4, 5].map((starIndex: number) => {
        const fillAmount = Math.max(0, Math.min(1, safeRating - (starIndex - 1)));
        return (
          <div key={starIndex} className="relative inline-block">
            <Star size={size} className="text-slate-300" />
            {fillAmount > 0 && (
              <div className="absolute top-0 left-0 overflow-hidden" style={{ width: `${fillAmount * 100}%` }}>
                <Star size={size} className={`${colorClass} fill-current`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default function MainPage() {
  const [mounted, setMounted] = useState(false);
  const [isInitialLoaded, setIsInitialLoaded] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [notices, setNoticeList] = useState<Notice[]>([]);
  const [reports, setReportList] = useState<ReportData[]>([]);
  const [sites, setSiteList] = useState<BoardSite[]>([]);
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [allRatings, setAllRatings] = useState<UserRating[]>([]);
  const [ratingModalGame, setRatingModalGame] = useState<Game | null>(null);
  const [selectedScore, setSelectedScore] = useState<number>(5.0);
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false);
  const [isMyRatingsModalOpen, setIsMyRatingsModalOpen] = useState(false);

  const [fontSize, setFontSize] = useState<'normal' | 'large'>(() => {
    if (typeof window !== 'undefined') {
      const savedFont = localStorage.getItem('kakao_bg_fontSize');
      if (savedFont === 'large' || savedFont === 'normal') return savedFont;
    }
    return 'normal';
  });

  const handleSetFontSize = useCallback((size: 'normal' | 'large') => {
    setFontSize(size);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kakao_bg_fontSize', size);
    }
  }, []);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('kakao_bg_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
    }
    return 'light';
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdminReportDrawerOpen, setIsAdminReportDrawerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [changePassword, setNewPasswordInput] = useState('');
  const [changePasswordConfirm, setNewPasswordConfirmInput] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [noticeIndex, setNoticeIndex] = useState(0);
  const [isNoticeTransition, setIsNoticeTransition] = useState(true);
  const [isNoticeDrawerOpen, setIsNoticeDrawerOpen] = useState(false);
  const [expandedNoticeId, setExpandedNoticeId] = useState<number | null>(null);

  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signUpForm, setSignUpForm] = useState({
    userId: '',
    name: '',
    email: '',
    emailPrefix: '',
    emailDomain: 'kakaocorp.com',
    password: '',
    passwordConfirm: '',
  });
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const [cart, setCart] = useState<Game[]>([]);
  const [rentalDays, setRentalDays] = useState<number>(7);

  const [activeTab, setActiveTab] = useState<'games' | 'returns' | 'ranking' | 'sites' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('kakao_bg_activeTab');
      if (savedTab && ['games', 'returns', 'ranking', 'sites', 'admin'].includes(savedTab)) return savedTab as any;
    }
    return 'games';
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<{ id?: number; title: string; content: string; imageUrl?: string; isVisible?: string }>({ title: '', content: '', imageUrl: '', isVisible: 'Y' });
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<BoardSite>({ siteId: 0, name: '', url: '', bannerUrl: '', description: '', isVisible: 'Y' });
  const [reportForm, setReportForm] = useState({ title: '', content: '', category: '' });

  const [isIosDevice, setIsIosDevice] = useState(false);
  const scrollPositions = useRef<{ [key: string]: number }>({ games: 0, returns: 0, ranking: 0, sites: 0, admin: 0 });

  useEffect(() => {
    setMounted(true);
    setIsIosDevice(checkIsIosDevice());

    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('kakao_boardgame_user'); if (savedUser) setCurrentUser(JSON.parse(savedUser));
        const savedFont = localStorage.getItem('kakao_bg_fontSize'); 
        if (savedFont === 'large') {
          setFontSize('large');
          document.documentElement.classList.add('text-large');
        } else {
          setFontSize('normal');
          document.documentElement.classList.remove('text-large');
        }
      } catch (e) {}
    }
  }, []);

  const isHeaderAdminTheme = activeTab === 'admin';
  const isLargeFont = fontSize === 'large';
  const headerRef = useRef<HTMLElement | null>(null); 
  const mainScrollRef = useRef<HTMLDivElement | null>(null);
  
  const today = getTodayKST();

  useEffect(() => {
    if (typeof document !== 'undefined' && mounted) {
      const root = document.documentElement;
      const metaTheme = document.getElementById('theme-color-meta');

      if (theme === 'dark') {
        root.classList.add('dark');
        root.style.setProperty('--bg-main', '#0f172a');
        document.body.style.backgroundColor = '#0f172a';
      } else {
        root.classList.remove('dark');
        root.style.setProperty('--bg-main', '#ffffff');
        document.body.style.backgroundColor = '#ffffff';
      }

      root.style.setProperty('--bg-header', isHeaderAdminTheme ? '#38bdf8' : '#FEE500');
      if (metaTheme) metaTheme.setAttribute('content', isHeaderAdminTheme ? '#38bdf8' : '#FEE500');
      
      if (isLargeFont) root.classList.add('text-large');
      else root.classList.remove('text-large');

      localStorage.setItem('kakao_bg_theme', theme);
      localStorage.setItem('kakao_bg_fontSize', fontSize);
    }
  }, [theme, isHeaderAdminTheme, isLargeFont, fontSize, mounted]);

  useEffect(() => { if (mounted) fetchInitialData(); }, [mounted]);

  // ⚡ 반납 탭 포함 모든 탭 변경 시 스크롤 최상단 이동 완벽 제어
  const handleTabChange = useCallback((newTab: 'games' | 'returns' | 'ranking' | 'sites' | 'admin') => {
    if (newTab === activeTab) return;

    if (activeTab === 'games') {
      scrollPositions.current['games'] = window.scrollY;
    }

    setActiveTab(newTab);
    if (typeof window !== 'undefined') localStorage.setItem('kakao_bg_activeTab', newTab);

    // DOM 렌더링 후 스크롤을 최상단으로 강제 초기화
    setTimeout(() => {
      if (newTab === 'games') {
        window.scrollTo({
          top: scrollPositions.current['games'] || 0,
          behavior: 'instant' as ScrollBehavior
        });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
        if (mainScrollRef.current) mainScrollRef.current.scrollTop = 0;
        if (document.documentElement) document.documentElement.scrollTop = 0;
        if (document.body) document.body.scrollTop = 0;
      }
    }, 10);
  }, [activeTab]);

  useEffect(() => {
    if (mounted && activeTab !== 'games') {
      const scrollTimer = setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
        if (mainScrollRef.current) mainScrollRef.current.scrollTop = 0;
        if (document.documentElement) document.documentElement.scrollTop = 0;
        if (document.body) document.body.scrollTop = 0;
      }, 30);
      return () => clearTimeout(scrollTimer);
    }
  }, [mounted, activeTab]);

  const visibleNoticesList = useMemo(() => 
    (notices || []).filter((n: any) => n.isVisible !== 'N'), 
    [notices]
  );

  const recentNoticesList = useMemo(() => 
    visibleNoticesList.slice(0, 5), 
    [visibleNoticesList]
  );

  useEffect(() => {
    if (recentNoticesList.length <= 1) return;
    const interval = setInterval(() => { setIsNoticeTransition(true); setNoticeIndex((prev) => prev + 1); }, 4000);
    return () => clearInterval(interval);
  }, [recentNoticesList.length]);

  useEffect(() => {
    if (recentNoticesList.length <= 1) return;
    if (noticeIndex === recentNoticesList.length) {
      const timer = setTimeout(() => { setIsNoticeTransition(false); setNoticeIndex(0); }, 500);
      return () => clearTimeout(timer);
    }
  }, [noticeIndex, recentNoticesList.length]);

  const fetchInitialData = async () => {
    try {
      const [{ data: usersData }, { data: rentalsData }, { data: ratingsData }, { data: gamesData }, { data: noticeData }, { data: reportsData }, { data: sitesData }] = await Promise.all([
        supabase.from('users').select('user_id, name, email, role, penalty_count, penalty_end_date, created_at, last_login_at'),
        supabase.from('rentals').select('*'),
        supabase.from('ratings').select('*'),
        supabase.from('games').select('*'),
        supabase.from('notices').select('*').order('created_at', { ascending: false }),
        supabase.from('reports').select('*').order('created_at', { ascending: false }),
        supabase.from('sites').select('*').order('display_order', { ascending: true }).order('site_id', { ascending: true })
      ]);

      if (currentUser) {
        const { data: favoritesData } = await supabase.from('favorites').select('game_id').eq('user_id', currentUser.userId);
        if (favoritesData) {
          setUserFavorites(favoritesData.map(f => f.game_id));
        }
      }

      if (usersData) {
        const mappedUsers: UserData[] = usersData.map(u => ({
          userId: u.user_id, 
          name: u.name, 
          email: u.email, 
          role: u.role as Role, 
          passwordHash: '', 
          penaltyPoints: Number(u.penalty_count || 0), 
          penaltyEndDate: toPureDateStr(u.penalty_end_date) || null, 
          createdAt: toPureDateStr(u.created_at) || today, 
          lastLoginAt: u.last_login_at || '기록없음'
        }));
        setUsers(mappedUsers);
        if (currentUser) {
          const latestSelf = mappedUsers.find(u => u.userId === currentUser.userId);
          if (latestSelf) { setCurrentUser(latestSelf); localStorage.setItem('kakao_boardgame_user', JSON.stringify(latestSelf)); }
        }
      }

      if (rentalsData) {
        setRentals(rentalsData.map(r => ({ 
          rentalId: r.rental_id, 
          userId: r.user_id, 
          gameId: r.game_id, 
          gameTitle: r.game_title, 
          status: r.status, 
          startDate: toPureDateStr(r.start_date), 
          endDate: toPureDateStr(r.end_date), 
          returnedAt: r.returned_at 
        })));
      }

      if (ratingsData) setAllRatings(ratingsData.map(r => ({ userId: r.user_id, gameId: r.game_id, score: Number(r.score) })));
      
      if (gamesData) {
        const mappedGames = gamesData.map(g => ({
          gameId: g.game_id, title: g.title, status: g.status, minPlayers: g.min_players, maxPlayers: g.max_players, playTime: Number(g.play_time) || 30, difficulty: Number(g.difficulty) || 2.0, imageUrl: g.image_url || 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=300', description: g.description || '', isVisible: g.is_visible || g.isVisible || 'Y', genres: Array.isArray(g.genres) ? g.genres : typeof g.genres === 'string' ? g.genres.split(',').map((s: string) => s.trim()) : ['보드게임'], createdAt: g.created_at || new Date().toISOString(), releaseYear: Number(g.release_year) || currentYear, bggRating: Number(g.bgg_rating) || 7.0
        }));

        const shuffled = [...mappedGames];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setGames(shuffled);
      }

      if (noticeData) {
        setNoticeList(noticeData.map(n => ({ 
          noticeId: n.notice_id, 
          title: n.title, 
          content: n.content, 
          imageUrl: n.image_url || n.imageUrl || '',
          isVisible: n.is_visible || 'Y', 
          createdAt: toPureDateStr(n.created_at) || today 
        })));
      }

      if (reportsData) setReportList(reportsData.map(r => ({ reportId: r.report_id || r.id, userId: r.user_id, category: r.category || '신고/건의', title: r.title, content: r.content, createdAt: r.created_at?.replace('T', ' ').substring(0, 16) || today, isRead: !!r.is_read, status: r.status })));
      
      if (sitesData) {
        setSiteList(sitesData.map(s => ({ 
          siteId: s.site_id, 
          name: s.name, 
          url: s.url, 
          bannerUrl: s.banner_url || '', 
          description: s.description || '', 
          isVisible: s.is_visible || 'Y',
          displayOrder: s.display_order ?? s.site_id
        })));
      }
    } catch (e) {
    } finally {
      setIsInitialLoaded(true);
    }
  };

  const toggleFavorite = useCallback(async (gameId: string) => {
    if (!currentUser) return;
    const isFav = userFavorites.includes(gameId);
    setUserFavorites(prev => isFav ? prev.filter(id => id !== gameId) : [...prev, gameId]);
    if (isFav) await supabase.from('favorites').delete().eq('user_id', currentUser.userId).eq('game_id', gameId);
    else await supabase.from('favorites').insert([{ user_id: currentUser.userId, game_id: gameId }]);
  }, [currentUser, userFavorites]);

  const toggleCartItem = useCallback((game: Game) => {
    const isAlreadyInCart = cart.some(item => item.gameId === game.gameId);
    if (isAlreadyInCart) {
      setCart(prev => prev.filter(item => item.gameId !== game.gameId));
    } else {
      if (cart.length >= 3) { alert('장바구니에는 최대 3개까지만 담을 수 있습니다.'); return; }
      setCart(prev => [...prev, game]);
    }
  }, [cart]);

  const removeFromCart = (gameId: string) => setCart(cart.filter((item: Game) => item.gameId !== gameId));

  const processCheckout = async () => {
    if (!currentUser) return;

    const penaltyPoints = Number(currentUser.penaltyPoints || 0);
    if (penaltyPoints >= 1) {
      const endDateText = currentUser.penaltyEndDate ? currentUser.penaltyEndDate : '패널티 해제일';
      alert(`패널티로 ${endDateText}까지 보드게임을 대여할 수 없습니다.`);
      return;
    }

    const activeRentalsCount = rentals.filter((r: Rental) => {
      const activeStatuses: string[] = ['대여중', '대여신청', '승인대기'];
      return r.userId === currentUser.userId && activeStatuses.includes(r.status);
    }).length;

    if (activeRentalsCount + cart.length > 3) {
      alert(`1인당 최대 3개까지만 대여가 가능합니다.\n현재 대여 중: ${activeRentalsCount}개 / 장바구니: ${cart.length}개`);
      return;
    }

    const endDate = new Date(); 
    endDate.setDate(endDate.getDate() + rentalDays); 
    const endDateStr = endDate.toISOString().split('T')[0];
    const cartGameIds = cart.map((g: Game) => g.gameId);
    
    const newRentalsToInsert = cart.map((game: Game) => ({ 
      user_id: currentUser.userId, game_id: game.gameId, game_title: game.title, status: '대여중', start_date: today, end_date: endDateStr 
    }));

    try {
      const { data: insertedData, error: rentalError } = await supabase.from('rentals').insert(newRentalsToInsert).select();
      if (rentalError) throw rentalError;

      const { error: gameError } = await supabase.from('games').update({ status: '대여중' }).in('game_id', cartGameIds);
      if (gameError) throw gameError;

      setGames(prevGames => 
        prevGames.map(game => 
          cartGameIds.includes(game.gameId) ? { ...game, status: '대여중' as GameStatus } : game
        )
      );

      if (insertedData) {
        const mappedNewRentals: Rental[] = insertedData.map(r => ({
          rentalId: r.rental_id, userId: r.user_id, gameId: r.game_id, gameTitle: r.game_title, status: r.status, startDate: toPureDateStr(r.start_date), endDate: toPureDateStr(r.end_date), returnedAt: r.returned_at
        }));
        setRentals(prevRentals => [...mappedNewRentals, ...prevRentals]);
      }

      alert(`보드게임 ${cart.length}건이 ${rentalDays}일간 대여되었습니다.`); 
      setCart([]); 
      setIsCartOpen(false);
    } catch (err: any) {
      alert('대여 처리 중 오류가 발생했습니다: ' + (err.message || err));
    }
  };

  const returnGame = async (rentalId: number, gameId: string) => {
    if (!currentUser) return;
    const nowIso = getKSTIsoString();

    const targetRental = rentals.find((r) => r.rentalId === rentalId);
    if (!targetRental) return;

    const cleanEndDate = toPureDateStr(targetRental.endDate);
    const isOverdue = today > cleanEndDate;
    const overdueDays = isOverdue ? getDaysDifference(today, cleanEndDate) : 0;

    try {
      const { error: rentalErr } = await supabase.from('rentals').update({ status: '반납완료', returned_at: nowIso }).eq('rental_id', rentalId);
      if (rentalErr) throw rentalErr;

      const { error: gameErr } = await supabase.from('games').update({ status: '대여가능' }).eq('game_id', gameId);
      if (gameErr) throw gameErr;

      if (isOverdue && overdueDays > 0) {
        const cleanPenaltyEndDate = toPureDateStr(currentUser.penaltyEndDate);
        const hasFuturePenalty = cleanPenaltyEndDate && cleanPenaltyEndDate >= today;
        const baseDateStr = hasFuturePenalty ? cleanPenaltyEndDate : today;

        const addDays = hasFuturePenalty ? overdueDays : (overdueDays - 1);
        const penaltyEndDateStr = calcPenaltyEndDate(baseDateStr, addDays);
        const newPenaltyPoints = (currentUser.penaltyPoints || 0) + overdueDays;

        await supabase
          .from('users')
          .update({
            penalty_count: newPenaltyPoints,
            penalty_end_date: penaltyEndDateStr,
          })
          .eq('user_id', currentUser.userId);

        alert(`반납이 완료되었습니다.\n${overdueDays}일 연체로 인해 ${penaltyEndDateStr}까지 대여정지가 적용됩니다.`);
      } else {
        alert('반납이 완료되었습니다.');
      }

      const existingRating = allRatings.find(r => r.userId === currentUser.userId && r.gameId === gameId);
      const targetGameObj = games.find(g => g.gameId === gameId);

      if (!existingRating && targetGameObj) {
        setTimeout(() => {
          setSelectedScore(5.0);
          setRatingModalGame(targetGameObj);
        }, 100);
      }

      fetchInitialData();
    } catch (err: any) {
      alert('반납 처리 실패: ' + (err.message || err));
    }
  };

  const returnAllGames = async () => {
    if (!currentUser) return;
    const userActiveRentals = rentals.filter((r: Rental) => r.userId === currentUser?.userId && r.status === '대여중');
    if (userActiveRentals.length === 0) return;
    
    const activeRentalIds = userActiveRentals.map(r => r.rentalId);
    const activeGameIds = userActiveRentals.map(r => r.gameId);
    const nowIso = getKSTIsoString();

    let totalOverdueDays = 0;

    userActiveRentals.forEach((r) => {
      const cleanEndDate = toPureDateStr(r.endDate);
      if (today > cleanEndDate) {
        const days = getDaysDifference(today, cleanEndDate);
        if (days > 0) {
          totalOverdueDays += days;
        }
      }
    });

    try {
      const { error: rentalErr } = await supabase.from('rentals').update({ status: '반납완료', returned_at: nowIso }).in('rental_id', activeRentalIds);
      if (rentalErr) throw rentalErr;

      const { error: gameErr } = await supabase.from('games').update({ status: '대여가능' }).in('game_id', activeGameIds);
      if (gameErr) throw gameErr;

      if (totalOverdueDays > 0) {
        const cleanPenaltyEndDate = toPureDateStr(currentUser.penaltyEndDate);
        const hasFuturePenalty = cleanPenaltyEndDate && cleanPenaltyEndDate >= today;
        const baseDateStr = hasFuturePenalty ? cleanPenaltyEndDate : today;

        const addDays = hasFuturePenalty ? totalOverdueDays : (totalOverdueDays - 1);
        const penaltyEndDateStr = calcPenaltyEndDate(baseDateStr, addDays);
        const newPenaltyPoints = (currentUser.penaltyPoints || 0) + totalOverdueDays;

        await supabase
          .from('users')
          .update({
            penalty_count: newPenaltyPoints,
            penalty_end_date: penaltyEndDateStr,
          })
          .eq('user_id', currentUser.userId);

        alert(`모든 보드게임이 반납되었습니다.\n연체건(총 ${totalOverdueDays}일)으로 인해 ${penaltyEndDateStr}까지 대여정지가 적용됩니다.`);
      } else {
        alert('모든 보드게임이 반납되었습니다.');
      }

      const unratedGames = games.filter(g => 
        activeGameIds.includes(g.gameId) && 
        !allRatings.some(r => r.userId === currentUser.userId && r.gameId === g.gameId)
      );

      if (unratedGames.length > 0) {
        const randomIndex = Math.floor(Math.random() * unratedGames.length);
        const selectedRandomGame = unratedGames[randomIndex];

        setTimeout(() => {
          setSelectedScore(5.0);
          setRatingModalGame(selectedRandomGame);
        }, 100);
      }

      fetchInitialData();
    } catch (err: any) {
      alert('일괄 반납 처리 실패: ' + (err.message || err));
    }
  };

  const handleSaveRating = async () => {
    if (!currentUser || !ratingModalGame) return;
    const gameId = ratingModalGame.gameId;

    try {
      const existing = allRatings.find(r => r.userId === currentUser.userId && r.gameId === gameId);
      if (existing) {
        await supabase.from('ratings').update({ score: selectedScore, updated_at: getKSTIsoString() }).eq('user_id', currentUser.userId).eq('game_id', gameId);
      } else {
        await supabase.from('ratings').insert([{ user_id: currentUser.userId, game_id: gameId, score: selectedScore }]);
      }

      setAllRatings(prev => {
        const filtered = prev.filter(r => !(r.userId === currentUser.userId && r.gameId === gameId));
        return [...filtered, { userId: currentUser.userId, gameId, score: selectedScore }];
      });

      setRatingModalGame(null);
    } catch (err: any) {
      alert('평점 저장 중 오류가 발생했습니다: ' + (err.message || err));
    }
  };

  const handleDeleteMyRating = async (gameId: string) => {
    if (!currentUser) return;
    if (window.confirm('삭제하시겠습니까?')) {
      try {
        await supabase.from('ratings').delete().eq('user_id', currentUser.userId).eq('game_id', gameId);
        setAllRatings(prev => prev.filter(r => !(r.userId === currentUser.userId && r.gameId === gameId)));
      } catch (err: any) {
        alert('평점 삭제 중 오류가 발생했습니다: ' + (err.message || err));
      }
    }
  };

  const handleMarkReportAsRead = async (report: ReportData) => {
    setSelectedReport(report);
    if (!report.isRead) {
      setReportList(prev => prev.map(r => r.reportId === report.reportId ? { ...r, isRead: true } : r));
      const { error } = await supabase.from('reports').update({ is_read: true }).eq('report_id', report.reportId);
      if (error) {
        console.error('제보 읽기 처리 오류:', error.message);
        alert('완료 처리 실패: ' + error.message);
      }
    }
  };

  const handleMarkAllReportsAsRead = async () => {
    const unreadIds = reports.filter(r => !r.isRead).map(r => r.reportId);
    if (unreadIds.length === 0) return;
    setReportList(prev => prev.map(r => ({ ...r, isRead: true })));
    const { error } = await supabase.from('reports').update({ is_read: true }).in('report_id', unreadIds);
    if (error) {
      console.error('제보 전체 읽기 오류:', error.message);
      alert('전체 완료 처리 실패: ' + error.message);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = loginId.trim().toLowerCase();
    
    const { data: userDbData, error } = await supabase
      .from('users')
      .select('user_id, name, email, role, password_hash, penalty_count, penalty_end_date, created_at, last_login_at')
      .eq('user_id', cleanId)
      .eq('password_hash', loginPassword)
      .maybeSingle();

    if (error || !userDbData) { 
      alert('아이디 또는 비밀번호 오류'); 
      return; 
    }

    const matchedUser: UserData = {
      userId: userDbData.user_id,
      name: userDbData.name,
      email: userDbData.email,
      role: userDbData.role as Role,
      passwordHash: userDbData.password_hash || '',
      penaltyPoints: Number(userDbData.penalty_count || 0),
      penaltyEndDate: toPureDateStr(userDbData.penalty_end_date) || null,
      createdAt: toPureDateStr(userDbData.created_at) || today,
      lastLoginAt: today
    };

    await supabase.from('users').update({ last_login_at: today }).eq('user_id', matchedUser.userId);
    setCurrentUser(matchedUser); 
    localStorage.setItem('kakao_boardgame_user', JSON.stringify(matchedUser));
  };

  const handleCheckEmail = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const targetEmail = (signUpForm.email || signUpForm.emailPrefix || '').trim().toLowerCase();

    if (!targetEmail) { 
      alert('이메일을 입력해 주세요.'); 
      setIsEmailVerified(false);
      return false;
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('user_id')
      .eq('email', targetEmail)
      .maybeSingle();

    if (existingUser) { 
      alert('이미 사용 중인 이메일입니다.'); 
      setIsEmailVerified(false); 
      return false;
    } else { 
      alert('사용 가능한 이메일입니다.'); 
      setIsEmailVerified(true); 
      return true;
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = signUpForm.userId.trim().toLowerCase();
    const name = signUpForm.name.trim();
    const email = (signUpForm.email || signUpForm.emailPrefix || '').trim().toLowerCase();
    const password = signUpForm.password;

    if (!userId || !name) { alert('아이디와 이름을 확인하세요.'); return; }

    const { data: existingUser } = await supabase
      .from('users')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingUser) {
      alert('이미 등록된 아이디입니다. 다른 아이디를 입력해 주세요.');
      return;
    }

    if (!isEmailVerified) { alert('이메일 중복 확인을 해주세요.'); return; }
    
    if (!password || password.length < 6) {
      alert('비밀번호는 최소 6자리 이상 입력해야 합니다.');
      return;
    }

    if (password !== signUpForm.passwordConfirm) { 
      alert('비밀번호가 일치하지 않습니다.'); 
      return; 
    }

    try {
      const { error: dbError } = await supabase.from('users').insert([{ 
        user_id: userId, 
        name: name, 
        email: email, 
        password_hash: password, 
        role: '일반회원', 
        created_at: getKSTIsoString(), 
        last_login_at: today 
      }]);

      if (dbError) throw dbError;

      alert('회원가입 완료! 로그인해 주세요.'); 
      fetchInitialData(); 
      setAuthTab('login'); 
      setLoginId(userId); 
      setLoginPassword('');
    } catch (err: any) { 
      alert('회원가입 실패: ' + (err.message || err)); 
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (changePassword && changePassword !== changePasswordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (changePassword && changePassword.length < 6) {
      alert('새 비밀번호는 최소 6자리 이상이어야 합니다.');
      return;
    }

    const updates: any = { name: editName.trim() };
    if (changePassword) updates.password_hash = changePassword;

    try {
      const { error: dbError } = await supabase
        .from('users')
        .update(updates)
        .eq('user_id', currentUser.userId);

      if (dbError) throw dbError;

      alert('회원정보가 성공적으로 수정되었습니다.');
      setIsEditProfileOpen(false);
      setNewPasswordInput('');
      setNewPasswordConfirmInput('');
      fetchInitialData();
    } catch (err: any) {
      alert('수정 실패: ' + (err.message || err));
    }
  };

  const handleLogout = () => {
    setCurrentUser(null); localStorage.removeItem('kakao_boardgame_user');
    setCart([]); setIsCartOpen(false); setIsSettingsOpen(false); setIsAdminReportDrawerOpen(false);
  };

  const deleteGame = async (gameId: string, title: string, status: GameStatus) => {
    if (status === '대여중') { alert('대여 중인 게임은 삭제 불가합니다.'); return; }
    if (window.confirm(`'${title}' 게임을 삭제하시겠습니까?`)) { await supabase.from('games').delete().eq('game_id', gameId); fetchInitialData(); }
  };

  const deleteSite = async (siteId: number, name: string) => {
    if (window.confirm(`'${name}' 사이트를 삭제하시겠습니까?`)) { await supabase.from('sites').delete().eq('site_id', siteId); fetchInitialData(); }
  };

  const deleteNotice = async (id: number) => {
    if (window.confirm('공지사항을 삭제하시겠습니까?')) { await supabase.from('notices').delete().eq('notice_id', id); fetchInitialData(); }
  };

  const handleUserRoleChange = async (targetUser: UserData, newRole: Role) => {
    if (window.confirm('처리하시겠습니까?')) { await supabase.from('users').update({ role: newRole }).eq('user_id', targetUser.userId); fetchInitialData(); }
  };

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !reportForm.category) return;
    await supabase.from('reports').insert([{ user_id: currentUser.userId, category: reportForm.category, title: reportForm.title.trim(), content: reportForm.content.trim(), is_read: false }]);
    alert('제출되었습니다.'); setReportForm({ title: '', content: '', category: '' }); setIsReportModalOpen(false); fetchInitialData();
  };

  const saveGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGame) return;

    const rawGenres = editingGame.genres;
    let cleanGenres: string[] = [];

    if (Array.isArray(rawGenres)) {
      cleanGenres = rawGenres
        .map((g) => String(g).replace(/[\\"[\]]/g, '').trim())
        .filter(Boolean);
    } else if (typeof rawGenres === 'string') {
      cleanGenres = (rawGenres as string)
        .replace(/[\\"[\]]/g, '')
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean);
    }

    cleanGenres.sort((a, b) => a.localeCompare(b, 'ko'));

    const formattedGenres = cleanGenres.join(', ');

    const gamePayload = {
      title: editingGame.title,
      min_players: editingGame.minPlayers,
      max_players: editingGame.maxPlayers,
      play_time: editingGame.playTime,
      difficulty: editingGame.difficulty,
      is_visible: editingGame.isVisible,
      image_url: editingGame.imageUrl,
      genres: formattedGenres,
      release_year: editingGame.releaseYear,
      bgg_rating: editingGame.bggRating,
    };

    try {
      if (isEditingMode) {
        const { error } = await supabase
          .from('games')
          .update(gamePayload)
          .eq('game_id', editingGame.gameId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('games').insert([
          {
            game_id: editingGame.gameId,
            status: '대여가능',
            description: '',
            ...gamePayload,
          },
        ]);
        if (error) throw error;
      }

      fetchInitialData();
      setIsGameModalOpen(false);
    } catch (err: any) {
      alert('게임 저장 중 오류 발생: ' + (err.message || err));
    }
  };

  const toggleGenreSelection = (genre: string) => {
    if (!editingGame) return;
    const currentGenres = editingGame.genres || [];
    if (currentGenres.includes(genre)) setEditingGame({ ...editingGame, genres: currentGenres.filter(g => g !== genre) });
    else { if (currentGenres.length >= 3) { alert('장르는 최대 3개까지 선택할 수 있습니다.'); return; } setEditingGame({ ...editingGame, genres: [...currentGenres, genre] }); }
  };

  const saveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    const noticeDataToSave = {
      title: editingNotice.title,
      content: editingNotice.content,
      image_url: editingNotice.imageUrl || '',
      is_visible: editingNotice.isVisible || 'Y',
    };

    if (editingNotice.id) {
      await supabase.from('notices').update(noticeDataToSave).eq('notice_id', editingNotice.id);
    } else {
      await supabase.from('notices').insert([noticeDataToSave]);
    }
    fetchInitialData(); 
    setIsNoticeModalOpen(false);
  };

  const saveSite = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingSite.siteId > 0) {
        const { error } = await supabase
          .from('sites')
          .update({
            name: editingSite.name,
            url: editingSite.url,
            banner_url: editingSite.bannerUrl,
            description: editingSite.description,
            is_visible: editingSite.isVisible,
          })
          .eq('site_id', editingSite.siteId);

        if (error) throw error;
      } else {
        const maxOrder = sites.reduce((max, s) => {
          const order = s.displayOrder ?? s.siteId;
          return order > max ? order : max;
        }, 0);

        const nextOrder = maxOrder + 1;
        const newSiteId = Date.now();

        const { error } = await supabase.from('sites').insert([
          {
            site_id: newSiteId,
            name: editingSite.name,
            url: editingSite.url,
            banner_url: editingSite.bannerUrl,
            description: editingSite.description,
            is_visible: editingSite.isVisible,
            display_order: nextOrder,
          },
        ]);

        if (error) throw error;
      }

      fetchInitialData();
      setIsSiteModalOpen(false);
    } catch (err: any) {
      alert('사이트 저장 중 오류가 발생했습니다: ' + (err.message || err));
    }
  };

  const handleNoticeClick = (notice: Notice) => {
    setExpandedNoticeId(notice.noticeId);
    setIsNoticeDrawerOpen(true);
  };

  const userActiveRentals = useMemo(() => {
    if (!currentUser || !currentUser.userId) return [];
    const currentUserIdClean = String(currentUser.userId).trim().toLowerCase();

    return rentals.filter((r) => {
      const rentalUserIdClean = String(r.userId || '').trim().toLowerCase();
      return rentalUserIdClean === currentUserIdClean && r.status === '대여중';
    });
  }, [rentals, currentUser]);

  const activeRentalsCount = userActiveRentals.length;

  const hasOverdueRental = useMemo(() => {
    return userActiveRentals.some((r) => {
      const cleanEndDate = toPureDateStr(r.endDate);
      return cleanEndDate && today > cleanEndDate;
    });
  }, [userActiveRentals, today]);

  const returnedRentalsList = useMemo(() => rentals.filter((r: Rental) => currentUser && r.userId === currentUser.userId && r.status === '반납완료'), [rentals, currentUser]);
  const visibleSitesList = useMemo(() => sites.filter((s: BoardSite) => s.isVisible === 'Y'), [sites]);
  const favoriteGamesList = useMemo(() => games.filter((g: Game) => userFavorites.includes(g.gameId)), [games, userFavorites]);
  const myRatingGamesList = useMemo(() => games.map((g: Game) => ({ ...g, myScore: allRatings.find(r => currentUser && r.userId === currentUser.userId && r.gameId === g.gameId)?.score || null })).filter(g => g.myScore !== null), [games, allRatings, currentUser]);

  const calculateEndDate = () => { const d = new Date(); d.setDate(d.getDate() + rentalDays); return d.toISOString().split('T')[0]; };
  const isAdmin = (currentUser?.role as string) === '관리자' || (currentUser?.role as string) === '마스터';
  const unreadReportsCount = reports.filter((r: ReportData) => !r.isRead).length;

  if (!mounted) return null;

  if (!currentUser) {
    return (
      <AuthScreen 
        LOGIN_LOGO_URL={LOGIN_LOGO_URL}
        authTab={authTab}
        setAuthTab={setAuthTab}
        loginId={loginId}
        setLoginId={setLoginId}
        loginPassword={loginPassword}
        setLoginPassword={setLoginPassword}
        handleLogin={handleLogin}
        signUpForm={signUpForm}
        setSignUpForm={setSignUpForm}
        handleCheckEmail={handleCheckEmail}
        handleSignUp={handleSignUp}
        isEmailVerified={isEmailVerified}
        setIsEmailVerified={setIsEmailVerified}
        ALLOWED_EMAIL_DOMAINS={ALLOWED_EMAIL_DOMAINS}
        users={users}
        fetchInitialData={fetchInitialData}
      />
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-white text-slate-900 text-xs relative">
      <FixedHeader isHeaderAdminTheme={isHeaderAdminTheme} isIosDevice={isIosDevice} currentUser={currentUser} today={today} unreadReportsCount={unreadReportsCount} setIsAdminReportDrawerOpen={setIsAdminReportDrawerOpen} setIsSettingsOpen={setIsSettingsOpen} headerRef={headerRef} />

      <main 
        ref={mainScrollRef} 
        style={{ 
          paddingTop: isLargeFont ? (isIosDevice ? '114px' : '110px') : (isIosDevice ? '96px' : '92px'), 
          paddingBottom: '80px' 
        }} 
        className="flex-1 w-full py-4 px-4 bg-white text-slate-900 text-xs transition-all relative"
      >
        <div className={activeTab === 'games' ? 'block' : 'hidden'}>
          <GamesTab isInitialLoaded={isInitialLoaded} games={games} rentals={rentals} userFavorites={userFavorites} allRatings={allRatings} currentUser={currentUser} today={today} isIosDevice={isIosDevice} isLargeFont={isLargeFont} recentNoticesList={recentNoticesList} noticeIndex={noticeIndex} isNoticeTransition={isNoticeTransition} handleNoticeClick={handleNoticeClick} toggleCartItem={toggleCartItem} toggleFavorite={toggleFavorite} cart={cart} setRatingModalGame={setRatingModalGame} setSelectedScore={setSelectedScore} />
        </div>
        <div className={activeTab === 'returns' ? 'block' : 'hidden'}><ReturnsTab isInitialLoaded={isInitialLoaded} rentals={rentals} currentUser={currentUser} today={today} returnGame={returnGame} returnAllGames={returnAllGames} returnedRentalsList={returnedRentalsList} /></div>
        <div className={activeTab === 'ranking' ? 'block' : 'hidden'}><RankingTab isInitialLoaded={isInitialLoaded} games={games} rentals={rentals} allRatings={allRatings} /></div>
        <div className={activeTab === 'sites' ? 'block' : 'hidden'}><SitesTab isInitialLoaded={isInitialLoaded} visibleSitesList={visibleSitesList} /></div>
        {isAdmin && <div className={activeTab === 'admin' ? 'block' : 'hidden'}><AdminTab isInitialLoaded={isInitialLoaded} games={games} users={users} rentals={rentals} sites={sites} notices={notices} currentUser={currentUser} setIsEditingMode={setIsEditingMode} setEditingGame={setEditingGame} setIsGameModalOpen={setIsGameModalOpen} deleteGame={deleteGame} setEditingSite={setEditingSite} setIsSiteModalOpen={setIsSiteModalOpen} deleteSite={deleteSite} handleUserRoleChange={handleUserRoleChange} setEditingNotice={setEditingNotice} setIsNoticeModalOpen={setIsNoticeModalOpen} deleteNotice={deleteNotice} returnGame={returnGame} /></div>}
      </main>

      {/* 장바구니 플로팅 버튼 */}
      {activeTab === 'games' && (
        <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+80px)] right-4 z-30">
          <button onClick={() => setIsCartOpen(true)} className="p-3.5 rounded-full shadow-xl flex items-center justify-center relative cursor-pointer bg-slate-900 text-white">
            <ShoppingCart size={20} />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-extrabold w-5 h-5 rounded-full flex items-center justify-center text-[10px]">{cart.length}</span>}
          </button>
        </div>
      )}

      {/* 모달 및 드로어 모음 */}
      <ModalsContainer 
        isAdminReportDrawerOpen={isAdminReportDrawerOpen} 
        setIsAdminReportDrawerOpen={setIsAdminReportDrawerOpen} 
        selectedReport={selectedReport} 
        reports={reports} 
        setReports={setReportList} 
        unreadReportsCount={unreadReportsCount} 
        handleMarkReportAsRead={handleMarkReportAsRead} 
        handleMarkAllReportsAsRead={handleMarkAllReportsAsRead}
        isSettingsOpen={isSettingsOpen} setIsSettingsOpen={setIsSettingsOpen} currentUser={currentUser} setEditName={setEditName} setNewPasswordInput={setNewPasswordInput} setNewPasswordConfirmInput={setNewPasswordConfirmInput} setIsEditProfileOpen={setIsEditProfileOpen} setIsFavoritesModalOpen={setIsFavoritesModalOpen} setIsMyRatingsModalOpen={setIsMyRatingsModalOpen} userFavorites={userFavorites} favoriteGamesList={favoriteGamesList} myRatingGamesList={myRatingGamesList} setReportForm={setReportForm} setIsReportModalOpen={setIsReportModalOpen} 
        fontSize={fontSize} setFontSize={handleSetFontSize} 
        theme={theme} setTheme={setTheme}
        handleLogout={handleLogout}
        isNoticeDrawerOpen={isNoticeDrawerOpen} setIsNoticeDrawerOpen={setIsNoticeDrawerOpen} notices={visibleNoticesList} expandedNoticeId={expandedNoticeId} handleNoticeClick={handleNoticeClick}
        isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} cart={cart} rentalDays={rentalDays} setRentalDays={setRentalDays} calculateEndDate={calculateEndDate} removeFromCart={removeFromCart} processCheckout={processCheckout}
        isFavoritesModalOpen={isFavoritesModalOpen} toggleFavorite={toggleFavorite}
        isMyRatingsModalOpen={isMyRatingsModalOpen} handleDeleteMyRating={handleDeleteMyRating}
        ratingModalGame={ratingModalGame} setRatingModalGame={setRatingModalGame} selectedScore={selectedScore} setSelectedScore={setSelectedScore} StarRating={StarRating} handleSaveRating={handleSaveRating}
        isReportModalOpen={isReportModalOpen} reportForm={reportForm} handleSendReport={handleSendReport}
        isEditProfileOpen={isEditProfileOpen} editName={editName} changePassword={changePassword} changePasswordConfirm={changePasswordConfirm} handleSaveProfile={handleSaveProfile}
        isGameModalOpen={isGameModalOpen} setIsGameModalOpen={setIsGameModalOpen} editingGame={editingGame} setEditingGame={setEditingGame} isEditingMode={isEditingMode} saveGame={saveGame} AVAILABLE_GENRES={AVAILABLE_GENRES} toggleGenreSelection={toggleGenreSelection}
        isNoticeModalOpen={isNoticeModalOpen} setIsNoticeModalOpen={setIsNoticeModalOpen} editingNotice={editingNotice} setEditingNotice={setEditingNotice} saveNotice={saveNotice}
        isSiteModalOpen={isSiteModalOpen} setIsSiteModalOpen={setIsSiteModalOpen} editingSite={editingSite} setEditingSite={setEditingSite} saveSite={saveSite}
      />

      <FixedBottomNav 
        isDarkMode={theme === 'dark'}
        isIosDevice={isIosDevice} 
        activeTab={activeTab} 
        isAdmin={isAdmin} 
        unreadReportsCount={unreadReportsCount} 
        activeRentalsCount={activeRentalsCount}
        hasOverdueRental={hasOverdueRental}
        handleTabChange={handleTabChange} 
      />
    </div>
  );
}