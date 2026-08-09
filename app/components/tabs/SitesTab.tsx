'use client';

import { memo } from 'react';
import { BoardSite } from '../../types';
import { Globe, ExternalLink, Loader2 } from 'lucide-react';

export const SitesTab = memo(({ isInitialLoaded, isDarkMode, visibleSitesList }: any) => {
  return (
    <div className="space-y-4 mt-0.5 w-full">
      <div className={`pb-2 border-b flex justify-between items-end w-full ${isDarkMode ? 'border-slate-800' : 'border-slate-200/80'}`}>
        <h2 className={`font-black tracking-tight flex items-center gap-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
          <Globe size={18} className="text-sky-500" /> 추천 보드게임 사이트
        </h2>
      </div>

      <div className="grid gap-3.5 w-full min-h-[160px] relative">
        {!isInitialLoaded ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
            <Loader2 size={20} className="animate-spin text-slate-500" />
            <span className="text-[11px] font-medium text-slate-400">추천 사이트를 불러오는 중...</span>
          </div>
        ) : !visibleSitesList || visibleSitesList.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-300/40 text-slate-400 rounded-2xl w-full text-xs">
            등록된 추천 사이트가 없습니다.
          </div>
        ) : (
          visibleSitesList.map((site: BoardSite) => (
            <a key={site.siteId} href={site.url} target="_blank" rel="noopener noreferrer" className={`w-full border rounded-2xl overflow-hidden block shadow-sm transition ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200/80'}`}>
              <div className="h-28 bg-slate-200 relative overflow-hidden">
                <img src={site.bannerUrl} alt={site.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=600'; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent flex items-end p-3">
                  <span className="text-white font-extrabold text-sm flex items-center gap-1.5">{site.name} <ExternalLink size={13} className="text-sky-400" /></span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs text-slate-500">{site.description}</p>
                <span className="text-[10px] text-sky-500 font-mono block mt-1.5 truncate">{site.url}</span>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
});

SitesTab.displayName = 'SitesTab';