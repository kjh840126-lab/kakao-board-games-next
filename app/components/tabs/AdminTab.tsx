'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import { Game, UserData, Rental, BoardSite, Notice } from '../../types';
import { supabase } from '../../supabaseClient';
import { 
  Search, Plus, Edit, Trash2, CheckCircle2, UserX, UserCheck, 
  ShieldAlert, AlertTriangle, Eye, EyeOff, RotateCcw, ShieldCheck, 
  Shield, User, Loader2, ChevronUp, ChevronDown 
} from 'lucide-react';

type AdminSubTabType = 'gameAdmin' | 'rentalAdmin' | 'siteAdmin' | 'userAdmin' | 'noticeAdmin';

// ⚡ 순수 YYYY-MM-DD 10자리만 정제 추출
const toPureDateStr = (dateStr: string | null | undefined) => {
  if (!dateStr) return '';
  return String(dateStr).split('T')[0].split(' ')[0].substring(0, 10);
};

// ⚡ 8/24 - 8/20 = 정확히 4일이 산출되는 자정 기준 연체 일수 계산 함수
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

export const AdminTab = memo(({
  isInitialLoaded, games, users, rentals, sites, notices, currentUser,
  setIsEditingMode, setEditingGame, setIsGameModalOpen, deleteGame,
  setEditingSite, setIsSiteModalOpen, deleteSite, handleUserRoleChange,
  setEditingNotice, setIsNoticeModalOpen, deleteNotice,
  returnGame
}: any) => {
  const [adminSubTab, setAdminSubTab] = useState<AdminSubTabType>(() => {
    if (typeof window !== 'undefined') {
      const savedSubTab = localStorage.getItem('kakao_bg_adminSubTab');
      if (savedSubTab && ['gameAdmin', 'rentalAdmin', 'siteAdmin', 'userAdmin', 'noticeAdmin'].includes(savedSubTab)) {
        return savedSubTab as AdminSubTabType;
      }
    }
    return 'gameAdmin';
  });

  const [adminRentalTab, setAdminRentalTab] = useState<'active' | 'completed'>('active');
  const [gameAdminSearch, setGameAdminSearch] = useState('');
  const [userAdminSearch, setUserAdminSearch] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleSubTabChange = (newSubTab: AdminSubTabType) => {
    setAdminSubTab(newSubTab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kakao_bg_adminSubTab', newSubTab);
    }
  };

  const toggleGameVisibility = async (game: Game) => {
    const nextStatus = game.isVisible === 'N' ? 'Y' : 'N';
    const { error } = await supabase.from('games').update({ is_visible: nextStatus }).eq('game_id', game.gameId);
    if (error) {
      alert('게임 노출 상태 변경 실패: ' + error.message);
    } else {
      window.location.reload();
    }
  };

  const toggleSiteVisibility = async (site: BoardSite) => {
    const nextStatus = site.isVisible === 'N' ? 'Y' : 'N';
    const { error } = await supabase.from('sites').update({ is_visible: nextStatus }).eq('site_id', site.siteId);
    if (error) {
      alert('사이트 노출 상태 변경 실패: ' + error.message);
    } else {
      window.location.reload();
    }
  };

  const toggleNoticeVisibility = async (notice: Notice) => {
    const nextStatus = (notice as any).isVisible === 'N' ? 'Y' : 'N';
    const { error } = await supabase.from('notices').update({ is_visible: nextStatus }).eq('notice_id', notice.noticeId);
    if (error) {
      alert('공지사항 상태 변경 실패: ' + error.message);
    } else {
      window.location.reload();
    }
  };

  const moveSiteOrder = async (currentIndex: number, direction: 'up' | 'down') => {
    if (!sites || sites.length <= 1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sites.length) return;

    const currentSite = sites[currentIndex];
    const targetSite = sites[targetIndex];

    try {
      const currentOrder = currentSite.displayOrder ?? currentSite.siteId;
      const targetOrder = targetSite.displayOrder ?? targetSite.siteId;

      await Promise.all([
        supabase.from('sites').update({ display_order: targetOrder }).eq('site_id', currentSite.siteId),
        supabase.from('sites').update({ display_order: currentOrder }).eq('site_id', targetSite.siteId),
      ]);

      window.location.reload();
    } catch (err: any) {
      alert('순서 변경 중 오류가 발생했습니다: ' + (err.message || err));
    }
  };

  const filteredGameAdminList = useMemo(() => (games || []).filter((g: Game) => g.title.toLowerCase().includes(gameAdminSearch.trim().toLowerCase())).sort((a: any, b: any) => b.gameId.localeCompare(a.gameId, undefined, { numeric: true })), [games, gameAdminSearch]);
  const filteredUserAdminList = useMemo(() => (users || []).sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt)).filter((u: UserData) => u.name.toLowerCase().includes(userAdminSearch.trim().toLowerCase()) || u.userId.toLowerCase().includes(userAdminSearch.trim().toLowerCase())), [users, userAdminSearch]);

  // ⚡ 대여중 목록: 대여일(startDate) 기준 내림차순(최신순) 정렬
  const activeRentalsAdminList = useMemo(() => 
    (rentals || [])
      .filter((r: Rental) => r.status === '대여중')
      .sort((a: any, b: any) => b.startDate.localeCompare(a.startDate)), 
    [rentals]
  );

  // ⚡ 반납완료 목록: 대여일(startDate) 기준 내림차순(최신순) 정렬
  const allReturnedRentalsAdminList = useMemo(() => 
    (rentals || [])
      .filter((r: Rental) => r.status === '반납완료')
      .sort((a: any, b: any) => b.startDate.localeCompare(a.startDate)), 
    [rentals]
  );

  const handleAdminReturn = (rental: any) => {
    if (window.confirm(`'${rental.gameTitle}' (${rental.userId} 대여) 건을 강제 반납 처리하시겠습니까?`)) {
      returnGame(rental.rentalId, rental.gameId);
    }
  };

  const isMaster = (currentUser?.role as string) === '마스터';

  return (
    <div className="space-y-4 mt-0.5 w-full">
      {/* 관리자 서브 탭 네비게이션 */}
      <div className="grid grid-cols-5 gap-1 p-1 rounded-xl font-bold w-full bg-slate-100 dark:bg-slate-800/80 mb-4">
        <button onClick={() => handleSubTabChange('gameAdmin')} className={`py-2.5 px-1 rounded-lg transition text-center whitespace-nowrap text-xs font-bold cursor-pointer ${adminSubTab === 'gameAdmin' ? 'bg-slate-900 text-white dark:bg-sky-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>게임관리</button>
        <button onClick={() => handleSubTabChange('rentalAdmin')} className={`py-2.5 px-1 rounded-lg transition text-center whitespace-nowrap text-xs font-bold cursor-pointer ${adminSubTab === 'rentalAdmin' ? 'bg-slate-900 text-white dark:bg-sky-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>대여/반납</button>
        <button onClick={() => handleSubTabChange('siteAdmin')} className={`py-2.5 px-1 rounded-lg transition text-center whitespace-nowrap text-xs font-bold cursor-pointer ${adminSubTab === 'siteAdmin' ? 'bg-slate-900 text-white dark:bg-sky-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>사이트관리</button>
        <button onClick={() => handleSubTabChange('userAdmin')} className={`py-2.5 px-1 rounded-lg transition text-center whitespace-nowrap text-xs font-bold cursor-pointer ${adminSubTab === 'userAdmin' ? 'bg-slate-900 text-white dark:bg-sky-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>회원관리</button>
        <button onClick={() => handleSubTabChange('noticeAdmin')} className={`py-2.5 px-1 rounded-lg transition text-center whitespace-nowrap text-xs font-bold cursor-pointer ${adminSubTab === 'noticeAdmin' ? 'bg-slate-900 text-white dark:bg-sky-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>공지사항</button>
      </div>

      {/* A. 게임관리 */}
      {adminSubTab === 'gameAdmin' && (
        <div className="space-y-4 w-full min-h-[200px] relative">
          <div className="flex justify-between items-center h-10 pb-2 border-b border-slate-200/80 dark:border-slate-700/80">
            <h2 className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white"><span className="w-2 h-4 bg-sky-400 border border-sky-500 rounded-sm inline-block"></span> 게임 등록 및 수정</h2>
            <button onClick={() => { setIsEditingMode(false); setEditingGame({ gameId: '', title: '', status: '대여가능', minPlayers: 2, maxPlayers: 4, playTime: 30, difficulty: 2.0, imageUrl: '', description: '', isVisible: 'Y', genres: ['전략게임'], createdAt: new Date().toISOString(), releaseYear: new Date().getFullYear(), bggRating: 7.0 }); setIsGameModalOpen(true); }} className="bg-slate-900 text-white dark:bg-sky-500 dark:hover:bg-sky-600 font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-slate-800">
              <Plus size={14} /> 게임 등록
            </button>
          </div>
          <div className="relative w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="관리할 게임명 검색..." value={gameAdminSearch} onChange={(e) => setGameAdminSearch(e.target.value)} className="w-full border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 pl-10 pr-9 py-2.5 rounded-xl text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>

          <div className="space-y-2.5 w-full">
            {!isInitialLoaded ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
                <Loader2 size={20} className="animate-spin text-slate-500" />
                <span className="text-[11px] font-medium text-slate-400">게임 목록을 불러오는 중...</span>
              </div>
            ) : filteredGameAdminList.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-300/40 text-slate-400 rounded-2xl w-full text-xs">
                등록되거나 검색된 보드게임이 없습니다.
              </div>
            ) : (
              filteredGameAdminList.map((game: Game) => {
                const isVisible = game.isVisible === 'Y';
                return (
                  <div key={game.gameId} className="w-full border border-slate-200 p-3.5 rounded-2xl flex justify-between items-center bg-white text-slate-900 shadow-sm dark:bg-slate-800/60 dark:border-slate-700 dark:text-white">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <img src={game.imageUrl} alt={game.title} className="w-12 h-12 object-cover rounded-xl bg-slate-100 flex-shrink-0 border border-slate-200 dark:bg-slate-800 dark:border-slate-700" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=300'; }} />
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <h4 className="font-bold text-xs break-all whitespace-normal leading-snug text-slate-900 dark:text-white">
                          {game.title} <span className="text-slate-400 font-normal">({game.gameId})</span>
                        </h4>
                        
                        <p className="text-slate-500 dark:text-slate-400 text-xs leading-tight">
                          {game.releaseYear}년 출시 | 난이도 {Number(game.difficulty).toFixed(2)} | {game.playTime}분
                        </p>
                        
                        <p className="text-slate-500 dark:text-slate-400 text-xs leading-tight">
                          인원 {game.minPlayers}~{game.maxPlayers} | BGG 평점 {game.bggRating}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <button 
                        onClick={() => toggleGameVisibility(game)} 
                        className="p-1 cursor-pointer" 
                        title={isVisible ? "현재 노출 상태 (클릭 시 숨김)" : "현재 미노출 상태 (클릭 시 노출)"}
                      >
                        {isVisible ? (
                          <Eye size={16} className="text-emerald-500 hover:text-emerald-600" />
                        ) : (
                          <EyeOff size={16} className="text-slate-300 hover:text-slate-500" />
                        )}
                      </button>
                      <button onClick={() => { setIsEditingMode(true); setEditingGame(game); setIsGameModalOpen(true); }} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer" title="게임 수정">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => deleteGame(game.gameId, game.title, game.status)} className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer" title="게임 삭제">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* B. 대여/반납 현황 */}
      {adminSubTab === 'rentalAdmin' && (
        <div className="space-y-4 w-full min-h-[200px] relative">
          <div className="flex justify-between items-center h-10 pb-2 border-b border-slate-200/80 dark:border-slate-700/80">
            <h2 className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white"><span className="w-2 h-4 bg-sky-400 border border-sky-500 rounded-sm inline-block"></span> 대여 및 반납 현황</h2>
          </div>
          <div className="flex p-1 rounded-xl font-bold w-full bg-slate-100 dark:bg-slate-800">
            <button onClick={() => setAdminRentalTab('active')} className={`flex-1 py-2 rounded-lg text-xs cursor-pointer ${adminRentalTab === 'active' ? 'bg-white text-slate-900 dark:bg-slate-700 dark:text-white shadow-sm' : 'text-slate-400'}`}>대여중 ({activeRentalsAdminList.length})</button>
            <button onClick={() => setAdminRentalTab('completed')} className={`flex-1 py-2 rounded-lg text-xs cursor-pointer ${adminRentalTab === 'completed' ? 'bg-white text-slate-900 dark:bg-slate-700 dark:text-white shadow-sm' : 'text-slate-400'}`}>반납완료 ({allReturnedRentalsAdminList.length})</button>
          </div>

          {!isInitialLoaded ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
              <Loader2 size={20} className="animate-spin text-slate-500" />
              <span className="text-[11px] font-medium text-slate-400">대여/반납 데이터를 불러오는 중...</span>
            </div>
          ) : adminRentalTab === 'active' ? (
            <div className="space-y-3 w-full">
              {activeRentalsAdminList.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-300/40 text-slate-400 rounded-2xl w-full text-xs">
                  현재 대여 중인 내역이 없습니다.
                </div>
              ) : (
                activeRentalsAdminList.map((rental: any) => {
                  const cleanEndDate = toPureDateStr(rental.endDate);
                  const isOverdue = today > cleanEndDate;
                  const overdueDays = isOverdue ? getDaysDifference(today, cleanEndDate) : 0;
                  return (
                    <div key={rental.rentalId} className={`w-full p-4 rounded-2xl border shadow-sm space-y-3 ${isOverdue ? 'border-rose-300 bg-rose-50/30 dark:bg-rose-950/20 dark:border-rose-800' : 'border-slate-200 bg-white dark:bg-slate-800/60 dark:border-slate-700'}`}>
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <p className="text-xs text-slate-400 font-medium">대여회원: <strong className="text-slate-900 dark:text-white font-bold">{rental.userId}</strong></p>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-snug">{rental.gameTitle} <span className="text-slate-400 font-normal">({rental.gameId})</span></h4>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {isOverdue && (
                            <span className="bg-rose-600 text-white px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm">
                              <AlertTriangle size={11} /> 연체 ({overdueDays}일)
                            </span>
                          )}
                          <button 
                            onClick={() => handleAdminReturn(rental)}
                            className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl cursor-pointer flex items-center gap-1 transition-colors shadow-sm dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                            title="관리자 강제 반납 처리"
                          >
                            <RotateCcw size={12} /> 반납
                          </button>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                        <span>대여일: {toPureDateStr(rental.startDate)}</span>
                        <span>반납예정일: <strong className={isOverdue ? "text-rose-600 dark:text-rose-400 font-bold" : "text-slate-900 dark:text-white font-bold"}>{cleanEndDate}</strong></span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="space-y-3 w-full">
              {allReturnedRentalsAdminList.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-300/40 text-slate-400 rounded-2xl w-full text-xs">
                  반납 완료 내역이 없습니다.
                </div>
              ) : (
                allReturnedRentalsAdminList.map((rental: any) => {
                  const cleanEndDate = toPureDateStr(rental.endDate);
                  const returnedDate = toPureDateStr(rental.returnedAt) || toPureDateStr(rental.startDate);
                  const isOverdueReturned = returnedDate > cleanEndDate;
                  const overdueDays = isOverdueReturned ? getDaysDifference(returnedDate, cleanEndDate) : 0;

                  return (
                    <div key={rental.rentalId} className="w-full p-4 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3 dark:bg-slate-800/60 dark:border-slate-700">
                      <div className="space-y-0.5">
                        <p className="text-xs text-slate-400 font-medium">대여회원: <strong className="text-slate-900 dark:text-white font-bold">{rental.userId}</strong></p>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-500" /> {rental.gameTitle} <span className="text-slate-400 font-normal">({rental.gameId})</span></h4>
                      </div>
                      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                        <span>대여일: {toPureDateStr(rental.startDate)}</span>
                        <span>
                          반납일: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{returnedDate}</strong>
                          {isOverdueReturned && (
                            <span className="text-rose-600 dark:text-rose-400 font-bold ml-1">(연체 {overdueDays}일)</span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* C. 추천 사이트 관리 */}
      {adminSubTab === 'siteAdmin' && (
        <div className="space-y-4 w-full min-h-[200px] relative">
          <div className="flex justify-between items-center h-10 pb-2 border-b border-slate-200/80 dark:border-slate-700/80">
            <h2 className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white"><span className="w-2 h-4 bg-sky-400 border border-sky-500 rounded-sm inline-block"></span> 추천 사이트 관리</h2>
            <button onClick={() => { setEditingSite({ siteId: 0, name: '', url: '', bannerUrl: '', description: '', isVisible: 'Y' }); setIsSiteModalOpen(true); }} className="bg-slate-900 text-white dark:bg-sky-500 dark:hover:bg-sky-600 font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-slate-800">
              <Plus size={14} /> 사이트 추가
            </button>
          </div>

          <div className="space-y-3 w-full">
            {!isInitialLoaded ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
                <Loader2 size={20} className="animate-spin text-slate-500" />
                <span className="text-[11px] font-medium text-slate-400">사이트 목록을 불러오는 중...</span>
              </div>
            ) : (sites || []).length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-300/40 text-slate-400 rounded-2xl w-full text-xs">
                등록된 추천 사이트가 없습니다.
              </div>
            ) : (
              (sites || []).map((s: BoardSite, index: number) => {
                const isVisible = s.isVisible === 'Y';
                const isFirst = index === 0;
                const isLast = index === (sites || []).length - 1;

                return (
                  <div key={s.siteId} className="w-full border border-slate-200 p-4 rounded-2xl bg-white text-slate-900 shadow-sm dark:bg-slate-800/60 dark:border-slate-700 dark:text-white">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-xs text-slate-900 dark:text-white leading-tight flex-1">{s.name}</h3>
                      
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => moveSiteOrder(index, 'up')}
                          disabled={isFirst}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="위로 이동"
                        >
                          <ChevronUp size={16} />
                        </button>

                        <button
                          onClick={() => moveSiteOrder(index, 'down')}
                          disabled={isLast}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                          title="아래로 이동"
                        >
                          <ChevronDown size={16} />
                        </button>

                        <div className="w-[1px] h-3 bg-slate-200 dark:bg-slate-700 mx-0.5" />

                        <button 
                          onClick={() => toggleSiteVisibility(s)} 
                          className="p-1 cursor-pointer" 
                          title={isVisible ? "현재 노출 상태 (클릭 시 숨김)" : "현재 미노출 상태 (클릭 시 노출)"}
                        >
                          {isVisible ? (
                            <Eye size={16} className="text-emerald-500 hover:text-emerald-600" />
                          ) : (
                            <EyeOff size={16} className="text-slate-300 hover:text-slate-500" />
                          )}
                        </button>

                        <button 
                          onClick={() => { setEditingSite(s); setIsSiteModalOpen(true); }} 
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          title="사이트 수정"
                        >
                          <Edit size={16} />
                        </button>

                        <button 
                          onClick={() => deleteSite(s.siteId, s.name)} 
                          className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                          title="사이트 삭제"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {s.url && (
                      <p className="text-xs text-slate-400 font-normal break-all my-0.5 leading-snug">{s.url}</p>
                    )}

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug font-medium mt-1">
                      {s.description}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* D. 회원 관리 */}
      {adminSubTab === 'userAdmin' && (
        <div className="space-y-4 w-full min-h-[200px] relative">
          <div className="flex justify-between items-center h-10 pb-2 border-b border-slate-200/80 dark:border-slate-700/80">
            <h2 className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white"><span className="w-2 h-4 bg-sky-400 border border-sky-500 rounded-sm inline-block"></span> 회원 관리</h2>
          </div>
          <div className="relative w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="회원명 또는 ID 검색..." value={userAdminSearch} onChange={(e) => setUserAdminSearch(e.target.value)} className="w-full border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 pl-10 pr-9 py-2.5 rounded-xl text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          
          <div className="space-y-3 w-full">
            {!isInitialLoaded ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
                <Loader2 size={20} className="animate-spin text-slate-500" />
                <span className="text-[11px] font-medium text-slate-400">회원 목록을 불러오는 중...</span>
              </div>
            ) : filteredUserAdminList.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-300/40 text-slate-400 rounded-2xl w-full text-xs">
                검색되거나 등록된 회원이 없습니다.
              </div>
            ) : (
              filteredUserAdminList.map((u: UserData) => {
                const roleStr = u.role as string;
                const isMasterRole = roleStr === '마스터';
                const isAdminRole = roleStr === '관리자';
                const isUserRole = roleStr === '일반회원';
                const isQuitRole = roleStr === '탈퇴회원' || roleStr === '탈퇴';
                const penaltyScore = Number(u.penaltyPoints || 0);

                return (
                  <div key={u.userId} className="w-full border border-slate-200 p-4 rounded-2xl bg-white text-slate-900 shadow-sm space-y-2.5 dark:bg-slate-800/60 dark:border-slate-700 dark:text-white">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700/60">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{u.userId}</span>
                          
                          {isMasterRole && (
                            <span className="px-2 py-0.5 rounded-md font-extrabold text-[10px] bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                              <ShieldCheck size={11} className="fill-purple-500" /> 마스터
                            </span>
                          )}
                          {isAdminRole && (
                            <span className="px-2 py-0.5 rounded-md font-extrabold text-[10px] bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                              <Shield size={11} className="fill-amber-500" /> 관리자
                            </span>
                          )}
                          {isUserRole && (
                            <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600">
                              <User size={11} /> 일반회원
                            </span>
                          )}
                          {isQuitRole && (
                            <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                              <UserX size={11} /> 탈퇴회원
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-xs">{u.name} | {u.email}</p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {isMaster && isAdminRole && (
                          <button 
                            onClick={() => handleUserRoleChange(u, '일반회원')} 
                            className="p-2 text-slate-700 bg-slate-100 rounded-xl cursor-pointer border border-slate-200 hover:bg-slate-200 flex items-center justify-center transition shadow-sm dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600"
                            title="일반회원으로 전환"
                          >
                            <UserCheck size={16} className="text-slate-600 dark:text-slate-300" />
                          </button>
                        )}

                        {isMaster && isUserRole && (
                          <button 
                            onClick={() => handleUserRoleChange(u, '관리자')} 
                            className="p-2 text-amber-800 bg-amber-50 rounded-xl cursor-pointer border border-amber-300/80 hover:bg-amber-100 flex items-center justify-center transition shadow-sm"
                            title="관리자로 지정"
                          >
                            <ShieldCheck size={16} className="text-amber-600" />
                          </button>
                        )}

                        {isUserRole && (
                          <button 
                            onClick={() => handleUserRoleChange(u, '탈퇴회원')} 
                            className="p-2 text-rose-600 bg-rose-50 rounded-xl cursor-pointer border border-rose-200/80 hover:bg-rose-100 flex items-center justify-center transition shadow-sm"
                            title="회원 탈퇴 처리"
                          >
                            <UserX size={16} />
                          </button>
                        )}

                        {isQuitRole && (
                          <button 
                            onClick={() => handleUserRoleChange(u, '일반회원')} 
                            className="p-2 text-emerald-600 bg-emerald-50 rounded-xl cursor-pointer border border-emerald-200/80 hover:bg-emerald-100 flex items-center justify-center transition shadow-sm"
                            title="일반회원으로 복구"
                          >
                            <UserCheck size={16} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-400 pt-0.5">
                      <span>가입일: {toPureDateStr(u.createdAt)}</span>
                      <span className="flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400">
                        <ShieldAlert size={14} className={penaltyScore > 0 ? "text-rose-500" : "text-slate-400"} />
                        패널티: <strong className={penaltyScore > 0 ? "text-rose-600 dark:text-rose-400 font-bold" : "text-slate-600 dark:text-slate-300"}>{penaltyScore}점</strong>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* E. 공지사항 관리 */}
      {adminSubTab === 'noticeAdmin' && (
        <div className="space-y-4 w-full min-h-[200px] relative">
          <div className="flex justify-between items-center h-10 pb-2 border-b border-slate-200/80 dark:border-slate-700/80">
            <h2 className="font-bold text-sm flex items-center gap-2 text-slate-900 dark:text-white"><span className="w-2 h-4 bg-sky-400 border border-sky-500 rounded-sm inline-block"></span> 공지사항 관리</h2>
            <button onClick={() => { setEditingNotice({ id: undefined, title: '', content: '', imageUrl: '', isVisible: 'Y' }); setIsNoticeModalOpen(true); }} className="bg-slate-900 text-white dark:bg-sky-500 dark:hover:bg-sky-600 font-bold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-slate-800">
              <Plus size={14} /> 공지 작성
            </button>
          </div>
          
          <div className="space-y-3 w-full">
            {!isInitialLoaded ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
                <Loader2 size={20} className="animate-spin text-slate-500" />
                <span className="text-[11px] font-medium text-slate-400">공지사항을 불러오는 중...</span>
              </div>
            ) : (notices || []).length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-300/40 text-slate-400 rounded-2xl w-full text-xs">
                등록된 공지사항이 없습니다.
              </div>
            ) : (
              (notices || []).map((n: Notice) => {
                const isVisible = (n as any).isVisible !== 'N';

                return (
                  <div key={n.noticeId} className="w-full border border-slate-200 p-4 rounded-2xl bg-white text-slate-900 shadow-sm dark:bg-slate-800/60 dark:border-slate-700 dark:text-white">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white flex-1 leading-snug">{n.title}</h3>
                      <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
                        <button
                          onClick={() => toggleNoticeVisibility(n)}
                          className="p-1 cursor-pointer"
                          title={isVisible ? "현재 노출 상태 (클릭 시 숨김)" : "현재 미노출 상태 (클릭 시 노출)"}
                        >
                          {isVisible ? (
                            <Eye size={16} className="text-emerald-500 hover:text-emerald-600" />
                          ) : (
                            <EyeOff size={16} className="text-slate-300 hover:text-slate-500" />
                          )}
                        </button>
                        <button 
                          onClick={() => { 
                            setEditingNotice({ 
                              id: n.noticeId, 
                              title: n.title, 
                              content: n.content, 
                              imageUrl: (n as any).imageUrl || (n as any).image_url || '',
                              isVisible: (n as any).isVisible || 'Y' 
                            }); 
                            setIsNoticeModalOpen(true); 
                          }} 
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          title="공지 수정"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => deleteNotice(n.noticeId)} 
                          className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                          title="공지 삭제"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug whitespace-pre-wrap break-all mt-1.5 mb-2.5">
                      {n.content}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-400 font-medium">
                      {toPureDateStr(n.createdAt)} 작성
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
});

AdminTab.displayName = 'AdminTab';