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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition">
            <i className="fa-solid fa-arrow-left text-gray-600"></i>
            </button>
            <h2 className="text-2xl font-bold text-gray-800">{apartment.name}</h2>
          </div>
          {activeTab === 'areas' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-white hover:bg-sky-600 px-4 py-2 rounded-lg shadow-sm transition text-sm font-bold flex items-center gap-2"
            >
               <i className="fa-solid fa-plus"></i> {t('addArea')}
            </button>
          )}
      </div>

      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('areas')}
          className={`py-2 px-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'areas' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          {t('areas')}
        </button>
        <button 
          onClick={() => setActiveTab('members')}
          className={`py-2 px-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'members' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          {t('membersAndInvitations')}
        </button>
      </div>

      {activeTab === 'areas' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {areas.map(area => {
            const stats = getAreaStats(area.id);
            const isAllDone = stats.pending === 0;

            return (
              <button
                key={area.id}
                onClick={() => onSelectArea(area.id)}
                className={`
                  flex flex-col items-center justify-center p-6 rounded-2xl border transition-all
                  ${isAllDone ? 'bg-white border-gray-100' : 'bg-orange-50 border-orange-100'}
                  hover:shadow-md hover:-translate-y-1 group
                `}
              >
                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center mb-4 text-2xl transition-transform group-hover:scale-110
                  ${isAllDone ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-500'}
                `}>
                  <i className={`fa-solid ${area.icon}`}></i>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{t(area.name as any) || area.name}</h3>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${isAllDone ? 'bg-green-100 text-green-700' : 'bg-orange-200 text-orange-800'}`}>
                  {isAllDone ? t('allClean') : `${stats.pending} ${t('tasksDue')}`}
                </span>
              </button>
            );
          })}
          
          {areas.length === 0 && (
               <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                  <i className="fa-solid fa-layer-group text-4xl mb-3 opacity-30"></i>
                  <p>{t('noAreasYet')}</p>
               </div>
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="space-y-8">
          {/* Members List */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{t('currentMembers')}</h3>
            <div className="space-y-3">
              {owner && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                      {owner.name?.charAt(0).toUpperCase() || owner.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{owner.name || owner.email}</p>
                      <p className="text-xs text-gray-500">{t('owner')}</p>
                    </div>
                  </div>
                </div>
              )}
              {acceptedMembers.map(m => {
                const profile = state.profiles.find(p => p.id === m.userId);
                return (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold">
                        {profile?.name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || m.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{profile?.name || profile?.email || m.email}</p>
                        <p className="text-xs text-gray-500">{t('member')}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {pendingMembers.map(m => (
                <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center font-bold">
                      {m.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{m.email}</p>
                      <p className="text-xs text-gray-500">{t('pendingInvitation')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invite Form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-2">{t('inviteMember')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('inviteDescription')}</p>
            <form onSubmit={handleInvite} className="flex gap-2">
              <input 
                type="email" 
                required
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder={t('enterEmail')}
                className="flex-1 rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-sky-600 transition">
                {t('invite')}
              </button>
            </form>
          </div>

          {/* Assign All Tasks */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-2">{t('assignAllTasks')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('assignAllDescription')}</p>
            <div className="flex gap-2">
              <select 
                value={assignUserId}
                onChange={e => setAssignUserId(e.target.value)}
                className="flex-1 rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-primary focus:outline-none bg-white"
              >
                <option value="">{t('selectMember')}</option>
                {assignableUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name || u.email}</option>
                ))}
              </select>
              <button 
                onClick={handleAssignAll}
                disabled={!assignUserId}
                className="bg-secondary text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-600 transition disabled:opacity-50"
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
                <label className="block text-sm font-medium text-gray-700 mb-3">{t('selectCommonAreas')}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${isSelected ? 'border-primary bg-blue-50 text-primary ring-1 ring-primary' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                            >
                                <i className={`fa-solid ${item.icon} text-xl`}></i>
                                <span className="text-xs font-medium">{t(item.label as any)}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('orAddCustomArea')}</label>
                <div className="space-y-3">
                    <input 
                        type="text" 
                        value={newAreaName}
                        onChange={e => setNewAreaName(e.target.value)}
                        className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                        placeholder={t('egGuestBedroom')}
                    />
                    {newAreaName && (
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-2">{t('selectIconForCustomArea')}</label>
                            <div className="flex flex-wrap gap-2">
                                {ICONS.map(item => (
                                    <button
                                        type="button"
                                        key={item.icon}
                                        onClick={() => setSelectedIcon(item.icon)}
                                        className={`w-10 h-10 rounded-lg border flex items-center justify-center transition ${selectedIcon === item.icon ? 'border-primary bg-blue-50 text-primary ring-1 ring-primary' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        <i className={`fa-solid ${item.icon}`}></i>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-2">
                <button 
                    type="submit" 
                    disabled={selectedPredefined.length === 0 && !newAreaName.trim()}
                    className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-sky-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
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