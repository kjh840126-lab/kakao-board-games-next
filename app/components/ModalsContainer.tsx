'use client';

import { X, Star, AlertTriangle, ShieldCheck, Heart, User, ExternalLink, Settings, MessageSquare, Trash2, Edit3, Plus, Volume2, PlusCircle, Check } from 'lucide-react';

export const ModalsContainer = ({
  isAdminReportDrawerOpen,
  setIsAdminReportDrawerOpen,
  selectedReport,
  reports,
  unreadReportsCount,
  handleMarkReportAsRead,
  handleMarkAllReportsAsRead,
  isSettingsOpen,
  setIsSettingsOpen,
  currentUser,
  setEditName,
  setNewPasswordInput,
  setNewPasswordConfirmInput,
  setIsEditProfileOpen,
  setIsFavoritesModalOpen,
  setIsMyRatingsModalOpen,
  userFavorites,
  favoriteGamesList,
  myRatingGamesList,
  setReportForm,
  setIsReportModalOpen,
  fontSize,
  setFontSize,
  handleLogout,
  isNoticeDrawerOpen,
  setIsNoticeDrawerOpen,
  notices,
  expandedNoticeId,
  handleNoticeClick,
  isCartOpen,
  setIsCartOpen,
  cart,
  rentalDays,
  setRentalDays,
  calculateEndDate,
  removeFromCart,
  processCheckout,
  isFavoritesModalOpen,
  toggleFavorite,
  isMyRatingsModalOpen,
  handleDeleteMyRating,
  ratingModalGame,
  setRatingModalGame,
  selectedScore,
  setSelectedScore,
  StarRating,
  handleSaveRating,
  isReportModalOpen,
  reportForm,
  handleSendReport,
  isEditProfileOpen,
  editName,
  changePassword,
  changePasswordConfirm,
  handleSaveProfile,
  isGameModalOpen,
  setIsGameModalOpen,
  editingGame,
  setEditingGame,
  isEditingMode,
  saveGame,
  AVAILABLE_GENRES,
  toggleGenreSelection,
  isNoticeModalOpen,
  setIsNoticeModalOpen,
  editingNotice,
  setEditingNotice,
  saveNotice,
  isSiteModalOpen,
  setIsSiteModalOpen,
  editingSite,
  setEditingSite,
  saveSite,
}: any) => {
  return (
    <>
      {/* 1. 관리자 신고/건의 드로어 */}
      {isAdminReportDrawerOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex justify-end transition-opacity">
          <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col p-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <AlertTriangle size={16} className="text-amber-500" />
                신고 및 건의함 {unreadReportsCount > 0 && <span className="text-xs bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-bold">{unreadReportsCount}</span>}
              </h3>
              <div className="flex items-center gap-2">
                {unreadReportsCount > 0 && (
                  <button onClick={handleMarkAllReportsAsRead} className="text-[11px] font-bold text-sky-600 hover:underline">
                    모두 읽음
                  </button>
                )}
                <button onClick={() => setIsAdminReportDrawerOpen(false)} className="text-slate-400 p-1"><X size={18} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
              {reports.length === 0 ? (
                <div className="text-center py-12 text-slate-400">접수된 건의사항이 없습니다.</div>
              ) : (
                reports.map((report: any) => (
                  <div
                    key={report.reportId}
                    onClick={() => handleMarkReportAsRead(report)}
                    className={`p-3 rounded-2xl border text-xs cursor-pointer transition ${
                      selectedReport?.reportId === report.reportId ? 'border-sky-500 bg-sky-50/50' : report.isRead ? 'border-slate-200 bg-white' : 'border-amber-300 bg-amber-50/30 font-bold'
                    }`}
                  >
                    <div className="flex justify-between items-center text-slate-400 text-[11px] mb-1">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 font-semibold text-slate-600">{report.category}</span>
                      <span>{report.createdAt}</span>
                    </div>
                    <div className="font-bold text-slate-900 mb-1">{report.title}</div>
                    <div className="text-slate-600 line-clamp-2 leading-relaxed">{report.content}</div>
                    <div className="mt-2 text-[11px] text-slate-400 flex justify-between items-center border-t border-slate-100 pt-1.5">
                      <span>작성자: {report.userId}</span>
                      <span className={report.isRead ? 'text-slate-400' : 'text-amber-600 font-bold'}>{report.isRead ? '확인됨' : '미확인'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. 공지사항 전체 드로어 */}
      {isNoticeDrawerOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex justify-end">
          <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col p-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <Volume2 size={16} className="text-[#FEE500]" /> 전체 공지사항
              </h3>
              <button onClick={() => setIsNoticeDrawerOpen(false)} className="text-slate-400 p-1"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
              {notices.map((notice: any) => (
                <div key={notice.noticeId} onClick={() => handleNoticeClick(notice)} className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-sm cursor-pointer">
                  <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                    <span className="font-bold text-slate-800">{notice.title}</span>
                    <span>{notice.createdAt}</span>
                  </div>
                  {expandedNoticeId === notice.noticeId && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-slate-600 text-xs leading-relaxed whitespace-pre-wrap">
                      {notice.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. 장바구니 모달 */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-4 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3 border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">장바구니 ({cart.length}/3)</h3>
              <button onClick={() => setIsCartOpen(false)} className="text-slate-400"><X size={18} /></button>
            </div>
            {cart.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">장바구니가 비어 있습니다.</div>
            ) : (
              <div className="space-y-3">
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {cart.map((game: any) => (
                    <div key={game.gameId} className="flex justify-between items-center p-2.5 rounded-2xl border border-slate-100 bg-slate-50">
                      <div className="flex items-center gap-2.5">
                        <img src={game.imageUrl} alt={game.title} className="w-10 h-10 object-cover rounded-xl bg-white border border-slate-200" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=300'; }} />
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{game.title}</div>
                          <div className="text-[11px] text-slate-400">{game.minPlayers}-{game.maxPlayers}인 | {game.playTime}분</div>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(game.gameId)} className="text-rose-500 p-1"><X size={16} /></button>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl space-y-2 text-xs">
                  <div className="flex justify-between items-center font-bold text-slate-700">
                    <span>대여 기간 선택</span>
                    <select value={rentalDays} onChange={(e) => setRentalDays(Number(e.target.value))} className="border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none">
                      <option value={7}>7일간 대여</option>
                      <option value={14}>14일간 대여</option>
                    </select>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>반납 예정일</span>
                    <span className="font-bold text-slate-800">{calculateEndDate()}</span>
                  </div>
                </div>
                <button onClick={processCheckout} className="w-full bg-[#FEE500] text-slate-900 font-extrabold py-3 rounded-2xl text-xs shadow-sm hover:bg-[#ebd300] transition">
                  대여 확정하기
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. 게임 등록 / 수정 모달 (⚡ 이미지 미리보기 적용) */}
      {isGameModalOpen && editingGame && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-4 shadow-2xl space-y-3 max-h-[90vh] overflow-y-auto scrollbar-none">
            <div className="flex justify-between items-center border-b pb-2.5 border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">{isEditingMode ? '게임 정보 수정' : '신규 게임 등록'}</h3>
              <button onClick={() => setIsGameModalOpen(false)} className="text-slate-400"><X size={18} /></button>
            </div>
            <form onSubmit={saveGame} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">게임 ID</label>
                <input type="text" value={editingGame.gameId} disabled={isEditingMode} onChange={(e) => setEditingGame({ ...editingGame, gameId: e.target.value })} className="w-full border border-slate-200 p-2 rounded-xl bg-slate-50 focus:outline-none" placeholder="예: KBG0001" required />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">게임 제목</label>
                <input type="text" value={editingGame.title} onChange={(e) => setEditingGame({ ...editingGame, title: e.target.value })} className="w-full border border-slate-200 p-2 rounded-xl focus:outline-none" required />
              </div>

              {/* ⚡ 이미지 URL 및 실시간 미리보기 영역 */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">이미지 URL</label>
                <input type="text" value={editingGame.imageUrl} onChange={(e) => setEditingGame({ ...editingGame, imageUrl: e.target.value })} className="w-full border border-slate-200 p-2 rounded-xl focus:outline-none mb-2" placeholder="https://..." />
                
                {/* 실시간 미리보기 박스 */}
                <div className="w-full h-32 bg-slate-100 rounded-2xl border border-slate-200 flex flex-col items-center justify-center overflow-hidden relative">
                  {editingGame.imageUrl ? (
                    <img
                      src={editingGame.imageUrl}
                      alt="게임 미리보기"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=300';
                      }}
                    />
                  ) : (
                    <span className="text-slate-400 text-[11px] font-medium">이미지 URL을 입력하면 미리보기가 표시됩니다.</span>
                  )}
                  <span className="absolute bottom-1.5 right-1.5 bg-slate-900/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">미리보기</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">최소 인원</label>
                  <input type="number" value={editingGame.minPlayers} onChange={(e) => setEditingGame({ ...editingGame, minPlayers: Number(e.target.value) })} className="w-full border border-slate-200 p-2 rounded-xl focus:outline-none" min={1} required />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">최대 인원</label>
                  <input type="number" value={editingGame.maxPlayers} onChange={(e) => setEditingGame({ ...editingGame, maxPlayers: Number(e.target.value) })} className="w-full border border-slate-200 p-2 rounded-xl focus:outline-none" min={1} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">플레이 시간 (분)</label>
                  <input type="text" value={editingGame.playTime} onChange={(e) => setEditingGame({ ...editingGame, playTime: e.target.value })} className="w-full border border-slate-200 p-2 rounded-xl focus:outline-none" placeholder="예: 30 또는 30~60" required />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">난이도 (1.0~5.0)</label>
                  <input type="number" step="0.1" value={editingGame.difficulty} onChange={(e) => setEditingGame({ ...editingGame, difficulty: Number(e.target.value) })} className="w-full border border-slate-200 p-2 rounded-xl focus:outline-none" min={1} max={5} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">출시년도</label>
                  <input type="number" value={editingGame.releaseYear} onChange={(e) => setEditingGame({ ...editingGame, releaseYear: Number(e.target.value) })} className="w-full border border-slate-200 p-2 rounded-xl focus:outline-none" required />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">BGG 평점</label>
                  <input type="number" step="0.1" value={editingGame.bggRating} onChange={(e) => setEditingGame({ ...editingGame, bggRating: Number(e.target.value) })} className="w-full border border-slate-200 p-2 rounded-xl focus:outline-none" required />
                </div>
              </div>

              {/* 장르 선택 박스 */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">장르 선택 (최대 4개)</label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-2xl">
                  {AVAILABLE_GENRES.map((genre: string) => {
                    const isSelected = editingGame.genres?.includes(genre);
                    return (
                      <button
                        type="button"
                        key={genre}
                        onClick={() => toggleGenreSelection(genre)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                          isSelected ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        {genre} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">노출 여부</label>
                <select value={editingGame.isVisible} onChange={(e) => setEditingGame({ ...editingGame, isVisible: e.target.value })} className="w-full border border-slate-200 p-2 rounded-xl focus:outline-none bg-white">
                  <option value="Y">노출 (Y)</option>
                  <option value="N">숨김 (N)</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-2xl mt-2 hover:bg-slate-800 transition">
                {isEditingMode ? '수정 완료' : '등록 완료'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. 평점 등록 / 수정 모달 */}
      {ratingModalGame && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xs p-4 shadow-2xl space-y-4 text-center">
            <h3 className="font-extrabold text-slate-900 text-sm">{ratingModalGame.title}</h3>
            <div className="flex justify-center my-2">
              <StarRating rating={selectedScore} size={28} />
            </div>
            <div className="font-bold text-rose-500 text-base">{selectedScore.toFixed(1)}점</div>
            <input type="range" min="1.0" max="5.0" step="0.5" value={selectedScore} onChange={(e) => setSelectedScore(Number(e.target.value))} className="w-full accent-rose-500" />
            <div className="flex gap-2">
              <button onClick={() => setRatingModalGame(null)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-2.5 rounded-xl text-xs">취소</button>
              <button onClick={handleSaveRating} className="flex-1 bg-rose-500 text-white font-bold py-2.5 rounded-xl text-xs">평점 저장</button>
            </div>
          </div>
        </div>
      )}

      {/* 6. 공지사항 작성/수정 모달 */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-4 shadow-2xl space-y-3">
            <div className="flex justify-between items-center border-b pb-2.5 border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">{editingNotice.id ? '공지사항 수정' : '새 공지사항 등록'}</h3>
              <button onClick={() => setIsNoticeModalOpen(false)} className="text-slate-400"><X size={18} /></button>
            </div>
            <form onSubmit={saveNotice} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">제목</label>
                <input type="text" value={editingNotice.title} onChange={(e) => setEditingNotice({ ...editingNotice, title: e.target.value })} className="w-full border border-slate-200 p-2 rounded-xl focus:outline-none" required />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">내용</label>
                <textarea rows={4} value={editingNotice.content} onChange={(e) => setEditingNotice({ ...editingNotice, content: e.target.value })} className="w-full border border-slate-200 p-2 rounded-xl focus:outline-none resize-none" required></textarea>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-2xl hover:bg-slate-800 transition">저장</button>
            </form>
          </div>
        </div>
      )}

      {/* 7. 추천 사이트 작성/수정 모달 */}
      {isSiteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-4 shadow-2xl space-y-3">
            <div className="flex justify-between items-center border-b pb-2.5 border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">{editingSite.siteId > 0 ? '사이트 수정' : '새 사이트 등록'}</h3>
              <button onClick={() => setIsSiteModalOpen(false)} className="text-slate-400"><X size={18} /></button>
            </div>
            <form onSubmit={saveSite} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">사이트명</label>
                <input type="text" value={editingSite.name} onChange={(e) => setEditingSite({ ...editingSite, name: e.target.value })} className="w-full border border-slate-200 p-2 rounded-xl focus:outline-none" required />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">URL</label>
                <input type="text" value={editingSite.url} onChange={(e) => setEditingSite({ ...editingSite, url: e.target.value })} className="w-full border border-slate-200 p-2 rounded-xl focus:outline-none" required />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">배너 이미지 URL</label>
                <input type="text" value={editingSite.bannerUrl} onChange={(e) => setEditingSite({ ...editingSite, bannerUrl: e.target.value })} className="w-full border border-slate-200 p-2 rounded-xl focus:outline-none" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">설명</label>
                <input type="text" value={editingSite.description} onChange={(e) => setEditingSite({ ...editingSite, description: e.target.value })} className="w-full border border-slate-200 p-2 rounded-xl focus:outline-none" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">노출 여부</label>
                <select value={editingSite.isVisible} onChange={(e) => setEditingSite({ ...editingSite, isVisible: e.target.value })} className="w-full border border-slate-200 p-2 rounded-xl focus:outline-none bg-white">
                  <option value="Y">노출 (Y)</option>
                  <option value="N">숨김 (N)</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-2xl hover:bg-slate-800 transition">저장</button>
            </form>
          </div>
        </div>
      )}

      {/* 8. 사용자 설정 및 프로필 드로어/모달 */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex justify-end">
          <div className="w-full max-w-xs bg-white h-full shadow-2xl flex flex-col p-4 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5"><Settings size={16} /> 설정</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400"><X size={18} /></button>
            </div>
            <div className="flex-1 space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl">
                <div className="font-bold text-slate-900">{currentUser?.name}</div>
                <div className="text-slate-400 text-[11px]">{currentUser?.email}</div>
              </div>
              <button onClick={() => { setEditName(currentUser?.name || ''); setIsEditProfileOpen(true); }} className="w-full text-left p-3 rounded-2xl hover:bg-slate-50 font-bold text-slate-700 flex justify-between items-center">
                <span>내 정보 수정</span><Edit3 size={14} />
              </button>
              <button onClick={() => setIsFavoritesModalOpen(true)} className="w-full text-left p-3 rounded-2xl hover:bg-slate-50 font-bold text-slate-700 flex justify-between items-center">
                <span>관심 보드게임 ({userFavorites.length})</span><Heart size={14} className="text-rose-500" />
              </button>
              <button onClick={() => setIsMyRatingsModalOpen(true)} className="w-full text-left p-3 rounded-2xl hover:bg-slate-50 font-bold text-slate-700 flex justify-between items-center">
                <span>내가 남긴 평점 ({myRatingGamesList.length})</span><Star size={14} className="text-amber-400" />
              </button>
              <button onClick={() => setIsReportModalOpen(true)} className="w-full text-left p-3 rounded-2xl hover:bg-slate-50 font-bold text-slate-700 flex justify-between items-center">
                <span>신고 / 건의하기</span><MessageSquare size={14} />
              </button>
              <div className="p-3 rounded-2xl bg-slate-50 space-y-2">
                <span className="font-bold text-slate-700 block">글자 크기</span>
                <div className="flex gap-2">
                  <button onClick={() => setFontSize('normal')} className={`flex-1 py-1.5 rounded-xl font-bold ${fontSize === 'normal' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border'}`}>보통</button>
                  <button onClick={() => setFontSize('large')} className={`flex-1 py-1.5 rounded-xl font-bold ${fontSize === 'large' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border'}`}>크게</button>
                </div>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full py-3 bg-rose-50 text-rose-600 font-bold rounded-2xl text-xs hover:bg-rose-100 transition">
              로그아웃
            </button>
          </div>
        </div>
      )}

      {/* 9. 관심 게임 모달 */}
      {isFavoritesModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-4 shadow-2xl space-y-3 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center border-b pb-2 border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">관심 보드게임</h3>
              <button onClick={() => setIsFavoritesModalOpen(false)} className="text-slate-400"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {favoriteGamesList.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">등록된 관심 게임이 없습니다.</div>
              ) : (
                favoriteGamesList.map((game: any) => (
                  <div key={game.gameId} className="flex justify-between items-center p-2.5 rounded-2xl border border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <img src={game.imageUrl} alt={game.title} className="w-10 h-10 object-cover rounded-xl bg-white border border-slate-200" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=300'; }} />
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{game.title}</div>
                        <div className="text-[11px] text-slate-400">{game.minPlayers}-{game.maxPlayers}인 | {game.playTime}분</div>
                      </div>
                    </div>
                    <button onClick={() => toggleFavorite(game.gameId)} className="p-1.5 text-rose-500"><Heart size={16} className="fill-rose-500" /></button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 10. 내 평점 모달 */}
      {isMyRatingsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-4 shadow-2xl space-y-3 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center border-b pb-2 border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">내가 남긴 평점</h3>
              <button onClick={() => setIsMyRatingsModalOpen(false)} className="text-slate-400"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {myRatingGamesList.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">평점을 남긴 게임이 없습니다.</div>
              ) : (
                myRatingGamesList.map((game: any) => (
                  <div key={game.gameId} className="flex justify-between items-center p-2.5 rounded-2xl border border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-2.5">
                      <img src={game.imageUrl} alt={game.title} className="w-10 h-10 object-cover rounded-xl bg-white border border-slate-200" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=300'; }} />
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{game.title}</div>
                        <div className="font-bold text-rose-500 text-xs">{game.myScore?.toFixed(1)}점</div>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteMyRating(game.gameId)} className="p-1.5 text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 11. 신고/건의 작성 모달 */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-4 shadow-2xl space-y-3">
            <div className="flex justify-between items-center border-b pb-2 border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">신고 / 건의하기</h3>
              <button onClick={() => setIsReportModalOpen(false)} className="text-slate-400"><X size={18} /></button>
            </div>
            <form onSubmit={handleSendReport} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">분류</label>
                <select value={reportForm.category} onChange={(e) => setReportForm({ ...reportForm, category: e.target.value })} className="w-full border border-slate-200 p-2 rounded-xl focus:outline-none bg-white" required>
                  <option value="">선택해주세요</option>
                  <option value="게임 파손/분실">게임 파손/분실</option>
                  <option value="시스템 오류">시스템 오류</option>
                  <option value="기타 건의">기타 건의</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">제목</label>
                <input type="text" value={reportForm.title} onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })} className="w-full border border-slate-200 p-2 rounded-xl focus:outline-none" required />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">내용</label>
                <textarea rows={4} value={reportForm.content} onChange={(e) => setReportForm({ ...reportForm, content: e.target.value })} className="w-full border border-slate-200 p-2 rounded-xl focus:outline-none resize-none" required></textarea>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-2xl hover:bg-slate-800 transition">제출하기</button>
            </form>
          </div>
        </div>
      )}

      {/* 12. 프로필 수정 모달 */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-4 shadow-2xl space-y-3">
            <div className="flex justify-between items-center border-b pb-2 border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">내 정보 수정</h3>
              <button onClick={() => setIsEditProfileOpen(false)} className="text-slate-400"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">이름</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full border border-slate-200 p-2 rounded-xl focus:outline-none" required />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">새 비밀번호 (선택)</label>
                <input type="password" value={changePassword} onChange={(e) => setNewPasswordInput(e.target.value)} className="w-full border border-slate-200 p-2 rounded-xl focus:outline-none" placeholder="변경할 경우에만 입력" />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">새 비밀번호 확인</label>
                <input type="password" value={changePasswordConfirm} onChange={(e) => setNewPasswordConfirmInput(e.target.value)} className="w-full border border-slate-200 p-2 rounded-xl focus:outline-none" placeholder="비밀번호 재입력" />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-2xl hover:bg-slate-800 transition">수정 완료</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};