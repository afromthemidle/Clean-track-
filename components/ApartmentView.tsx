import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, Area } from '../types';
import Modal from './Modal';

interface ApartmentViewProps {
  apartmentId: string;
  onBack: () => void;
  onSelectArea: (areaId: string) => void;
}

const ICONS = [
    { label: 'Cocina', icon: 'fa-utensils' },
    { label: 'Sala de Estar', icon: 'fa-couch' },
    { label: 'Dormitorio', icon: 'fa-bed' },
    { label: 'Baño', icon: 'fa-bath' },
    { label: 'Oficina', icon: 'fa-briefcase' },
    { label: 'Entrada', icon: 'fa-door-open' },
    { label: 'Entretenimiento', icon: 'fa-tv' },
    { label: 'Almacenamiento', icon: 'fa-box' },
];

const ApartmentView: React.FC<ApartmentViewProps> = ({ apartmentId, onBack, onSelectArea }) => {
  const { state, getAreasByApartment, getTasksByArea, addArea, addAreas, inviteUser, assignAllTasks, t } = useApp();
  const apartment = state.apartments.find(a => a.id === apartmentId);
  const areas = getAreasByApartment(apartmentId);

  const [activeTab, setActiveTab] = useState<'areas' | 'members'>('areas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPredefined, setSelectedPredefined] = useState<string[]>([]);
  const [newAreaName, setNewAreaName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('fa-box');
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [assignUserId, setAssignUserId] = useState('');

  const handleAddAreas = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const areasToAdd: Area[] = [];
    
    // Add predefined areas
    selectedPredefined.forEach(label => {
      const iconDef = ICONS.find(i => i.label === label);
      if (iconDef) {
        areasToAdd.push({
          id: `local-area-${Date.now()}-${Math.random()}`,
          name: label, // Store the key instead of the translated string
          icon: iconDef.icon,
          apartmentId: apartmentId
        });
      }
    });

    // Add custom area if provided
    if (newAreaName.trim()) {
      areasToAdd.push({
        id: `local-area-${Date.now()}-custom`,
        name: newAreaName.trim(),
        icon: selectedIcon,
        apartmentId: apartmentId
      });
    }

    if (areasToAdd.length === 0) return;

    if (areasToAdd.length === 1) {
      addArea(areasToAdd[0]);
    } else {
      if (addAreas) {
        addAreas(areasToAdd);
      }
    }
    
    setNewAreaName('');
    setSelectedIcon('fa-box');
    setSelectedPredefined([]);
    setIsModalOpen(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    await inviteUser(apartmentId, inviteEmail);
    setInviteEmail('');
    alert(t('invitationSent'));
  };

  const handleAssignAll = async () => {
    if (!assignUserId) return;
    await assignAllTasks(apartmentId, assignUserId);
    alert(t('allTasksAssigned'));
  };

  if (!apartment) return <div>{t('apartmentNotFound')}</div>;

  const getAreaStats = (areaId: string) => {
    const tasks = getTasksByArea(areaId);
    const now = new Date();
    const pending = tasks.filter(t => new Date(t.nextDueDate) <= now).length;
    return { total: tasks.length, pending };
  };

  const members = state.apartmentUsers.filter(au => au.apartmentId === apartmentId);
  const acceptedMembers = members.filter(m => m.status === 'accepted');
  const pendingMembers = members.filter(m => m.status === 'pending');
  
  const owner = state.profiles.find(p => p.id === apartment.ownerId);
  
  // Users available for assignment: owner + accepted members
  const assignableUsers = [];
  if (owner) assignableUsers.push(owner);
  acceptedMembers.forEach(m => {
    const profile = state.profiles.find(p => p.id === m.userId);
    if (profile && profile.id !== owner?.id) assignableUsers.push(profile);
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-soft border border-slate-100">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800">
            <i className="fa-solid fa-arrow-left"></i>
            </button>
            <h2 className="text-3xl font-display font-bold text-slate-800">{apartment.name}</h2>
          </div>
          {activeTab === 'areas' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-white hover:bg-primary-hover px-5 py-2.5 rounded-xl shadow-sm hover:shadow-glow transition-all active:scale-95 text-sm font-semibold flex items-center gap-2"
            >
               <i className="fa-solid fa-plus"></i> {t('addArea')}
            </button>
          )}
      </div>

      <div className="flex border-b border-slate-200 px-2">
        <button 
          onClick={() => setActiveTab('areas')}
          className={`py-3 px-6 font-semibold text-sm border-b-2 transition-all ${activeTab === 'areas' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}`}
        >
          {t('areas')}
        </button>
        <button 
          onClick={() => setActiveTab('members')}
          className={`py-3 px-6 font-semibold text-sm border-b-2 transition-all ${activeTab === 'members' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}`}
        >
          {t('membersAndInvitations')}
        </button>
      </div>

      {activeTab === 'areas' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {areas.map(area => {
            const stats = getAreaStats(area.id);
            const isAllDone = stats.pending === 0;

            return (
              <button
                key={area.id}
                onClick={() => onSelectArea(area.id)}
                className={`
                  flex flex-col items-center justify-center p-8 rounded-3xl border transition-all duration-300
                  ${isAllDone ? 'bg-white border-slate-100 shadow-sm hover:shadow-soft' : 'bg-gradient-to-b from-amber-50/50 to-amber-100/30 border-amber-200/50 shadow-sm hover:shadow-md'}
                  hover:-translate-y-1 group relative overflow-hidden
                `}
              >
                <div className={`
                  w-20 h-20 rounded-2xl flex items-center justify-center mb-5 text-3xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm
                  ${isAllDone ? 'bg-emerald-100/80 text-emerald-600' : 'bg-amber-100 text-amber-500'}
                `}>
                  <i className={`fa-solid ${area.icon}`}></i>
                </div>
                <h3 className="font-display font-bold text-slate-800 mb-2 text-lg">{t(area.name as any) || area.name}</h3>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-sm ${isAllDone ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-200 text-amber-800'}`}>
                  {isAllDone ? t('allClean') : `${stats.pending} ${t('tasksDue')}`}
                </span>
              </button>
            );
          })}
          
          {areas.length === 0 && (
               <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <i className="fa-solid fa-layer-group text-4xl text-slate-300"></i>
                  </div>
                  <p className="text-lg font-medium">{t('noAreasYet')}</p>
               </div>
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="space-y-8">
          {/* Members List */}
          <div className="bg-white p-8 rounded-3xl shadow-soft border border-slate-100">
            <h3 className="text-xl font-display font-bold text-slate-800 mb-6">{t('currentMembers')}</h3>
            <div className="space-y-4">
              {owner && (
                <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-sky-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      {owner.name?.charAt(0).toUpperCase() || owner.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{owner.name || owner.email}</p>
                      <p className="text-sm text-slate-500 font-medium">{t('owner')}</p>
                    </div>
                  </div>
                </div>
              )}
              {acceptedMembers.map(m => {
                const profile = state.profiles.find(p => p.id === m.userId);
                return (
                  <div key={m.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-amber-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        {profile?.name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || m.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{profile?.name || profile?.email || m.email}</p>
                        <p className="text-sm text-slate-500 font-medium">{t('member')}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {pendingMembers.map(m => (
                <div key={m.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 opacity-60">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-lg">
                      {m.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{m.email}</p>
                      <p className="text-sm text-slate-500 font-medium">{t('pendingInvitation')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invite Form */}
          <div className="bg-white p-8 rounded-3xl shadow-soft border border-slate-100">
            <h3 className="text-xl font-display font-bold text-slate-800 mb-2">{t('inviteMember')}</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">{t('inviteDescription')}</p>
            <form onSubmit={handleInvite} className="flex gap-3">
              <input 
                type="email" 
                required
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder={t('enterEmail')}
                className="flex-1 rounded-xl border-slate-200 border p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all bg-slate-50/50"
              />
              <button type="submit" className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-hover shadow-sm hover:shadow-glow transition-all active:scale-95">
                {t('invite')}
              </button>
            </form>
          </div>

          {/* Assign All Tasks */}
          <div className="bg-white p-8 rounded-3xl shadow-soft border border-slate-100">
            <h3 className="text-xl font-display font-bold text-slate-800 mb-2">{t('assignAllTasks')}</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">{t('assignAllDescription')}</p>
            <div className="flex gap-3">
              <select 
                value={assignUserId}
                onChange={e => setAssignUserId(e.target.value)}
                className="flex-1 rounded-xl border-slate-200 border p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all bg-slate-50/50"
              >
                <option value="">{t('selectMember')}</option>
                {assignableUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name || u.email}</option>
                ))}
              </select>
              <button 
                onClick={handleAssignAll}
                disabled={!assignUserId}
                className="bg-secondary text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-600 shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:hover:shadow-sm disabled:hover:bg-secondary disabled:active:scale-100"
              >
                {t('assign')}
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('addAreas')}>
        <form onSubmit={handleAddAreas} className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">{t('selectCommonAreas')}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {ICONS.map(item => {
                        const isSelected = selectedPredefined.includes(item.label);
                        return (
                            <button
                                type="button"
                                key={item.label}
                                onClick={() => {
                                    if (isSelected) {
                                        setSelectedPredefined(prev => prev.filter(l => l !== item.label));
                                    } else {
                                        setSelectedPredefined(prev => [...prev, item.label]);
                                    }
                                }}
                                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all duration-300 ${isSelected ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm'}`}
                            >
                                <i className={`fa-solid ${item.icon} text-2xl`}></i>
                                <span className="text-xs font-bold">{t(item.label as any)}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
                <label className="block text-sm font-bold text-slate-700 mb-3">{t('orAddCustomArea')}</label>
                <div className="space-y-4">
                    <input 
                        type="text" 
                        value={newAreaName}
                        onChange={e => setNewAreaName(e.target.value)}
                        className="w-full rounded-xl border-slate-200 border p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all bg-slate-50/50"
                        placeholder={t('egGuestBedroom')}
                    />
                    {newAreaName && (
                        <div className="animate-fade-in">
                            <label className="block text-xs font-bold text-slate-500 mb-3">{t('selectIconForCustomArea')}</label>
                            <div className="flex flex-wrap gap-2">
                                {ICONS.map(item => (
                                    <button
                                        type="button"
                                        key={item.icon}
                                        onClick={() => setSelectedIcon(item.icon)}
                                        className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-300 ${selectedIcon === item.icon ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary shadow-sm' : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300'}`}
                                    >
                                        <i className={`fa-solid ${item.icon} text-lg`}></i>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-4">
                <button 
                    type="submit" 
                    disabled={selectedPredefined.length === 0 && !newAreaName.trim()}
                    className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-hover shadow-sm hover:shadow-glow transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm disabled:hover:bg-primary disabled:active:scale-100"
                >
                    {t('add')} {selectedPredefined.length + (newAreaName.trim() ? 1 : 0)} {t('areas')}
                </button>
            </div>
        </form>
      </Modal>
    </div>
  );
};

export default ApartmentView;