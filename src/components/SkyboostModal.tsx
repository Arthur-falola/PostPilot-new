import React, { useState } from 'react';
import { Post, UserProfile } from '../types';
import { Rocket, Check, X, ShieldCheck, ExternalLink, Zap, AlertCircle, RefreshCw, Key, Mail, Sparkles } from 'lucide-react';

interface SkyboostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  userProfile: UserProfile | null;
  onConnectSkyboost: (apiKey: string, email: string) => Promise<void>;
  onBoostPost: (postId: string, likesCount: number) => Promise<void>;
}

export const SkyboostModal: React.FC<SkyboostModalProps> = ({
  isOpen,
  onClose,
  post,
  userProfile,
  onConnectSkyboost,
  onBoostPost
}) => {
  const [apiKey, setApiKey] = useState(userProfile?.skyboostApiKey || '');
  const [accountEmail, setAccountEmail] = useState(userProfile?.skyboostAccountEmail || userProfile?.email || '');
  const [selectedLikes, setSelectedLikes] = useState<number>(250);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'connect' | 'boost'>(
    userProfile?.skyboostConnected ? 'boost' : 'connect'
  );
  const [successOrder, setSuccessOrder] = useState<any>(null);

  if (!isOpen || !post) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const keyToUse = apiKey.trim() || `sk_live_sb_${Math.random().toString(36).substring(2, 10)}`;
      const emailToUse = accountEmail.trim() || userProfile?.email || 'user@skyboost.me';
      await onConnectSkyboost(keyToUse, emailToUse);
      setStep('boost');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoConnect = async () => {
    setIsSubmitting(true);
    try {
      const demoKey = 'sk_live_skyboost_auth_token_8849';
      const demoEmail = userProfile?.email || 'arthurfalola2006@gmail.com';
      setApiKey(demoKey);
      setAccountEmail(demoEmail);
      await onConnectSkyboost(demoKey, demoEmail);
      setStep('boost');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteBoost = async () => {
    setIsSubmitting(true);
    try {
      await onBoostPost(post.id, selectedLikes);
      setSuccessOrder({
        likes: selectedLikes,
        orderId: `SB-${Math.floor(100000 + Math.random() * 900000)}`,
        status: post.status === 'published' ? 'en cours d\'envoi' : 'planifiée avec la publication'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-linear-to-r from-orange-500 via-amber-500 to-amber-600 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-black/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold mb-2">
            <Rocket className="w-3.5 h-3.5 text-amber-200 fill-current" />
            <span>Intégration API SkyBoost.me</span>
          </div>

          <h3 className="text-xl font-black tracking-tight">
            Booster les Likes de cette Publication
          </h3>
          <p className="text-xs text-orange-100 mt-1 leading-relaxed">
            Optionnel • Connecté à l'API de votre plateforme <strong>skyboost.me</strong> pour commander automatiquement les likes dès la publication Facebook.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {successOrder ? (
            <div className="text-center py-6 space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Commande SkyBoost Validée !</h4>
                <p className="text-xs text-slate-600 mt-1">
                  +{successOrder.likes} likes haute rétention ont été programmés via l'API SkyBoost.me.
                </p>
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 inline-block">
                  N° Commande : <span className="font-bold text-amber-700">{successOrder.orderId}</span> • Statut : {successOrder.status}
                </div>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200/70 rounded-2xl text-xs text-amber-900 text-left leading-relaxed">
                <span className="font-bold block mb-0.5">⚡ Déclenchement automatique</span>
                {post.status === 'published'
                  ? 'La publication étant déjà en ligne, la commande est immédiatement transmise au réseau SkyBoost.'
                  : 'Dès que PostPilot publiera ce post sur votre page Facebook, la commande SkyBoost sera automatiquement exécutée avec le lien direct de la publication.'}
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          ) : step === 'connect' ? (
            <form onSubmit={handleConnect} className="space-y-4">
              <div className="p-3.5 bg-amber-50 border border-amber-200/70 rounded-2xl text-xs text-amber-900 leading-relaxed">
                <span className="font-bold block mb-1">🔗 Liaison autorisée avec SkyBoost.me</span>
                Pour permettre à PostPilot de commander des likes pour votre compte sans saisie manuelle à chaque fois, liez votre compte SkyBoost ci-dessous.
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Email du compte SkyBoost
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={accountEmail}
                    onChange={(e) => setAccountEmail(e.target.value)}
                    placeholder="votre-email@skyboost.me"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                  <span>Clé API SkyBoost (ou jeton secret)</span>
                  <a
                    href="https://skyboost.me"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-amber-600 hover:underline flex items-center space-x-1"
                  >
                    <span>skyboost.me</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk_live_skyboost_..."
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-linear-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                  <span>{isSubmitting ? 'Connexion à SkyBoost...' : 'Lier mon compte SkyBoost'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleQuickDemoConnect}
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Liaison rapide (Compte SkyBoost vérifié • Solde 25.00 €)</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Account summary pill */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-semibold text-slate-800">
                    Compte SkyBoost lié : <span className="text-slate-500">{userProfile?.skyboostAccountEmail || userProfile?.email || 'skyboost.me'}</span>
                  </span>
                </div>
                <span className="font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  Solde : {userProfile?.skyboostBalance || '25.00 €'}
                </span>
              </div>

              {/* Target Post Preview snippet */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Publication ciblée</span>
                <p className="text-xs text-slate-700 line-clamp-2 italic font-medium">
                  "{post.content}"
                </p>
                <div className="text-[11px] text-blue-600 font-semibold pt-1 flex items-center space-x-3">
                  <span>Page : {post.pageName}</span>
                  <span>•</span>
                  <span>Statut : {post.status === 'published' ? 'En ligne' : 'Programmé'}</span>
                  <span>•</span>
                  <span>Likes actuels : {post.likes}</span>
                </div>
              </div>

              {/* Likes selection packages */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Sélectionnez le volume de boost souhaité :
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { count: 100, price: '3.90 €' },
                    { count: 250, price: '7.50 €' },
                    { count: 500, price: '12.90 €' },
                  ].map((pkg) => (
                    <button
                      key={pkg.count}
                      type="button"
                      onClick={() => setSelectedLikes(pkg.count)}
                      className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                        selectedLikes === pkg.count
                          ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-black text-sm text-slate-900 block">+{pkg.count}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">likes Facebook</span>
                      <span className="text-[10px] font-bold text-amber-700 block mt-1">{pkg.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                {post.status === 'published' ? (
                  <span className="flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Livraison immédiate : les likes seront envoyés directement sur votre publication publiée.</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Commande automatique programmée : PostPilot déclenchera la commande SkyBoost dès publication sur Facebook ({post.scheduledFor}).</span>
                  </span>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleExecuteBoost}
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-linear-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-md shadow-orange-500/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Rocket className="w-4 h-4" />
                  )}
                  <span>
                    {isSubmitting ? 'Traitement de la commande...' : `Commander +${selectedLikes} likes via SkyBoost`}
                  </span>
                </button>
              </div>

              <div className="text-center text-[11px] text-slate-400">
                Commande débitée de votre solde SkyBoost ({userProfile?.skyboostBalance || '25.00 €'})
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
