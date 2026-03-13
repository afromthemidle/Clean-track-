import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Dashboard from './components/Dashboard';
import ApartmentView from './components/ApartmentView';
import AreaView from './components/AreaView';
import Auth from './components/Auth';
import Modal from './components/Modal';
import { supabase } from './services/supabaseClient';
import { Language } from './types';

const MainContent: React.FC = () => {
  const { state, session, signOut, acceptInvite, refreshData, language, setLanguage, t } = useApp();
  const [currentView, setCurrentView] = useState<'dashboard' | 'apartment' | 'area'>('dashboard');
  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(null);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileName, setProfileName] = useState(state.currentUser?.name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  if (!session) {
    return <Auth />;
  }

  const handleSelectApartment = (id: string) => {
    setSelectedApartmentId(id);
    setCurrentView('apartment');
  };

  const handleSelectArea = (id: string) => {
    setSelectedAreaId(id);
    setCurrentView('area');
  };

  const goBack = () => {
    if (currentView === 'area') {
      setCurrentView('apartment');
      setSelectedAreaId(null);
    } else if (currentView === 'apartment') {
      setCurrentView('dashboard');
      setSelectedApartmentId(null);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.currentUser) return;
    setIsUpdatingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: profileName })
        .eq('id', state.currentUser.id);
      
      if (error) throw error;
      await refreshData();
      setIsProfileModalOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(t('failedToUpdateProfile'));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const pendingInvites = state.apartmentUsers.filter(au => au.email === state.currentUser?.email && au.status === 'pending');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-primary/20 selection:text-primary">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] sticky top-0 z-20 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 text-primary cursor-pointer hover:opacity-80 transition-opacity" onClick={() => { setCurrentView('dashboard'); setSelectedApartmentId(null); }}>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <i className="fa-solid fa-sparkles text-xl text-primary"></i>
            </div>
            <h1 className="font-display font-bold text-2xl tracking-tight text-slate-900">{t('appTitle')}</h1>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="relative group">
                <button className="flex items-center gap-3 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors bg-slate-50 hover:bg-slate-100 py-1.5 px-3 rounded-full border border-slate-200">
                   <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-emerald-400 text-white flex items-center justify-center font-bold shadow-sm">
                     {state.currentUser?.name?.charAt(0).toUpperCase() || state.currentUser?.email?.charAt(0).toUpperCase() || '?'}
                   </div>
                   <span className="hidden sm:inline font-medium">{state.currentUser?.name || state.currentUser?.email}</span>
                   <i className="fa-solid fa-chevron-down text-[10px] opacity-70"></i>
                </button>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 py-2 hidden group-hover:block animate-fade-in origin-top-right">
                    <button 
                        onClick={() => {
                          setProfileName(state.currentUser?.name || '');
                          setIsProfileModalOpen(true);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary flex items-center gap-3 transition-colors"
                    >
                        <i className="fa-solid fa-user-pen w-4 text-center"></i> {t('editProfile')}
                    </button>
                    <div className="h-px bg-slate-100 my-1 mx-4"></div>
                    <button 
                        onClick={signOut}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                    >
                        <i className="fa-solid fa-arrow-right-from-bracket w-4 text-center"></i> {t('signOut')}
                    </button>
                </div>
             </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
        {pendingInvites.length > 0 && currentView === 'dashboard' && (
          <div className="mb-6 space-y-3">
            {pendingInvites.map(invite => {
              const apt = state.apartments.find(a => a.id === invite.apartmentId);
              return (
                <div key={invite.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                  <div>
                    <h4 className="font-display font-bold text-blue-900 text-lg">{t('invitedMessage')}</h4>
                    <p className="text-sm text-blue-700/80 mt-1">{t('invitedDescription')} <span className="font-semibold text-blue-800">{apt?.name || 'an apartment'}</span>.</p>
                  </div>
                  <button 
                    onClick={() => acceptInvite(invite.id)}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 transition-all active:translate-y-0 w-full sm:w-auto text-center"
                  >
                    {t('accept')}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {currentView === 'dashboard' && (
          <Dashboard onSelectApartment={handleSelectApartment} />
        )}
        {currentView === 'apartment' && selectedApartmentId && (
          <ApartmentView 
            apartmentId={selectedApartmentId} 
            onBack={goBack} 
            onSelectArea={handleSelectArea} 
          />
        )}
        {currentView === 'area' && selectedAreaId && (
          <AreaView 
            areaId={selectedAreaId} 
            onBack={goBack} 
          />
        )}
      </main>

      <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title={t('editProfile')}>
        <form onSubmit={handleUpdateProfile} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('name')}</label>
            <input 
              type="text" 
              value={profileName}
              onChange={e => setProfileName(e.target.value)}
              className="w-full rounded-xl border-slate-200 border p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all bg-slate-50 focus:bg-white"
              placeholder={t('yourName')}
            />
          </div>
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isUpdatingProfile}
              className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {isUpdatingProfile ? t('saving') : t('saveChanges')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export default App;