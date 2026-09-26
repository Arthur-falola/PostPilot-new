/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { LandingPage } from './components/LandingPage';
import { Navbar } from './components/Navbar';
import { PostsTab } from './components/PostsTab';
import { PagesFBTab } from './components/PagesFBTab';
import { MemeStudio } from './components/MemeStudio';
import { CommunityTemplatesTab } from './components/CommunityTemplatesTab';
import { StatsTab } from './components/StatsTab';
import { PostComposer } from './components/PostComposer';
import { DailyIdeasModal } from './components/DailyIdeasModal';
import { NotificationsModal } from './components/NotificationsModal';
import { AbonnementModal } from './components/AbonnementModal';
import { PostPreviewModal } from './components/PostPreviewModal';
import { SkyboostModal } from './components/SkyboostModal';
import { AdminTab } from './components/AdminTab';
import {
  MEME_TEMPLATES,
  DAILY_IDEAS,
  COMMUNITY_TEMPLATES,
} from './data/mockData';
import { FacebookPage, Post, MemeTemplate, CommunityTemplate, NotificationItem, DailyIdea, UserProfile } from './types';
import { Sparkles, Bot, Check, ArrowRight, X, ExternalLink, Database, LogOut } from 'lucide-react';

function MainApp() {
  const { user, loading: authLoading, authFetch, signOut } = useAuth();

  // 1. Data States synced with PostgreSQL
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [memeTemplates, setMemeTemplates] = useState<MemeTemplate[]>(MEME_TEMPLATES);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // 2. Navigation State
  const [currentTab, setCurrentTab] = useState<'posts' | 'pages' | 'memes' | 'templates' | 'stats' | 'pricing' | 'admin'>('posts');
  const [showLandingPage, setShowLandingPage] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  // 3. Modals and Drawers
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerInitialValues, setComposerInitialValues] = useState<any>(null);
  const [isDailyIdeasOpen, setIsDailyIdeasOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [previewingPost, setPreviewingPost] = useState<Post | null>(null);

  // 4. SkyBoost Integration Modal
  const [skyboostPost, setSkyboostPost] = useState<Post | null>(null);
  const [isSkyboostModalOpen, setIsSkyboostModalOpen] = useState(false);

  // 5. Autonomous Recap Toast Notification
  const [toastRecap, setToastRecap] = useState<NotificationItem | null>(null);

  // Fetch initial user data from PostgreSQL
  const loadDatabaseData = useCallback(async () => {
    if (!user) return;
    setIsLoadingData(true);
    try {
      // 1. Sync User Profile in PostgreSQL & seed if empty
      const meRes = await authFetch('/api/me');
      const meData = await meRes.json();
      if (meData.user) {
        setUserProfile(meData.user);
      }

      // 2. Fetch Pages from PostgreSQL
      const pagesRes = await authFetch('/api/pages');
      const pagesData = await pagesRes.json();
      if (pagesData.pages) {
        setPages(pagesData.pages.map((p: any) => ({
          ...p,
          brandAnalysis: p.brandAnalysis ? (typeof p.brandAnalysis === 'string' ? JSON.parse(p.brandAnalysis) : p.brandAnalysis) : undefined
        })));
      }

      // 3. Fetch Posts from PostgreSQL
      const postsRes = await authFetch('/api/posts');
      const postsData = await postsRes.json();
      if (postsData.posts) {
        setPosts(postsData.posts);
      }

      // 4. Fetch Notifications from PostgreSQL
      const notifsRes = await authFetch('/api/notifications');
      const notifsData = await notifsRes.json();
      if (notifsData.notifications) {
        setNotifications(notifsData.notifications);
      }

      // 5. Fetch Meme Templates from PostgreSQL
      try {
        const memeRes = await fetch('/api/meme-templates');
        const memeData = await memeRes.json();
        if (memeData.templates && memeData.templates.length > 0) {
          setMemeTemplates(memeData.templates);
        }
      } catch (me) {
        console.warn('Using default templates fallback', me);
      }
    } catch (err) {
      console.error('Failed to load database data:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, [user, authFetch]);

  useEffect(() => {
    if (user) {
      loadDatabaseData();
    }
  }, [user, loadDatabaseData]);

  // Active Facebook Page
  const activePage = pages.find(p => p.isActive) || pages[0] || {
    id: 'default',
    name: 'PostPilot',
    category: 'Social Media Agency',
    avatar: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=200&q=80',
    followers: 1840,
    engagement: '8.4%',
    isActive: true,
    websiteUrl: 'https://postpilot.app',
    businessDescription: 'Marketing autonome Facebook',
    targetAudience: 'Entrepreneurs et créateurs',
    offer: 'Visibilité et trafic web',
    autoPilotEnabled: true,
    autoPilotFrequency: 'daily' as const,
    autoPilotHumor: 'viral_spicy' as const
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Set active Facebook page in PostgreSQL
  const handleSetActivePage = async (id: string) => {
    try {
      setPages(prev => prev.map(p => ({ ...p, isActive: p.id === id })));
      await authFetch(`/api/pages/${id}/activate`, { method: 'PUT' });
    } catch (e) {
      console.error(e);
    }
  };

  // Update existing page info in PostgreSQL
  const handleUpdatePage = async (updated: FacebookPage) => {
    setPages(prev => prev.map(p => p.id === updated.id ? updated : p));
    try {
      await authFetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (e) {
      console.error('Failed to update page in db:', e);
    }
  };

  // Add a new connected Facebook Page in PostgreSQL
  const handleAddNewPage = async (newPageData: Partial<FacebookPage>) => {
    try {
      const res = await authFetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPageData)
      });
      const data = await res.json();
      if (data.page) {
        setPages(prev => [
          ...prev.map(p => ({ ...p, isActive: false })),
          data.page
        ]);
      }
    } catch (e) {
      console.error('Failed to add page to db:', e);
    }
  };

  // Delete page in PostgreSQL
  const handleDeletePage = async (id: string) => {
    if (pages.length <= 1) return;
    try {
      setPages(prev => {
        const remaining = prev.filter(p => p.id !== id);
        if (!remaining.some(p => p.isActive) && remaining.length > 0) {
          remaining[0].isActive = true;
        }
        return remaining;
      });
      await authFetch(`/api/pages/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete page from db:', e);
    }
  };

  // Save new post from composer in PostgreSQL
  const handleSavePost = async (newPostData: Omit<Post, 'id' | 'createdAt' | 'clicks' | 'likes' | 'shares'>) => {
    try {
      const res = await authFetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPostData)
      });
      const data = await res.json();
      if (data.post) {
        setPosts(prev => [data.post, ...prev]);
      }
    } catch (e) {
      console.error('Failed to create post in db:', e);
    } finally {
      setIsComposerOpen(false);
      setComposerInitialValues(null);
      setCurrentTab('posts');
    }
  };

  // Delete post in PostgreSQL
  const handleDeletePost = async (id: string) => {
    try {
      setPosts(prev => prev.filter(p => p.id !== id));
      await authFetch(`/api/posts/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete post from db:', e);
    }
  };

  // Live Publish Post to Facebook Graph API
  const handlePublishToFacebook = async (postId: string) => {
    try {
      const res = await authFetch(`/api/posts/${postId}/publish-facebook`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        setToastRecap({
          id: `toast-err-${Date.now()}`,
          userId: userProfile?.id || 0,
          type: 'system',
          title: 'Information Facebook',
          message: data.error || 'Erreur lors de la publication Facebook',
          timestamp: 'À l\'instant',
          read: false,
          recapData: {
            pageName: activePage.name,
            websiteTarget: data.needsToken ? 'Page Access Token requis dans "Pages FB"' : 'Erreur Meta Graph API'
          }
        });
        if (data.needsToken) {
          setCurrentTab('pages');
        }
        return false;
      }

      if (data.post) {
        setPosts(prev => prev.map(p => p.id === postId ? data.post : p));
      }

      setToastRecap({
        id: `toast-ok-${Date.now()}`,
        userId: userProfile?.id || 0,
        type: 'autonomous_action',
        title: '🎉 Publication en direct sur Facebook !',
        message: 'Votre publication a été transmise avec succès à Meta Facebook Graph API.',
        timestamp: 'À l\'instant',
        read: false,
        recapData: {
          pageName: activePage.name,
          websiteTarget: data.facebookUrl || 'https://facebook.com'
        }
      });
      return true;
    } catch (e: any) {
      console.error('Failed to publish post to Facebook:', e);
      return false;
    }
  };

  // Optional Demo Page Seeding on User Demand
  const handleSeedDemo = async () => {
    try {
      const res = await authFetch('/api/pages/seed-demo', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.pages && data.pages.length > 0) {
        setPages(data.pages);
      }
    } catch (e) {
      console.error('Failed to seed demo page:', e);
    }
  };

  // SkyBoost Integration Handlers
  const handleOpenSkyboost = (post: Post) => {
    setSkyboostPost(post);
    setIsSkyboostModalOpen(true);
  };

  const handleConnectSkyboost = async (apiKey: string, email: string) => {
    try {
      const res = await authFetch('/api/skyboost/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, accountEmail: email })
      });
      const data = await res.json();
      if (data.user) {
        setUserProfile(data.user);
      }
    } catch (e) {
      console.error('Failed to connect Skyboost:', e);
      throw e;
    }
  };

  const handleBoostPost = async (postId: string, likesCount: number) => {
    try {
      const res = await authFetch('/api/skyboost/boost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, likesCount })
      });
      const data = await res.json();
      if (data.post) {
        setPosts(prev => prev.map(p => p.id === postId ? data.post : p));
      }
      // Refresh notifications to include the new boost confirmation
      const notifsRes = await authFetch('/api/notifications');
      const notifsData = await notifsRes.json();
      if (notifsData.notifications) {
        setNotifications(notifsData.notifications);
      }
    } catch (e) {
      console.error('Failed to boost post with SkyBoost:', e);
      throw e;
    }
  };

  // Trigger from Daily Ideas modal
  const handleSelectDailyIdea = (idea: DailyIdea, meme?: MemeTemplate) => {
    setComposerInitialValues({
      content: idea.content,
      hashtags: idea.hashtags,
      cta: idea.cta,
      category: idea.category,
      mediaType: meme?.type === 'video' ? 'video' : 'meme',
      mediaUrl: meme?.videoUrl || meme?.imageUrl,
      memeTopText: meme?.defaultTop || 'LE SECRET DU BUSINESS EN LIGNE',
      memeBottomText: meme?.defaultBottom || 'ATTIRER DES CLIENTS SUR LE SITE SANS EFFORT'
    });
    setIsDailyIdeasOpen(false);
    setIsComposerOpen(true);
  };

  // Apply custom designed meme from MemeStudio
  const handleApplyMemeToPost = (memeData: {
    template: MemeTemplate;
    topText: string;
    bottomText: string;
    caption?: string;
  }) => {
    const websiteTarget = activePage.websiteUrl || 'https://postpilot.app';
    const fallbackText = `Moi entrain de regarder PostPilot attirer des clients sur mon site que j'ai créé avec passion 😄\n\nArrêtez de gaspiller votre temps à publier manuellement chaque jour. Automatisez des mèmes viraux qui convertissent !`;

    setComposerInitialValues({
      content: memeData.caption || fallbackText,
      hashtags: '#MemeMarketing #CroissanceWeb #Automatisation #PostPilot',
      cta: `👉 Venez voir comment notre système génère du trafic en automatique sur ${websiteTarget}`,
      mediaType: memeData.template.type === 'video' ? 'video' : 'meme',
      mediaUrl: memeData.template.videoUrl || memeData.template.imageUrl,
      memeTopText: memeData.topText,
      memeBottomText: memeData.bottomText,
      category: 'MÈMÉ VIRAL'
    });
    setIsComposerOpen(true);
  };

  // Adapt a community template to the user's business
  const handleAdaptCommunityTemplate = (template: CommunityTemplate) => {
    const websiteTarget = activePage.websiteUrl || 'https://postpilot.app';
    const adaptedContent = template.content
      .replace(/notre site web/gi, activePage.websiteUrl ? `${activePage.name} (${activePage.websiteUrl})` : activePage.name)
      .replace(/notre boutique/gi, activePage.name);

    setComposerInitialValues({
      content: adaptedContent,
      hashtags: template.hashtags,
      cta: `👉 Découvrez notre offre exclusive sur ${websiteTarget}`,
      mediaType: 'meme',
      mediaUrl: template.mediaUrl,
      memeTopText: template.topText,
      memeBottomText: template.bottomText,
      category: `MODÈLE : ${template.title.toUpperCase()}`
    });
    setIsComposerOpen(true);
  };

  // Autonomous posting action in PostgreSQL & recap notification
  const handleTriggerAutonomousTest = async () => {
    try {
      const res = await authFetch('/api/autonomous-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: activePage.id,
          pageName: activePage.name,
          websiteUrl: activePage.websiteUrl || 'https://postpilot.app',
          style: activePage.autoPilotHumor
        })
      });
      const data = await res.json();
      if (data.post) {
        setPosts(prev => [data.post, ...prev]);
      }
      if (data.notification) {
        setNotifications(prev => [data.notification, ...prev]);
        setToastRecap(data.notification);
      }
    } catch (e) {
      console.error('Failed autonomous run:', e);
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await authFetch('/api/notifications/read-all', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-500">Chargement de votre session PostPilot...</p>
        </div>
      </div>
    );
  }

  // Not logged in: Show Landing Page with interactive Survey OR Auth Screen
  if (!user) {
    if (showAuthModal) {
      return (
        <AuthScreen
          initialMode={authMode}
          onBackToLanding={() => setShowAuthModal(false)}
        />
      );
    }

    return (
      <LandingPage
        onStartSignUp={() => {
          setAuthMode('signup');
          setShowAuthModal(true);
        }}
        onOpenSignIn={() => {
          setAuthMode('signin');
          setShowAuthModal(true);
        }}
      />
    );
  }

  // Logged in: Check if user explicitly toggled to view Landing Page & Survey
  if (showLandingPage) {
    return (
      <LandingPage
        currentUserEmail={user.email}
        onGoToDashboard={() => setShowLandingPage(false)}
        onStartSignUp={() => setShowLandingPage(false)}
        onOpenSignIn={() => setShowLandingPage(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'pricing') {
            setIsUpgradeOpen(true);
          } else {
            setCurrentTab(tab);
            setIsComposerOpen(false);
          }
        }}
        unreadCount={unreadNotificationsCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenDailyIdeas={() => setIsDailyIdeasOpen(true)}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
        onOpenLanding={() => setShowLandingPage(true)}
        activePage={activePage}
        onSignOut={signOut}
        userEmail={user.email || ''}
        isAdmin={userProfile?.role === 'admin' || user.email === 'arthurfalola2006@gmail.com'}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* If composer is open */}
        {isComposerOpen ? (
          <PostComposer
            activePage={activePage}
            memeTemplates={memeTemplates}
            initialValues={composerInitialValues}
            onSavePost={handleSavePost}
            onCancel={() => {
              setIsComposerOpen(false);
              setComposerInitialValues(null);
            }}
          />
        ) : (
          <>
            {currentTab === 'posts' && (
              <PostsTab
                posts={posts.filter(p => p.pageId === activePage.id || !p.pageId)}
                activePage={activePage}
                onOpenComposer={(prefillDate) => {
                  setComposerInitialValues(prefillDate ? { scheduledFor: prefillDate } : null);
                  setIsComposerOpen(true);
                }}
                onOpenMemes={() => setCurrentTab('memes')}
                onOpenDailyIdeas={() => setIsDailyIdeasOpen(true)}
                onDeletePost={handleDeletePost}
                onViewPostPreview={(post) => setPreviewingPost(post)}
                onOpenSkyboost={handleOpenSkyboost}
                onPublishToFacebook={handlePublishToFacebook}
              />
            )}

            {currentTab === 'pages' && (
              <PagesFBTab
                pages={pages}
                userEmail={user.email || ''}
                onSetActivePage={handleSetActivePage}
                onUpdatePage={handleUpdatePage}
                onAddNewPage={handleAddNewPage}
                onDeletePage={handleDeletePage}
                onTriggerAutonomousTest={handleTriggerAutonomousTest}
                onRefreshPages={loadDatabaseData}
                onSeedDemo={handleSeedDemo}
              />
            )}

            {currentTab === 'memes' && (
              <MemeStudio
                templates={memeTemplates}
                activePage={activePage}
                onApplyMemeToPost={handleApplyMemeToPost}
              />
            )}

            {currentTab === 'templates' && (
              <CommunityTemplatesTab
                templates={COMMUNITY_TEMPLATES}
                activePage={activePage}
                onAdaptTemplate={handleAdaptCommunityTemplate}
              />
            )}

            {currentTab === 'stats' && (
              <StatsTab
                activePage={activePage}
                posts={posts}
              />
            )}

            {currentTab === 'admin' && (
              <AdminTab
                currentUser={userProfile || { id: 1, uid: user.uid, email: user.email || '', fbConnected: false }}
                onRefreshTemplates={loadDatabaseData}
              />
            )}
          </>
        )}
      </main>

      {/* Autonomous Action Recap Toast Notification */}
      {toastRecap && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-slate-900 text-white p-5 rounded-3xl shadow-2xl border border-slate-800 animate-in slide-in-from-bottom-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Action Autonome Exécutée</h4>
                <p className="text-[11px] text-slate-400">Publication validée sur {toastRecap.recapData?.pageName}</p>
              </div>
            </div>
            <button
              onClick={() => setToastRecap(null)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 mt-2.5 leading-relaxed line-clamp-2">
            {toastRecap.message}
          </p>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-bold">
              🎯 Cible : {toastRecap.recapData?.websiteTarget}
            </span>
            <button
              onClick={() => {
                setToastRecap(null);
                setCurrentTab('posts');
              }}
              className="text-blue-400 hover:text-blue-300 font-bold flex items-center space-x-1 cursor-pointer"
            >
              <span>Voir dans les posts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <DailyIdeasModal
        isOpen={isDailyIdeasOpen}
        onClose={() => setIsDailyIdeasOpen(false)}
        ideas={DAILY_IDEAS}
        memeTemplates={MEME_TEMPLATES}
        onSelectIdea={handleSelectDailyIdea}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
      />

      <AbonnementModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        userProfile={userProfile}
        onPlanChanged={(u) => setUserProfile(u)}
      />

      <PostPreviewModal
        post={previewingPost}
        onClose={() => setPreviewingPost(null)}
        onOpenSkyboost={handleOpenSkyboost}
      />

      <SkyboostModal
        isOpen={isSkyboostModalOpen}
        onClose={() => {
          setIsSkyboostModalOpen(false);
          setSkyboostPost(null);
        }}
        post={skyboostPost}
        userProfile={userProfile}
        onConnectSkyboost={handleConnectSkyboost}
        onBoostPost={handleBoostPost}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
