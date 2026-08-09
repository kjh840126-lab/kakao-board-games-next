'use client';

import { useState, useMemo, memo } from 'react';
import { Trophy, Flame, Award, Medal, Loader2 } from 'lucide-react';

export const RankingTab = memo(({ isInitialLoaded, games, rentals, allRatings }: any) => {
  const [rankingTab, setRankingTab] = useState<'hot' | 'hall'>('hot');

  const visibleGames = useMemo(() => {
    if (!games) return [];
    return games.filter((g: any) => {
      const isVisibleVal = g.isVisible || g.is_visible;
      return isVisibleVal !== 'N' && isVisibleVal !== 'n';
    });
  }, [games]);

  const gameStatsMap = useMemo(() => {
    const stats: Record<string, { avgScore: number; ratingCount: number; recent30DaysRentals: number; totalRentals: number }> = {};
    if (!visibleGames.length) return stats;

    const date30DaysAgo = new Date();
    date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);
    const date30DaysAgoStr = date30DaysAgo.toISOString().split('T')[0];

    visibleGames.forEach((g: any) => {
      const gameRatings = (allRatings || []).filter((r: any) => r.gameId === g.gameId);
      const ratingCount = gameRatings.length;
      const avgScore = ratingCount >= 5 
        ? gameRatings.reduce((sum: number, r: any) => sum + r.score, 0) / ratingCount 
        : 0;

      const gameRentals = (rentals || []).filter((r: any) => r.gameId === g.gameId);
      const totalRentals = gameRentals.length;
      const recent30DaysRentals = gameRentals.filter((r: any) => r.startDate >= date30DaysAgoStr).length;

      stats[g.gameId] = { avgScore, ratingCount, recent30DaysRentals, totalRentals };
    });

    return stats;
  }, [visibleGames, allRatings, rentals]);

  const hotRankedGamesList = useMemo(() => {
    const thisYear = new Date().getFullYear();

    return [...visibleGames]
      .map((g: any) => {
        const stat = gameStatsMap[g.gameId] || { avgScore: 0, ratingCount: 0, recent30DaysRentals: 0, totalRentals: 0 };
        
        const recentRentalScore = stat.recent30DaysRentals * 0.1;
        const bggScore = Number(g.bggRating) || 0;
        
        let releaseBonus = 0;
        const releaseYear = Number(g.releaseYear) || 0;
        if (releaseYear === thisYear) releaseBonus = 3;
        else if (releaseYear === thisYear - 1) releaseBonus = 2;
        else if (releaseYear === thisYear - 2) releaseBonus = 1;
        
        const userRatingScore = stat.avgScore;
        const totalScore = Number((recentRentalScore + bggScore + releaseBonus + userRatingScore).toFixed(2));

        return { 
          ...g, 
          recentRentalCount: stat.recent30DaysRentals,
          userAvgRating: stat.avgScore,
          ratingCount: stat.ratingCount,
          totalScore
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 30);
  }, [visibleGames, gameStatsMap]);

  const hallOfFameRankedGamesList = useMemo(() => {
    return [...visibleGames]
      .map((g: any) => {
        const stat = gameStatsMap[g.gameId] || { avgScore: 0, ratingCount: 0, recent30DaysRentals: 0, totalRentals: 0 };
        
        const totalRentalScore = stat.totalRentals * 0.1;
        const bggScore = Number(g.bggRating) || 0;
        const userRatingScore = stat.avgScore;
        const totalScore = Number((totalRentalScore + bggScore + userRatingScore).toFixed(2));

        return { 
          ...g, 
          rentalCount: stat.totalRentals,
          userAvgRating: stat.avgScore,
          ratingCount: stat.ratingCount,
          totalScore
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 30);
  }, [visibleGames, gameStatsMap]);

  const currentRankedList = rankingTab === 'hot' ? hotRankedGamesList : hallOfFameRankedGamesList;

  return (
    <div className="space-y-4 mt-0.5 w-full">
      <div className="pb-2 border-b flex justify-between items-end w-full border-slate-200/80">
        <h2 className="font-black tracking-tight flex items-center gap-2 text-slate-900">
          <Trophy size={18} className="text-amber-500 fill-amber-400" /> 보드게임 랭킹 Top 30
        </h2>
      </div>

      <div className="flex p-1 rounded-xl font-bold w-full bg-slate-100">
        <button onClick={() => setRankingTab('hot')} className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${rankingTab === 'hot' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>
          <Flame size={14} className="text-rose-500 fill-rose-500" /> 요즘 핫한 게임
        </button>
        <button onClick={() => setRankingTab('hall')} className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${rankingTab === 'hall' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>
          <Award size={14} className="text-amber-500" /> 명예의 전당
        </button>
      </div>

      <div className="space-y-2.5 w-full min-h-[160px] relative">
        <p className="text-slate-400 font-medium px-1 text-xs">
          {rankingTab === 'hot' ? '* 최근 30일 대여 횟수 + 신작 가산점 + BGG & 회원 평점 기준' : '* 전체 누적 대여 횟수 + BGG & 회원 평점 기준 (스테디셀러)'}
        </p>

        {!isInitialLoaded ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
            <Loader2 size={20} className="animate-spin text-slate-500" />
            <span className="text-[11px] font-medium text-slate-400">랭킹을 산출하는 중...</span>
          </div>
        ) : currentRankedList.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-300/40 text-slate-400 rounded-2xl w-full text-xs">
            랭킹을 집계할 보드게임이 없습니다.
          </div>
        ) : (
          currentRankedList.map((game: any, index: number) => {
            const rank = index + 1;
            const displayUserRating = game.userAvgRating > 0 ? `${game.userAvgRating.toFixed(1)}점` : '0점';

            return (
              <div key={game.gameId} className="w-full border p-2.5 rounded-2xl flex items-center gap-2.5 shadow-sm bg-white border-slate-200/80">
                <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 relative">
                  {rank === 1 ? (
                    <div className="relative flex items-center justify-center">
                      <Medal size={28} className="text-amber-400 fill-amber-300" />
                      <span className="absolute top-[7px] font-black text-[10px] text-amber-950">{rank}</span>
                    </div>
                  ) : rank === 2 ? (
                    <div className="relative flex items-center justify-center">
                      <Medal size={28} className="text-slate-300 fill-slate-200" />
                      <span className="absolute top-[7px] font-black text-[10px] text-slate-800">{rank}</span>
                    </div>
                  ) : rank === 3 ? (
                    <div className="relative flex items-center justify-center">
                      <Medal size={28} className="text-amber-700 fill-amber-600" />
                      <span className="absolute top-[7px] font-black text-[10px] text-white">{rank}</span>
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center bg-slate-100 text-slate-700 border border-slate-200/60">
                      {rank}
                    </div>
                  )}
                </div>

                <img src={game.imageUrl} alt={game.title} className="w-12 h-12 object-cover rounded-xl bg-slate-100 flex-shrink-0 border border-slate-200/50" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=300'; }} />
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-xs text-slate-900 leading-snug break-keep">{game.title}</h3>
                  <div className="text-slate-400 mt-1 space-y-0.5 text-[11px]">
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                      <span>출시: {game.releaseYear}년</span>
                      <span>BGG 평점: {game.bggRating}점</span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                      {rankingTab === 'hot' ? (
                        <>
                          <span>최근 30일 대여: <strong className="text-rose-500 font-bold">{game.recentRentalCount || 0}회</strong></span>
                          <span>회원 평점: <strong className="text-amber-500 font-bold">{displayUserRating}</strong></span>
                        </>
                      ) : (
                        <>
                          <span>총 대여: <strong className="text-amber-500 font-bold">{game.rentalCount || 0}회</strong></span>
                          <span>회원 평점: <strong className="text-amber-500 font-bold">{displayUserRating}</strong></span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 pl-1">
                  <span className="text-slate-400 font-medium block text-[10px]">{rankingTab === 'hot' ? '트렌드점수' : '누적점수'}</span>
                  <span className="font-black text-sm text-rose-500">{game.totalScore}점</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});

RankingTab.displayName = 'RankingTab';