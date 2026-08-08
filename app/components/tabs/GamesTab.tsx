'use client';

import { useState, useMemo } from 'react';
import { Game, Rental, UserData, Notice, UserRating } from '../../types';
import { 
  Search, Star, Heart, ShoppingCart, Users, Clock, Brain, 
  ChevronRight, Sparkles, Filter, X 
} from 'lucide-react';

interface GamesTabProps {
  games: Game[];
  rentals: Rental[];
  userFavorites: string[];
  allRatings: UserRating[];
  currentUser: UserData;
  today: string;
  isIosDevice: boolean;
  isLargeFont: boolean;
  recentNoticesList: Notice[];
  noticeIndex: number;
  isNoticeTransition: boolean;
  handleNoticeClick: (notice: Notice) => void;
  toggleCartItem: (game: Game) => void;
  toggleFavorite: (gameId: string) => void;
  cart: Game[];
  setRatingModalGame: (game: Game) => void;
  setSelectedScore: (score: number) => void;
}

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

export function GamesTab({
  games,
  rentals,
  userFavorites,
  allRatings,
  currentUser,
  today,
  isIosDevice,
  isLargeFont,
  recentNoticesList,
  noticeIndex,
  isNoticeTransition,
  handleNoticeClick,
  toggleCartItem,
  toggleFavorite,
  cart,
  setRatingModalGame,
  setSelectedScore
}: GamesTabProps) {
  const [searchTerm, setSearchGenre] = useState('');
  const [selectedGenre, setSelectedGenreFilter] = useState<string>('전체');
  const [selectedPlayerCount, setSelectedPlayerCount] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'전체' | '대여가능' | '대여중'>('전체');

  // 노출 가능(isVisible === 'Y')한 게임들만 추출
  const visibleGames = useMemo(() => games.filter(g => g.isVisible === 'Y'), [games]);

  // 필터링 적용된 게임 목록
  const filteredGames = useMemo(() => {
    return visibleGames.filter(game => {
      // 1. 검색어 필터 (제목)
      const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase().trim());
      
      // 2. 장르 필터
      const matchesGenre = selectedGenre === '전체' || (game.genres && game.genres.includes(selectedGenre));
      
      // 3. 인원수 필터
      const matchesPlayers = selectedPlayerCount === null || (game.minPlayers <= selectedPlayerCount && game.maxPlayers >= selectedPlayerCount);
      
      // 4. 대여 상태 필터 (단순 game.status 판단)
      const matchesStatus = statusFilter === '전체' || game.status === statusFilter;

      return matchesSearch && matchesGenre && matchesPlayers && matchesStatus;
    });
  }, [visibleGames, searchTerm, selectedGenre, selectedPlayerCount, statusFilter]);

  // 게임별 평균 평점 계산 함수
  const getGameRating = (gameId: string) => {
    const gameRatings = allRatings.filter(r => r.gameId === gameId);
    if (gameRatings.length === 0) return { avg: 0, count: 0 };
    const sum = gameRatings.reduce((acc, cur) => acc + cur.score, 0);
    return { avg: sum / gameRatings.length, count: gameRatings.length };
  };

  return (
    <div className="space-y-4 text-xs">
      {/* 롤링 공지사항 롤러 */}
      {recentNoticesList.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200/60 rounded-2xl p-3 flex items-center gap-2.5 overflow-hidden shadow-sm">
          <span className="bg-amber-400 text-slate-900 font-extrabold px-2 py-0.5 rounded-lg text-[10px] flex items-center gap-1 flex-shrink-0">
            <Sparkles size={11} /> 공지
          </span>
          <div className="flex-1 overflow-hidden h-5 relative">
            <div 
              className={`absolute w-full transition-transform ${isNoticeTransition ? 'duration-500' : 'duration-0'}`}
              style={{ transform: `translateY(-${noticeIndex * 20}px)` }}
            >
              {recentNoticesList.map((notice) => (
                <div 
                  key={notice.noticeId} 
                  onClick={() => handleNoticeClick(notice)} 
                  className="h-5 flex items-center justify-between cursor-pointer group"
                >
                  <span className="font-bold text-slate-800 truncate text-xs group-hover:underline">{notice.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono flex-shrink-0 ml-2">{notice.createdAt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 검색 & 필터 영역 */}
      <div className="space-y-2.5">
        {/* 검색창 */}
        <div className="relative">
          <input
            type="text"
            placeholder="보드게임 제목 검색..."
            value={searchTerm}
            onChange={(e) => setSearchGenre(e.target.value)}
            className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-900 p-3 pl-10 rounded-2xl text-slate-900 text-xs placeholder-slate-400 transition"
          />
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
          {searchTerm && (
            <button onClick={() => setSearchGenre('')} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* 대여 가능 / 대여중 상태 필터 버튼 */}
        <div className="flex gap-1.5 border-b border-slate-100 pb-2 overflow-x-auto scrollbar-none">
          {(['전체', '대여가능', '대여중'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer whitespace-nowrap text-xs ${
                statusFilter === status
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* 게임 목록 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        {filteredGames.length === 0 ? (
          <div className="col-span-full text-center py-16 text-slate-400 font-medium">
            조건에 맞는 보드게임이 없습니다.
          </div>
        ) : (
          filteredGames.map(game => {
            const isFav = userFavorites.includes(game.gameId);
            const isInCart = cart.some(item => item.gameId === game.gameId);
            const ratingInfo = getGameRating(game.gameId);
            const myRating = allRatings.find(r => r.userId === currentUser.userId && r.gameId === game.gameId);

            // 🔴 단순 판단: game.status가 '대여중'인지 체크
            const isRented = game.status === '대여중';

            return (
              <div key={game.gameId} className="border border-slate-200/80 rounded-2xl p-3.5 shadow-sm bg-white hover:border-slate-300 transition flex flex-col justify-between relative gap-3">
                {/* 찜하기 버튼 */}
                <button 
                  onClick={() => toggleFavorite(game.gameId)} 
                  className="absolute top-3.5 right-3.5 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-slate-100 shadow-sm cursor-pointer hover:scale-110 transition"
                >
                  <Heart size={16} className={isFav ? "text-rose-500 fill-rose-500" : "text-slate-300"} />
                </button>

                <div className="flex gap-3.5">
                  {/* 게임 이미지 */}
                  <img 
                    src={game.imageUrl} 
                    alt={game.title} 
                    className="w-20 h-20 object-cover rounded-xl bg-slate-100 border border-slate-200 flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=300'; }}
                  />

                  {/* 게임 상세 정보 */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap pr-6">
                      {/* 🔴 대여 상태 뱃지: game.status 조건 사용 */}
                      {isRented ? (
                        <span className="bg-slate-800 text-slate-200 font-extrabold px-2 py-0.5 rounded-md text-[10px]">
                          대여중
                        </span>
                      ) : (
                        <span className="bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded-md text-[10px]">
                          대여가능
                        </span>
                      )}

                      {/* 장르 태그 */}
                      {game.genres && game.genres.slice(0, 2).map(g => (
                        <span key={g} className="bg-slate-100 text-slate-600 font-medium px-1.5 py-0.5 rounded-md text-[10px]">
                          {g}
                        </span>
                      ))}
                    </div>

                    <h3 className="font-extrabold text-sm text-slate-900 truncate">{game.title}</h3>

                    {/* 스펙 정보 */}
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium flex-wrap pt-0.5">
                      <span className="flex items-center gap-0.5"><Users size={11} /> {game.minPlayers}~{game.maxPlayers}인</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5"><Clock size={11} /> {game.playTime}분</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5"><Brain size={11} /> 난이도 {game.difficulty}</span>
                    </div>

                    {/* 평점 정보 */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <StarRating rating={ratingInfo.avg} size={11} />
                      <span className="font-extrabold text-slate-800 text-[11px]">
                        {ratingInfo.avg > 0 ? ratingInfo.avg.toFixed(1) : '평점없음'}
                      </span>
                      {ratingInfo.count > 0 && <span className="text-slate-400 text-[10px]">({ratingInfo.count})</span>}
                    </div>
                  </div>
                </div>

                {/* 하단 버튼 영역 */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  {/* 내 평점 남기기 버튼 */}
                  <button
                    onClick={() => {
                      setSelectedScore(myRating ? myRating.score : 5.0);
                      setRatingModalGame(game);
                    }}
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold transition cursor-pointer flex items-center gap-1 text-[11px]"
                  >
                    <Star size={12} className={myRating ? "text-amber-500 fill-amber-500" : "text-slate-400"} />
                    {myRating ? `${myRating.score.toFixed(1)}점` : '평점 남기기'}
                  </button>

                  {/* 🔴 대여/장바구니 버튼: game.status가 대여중이면 즉시 비활성화 */}
                  {isRented ? (
                    <button 
                      disabled 
                      className="flex-1 bg-slate-200 text-slate-400 font-bold py-2 rounded-xl cursor-not-allowed text-xs"
                    >
                      대여 중인 보드게임
                    </button>
                  ) : (
                    <button 
                      onClick={() => toggleCartItem(game)}
                      className={`flex-1 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                        isInCart 
                          ? 'bg-rose-500 text-white' 
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      <ShoppingCart size={13} />
                      {isInCart ? '장바구니 빼기' : '장바구니 담기'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}