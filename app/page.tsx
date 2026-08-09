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

// ⚡ 신규 장르 목록 6개 적용
const AVAILABLE_GENRES = ['전략게임', '파티게임', '협동게임', '가족게임', '테마/모험', '추리/마피아'];

const checkIsIosDevice = () => {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
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

  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
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
  const [editingNotice, setEditingNotice] = useState<{ id?: number; title: string; content: string }>({ title: '', content: '' });
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<BoardSite>({ siteId: 0, name: '', url: '', bannerUrl: '', description: '', isVisible: 'Y' });
  const [reportForm, setReportForm] = useState({ title: '', content: '', category: '' });

  const [isIosDevice, setIsIosDevice] = useState(false);
  const scrollPositions = useRef<{ [key: string]: number }>({ games: 0, returns: 0, ranking: 0, sites: 0, admin: 0 });

  useEffect(() => {
    setMounted(true);
    setIsIosDevice(checkIsIosDevice());
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('kakao_boardgame_user'); if (savedUser) setCurrentUser(JSON.parse(savedUser));
        const savedFont = localStorage.getItem('kakao_bg_fontSize'); if (savedFont) setFontSize(savedFont as any);
      } catch (e) {}
    }
  }, []);

  const isHeaderAdminTheme = activeTab === 'admin';
  const isLargeFont = fontSize === 'large';
  const headerRef = useRef<HTMLElement | null>(null); 
  const mainScrollRef = useRef<HTMLDivElement | null>(null);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (typeof document !== 'undefined' && mounted) {
      const root = document.documentElement;
      const metaTheme = document.getElementById('theme-color-meta');
      root.style.setProperty('--bg-main', '#ffffff');
      root.style.setProperty('--bg-header', isHeaderAdminTheme ? '#38bdf8' : '#FEE500');
      document.body.style.backgroundColor = '#ffffff';
      if (metaTheme) metaTheme.setAttribute('content', isHeaderAdminTheme ? '#38bdf8' : '#FEE500');
      if (isLargeFont) root.classList.add('text-large');
      else root.classList.remove('text-large');
    }
  }, [isHeaderAdminTheme, isLargeFont, mounted]);

  useEffect(() => { if (mounted) fetchInitialData(); }, [mounted]);

  const handleTabChange = useCallback((newTab: 'games' | 'returns' | 'ranking' | 'sites' | 'admin') => {
    if (newTab === activeTab) return;
    scrollPositions.current[activeTab] = window.scrollY;
    setActiveTab(newTab);
    if (typeof window !== 'undefined') localStorage.setItem('kakao_bg_activeTab', newTab);
    requestAnimationFrame(() => { window.scrollTo(0, scrollPositions.current[newTab] || 0); });
  }, [activeTab]);

  const recentNoticesList = useMemo(() => (notices || []).slice(0, 5), [notices]);

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
        supabase.from('users').select('*'),
        supabase.from('rentals').select('*'),
        supabase.from('ratings').select('*'),
        supabase.from('games').select('*'),
        supabase.from('notices').select('*').order('created_at', { ascending: false }),
        supabase.from('reports').select('*').order('created_at', { ascending: false }),
        supabase.from('sites').select('*').order('site_id', { ascending: true })
      ]);

      if (currentUser) {
        const { data: favoritesData } = await supabase.from('favorites').select('game_id').eq('user_id', currentUser.userId);
        if (favoritesData) {
          setUserFavorites(favoritesData.map(f => f.game_id));
        }
      }

      if (usersData) {
        const mappedUsers: UserData[] = usersData.map(u => ({
          userId: u.user_id, name: u.name, email: u.email, role: u.role as Role, passwordHash: u.password_hash, penaltyPoints: Number(u.penalty_count || 0), penaltyEndDate: u.penalty_end_date || null, createdAt: u.created_at?.split('T')[0] || today, lastLoginAt: u.last_login_at || '기록없음'
        }));
        setUsers(mappedUsers);
        if (currentUser) {
          const latestSelf = mappedUsers.find(u => u.userId === currentUser.userId);
          if (latestSelf) { setCurrentUser(latestSelf); localStorage.setItem('kakao_boardgame_user', JSON.stringify(latestSelf)); }
        }
      }

      if (rentalsData) setRentals(rentalsData.map(r => ({ rentalId: r.rental_id, userId: r.user_id, gameId: r.game_id, gameTitle: r.game_title, status: r.status, startDate: r.start_date, endDate: r.end_date, returnedAt: r.returned_at })));
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

      if (noticeData) setNoticeList(noticeData.map(n => ({ noticeId: n.notice_id, title: n.title, content: n.content, createdAt: n.created_at?.split('T')[0] || today })));
      if (reportsData) setReportList(reportsData.map(r => ({ reportId: r.report_id || r.id, userId: r.user_id, category: r.category || '신고/건의', title: r.title, content: r.content, createdAt: r.created_at?.replace('T', ' ').substring(0, 16) || today, isRead: !!r.is_read })));
      if (sitesData) setSiteList(sitesData.map(s => ({ siteId: s.site_id, name: s.name, url: s.url, bannerUrl: s.banner_url || '', description: s.description || '', isVisible: s.is_visible || 'Y' })));
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
          rentalId: r.rental_id, userId: r.user_id, gameId: r.game_id, gameTitle: r.game_title, status: r.status, startDate: r.start_date, endDate: r.end_date, returnedAt: r.returned_at
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
    const nowIso = new Date().toISOString();

    try {
      const { error: rentalErr } = await supabase.from('rentals').update({ status: '반납완료', returned_at: nowIso }).eq('rental_id', rentalId);
      if (rentalErr) throw rentalErr;

      const { error: gameErr } = await supabase.from('games').update({ status: '대여가능' }).eq('game_id', gameId);
      if (gameErr) throw gameErr;

      setRentals(prevRentals =>
        prevRentals.map(r =>
          r.rentalId === rentalId ? { ...r, status: '반납완료', returnedAt: nowIso } : r
        )
      );

      setGames(prevGames =>
        prevGames.map(g =>
          g.gameId === gameId ? { ...g, status: '대여가능' as GameStatus } : g
        )
      );

      alert('반납이 완료되었습니다.');
    } catch (err: any) {
      alert('반납 처리 실패: ' + (err.message || err));
    }
  };

  const returnAllGames = async () => {
    if (!currentUser) return;
    const userActiveRentals = rentals.filter((r: Rental) => r.userId === currentUser.userId && r.status === '대여중');
    if (userActiveRentals.length === 0) return;
    
    const activeRentalIds = userActiveRentals.map(r => r.rentalId);
    const activeGameIds = userActiveRentals.map(r => r.gameId);
    const nowIso = new Date().toISOString();

    try {
      const { error: rentalErr } = await supabase.from('rentals').update({ status: '반납완료', returned_at: nowIso }).in('rental_id', activeRentalIds);
      if (rentalErr) throw rentalErr;

      const { error: gameErr } = await supabase.from('games').update({ status: '대여가능' }).in('game_id', activeGameIds);
      if (gameErr) throw gameErr;

      setRentals(prevRentals =>
        prevRentals.map(r =>
          activeRentalIds.includes(r.rentalId) ? { ...r, status: '반납완료', returnedAt: nowIso } : r
        )
      );

      setGames(prevGames =>
        prevGames.map(g =>
          activeGameIds.includes(g.gameId) ? { ...g, status: '대여가능' as GameStatus } : g
        )
      );

      alert('모든 보드게임이 반납되었습니다.');
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
        await supabase.from('ratings').update({ score: selectedScore, updated_at: new Date().toISOString() }).eq('user_id', currentUser.userId).eq('game_id', gameId);
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
      await supabase.from('reports').update({ is_read: true }).eq('report_id', report.reportId);
    }
  };

  const handleMarkAllReportsAsRead = async () => {
    const unreadIds = reports.filter(r => !r.isRead).map(r => r.reportId);
    if (unreadIds.length === 0) return;
    setReportList(prev => prev.map(r => ({ ...r, isRead: true })));
    await supabase.from('reports').update({ is_read: true }).in('report_id', unreadIds);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find((u) => u.userId === loginId.trim().toLowerCase() && u.passwordHash === loginPassword);
    if (!user) { alert('아이디 또는 비밀번호 오류'); return; }
    await supabase.from('users').update({ last_login_at: today }).eq('user_id', user.userId);
    user.lastLoginAt = today;
    setCurrentUser(user); localStorage.setItem('kakao_boardgame_user', JSON.stringify(user));
  };

  const handleCheckEmail = async () => {
    const email = `${signUpForm.emailPrefix.trim()}@${signUpForm.emailDomain}`;
    if (!signUpForm.emailPrefix.trim()) { alert('이메일 아이디를 입력해 주세요.'); return; }
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) { alert('이미 등록된 이메일 주소입니다.'); setIsEmailVerified(false); } 
    else { alert('사용 가능한 이메일입니다.'); setIsEmailVerified(true); }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = signUpForm.userId.trim().toLowerCase();
    const name = signUpForm.name.trim();
    const email = `${signUpForm.emailPrefix.trim()}@${signUpForm.emailDomain}`;
    if (!userId || !name) { alert('아이디와 이름을 확인하세요.'); return; }
    if (!isEmailVerified) { alert('이메일 중복 확인을 해주세요.'); return; }
    if (signUpForm.password !== signUpForm.passwordConfirm) { alert('비밀번호가 일치하지 않습니다.'); return; }

    try {
      const { error } = await supabase.from('users').insert([{ user_id: userId, name: name, email: email, password_hash: signUpForm.password, role: '일반', created_at: new Date().toISOString(), last_login_at: today }]);
      if (error) throw error;
      alert('회원가입 완료! 로그인해 주세요.'); fetchInitialData(); setAuthTab('login'); setLoginId(userId); setLoginPassword('');
    } catch (err: any) { alert('회원가입 실패: ' + err.message); }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (changePassword && changePassword !== changePasswordConfirm) { alert('비밀번호가 일치하지 않습니다.'); return; }
    const updates: any = { name: editName.trim() };
    if (changePassword) updates.password_hash = changePassword;
    const { error } = await supabase.from('users').update(updates).eq('user_id', currentUser.userId);
    if (error) alert('수정 실패: ' + error.message);
    else { alert('수정되었습니다.'); setIsEditProfileOpen(false); setNewPasswordInput(''); setNewPasswordConfirmInput(''); fetchInitialData(); }
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
    if (isEditingMode) {
      await supabase.from('games').update({ title: editingGame.title, min_players: editingGame.minPlayers, max_players: editingGame.maxPlayers, play_time: editingGame.playTime, difficulty: editingGame.difficulty, is_visible: editingGame.isVisible, image_url: editingGame.imageUrl, genres: editingGame.genres, release_year: editingGame.releaseYear, bgg_rating: editingGame.bggRating }).eq('game_id', editingGame.gameId);
    } else {
      await supabase.from('games').insert([{ game_id: editingGame.gameId, title: editingGame.title, status: '대여가능', min_players: editingGame.minPlayers, max_players: editingGame.maxPlayers, play_time: editingGame.playTime, difficulty: editingGame.difficulty, description: '', is_visible: editingGame.isVisible, image_url: editingGame.imageUrl, genres: editingGame.genres, release_year: editingGame.releaseYear, bgg_rating: editingGame.bggRating }]);
    }
    fetchInitialData(); setIsGameModalOpen(false);
  };

  const toggleGenreSelection = (genre: string) => {
    if (!editingGame) return;
    const currentGenres = editingGame.genres || [];
    if (currentGenres.includes(genre)) setEditingGame({ ...editingGame, genres: currentGenres.filter(g => g !== genre) });
    else { if (currentGenres.length >= 4) { alert('장르는 최대 4개까지 선택할 수 있습니다.'); return; } setEditingGame({ ...editingGame, genres: [...currentGenres, genre] }); }
  };

  const saveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNotice.id) await supabase.from('notices').update({ title: editingNotice.title, content: editingNotice.content }).eq('notice_id', editingNotice.id);
    else await supabase.from('notices').insert([{ title: editingNotice.title, content: editingNotice.content }]);
    fetchInitialData(); setIsNoticeModalOpen(false);
  };

  const saveSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSite.siteId > 0) {
      await supabase.from('sites').update({ name: editingSite.name, url: editingSite.url, banner_url: editingSite.bannerUrl, description: editingSite.description, is_visible: editingSite.isVisible }).eq('site_id', editingSite.siteId);
    } else {
      await supabase.from('sites').insert([{ site_id: Date.now(), name: editingSite.name, url: editingSite.url, banner_url: editingSite.bannerUrl, description: editingSite.description, is_visible: editingSite.isVisible }]);
    }
    fetchInitialData(); setIsSiteModalOpen(false);
  };

  const handleNoticeClick = (notice: Notice) => {
    setExpandedNoticeId(expandedNoticeId === notice.noticeId ? null : notice.noticeId);
    setIsNoticeDrawerOpen(true);
  };

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
        setIsEmailVerified={setIsEmailVerified}
        ALLOWED_EMAIL_DOMAINS={ALLOWED_EMAIL_DOMAINS}
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
        isAdminReportDrawerOpen={isAdminReportDrawerOpen} setIsAdminReportDrawerOpen={setIsAdminReportDrawerOpen} selectedReport={selectedReport} reports={reports} unreadReportsCount={unreadReportsCount} handleMarkReportAsRead={handleMarkReportAsRead} handleMarkAllReportsAsRead={handleMarkAllReportsAsRead}
        isSettingsOpen={isSettingsOpen} setIsSettingsOpen={setIsSettingsOpen} currentUser={currentUser} setEditName={setEditName} setNewPasswordInput={setNewPasswordInput} setNewPasswordConfirmInput={setNewPasswordConfirmInput} setIsEditProfileOpen={setIsEditProfileOpen} setIsFavoritesModalOpen={setIsFavoritesModalOpen} setIsMyRatingsModalOpen={setIsMyRatingsModalOpen} userFavorites={userFavorites} favoriteGamesList={favoriteGamesList} myRatingGamesList={myRatingGamesList} setReportForm={setReportForm} setIsReportModalOpen={setIsReportModalOpen} fontSize={fontSize} setFontSize={setFontSize} handleLogout={handleLogout}
        isNoticeDrawerOpen={isNoticeDrawerOpen} setIsNoticeDrawerOpen={setIsNoticeDrawerOpen} notices={notices} expandedNoticeId={expandedNoticeId} handleNoticeClick={handleNoticeClick}
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

      <FixedBottomNav isIosDevice={isIosDevice} activeTab={activeTab} isAdmin={isAdmin} unreadReportsCount={unreadReportsCount} handleTabChange={handleTabChange} />
    </div>
  );
}