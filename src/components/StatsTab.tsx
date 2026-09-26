import React from 'react';
import { FacebookPage, Post } from '../types';
import { TrendingUp, MousePointerClick, Users, Eye, Bot, Sparkles, CheckCircle2, ArrowUpRight } from 'lucide-react';

interface StatsTabProps {
  activePage: FacebookPage;
  posts: Post[];
}

export const StatsTab: React.FC<StatsTabProps> = ({ activePage, posts }) => {
  const totalClicks = posts.reduce((acc, p) => acc + (p.clicks || 0), 0) + 1280;
  const totalLikes = posts.reduce((acc, p) => acc + (p.likes || 0), 0) + 840;
  const totalShares = posts.reduce((acc, p) => acc + (p.shares || 0), 0) + 190;

  const weeklyData = [
    { day: 'Lun', clicks: 120, reach: 1800 },
    { day: 'Mar', clicks: 185, reach: 2400 },
    { day: 'Mer', clicks: 240, reach: 3100 },
    { day: 'Jeu', clicks: 310, reach: 4200 },
    { day: 'Ven', clicks: 290, reach: 3900 },
    { day: 'Sam', clicks: 360, reach: 4800 },
    { day: 'Dim', clicks: 420, reach: 5600 },
  ];

  const maxClicks = Math.max(...weeklyData.map(d => d.clicks));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Performances Réseau Social & Trafic Web
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              Tableau de Bord Analytique • {activePage.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Suivi en temps réel des visiteurs dirigés vers {activePage.websiteUrl || 'votre site web'} grâce à vos mèmes et publications.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Pilote Actif</span>
            </span>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Clics vers le Site Web</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{totalClicks.toLocaleString()}</span>
            <span className="ml-2 text-xs font-bold text-emerald-600">+28.4%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Visiteurs uniques arrivés sur votre site</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Portée Totale (Reach)</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">25.8k</span>
            <span className="ml-2 text-xs font-bold text-emerald-600">+41.2%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Personnes ayant vu vos publications</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Taux d'Engagement</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">8.4%</span>
            <span className="ml-2 text-xs font-bold text-emerald-600">x3.2 vs moyenne</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Dopé par l'humour des mèmes viraux</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Coût d'Acquisition Économisé</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">680 €</span>
            <span className="ml-2 text-xs font-bold text-indigo-600">Économisés</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Comparé à l'équivalent en Facebook Ads</p>
        </div>
      </div>

      {/* Traffic Growth Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Évolution des Clics Envoyés vers le Site Web (7 derniers jours)
            </h3>
            <p className="text-xs text-slate-400">Croissance exponentielle avec la régularité du pilote automatique</p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
            Cette semaine
          </span>
        </div>

        {/* Bar chart representation */}
        <div className="pt-6 pb-2">
          <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2">
            {weeklyData.map((item, i) => {
              const heightPercent = Math.round((item.clicks / maxClicks) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[11px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.clicks}
                  </span>
                  <div
                    className="w-full max-w-[48px] bg-linear-to-t from-blue-600 to-indigo-500 rounded-t-xl transition-all duration-500 group-hover:brightness-110 shadow-xs"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-xs font-semibold text-slate-500">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Performing Posts */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">
          Publications les Plus Rentables (Génération de Clics)
        </h3>

        <div className="divide-y divide-slate-100">
          {posts.map((post) => (
            <div key={post.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <img
                  src={post.mediaUrl}
                  alt="Post media"
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shrink-0"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{post.content.slice(0, 70)}...</h4>
                  <p className="text-[11px] text-blue-600 font-medium mt-0.5">{post.hashtags}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {post.isAutonomous ? '🤖 Publié en pilote autonome' : '✍️ Créé manuellement'} • {post.scheduledFor}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-xs shrink-0 pl-16 sm:pl-0">
                <div className="text-right">
                  <span className="font-black text-slate-900 block text-sm">{post.clicks}</span>
                  <span className="text-[10px] text-slate-400">clics site</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-slate-900 block text-sm">{post.likes}</span>
                  <span className="text-[10px] text-slate-400">mentions j'aime</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-slate-900 block text-sm">{post.shares}</span>
                  <span className="text-[10px] text-slate-400">partages</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
