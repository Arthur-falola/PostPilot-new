import React from 'react';
import { ThumbsUp, MessageCircle, Share2, Globe, CheckCircle2, Play } from 'lucide-react';

interface FacebookLivePreviewProps {
  pageName: string;
  pageAvatar: string;
  content: string;
  hashtags?: string;
  cta?: string;
  mediaType?: 'image' | 'meme' | 'video';
  mediaUrl?: string;
  memeTopText?: string;
  memeBottomText?: string;
  scheduledTime?: string;
}

export const FacebookLivePreview: React.FC<FacebookLivePreviewProps> = ({
  pageName,
  pageAvatar,
  content,
  hashtags = '',
  cta = '',
  mediaType = 'meme',
  mediaUrl,
  memeTopText = '',
  memeBottomText = '',
  scheduledTime = 'Programmé'
}) => {
  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-slate-800">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={pageAvatar || 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=120&q=80'}
              alt={pageName}
              className="w-10 h-10 rounded-full object-cover border border-slate-100"
            />
            <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-0.5 text-white">
              <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-slate-900 text-sm">{pageName || 'PostPilot'}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500 text-white" />
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-500">
              <span>{scheduledTime}</span>
              <span>•</span>
              <Globe className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </div>

        <button className="text-slate-400 hover:text-slate-600 p-1 rounded-full">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
      </div>

      {/* Post Text Content */}
      <div className="px-4 pb-3">
        {content ? (
          <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
            {content}
          </p>
        ) : (
          <p className="text-sm text-slate-400 italic">
            Votre texte apparaîtra ici en temps réel au fur et à mesure de votre saisie...
          </p>
        )}

        {hashtags && (
          <p className="text-sm text-blue-600 font-medium mt-2 leading-relaxed break-words">
            {hashtags}
          </p>
        )}

        {cta && (
          <div className="mt-3 p-2.5 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-900 font-medium flex items-center space-x-2">
            <span className="text-blue-600 font-bold">CTA :</span>
            <span className="line-clamp-2">{cta}</span>
          </div>
        )}
      </div>

      {/* Visual Media / Meme Container */}
      {mediaUrl && (
        <div className="relative bg-slate-900 overflow-hidden w-full aspect-4/3 flex items-center justify-center">
          {mediaType === 'video' ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                src={mediaUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full flex items-center space-x-1">
                <Play className="w-2.5 h-2.5 fill-current" />
                <span>MÈMÉ VIDÉO</span>
              </div>
            </div>
          ) : (
            <img
              src={mediaUrl}
              alt="Mème Facebook"
              className="w-full h-full object-cover"
            />
          )}

          {/* Meme Overlay Text */}
          {memeTopText && (
            <div className="absolute top-3 inset-x-2 text-center pointer-events-none px-3">
              <span className="meme-text text-white text-lg sm:text-xl md:text-2xl font-black uppercase leading-tight tracking-wider block">
                {memeTopText}
              </span>
            </div>
          )}

          {memeBottomText && (
            <div className="absolute bottom-3 inset-x-2 text-center pointer-events-none px-3">
              <span className="meme-text text-white text-lg sm:text-xl md:text-2xl font-black uppercase leading-tight tracking-wider block">
                {memeBottomText}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Post Reactions Stats */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-500 border-b border-slate-100">
        <div className="flex items-center space-x-1.5">
          <div className="flex -space-x-1">
            <span className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px]">
              👍
            </span>
            <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-[9px]">
              ❤️
            </span>
            <span className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-white text-[9px]">
              😂
            </span>
          </div>
          <span>142</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>28 commentaires</span>
          <span>14 partages</span>
        </div>
      </div>

      {/* Action Buttons (Like, Comment, Share) */}
      <div className="px-2 py-1 flex items-center justify-around border-t border-slate-100 text-slate-600 text-xs font-semibold">
        <button className="flex-1 py-2 flex items-center justify-center space-x-2 hover:bg-slate-50 rounded-lg transition-colors">
          <ThumbsUp className="w-4 h-4 text-slate-500" />
          <span>J'aime</span>
        </button>
        <button className="flex-1 py-2 flex items-center justify-center space-x-2 hover:bg-slate-50 rounded-lg transition-colors">
          <MessageCircle className="w-4 h-4 text-slate-500" />
          <span>Commenter</span>
        </button>
        <button className="flex-1 py-2 flex items-center justify-center space-x-2 hover:bg-slate-50 rounded-lg transition-colors">
          <Share2 className="w-4 h-4 text-slate-500" />
          <span>Partager</span>
        </button>
      </div>
    </div>
  );
};
