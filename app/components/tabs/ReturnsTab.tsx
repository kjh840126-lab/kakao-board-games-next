'use client';

import { memo, useMemo } from 'react';
import { Rental } from '../../types';
import { RotateCcw, CheckCircle2 } from 'lucide-react';

const getDaysDifference = (dateStr1: string, dateStr2: string) => {
  if (!dateStr1 || !dateStr2) return 0;
  const d1 = new Date(dateStr1); const d2 = new Date(dateStr2);
  return Math.floor((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};

export const ReturnsTab = memo(({ rentals, currentUser, today, returnGame, returnAllGames }: any) => {
  // 1) 현재 사용자의 대여 중인 목록
  const activeRentals = useMemo(() => {
    return rentals.filter((r: Rental) => r.userId === currentUser?.userId && r.status === '대여중');
  }, [rentals, currentUser]);

  // 2) 현재 사용자의 반납 완료된 목록
  const returnedRentalsList = useMemo(() => {
    return rentals
      .filter((r: Rental) => r.userId === currentUser?.userId && r.status === '반납완료')
      .sort((a: Rental, b: Rental) => (b.returnedAt || b.startDate).localeCompare(a.returnedAt || a.startDate));
  }, [rentals, currentUser]);

  return (
    <div className="space-y-5 mt-0.5 w-full">
      {/* 대여 현황 요약 바 */}
      <div className="p-4 rounded-2xl flex justify-between items-center shadow-sm bg-slate-900 text-white">
        <div className="flex items-center justify-between w-full">
          <span className="text-slate-300 font-medium">현재 대여 중인 게임</span>
          <span className="text-lg font-black text-[#FEE500]">{activeRentals.length} / 3 개</span>
        </div>
        {activeRentals.length > 0 && (
          <button onClick={returnAllGames} className="bg-[#FEE500] text-slate-900 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer flex-shrink-0 ml-3 shadow-sm">
            <RotateCcw size={14} /> 일괄 반납
          </button>
        )}
      </div>

      {/* 1. 대여중인 게임 */}
      <section className="space-y-2.5 w-full">
        <h3 className="font-extrabold tracking-tight flex items-center gap-2 text-slate-900">
          <span className="w-1.5 h-3.5 bg-slate-900 rounded-full inline-block"></span> 대여중인 게임
        </h3>
        {activeRentals.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-300/40 text-slate-400 rounded-2xl w-full">대여 중인 보드게임이 없습니다.</div>
        ) : (
          activeRentals.map((rental: Rental) => {
            const isOverdue = today > rental.endDate;
            const overdueDays = isOverdue ? getDaysDifference(today, rental.endDate) : 0;
            return (
              <div key={rental.rentalId} className={`w-full border p-3.5 rounded-2xl flex justify-between items-center ${isOverdue ? 'border-rose-300 bg-rose-50/40' : 'border-amber-300/60 bg-amber-50/40'}`}>
                <div className="min-w-0 flex-1 pr-2">
                  {/* ⚡ 게임명과 게임 ID 간격 한 칸 축소 */}
                  <h4 className="font-bold text-slate-900 text-xs leading-snug break-words">
                    {rental.gameTitle}<span className="text-slate-400 font-medium">({rental.gameId})</span>
                  </h4>
                  <div className="mt-1 space-y-0.5 text-xs text-slate-500">
                    <div>대여일: {rental.startDate}</div>
                    <div>반납예정일: {isOverdue ? <strong className="text-rose-600 font-extrabold">{rental.endDate} (연체 {overdueDays}일)</strong> : <strong>{rental.endDate}</strong>}</div>
                  </div>
                </div>
                <button onClick={() => returnGame(rental.rentalId, rental.gameId)} className="bg-slate-900 text-white font-bold px-3 py-1.5 rounded-xl hover:bg-slate-800 cursor-pointer text-xs flex-shrink-0">반납</button>
              </div>
            );
          })
        )}
      </section>

      {/* 2. 대여 및 반납 이력 */}
      <section className="space-y-2.5 w-full">
        <h3 className="font-extrabold tracking-tight flex items-center gap-2 text-slate-900">
          <span className="w-1.5 h-3.5 bg-slate-400 rounded-full inline-block"></span> 대여 및 반납 이력
        </h3>
        {returnedRentalsList.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-300/40 text-slate-400 rounded-2xl w-full">반납 이력이 없습니다.</div>
        ) : (
          returnedRentalsList.map((rental: Rental) => (
            <div key={rental.rentalId} className="w-full border p-3.5 rounded-2xl flex justify-between items-center bg-white border-slate-200/80">
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  {/* ⚡ 게임명과 게임 ID 간격 한 칸 축소 */}
                  <h4 style={{ color: '#0f172a' }} className="font-bold text-xs leading-snug break-words">
                    {rental.gameTitle}<span className="text-slate-400 font-medium">({rental.gameId})</span>
                  </h4>
                </div>
                <p className="text-slate-500 mt-1 text-xs pl-5">대여일: {rental.startDate} | 반납일: {rental.returnedAt?.split('T')[0] || rental.startDate}</p>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
});

ReturnsTab.displayName = 'ReturnsTab';