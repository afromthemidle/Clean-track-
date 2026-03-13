import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useApp } from '../context/AppContext';

const Auth: React.FC = () => {
  const { t } = useApp();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        alert(t('checkEmail'));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-100/50 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-100/50 rounded-full blur-3xl"></div>

      <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 w-full max-w-md relative z-10">
        <div className="flex items-center justify-center gap-3 text-teal-600 mb-10">
          <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center shadow-sm border border-teal-100">
            <i className="fa-solid fa-broom text-2xl"></i>
          </div>
          <h1 className="font-display font-extrabold text-3xl tracking-tight text-slate-800">{t('appTitle')}</h1>
        </div>
        
        <h2 className="text-2xl font-display font-bold text-slate-800 mb-8 text-center">
          {isLogin ? t('welcomeBack') : t('createAccount')}
        </h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm flex items-start gap-3 border border-red-100">
            <i className="fa-solid fa-circle-exclamation mt-0.5"></i>
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">{t('email')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fa-regular fa-envelope text-slate-400"></i>
              </div>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl border-slate-200 border bg-slate-50/50 pl-10 p-3 text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">{t('password')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fa-solid fa-lock text-slate-400"></i>
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl border-slate-200 border bg-slate-50/50 pl-10 p-3 text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-teal-600 text-white font-bold py-3.5 rounded-xl hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-600/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><i className="fa-solid fa-circle-notch fa-spin"></i> {t('loading')}</>
            ) : (
              isLogin ? <>{t('signIn')} <i className="fa-solid fa-arrow-right ml-1"></i></> : <>{t('signUp')} <i className="fa-solid fa-user-plus ml-1"></i></>
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
          <span>{isLogin ? t('dontHaveAccount') : t('alreadyHaveAccount')}</span>
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-teal-600 font-bold hover:text-teal-700 hover:underline transition-colors"
          >
            {isLogin ? t('signUp') : t('signIn')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
