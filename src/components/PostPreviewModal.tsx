import React from 'react';
import { Post } from '../types';
import { FacebookLivePreview } from './FacebookLivePreview';
import { X, Calendar, MousePointerClick, Heart, Share2, Rocket } from 'lucide-react';

interface PostPreviewModalProps {
  post: Post | null;
  onClose: () => void;
  onOpenSkyboost?: (post: Post) => void;
}

export const PostPreviewModal: React.FC<PostPreviewModalProps> = ({ post, onClose, onOpenSkyboost }) => {
  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Aperçu Facebook • {post.pageName}
            </h3>
            <p className="text-[11px] text-slate-500">
              Statut : <span className="font-semibold text-blue-600">{post.status === 'published' ? 'Publié' : 'Programmé'}</span> ({post.scheduledFor})
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          <FacebookLivePreview
            pageName={post.pageName}
            pageAvatar={post.pageAvatar}
            content={post.content}
            hashtags={post.hashtags}
            cta={post.cta}
            mediaType={post.mediaType}
            mediaUrl={post.mediaUrl}
            memeTopText={post.memeTopText}
            memeBottomText={post.memeBottomText}
            scheduledTime={post.scheduledFor}
          />

          {/* Quick Metrics */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-3 gap-3 text-center text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Clics Site</span>
              <span className="text-base font-extrabold text-blue-600">{post.clicks}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">J'aime</span>
              <span className="text-base font-extrabold text-slate-900">{post.likes}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Partages</span>
              <span className="text-base font-extrabold text-slate-900">{post.shares}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          {onOpenSkyboost ? (
            <button
              onClick={() => {
                onClose();
                onOpenSkyboost(post);
              }}
              className="px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold flex items-center space-x-1.5 border border-orange-200 cursor-pointer"
            >
              <Rocket className="w-3.5 h-3.5 fill-current" />
              <span>Booster les likes (SkyBoost)</span>
            </button>
          ) : (
            <div></div>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Fermer l'aperçu
          </button>
        </div>
      </div>
    </div>
  );
};

