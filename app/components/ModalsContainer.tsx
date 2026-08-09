'use client';

import React from 'react';
import { 
  Siren, Settings, Bell, X, ChevronDown, ChevronRight, Heart, Star, User, LogOut, 
  Type, Calendar, Trash2, Image, Clock, Brain, Tag, ShoppingCart 
} from 'lucide-react';
import { Game, Notice, ReportData, BoardSite, UserData } from '../types';

interface ModalsContainerProps {
  // 모달 및 드로어 오픈 상태
  isAdminReportDrawerOpen: boolean;
  setIsAdminReportDrawerOpen: (open: boolean) => void;
  selectedReport: ReportData | null;
  reports: ReportData[];
  unreadReportsCount: number;
  handleMarkReportAsRead: (report: ReportData) => void;
  handleMarkAllReportsAsRead: () => void;

  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  currentUser: UserData | null;
  setEditName: (name: string) => void;
  setNewPasswordInput: (pwd: string) => void;
  setNewPasswordConfirmInput: (pwd: string) => void;
  setIsEditProfileOpen: (open: boolean) => void;
  setIsFavoritesModalOpen: (open: boolean) => void;
  setIsMyRatingsModalOpen: (open: boolean) => void;
  userFavorites: string[];
  myRatingGamesList: any[];
  setReportForm: (form: any) => void;
  setIsReportModalOpen: (open: boolean) => void;
  fontSize: 'normal' | 'large';
  setFontSize: (size: 'normal' | 'large') => void;
  handleLogout: () => void;

  isNoticeDrawerOpen: boolean;
  setIsNoticeDrawerOpen: (open: boolean) => void;
  notices: Notice[];
  expandedNoticeId: number | null;
  handleNoticeClick: (notice: Notice) => void;

  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cart: Game[];
  rentalDays: number;
  setRentalDays: (days: number) => void;
  calculateEndDate: () => string;
  removeFromCart: (gameId: string) => void;
  processCheckout: () => void;

  isFavoritesModalOpen: boolean;
  favoriteGamesList: Game[];
  toggleFavorite: (gameId: string) => void;

  isMyRatingsModalOpen: boolean;
  handleDeleteMyRating: (gameId: string) => void;

  ratingModalGame: Game | null;
  setRatingModalGame: (game: Game | null) => void;
  selectedScore: number;
  setSelectedScore: (score: number) => void;
  StarRating: any;
  handleSaveRating: () => void;

  isReportModalOpen: boolean;
  reportForm: any;
  handleSendReport: (e: React.FormEvent) => void;

  isEditProfileOpen: boolean;
  editName: string;
  changePassword: string;
  changePasswordConfirm: string;
  handleSaveProfile: (e: React.FormEvent) => void;

  isGameModalOpen: boolean;
  setIsGameModalOpen: (open: boolean) => void;
  editingGame: Game | null;
  setEditingGame: (game: Game | null) => void;
  isEditingMode: boolean;
  saveGame: (e: React.FormEvent) => void;
  AVAILABLE_GENRES: string[];
  toggleGenreSelection: (genre: string) => void;

  isNoticeModalOpen: boolean;
  setIsNoticeModalOpen: (open: boolean) => void;
  editingNotice: any;
  setEditingNotice: (notice: any) => void;
  saveNotice: (e: React.FormEvent) => void;

  isSiteModalOpen: boolean;
  setIsSiteModalOpen: (open: boolean) => void;
  editingSite: BoardSite;
  setEditingSite: (site: BoardSite) => void;
  saveSite: (e: React.FormEvent) => void;
}

export function ModalsContainer({
  isAdminReportDrawerOpen, setIsAdminReportDrawerOpen, selectedReport, reports, unreadReportsCount, handleMarkReportAsRead, handleMarkAllReportsAsRead,
  isSettingsOpen, setIsSettingsOpen, currentUser, setEditName, setNewPasswordInput, setNewPasswordConfirmInput, setIsEditProfileOpen, setIsFavoritesModalOpen, setIsMyRatingsModalOpen, userFavorites, myRatingGamesList, setReportForm, setIsReportModalOpen, fontSize, setFontSize, handleLogout,
  isNoticeDrawerOpen, setIsNoticeDrawerOpen, notices, expandedNoticeId, handleNoticeClick,
  isCartOpen, setIsCartOpen, cart, rentalDays, setRentalDays, calculateEndDate, removeFromCart, processCheckout,
  isFavoritesModalOpen, favoriteGamesList, toggleFavorite,
  isMyRatingsModalOpen, handleDeleteMyRating,
  ratingModalGame, setRatingModalGame, selectedScore, setSelectedScore, StarRating, handleSaveRating,
  isReportModalOpen, reportForm, handleSendReport,
  isEditProfileOpen, editName, changePassword, changePasswordConfirm, handleSaveProfile,
  isGameModalOpen, setIsGameModalOpen, editingGame, setEditingGame, isEditingMode, saveGame, AVAILABLE_GENRES, toggleGenreSelection,
  isNoticeModalOpen, setIsNoticeModalOpen, editingNotice, setEditingNotice, saveNotice,
  isSiteModalOpen, setIsSiteModalOpen, editingSite, setEditingSite, saveSite
}: ModalsContainerProps) {
  const currentGenres = editingGame?.genres || [];
  const isMaxGenreReached = currentGenres.length >= 3;

  return (
    <>
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

      {/* 5. 찜한 보드게임 모달 */}
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

      {/* 6. 내가 평가한 보드게임 모달 */}
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

      {/* 7. 평점 등록 모달 */}
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

      {/* 8. 신고/건의 모달 */}
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

      {/* 9. 프로필 수정 모달 */}
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

      {/* 10. 게임 등록/수정 모달 */}
      {isGameModalOpen && editingGame && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl w-full max-w-sm p-5 space-y-3.5 max-h-[90vh] overflow-y-auto shadow-2xl border bg-white border-slate-100 text-slate-900 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/20">
              <h3 className="font-extrabold text-base">{isEditingMode ? '게임 정보 수정' : '신규 게임 등록'}</h3>
              <button onClick={() => setIsGameModalOpen(false)} className="text-slate-400 cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={saveGame} className="space-y-3">
              {/* ⚡ 이미지 URL 입력창 & 오른쪽 48px 썸네일 컴팩트 그룹핑 */}
              <div>
                <label className="font-bold block mb-1 flex items-center gap-1"><Image size={13} /> 이미지 URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={editingGame.imageUrl}
                    onChange={(e) => setEditingGame({ ...editingGame, imageUrl: e.target.value })}
                    className="flex-1 min-w-0 border border-slate-200 p-2.5 rounded-xl text-slate-900 focus:outline-none"
                  />
                  {/* 상시 노출 48px 썸네일 미리보기 */}
                  <div className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0 relative shadow-2xs">
                    {editingGame.imageUrl ? (
                      <img
                        src={editingGame.imageUrl}
                        alt="미리보기"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=300';
                        }}
                      />
                    ) : (
                      <Image size={18} className="text-slate-300" />
                    )}
                  </div>
                </div>
              </div>

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

              {/* 장르 선택 (최대 3개, 시인성이 확보된 딤드 스타일 적용) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center">
                  <label className="font-bold block">장르 선택 (최대 3개)</label>
                  <span className={`text-[11px] font-extrabold ${isMaxGenreReached ? 'text-rose-500' : 'text-amber-600'}`}>
                    {currentGenres.length} / 3개
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {AVAILABLE_GENRES.map((genre) => {
                    const isSelected = currentGenres.includes(genre);
                    const isDisabled = isMaxGenreReached && !isSelected;

                    return (
                      <button
                        key={genre}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => toggleGenreSelection(genre)}
                        className={`px-3 py-1.5 rounded-full font-bold transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-sm cursor-pointer'
                            : isDisabled
                            ? 'bg-slate-200/70 text-slate-400 border border-slate-300 border-dashed cursor-not-allowed'
                            : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 cursor-pointer'
                        }`}
                      >
                        {genre}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-2"><button type="button" onClick={() => setIsGameModalOpen(false)} className="flex-1 bg-slate-100 py-2.5 rounded-xl font-bold text-slate-700 cursor-pointer">취소</button><button type="submit" className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl font-bold cursor-pointer">저장</button></div>
            </form>
          </div>
        </div>
      )}

      {/* 11. 공지 작성 모달 */}
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

      {/* 12. 추천 사이트 등록 모달 */}
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
    </>
  );
}