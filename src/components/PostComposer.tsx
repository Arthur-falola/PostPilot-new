import React, { useState, useRef } from 'react';
import { FacebookLivePreview } from './FacebookLivePreview';
import { FacebookPage, Post, MemeTemplate } from '../types';
import { Calendar, Sparkles, Check, Image as ImageIcon, Link as LinkIcon, RefreshCw, Layers, Upload, FileUp, X } from 'lucide-react';

interface PostComposerProps {
  activePage: FacebookPage;
  memeTemplates: MemeTemplate[];
  onSavePost: (post: Omit<Post, 'id' | 'createdAt' | 'clicks' | 'likes' | 'shares'>) => void;
  onCancel: () => void;
  initialValues?: {
    content?: string;
    hashtags?: string;
    cta?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'meme' | 'video';
    memeTopText?: string;
    memeBottomText?: string;
    category?: string;
    scheduledFor?: string;
  };
}

export const PostComposer: React.FC<PostComposerProps> = ({
  activePage,
  memeTemplates,
  onSavePost,
  onCancel,
  initialValues
}) => {
  const [content, setContent] = useState(initialValues?.content || '');
  const [hashtags, setHashtags] = useState(
    initialValues?.hashtags || '#MarketingDigital #TraficWeb #PostPilot #Entrepreneuriat'
  );
  const [cta, setCta] = useState(
    initialValues?.cta || `👉 Visitez notre site web pour en savoir plus : ${activePage.websiteUrl || 'https://postpilot.app'}`
  );
  const [mediaSourceTab, setMediaSourceTab] = useState<'templates' | 'upload' | 'url'>('templates');
  const [mediaType, setMediaType] = useState<'image' | 'meme' | 'video'>(
    initialValues?.mediaType || 'meme'
  );
  const [mediaUrl, setMediaUrl] = useState(
    initialValues?.mediaUrl || memeTemplates[0]?.imageUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80'
  );
  const [enableMemeOverlay, setEnableMemeOverlay] = useState<boolean>(true);
  const [memeTopText, setMemeTopText] = useState(
    initialValues?.memeTopText || 'MOI FAISANT TOUT LE MARKETING À LA MAIN'
  );
  const [memeBottomText, setMemeBottomText] = useState(
    initialValues?.memeBottomText || 'MOI DÉCOUVRANT LE PILOTE AUTOMATIQUE POSTPILOT'
  );
  const [scheduledDate, setScheduledDate] = useState(initialValues?.scheduledFor || '26/09/2026 10:00');
  const [isPolishing, setIsPolishing] = useState(false);
  const [activeMemeId, setActiveMemeId] = useState(memeTemplates[0]?.id || '');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectMemeTemplate = (template: MemeTemplate) => {
    setActiveMemeId(template.id);
    setMediaType(template.type === 'video' ? 'video' : 'meme');
    setMediaUrl(template.videoUrl || template.imageUrl);
    setMemeTopText(template.defaultTop);
    setMemeBottomText(template.defaultBottom);
    setEnableMemeOverlay(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setMediaUrl(result);
        setMediaType('image');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAiPolish = async () => {
    if (!content.trim()) return;
    setIsPolishing(true);
    try {
      const res = await fetch('/api/generate-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageName: activePage.name,
          businessProfile: {
            url: activePage.websiteUrl,
            description: activePage.businessDescription,
            offer: activePage.offer
          },
          theme: content,
          count: 1
        })
      });
      const data = await res.json();
      if (data.posts && data.posts.length > 0) {
        const p = data.posts[0];
        setContent(p.text);
        if (p.hashtags) setHashtags(p.hashtags);
        if (p.cta) setCta(p.cta);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleSubmit = (status: 'scheduled' | 'published') => {
    onSavePost({
      pageId: activePage.id,
      pageName: activePage.name,
      pageAvatar: activePage.avatar,
      content,
      hashtags,
      cta,
      websiteUrl: activePage.websiteUrl || 'https://postpilot.app',
      category: initialValues?.category || 'CAMPAGNE TRAFIC SITE',
      mediaType,
      mediaUrl,
      memeTopText: enableMemeOverlay ? memeTopText : '',
      memeBottomText: enableMemeOverlay ? memeBottomText : '',
      status,
      scheduledFor: status === 'published' ? "À l'instant" : scheduledDate,
      isAutonomous: false
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Editor Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Créer une Publication pour {activePage.name}
            </h2>
            <p className="text-xs text-slate-500">
              Rédigez ou laissez l'IA optimiser votre message pour attirer des visiteurs sur votre site web.
            </p>
          </div>

          <button
            onClick={handleAiPolish}
            disabled={isPolishing || !content}
            className="py-2 px-3.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold flex items-center space-x-2 border border-purple-200 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isPolishing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{isPolishing ? 'Optimisation IA...' : '✨ Optimiser avec l\'IA'}</span>
          </button>
        </div>

        {/* Message Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700">
            Écrivez le message de votre publication...
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="Écrivez le message de votre publication..."
            className="w-full p-4 text-sm text-slate-800 rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50 leading-relaxed"
          />
        </div>

        {/* Hashtags & Date/Time Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Hashtags</label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#Fitness #Nutrition #BienEtre"
              className="w-full px-3.5 py-2.5 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Date et heure</label>
            <div className="relative">
              <input
                type="text"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                placeholder="07/09/2026 10:00"
                className="w-full px-3.5 py-2.5 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* CTA to Website */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>Appel à l'action vers le site web (CTA)</span>
          </label>
          <input
            type="text"
            value={cta}
            onChange={(e) => setCta(e.target.value)}
            placeholder={`Visitez notre site web pour découvrir nos offres : ${activePage.websiteUrl || 'https://postpilot.app'}`}
            className="w-full px-3.5 py-2.5 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50"
          />
        </div>

        {/* Media Selector (Meme Template / Custom Photo Upload / URL) */}
        <div className="space-y-4 pt-3 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Visuel de la publication</span>
            </label>

            {/* Media Tabs */}
            <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setMediaSourceTab('templates')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  mediaSourceTab === 'templates'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mèmes viraux
              </button>
              <button
                type="button"
                onClick={() => setMediaSourceTab('upload')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center space-x-1 ${
                  mediaSourceTab === 'upload'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3 h-3" />
                <span>Uploader ma photo</span>
              </button>
              <button
                type="button"
                onClick={() => setMediaSourceTab('url')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  mediaSourceTab === 'url'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lien URL
              </button>
            </div>
          </div>

          {/* Tab 1: Meme Templates Carousel */}
          {mediaSourceTab === 'templates' && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                {memeTemplates.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectMemeTemplate(m)}
                    className={`shrink-0 w-24 rounded-xl overflow-hidden border-2 text-center transition-all ${
                      activeMemeId === m.id
                        ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-xs scale-105'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src={m.imageUrl} alt={m.name} className="w-full h-14 object-cover" />
                    <div className="p-1 bg-white text-[9px] font-bold text-slate-700 truncate">
                      {m.name.split('(')[0]}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Custom Photo Upload */}
          {mediaSourceTab === 'upload' && (
            <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-white rounded-xl p-5 text-center cursor-pointer transition-all hover:shadow-xs group"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <FileUp className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  {uploadedFileName ? `Photo sélectionnée : ${uploadedFileName}` : 'Cliquez pour sélectionner une photo sur votre ordinateur'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Prend en charge PNG, JPG, WebP jusqu'à 15 Mo
                </p>
              </div>

              {mediaUrl && (
                <div className="flex items-center space-x-3 bg-white p-2 rounded-xl border border-indigo-100">
                  <img src={mediaUrl} alt="Aperçu upload" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-slate-800 block truncate">
                      {uploadedFileName || 'Photo personnalisée prête'}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">✓ Prête pour la publication</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFileName('');
                      setMediaUrl(memeTemplates[0]?.imageUrl || '');
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Custom Image URL */}
          {mediaSourceTab === 'url' && (
            <div className="space-y-1.5">
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => {
                  setMediaUrl(e.target.value);
                  setMediaType('image');
                }}
                placeholder="https://exemple.com/mon-image.jpg"
                className="w-full px-3.5 py-2.5 text-xs text-slate-800 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50"
              />
            </div>
          )}

          {/* Meme Overlay Option & Inputs */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={enableMemeOverlay}
                onChange={(e) => setEnableMemeOverlay(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span className="text-xs font-bold text-slate-700">
                Inscrire un texte mème accrocheur par-dessus l'image
              </span>
            </label>

            {enableMemeOverlay && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Texte du Haut sur le Mème
                  </label>
                  <input
                    type="text"
                    value={memeTopText}
                    onChange={(e) => setMemeTopText(e.target.value.toUpperCase())}
                    placeholder="TEXTE DU HAUT EN MAJUSCULES"
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 uppercase"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Texte du Bas sur le Mème
                  </label>
                  <input
                    type="text"
                    value={memeBottomText}
                    onChange={(e) => setMemeBottomText(e.target.value.toUpperCase())}
                    placeholder="TEXTE DU BAS EN MAJUSCULES"
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 uppercase"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Facebook Live Feed Preview Section */}
      <div className="space-y-4">
        <div className="text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
            APERÇU EN DIRECT SUR LE FIL FACEBOOK
          </span>
        </div>

        <FacebookLivePreview
          pageName={activePage.name}
          pageAvatar={activePage.avatar}
          content={content}
          hashtags={hashtags}
          cta={cta}
          mediaType={mediaType}
          mediaUrl={mediaUrl}
          memeTopText={enableMemeOverlay ? memeTopText : ''}
          memeBottomText={enableMemeOverlay ? memeBottomText : ''}
          scheduledTime={scheduledDate}
        />
      </div>

      {/* Sticky Bottom Actions Bar (Matches Screenshot 3) */}
      <div className="p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-lg flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          Annuler
        </button>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => handleSubmit('published')}
            className="hidden sm:inline-flex px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Publier maintenant
          </button>

          <button
            type="button"
            onClick={() => handleSubmit('scheduled')}
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-sm font-bold flex items-center space-x-2 shadow-md shadow-blue-500/25 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Valider et programmer la publication</span>
          </button>
        </div>
      </div>
    </div>
  );
};
