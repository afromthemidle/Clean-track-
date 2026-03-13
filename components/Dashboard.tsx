import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Frequency } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Modal from './Modal';

interface DashboardProps {
  onSelectApartment: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectApartment }) => {
  const { state, isLoading, session, getApartmentProgress, getTotalProgress, syncWithSheet, addApartment, updateApartment, deleteApartment, t } = useApp();
  const totalProgress = getTotalProgress();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAptName, setNewAptName] = useState('');
  const [newAptAddress, setNewAptAddress] = useState('');

  const [newAptFreq, setNewAptFreq] = useState<Frequency>(Frequency.WEEKLY);

  const [editAptId, setEditAptId] = useState<string | null>(null);
  const [editAptName, setEditAptName] = useState('');
  const [editAptAddress, setEditAptAddress] = useState('');
  const [editAptFreq, setEditAptFreq] = useState<Frequency>(Frequency.WEEKLY);

  const handleAddApartment = (e: React.FormEvent) => {
    e.preventDefault();
    const ownerId = state.currentUser?.id || session?.user?.id;
    if (!newAptName || !ownerId) {
       alert(t('sessionError'));
       return;
    }
    
    addApartment({
        id: `local-apt-${Date.now()}`,
        name: newAptName,
        address: newAptAddress,
        ownerId: ownerId,
        cleaningFrequency: newAptFreq
    });
    setNewAptName('');
    setNewAptAddress('');
    setNewAptFreq(Frequency.WEEKLY);
    setIsModalOpen(false);
  };

  const handleEditApartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (editAptId && editAptName) {
      updateApartment(editAptId, editAptName, editAptAddress, editAptFreq);
      setEditAptId(null);
      setEditAptName('');
      setEditAptAddress('');
      setEditAptFreq(Frequency.WEEKLY);
    }
  };

  const handleDeleteApartment = (id: string, name: string) => {
    if (window.confirm(`${t('deleteApartmentConfirm')} ${name}?`)) {
      deleteApartment(id);
    }
  };

  const data = [
    { name: t('onTrack'), value: totalProgress.completed },
    { name: t('pending'), value: totalProgress.total - totalProgress.completed },
  ];

  const COLORS = ['#10b981', '#f59e0b'];

  const visibleApartments = state.apartments.filter(apt => {
    if (apt.ownerId === state.currentUser?.id) return true;
    const membership = state.apartmentUsers.find(au => au.apartmentId === apt.id && au.userId === state.currentUser?.id);
    return membership?.status === 'accepted';
  });

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header Section */}
      <div className="bg-white rounded-3xl p-8 shadow-soft border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/5 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
        
        <div className="flex-1 relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-3xl font-display font-bold text-slate-800">{t('welcomeBack')}, <span className="text-primary">{state.currentUser?.name || state.currentUser?.email}</span>!</h2>
            {isLoading && (
              <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                 <i className="fa-solid fa-sync fa-spin"></i> {t('syncing')}
              </span>
            )}
          </div>
          <p className="text-slate-500 text-lg">
            {t('upToDate1')} <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{totalProgress.percentage}%</span> {t('upToDate2')}
          </p>
        </div>
        <div className="w-52 h-52 relative z-10 drop-shadow-sm">
           <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
             <span className="text-2xl font-bold text-gray-800">{totalProgress.percentage}%</span>
             <span className="text-xs text-gray-400">{t('complete')}</span>
          </div>
        </div>
      </div>

      {/* Apartments Grid */}
      <div>
        <div className="flex justify-between items-center mb-6 px-2">
            <h3 className="text-2xl font-display font-bold text-slate-800 flex items-center gap-2">
              <i className="fa-solid fa-building text-primary/80"></i> {t('yourApartments')}
            </h3>
            <div className="flex gap-3">
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="text-sm font-semibold bg-primary text-white hover:bg-primary-hover px-5 py-2.5 rounded-xl shadow-sm hover:shadow-glow transition-all active:scale-95 flex items-center gap-2"
                >
                    <i className="fa-solid fa-plus"></i> {t('addApartment')}
                </button>
                <button 
                    onClick={syncWithSheet}
                    className="text-sm text-slate-500 hover:text-primary hover:bg-primary/10 px-4 py-2.5 rounded-xl transition-all active:scale-95 bg-white border border-slate-200 shadow-sm"
                    disabled={isLoading}
                    title={t('syncWithSheet')}
                >
                    <i className={`fa-solid fa-rotate-right ${isLoading ? 'fa-spin' : ''}`}></i>
                </button>
            </div>
        </div>
        
        {visibleApartments.length === 0 ? (
             <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">
                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                   <i className="fa-solid fa-house-chimney-blank text-2xl text-slate-400"></i>
                 </div>
                 <p className="text-slate-500 mb-4 text-lg">{t('noApartments')}</p>
                 <button onClick={() => setIsModalOpen(true)} className="text-primary font-bold hover:text-primary-hover transition-colors">{t('createOneNow')}</button>
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleApartments.map(apt => {
                const stats = getApartmentProgress(apt.id);
                const isOwner = apt.ownerId === state.currentUser?.id;
                return (
                <div
                    key={apt.id}
                    className="group bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-soft hover:-translate-y-1 transition-all text-left relative overflow-hidden flex flex-col"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] group-hover:scale-110 transition-all duration-500 pointer-events-none">
                      <i className="fa-solid fa-building text-8xl text-primary"></i>
                    </div>
                    
                    <div className="p-8 flex-1 cursor-pointer" onClick={() => onSelectApartment(apt.id)}>
                      <h4 className="text-xl font-display font-bold text-slate-800 mb-2 group-hover:text-primary transition-colors">{apt.name}</h4>
                      <p className="text-sm text-slate-500 mb-6 flex items-center gap-2">
                        <i className="fa-solid fa-location-dot text-primary/60"></i> {apt.address || t('noAddress')}
                      </p>

                      <div className="w-full bg-slate-100 rounded-full h-3 mb-3 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-primary to-emerald-400 h-full rounded-full transition-all duration-1000 ease-out relative" 
                            style={{ width: `${stats.percentage}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm font-medium text-slate-500">
                        <span className="text-emerald-600"><i className="fa-solid fa-check-circle mr-1"></i>{stats.completed} {t('done')}</span>
                        <span className="text-amber-500"><i className="fa-regular fa-clock mr-1"></i>{stats.total - stats.completed} {t('pending')}</span>
                      </div>
                    </div>

                    {isOwner && (
                      <div className="bg-slate-50/50 px-8 py-4 border-t border-slate-100 flex justify-end gap-4">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditAptId(apt.id);
                            setEditAptName(apt.name);
                            setEditAptAddress(apt.address || '');
                            setEditAptFreq(apt.cleaningFrequency || Frequency.WEEKLY);
                          }}
                          className="text-slate-500 hover:text-primary transition-colors text-sm font-medium flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm hover:shadow"
                        >
                          <i className="fa-solid fa-pen"></i> {t('edit')}
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteApartment(apt.id, apt.name);
                          }}
                          className="text-slate-500 hover:text-red-500 transition-colors text-sm font-medium flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm hover:shadow"
                        >
                          <i className="fa-solid fa-trash"></i> {t('delete')}
                        </button>
                      </div>
                    )}
                </div>
                );
            })}
            </div>
        )}
      </div>
      
      <div className="bg-emerald-50 border border-emerald-100/50 rounded-2xl p-5 text-sm text-emerald-700 flex items-start gap-4 shadow-sm">
         <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
           <i className="fa-solid fa-cloud-arrow-up text-emerald-600"></i>
         </div>
         <div className="pt-0.5">
            <p className="font-bold text-emerald-800 text-base mb-0.5">{t('connectedToSupabase')}</p>
            <p className="opacity-80 leading-relaxed">{t('supabaseSyncMessage')}</p>
         </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('addNewApartment')}>
        <form onSubmit={handleAddApartment} className="space-y-5">
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('apartmentName')}</label>
                <input 
                    type="text" 
                    required
                    value={newAptName}
                    onChange={e => setNewAptName(e.target.value)}
                    className="w-full rounded-xl border-slate-200 border p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all bg-slate-50 focus:bg-white"
                    placeholder={t('egVacationHome')}
                />
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('address')}</label>
                <input 
                    type="text" 
                    value={newAptAddress}
                    onChange={e => setNewAptAddress(e.target.value)}
                    className="w-full rounded-xl border-slate-200 border p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all bg-slate-50 focus:bg-white"
                    placeholder={t('egBeachAve')}
                />
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('howOftenDoYouClean')}</label>
                <select
                  value={newAptFreq}
                  onChange={e => setNewAptFreq(e.target.value as Frequency)}
                  className="w-full rounded-xl border-slate-200 border p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all bg-slate-50 focus:bg-white"
                >
                  {Object.values(Frequency).map(freq => (
                    <option key={freq} value={freq}>{t(freq.toLowerCase() as any) || freq}</option>
                  ))}
                </select>
            </div>
            <div className="pt-4">
                <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98]">
                    {t('createApartment')}
                </button>
            </div>
        </form>
      </Modal>

      <Modal isOpen={!!editAptId} onClose={() => setEditAptId(null)} title={t('editApartment')}>
        <form onSubmit={handleEditApartment} className="space-y-5">
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('apartmentName')}</label>
                <input 
                    type="text" 
                    required
                    value={editAptName}
                    onChange={e => setEditAptName(e.target.value)}
                    className="w-full rounded-xl border-slate-200 border p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all bg-slate-50 focus:bg-white"
                    placeholder={t('egVacationHome')}
                />
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('address')}</label>
                <input 
                    type="text" 
                    value={editAptAddress}
                    onChange={e => setEditAptAddress(e.target.value)}
                    className="w-full rounded-xl border-slate-200 border p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all bg-slate-50 focus:bg-white"
                    placeholder={t('egBeachAve')}
                />
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('howOftenDoYouClean')}</label>
                <select
                  value={editAptFreq}
                  onChange={e => setEditAptFreq(e.target.value as Frequency)}
                  className="w-full rounded-xl border-slate-200 border p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all bg-slate-50 focus:bg-white"
                >
                  {Object.values(Frequency).map(freq => (
                    <option key={freq} value={freq}>{t(freq.toLowerCase() as any) || freq}</option>
                  ))}
                </select>
            </div>
            <div className="pt-4">
                <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98]">
                    {t('saveChanges')}
                </button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;