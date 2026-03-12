import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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

  const [editAptId, setEditAptId] = useState<string | null>(null);
  const [editAptName, setEditAptName] = useState('');

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
        ownerId: ownerId
    });
    setNewAptName('');
    setNewAptAddress('');
    setIsModalOpen(false);
  };

  const handleEditApartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (editAptId && editAptName) {
      updateApartment(editAptId, editAptName);
      setEditAptId(null);
      setEditAptName('');
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

  const COLORS = ['#10b981', '#fbbf24'];

  const visibleApartments = state.apartments.filter(apt => {
    if (apt.ownerId === state.currentUser?.id) return true;
    const membership = state.apartmentUsers.find(au => au.apartmentId === apt.id && au.userId === state.currentUser?.id);
    return membership?.status === 'accepted';
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-gray-800">{t('welcomeBack')}, {state.currentUser?.name || state.currentUser?.email}!</h2>
            {isLoading && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                 <i className="fa-solid fa-sync fa-spin"></i> {t('syncing')}
              </span>
            )}
          </div>
          <p className="text-gray-500">
            {t('upToDate1')} <span className="font-bold text-primary">{totalProgress.percentage}%</span> {t('upToDate2')}
          </p>
        </div>
        <div className="w-48 h-48 relative">
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
        <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-xl font-bold text-gray-800">{t('yourApartments')}</h3>
            <div className="flex gap-2">
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="text-sm bg-primary text-white hover:bg-sky-600 px-3 py-1.5 rounded-lg shadow-sm transition flex items-center gap-1"
                >
                    <i className="fa-solid fa-plus"></i> {t('addApartment')}
                </button>
                <button 
                    onClick={syncWithSheet}
                    className="text-sm text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition"
                    disabled={isLoading}
                    title={t('syncWithSheet')}
                >
                    <i className={`fa-solid fa-rotate-right ${isLoading ? 'fa-spin' : ''}`}></i>
                </button>
            </div>
        </div>
        
        {visibleApartments.length === 0 ? (
             <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                 <p className="text-gray-500 mb-4">{t('noApartments')}</p>
                 <button onClick={() => setIsModalOpen(true)} className="text-primary font-bold">{t('createOneNow')}</button>
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleApartments.map(apt => {
                const stats = getApartmentProgress(apt.id);
                const isOwner = apt.ownerId === state.currentUser?.id;
                return (
                <div
                    key={apt.id}
                    className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-left relative overflow-hidden flex flex-col"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition pointer-events-none">
                      <i className="fa-solid fa-building text-6xl text-primary"></i>
                    </div>
                    
                    <div className="p-6 flex-1 cursor-pointer" onClick={() => onSelectApartment(apt.id)}>
                      <h4 className="text-lg font-bold text-gray-800 mb-1">{apt.name}</h4>
                      <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                      <i className="fa-solid fa-location-dot"></i> {apt.address || t('noAddress')}
                      </p>

                      <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                      <div 
                          className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                          style={{ width: `${stats.percentage}%` }}
                      ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                      <span>{stats.completed} {t('done')}</span>
                      <span>{stats.total - stats.completed} {t('pending')}</span>
                      </div>
                    </div>

                    {isOwner && (
                      <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end gap-3">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditAptId(apt.id);
                            setEditAptName(apt.name);
                          }}
                          className="text-gray-500 hover:text-primary transition text-sm flex items-center gap-1"
                        >
                          <i className="fa-solid fa-pen"></i> {t('edit')}
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteApartment(apt.id, apt.name);
                          }}
                          className="text-gray-500 hover:text-red-500 transition text-sm flex items-center gap-1"
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
      
      <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-sm text-green-700 flex items-start gap-3">
         <i className="fa-solid fa-database mt-1"></i>
         <div>
            <p className="font-semibold">{t('connectedToSupabase')}</p>
            <p className="opacity-80">{t('supabaseSyncMessage')}</p>
         </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('addNewApartment')}>
        <form onSubmit={handleAddApartment} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartmentName')}</label>
                <input 
                    type="text" 
                    required
                    value={newAptName}
                    onChange={e => setNewAptName(e.target.value)}
                    className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder={t('egVacationHome')}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('address')}</label>
                <input 
                    type="text" 
                    value={newAptAddress}
                    onChange={e => setNewAptAddress(e.target.value)}
                    className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder={t('egBeachAve')}
                />
            </div>
            <div className="pt-2">
                <button type="submit" className="w-full bg-primary text-white font-bold py-2 rounded-lg hover:bg-sky-600 transition">
                    {t('createApartment')}
                </button>
            </div>
        </form>
      </Modal>

      <Modal isOpen={!!editAptId} onClose={() => setEditAptId(null)} title={t('editApartment')}>
        <form onSubmit={handleEditApartment} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('apartmentName')}</label>
                <input 
                    type="text" 
                    required
                    value={editAptName}
                    onChange={e => setEditAptName(e.target.value)}
                    className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder={t('egVacationHome')}
                />
            </div>
            <div className="pt-2">
                <button type="submit" className="w-full bg-primary text-white font-bold py-2 rounded-lg hover:bg-sky-600 transition">
                    {t('saveChanges')}
                </button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;