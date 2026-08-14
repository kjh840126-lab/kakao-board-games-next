'use client';

import { useState, useMemo, memo } from 'react';
import { Game, Rental, UserRating } from '../../types';
import { Search, Filter, Bell, ChevronRight, X, Heart, Clock, Brain, Users as PlayerIcon, RotateCcw as ResetIcon, Star, Loader2, ArrowUpDown } from 'lucide-react';

// ⚡ 신규 장르 목록 6개 및 옵션 정의
const PRESET_GENRES = ['전략게임', '파티게임', '협력게임', '가족게임', '테마/모험', '추리/마피아'];
const PLAYER_OPTIONS = [1, 2, 3, 4, 5]; // 5는 5인+
const DIFFICULTY_OPTIONS = [
  { key: 'easy', label: '쉬움' },
  { key: 'normal', label: '보통' },
  { key: 'hard', label: '어려움' }
];

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

// ⚡ 한글 -> 영문 -> 숫자 -> 특수문자 정렬용 가중치 함수
const getCharPriority = (str: string) => {
  if (!str) return 4;
  const char = str.trim().charAt(0);
  if (/[가-힣]/.test(char)) return 1; // 1. 한글 (ㄱㄴㄷ)
  if (/[a-zA-Z]/.test(char)) return 2; // 2. 영문 (abc)
  if (/[0-9]/.test(char)) return 3;    // 3. 숫자
  return 4;                            // 4. 특수문자
};

export const GamesTab = memo(({
  isInitialLoaded, games, rentals, userFavorites, allRatings, currentUser, today, isIosDevice, isLargeFont,
  recentNoticesList, noticeIndex, isNoticeTransition, handleNoticeClick,
  toggleCartItem, toggleFavorite, cart, setRatingModalGame, setSelectedScore
}: any) => {
  const [gameListSearch, setGameListSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // ⚡ 1. 정렬 상태 (기본값: 'random' 랜덤)
  const [sortOption, setSortOption] = useState<'random' | 'title' | 'releaseYear' | 'bggRating'>('random');

  // ⚡ 2. 복수 선택 필터 상태
  const [playerFilters, setPlayerFilters] = useState<number[]>([]); // 인원수 (빈 배열 = 전체)
  const [genreFilters, setGenreFilters] = useState<string[]>([]);   // 장르 (빈 배열 = 전체)
  const [difficultyFilters, setDifficultyFilters] = useState<string[]>([]); // 난이도 (빈 배열 = 전체)

  const isFilterActive = sortOption !== 'random' || playerFilters.length > 0 || genreFilters.length > 0 || difficultyFilters.length > 0;
  
  const resetFilters = () => {
    setSortOption('random');
    setPlayerFilters([]);
    setGenreFilters([]);
    setDifficultyFilters([]);
  };

  // ⚡ 인원수 복수 선택 핸들러 (모두 선택 시 '전체'로 자동 변환)
  const togglePlayerFilter = (count: number) => {
    if (count === 0) {
      setPlayerFilters([]);
      return;
    }
    let next = playerFilters.includes(count)
      ? playerFilters.filter(p => p !== count)
      : [...playerFilters, count];

    if (next.length === PLAYER_OPTIONS.length) {
      setPlayerFilters([]);
    } else {
      setPlayerFilters(next);
    }
  };

  // ⚡ 장르 복수 선택 핸들러 (모두 선택 시 '전체'로 자동 변환)
  const toggleGenreFilter = (genre: string) => {
    if (genre === '') {
      setGenreFilters([]);
      return;
    }
    let next = genreFilters.includes(genre)
      ? genreFilters.filter(g => g !== genre)
      : [...genreFilters, genre];

    if (next.length === PRESET_GENRES.length) {
      setGenreFilters([]);
    } else {
      setGenreFilters(next);
    }
  };

  // ⚡ 난이도 복수 선택 핸들러 (모두 선택 시 '전체'로 자동 변환)
  const toggleDifficultyFilter = (key: string) => {
    if (key === 'all') {
      setDifficultyFilters([]);
      return;
    }
    let next = difficultyFilters.includes(key)
      ? difficultyFilters.filter(d => d !== key)
      : [...difficultyFilters, key];

    if (next.length === DIFFICULTY_OPTIONS.length) {
      setDifficultyFilters([]);
    } else {
      setDifficultyFilters(next);
    }
  };

  // ⚡ 필터링 및 정렬 실행
  const filteredGameList = useMemo(() => {
    if (!games || games.length === 0) return [];
    const query = gameListSearch.trim().toLowerCase();
    
    // 1. 필터링
    const filtered = games.filter((g: Game) => {
      if (g.isVisible !== 'Y') return false;
      if (query && !g.title.toLowerCase().includes(query)) return false;

      // 인원수 조건 (복수 선택 중 하나라도 만족하면 통과)
      if (playerFilters.length > 0) {
        const matches = playerFilters.some(p => {
          if (p === 5) return g.maxPlayers >= 5;
          return g.minPlayers <= p && g.maxPlayers >= p;
        });
        if (!matches) return false;
      }

      // 장르 조건 (선택한 장르 중 하나라도 포함되면 통과)
      if (genreFilters.length > 0) {
        const matches = genreFilters.some(gf => g.genres.includes(gf));
        if (!matches) return false;
      }

      // 난이도 조건 (선택한 난이도 조건 중 하나라도 만족하면 통과)
      if (difficultyFilters.length > 0) {
        const matches = difficultyFilters.some(df => {
          if (df === 'easy') return g.difficulty < 2.0;
          if (df === 'normal') return g.difficulty >= 2.0 && g.difficulty <= 3.0;
          if (df === 'hard') return g.difficulty > 3.0;
          return false;
        });
        if (!matches) return false;
      }

      return true;
    });

    // 2. 정렬 (기본값 'random'인 경우 원래 무작위 배열 유지)
    if (sortOption === 'random') {
      return filtered;
    }

    return [...filtered].sort((a: Game, b: Game) => {
      if (sortOption === 'releaseYear') {
        return (Number(b.releaseYear) || 0) - (Number(a.releaseYear) || 0); // 최신순
      }
      if (sortOption === 'bggRating') {
        return (Number(b.bggRating) || 0) - (Number(a.bggRating) || 0); // 높은순
      }
      
      // 게임명 정렬 (ㄱㄴㄷ -> abc -> 숫자 -> 특수문자)
      const pA = getCharPriority(a.title);
      const pB = getCharPriority(b.title);

      if (pA !== pB) return pA - pB;
      return a.title.localeCompare(b.title, 'ko', { numeric: true });
    });
  }, [games, gameListSearch, playerFilters, genreFilters, difficultyFilters, sortOption]);

  return (
    <div className="space-y-4 mt-0.5 w-full">
      {/* 롤링 공지사항 */}
      <div onClick={() => { if (recentNoticesList.length > 0) handleNoticeClick(recentNoticesList[noticeIndex % recentNoticesList.length]); }} className="w-full px-3.5 py-3 rounded-2xl flex items-center gap-2.5 shadow-sm overflow-hidden h-11 cursor-pointer transition active:scale-[0.99] bg-slate-900 text-white">
        <Bell size={16} className="text-[#FEE500] flex-shrink-0 z-10" />
        <div className="flex-1 h-5 overflow-hidden relative">
          {recentNoticesList.length > 0 && (
            <div className={`flex flex-col ${isNoticeTransition ? 'transition-transform duration-500 ease-in-out' : ''}`} style={{ transform: `translateY(-${noticeIndex * 20}px)` }}>
              {[...recentNoticesList, recentNoticesList[0]].map((notice: any, idx: number) => (
                <div key={`${notice.noticeId}-${idx}`} className="h-5 flex items-center justify-between"><span className="text-[#FEE500] font-extrabold truncate">{notice.title}</span></div>
              ))}
            </div>
          )}
        </div>
        {recentNoticesList.length > 0 && <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />}
      </div>

      {/* 검색 & 필터 */}
      <div className="flex gap-2 w-full">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="게임명 검색..." value={gameListSearch} onChange={(e) => setGameListSearch(e.target.value)} className="w-full border pl-10 pr-9 py-2.5 rounded-xl focus:outline-none bg-slate-50/50 border-slate-200 text-slate-900 text-xs dark:bg-slate-800/50 dark:border-slate-800 dark:text-white" />
          {gameListSearch && <button onClick={() => setGameListSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={14} /></button>}
        </div>
        <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`p-2.5 rounded-xl font-bold flex items-center justify-center transition border relative cursor-pointer ${isFilterActive ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900' : 'bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-800 dark:text-slate-300'}`}>
          <Filter size={18} />{isFilterActive && <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5"></span>}
        </button>
      </div>

      {/* 필터 패널 */}
      {isFilterOpen && (
        <div className="w-full p-3.5 rounded-2xl border space-y-3 shadow-sm transition bg-slate-50 border-slate-200 dark:bg-slate-800/80 dark:border-slate-800">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-500 dark:text-slate-400 text-xs">필터 및 정렬</span>
            {isFilterActive && <button onClick={resetFilters} className="font-bold text-rose-500 text-xs flex items-center gap-0.5 cursor-pointer"><ResetIcon size={11} /> 초기화</button>}
          </div>

          {/* ⚡ 1. 정렬 필터 (맨 앞 '랜덤' 기본값 설정) */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400 w-11 flex-shrink-0 text-xs">정렬</span>
            <div className="flex flex-wrap gap-1 flex-1">
              {[
                { key: 'random', label: '랜덤' },
                { key: 'title', label: '게임명' },
                { key: 'releaseYear', label: '출시년도' },
                { key: 'bggRating', label: 'BGG평점' },
              ].map(sort => (
                <button
                  key={sort.key}
                  onClick={() => setSortOption(sort.key as any)}
                  className={`px-2 py-0.5 rounded-md font-medium text-xs cursor-pointer ${
                    sortOption === sort.key 
                      ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-white' 
                      : 'bg-white text-slate-600 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700'
                  }`}
                >
                  {sort.label}
                </button>
              ))}
            </div>
          </div>

          {/* ⚡ 2. 인원수 필터 (복수 선택) */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400 w-11 flex-shrink-0 text-xs">인원수</span>
            <div className="flex flex-wrap gap-1 flex-1">
              <button
                onClick={() => togglePlayerFilter(0)}
                className={`px-2 py-0.5 rounded-md font-medium text-xs cursor-pointer ${
                  playerFilters.length === 0 
                    ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-white' 
                    : 'bg-white text-slate-600 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700'
                }`}
              >
                전체
              </button>
              {PLAYER_OPTIONS.map(count => {
                const isSelected = playerFilters.includes(count);
                return (
                  <button
                    key={count}
                    onClick={() => togglePlayerFilter(count)}
                    className={`px-2 py-0.5 rounded-md font-medium text-xs cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-white' 
                        : 'bg-white text-slate-600 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {count === 5 ? '5인+' : `${count}인`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ⚡ 3. 장르 필터 (복수 선택) */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400 w-11 flex-shrink-0 text-xs">장르</span>
            <div className="flex flex-wrap gap-1 flex-1 max-h-24 overflow-y-auto scrollbar-none">
              <button
                onClick={() => toggleGenreFilter('')}
                className={`px-2 py-0.5 rounded-md font-medium text-xs cursor-pointer ${
                  genreFilters.length === 0 
                    ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-white' 
                    : 'bg-white text-slate-600 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700'
                }`}
              >
                전체
              </button>
              {PRESET_GENRES.map(preset => {
                const isSelected = genreFilters.includes(preset);
                return (
                  <button
                    key={preset}
                    onClick={() => toggleGenreFilter(preset)}
                    className={`px-2 py-0.5 rounded-md font-medium text-xs cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-white' 
                        : 'bg-white text-slate-600 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ⚡ 4. 난이도 필터 (복수 선택) */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400 w-11 flex-shrink-0 text-xs">난이도</span>
            <div className="flex flex-wrap gap-1 flex-1">
              <button
                onClick={() => toggleDifficultyFilter('all')}
                className={`px-2 py-0.5 rounded-md font-medium text-xs cursor-pointer ${
                  difficultyFilters.length === 0 
                    ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-white' 
                    : 'bg-white text-slate-600 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700'
                }`}
              >
                전체
              </button>
              {DIFFICULTY_OPTIONS.map(diff => {
                const isSelected = difficultyFilters.includes(diff.key);
                return (
                  <button
                    key={diff.key}
                    onClick={() => toggleDifficultyFilter(diff.key)}
                    className={`px-2 py-0.5 rounded-md font-medium text-xs cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-white' 
                        : 'bg-white text-slate-600 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {diff.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 게임 목록 영역 */}
      <div className="grid gap-3 w-full min-h-[160px] relative">
        {!isInitialLoaded ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
            <Loader2 size={20} className="animate-spin text-slate-500" />
            <span className="text-[11px] font-medium text-slate-400">목록을 불러오는 중...</span>
          </div>
        ) : filteredGameList.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-300/40 text-slate-400 rounded-2xl w-full text-xs">보드게임이 없습니다.</div>
        ) : (
          filteredGameList.map((game: Game) => {
            const isAvailable = game.status === '대여가능';
            const isSelectedInCart = cart.some((item: Game) => item.gameId === game.gameId);
            const isFav = userFavorites.includes(game.gameId);
            const userRating = allRatings.find((r: UserRating) => currentUser && r.userId === currentUser.userId && r.gameId === game.gameId);

            return (
              <div key={game.gameId} className="w-full border rounded-2xl p-3.5 flex flex-col justify-between gap-2.5 shadow-sm transition bg-white border-slate-200/80 dark:bg-slate-800/60 dark:border-slate-700/60">
                <div className="flex gap-3.5 items-start w-full">
                  <img src={game.imageUrl} alt={game.title} className="w-20 h-20 object-cover rounded-xl bg-slate-100 border border-slate-200/50 flex-shrink-0 dark:bg-slate-800 dark:border-slate-700" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=300'; }} />
                  <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h3 className={`font-bold leading-snug break-keep ${isLargeFont ? 'text-sm' : 'text-xs'} text-slate-900 dark:text-white`}>
                          <span>{game.title}</span><span className="text-slate-400 dark:text-slate-500 font-normal ml-1 text-xs">({game.releaseYear}년)</span>
                        </h3>
                        <span className="text-slate-400/80 dark:text-slate-500 text-[11px] font-medium tracking-wide flex-shrink-0 pt-0.5">{game.gameId}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-2 gap-y-0.5 font-semibold mt-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-0.5"><PlayerIcon size={12} /> {game.minPlayers}-{game.maxPlayers}인</span>
                        <span className="flex items-center gap-0.5"><Clock size={12} /> {game.playTime}분</span>
                        <span className="flex items-center gap-0.5"><Brain size={12} /> {Number(game.difficulty).toFixed(2)}</span>
                        <span className="flex items-center gap-0.5"><BggIcon size={13} /> BGG {game.bggRating}</span>
                      </div>
                    </div>
                    <div className="pt-1.5 border-t border-slate-200/80 dark:border-slate-700/80 mt-1.5 flex items-center gap-1 overflow-x-auto scrollbar-none">
                      {game.genres.map((genre: string) => (
                        <span key={genre} className="px-2 py-0.5 rounded-md font-medium text-xs whitespace-nowrap bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">{genre}</span>
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
                    <button onClick={() => toggleFavorite(game.gameId)} className="p-1.5 rounded-xl font-bold border cursor-pointer border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 flex items-center justify-center">
                      <Heart size={16} className={isFav ? "fill-rose-500 text-rose-500" : "text-slate-400"} />
                    </button>
                    {isAvailable ? (
                      <button 
                        onClick={() => toggleCartItem(game)} 
                        className={`px-3.5 py-[7.5px] rounded-xl font-bold text-xs cursor-pointer ${
                          isSelectedInCart 
                            ? 'bg-slate-900 text-white dark:!border-none' 
                            : 'bg-[#FEE500] text-slate-900 dark:bg-amber-800 dark:text-white'
                        }`}
                      >
                        {isSelectedInCart ? '선택취소' : '대여가능'}
                      </button>
                    ) : (
                      <span className="px-2.5 py-[7.5px] rounded-xl font-bold border inline-block text-xs bg-slate-100 text-slate-500 border-slate-200/80 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
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