import React, { useState } from 'react';
import { Post, FacebookPage } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  Rocket,
  Sparkles,
  Eye,
  Calendar as CalendarIcon
} from 'lucide-react';

interface CalendarViewProps {
  posts: Post[];
  activePage: FacebookPage;
  onOpenComposer: (prefillDate?: string) => void;
  onViewPostPreview: (post: Post) => void;
  onOpenSkyboost: (post: Post) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  posts,
  activePage,
  onOpenComposer,
  onViewPostPreview,
  onOpenSkyboost
}) => {
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 25)); // Sept 2026 (matching app state)

  // Helpers for Month View
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const prevPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 7);
      setCurrentDate(prev);
    }
  };

  const nextPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 7);
      setCurrentDate(next);
    }
  };

  const resetToToday = () => {
    setCurrentDate(new Date(2026, 8, 25));
  };

  // Helper to extract or match date from post.scheduledFor or post.createdAt
  const getPostDateKey = (post: Post): string => {
    // If post has "Demain à 10:00", "Hier à 14:00", "07/09/2026 10:00", etc.
    const text = (post.scheduledFor || '') + ' ' + (post.createdAt || '');
    // Check for DD/MM/YYYY
    const dmy = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (dmy) {
      const d = parseInt(dmy[1], 10);
      const m = parseInt(dmy[2], 10) - 1;
      const y = parseInt(dmy[3], 10);
      return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    // Relative keywords mapping to Sept 2026 reference
    if (text.includes("Aujourd'hui") || text.includes("instant")) {
      return '2026-09-25';
    }
    if (text.includes('Demain')) {
      return '2026-09-26';
    }
    if (text.includes('Hier')) {
      return '2026-09-24';
    }
    return '2026-09-25';
  };

  // Build calendar matrix for month view
  const firstDayOfMonth = new Date(year, month, 1);
  // In France: Monday is 0, Sunday is 6
  let firstDayIndex = firstDayOfMonth.getDay() - 1;
  if (firstDayIndex === -1) firstDayIndex = 6;

  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const calendarDays: Array<{
    dayNumber: number;
    monthOffset: number; // -1 prev, 0 current, 1 next
    dateKey: string;
    isToday: boolean;
  }> = [];

  // Prev month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = prevMonthTotalDays - i;
    const m = month === 0 ? 12 : month;
    const y = month === 0 ? year - 1 : year;
    const dateKey = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarDays.push({
      dayNumber: day,
      monthOffset: -1,
      dateKey,
      isToday: dateKey === '2026-09-25'
    });
  }

  // Current month days
  for (let i = 1; i <= totalDaysInMonth; i++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarDays.push({
      dayNumber: i,
      monthOffset: 0,
      dateKey,
      isToday: dateKey === '2026-09-25'
    });
  }

  // Next month padding to fill grid (42 days or 35 days)
  const remainingCells = 35 - calendarDays.length > 0 ? 35 - calendarDays.length : 42 - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    const m = month === 11 ? 1 : month + 2;
    const y = month === 11 ? year + 1 : year;
    const dateKey = `${y}-${String(m).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarDays.push({
      dayNumber: i,
      monthOffset: 1,
      dateKey,
      isToday: dateKey === '2026-09-25'
    });
  }

  // Group posts by dateKey
  const postsByDate: Record<string, Post[]> = {};
  posts.forEach(p => {
    const key = getPostDateKey(p);
    if (!postsByDate[key]) postsByDate[key] = [];
    postsByDate[key].push(p);
  });

  // Calculate week days for Week View
  const getWeekDays = (baseDate: Date) => {
    const current = new Date(baseDate);
    const dayOfWeek = current.getDay();
    const diff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek; // Monday
    const monday = new Date(current.setDate(current.getDate() + diff));

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      week.push({
        date: d,
        dayNumber: d.getDate(),
        dayName: daysOfWeek[i],
        dateKey,
        isToday: dateKey === '2026-09-25'
      });
    }
    return week;
  };

  const currentWeekDays = getWeekDays(currentDate);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Calendar Header Controls */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/40">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight capitalize">
              {viewMode === 'month'
                ? `${monthNames[month]} ${year}`
                : `Semaine du ${currentWeekDays[0].dayNumber} au ${currentWeekDays[6].dayNumber} ${monthNames[currentWeekDays[6].date.getMonth()]}`
              }
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Planning éditorial Facebook • {posts.length} publication(s) synchronisée(s)
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* View Toggle (Hebdomadaire vs Mensuel) */}
          <div className="inline-flex bg-slate-200/70 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vue Mensuelle
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vue Hebdomadaire
            </button>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={resetToToday}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
            >
              Aujourd'hui
            </button>
            <button
              onClick={prevPeriod}
              className="p-1.5 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
              title="Période précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextPeriod}
              className="p-1.5 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
              title="Période suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* New Post Button */}
          <button
            onClick={() => onOpenComposer()}
            className="py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4" />
            <span>Programmer</span>
          </button>
        </div>
      </div>

      {/* VIEW: MONTH */}
      {viewMode === 'month' && (
        <div className="p-4 sm:p-6">
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center">
            {daysOfWeek.map((day, idx) => (
              <div
                key={day}
                className={`text-xs font-bold uppercase tracking-wider py-1.5 ${
                  idx >= 5 ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((cell, idx) => {
              const dayPosts = postsByDate[cell.dateKey] || [];
              const isCurrentMonth = cell.monthOffset === 0;

              return (
                <div
                  key={`${cell.dateKey}-${idx}`}
                  className={`min-h-[110px] sm:min-h-[130px] p-2 rounded-2xl border transition-all flex flex-col justify-between group ${
                    cell.isToday
                      ? 'bg-blue-50/40 border-blue-300 ring-2 ring-blue-500/15'
                      : isCurrentMonth
                      ? 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                      : 'bg-slate-50/50 border-slate-100 text-slate-400'
                  }`}
                >
                  {/* Date number & Quick add */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        cell.isToday
                          ? 'bg-blue-600 text-white shadow-xs'
                          : isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    <button
                      onClick={() => onOpenComposer(`${String(cell.dayNumber).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year} 10:00`)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-1 rounded-lg transition-all"
                      title="Programmer pour ce jour"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Day Posts List */}
                  <div className="space-y-1.5 my-1 overflow-y-auto max-h-[85px] no-scrollbar">
                    {dayPosts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => onViewPostPreview(post)}
                        className={`p-1.5 rounded-xl border text-[11px] cursor-pointer transition-all flex items-center space-x-1.5 shadow-2xs hover:scale-[1.02] ${
                          post.status === 'published'
                            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                            : 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="w-6 h-6 rounded-md overflow-hidden bg-slate-800 shrink-0">
                          {post.mediaUrl ? (
                            <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] text-white">FB</div>
                          )}
                        </div>

                        {/* Title or Snippet */}
                        <div className="min-w-0 flex-1 truncate font-semibold">
                          {post.memeTopText || post.content.slice(0, 22) + '...'}
                        </div>

                        {/* Skyboost Icon */}
                        {post.skyboostBoostRequested && (
                          <Rocket className="w-3 h-3 text-amber-500 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Empty state placeholder / indicator */}
                  {dayPosts.length === 0 && (
                    <div className="text-[10px] text-slate-300 text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      + Ajouter
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: WEEK */}
      {viewMode === 'week' && (
        <div className="p-4 sm:p-6 overflow-x-auto">
          <div className="grid grid-cols-7 gap-3 min-w-[700px]">
            {currentWeekDays.map((col) => {
              const dayPosts = postsByDate[col.dateKey] || [];

              return (
                <div
                  key={col.dateKey}
                  className={`rounded-2xl border p-3 flex flex-col min-h-[380px] ${
                    col.isToday
                      ? 'bg-blue-50/30 border-blue-300 ring-2 ring-blue-500/10'
                      : 'bg-slate-50/40 border-slate-200'
                  }`}
                >
                  {/* Column Header */}
                  <div className="pb-3 border-b border-slate-200/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase">{col.dayName}</div>
                      <div className={`text-lg font-black ${col.isToday ? 'text-blue-600' : 'text-slate-800'}`}>
                        {col.dayNumber} {monthNames[col.date.getMonth()].slice(0, 3)}
                      </div>
                    </div>
                    {col.isToday && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                        Aujourd'hui
                      </span>
                    )}
                  </div>

                  {/* Post cards in this day */}
                  <div className="py-3 flex-1 space-y-2.5 overflow-y-auto">
                    {dayPosts.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-3 text-slate-400">
                        <Clock className="w-5 h-5 stroke-[1.5] mb-1 opacity-40" />
                        <span className="text-[11px]">Rien de programmé</span>
                      </div>
                    ) : (
                      dayPosts.map((post) => (
                        <div
                          key={post.id}
                          className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-2xs hover:shadow-xs transition-all space-y-2 group"
                        >
                          {/* Image & Status Badge */}
                          <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900">
                            {post.mediaUrl && (
                              <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" />
                            )}
                            <div className="absolute top-1.5 left-1.5">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                post.status === 'published'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-blue-600 text-white'
                              }`}>
                                {post.status === 'published' ? 'Publié' : 'Programmé'}
                              </span>
                            </div>
                            {post.skyboostBoostRequested && (
                              <div className="absolute top-1.5 right-1.5 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center space-x-0.5">
                                <Rocket className="w-2.5 h-2.5" />
                                <span>+{post.skyboostTargetLikes || 100}</span>
                              </div>
                            )}
                          </div>

                          {/* Content Snippet */}
                          <div>
                            <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug">
                              {post.content}
                            </p>
                            <span className="text-[10px] text-slate-400 block mt-1">
                              ⏰ {post.scheduledFor || "À l'instant"}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-1.5 pt-1 border-t border-slate-100">
                            <button
                              onClick={() => onViewPostPreview(post)}
                              className="flex-1 py-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center space-x-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Aperçu</span>
                            </button>
                            {!post.skyboostBoostRequested && (
                              <button
                                onClick={() => onOpenSkyboost(post)}
                                className="py-1 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center space-x-1"
                                title="Booster les likes Skyboost"
                              >
                                <Rocket className="w-3 h-3" />
                                <span>Boost</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add button on column bottom */}
                  <button
                    onClick={() => onOpenComposer(`${String(col.dayNumber).padStart(2, '0')}/${String(col.date.getMonth() + 1).padStart(2, '0')}/${col.date.getFullYear()} 10:00`)}
                    className="w-full py-2 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-xl border border-dashed border-slate-300 hover:border-blue-300 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Planifier</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Calendar Footer Stats */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span className="font-semibold text-slate-700">
              {posts.filter(p => p.status === 'scheduled').length} Programmées
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-700">
              {posts.filter(p => p.status === 'published').length} Publiées
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Rocket className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-semibold text-slate-700">
              {posts.filter(p => p.skyboostBoostRequested).length} Boosts SkyBoost actifs
            </span>
          </div>
        </div>

        <span className="text-[11px] text-slate-400">
          💡 Cliquez sur n'importe quel post pour afficher l'aperçu réel ou programmer une nouvelle date.
        </span>
      </div>
    </div>
  );
};
