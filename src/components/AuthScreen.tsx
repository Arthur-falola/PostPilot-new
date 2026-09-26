import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, ShieldCheck, CheckCircle2, Database, Sparkles, ArrowRight, Lock, ArrowLeft, Mail, Key, User } from 'lucide-react';

interface AuthScreenProps {
  initialMode?: 'signin' | 'signup';
  onBackToLanding?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialMode = 'signup',
  onBackToLanding
}) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'La connexion avec Google a échoué.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (mode === 'signup') {
        if (password.length < 6) {
          throw new Error('Le mot de passe doit comporter au moins 6 caractères.');
        }
        await signUpWithEmail(email, password, displayName || undefined);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'Une erreur est survenue lors de la connexion.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'Cette adresse email est déjà associée à un compte. Veuillez vous connecter.';
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Identifiants incorrects. Veuillez vérifier votre email et mot de passe.';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'Aucun compte trouvé avec cet email. Veuillez créer un compte.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Le mot de passe doit comporter au moins 6 caractères.';
      }
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8">
      {onBackToLanding && (
        <button
          onClick={onBackToLanding}
          className="mb-4 inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à l'accueil / Diagnostic</span>
        </button>
      )}

      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-indigo-600 to-blue-600 mx-auto flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
            <Send className="w-6 h-6 -rotate-45 ml-0.5 fill-current" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-brand">
            Post<span className="text-indigo-600">Pilot</span>
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            {mode === 'signup'
              ? 'Créez votre compte pour activer votre gestionnaire Facebook autonome.'
              : 'Connectez-vous pour retrouver votre tableau de bord Facebook.'}
          </p>
        </div>

        {/* Tab Switcher: Inscription / Connexion */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Créer un compte
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Se connecter
          </button>
        </div>

        {/* Google Quick Sign-In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center space-x-2.5 shadow-2xs transition-all active:scale-98 cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continuer avec Google</span>
        </button>

        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span>ou par email</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Votre nom ou nom d'entreprise
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ex: Arthur Falola ou Ma Boutique"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@entreprise.com"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Mot de passe
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-md shadow-indigo-500/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>
              {isSubmitting
                ? 'Traitement...'
                : mode === 'signup'
                ? 'Créer mon compte et continuer'
                : 'Se connecter'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Database & Architecture Badge */}
        <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center space-x-2.5 text-[11px] text-indigo-900">
          <Database className="w-4 h-4 text-indigo-600 shrink-0" />
          <div className="leading-tight">
            <span className="font-bold block">Données PostgreSQL en ligne actives</span>
            <span className="text-[10px] text-indigo-700">Synchronisation directe de vos pages réelles et publications</span>
          </div>
        </div>
      </div>
    </div>
  );
};
