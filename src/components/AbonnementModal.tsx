import React, { useState } from 'react';
import { Crown, Check, X, Sparkles, Zap, ShieldCheck, RefreshCw } from 'lucide-react';
import { UserProfile } from '../types';

interface AbonnementModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile | null;
  onPlanChanged?: (updatedUser: UserProfile) => void;
}

export const AbonnementModal: React.FC<AbonnementModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onPlanChanged
}) => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPlan = userProfile?.plan || 'starter';

  const handleChoosePlan = async (plan: 'starter' | 'pro' | 'agency') => {
    if (plan === currentPlan) {
      onClose();
      return;
    }
    setLoadingPlan(plan);
    try {
      const res = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setSuccessToast(`Votre formule a été mise à jour avec succès : ${plan.toUpperCase()}`);
        if (onPlanChanged) {
          onPlanChanged(data.user);
        }
        setTimeout(() => {
          setSuccessToast(null);
          onClose();
        }, 1200);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 text-center bg-linear-to-b from-indigo-50/70 to-white border-b border-slate-100 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-2">
            <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Formules PostPilot</span>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Passez à la Vitesse Supérieure
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
            Automatisez tout votre marketing Facebook et remplissez votre site web de nouveaux clients en continu.
          </p>

          {successToast && (
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold flex items-center justify-center space-x-2 animate-in zoom-in">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{successToast}</span>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto">
          {/* Starter */}
          <div className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
            currentPlan === 'starter' ? 'border-slate-900 bg-slate-50/40 ring-2 ring-slate-900/10' : 'border-slate-200 hover:border-slate-300'
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Starter</span>
                {currentPlan === 'starter' && (
                  <span className="text-[10px] font-black uppercase text-slate-700 bg-slate-200 px-2 py-0.5 rounded-md">
                    Actif
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-black text-slate-900">0 €</span>
                <span className="text-xs text-slate-400 ml-1">/ mois</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Idéal pour tester l'outil sur 1 page Facebook.
              </p>

              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>1 Page Facebook connectée</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>5 Publications par mois</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Planification manuelle</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>3 Analyses de site web / mois</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleChoosePlan('starter')}
              disabled={loadingPlan !== null}
              className={`mt-6 w-full py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                currentPlan === 'starter'
                  ? 'border-slate-300 bg-slate-100 text-slate-500'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {currentPlan === 'starter' ? 'Formule Actuelle' : 'Choisir Starter'}
            </button>
          </div>

          {/* Pro Autonome (Best) */}
          <div className={`rounded-2xl border-2 p-5 flex flex-col justify-between relative shadow-lg ${
            currentPlan === 'pro'
              ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20'
              : 'border-indigo-600 bg-indigo-50/20 shadow-indigo-500/10'
          }`}>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-linear-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full tracking-wider shadow-xs">
              {currentPlan === 'pro' ? 'Formule Actuelle' : 'Recommandé'}
            </div>

            <div>
              <span className="text-xs font-bold text-indigo-700 uppercase">Pro Autonome</span>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-black text-slate-900">29 €</span>
                <span className="text-xs text-slate-400 ml-1">/ mois</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-2">
                L'assistant autonome qui s'occupe de tout pour attirer des clients.
              </p>

              <ul className="mt-4 space-y-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Jusqu'à 3 Pages Facebook</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span><strong>Pilote 100% Autonome Débloqué</strong></span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Publications & Mèmes illimités</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Analyseur IA de Site Web illimité</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Notifications & Alertes de trafic</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleChoosePlan('pro')}
              disabled={loadingPlan !== null}
              className={`mt-6 w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                currentPlan === 'pro'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/25'
              }`}
            >
              {loadingPlan === 'pro' && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{currentPlan === 'pro' ? '✓ Actif sur votre compte' : 'Passer au Pro Autonome'}</span>
            </button>
          </div>

          {/* Agence */}
          <div className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
            currentPlan === 'agency' ? 'border-purple-600 bg-purple-50/30 ring-2 ring-purple-500/20' : 'border-slate-200 hover:border-slate-300'
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Agence</span>
                {currentPlan === 'agency' && (
                  <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                    Actif
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-black text-slate-900">79 €</span>
                <span className="text-xs text-slate-400 ml-1">/ mois</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Pour gérer les pages et sites de multiples clients.
              </p>

              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Pages Facebook illimitées</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Multi-marques & Multi-sites</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Tout en illimité</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Support prioritaire & Accès API</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleChoosePlan('agency')}
              disabled={loadingPlan !== null}
              className={`mt-6 w-full py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1.5 ${
                currentPlan === 'agency'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {loadingPlan === 'agency' && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{currentPlan === 'agency' ? '✓ Actif sur votre compte' : 'Choisir Agence'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
