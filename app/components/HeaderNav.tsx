'use client';

import { memo } from 'react';
import { 
  UserCheck, AlertCircle, Siren, Settings, Boxes, 
  PackageCheck, Trophy, Globe, ShieldCheck 
} from 'lucide-react';

const IOS_CONFIG = {
  HEADER_LOGO_HEIGHT: 'h-9',         
  HEADER_ICON_SIZE: 22,               
  HEADER_USER_TEXT_SIZE: 'text-sm',   
  HEADER_BADGE_TEXT_SIZE: 'text-xs',  
  NAV_ICON_SIZE: 24,                  
  NAV_TEXT_SIZE: 'text-xs',           
  NAV_PADDING_BOTTOM: 'pb-[max(12px,env(safe-area-inset-bottom))]', 
};

export const FixedHeader = memo(({ 
  isHeaderAdminTheme, 
  isIosDevice, 
  currentUser, 
  today, 
  unreadReportsCount, 
  setIsAdminReportDrawerOpen, 
  setIsSettingsOpen, 
  headerRef
}: any) => {
  const penaltyScore = Number(currentUser?.penaltyPoints || 0);
  const hasPenaltyPoints = penaltyScore > 0;
  const isPenaltyActive = currentUser?.penaltyEndDate && String(currentUser.penaltyEndDate) >= String(today);

  return (
    <header 
      ref={headerRef}
      style={{ 
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        fontSize: '12px' 
      }} 
      className={`fixed top-0 left-0 right-0 w-full px-4 pb-2.5 z-40 shadow-sm flex justify-between items-center transition-colors border-0 outline-none ${
        isHeaderAdminTheme ? 'bg-sky-400 border-b border-sky-500/40 text-slate-900' : 'bg-[#FEE500] border-b border-amber-300/40 text-slate-900'
      }`}
    >
      <div className="w-full flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <img 
              src="/header_logo.png" 
              alt="kakao board games" 
              className={`w-auto object-contain drop-shadow-sm ${isIosDevice ? IOS_CONFIG.HEADER_LOGO_HEIGHT : 'h-9'}`}
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
          </div>

          <div className={`flex flex-wrap items-center gap-1.5 font-bold text-slate-900 ${isIosDevice ? IOS_CONFIG.HEADER_USER_TEXT_SIZE : 'text-xs'}`}>
            <div className="flex items-center gap-1">
              <UserCheck size={14} className="text-slate-900 flex-shrink-0" />
              <span>{currentUser?.userId}</span>
            </div>

            {hasPenaltyPoints && (
              <span className={`bg-rose-600 text-white px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs ${
                isIosDevice ? IOS_CONFIG.HEADER_BADGE_TEXT_SIZE : 'text-[10px]'
              }`}>
                <AlertCircle size={11} className="flex-shrink-0" />
                <span className="font-normal opacity-90">
                  {isPenaltyActive ? `${currentUser.penaltyEndDate} 까지 대여정지` : '대여정지'}
                </span>
              </span>
            )}
          </div>
        </div>

        {isHeaderAdminTheme ? (
          <button
            type="button"
            onClick={() => setIsAdminReportDrawerOpen(true)}
            title="신고/건의 확인"
            className="p-2 rounded-xl font-bold transition flex items-center justify-center shadow-sm bg-sky-300 hover:bg-sky-200 text-slate-900 relative cursor-pointer"
          >
            <Siren size={isIosDevice ? IOS_CONFIG.HEADER_ICON_SIZE : 18} />
            {unreadReportsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-extrabold w-4 h-4 rounded-full flex items-center justify-center text-[9px] border-2 border-sky-400 shadow-sm">
                N
              </span>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            title="설정"
            className="p-2 rounded-xl font-bold transition flex items-center justify-center shadow-sm bg-amber-400/80 hover:bg-amber-400 text-slate-900 cursor-pointer"
          >
            <Settings size={isIosDevice ? IOS_CONFIG.HEADER_ICON_SIZE : 18} />
          </button>
        )}
      </div>
    </header>
  );
});
FixedHeader.displayName = 'FixedHeader';

// 하단 네비게이션
export const FixedBottomNav = memo(({ 
  isIosDevice, 
  activeTab, 
  isAdmin, 
  unreadReportsCount, 
  activeRentalsCount = 0,
  hasOverdueRental = false,
  handleTabChange 
}: any) => {
  return (
    <nav 
      style={{ fontSize: '11px' }}
      className={`fixed bottom-0 left-0 right-0 w-full z-40 shadow-lg transition-colors border-t bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 ${
        isIosDevice ? IOS_CONFIG.NAV_PADDING_BOTTOM : 'pb-[calc(env(safe-area-inset-bottom,0px)+12px)]'
      }`}
    >
      {isIosDevice && (
        <div 
          aria-hidden="true"
          className="absolute left-0 right-0 -bottom-[100px] h-[100px] pointer-events-none z-0 bg-white dark:bg-slate-900" 
        />
      )}

      <div className="flex justify-around px-2 pt-2.5 pb-2 relative z-10">
        {/* 대여 탭 */}
        <button 
          type="button" 
          onClick={() => handleTabChange('games')} 
          className={`flex flex-col items-center font-bold cursor-pointer ${isIosDevice ? IOS_CONFIG.NAV_TEXT_SIZE : 'text-[10px]'} ${
            activeTab === 'games' 
              ? 'text-slate-900 dark:text-white' 
              : 'text-slate-400 dark:!text-slate-400'
          }`}
        >
          <Boxes size={isIosDevice ? IOS_CONFIG.NAV_ICON_SIZE : 20} />
          <span className="mt-1">대여</span>
        </button>

        {/* 반납 탭 */}
        <button 
          type="button" 
          onClick={() => handleTabChange('returns')} 
          className={`flex flex-col items-center font-bold cursor-pointer relative ${isIosDevice ? IOS_CONFIG.NAV_TEXT_SIZE : 'text-[10px]'} ${
            activeTab === 'returns' 
              ? 'text-slate-900 dark:text-white' 
              : 'text-slate-400 dark:!text-slate-400'
          }`}
        >
          <div className="relative inline-flex items-center justify-center">
            <PackageCheck size={isIosDevice ? IOS_CONFIG.NAV_ICON_SIZE : 20} />
            
            {/* 대여 중일 때 레드닷 */}
            {activeRentalsCount > 0 && (
              <span className="absolute -top-1 -right-1.5 flex h-2.5 w-2.5 z-10">
                {hasOverdueRental && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                )}
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 ring-2 ring-white dark:ring-slate-900"></span>
              </span>
            )}
          </div>
          <span className="mt-1">반납</span>
        </button>

        {/* 랭킹 탭 */}
        <button 
          type="button" 
          onClick={() => handleTabChange('ranking')} 
          className={`flex flex-col items-center font-bold cursor-pointer ${isIosDevice ? IOS_CONFIG.NAV_TEXT_SIZE : 'text-[10px]'} ${
            activeTab === 'ranking' 
              ? 'text-slate-900 dark:text-white' 
              : 'text-slate-400 dark:!text-slate-400'
          }`}
        >
          <Trophy size={isIosDevice ? IOS_CONFIG.NAV_ICON_SIZE : 20} />
          <span className="mt-1">랭킹</span>
        </button>

        {/* 사이트 탭 */}
        <button 
          type="button" 
          onClick={() => handleTabChange('sites')} 
          className={`flex flex-col items-center font-bold cursor-pointer ${isIosDevice ? IOS_CONFIG.NAV_TEXT_SIZE : 'text-[10px]'} ${
            activeTab === 'sites' 
              ? 'text-slate-900 dark:text-white' 
              : 'text-slate-400 dark:!text-slate-400'
          }`}
        >
          <Globe size={isIosDevice ? IOS_CONFIG.NAV_ICON_SIZE : 20} />
          <span className="mt-1">사이트</span>
        </button>

        {/* 관리자 탭 */}
        {isAdmin && (
          <button 
            type="button" 
            onClick={() => handleTabChange('admin')} 
            className={`flex flex-col items-center font-bold cursor-pointer relative ${isIosDevice ? IOS_CONFIG.NAV_TEXT_SIZE : 'text-[10px]'} ${
              activeTab === 'admin' 
                ? 'text-sky-500 dark:text-sky-400' 
                : 'text-slate-400 dark:!text-slate-400'
            }`}
          >
            <div className="relative">
              <ShieldCheck size={isIosDevice ? IOS_CONFIG.NAV_ICON_SIZE : 20} />
              {unreadReportsCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-rose-600 text-white font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] border border-white shadow-sm">
                  N
                </span>
              )}
            </div>
            <span className="mt-1">관리자</span>
          </button>
        )}
      </div>
    </nav>
  );
});
FixedBottomNav.displayName = 'FixedBottomNav';