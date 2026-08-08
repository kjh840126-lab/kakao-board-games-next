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
import { 
  ShoppingCart, Siren, Settings, Bell, X, ChevronDown, 
  ChevronRight, Heart, Star, User, LogOut, Type, Calendar, Trash2,
  Image, Clock, Brain, Tag, LogIn, UserPlus
} from 'lucide-react';

const ALLOWED_EMAIL_DOMAINS = ['kakaocorp.com', 'kakaoenterprise.com', 'kakaomobility.com', 'kakaopaycorp.com', 'kakaoent.com'];
const LOGIN_LOGO_URL = '/logo.png';
const currentYear = new Date().getFullYear();
const AVAILABLE_GENRES = ['전략게임', '파티게임', '추상전략', '타일 놓기', '카드게임', '가족게임', '협동게임', '마피아'];

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
        const savedGames = localStorage.getItem('kakao_bg_games_cache'); if (savedGames) setGames(JSON.parse(savedGames));
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
        setGames(mappedGames);
        if (typeof window !== 'undefined') localStorage.setItem('kakao_bg_games_cache', JSON.stringify(mappedGames));
      }
      if (noticeData) setNoticeList(noticeData.map(n => ({ noticeId: n.notice_id, title: n.title, content: n.content, createdAt: n.created_at?.split('T')[0] || today })));
      if (reportsData) setReportList(reportsData.map(r => ({ reportId: r.report_id || r.id, userId: r.user_id, category: r.category || '신고/건의', title: r.title, content: r.content, createdAt: r.created_at?.replace('T', ' ').substring(0, 16) || today, isRead: !!r.is_read })));
      if (sitesData) setSiteList(sitesData.map(s => ({ siteId: s.site_id, name: s.name, url: s.url, bannerUrl: s.banner_url || '', description: s.description || '', isVisible: s.is_visible || 'Y' })));
    } catch (e) {}
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

  // ⚡ 초고속 대여 처리 (즉시 뱃지 반영 + 브라우저 캐시 제거)
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

      // ⚡ 화면 0.001초 변경
      const updatedGames = games.map(game => cartGameIds.includes(game.gameId) ? { ...game, status: '대여중' as GameStatus } : game);
      setGames(updatedGames);
      if (typeof window !== 'undefined') localStorage.setItem('kakao_bg_games_cache', JSON.stringify(updatedGames));

      if (insertedData) {
        const mappedNewRentals: Rental[] = insertedData.map(r => ({
          rentalId: r.rental_id, userId: r.user_id, gameId: r.game_id, gameTitle: r.game_title, status: r.status, startDate: r.start_date, endDate: r.end_date, returnedAt: r.returned_at
        }));
        setRentals(prevRentals => [...mappedNewRentals, ...prevRentals]);
      }

      alert(`보드게임 ${cart.length}건이 ${rentalDays}일간 대여되었습니다.`); 
      setCart([]); 
      setIsCartOpen(false);
      fetchInitialData(); 
    } catch (err: any) {
      alert('대여 처리 중 오류가 발생했습니다: ' + (err.message || err));
    }
  };

  const returnGame = async (rentalId: number, gameId: string) => {
    if (!currentUser) return;
    await supabase.from('rentals').update({ status: '반납완료', returned_at: new Date().toISOString() }).eq('rental_id', rentalId);
    await supabase.from('games').update({ status: '대여가능' }).eq('game_id', gameId);
    alert('반납이 완료되었습니다.'); fetchInitialData();
  };

  const returnAllGames = async () => {
    if (!currentUser) return;
    const userActiveRentals = rentals.filter((r: Rental) => r.userId === currentUser.userId && r.status === '대여중');
    if (userActiveRentals.length === 0) return;
    await supabase.from('rentals').update({ status: '반납완료', returned_at: new Date().toISOString() }).in('rental_id', userActiveRentals.map(r => r.rentalId));
    await supabase.from('games').update({ status: '대여가능' }).in('game_id', userActiveRentals.map(r => r.gameId));
    alert('모든 보드게임이 반납되었습니다.'); fetchInitialData();
  };

  const handleSaveRating = async () => {
    if (!currentUser || !ratingModalGame) return;
    const existing = allRatings.find(r => r.userId === currentUser.userId && r.gameId === ratingModalGame.gameId);
    if (existing) await supabase.from('ratings').update({ score: selectedScore, updated_at: new Date().toISOString() }).eq('user_id', currentUser.userId).eq('game_id', ratingModalGame.gameId);
    else await supabase.from('ratings').insert([{ user_id: currentUser.userId, game_id: ratingModalGame.gameId, score: selectedScore }]);
    setRatingModalGame(null); fetchInitialData();
  };

  const handleDeleteMyRating = async (gameId: string) => {
    if (!currentUser) return;
    if (window.confirm('삭제하시겠습니까?')) {
      await supabase.from('ratings').delete().eq('user_id', currentUser.userId).eq('game_id', gameId); fetchInitialData();
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

  // 🟡 로그인 / 회원가입 페이지 UI
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex justify-center items-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden text-xs border border-slate-100">
          <div className="bg-[#FEE500] p-8 flex flex-col items-center justify-center relative">
            <img src={LOGIN_LOGO_URL} alt="KAKAO BOARD GAMES" className="w-48 h-auto object-contain drop-shadow-sm select-none" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
            <div className="text-center font-black text-slate-900 text-2xl tracking-tighter mt-2"><span className="text-sky-600">KAKAO</span> BOARD GAMES</div>
          </div>
          <div className="flex border-b border-slate-200 bg-white">
            <button type="button" onClick={() => setAuthTab('login')} className={`flex-1 py-3.5 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${authTab === 'login' ? 'border-b-2 border-slate-900 text-slate-900 bg-white' : 'text-slate-400 bg-slate-50'}`}><LogIn size={15} /> 로그인</button>
            <button type="button" onClick={() => setAuthTab('signup')} className={`flex-1 py-3.5 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${authTab === 'signup' ? 'border-b-2 border-slate-900 text-slate-900 bg-white' : 'text-slate-400 bg-slate-50'}`}><UserPlus size={15} /> 회원가입</button>
          </div>

          {authTab === 'login' && (
            <div className="p-6 space-y-4 bg-white">
              <form onSubmit={handleLogin} className="space-y-4">
                <div><label className="font-extrabold text-slate-900 block mb-1.5">아이디 (LDAP)</label><input type="text" required placeholder="hayden.hoi" value={loginId} onChange={(e) => setLoginId(e.target.value.toLowerCase())} className="w-full border-0 bg-[#B8C2D1]/50 focus:bg-white focus:ring-2 focus:ring-slate-900 p-3.5 rounded-2xl text-slate-900 font-medium" /></div>
                <div>
                  <div className="flex justify-between items-center mb-1.5"><label className="font-extrabold text-slate-900">비밀번호</label><button type="button" onClick={() => alert('관리자에게 문의해 주세요.')} className="text-[11px] text-slate-500 underline">비밀번호를 잊으셨나요?</button></div>
                  <input type="password" required placeholder="••••••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full border-0 bg-[#B8C2D1]/50 focus:bg-white focus:ring-2 focus:ring-slate-900 p-3.5 rounded-2xl text-slate-900 font-medium" />
                </div>
                <button type="submit" className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl cursor-pointer transition shadow-md mt-2">로그인</button>
              </form>
            </div>
          )}

          {authTab === 'signup' && (
            <div className="p-6 space-y-3.5 bg-white">
              <form onSubmit={handleSignUp} className="space-y-3">
                <div><label className="font-extrabold text-slate-900 block mb-1">아이디 (LDAP)</label><input type="text" required placeholder="예: new.kakao" value={signUpForm.userId} onChange={(e) => setSignUpForm({ ...signUpForm, userId: e.target.value.toLowerCase() })} className="w-full border border-slate-200 p-3 rounded-xl text-slate-900" /></div>
                <div><label className="font-extrabold text-slate-900 block mb-1">이름</label><input type="text" required placeholder="홍길동" value={signUpForm.name} onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })} className="w-full border border-slate-200 p-3 rounded-xl text-slate-900" /></div>
                <div>
                  <label className="font-extrabold text-slate-900 block mb-1">이메일 주소</label>
                  <div className="flex gap-1.5 items-center">
                    <input type="text" required placeholder="이메일 아이디" value={signUpForm.emailPrefix} onChange={(e) => { setSignUpForm({ ...signUpForm, emailPrefix: e.target.value }); setIsEmailVerified(false); }} className="flex-1 min-w-0 border border-slate-200 p-3 rounded-xl text-slate-900" />
                    <span className="text-slate-400 font-bold">@</span>
                    <select value={signUpForm.emailDomain} onChange={(e) => { setSignUpForm({ ...signUpForm, emailDomain: e.target.value }); setIsEmailVerified(false); }} className="border border-slate-200 bg-slate-50 p-3 rounded-xl text-slate-900 font-semibold cursor-pointer">
                      {ALLOWED_EMAIL_DOMAINS.map(domain => <option key={domain} value={domain}>{domain}</option>)}
                    </select>
                  </div>
                  <button type="button" onClick={handleCheckEmail} className="w-full mt-2 bg-[#0F172A] text-white font-bold py-2.5 rounded-xl cursor-pointer">이메일 중복 확인</button>
                </div>
                <div><label className="font-extrabold text-slate-900 block mb-1">비밀번호</label><input type="password" required placeholder="비밀번호 입력" value={signUpForm.password} onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })} className="w-full border border-slate-200 p-3 rounded-xl text-slate-900" /></div>
                <div><label className="font-extrabold text-slate-900 block mb-1">비밀번호 확인</label><input type="password" required placeholder="비밀번호 재입력" value={signUpForm.passwordConfirm} onChange={(e) => setSignUpForm({ ...signUpForm, passwordConfirm: e.target.value })} className="w-full border border-slate-200 p-3 rounded-xl text-slate-900" /></div>
                <button type="submit" className="w-full bg-[#DCE2EC] text-slate-600 font-bold py-3.5 rounded-2xl cursor-pointer hover:bg-slate-900 hover:text-white transition shadow-sm mt-2">가입 완료하기</button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative bg-white text-slate-900 text-xs">
      <FixedHeader isHeaderAdminTheme={isHeaderAdminTheme} isIosDevice={isIosDevice} currentUser={currentUser} today={today} unreadReportsCount={unreadReportsCount} setIsAdminReportDrawerOpen={setIsAdminReportDrawerOpen} setIsSettingsOpen={setIsSettingsOpen} headerRef={headerRef} />

      <main ref={mainScrollRef} style={{ paddingTop: isLargeFont ? (isIosDevice ? '122px' : '110px') : (isIosDevice ? '104px' : '92px'), paddingBottom: '80px' }} className="w-full py-4 px-4 bg-white text-slate-900 text-xs transition-all">
        <div className={activeTab === 'games' ? 'block' : 'hidden'}>
          <GamesTab games={games} rentals={rentals} userFavorites={userFavorites} allRatings={allRatings} currentUser={currentUser} today={today} isIosDevice={isIosDevice} isLargeFont={isLargeFont} recentNoticesList={recentNoticesList} noticeIndex={noticeIndex} isNoticeTransition={isNoticeTransition} handleNoticeClick={handleNoticeClick} toggleCartItem={toggleCartItem} toggleFavorite={toggleFavorite} cart={cart} setRatingModalGame={setRatingModalGame} setSelectedScore={setSelectedScore} />
        </div>
        <div className={activeTab === 'returns' ? 'block' : 'hidden'}><ReturnsTab rentals={rentals} currentUser={currentUser} today={today} returnGame={returnGame} returnAllGames={returnAllGames} returnedRentalsList={returnedRentalsList} /></div>
        <div className={activeTab === 'ranking' ? 'block' : 'hidden'}><RankingTab games={games} rentals={rentals} allRatings={allRatings} /></div>
        <div className={activeTab === 'sites' ? 'block' : 'hidden'}><SitesTab visibleSitesList={visibleSitesList} /></div>
        {isAdmin && <div className={activeTab === 'admin' ? 'block' : 'hidden'}><AdminTab games={games} users={users} rentals={rentals} sites={sites} notices={notices} currentUser={currentUser} setIsEditingMode={setIsEditingMode} setEditingGame={setEditingGame} setIsGameModalOpen={setIsGameModalOpen} deleteGame={deleteGame} setEditingSite={setEditingSite} setIsSiteModalOpen={setIsSiteModalOpen} deleteSite={deleteSite} handleUserRoleChange={handleUserRoleChange} setEditingNotice={setEditingNotice} setIsNoticeModalOpen={setIsNoticeModalOpen} deleteNotice={deleteNotice} returnGame={returnGame} /></div>}
      </main>

      {activeTab === 'games' && (
        <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+80px)] right-4 z-30">
          <button onClick={() => setIsCartOpen(true)} className="p-3.5 rounded-full shadow-xl flex items-center justify-center relative cursor-pointer bg-slate-900 text-white">
            <ShoppingCart size={20} />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-extrabold w-5 h-5 rounded-full flex items-center justify-center text-[10px]">{cart.length}</span>}
          </button>
        </div>
      )}

      {/* 1. 관리자 접수함 */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${isAdminReportDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAdminReportDrawerOpen(false)} />
        <div className="absolute top-0 right-0 h-full w-4/5 max-w-sm flex flex-col shadow-2xl bg-white text-slate-900 text-xs">
          <div className="p-4 bg-sky-400 text-slate-900 flex justify-between items-center font-bold text-base">
            <span className="flex items-center gap-2"><Siren size={18} /> 접수함</span>
            <button onClick={() => setIsAdminReportDrawerOpen(false)} className="p-1 cursor-pointer"><X size={18} /></button>
          </div>
          <div className="p-3 bg-slate-100 flex justify-between items-center border-b border-slate-200 text-xs">
            <span className="text-slate-500">안읽음: <strong className="text-rose-500 font-extrabold">{unreadReportsCount}</strong>건</span>
            {unreadReportsCount > 0 && <button onClick={handleMarkAllReportsAsRead} className="font-bold bg-slate-900 text-white px-2 py-1 rounded-md text-[10px]">모두 읽음</button>}
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {selectedReport && (
              <div className="p-3.5 rounded-2xl space-y-2 border bg-sky-50 border-sky-300">
                <div className="flex justify-between items-center gap-2"><span className="text-sky-800 font-extrabold bg-sky-200 px-2 py-0.5 rounded-md">{selectedReport.category}</span><span className="text-slate-400 font-mono">{selectedReport.userId}</span></div>
                <h3 className="font-extrabold text-slate-900 break-all leading-snug">{selectedReport.title}</h3>
                <p className="whitespace-pre-wrap break-all pt-1.5 border-t border-sky-200 text-slate-700">{selectedReport.content}</p>
              </div>
            )}
            <div className="space-y-2 pt-1"><h4 className="font-bold text-slate-400">전체 목록 ({reports.length})</h4>
              {reports.map((report: ReportData) => (
                <div key={report.reportId} onClick={() => handleMarkReportAsRead(report)} className={`p-2.5 rounded-xl border cursor-pointer ${selectedReport?.reportId === report.reportId ? 'border-sky-500 bg-sky-500 text-slate-900 font-bold' : 'border-slate-200 bg-white'}`}>
                  <div className="flex items-center gap-1">{!report.isRead && <span className="bg-rose-600 text-white text-[8px] font-black px-1 py-0.5 rounded-full">N</span>}<span className="truncate">{report.title}</span></div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-slate-200"><button onClick={() => setIsAdminReportDrawerOpen(false)} className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-bold cursor-pointer">닫기</button></div>
        </div>
      </div>

      {/* 2. 설정 */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${isSettingsOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)} />
        <div className="absolute top-0 right-0 h-full w-[52%] flex flex-col justify-between shadow-2xl bg-white text-slate-900 text-xs">
          <div className="p-4 bg-[#FEE500] text-slate-900 flex justify-between items-center font-bold text-base">
            <span className="flex items-center gap-1.5"><Settings size={18} /> 설정</span>
            <button onClick={() => setIsSettingsOpen(false)} className="p-1 cursor-pointer"><X size={18} /></button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-5">
            <div className="space-y-2">
              <h4 className="font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 text-xs"><User size={14} /> 계정 설정</h4>
              <button onClick={() => { if (currentUser) { setEditName(currentUser.name); setNewPasswordInput(''); setNewPasswordConfirmInput(''); setIsEditProfileOpen(true); setIsSettingsOpen(false); } }} className="w-full p-2.5 rounded-xl border text-left flex justify-between items-center cursor-pointer bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100">
                <span className="font-normal">내 정보 / 비밀번호 변경</span><ChevronRight size={15} className="text-slate-400" />
              </button>
            </div>
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 text-xs"><Heart size={14} className="text-rose-500" /> 나의 활동</h4>
              <button onClick={() => { setIsFavoritesModalOpen(true); setIsSettingsOpen(false); }} className="w-full p-2.5 rounded-xl border text-left flex justify-between items-center cursor-pointer bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100">
                <span className="font-normal">찜목록</span>
                <div className="flex items-center gap-1"><span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-500 font-medium text-[11px] border border-rose-100/80 flex items-center gap-1"><Heart size={10} className="fill-rose-500" /> {userFavorites.length}</span><ChevronRight size={15} className="text-slate-400" /></div>
              </button>
              <button onClick={() => { setIsMyRatingsModalOpen(true); setIsSettingsOpen(false); }} className="w-full p-2.5 rounded-xl border text-left flex justify-between items-center cursor-pointer bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100">
                <span className="font-normal">내 평점</span>
                <div className="flex items-center gap-1"><span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium text-[11px] border border-amber-200/60 flex items-center gap-1"><Star size={10} className="fill-amber-400 text-amber-400" /> {myRatingGamesList.length}</span><ChevronRight size={15} className="text-slate-400" /></div>
              </button>
            </div>
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 text-xs"><Siren size={14} /> 고객지원</h4>
              <button onClick={() => { setReportForm({ title: '', content: '', category: '' }); setIsReportModalOpen(true); setIsSettingsOpen(false); }} className="w-full p-2.5 rounded-xl border text-left flex justify-between items-center cursor-pointer bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100">
                <span className="font-normal">신고 및 건의</span><ChevronRight size={15} className="text-slate-400" />
              </button>
            </div>
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 text-xs"><Type size={14} /> 글자 크기</h4>
              <div className="flex p-1 rounded-xl bg-slate-100">
                <button onClick={() => setFontSize('normal')} className={`flex-1 py-2 rounded-lg transition text-center cursor-pointer ${fontSize === 'normal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>보통</button>
                <button onClick={() => setFontSize('large')} className={`flex-1 py-2 rounded-lg transition text-center cursor-pointer ${fontSize === 'large' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>크게</button>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button onClick={handleLogout} className="px-3 py-1.5 rounded-xl font-normal transition flex items-center gap-1.5 border border-slate-200 bg-slate-50 text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 cursor-pointer text-xs"><LogOut size={13} /> 로그아웃</button>
            </div>
          </div>
          <div className="p-4 border-t border-slate-200 bg-slate-50"><button onClick={() => setIsSettingsOpen(false)} className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-medium cursor-pointer text-xs">닫기</button></div>
        </div>
      </div>

      {/* 3. 공지사항 목록 */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${isNoticeDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsNoticeDrawerOpen(false)} />
        <div className="absolute top-0 right-0 h-full w-4/5 max-w-sm flex flex-col shadow-2xl bg-white text-slate-900 text-xs">
          <div className="p-4 bg-[#FEE500] text-slate-900 flex justify-between items-center font-bold text-base">
            <span className="flex items-center gap-2"><Bell size={18} /> 공지사항 목록</span>
            <button onClick={() => setIsNoticeDrawerOpen(false)} className="p-1 cursor-pointer"><X size={18} /></button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            <h4 className="font-bold text-slate-400 text-xs">전체 공지 목록 ({notices.length})</h4>
            {notices.map((notice: Notice) => {
              const isExpanded = expandedNoticeId === notice.noticeId;
              return (
                <div key={notice.noticeId} className={`rounded-2xl border overflow-hidden ${isExpanded ? 'border-amber-400 bg-amber-50/60' : 'border-slate-200 bg-white'}`}>
                  <div onClick={() => handleNoticeClick(notice)} className="p-3.5 cursor-pointer flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0"><h3 className="font-extrabold leading-snug break-all text-slate-900 text-xs">{notice.title}</h3><span className="text-slate-400 font-mono mt-1 block text-[10px]">{notice.createdAt}</span></div>
                    <ChevronDown size={18} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180 text-amber-500' : ''}`} />
                  </div>
                  {isExpanded && <div className="px-3.5 pb-4 pt-2 border-t border-slate-200 font-medium leading-relaxed break-all text-slate-600 text-xs"><p className="whitespace-pre-wrap">{notice.content}</p></div>}
                </div>
              );
            })}
          </div>
          <div className="p-4 border-t border-slate-200"><button onClick={() => setIsNoticeDrawerOpen(false)} className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-bold cursor-pointer text-xs">닫기</button></div>
        </div>
      </div>

      {/* 4. 장바구니 드로어 */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
        <div className="absolute top-0 right-0 h-full w-4/5 max-w-sm flex flex-col shadow-2xl bg-white text-slate-900 text-xs">
          <div className="p-4 bg-[#FEE500] text-slate-900 flex justify-between items-center font-bold text-base">
            <span className="flex items-center gap-1.5"><ShoppingCart size={18} /> 장바구니 ({cart.length} / 3)</span>
            <button onClick={() => setIsCartOpen(false)} className="p-1 cursor-pointer"><X size={18} /></button>
          </div>
          <div className="p-4 border-b space-y-2 bg-slate-50 border-slate-200/80">
            <div className="flex justify-between items-center font-bold">
              <span className="flex items-center gap-1.5"><Calendar size={15} /> 대여 기간 설정</span>
              <span className="font-extrabold bg-amber-300/60 text-slate-900 px-2.5 py-0.5 rounded-md text-[11px]">{rentalDays}일 선택</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
              {Array.from({ length: 14 }, (_, i) => i + 1).map((days: number) => (
                <button key={days} onClick={() => setRentalDays(days)} className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${rentalDays === days ? 'bg-slate-900 text-white shadow-sm scale-105' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>{days}일</button>
              ))}
            </div>
            <div className="text-slate-400 font-medium flex justify-between items-center pt-0.5">
              <span>반납 예정일:</span><strong className="text-slate-900 font-extrabold">{calculateEndDate()}</strong>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
            {cart.length === 0 ? <div className="text-center py-16 text-slate-400 font-medium">담긴 보드게임이 없습니다.</div> : cart.map((game: Game) => (
              <div key={game.gameId} className="flex justify-between items-center border p-3.5 rounded-xl shadow-sm bg-white border-slate-200">
                <div><h4 className="font-bold text-slate-900">{game.title}</h4><p className="text-slate-400 mt-0.5 text-[11px]">{game.minPlayers}~{game.maxPlayers}인 | {game.playTime}분</p></div>
                <button onClick={() => removeFromCart(game.gameId)} className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
          <div className="p-4 border-t bg-slate-50 border-slate-200">
            {cart.length > 0 ? <button onClick={processCheckout} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold cursor-pointer">선택한 게임 {rentalDays}일간 대여하기</button> : <button onClick={() => setIsCartOpen(false)} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold cursor-pointer">닫기</button>}
          </div>
        </div>
      </div>

      {/* 모달 모음 */}
      {isFavoritesModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl border max-h-[85vh] flex flex-col bg-white border-slate-100 text-slate-900 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/20">
              <h3 className="font-extrabold text-base flex items-center gap-2"><Heart size={18} className="text-rose-500 fill-rose-500" /> 찜한 보드게임 ({favoriteGamesList.length})</h3>
              <button onClick={() => setIsFavoritesModalOpen(false)} className="text-slate-400 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {favoriteGamesList.length === 0 ? <div className="text-center py-12 text-slate-400">찜한 보드게임이 없습니다.</div> : favoriteGamesList.map(game => (
                <div key={game.gameId} className="p-3 rounded-2xl border flex items-center justify-between gap-3 shadow-sm bg-slate-50 border-slate-200">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img src={game.imageUrl} alt={game.title} className="w-12 h-12 object-cover rounded-xl bg-white border border-slate-200 flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=300'; }} />
                    <div className="min-w-0 flex-1"><h4 className="font-bold truncate text-slate-900">{game.title}</h4></div>
                  </div>
                  <button onClick={() => toggleFavorite(game.gameId)} className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-xl transition cursor-pointer"><Heart size={16} className="fill-rose-500" /></button>
                </div>
              ))}
            </div>
            <button onClick={() => setIsFavoritesModalOpen(false)} className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-bold cursor-pointer">닫기</button>
          </div>
        </div>
      )}

      {isMyRatingsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl border max-h-[85vh] flex flex-col bg-white border-slate-100 text-slate-900 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/20">
              <h3 className="font-extrabold text-base flex items-center gap-2"><Star size={18} className="text-rose-500 fill-rose-500" /> 내가 평가한 보드게임 ({myRatingGamesList.length})</h3>
              <button onClick={() => setIsMyRatingsModalOpen(false)} className="text-slate-400 cursor-pointer"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {myRatingGamesList.length === 0 ? <div className="text-center py-12 text-slate-400">평가를 남긴 보드게임이 없습니다.</div> : myRatingGamesList.map((game: any) => (
                <div key={game.gameId} className="p-3 rounded-2xl border flex items-center justify-between gap-3 shadow-sm bg-slate-50 border-slate-200">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={game.imageUrl} alt={game.title} className="w-11 h-11 object-cover rounded-xl bg-white border border-slate-200 flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=300'; }} />
                    <div className="min-w-0"><h4 className="font-bold truncate text-slate-900">{game.title}</h4><span className="text-rose-500 font-extrabold">{game.myScore?.toFixed(1)}점</span></div>
                  </div>
                  <button onClick={() => handleDeleteMyRating(game.gameId)} className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <button onClick={() => setIsMyRatingsModalOpen(false)} className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-bold cursor-pointer">닫기</button>
          </div>
        </div>
      )}

      {ratingModalGame && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl w-full max-w-xs p-5 space-y-4 shadow-2xl border text-center bg-white border-slate-100 text-slate-900 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/20">
              <h3 className="font-extrabold truncate flex items-center gap-1.5"><Star size={16} className="text-rose-500 fill-rose-500" /> 나의 평점 등록/수정</h3>
              <button onClick={() => setRatingModalGame(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            <div className="space-y-2">
              <h4 className="font-extrabold text-base text-slate-900">{ratingModalGame.title}</h4>
              <p className="text-slate-400">별점을 선택해 주세요.</p>
              <div className="py-2"><span className="text-3xl font-black text-rose-500">{selectedScore.toFixed(1)}</span><span className="text-slate-400 font-bold text-sm"> / 5.0</span></div>
              <div className="flex justify-center pb-2"><StarRating rating={selectedScore} size={28} colorClass="text-rose-500" /></div>
              <input type="range" min="0.5" max="5.0" step="0.5" value={selectedScore} onChange={(e) => setSelectedScore(Number(e.target.value))} className="w-full accent-rose-500 cursor-pointer" />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setRatingModalGame(null)} className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-bold cursor-pointer">취소</button>
              <button type="button" onClick={handleSaveRating} className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl font-bold cursor-pointer">평점 저장</button>
            </div>
          </div>
        </div>
      )}

      {/* 신고/건의 모달 */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl border bg-white border-slate-100 text-slate-900 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/20">
              <h3 className="font-extrabold text-base flex items-center gap-2"><Siren size={18} className="text-rose-600" /> 신고 및 건의하기</h3>
              <button onClick={() => setIsReportModalOpen(false)} className="text-slate-400 cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleSendReport} className="space-y-3.5">
              <div>
                <label className="font-bold block mb-1.5">카테고리 선택</label>
                <select value={reportForm.category} onChange={(e) => setReportForm({ ...reportForm, category: e.target.value })} className="w-full border border-slate-200 p-2.5 rounded-xl text-slate-900 cursor-pointer">
                  <option value="">선택</option>
                  <option value="보드게임 분실/누락">보드게임 분실/누락</option>
                  <option value="장애/오류 신고">장애/오류 신고</option>
                  <option value="이용제한 문의">이용제한 문의</option>
                  <option value="개선사항 건의">개선사항 건의</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              <div><label className="font-bold block mb-1.5">제목</label><input type="text" required placeholder="제목을 입력해 주세요" value={reportForm.title} onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })} className="w-full border border-slate-200 p-2.5 rounded-xl text-slate-900" /></div>
              <div><label className="font-bold block mb-1.5">상세 내용</label><textarea required rows={5} placeholder="내용을 작성해 주세요." value={reportForm.content} onChange={(e) => setReportForm({ ...reportForm, content: e.target.value })} className="w-full border border-slate-200 p-2.5 rounded-xl text-slate-900 resize-none"></textarea></div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setIsReportModalOpen(false)} className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-bold cursor-pointer">취소</button>
                <button type="submit" className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl font-bold cursor-pointer">제출하기</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 프로필 수정 모달 */}
      {isEditProfileOpen && currentUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl border bg-white border-slate-100 text-slate-900 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/20">
              <h3 className="font-extrabold text-base flex items-center gap-2"><User size={18} /> 내 정보 / 비밀번호 변경</h3>
              <button onClick={() => setIsEditProfileOpen(false)} className="text-slate-400 cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div><label className="font-bold block mb-1 text-slate-400">아이디 (LDAP)</label><input type="text" disabled value={currentUser.userId} className="w-full border border-slate-200 p-2.5 rounded-xl font-mono bg-slate-100 text-slate-500" /></div>
              <div><label className="font-bold block mb-1 text-slate-400">이메일</label><input type="text" disabled value={currentUser.email} className="w-full border border-slate-200 p-2.5 rounded-xl bg-slate-100 text-slate-500" /></div>
              <div><label className="font-bold block mb-1">이름</label><input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-xl text-slate-900" /></div>
              <div className="pt-2 border-t border-slate-200/20 space-y-2">
                <label className="font-bold block text-slate-400">비밀번호 변경 (선택)</label>
                <input type="password" placeholder="새 비밀번호 입력" value={changePassword} onChange={(e) => setNewPasswordInput(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-xl text-slate-900" />
                <input type="password" placeholder="새 비밀번호 재입력" value={changePasswordConfirm} onChange={(e) => setNewPasswordConfirmInput(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-xl text-slate-900" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setIsEditProfileOpen(false)} className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-bold cursor-pointer">취소</button>
                <button type="submit" className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl font-bold cursor-pointer">저장하기</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 게임 등록/수정 모달 */}
      {isGameModalOpen && editingGame && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl w-full max-w-sm p-5 space-y-3.5 max-h-[90vh] overflow-y-auto shadow-2xl border bg-white border-slate-100 text-slate-900 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/20">
              <h3 className="font-extrabold text-base">{isEditingMode ? '게임 정보 수정' : '신규 게임 등록'}</h3>
              <button onClick={() => setIsGameModalOpen(false)} className="text-slate-400 cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={saveGame} className="space-y-3">
              <div><label className="font-bold block mb-1 flex items-center gap-1"><Image size={13} /> 이미지 URL</label><input type="url" placeholder="https://example.com/image.jpg" value={editingGame.imageUrl} onChange={(e) => setEditingGame({ ...editingGame, imageUrl: e.target.value })} className="w-full border border-slate-200 p-2.5 rounded-xl text-slate-900" /></div>
              <div className="flex gap-2">
                <div className="w-[35%]"><label className="font-bold block mb-1">보드게임 ID</label><input type="text" required disabled={isEditingMode} value={editingGame.gameId} onChange={(e) => setEditingGame({ ...editingGame, gameId: e.target.value })} className="w-full border border-slate-200 p-2.5 rounded-xl font-bold text-slate-900 disabled:bg-slate-100" /></div>
                <div className="w-[65%]"><label className="font-bold block mb-1">게임명</label><input type="text" required value={editingGame.title} onChange={(e) => setEditingGame({ ...editingGame, title: e.target.value })} className="w-full border border-slate-200 p-2.5 rounded-xl text-slate-900" /></div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div><label className="font-bold block mb-1">출시년도</label><input type="number" required value={editingGame.releaseYear} onChange={(e) => setEditingGame({ ...editingGame, releaseYear: Number(e.target.value) })} className="w-full border border-slate-200 p-2.5 rounded-xl text-slate-900" /></div>
                <div><label className="font-bold block mb-1">플레이타임</label><input type="number" required value={editingGame.playTime} onChange={(e) => setEditingGame({ ...editingGame, playTime: Number(e.target.value) })} className="w-full border border-slate-200 p-2.5 rounded-xl text-slate-900" /></div>
                <div><label className="font-bold block mb-1">난이도</label><input type="number" step="0.01" min="1.0" max="5.0" required value={editingGame.difficulty} onChange={(e) => setEditingGame({ ...editingGame, difficulty: Number(e.target.value) })} className="w-full border border-slate-200 p-2.5 rounded-xl text-slate-900" /></div>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                <div><label className="font-bold block mb-1 text-[11px]">최소인원</label><input type="number" min="1" required value={editingGame.minPlayers} onChange={(e) => setEditingGame({ ...editingGame, minPlayers: Number(e.target.value) })} className="w-full border border-slate-200 p-2 rounded-xl text-slate-900" /></div>
                <div><label className="font-bold block mb-1 text-[11px]">최대인원</label><input type="number" min="1" required value={editingGame.maxPlayers} onChange={(e) => setEditingGame({ ...editingGame, maxPlayers: Number(e.target.value) })} className="w-full border border-slate-200 p-2 rounded-xl text-slate-900" /></div>
                <div><label className="font-bold block mb-1 text-[11px]">BGG평점</label><input type="number" step="0.1" min="0" max="10" required value={editingGame.bggRating} onChange={(e) => setEditingGame({ ...editingGame, bggRating: Number(e.target.value) })} className="w-full border border-slate-200 p-2 rounded-xl text-slate-900" /></div>
                <div>
                  <label className="font-bold block mb-1 text-[11px]">노출여부</label>
                  <select value={editingGame.isVisible} onChange={(e) => setEditingGame({ ...editingGame, isVisible: e.target.value as 'Y' | 'N' })} className="w-full border border-slate-200 p-2 rounded-xl bg-slate-50 text-slate-900 font-semibold cursor-pointer">
                    <option value="Y">노출</option><option value="N">숨김</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center"><label className="font-bold block">장르 선택 (최대 4개)</label><span className="text-[11px] font-extrabold text-amber-600">{(editingGame.genres || []).length} / 4개</span></div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {AVAILABLE_GENRES.map(genre => {
                    const isSelected = (editingGame.genres || []).includes(genre);
                    return (<button key={genre} type="button" onClick={() => toggleGenreSelection(genre)} className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer ${isSelected ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>{genre}</button>);
                  })}
                </div>
              </div>
              <div className="flex gap-2 pt-2"><button type="button" onClick={() => setIsGameModalOpen(false)} className="flex-1 bg-slate-100 py-2.5 rounded-xl font-bold text-slate-700 cursor-pointer">취소</button><button type="submit" className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl font-bold cursor-pointer">저장</button></div>
            </form>
          </div>
        </div>
      )}

      {/* 공지 작성 모달 */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl w-full max-w-sm p-5 space-y-3.5 shadow-2xl border bg-white border-slate-100 text-slate-900 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/20"><h3 className="font-extrabold text-base">{editingNotice.id ? '공지사항 수정' : '공지사항 작성'}</h3><button onClick={() => setIsNoticeModalOpen(false)} className="text-slate-400 cursor-pointer"><X size={18} /></button></div>
            <form onSubmit={saveNotice} className="space-y-3">
              <div><label className="font-bold block mb-1">공지 제목</label><input type="text" required value={editingNotice.title} onChange={(e) => setEditingNotice({ ...editingNotice, title: e.target.value })} className="w-full border border-slate-200 p-2.5 rounded-xl text-slate-900" /></div>
              <div><label className="font-bold block mb-1">공지 내용</label><textarea required rows={4} value={editingNotice.content} onChange={(e) => setEditingNotice({ ...editingNotice, content: e.target.value })} className="w-full border border-slate-200 p-2.5 rounded-xl text-slate-900 resize-none"></textarea></div>
              <div className="flex gap-2 pt-2"><button type="button" onClick={() => setIsNoticeModalOpen(false)} className="flex-1 bg-slate-100 py-2.5 rounded-xl font-bold text-slate-700 cursor-pointer">취소</button><button type="submit" className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl font-bold cursor-pointer">저장</button></div>
            </form>
          </div>
        </div>
      )}

      {/* 추천 사이트 등록 모달 */}
      {isSiteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl w-full max-w-sm p-5 space-y-3.5 shadow-2xl border bg-white border-slate-100 text-slate-900 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/20"><h3 className="font-extrabold text-base">{editingSite.siteId > 0 ? '추천 사이트 수정' : '추천 사이트 등록'}</h3><button onClick={() => setIsSiteModalOpen(false)} className="text-slate-400 cursor-pointer"><X size={18} /></button></div>
            <form onSubmit={saveSite} className="space-y-3">
              <div><label className="font-bold block mb-1">사이트명</label><input type="text" required value={editingSite.name} onChange={(e) => setEditingSite({ ...editingSite, name: e.target.value })} className="w-full border border-slate-200 p-2.5 rounded-xl text-slate-900" /></div>
              <div><label className="font-bold block mb-1">사이트 URL</label><input type="url" required value={editingSite.url} onChange={(e) => setEditingSite({ ...editingSite, url: e.target.value })} className="w-full border border-slate-200 p-2.5 rounded-xl text-slate-900" /></div>
              <div><label className="font-bold block mb-1">배너 이미지 URL</label><input type="url" placeholder="https://example.com/banner.jpg" value={editingSite.bannerUrl} onChange={(e) => setEditingSite({ ...editingSite, bannerUrl: e.target.value })} className="w-full border border-slate-200 p-2.5 rounded-xl text-slate-900" /></div>
              <div><label className="font-bold block mb-1">사이트 설명</label><textarea rows={3} value={editingSite.description} onChange={(e) => setEditingSite({ ...editingSite, description: e.target.value })} className="w-full border border-slate-200 p-2.5 rounded-xl text-slate-900 resize-none"></textarea></div>
              <div>
                <label className="font-bold block mb-1">노출 여부</label>
                <select value={editingSite.isVisible} onChange={(e) => setEditingSite({ ...editingSite, isVisible: e.target.value as 'Y' | 'N' })} className="w-full border border-slate-200 p-2.5 rounded-xl bg-slate-50 text-slate-900 font-semibold cursor-pointer">
                  <option value="Y">노출</option><option value="N">숨김</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2"><button type="button" onClick={() => setIsSiteModalOpen(false)} className="flex-1 bg-slate-100 py-2.5 rounded-xl font-bold text-slate-700 cursor-pointer">취소</button><button type="submit" className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl font-bold cursor-pointer">저장</button></div>
            </form>
          </div>
        </div>
      )}

      <FixedBottomNav isIosDevice={isIosDevice} activeTab={activeTab} isAdmin={isAdmin} unreadReportsCount={unreadReportsCount} handleTabChange={handleTabChange} />
    </div>
  );
}