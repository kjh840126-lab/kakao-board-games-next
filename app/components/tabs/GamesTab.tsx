'use client';

import { useState, useMemo, memo } from 'react';
import { Game, Rental, UserRating } from '../../types';
import { Search, Filter, Bell, ChevronRight, X, Heart, Clock, Brain, Users as PlayerIcon, RotateCcw as ResetIcon, Star } from 'lucide-react';

const PRESET_GENRES = ['전략게임', '파티게임', '추상전략', '타일 놓기', '카드게임', '가족게임', '협동게임', '마피아'];

const BggIcon = memo(({ size = 12, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 114 165" fill="none" xmlns="http://www.w3.org/2000/svg" className={`inline-block flex-shrink-0 ${className}`}>
    <path d="M102.1 0L10.7 27.2L0 83.5L25.3 165L92.1 140.2L113.8 83.8L93.7 28.5L102.1 0Z" fill="#FF5100" />
  </svg>
));
BggIcon.displayName = 'BggIcon';

const StarRating = memo(({ rating = 0, size = 12, colorClass = "text-rose-500" }: { rating?: number; size?: number; colorClass?: string }) => {
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
});
StarRating.displayName = 'StarRating';

export const GamesTab = memo(({
  games, rentals, userFavorites, allRatings, currentUser, today, isIosDevice, isLargeFont,
  recentNoticesList, noticeIndex, isNoticeTransition, handleNoticeClick,
  toggleCartItem, toggleFavorite, cart, setRatingModalGame, setSelectedScore
}: any) => {
  const [gameListSearch, setGameListSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [playerFilter, setPlayerFilter] = useState<number>(0);
  const [genreFilter, setGenreFilter] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'normal' | 'hard'>('all');

  const isFilterActive = playerFilter > 0 || genreFilter !== '' || difficultyFilter !== 'all';
  const resetFilters = () => { setPlayerFilter(0); setGenreFilter(''); setDifficultyFilter('all'); };

  // ⚡ 캐시 변수를 사용하지 않고 부모에서 전달받은 섞인 games 배열을 직접 필터링
  const filteredGameList = useMemo(() => {
    if (!games || games.length === 0) return [];
    const query = gameListSearch.trim().toLowerCase();
    
    return games.filter((g: Game) => {
      if (g.isVisible !== 'Y') return false;
      if (query && !g.title.toLowerCase().includes(query)) return false;
      if (playerFilter > 0) {
        if (playerFilter === 5) { if (g.maxPlayers < 5) return false; }
        else if (g.minPlayers > playerFilter || g.maxPlayers < playerFilter) return false;
      }
      if (genreFilter && !g.genres.includes(genreFilter)) return false;
      if (difficultyFilter !== 'all') {
        if (difficultyFilter === 'easy' && g.difficulty >= 2.3) return false;
        if (difficultyFilter === 'normal' && (g.difficulty < 2.3 || g.difficulty > 3.5)) return false;
        if (difficultyFilter === 'hard' && g.difficulty <= 3.5) return false;
      }
      return true;
    });
  }, [games, gameListSearch, playerFilter, genreFilter, difficultyFilter]);

  return (
    <div className="space-y-4 mt-0.5 w-full">
      {/* 롤링 공지사항 */}
      <div onClick={() => { if (recentNoticesList.length > 0) handleNoticeClick(recentNoticesList[noticeIndex % recentNoticesList.length]); }} className="w-full px-3.5 py-3 rounded-2xl flex items-center gap-2.5 shadow-sm overflow-hidden h-11 cursor-pointer transition active:scale-[0.99] bg-slate-900 text-white">
        <Bell size={16} className="text-[#FEE500] flex-shrink-0 z-10" />
        <div className="flex-1 h-5 overflow-hidden relative">
          {recentNoticesList.length > 0 ? (
            <div className={`flex flex-col ${isNoticeTransition ? 'transition-transform duration-500 ease-in-out' : ''}`} style={{ transform: `translateY(-${noticeIndex * 20}px)` }}>
              {[...recentNoticesList, recentNoticesList[0]].map((notice: any, idx: number) => (
                <div key={`${notice.noticeId}-${idx}`} className="h-5 flex items-center justify-between"><span className="text-[#FEE500] font-extrabold truncate">{notice.title}</span></div>
              ))}
            </div>
          ) : <span className="text-slate-300">1인당 최대 <strong className="text-[#FEE500]">3개</strong> 대여 가능</span>}
        </div>
        {recentNoticesList.length > 0 && <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />}
      </div>

      {/* 검색 & 필터 */}
      <div className="flex gap-2 w-full">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="게임명 검색..." value={gameListSearch} onChange={(e) => setGameListSearch(e.target.value)} className="w-full border pl-10 pr-9 py-2.5 rounded-xl focus:outline-none bg-slate-50/50 border-slate-200 text-slate-900 text-xs" />
          {gameListSearch && <button onClick={() => setGameListSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={14} /></button>}
        </div>
        <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`p-2.5 rounded-xl font-bold flex items-center justify-center transition border relative cursor-pointer ${isFilterActive ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 border-slate-200 text-slate-700'}`}>
          <Filter size={18} />{isFilterActive && <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5"></span>}
        </button>
      </div>

      {isFilterOpen && (
        <div className="w-full p-3.5 rounded-2xl border space-y-2.5 shadow-sm transition bg-slate-50 border-slate-200">
          <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
            <span className="font-bold text-slate-400 text-xs">필터 설정</span>
            {isFilterActive && <button onClick={resetFilters} className="font-bold text-rose-500 text-xs flex items-center gap-0.5 cursor-pointer"><ResetIcon size={11} /> 초기화</button>}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400 w-11 flex-shrink-0 text-xs">인원수</span>
            <div className="flex flex-wrap gap-1 flex-1">
              {[0, 1, 2, 3, 4, 5].map(count => (
                <button key={count} onClick={() => setPlayerFilter(count)} className={`px-2 py-0.5 rounded-md font-medium text-xs cursor-pointer ${playerFilter === count ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>{count === 0 ? '전체' : count === 5 ? '5인+' : `${count}인`}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400 w-11 flex-shrink-0 text-xs">장르</span>
            <div className="flex flex-wrap gap-1 flex-1 max-h-20 overflow-y-auto scrollbar-none">
              <button onClick={() => setGenreFilter('')} className={`px-2 py-0.5 rounded-md font-medium text-xs cursor-pointer ${genreFilter === '' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>전체</button>
              {PRESET_GENRES.map(preset => (
                <button key={preset} onClick={() => setGenreFilter(preset)} className={`px-2 py-0.5 rounded-md font-medium text-xs cursor-pointer ${genreFilter === preset ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>{preset}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400 w-11 flex-shrink-0 text-xs">난이도</span>
            <div className="flex flex-wrap gap-1 flex-1">
              {[{ key: 'all', label: '전체' }, { key: 'easy', label: '쉬움' }, { key: 'normal', label: '보통' }, { key: 'hard', label: '어려움' }].map(diff => (
                <button key={diff.key} onClick={() => setDifficultyFilter(diff.key as any)} className={`px-2 py-0.5 rounded-md font-medium text-xs cursor-pointer ${difficultyFilter === diff.key ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>{diff.label}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 게임 목록 */}
      <div className="grid gap-3 w-full">
        {filteredGameList.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-300/40 text-slate-400 rounded-2xl w-full text-xs">보드게임이 없습니다.</div>
        ) : (
          filteredGameList.map((game: Game) => {
            const isAvailable = game.status === '대여가능';
            const isSelectedInCart = cart.some((item: Game) => item.gameId === game.gameId);
            const isFav = userFavorites.includes(game.gameId);
            const userRating = allRatings.find((r: UserRating) => currentUser && r.userId === currentUser.userId && r.gameId === game.gameId);

            return (
              <div key={game.gameId} className="w-full border rounded-2xl p-3.5 flex flex-col justify-between gap-2.5 shadow-sm transition bg-white border-slate-200/80">
                <div className="flex gap-3.5 items-start w-full">
                  <img src={game.imageUrl} alt={game.title} className="w-20 h-20 object-cover rounded-xl bg-slate-100 border border-slate-200/50 flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=300'; }} />
                  <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h3 className={`font-bold leading-snug break-keep ${isLargeFont ? 'text-sm' : 'text-xs'} text-slate-900`}>
                          <span>{game.title}</span><span className="text-slate-400 font-normal ml-1 text-xs">({game.releaseYear}년)</span>
                        </h3>
                        <span className="text-slate-400/80 text-[10px] font-medium tracking-wide flex-shrink-0 pt-0.5">{game.gameId}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-2 gap-y-0.5 font-semibold mt-1.5 text-xs text-slate-600">
                        <span className="flex items-center gap-0.5"><PlayerIcon size={12} /> {game.minPlayers}-{game.maxPlayers}인</span>
                        <span className="flex items-center gap-0.5"><Clock size={12} /> {game.playTime}분</span>
                        <span className="flex items-center gap-0.5"><Brain size={12} /> {Number(game.difficulty).toFixed(2)}</span>
                        <span className="flex items-center gap-0.5"><BggIcon size={13} /> BGG {game.bggRating}</span>
                      </div>
                    </div>
                    <div className="pt-1.5 border-t border-slate-200/80 mt-1.5 flex items-center gap-1 overflow-x-auto scrollbar-none">
                      {game.genres.map((genre: string) => (
                        <span key={genre} className="px-2 py-0.5 rounded-md font-medium text-xs whitespace-nowrap bg-slate-100 text-slate-800">{genre}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center gap-2 pt-1 w-full">
                  <div onClick={() => { setSelectedScore(userRating ? userRating.score : 5.0); setRatingModalGame(game); }} className="cursor-pointer flex items-center gap-1.5 font-bold text-slate-400 hover:text-rose-500 text-xs">
                    <span>나의 평점</span>
                    <StarRating rating={userRating ? userRating.score : 0} size={13} colorClass={userRating ? "text-rose-500" : "text-slate-300"} />
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => toggleFavorite(game.gameId)} className="p-1.5 rounded-xl font-bold border cursor-pointer border-slate-200 bg-slate-50 flex items-center justify-center">
                      <Heart size={16} className={isFav ? "fill-rose-500 text-rose-500" : "text-slate-400"} />
                    </button>
                    {isAvailable ? (
                      <button onClick={() => toggleCartItem(game)} className={`px-3.5 py-1.5 rounded-xl font-bold text-xs cursor-pointer ${isSelectedInCart ? 'bg-slate-900 text-white' : 'bg-[#FEE500] text-slate-900'}`}>
                        {isSelectedInCart ? '선택취소' : '대여가능'}
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 rounded-xl font-bold border inline-block text-xs bg-slate-100 text-slate-500 border-slate-200/80">
                        대여중
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});
GamesTab.displayName = 'GamesTab';