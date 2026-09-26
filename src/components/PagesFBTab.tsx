import React, { useState } from 'react';
import { FacebookPage } from '../types';
import { RefreshCw, Trash2, CheckCircle2, Globe, Users, Sparkles, Plus, ExternalLink, Bot, ArrowRight, ShieldCheck, Check, KeyRound } from 'lucide-react';

interface PagesFBTabProps {
  pages: FacebookPage[];
  userEmail: string;
  onSetActivePage: (id: string) => void;
  onUpdatePage: (page: FacebookPage) => void;
  onAddNewPage: (newPage: Partial<FacebookPage>) => void;
  onDeletePage: (id: string) => void;
  onTriggerAutonomousTest: () => void;
  onRefreshPages: () => void;
  onSeedDemo?: () => void;
}

export const PagesFBTab: React.FC<PagesFBTabProps> = ({
  pages,
  userEmail,
  onSetActivePage,
  onUpdatePage,
  onAddNewPage,
  onDeletePage,
  onTriggerAutonomousTest,
  onRefreshPages,
  onSeedDemo
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Facebook connect modal state
  const [fbMethod, setFbMethod] = useState<'oauth' | 'token'>('token');
  const [fbPageName, setFbPageName] = useState('');
  const [fbPageId, setFbPageId] = useState('');
  const [fbCategory, setFbCategory] = useState('Product/service');
  const [fbWebsite, setFbWebsite] = useState('https://');
  const [fbAccessToken, setFbAccessToken] = useState('');
  const [fbAvatar, setFbAvatar] = useState('');
  const [isConnectingFb, setIsConnectingFb] = useState(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const [tokenVerificationStatus, setTokenVerificationStatus] = useState<{
    success: boolean;
    message: string;
    followers?: number;
  } | null>(null);

  const activePage = pages.find(p => p.isActive) || pages[0];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshPages();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  const handleVerifyToken = async () => {
    if (!fbPageId.trim() || !fbAccessToken.trim()) {
      setTokenVerificationStatus({
        success: false,
        message: 'Veuillez renseigner à la fois le Page ID et le Page Access Token.'
      });
      return;
    }
    setIsVerifyingToken(true);
    setTokenVerificationStatus(null);
    try {
      const res = await fetch('/api/facebook/verify-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId: fbPageId.trim(),
          accessToken: fbAccessToken.trim()
        })
      });
      const data = await res.json();
      if (data.success && data.page) {
        setTokenVerificationStatus({
          success: true,
          message: `Page "${data.page.name}" validée sur Meta Graph API ! (${(data.page.followers || 0).toLocaleString()} abonnés réels)`,
          followers: data.page.followers
        });
        if (!fbPageName.trim()) setFbPageName(data.page.name);
        if (data.page.avatar) setFbAvatar(data.page.avatar);
      } else {
        setTokenVerificationStatus({
          success: false,
          message: data.error || 'Token invalide ou non autorisé pour cette page.'
        });
      }
    } catch (e: any) {
      setTokenVerificationStatus({
        success: false,
        message: 'Impossible de contacter le serveur pour vérifier le token.'
      });
    } finally {
      setIsVerifyingToken(false);
    }
  };

  const handleAnalyzeBrand = async () => {
    if (!activePage) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: activePage.websiteUrl,
          businessName: activePage.name,
          description: activePage.businessDescription,
          targetAudience: activePage.targetAudience,
          offer: activePage.offer
        })
      });
      const data = await res.json();
      if (data.data) {
        onUpdatePage({
          ...activePage,
          brandAnalysis: data.data
        });
      }
    } catch (e) {
      console.error('Error analyzing brand:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFacebookOAuthLogin = () => {
    setIsConnectingFb(true);
    setTimeout(() => {
      setIsConnectingFb(false);
      setFbMethod('token');
    }, 1200);
  };

  const handleCreateNewPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbPageName.trim()) return;

    const generatedId = fbPageId.trim() || `${Math.floor(100000000000000 + Math.random() * 900000000000000)}`;

    onAddNewPage({
      id: generatedId,
      name: fbPageName,
      category: fbCategory,
      avatar: fbAvatar || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=200&q=80',
      followers: tokenVerificationStatus?.followers || 0,
      engagement: '0%',
      isActive: true,
      websiteUrl: fbWebsite || 'https://monsite.com',
      businessDescription: 'Page Facebook synchronisée en base de données PostgreSQL.',
      targetAudience: 'Prospects et clients sur Facebook',
      offer: 'Offre exclusive et découverte du site web',
      autoPilotEnabled: true,
      autoPilotFrequency: 'daily',
      autoPilotHumor: 'viral_spicy',
      accessToken: fbAccessToken.trim() || undefined,
    });

    setShowConnectModal(false);
    setFbPageName('');
    setFbPageId('');
    setFbAccessToken('');
    setTokenVerificationStatus(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Compte PostPilot Header Card (Exact replication of Screenshot 1) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-indigo-500/20 uppercase">
                {userEmail ? userEmail[0] : 'A'}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1 border-2 border-white shadow-xs">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">Compte PostPilot</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60 flex items-center space-x-1">
                  <span>✓</span>
                  <span>{pages.length} pages connectées</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{userEmail || 'arthurfalola@gmail.com'}</p>
            </div>
          </div>

          {/* Action buttons matching screenshot 1 */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleRefresh}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Rafraîchir</span>
            </button>

            <button
              onClick={() => setShowConnectModal(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-2 shadow-xs transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Se connecter avec Facebook</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Section "Vos Pages Facebook" (Matches Screenshot 1) */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <h3 className="text-base font-bold text-slate-900">Vos Pages Facebook</h3>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
            {pages.length} pages réelles
          </span>
        </div>
        <p className="text-xs text-slate-500">
          La page active reçoit tes publications programmées et bénéficie du ciblage d'acquisition vers ton site web.
        </p>

        {/* List of Pages */}
        <div className="space-y-4 pt-1">
          {pages.length === 0 ? (
            <div className="text-center py-12 px-6 bg-white rounded-3xl border border-dashed border-slate-300 space-y-4">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                <Globe className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-base font-bold text-slate-900">Aucune page Facebook connectée</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Connectez votre Page Facebook avec votre Page ID et Access Token pour automatiser vos publications, ou chargez un exemple pour explorer l'interface.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowConnectModal(true)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Connecter ma Page Facebook</span>
                </button>
                {onSeedDemo && (
                  <button
                    onClick={onSeedDemo}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    Charger un exemple de page
                  </button>
                )}
              </div>
            </div>
          ) : (
            pages.map((page) => {
              const isActive = page.isActive;
              return (
                <div
                  key={page.id}
                  onClick={() => onSetActivePage(page.id)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer bg-white ${
                    isActive
                      ? 'border-blue-600 ring-2 ring-blue-500/15 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={page.avatar || 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?auto=format&fit=crop&w=120&q=80'}
                        alt={page.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-2xs"
                      />
                      <div>
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <h4 className="font-bold text-slate-900 text-base">{page.name}</h4>
                          {isActive && (
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold tracking-wide uppercase flex items-center space-x-1">
                              <span>✓</span>
                              <span>PAGE ACTIVE</span>
                            </span>
                          )}
                          {page.accessToken ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                              ✓ Token Meta Actif
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium">
                              Mode simulation
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{page.category}</p>
                      </div>
                    </div>

                    {/* AutoPilot Pill */}
                    <div className="flex items-center space-x-2">
                      {page.autoPilotEnabled && (
                        <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold items-center space-x-1">
                          <Bot className="w-3 h-3 text-indigo-600" />
                          <span>Pilote Automatique ACTIF</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Followers and Engagement boxes (Matches Screenshot 1) */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        ABONNÉS
                      </span>
                      <div className="flex items-center space-x-1.5 mt-1">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-sm font-extrabold text-slate-900">
                          {page.followers?.toLocaleString() || '0'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        ENGAGEMENT
                      </span>
                      <div className="flex items-center space-x-1.5 mt-1">
                        <span className="text-sm font-extrabold text-slate-900">{page.engagement || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer with ID and action buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-[11px]">ID : {page.id}</span>
                    <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={handleRefresh}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        title="Synchroniser la page"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      {pages.length > 1 && (
                        <button
                          onClick={() => onDeletePage(page.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Supprimer la page"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. Page Website & Audience AI Intelligence Center */}
      {activePage && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                <span>Ciblage & Site Web pour {activePage.name}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Renseignez votre site web et vos objectifs pour que l'IA rédige des messages et mèmes irrésistibles qui redirigent le trafic Facebook vers vos pages.
              </p>
            </div>

            <button
              onClick={handleAnalyzeBrand}
              disabled={isAnalyzing}
              className="py-2.5 px-4 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>{isAnalyzing ? 'Analyse du site...' : 'Analyser mon site avec l\'IA'}</span>
            </button>
          </div>

          {/* Website Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                <span>URL du Site Web de l'entreprise</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </label>
              <input
                type="url"
                value={activePage.websiteUrl || ''}
                onChange={(e) => onUpdatePage({ ...activePage, websiteUrl: e.target.value })}
                placeholder="https://votre-site.com"
                className="w-full px-3.5 py-2.5 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Offre principale / Produit à promouvoir
              </label>
              <input
                type="text"
                value={activePage.offer || ''}
                onChange={(e) => onUpdatePage({ ...activePage, offer: e.target.value })}
                placeholder="Ex: Essai offert, -20% sur boutique, Audit gratuit"
                className="w-full px-3.5 py-2.5 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Description de l'activité (utilisé si pas de site ou en complément)
            </label>
            <textarea
              value={activePage.businessDescription || ''}
              onChange={(e) => onUpdatePage({ ...activePage, businessDescription: e.target.value })}
              rows={2}
              placeholder="Décrivez ce que fait votre entreprise et la valeur apportée..."
              className="w-full p-3 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Audience cible idéale sur Facebook (intérêts, profils, besoins)
            </label>
            <input
              type="text"
              value={activePage.targetAudience || ''}
              onChange={(e) => onUpdatePage({ ...activePage, targetAudience: e.target.value })}
              placeholder="Ex: Créateurs de contenu, commerçants locaux, passionnés de fitness..."
              className="w-full px-3.5 py-2.5 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
            />
          </div>

          {/* AI Extracted Brand Strategy (if available) */}
          {activePage.brandAnalysis && (
            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                  Stratégie de Conversion Détectée par l'IA
                </h4>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {activePage.brandAnalysis.summary}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-indigo-100">
                  <span className="font-bold text-indigo-900 block mb-1">
                    🎯 Accroches recommandées pour votre site :
                  </span>
                  <ul className="space-y-1 text-slate-600">
                    {activePage.brandAnalysis.trafficHooks?.slice(0, 2).map((hook, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-indigo-600">•</span>
                        <span>{hook}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-white rounded-xl border border-indigo-100">
                  <span className="font-bold text-purple-900 block mb-1">
                    🔥 Angles de Mèmes Viraux :
                  </span>
                  <ul className="space-y-1 text-slate-600">
                    {activePage.brandAnalysis.memeAngles?.slice(0, 2).map((angle, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-purple-600">•</span>
                        <span>{angle}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Configuration Pilote Automatique pour cette page */}
      {activePage && (
        <div className="bg-linear-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-indigo-300 text-xs font-semibold">
                <Bot className="w-3.5 h-3.5 text-indigo-400" />
                <span>Assistant Autonome PostPilot</span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Déléguer la publication 100% autonome
              </h3>
              <p className="text-xs text-indigo-200 max-w-xl leading-relaxed">
                Autorisez PostPilot à générer et publier des mèmes et contenus sans votre intervention. Un récapitulatif avec statistiques est toujours envoyé instantanément après chaque action.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={activePage.autoPilotEnabled}
                onChange={(e) => onUpdatePage({ ...activePage, autoPilotEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-1 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {activePage.autoPilotEnabled && (
            <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-indigo-200 block mb-1 font-semibold">Fréquence</label>
                <select
                  value={activePage.autoPilotFrequency}
                  onChange={(e) => onUpdatePage({ ...activePage, autoPilotFrequency: e.target.value as any })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white font-medium focus:outline-hidden"
                >
                  <option value="daily" className="bg-slate-800 text-white">1 publication par jour (Recommandé)</option>
                  <option value="twice_daily" className="bg-slate-800 text-white">2 publications par jour (Intensif)</option>
                  <option value="thrice_weekly" className="bg-slate-800 text-white">3 publications par semaine</option>
                </select>
              </div>

              <div>
                <label className="text-indigo-200 block mb-1 font-semibold">Tonalité des Mèmes</label>
                <select
                  value={activePage.autoPilotHumor}
                  onChange={(e) => onUpdatePage({ ...activePage, autoPilotHumor: e.target.value as any })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white font-medium focus:outline-hidden"
                >
                  <option value="viral_spicy" className="bg-slate-800 text-white">🔥 Mèmes Viraux & Décalés</option>
                  <option value="relatable" className="bg-slate-800 text-white">🤝 Relatable & Humour Pro</option>
                  <option value="subtle" className="bg-slate-800 text-white">💼 Valeur & Éducatif doux</option>
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <button
                  onClick={onTriggerAutonomousTest}
                  className="w-full py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-colors shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  <span>⚡ Tester 1 action autonome</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Connect New Facebook Page (Full Professional Setup) */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-100 shadow-2xl space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Liaison de Page Facebook</h3>
                <p className="text-xs text-slate-500">Connexion sécurisée enregistrée dans PostgreSQL</p>
              </div>
            </div>

            {/* Method switcher */}
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFbMethod('oauth')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  fbMethod === 'oauth' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                OAuth Facebook
              </button>
              <button
                type="button"
                onClick={() => setFbMethod('token')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  fbMethod === 'token' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Page ID & Token
              </button>
            </div>

            {fbMethod === 'oauth' ? (
              <div className="space-y-4 pt-1 text-center">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Autorisez PostPilot à accéder à vos pages Facebook avec les permissions de lecture, d'engagement et de publication automatique.
                </p>
                <button
                  type="button"
                  onClick={handleFacebookOAuthLogin}
                  disabled={isConnectingFb}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-md shadow-blue-500/25 transition-all"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>{isConnectingFb ? 'Connexion à Facebook...' : 'Ouvrir l\'autorisation Facebook'}</span>
                </button>
                <p className="text-[11px] text-slate-400">
                  Ou basculez sur "Page ID & Token" pour saisir directement les identifiants de votre page.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateNewPage} className="space-y-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Nom de la Page Facebook *
                  </label>
                  <input
                    type="text"
                    required
                    value={fbPageName}
                    onChange={(e) => setFbPageName(e.target.value)}
                    placeholder="Ex: SkyBoost Official"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Facebook Page ID
                    </label>
                    <input
                      type="text"
                      value={fbPageId}
                      onChange={(e) => setFbPageId(e.target.value)}
                      placeholder="Ex: 810748425460613"
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Catégorie
                    </label>
                    <input
                      type="text"
                      value={fbCategory}
                      onChange={(e) => setFbCategory(e.target.value)}
                      placeholder="Ex: Product/service"
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Site Web de l'entreprise (Destination du trafic)
                  </label>
                  <input
                    type="url"
                    value={fbWebsite}
                    onChange={(e) => setFbWebsite(e.target.value)}
                    placeholder="https://mon-site.com"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                    <span>Page Access Token Meta Graph API (Optionnel)</span>
                    <KeyRound className="w-3 h-3 text-slate-400" />
                  </label>
                  <input
                    type="password"
                    value={fbAccessToken}
                    onChange={(e) => {
                      setFbAccessToken(e.target.value);
                      setTokenVerificationStatus(null);
                    }}
                    placeholder="EAABwz..."
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Générez votre token avec permissions <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">pages_manage_posts</code> sur <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noreferrer" className="text-blue-600 underline">Meta Graph API Explorer</a>.
                  </p>
                </div>

                {/* Live Verification Button */}
                {fbAccessToken.trim() && fbPageId.trim() && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleVerifyToken}
                      disabled={isVerifyingToken}
                      className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isVerifyingToken ? (
                        <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      )}
                      <span>{isVerifyingToken ? 'Vérification chez Meta...' : 'Tester le Token (Meta Graph API)'}</span>
                    </button>
                  </div>
                )}

                {/* Token Verification Status Feedback */}
                {tokenVerificationStatus && (
                  <div className={`p-3 rounded-xl text-xs flex items-start space-x-2 ${
                    tokenVerificationStatus.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {tokenVerificationStatus.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-4 h-4 text-rose-600 font-bold shrink-0 text-center">✕</div>
                    )}
                    <span className="leading-snug">{tokenVerificationStatus.message}</span>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowConnectModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center space-x-1.5 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Enregistrer dans PostgreSQL</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
