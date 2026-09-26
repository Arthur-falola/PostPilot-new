import React, { useState } from 'react';
import { CommunityTemplate, FacebookPage } from '../types';
import { Sparkles, TrendingUp, MousePointerClick, Play, ArrowRight, UserCheck, Check } from 'lucide-react';

interface CommunityTemplatesTabProps {
  templates: CommunityTemplate[];
  activePage: FacebookPage;
  onAdaptTemplate: (template: CommunityTemplate) => void;
}

export const CommunityTemplatesTab: React.FC<CommunityTemplatesTabProps> = ({
  templates,
  activePage,
  onAdaptTemplate
}) => {
  const [selectedNiche, setSelectedNiche] = useState<string>('Tous');

  const niches = ['Tous', 'SaaS & Tech', 'E-commerce', 'Freelance & Agence', 'Coaching & Formation'];

  const filtered = selectedNiche === 'Tous'
    ? templates
    : templates.filter(t => t.niche === selectedNiche);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Swipe File Communautaire & Mèmes Viraux</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Modèles Déjà Éprouvés par d'Autres Clients
          </h2>
          <p className="text-xs sm:text-sm text-purple-200 leading-relaxed">
            Ne partez jamais d'une page blanche. Découvrez les publications et vidéos mèmes qui ont généré le plus de clics vers des sites web et adaptez-les en 1 clic pour {activePage.name} !
          </p>
        </div>

        {/* Niche Filter Pills */}
        <div className="flex items-center space-x-2 mt-6 overflow-x-auto pb-1">
          {niches.map((niche) => (
            <button
              key={niche}
              onClick={() => setSelectedNiche(niche)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedNiche === niche
                  ? 'bg-white text-purple-900 shadow-sm'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {niche}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
          >
            {/* Top Creator Info & Metrics */}
            <div className="p-5 pb-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <img
                    src={item.authorAvatar}
                    alt={item.author}
                    className="w-8 h-8 rounded-full object-cover border border-slate-100"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{item.author}</span>
                    <span className="text-[10px] text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-full">
                      {item.niche}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{item.performance}</span>
                </div>
              </div>

              <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
            </div>

            {/* Visual Meme Display */}
            <div className="relative bg-slate-950 aspect-16/10 overflow-hidden flex items-center justify-center">
              <img
                src={item.mediaUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Meme Text overlay */}
              {item.topText && (
                <div className="absolute top-2 inset-x-2 text-center pointer-events-none px-3">
                  <span className="meme-text text-white text-xs sm:text-sm font-black uppercase leading-tight tracking-wider block">
                    {item.topText}
                  </span>
                </div>
              )}
              {item.bottomText && (
                <div className="absolute bottom-2 inset-x-2 text-center pointer-events-none px-3">
                  <span className="meme-text text-white text-xs sm:text-sm font-black uppercase leading-tight tracking-wider block">
                    {item.bottomText}
                  </span>
                </div>
              )}

              {/* Clicks badge */}
              <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold rounded-full flex items-center space-x-1.5">
                <MousePointerClick className="w-3 h-3 text-cyan-400" />
                <span>{item.clicksGenerated.toLocaleString()} clics générés</span>
              </div>
            </div>

            {/* Post Excerpt & CTA */}
            <div className="p-5 pt-4 space-y-4">
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {item.content}
              </p>

              <div className="text-[11px] text-blue-600 font-medium">
                {item.hashtags}
              </div>

              {/* Action: Adapt to user's site */}
              <button
                onClick={() => onAdaptTemplate(item)}
                className="w-full py-2.5 px-4 bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer group/btn"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600 group-hover/btn:text-white transition-colors" />
                <span>Adapter à mon site ({activePage.name})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
