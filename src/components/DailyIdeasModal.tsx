import React, { useState } from 'react';
import { Sparkles, X, ThumbsUp, Calendar, ArrowRight, Share2, Layers } from 'lucide-react';
import { DailyIdea, MemeTemplate } from '../types';

interface DailyIdeasModalProps {
  isOpen: boolean;
  onClose: () => void;
  ideas: DailyIdea[];
  memeTemplates: MemeTemplate[];
  onSelectIdea: (idea: DailyIdea, memeTemplate?: MemeTemplate) => void;
}

export const DailyIdeasModal: React.FC<DailyIdeasModalProps> = ({
  isOpen,
  onClose,
  ideas,
  memeTemplates,
  onSelectIdea
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen || ideas.length === 0) return null;

  const currentIdea = ideas[currentIndex];
  const pairedMeme = memeTemplates.find(m => m.id === currentIdea.recommendedMemeId) || memeTemplates[0];

  const handleNext = () => {
    if (currentIndex < ideas.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // loop
    }
  };

  const handlePrevOrPass = () => {
    if (currentIndex < ideas.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleApprove = () => {
    onSelectIdea(currentIdea, pairedMeme);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 fill-purple-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Idées du jour</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-purple-200 transition-all space-y-4">
            {/* Category tag */}
            <div className="text-xs font-extrabold uppercase tracking-wider text-purple-600">
              {currentIdea.category}
            </div>

            {/* Post text */}
            <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-line font-normal">
              {currentIdea.content}
            </div>

            {/* Hashtags */}
            <div className="text-blue-600 text-xs font-semibold">
              {currentIdea.hashtags}
            </div>

            {/* CTA Box */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-snug">
              <span className="font-bold text-slate-900">CTA : </span>
              <span>{currentIdea.cta}</span>
            </div>

            {/* Recommended Meme Visual Pill */}
            {pairedMeme && (
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center space-x-1.5 font-medium text-slate-600">
                  <Layers className="w-3.5 h-3.5 text-purple-500" />
                  <span>Mème suggéré : {pairedMeme.name}</span>
                </span>
                <span className="text-[11px] bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded-full">
                  Idéal conversion
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions Bar (Matches Screenshot 2) */}
        <div className="p-6 pt-2 bg-white border-t border-slate-100 flex flex-col items-center space-y-3">
          <div className="flex items-center justify-center space-x-8">
            {/* Pass / Discard button */}
            <button
              onClick={handlePrevOrPass}
              className="w-16 h-16 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 hover:bg-slate-50 active:scale-95 transition-all shadow-xs"
              title="Passer à l'idée suivante"
            >
              <X className="w-7 h-7 stroke-[2.5]" />
            </button>

            {/* Approve / Use button */}
            <button
              onClick={handleApprove}
              className="w-16 h-16 rounded-full bg-linear-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all"
              title="Utiliser cette idée dans mon studio"
            >
              <ThumbsUp className="w-7 h-7 stroke-[2.5] fill-white/20" />
            </button>
          </div>

          {/* Counter info matching screenshot */}
          <div className="text-xs text-slate-400 font-medium">
            {currentIndex + 1} / {ideas.length} — glisse ou utilise les boutons
          </div>

          <button
            onClick={handleApprove}
            className="w-full mt-1 py-2.5 px-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Programmer directement cette publication pour mon site</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
