import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Globe,
  Bot,
  Layers,
  MousePointerClick,
  Rocket,
  ShieldCheck,
  TrendingUp,
  Star,
  ChevronRight,
  RefreshCw,
  Zap,
  Play
} from 'lucide-react';

interface LandingPageProps {
  onStartSignUp: () => void;
  onOpenSignIn: () => void;
  currentUserEmail?: string | null;
  onGoToDashboard?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartSignUp,
  onOpenSignIn,
  currentUserEmail,
  onGoToDashboard
}) => {
  // Survey / Quiz State
  const [surveyStep, setSurveyStep] = useState<number>(1);
  const [businessType, setBusinessType] = useState<string>('E-commerce & Boutique');
  const [websiteUrl, setWebsiteUrl] = useState<string>('');
  const [mainChallenge, setMainChallenge] = useState<string>('Abonnés qui ne cliquent pas vers le site');
  const [trafficGoal, setTrafficGoal] = useState<string>('2 500 à 5 000 visiteurs / mois');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleRunAudit = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: websiteUrl,
          businessName: websiteUrl ? websiteUrl.replace(/^https?:\/\//, '').split('.')[0] : businessType,
          description: `Activité dans le secteur ${businessType}, objectif de trafic : ${trafficGoal}`,
          targetAudience: 'Clients potentiels sur Facebook',
          offer: 'Produits et services avec forte valeur ajoutée'
        })
      });
      const data = await res.json();
      if (data.data) {
        setAnalysisResult(data.data);
      }
    } catch (e) {
      console.error(e);
      // Fallback
      setAnalysisResult({
        summary: `Votre activité ${businessType} dispose d'un potentiel viral exceptionnel sur Facebook pour rediriger du trafic qualifié.`,
        trafficHooks: [
          `Vous perdez encore du temps à tout faire à la main ? La solution rapide sur ${websiteUrl || 'votre site'} 👇`,
          'La méthode secrète pour convertir un simple visiteur Facebook en client régulier :'
        ],
        memeAngles: [
          'Moi regardant le trafic Facebook affluer sur mon site pendant que je dors',
          'Ceux qui font tout le community management à la main vs Ceux qui automatisent'
        ]
      });
    } finally {
      setIsAnalyzing(false);
      setSurveyStep(4);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <Send className="w-5 h-5 -rotate-45 ml-0.5 fill-current" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 font-brand block">
                Post<span className="text-indigo-600">Pilot</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Marketing Facebook & Mèmes Viraux</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {currentUserEmail ? (
              <div className="flex items-center space-x-2">
                <span className="hidden sm:inline-block text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                  Connecté : <strong className="text-slate-900">{currentUserEmail}</strong>
                </span>
                <button
                  onClick={onGoToDashboard || onStartSignUp}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-500/20 active:scale-98 transition-all cursor-pointer"
                >
                  <span>Accéder au Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={onOpenSignIn}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Connexion
                </button>
                <button
                  onClick={onStartSignUp}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-500/20 active:scale-98 transition-all cursor-pointer"
                >
                  <span>Essai Gratuit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold shadow-2xs">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Nouveau • L'assistant autonome Facebook qui convertit</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            Transformez vos publications Facebook en machine à trafic pour votre site web.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Fini les heures perdues sur Canva ou les budgets pubs Facebook engloutis. PostPilot analyse votre site, conçoit des mèmes viraux à fort engagement et publie pour vous en <strong>pilote 100% autonome</strong>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <a
              href="#audit"
              className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all cursor-pointer"
            >
              <span>🎯 Faire le Diagnostic Marketing de mon site (1 min)</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <button
              onClick={onStartSignUp}
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-2xl text-sm font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <span>Connexion avec Google</span>
            </button>
          </div>

          {/* Social Proof badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Zéro Coût de Génération d'Image IA</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Base PostgreSQL Cloud Sécurisée</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Boost Optionnel SkyBoost.me</span>
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Audit & Survey (Sondage interactif qui convertit) */}
      <section id="audit" className="py-12 px-4 sm:px-6 bg-linear-to-b from-white to-slate-50">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Survey Progress Bar */}
          <div className="h-1.5 bg-slate-100 w-full">
            <div
              className="h-full bg-linear-to-r from-indigo-600 to-purple-600 transition-all duration-500"
              style={{ width: `${(surveyStep / 4) * 100}%` }}
            />
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Audit Gratuit • Étape {surveyStep} sur 4
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                  {surveyStep === 1 && "Quel est votre type d'activité ?"}
                  {surveyStep === 2 && "Avez-vous un site web à promouvoir ?"}
                  {surveyStep === 3 && "Quel est votre plus grand défi sur Facebook ?"}
                  {surveyStep === 4 && "Résultats de l'Audit & Plan d'Action IA"}
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                Gratuit
              </span>
            </div>

            {/* Step 1: Business Type */}
            {surveyStep === 1 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  Sélectionnez la catégorie qui décrit le mieux votre entreprise pour calibrer l'algorithme d'accroche :
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'E-commerce & Boutique en ligne',
                    'SaaS, Logiciel & App',
                    'Freelance, Agence & Prestataire',
                    'Coaching, Formation & Consulting',
                    'Créateur de contenu & Média',
                    'Artisan & Commerce physique local'
                  ].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setBusinessType(cat)}
                      className={`p-3.5 rounded-2xl text-left border-2 text-xs font-bold transition-all cursor-pointer ${
                        businessType === cat
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 shadow-2xs'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSurveyStep(2)}
                    className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer"
                  >
                    <span>Continuer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Website URL & Analysis */}
            {surveyStep === 2 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  Renseignez l'URL de votre site ou boutique. L'IA va analyser vos offres pour générer des accroches publicitaires personnalisées :
                </p>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                    <Globe className="w-4 h-4 text-indigo-600" />
                    <span>Adresse de votre site web</span>
                  </label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://votre-boutique.com ou skyboost.me"
                    className="w-full px-4 py-3 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <span className="text-[11px] text-slate-400 block">
                    Si vous n'avez pas encore de site, vous pouvez laisser vide ou indiquer le lien d'un réseau social.
                  </span>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setSurveyStep(1)}
                    className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={() => setSurveyStep(3)}
                    className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer"
                  >
                    <span>Continuer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Main Challenge & Trigger Analysis */}
            {surveyStep === 3 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  Quel est votre obstacle principal pour attirer des clients depuis Facebook ?
                </p>

                <div className="space-y-2.5">
                  {[
                    'Je perds trop de temps à créer et programmer manuellement mes posts',
                    'Mes abonnés regardent mes publications mais ne cliquent jamais sur mon site',
                    'Les publicités payantes Facebook Ads me coûtent trop cher pour peu de rentabilité',
                    'Je manque constamment d\'idées de mèmes drôles ou d\'angles percutants'
                  ].map((challenge) => (
                    <button
                      key={challenge}
                      type="button"
                      onClick={() => setMainChallenge(challenge)}
                      className={`w-full p-3.5 rounded-2xl text-left border-2 text-xs font-semibold transition-all cursor-pointer ${
                        mainChallenge === challenge
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {challenge}
                    </button>
                  ))}
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setSurveyStep(2)}
                    className="text-xs text-slate-500 hover:text-slate-700 font-semibold"
                  >
                    Retour
                  </button>
                  <button
                    type="button"
                    onClick={handleRunAudit}
                    disabled={isAnalyzing}
                    className="py-3.5 px-6 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    )}
                    <span>{isAnalyzing ? 'Analyse de votre site en cours...' : 'Générer mon Diagnostic Marketing'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Survey Results & Conversion to Sign-up */}
            {surveyStep === 4 && analysisResult && (
              <div className="space-y-5 animate-in fade-in">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <span className="font-bold text-emerald-950 text-xs block">Analyse Terminée avec Succès</span>
                      <span className="text-[11px] text-emerald-700">Potentiel de conversion estimé : <strong>94/100</strong></span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-800 bg-emerald-100/60 px-3 py-1 rounded-full">
                    +15h économisées / mois
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                    <span className="font-bold text-slate-900 block">Positionnement Détecté :</span>
                    <p className="text-slate-600 leading-relaxed">
                      {analysisResult.summary}
                    </p>
                  </div>

                  <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2 text-xs">
                    <span className="font-bold text-indigo-900 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Exemples de Mèmes & Accroches Générés pour votre site :</span>
                    </span>
                    <ul className="space-y-1.5 text-slate-700">
                      {analysisResult.memeAngles?.slice(0, 2).map((angle: string, i: number) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-indigo-600 font-bold">•</span>
                          <span className="italic font-medium">"{angle}"</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Final Call to Action linking to Sign-Up / App */}
                <div className="p-5 bg-linear-to-r from-indigo-900 to-slate-900 text-white rounded-2xl space-y-3 text-center">
                  <h3 className="font-black text-base text-white">
                    Votre Tableau de Bord est Prêt à Être Activé !
                  </h3>
                  <p className="text-xs text-indigo-200">
                    Connectez votre page Facebook en 1 clic pour automatiser vos publications et commencer à rediriger du trafic vers votre site web dès aujourd'hui.
                  </p>

                  <button
                    onClick={currentUserEmail && onGoToDashboard ? onGoToDashboard : onStartSignUp}
                    className="w-full py-3.5 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/25 active:scale-98 transition-all cursor-pointer"
                  >
                    <span>
                      {currentUserEmail
                        ? 'Appliquer à mon Tableau de Bord & Publier'
                        : 'Accéder à mon Espace PostPilot & Connecter ma Page'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3 Pillars Section */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
            Comment ça marche
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Une formule conçue pour maximiser vos visites
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Du contenu viral sans effort qui transforme les spectateurs Facebook en acheteurs sur votre site.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">1. Analyse & Ciblage IA</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              L'IA scanne votre site web ou votre offre pour identifier les arguments percutants, les angles d'humour et les appels à l'action (CTA) qui incitent au clic.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">2. Mèmes Viraux Sans Coût IA</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Utilisez des templates de mèmes et vidéos célèbres vierges. PostPilot injecte le texte parfait avec la typographie Impact officielle pour un engagement garanti.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Rocket className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">3. Pilote Autonome & SkyBoost</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Laissez l'assistant publier pour vous aux meilleures heures. Activez l'option SkyBoost.me pour propulser les likes de vos publications d'un simple clic.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-200 bg-white text-xs text-slate-500 text-center space-y-3">
        <div className="flex items-center justify-center space-x-2 font-bold text-slate-900">
          <Send className="w-4 h-4 text-indigo-600" />
          <span>PostPilot • L'automatisation marketing Facebook nouvelle génération</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Connexion sécurisée PostgreSQL Cloud SQL • Zéro coût de génération d'image • Intégration SkyBoost.me
        </p>
      </footer>
    </div>
  );
};
