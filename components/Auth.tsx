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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-md">
        <div className="flex items-center justify-center gap-2 text-primary mb-8">
          <i className="fa-solid fa-broom text-3xl"></i>
          <h1 className="font-extrabold text-3xl tracking-tight">{t('appTitle')}</h1>
        </div>
        
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
          {isLogin ? t('welcomeBack') : t('createAccount')}
        </h2>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('password')}</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-2 rounded-lg hover:bg-sky-600 transition disabled:opacity-50"
          >
            {loading ? t('loading') : (isLogin ? t('signIn') : t('signUp'))}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          {isLogin ? t('dontHaveAccount') : t('alreadyHaveAccount')}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-bold hover:underline"
          >
            {isLogin ? t('signUp') : t('signIn')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
