import React from 'react';
import { Send, Bell, Crown, Sparkles, LogOut, Calendar, Users, BarChart3, Image as ImageIcon, CopyCheck, ShieldAlert } from 'lucide-react';
import { FacebookPage } from '../types';

interface NavbarProps {
  currentTab: 'posts' | 'pages' | 'memes' | 'templates' | 'stats' | 'pricing' | 'admin';
  onSelectTab: (tab: 'posts' | 'pages' | 'memes' | 'templates' | 'stats' | 'pricing' | 'admin') => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenDailyIdeas: () => void;
  onOpenUpgrade: () => void;
  onOpenLanding?: () => void;
  activePage: FacebookPage;
  onSignOut?: () => void;
  userEmail?: string;
  isAdmin?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  unreadCount,
  onOpenNotifications,
  onOpenDailyIdeas,
  onOpenUpgrade,
  onOpenLanding,
  activePage,
  onSignOut,
  userEmail,
  isAdmin
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      {/* Top Header Row (Matches Screenshot 1) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo PostPilot */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('posts')}>
          <div className="w-9 h-9 rounded-2xl bg-linear-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Send className="w-5 h-5 -rotate-45 ml-0.5 fill-current" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="font-extrabold text-xl tracking-tight text-slate-900 font-brand">
              Post<span className="text-indigo-600">Pilot</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
              Auto Facebook
            </span>
          </div>
        </div>

        {/* Right Action Icons (Matches Screenshot 1) */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Notification bell with badge */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Notifications récapitulatives"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* UPGRADE Button (Matches Screenshot 1 gold style) */}
          <button
            onClick={onOpenUpgrade}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black tracking-wide transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>UPGRADE</span>
          </button>

          {/* Sparkles / Idées du jour quick launch */}
          <button
            onClick={onOpenDailyIdeas}
            className="w-8 h-8 rounded-xl bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-all"
            title="Idées du jour"
          >
            <Sparkles className="w-4 h-4 fill-white" />
          </button>

          {/* User Initial Avatar (Matches Screenshot 1) */}
          <div
            onClick={() => onSelectTab('pages')}
            className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center cursor-pointer shadow-xs uppercase"
            title={`Compte actif : ${userEmail || activePage.name}`}
          >
            {userEmail ? userEmail[0] : 'A'}
          </div>

          {/* Sign Out Button */}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation Bar (Matches Screenshot 1 & Extended) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <nav className="flex space-x-1 sm:space-x-3 overflow-x-auto scrollbar-none py-1.5 text-xs font-bold">
          <button
            onClick={() => onSelectTab('posts')}
            className={`flex items-center space-x-2 py-2 px-3.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              currentTab === 'posts'
                ? 'bg-indigo-50 text-indigo-700 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Posts</span>
          </button>

          <button
            onClick={() => onSelectTab('pages')}
            className={`flex items-center space-x-2 py-2 px-3.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              currentTab === 'pages'
                ? 'bg-indigo-50 text-indigo-700 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Pages FB</span>
          </button>

          <button
            onClick={() => onSelectTab('memes')}
            className={`flex items-center space-x-2 py-2 px-3.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              currentTab === 'memes'
                ? 'bg-indigo-50 text-indigo-700 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Studio Mèmes</span>
          </button>

          <button
            onClick={() => onSelectTab('templates')}
            className={`flex items-center space-x-2 py-2 px-3.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              currentTab === 'templates'
                ? 'bg-indigo-50 text-indigo-700 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CopyCheck className="w-4 h-4" />
            <span>Modèles Partagés</span>
          </button>

          <button
            onClick={() => onSelectTab('stats')}
            className={`flex items-center space-x-2 py-2 px-3.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              currentTab === 'stats'
                ? 'bg-indigo-50 text-indigo-700 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Stats</span>
          </button>

          <button
            onClick={() => onSelectTab('pricing')}
            className={`flex items-center space-x-2 py-2 px-3.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              currentTab === 'pricing'
                ? 'bg-indigo-50 text-indigo-700 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-500" />
            <span>Abonnement</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => onSelectTab('admin')}
              className={`flex items-center space-x-2 py-2 px-3.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'admin'
                  ? 'bg-purple-100 text-purple-900 border border-purple-300 shadow-2xs font-extrabold'
                  : 'bg-purple-50/70 text-purple-700 hover:bg-purple-100 border border-purple-200/60'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-purple-600" />
              <span>👑 Admin</span>
            </button>
          )}

          {onOpenLanding && (
            <button
              onClick={onOpenLanding}
              className="flex items-center space-x-1.5 py-2 px-3 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all cursor-pointer whitespace-nowrap ml-auto"
              title="Voir la Landing Page et le Diagnostic IA"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Accueil / Diagnostic</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
