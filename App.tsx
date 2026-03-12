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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary cursor-pointer" onClick={() => { setCurrentView('dashboard'); setSelectedApartmentId(null); }}>
            <i className="fa-solid fa-broom text-xl"></i>
            <h1 className="font-extrabold text-xl tracking-tight">{t('appTitle')}</h1>
          </div>
          
          <div className="flex items-center gap-4">
             <select 
               value={language}
               onChange={(e) => setLanguage(e.target.value as Language)}
               className="bg-gray-100 text-gray-700 text-sm rounded-lg px-2 py-1 border-none focus:ring-2 focus:ring-primary cursor-pointer"
             >
               <option value="en">EN</option>
               <option value="es">ES</option>
             </select>
             <div className="relative group">
                <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition">
                   <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                     {state.currentUser?.name?.charAt(0).toUpperCase() || state.currentUser?.email?.charAt(0).toUpperCase() || '?'}
                   </div>
                   <span className="hidden sm:inline">{state.currentUser?.name || state.currentUser?.email}</span>
                   <i className="fa-solid fa-chevron-down text-xs"></i>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 hidden group-hover:block animate-fade-in">
                    <button 
                        onClick={() => {
                          setProfileName(state.currentUser?.name || '');
                          setIsProfileModalOpen(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <i className="fa-solid fa-user"></i> {t('editProfile')}
                    </button>
                    <button 
                        onClick={signOut}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                        <i className="fa-solid fa-sign-out-alt"></i> {t('signOut')}
                    </button>
                </div>
             </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto p-4 md:p-6">
        {pendingInvites.length > 0 && currentView === 'dashboard' && (
          <div className="mb-6 space-y-3">
            {pendingInvites.map(invite => {
              const apt = state.apartments.find(a => a.id === invite.apartmentId);
              return (
                <div key={invite.id} className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-blue-900">{t('invitedMessage')}</h4>
                    <p className="text-sm text-blue-700">{t('invitedDescription')} {apt?.name || 'an apartment'}.</p>
                  </div>
                  <button 
                    onClick={() => acceptInvite(invite.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition"
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
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('name')}</label>
            <input 
              type="text" 
              value={profileName}
              onChange={e => setProfileName(e.target.value)}
              className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder={t('yourName')}
            />
          </div>
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isUpdatingProfile}
              className="w-full bg-primary text-white font-bold py-2 rounded-lg hover:bg-sky-600 transition disabled:opacity-50"
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