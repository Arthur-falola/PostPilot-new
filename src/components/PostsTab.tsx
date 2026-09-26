import React, { useState } from 'react';
import { Post, FacebookPage } from '../types';
import {
  Plus,
  Sparkles,
  Image as ImageIcon,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  Bot,
  MousePointerClick,
  Rocket,
  Zap,
  Check,
  LayoutList
} from 'lucide-react';
import { CalendarView } from './CalendarView';

interface PostsTabProps {
  posts: Post[];
  activePage: FacebookPage;
  onOpenComposer: (prefillDate?: string) => void;
  onOpenDailyIdeas: () => void;
  onOpenMemes: () => void;
  onDeletePost: (id: string) => void;
  onViewPostPreview: (post: Post) => void;
  onOpenSkyboost: (post: Post) => void;
  onPublishToFacebook?: (postId: string) => Promise<boolean | void>;
}

export const PostsTab: React.FC<PostsTabProps> = ({
  posts,
  activePage,
  onOpenComposer,
  onOpenDailyIdeas,
  onOpenMemes,
  onDeletePost,
  onViewPostPreview,
  onOpenSkyboost,
  onPublishToFacebook
}) => {
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'published'>('all');
  const [viewLayout, setViewLayout] = useState<'list' | 'calendar'>('calendar');
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const handlePublishClick = async (postId: string) => {
    if (!onPublishToFacebook) return;
    setPublishingId(postId);
    try {
      await onPublishToFacebook(postId);
    } finally {
      setPublishingId(null);
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (filter === 'all') return true;
    return post.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Publications Facebook</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60">
              {posts.length} au total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Page active : <span className="font-bold text-slate-700">{activePage.name}</span> • Publications synchronisées avec Cloud SQL
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Layout switcher: Liste vs Calendrier */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200/70">
            <button
              onClick={() => setViewLayout('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewLayout === 'calendar'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendrier</span>
            </button>
            <button
              onClick={() => setViewLayout('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                viewLayout === 'list'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Liste</span>
            </button>
          </div>

          <button
            onClick={onOpenDailyIdeas}
            className="py-2.5 px-3.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer border border-purple-200/70"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>✨ Idées du jour</span>
          </button>

          <button
            onClick={onOpenMemes}
            className="py-2.5 px-3.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer border border-indigo-200/70"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Studio Mèmes</span>
          </button>

          <button
            onClick={() => onOpenComposer()}
            className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nouvelle publication</span>
          </button>
        </div>
      </div>

      {/* Conditionally Render: Calendar View or List View */}
      {viewLayout === 'calendar' ? (
        <CalendarView
          posts={posts}
          activePage={activePage}
          onOpenComposer={onOpenComposer}
          onViewPostPreview={onViewPostPreview}
          onOpenSkyboost={onOpenSkyboost}
        />
      ) : (
        <>
          {/* Filter Tabs */}
          <div className="flex items-center space-x-2">
            {[
              { id: 'all', label: 'Toutes les publications' },
              { id: 'scheduled', label: 'Programmées' },
              { id: 'published', label: 'Déjà publiées' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filter === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">Aucune publication trouvée</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Utilisez les idées du jour ou le générateur de mèmes pour alimenter votre page Facebook automatiquement.
                </p>
                <button
                  onClick={onOpenDailyIdeas}
                  className="mt-2 py-2 px-4 bg-purple-600 text-white rounded-xl text-xs font-bold inline-flex items-center space-x-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Générer avec les Idées du jour</span>
                </button>
              </div>
            ) : (
              filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              {/* Media preview thumbnail */}
              <div className="flex items-start space-x-4 flex-1">
                <div
                  onClick={() => onViewPostPreview(post)}
                  className="relative w-24 h-24 rounded-2xl bg-slate-900 overflow-hidden shrink-0 border border-slate-100 cursor-pointer group"
                  title="Cliquer pour prévisualiser"
                >
                  <img
                    src={post.mediaUrl}
                    alt="Illustration"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {post.memeTopText && (
                    <div className="absolute top-1 inset-x-1 text-center pointer-events-none">
                      <span className="meme-text text-white text-[8px] font-black uppercase leading-tight truncate block">
                        {post.memeTopText}
                      </span>
                    </div>
                  )}
                  {post.memeBottomText && (
                    <div className="absolute bottom-1 inset-x-1 text-center pointer-events-none">
                      <span className="meme-text text-white text-[8px] font-black uppercase leading-tight truncate block">
                        {post.memeBottomText}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{post.pageName}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        post.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {post.status === 'published' ? '✓ Publié' : '🕒 Programmé'}
                    </span>
                    {post.isAutonomous && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200 flex items-center space-x-1">
                        <Bot className="w-2.5 h-2.5" />
                        <span>Autonome</span>
                      </span>
                    )}

                    {/* SkyBoost badge if active */}
                    {post.skyboostBoostRequested && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200 flex items-center space-x-1">
                        <Rocket className="w-2.5 h-2.5 text-amber-600 fill-current" />
                        <span>
                          SkyBoost : +{post.skyboostTargetLikes || 100} likes
                          {post.skyboostOrderStatus === 'completed' ? ' (Livré)' : ' (En cours...)'}
                        </span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed font-normal">
                    {post.content}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{post.scheduledFor}</span>
                    </span>
                    <span>•</span>
                    <span className="text-blue-600 font-medium">{post.hashtags ? post.hashtags.split(' ')[0] : '#PostPilot'}</span>
                    {post.websiteUrl && (
                      <>
                        <span>•</span>
                        <span className="text-indigo-600 font-medium truncate max-w-xs">{post.websiteUrl}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="flex items-center justify-between md:justify-end space-x-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 shrink-0">
                <div className="flex items-center space-x-4 text-xs">
                  <div className="text-center">
                    <span className="font-extrabold text-blue-600 block text-sm flex items-center justify-center space-x-1">
                      <MousePointerClick className="w-3 h-3" />
                      <span>{post.clicks}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">clics site</span>
                  </div>
                  <div className="text-center">
                    <span className="font-extrabold text-slate-800 block text-sm">{post.likes}</span>
                    <span className="text-[10px] text-slate-400">j'aime</span>
                  </div>
                </div>

                {/* SkyBoost Action Button */}
                <button
                  onClick={() => onOpenSkyboost(post)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                    post.skyboostBoostRequested
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                      : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200/80 shadow-2xs hover:shadow-xs'
                  }`}
                  title="Booster cette publication avec SkyBoost.me"
                >
                  <Rocket className="w-3.5 h-3.5 text-orange-600 fill-current" />
                  <span>{post.skyboostBoostRequested ? 'Gérer Boost' : 'Booster (SkyBoost)'}</span>
                </button>

                {/* Direct Facebook Publish / Link Button */}
                {post.facebookPostId ? (
                  <a
                    href={`https://facebook.com/${post.facebookPostId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 flex items-center space-x-1.5 transition-all cursor-pointer"
                    title="Voir en direct sur Facebook"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>Sur Facebook</span>
                  </a>
                ) : onPublishToFacebook ? (
                  <button
                    onClick={() => handlePublishClick(post.id)}
                    disabled={publishingId === post.id}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-50"
                    title="Publier maintenant sur Facebook"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>{publishingId === post.id ? 'Envoi...' : 'Publier Facebook'}</span>
                  </button>
                ) : null}

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onViewPostPreview(post)}
                    className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    title="Aperçu Facebook"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeletePost(post.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )}
</div>
);
};
