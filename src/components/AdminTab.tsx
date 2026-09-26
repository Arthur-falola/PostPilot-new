import React, { useState, useEffect, useRef } from 'react';
import { MemeTemplate, UserProfile } from '../types';
import {
  ShieldAlert,
  Users,
  Image as ImageIcon,
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  RefreshCw,
  Coins,
  TrendingUp,
  Globe,
  Upload,
  FileUp,
  Tag,
  Wand2,
  Check,
  AlertCircle
} from 'lucide-react';

interface AdminUserItem {
  id: number;
  uid: string;
  email: string;
  displayName?: string;
  role: 'user' | 'admin';
  plan: 'starter' | 'pro' | 'agency';
  monthlyPostsCount: number;
  monthlyAnalysesCount: number;
  skyboostBalance?: string;
  pagesCount: number;
  postsCount: number;
  createdAt?: string;
}

interface PlatformStats {
  totalUsers: number;
  totalActivePages: number;
  totalPages: number;
  totalPosts: number;
  totalBoostedOrders: number;
  totalMemeTemplates: number;
}

interface AdminTabProps {
  currentUser: UserProfile;
  onRefreshTemplates: () => void;
}

export const AdminTab: React.FC<AdminTabProps> = ({ currentUser, onRefreshTemplates }) => {
  const [activeSubTab, setActiveSubTab] = useState<'memes' | 'users' | 'stats'>('memes');
  const [templates, setTemplates] = useState<MemeTemplate[]>([]);
  const [usersList, setUsersList] = useState<AdminUserItem[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // New Meme Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'classique' | 'business' | 'video_court' | 'reaction'>('business');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [defaultTop, setDefaultTop] = useState('');
  const [defaultBottom, setDefaultBottom] = useState('');
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<Array<{ topText: string; bottomText: string; caption: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorToast(msg);
      setTimeout(() => setErrorToast(null), 4000);
    } else {
      setSuccessToast(msg);
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/meme-templates');
      const data = await res.json();
      if (data.templates) {
        setTemplates(data.templates);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.users) {
        setUsersList(data.users);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchAdminUsers();
    fetchStats();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setImageUrl(result);
        if (!title) {
          setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTestAiDescription = async () => {
    if (!description.trim()) {
      showNotification("Veuillez d'abord rédiger une description de ce que l'on voit sur l'image.", true);
      return;
    }
    setIsTestingAi(true);
    try {
      const res = await fetch('/api/generate-meme-captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memeName: title || 'Mème Test',
          templateDescription: description,
          businessName: 'PostPilot SaaS',
          offer: 'Automatisation marketing Facebook et génération de trafic web',
          websiteUrl: 'https://postpilot.app',
          style: 'viral_spicy'
        })
      });
      const data = await res.json();
      if (data.variations) {
        setAiTestResult(data.variations);
        if (!defaultTop && data.variations[0]?.topText) {
          setDefaultTop(data.variations[0].topText);
        }
        if (!defaultBottom && data.variations[0]?.bottomText) {
          setDefaultBottom(data.variations[0].bottomText);
        }
        showNotification('✨ Test IA réussi ! 3 propositions générées à partir de votre description visuelle.');
      }
    } catch (e: any) {
      showNotification('Erreur test IA: ' + e.message, true);
    } finally {
      setIsTestingAi(false);
    }
  };

  const handleSaveMemeTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim() || !description.trim()) {
      showNotification('Veuillez remplir le titre, le visuel (upload ou URL) et la description visuelle.', true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/meme-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category,
          imageUrl: imageUrl.trim(),
          description: description.trim(),
          tags: tags.trim(),
          defaultTop: defaultTop.trim() || 'TITRE SUPÉRIEUR DU MÈME',
          defaultBottom: defaultBottom.trim() || 'CHUTE DRÔLE DU MÈME',
          type: 'image'
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Le mème "${title}" a été ajouté à la bibliothèque IA avec succès !`);
        setTitle('');
        setImageUrl('');
        setDescription('');
        setTags('');
        setDefaultTop('');
        setDefaultBottom('');
        setAiTestResult([]);
        fetchTemplates();
        onRefreshTemplates();
      } else {
        showNotification(data.error || "Erreur lors de l'enregistrement", true);
      }
    } catch (err: any) {
      showNotification(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const res = await fetch(`/api/admin/meme-templates/${templateId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        showNotification('Modèle supprimé avec succès.');
        fetchTemplates();
        onRefreshTemplates();
      }
    } catch (e: any) {
      showNotification(e.message, true);
    }
  };

  const handleUpdateUserPlan = async (userId: number, newPlan: 'starter' | 'pro' | 'agency') => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/plan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: newPlan })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Formule mise à jour en "${newPlan.toUpperCase()}"`);
        fetchAdminUsers();
      }
    } catch (e: any) {
      showNotification(e.message, true);
    }
  };

  const handleToggleUserRole = async (userId: number, currentRole: 'user' | 'admin') => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Rôle utilisateur changé en "${nextRole}"`);
        fetchAdminUsers();
      }
    } catch (e: any) {
      showNotification(e.message, true);
    }
  };

  const handleAdjustBalance = async (userId: number, addedEuros: number) => {
    try {
      const user = usersList.find(u => u.id === userId);
      const current = parseFloat((user?.skyboostBalance || '0').replace('€', '').trim()) || 0;
      const newBalance = `${(current + addedEuros).toFixed(2)} €`;

      const res = await fetch(`/api/admin/users/${userId}/balance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: newBalance })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Solde SkyBoost crédité de +${addedEuros}€ (Nouveau: ${newBalance})`);
        fetchAdminUsers();
      }
    } catch (e: any) {
      showNotification(e.message, true);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Messages */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-bold">{successToast}</span>
        </div>
      )}
      {errorToast && (
        <div className="fixed top-5 right-5 z-50 bg-red-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-xs font-bold">{errorToast}</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Panneau Administrateur PostPilot</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Contrôle & Gestion Complète du Système
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Ajoutez de nouveaux modèles de mèmes avec descriptions visuelles pour guider l'IA, administrez les abonnements et gérez l'ensemble des utilisateurs.
          </p>
        </div>

        {/* Sub-tab switches */}
        <div className="flex items-center bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700/60 self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('memes')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeSubTab === 'memes'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Mèmes & IA ({templates.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeSubTab === 'users'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Utilisateurs ({usersList.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('stats')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeSubTab === 'stats'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Vue Globale</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: MEME TEMPLATES & VISUAL DESCRIPTIONS */}
      {activeSubTab === 'memes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Add New Meme Form */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Plus className="w-4 h-4 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Nouveau Modèle de Mème</h3>
                <p className="text-[11px] text-slate-400">Pour guider les générations IA</p>
              </div>
            </div>

            <form onSubmit={handleSaveMemeTemplate} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Titre du Mème</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Deux Boutons (Le Dilemme)"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Catégorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                >
                  <option value="business">Business & Stratégie</option>
                  <option value="classique">Classique & Humour Pop</option>
                  <option value="reaction">Réaction & Célébration</option>
                  <option value="video_court">Vidéo Courte</option>
                </select>
              </div>

              {/* Image Input (Upload file or URL) */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Visuel du Mème</label>
                <div className="space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 px-3 rounded-xl border border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/40 text-indigo-700 text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
                  >
                    <FileUp className="w-4 h-4" />
                    <span>Sélectionner une image (Fichier local)</span>
                  </button>

                  <div className="relative">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Ou collez une URL d'image directe..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-600 focus:outline-hidden"
                    />
                  </div>

                  {imageUrl && (
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                      <img src={imageUrl} alt="Aperçu" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-2 py-0.5 rounded-md font-mono">
                        Aperçu visuel
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* CRUCIAL FIELD: Visual Description for AI Context */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Description Visuelle (Ce qu'on voit)</span>
                  </label>
                  <span className="text-[10px] text-indigo-600 font-bold">Pour l'IA</span>
                </div>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez précisément les personnages, expressions et actions visuelles pour aider l'IA à formuler le meilleur texte adapté..."
                  required
                  className="w-full p-2.5 text-xs text-slate-800 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-600 focus:outline-hidden leading-relaxed"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Ex: "Un homme en sueur hésite nerveusement entre deux boutons rouges étiquetés avec deux choix opposés."
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tags Thématiques</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="dilemme, choix, hésitation, productivité"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              {/* AI Test Button */}
              <button
                type="button"
                onClick={handleTestAiDescription}
                disabled={isTestingAi || !description}
                className="w-full py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 border border-purple-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isTestingAi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                <span>{isTestingAi ? 'Test avec Gemini...' : "Tester la génération de l'IA"}</span>
              </button>

              {/* AI Test preview outputs */}
              {aiTestResult.length > 0 && (
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 space-y-2">
                  <span className="text-[10px] font-black uppercase text-purple-800 tracking-wider block">
                    Générations IA basées sur votre description :
                  </span>
                  {aiTestResult.slice(0, 2).map((res, i) => (
                    <div key={i} className="text-[11px] bg-white p-2 rounded-lg border border-purple-100 space-y-0.5">
                      <div className="font-extrabold text-slate-800">{res.topText}</div>
                      <div className="font-extrabold text-indigo-700">{res.bottomText}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Default text inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Texte Haut par défaut</label>
                  <input
                    type="text"
                    value={defaultTop}
                    onChange={(e) => setDefaultTop(e.target.value.toUpperCase())}
                    placeholder="MOI ENTRAIN DE..."
                    className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 uppercase bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Texte Bas par défaut</label>
                  <input
                    type="text"
                    value={defaultBottom}
                    onChange={(e) => setDefaultBottom(e.target.value.toUpperCase())}
                    placeholder="LA CHUTE DU MÈME"
                    className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 uppercase bg-slate-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 stroke-[3]" />}
                <span>Enregistrer dans la Bibliothèque</span>
              </button>
            </form>
          </div>

          {/* Right Column: Existing Meme Templates Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Bibliothèque Active des Mèmes ({templates.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Tous les modèles stockés dans la base de données PostgreSQL Cloud SQL
                </p>
              </div>
              <button
                onClick={fetchTemplates}
                className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                title="Actualiser"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between group hover:border-slate-300 transition-all"
                >
                  <div>
                    {/* Visual container */}
                    <div className="relative aspect-video bg-slate-900 overflow-hidden">
                      <img src={tpl.imageUrl} alt={tpl.name} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-xs text-white">
                          {tpl.category}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => handleDeleteTemplate(tpl.id)}
                          className="w-7 h-7 rounded-lg bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 cursor-pointer shadow-xs"
                          title="Supprimer ce modèle"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="p-4 space-y-2">
                      <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                        {tpl.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-xl border border-slate-100 italic">
                        "{tpl.description}"
                      </p>

                      {tpl.tags && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {tpl.tags.split(',').map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-medium"
                            >
                              #{tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>ID : {tpl.id}</span>
                    <span className="text-emerald-600 font-bold">✓ Actif</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: USERS & SUBSCRIPTIONS MANAGEMENT */}
      {activeSubTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Utilisateurs & Abonnements Actifs ({usersList.length})
              </h3>
              <p className="text-xs text-slate-500">
                Gérez les formules (Starter, Pro, Agence), les rôles d'accès et les crédits SkyBoost.
              </p>
            </div>
            <button
              onClick={fetchAdminUsers}
              className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 flex items-center space-x-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Rafraîchir</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  <th className="py-3 px-4">Utilisateur</th>
                  <th className="py-3 px-4">Rôle</th>
                  <th className="py-3 px-4">Formule Active</th>
                  <th className="py-3 px-4 text-center">Pages / Posts</th>
                  <th className="py-3 px-4 text-center">Solde SkyBoost</th>
                  <th className="py-3 px-4 text-right">Actions Rapides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {usersList.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{user.email}</div>
                      <div className="text-[10px] text-slate-400">UID: {user.uid} • ID: {user.id}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleUserRole(user.id, user.role)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase cursor-pointer transition-all ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 border border-purple-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title="Cliquer pour basculer le rôle admin"
                      >
                        {user.role === 'admin' ? '👑 Admin' : 'Utilisateur'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={user.plan || 'starter'}
                        onChange={(e) => handleUpdateUserPlan(user.id, e.target.value as any)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-xl border cursor-pointer ${
                          user.plan === 'agency'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : user.plan === 'pro'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="starter">Starter (0 €/m)</option>
                        <option value="pro">Pro Autonome (29 €/m)</option>
                        <option value="agency">Agence (79 €/m)</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-slate-900">{user.pagesCount}</span>
                      <span className="text-slate-400"> p. • </span>
                      <span className="font-bold text-blue-600">{user.postsCount}</span>
                      <span className="text-slate-400"> posts</span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-slate-900 bg-amber-50 text-amber-800 px-2 py-0.5 rounded-lg border border-amber-200">
                        {user.skyboostBalance || '0.00 €'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleAdjustBalance(user.id, 15)}
                          className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200 cursor-pointer transition-colors"
                          title="Créditer 15€ Skyboost"
                        >
                          +15€ SkyBoost
                        </button>
                        <button
                          onClick={() => handleAdjustBalance(user.id, 50)}
                          className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200 cursor-pointer transition-colors"
                          title="Créditer 50€ Skyboost"
                        >
                          +50€
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PLATFORM STATS */}
      {activeSubTab === 'stats' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Utilisateurs Enregistrés</span>
            <div className="text-3xl font-black text-slate-900">{stats?.totalUsers || usersList.length}</div>
            <p className="text-[11px] text-slate-500">Comptes avec persistance PostgreSQL</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Pages Facebook Connectées</span>
            <div className="text-3xl font-black text-blue-600">{stats?.totalPages || 0}</div>
            <p className="text-[11px] text-slate-500">{stats?.totalActivePages || 0} pages actives en production</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Publications Totales</span>
            <div className="text-3xl font-black text-purple-600">{stats?.totalPosts || 0}</div>
            <p className="text-[11px] text-slate-500">Mèmes et posts planifiés ou publiés</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Commandes Boost SkyBoost</span>
            <div className="text-3xl font-black text-amber-600">{stats?.totalBoostedOrders || 0}</div>
            <p className="text-[11px] text-slate-500">Injections de likes et engagement direct</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Modèles de Mèmes en Base</span>
            <div className="text-3xl font-black text-indigo-600">{stats?.totalMemeTemplates || templates.length}</div>
            <p className="text-[11px] text-slate-500">Visuels avec contextualisation IA</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Statut Serveur & Base</span>
            <div className="flex items-center space-x-2 text-emerald-600 font-extrabold text-sm pt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Cloud SQL & Gemini 3.8 Opérationnels</span>
            </div>
            <p className="text-[11px] text-slate-500">Prêt pour déploiement et push GitHub</p>
          </div>
        </div>
      )}
    </div>
  );
};
