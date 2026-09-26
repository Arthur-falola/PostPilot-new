import React, { useState } from 'react';
import { Sparkles, Play, Image as ImageIcon, Send, RefreshCw, Wand2, Download, Copy, Check, Sliders, AlertCircle } from 'lucide-react';
import { MemeTemplate, FacebookPage } from '../types';

interface MemeStudioProps {
  templates: MemeTemplate[];
  activePage: FacebookPage;
  onApplyMemeToPost: (meme: {
    template: MemeTemplate;
    topText: string;
    bottomText: string;
    caption?: string;
  }) => void;
}

export const MemeStudio: React.FC<MemeStudioProps> = ({
  templates,
  activePage,
  onApplyMemeToPost
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate>(templates[0]);
  const [topText, setTopText] = useState(templates[0].defaultTop);
  const [bottomText, setBottomText] = useState(templates[0].defaultBottom);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiVariations, setAiVariations] = useState<Array<{ topText: string; bottomText: string; caption: string }>>([]);
  const [fontSize, setFontSize] = useState<number>(24);
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [copied, setCopied] = useState(false);

  const filteredTemplates = templates.filter(t => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'video') return t.type === 'video';
    if (activeFilter === 'image') return t.type === 'image';
    return t.category === activeFilter;
  });

  const handleSelectTemplate = (template: MemeTemplate) => {
    setSelectedTemplate(template);
    setTopText(template.defaultTop);
    setBottomText(template.defaultBottom);
  };

  const handleGenerateAiCaptions = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-meme-captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memeName: selectedTemplate.name,
          templateDescription: selectedTemplate.description,
          businessName: activePage.name,
          offer: activePage.offer || 'Génération de clients et trafic web',
          websiteUrl: activePage.websiteUrl || 'https://postpilot.app',
          style: activePage.autoPilotHumor || 'humour'
        })
      });
      const data = await res.json();
      if (data.variations && data.variations.length > 0) {
        setAiVariations(data.variations);
        // Automatically apply the first one
        setTopText(data.variations[0].topText);
        setBottomText(data.variations[0].bottomText);
      }
    } catch (err) {
      console.error('Failed to generate meme text:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyVariation = (v: { topText: string; bottomText: string; caption: string }) => {
    setTopText(v.topText);
    setBottomText(v.bottomText);
  };

  const handleUseInPost = () => {
    const matchedVariation = aiVariations.find(v => v.topText === topText);
    onApplyMemeToPost({
      template: selectedTemplate,
      topText,
      bottomText,
      caption: matchedVariation?.caption
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Explanation */}
      <div className="p-5 rounded-2xl bg-linear-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-indigo-200 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Économie 100% Garantie • Zéro Coût de Génération d'Image IA</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-2">
            Fabrique de Mèmes & Vidéos Virales pour {activePage.name}
          </h2>
          <p className="text-indigo-200 text-xs sm:text-sm leading-relaxed">
            Les images et vidéos courtes familières obtiennent jusqu'à 8x plus de partages et de clics vers votre site que de simples photos de stock. Ajoutez vos messages d'accroche ou laissez l'IA créer la formule gagnante !
          </p>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Meme Canvas & Preview (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Aperçu en Direct du Mème</h3>
                <p className="text-xs text-slate-500">
                  {selectedTemplate.type === 'video' ? 'Mème vidéo en boucle (MP4)' : 'Image vierge haute définition'}
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {selectedTemplate.type === 'video' ? '🎬 Vidéo' : '🖼️ Image'}
              </span>
            </div>

            {/* The Live Visual Canvas */}
            <div className="relative bg-slate-950 rounded-xl overflow-hidden shadow-inner aspect-4/3 flex items-center justify-center border border-slate-800 group">
              {selectedTemplate.type === 'video' ? (
                <video
                  key={selectedTemplate.videoUrl}
                  src={selectedTemplate.videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={selectedTemplate.imageUrl}
                  alt={selectedTemplate.name}
                  className="w-full h-full object-cover select-none"
                />
              )}

              {/* Dynamic Meme Top Text */}
              {topText && (
                <div className="absolute top-4 inset-x-2 text-center pointer-events-none px-4 z-20">
                  <span
                    className="meme-text uppercase font-black tracking-wider block"
                    style={{
                      fontSize: `${fontSize}px`,
                      color: textColor,
                      lineHeight: 1.15
                    }}
                  >
                    {topText}
                  </span>
                </div>
              )}

              {/* Dynamic Meme Bottom Text */}
              {bottomText && (
                <div className="absolute bottom-4 inset-x-2 text-center pointer-events-none px-4 z-20">
                  <span
                    className="meme-text uppercase font-black tracking-wider block"
                    style={{
                      fontSize: `${fontSize}px`,
                      color: textColor,
                      lineHeight: 1.15
                    }}
                  >
                    {bottomText}
                  </span>
                </div>
              )}

              {/* Small branding badge watermark */}
              <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-[10px] text-white/80 rounded font-semibold z-10 pointer-events-none">
                {activePage.websiteUrl ? activePage.websiteUrl.replace(/^https?:\/\//, '') : 'postpilot.app'}
              </div>
            </div>

            {/* Canvas Action Bar */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={handleUseInPost}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center justify-center space-x-2 shadow-md shadow-blue-500/20 active:scale-98 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Utiliser dans ma publication Facebook</span>
              </button>
            </div>
          </div>

          {/* Quick AI Suggestions List if generated */}
          {aiVariations.length > 0 && (
            <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 flex items-center space-x-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Suggestions IA générées pour {activePage.name} :</span>
                </span>
                <span className="text-[11px] text-purple-600 font-medium">Cliquez pour appliquer</span>
              </div>
              <div className="space-y-2">
                {aiVariations.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => handleApplyVariation(v)}
                    className="w-full text-left p-3 rounded-xl bg-white border border-purple-100 hover:border-purple-300 hover:shadow-xs transition-all text-xs space-y-1"
                  >
                    <div className="font-extrabold text-slate-900 line-clamp-1">
                      1. {v.topText}
                    </div>
                    <div className="font-extrabold text-purple-700 line-clamp-1">
                      2. {v.bottomText}
                    </div>
                    {v.caption && (
                      <p className="text-[11px] text-slate-500 line-clamp-1 pt-1 italic">
                        "{v.caption}"
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Text Editor & Template Picker (7 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Controls & AI Generator Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Personnalisation du Mème</h3>
              
              <button
                onClick={handleGenerateAiCaptions}
                disabled={isGenerating}
                className="py-1.5 px-3 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>{isGenerating ? 'Génération...' : '✨ Générer textes IA pour mon site'}</span>
              </button>
            </div>

            {/* Input Top Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Texte du Haut (Accroche / Problème)</span>
                <span className="text-[10px] text-slate-400">Impact / Majuscules</span>
              </label>
              <textarea
                value={topText}
                onChange={(e) => setTopText(e.target.value.toUpperCase())}
                rows={2}
                placeholder="EX: MOI ENTRAIN DE REGARDER LE SITE..."
                className="w-full px-3 py-2 text-xs font-bold tracking-wide rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-slate-50 uppercase"
              />
            </div>

            {/* Input Bottom Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Texte du Bas (Chute / Solution vers mon site)</span>
                <span className="text-[10px] text-slate-400">Chute percutante</span>
              </label>
              <textarea
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value.toUpperCase())}
                rows={2}
                placeholder="EX: REMPLIR MON SITE DE CLIENTS EN AUTOMATIQUE 😄"
                className="w-full px-3 py-2 text-xs font-bold tracking-wide rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-slate-50 uppercase"
              />
            </div>

            {/* Typography Controls */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 flex items-center justify-between mb-1">
                  <span>Taille du texte</span>
                  <span className="font-mono text-slate-400">{fontSize}px</span>
                </label>
                <input
                  type="range"
                  min={16}
                  max={36}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Couleur du texte
                </label>
                <div className="flex items-center space-x-2">
                  {['#ffffff', '#facc15', '#38bdf8', '#4ade80'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setTextColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        textColor === color ? 'border-purple-600 scale-110 shadow-xs' : 'border-slate-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Template Picker */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Bibliothèque de Modèles Mèmes</h3>
              
              {/* Category Filter Pills */}
              <div className="flex items-center space-x-1 text-xs">
                {[
                  { id: 'all', label: 'Tous' },
                  { id: 'classique', label: 'Classiques' },
                  { id: 'business', label: 'Business' },
                  { id: 'video', label: '🎬 Vidéos' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      activeFilter === f.id
                        ? 'bg-purple-100 text-purple-700 font-semibold'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Thumbnails Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className={`relative rounded-xl overflow-hidden border-2 text-left group transition-all cursor-pointer ${
                    selectedTemplate.id === template.id
                      ? 'border-purple-600 ring-2 ring-purple-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="aspect-square bg-slate-900 relative">
                    <img
                      src={template.imageUrl}
                      alt={template.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {template.type === 'video' && (
                      <div className="absolute top-1 right-1 bg-black/70 text-white rounded p-1">
                        <Play className="w-2.5 h-2.5 fill-current" />
                      </div>
                    )}
                  </div>
                  <div className="p-2 bg-white">
                    <p className="text-[11px] font-bold text-slate-800 line-clamp-1">
                      {template.name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
