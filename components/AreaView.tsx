import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, Frequency } from '../types';
import AIChatModal from './AIChatModal';
import Modal from './Modal';
import { suggestMoreTasks } from '../services/geminiService';

interface AreaViewProps {
  areaId: string;
  onBack: () => void;
}

const TASK_SUGGESTIONS: Record<string, { title: string, freq: Frequency }[]> = {
  'kitchen': [
    { title: 'wipeCounters', freq: Frequency.DAILY },
    { title: 'sweepFloor', freq: Frequency.DAILY },
    { title: 'cleanMicrowave', freq: Frequency.WEEKLY },
    { title: 'cleanFridge', freq: Frequency.MONTHLY },
    { title: 'takeOutTrash', freq: Frequency.DAILY },
  ],
  'livingRoom': [
    { title: 'vacuumFloor', freq: Frequency.WEEKLY },
    { title: 'dustFurniture', freq: Frequency.WEEKLY },
    { title: 'tidyUp', freq: Frequency.DAILY },
    { title: 'cleanWindows', freq: Frequency.MONTHLY },
  ],
  'bedroom': [
    { title: 'makeBed', freq: Frequency.DAILY },
    { title: 'changeSheets', freq: Frequency.WEEKLY },
    { title: 'vacuumFloor', freq: Frequency.WEEKLY },
    { title: 'dustSurfaces', freq: Frequency.WEEKLY },
  ],
  'bathroom': [
    { title: 'cleanToilet', freq: Frequency.WEEKLY },
    { title: 'cleanShowerTub', freq: Frequency.WEEKLY },
    { title: 'wipeMirror', freq: Frequency.WEEKLY },
    { title: 'emptyTrash', freq: Frequency.WEEKLY },
    { title: 'mopFloor', freq: Frequency.WEEKLY },
  ],
  'office': [
    { title: 'clearDesk', freq: Frequency.DAILY },
    { title: 'dustEquipment', freq: Frequency.WEEKLY },
    { title: 'emptyTrash', freq: Frequency.WEEKLY },
    { title: 'vacuumFloor', freq: Frequency.WEEKLY },
  ],
  'entrance': [
    { title: 'organizeShoes', freq: Frequency.WEEKLY },
    { title: 'sweepFloor', freq: Frequency.WEEKLY },
    { title: 'wipeDoor', freq: Frequency.MONTHLY },
  ],
  'entertainment': [
    { title: 'dustTV', freq: Frequency.WEEKLY },
    { title: 'organizeCables', freq: Frequency.MONTHLY },
    { title: 'vacuumFloor', freq: Frequency.WEEKLY },
  ],
  'storage': [
    { title: 'organizeBoxes', freq: Frequency.MONTHLY },
    { title: 'sweepFloor', freq: Frequency.MONTHLY },
    { title: 'checkForPests', freq: Frequency.MONTHLY },
  ],
  'default': [
    { title: 'sweepVacuumFloor', freq: Frequency.WEEKLY },
    { title: 'dustSurfaces', freq: Frequency.WEEKLY },
    { title: 'tidyUp', freq: Frequency.DAILY },
    { title: 'emptyTrash', freq: Frequency.WEEKLY },
  ]
};

const AreaView: React.FC<AreaViewProps> = ({ areaId, onBack }) => {
  const { state, getTasksByArea, completeTask, addTask, addTasks, deleteTask, assignTask, updateArea, deleteArea, t, language } = useApp();
  const area = state.areas.find(a => a.id === areaId);
  const tasks = getTasksByArea(areaId);
  
  const [showAI, setShowAI] = useState(false);
  const [selectedTaskForAI, setSelectedTaskForAI] = useState<string>('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Custom task state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskFreq, setNewTaskFreq] = useState<Frequency>(Frequency.WEEKLY);
  const [newTaskAssignee, setNewTaskAssignee] = useState<string>('');

  // Suggestions state
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  
  // Edit Area state
  const [isEditAreaModalOpen, setIsEditAreaModalOpen] = useState(false);
  const [editAreaName, setEditAreaName] = useState('');

  const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const [dynamicSuggestions, setDynamicSuggestions] = useState<{ title: string, freq: Frequency }[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [houseCleaningFreq, setHouseCleaningFreq] = useState<Frequency>(Frequency.WEEKLY);

  const getBaseSuggestions = () => {
    const name = area?.name || '';
    if (TASK_SUGGESTIONS[name]) return TASK_SUGGESTIONS[name];
    
    // Backward compatibility for old English names
    const oldNameMap: Record<string, string> = {
      'Kitchen': 'kitchen',
      'Living Room': 'livingRoom',
      'Bedroom': 'bedroom',
      'Bathroom': 'bathroom',
      'Office': 'office',
      'Entrance': 'entrance',
      'Entertainment': 'entertainment',
      'Storage': 'storage'
    };
    
    if (oldNameMap[name] && TASK_SUGGESTIONS[oldNameMap[name]]) {
      return TASK_SUGGESTIONS[oldNameMap[name]];
    }
    
    return TASK_SUGGESTIONS['default'];
  };

  const baseSuggestions = getBaseSuggestions();
  const allSuggestions = [...baseSuggestions, ...dynamicSuggestions];
  
  // Filter out tasks that are already added to the area
  const existingTaskTitles = tasks.map(t => t.title.toLowerCase());
  const availableSuggestions = allSuggestions.filter(s => {
    const translatedTitle = t(s.title as any) || s.title;
    return !existingTaskTitles.includes(s.title.toLowerCase()) && !existingTaskTitles.includes(translatedTitle.toLowerCase());
  });

  const handleSuggestMore = async () => {
    setIsSuggesting(true);
    const excludeList = [
        ...tasks.map(t => t.title),
        ...availableSuggestions.map(s => s.title)
    ];
    const newSuggestions = await suggestMoreTasks(t(area?.name as any) || area?.name || 'Area', excludeList, language, houseCleaningFreq);
    setDynamicSuggestions(prev => [...prev, ...newSuggestions]);
    setIsSuggesting(false);
  };

  const handleAddTasks = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const tasksToAdd: Task[] = [];
    const now = new Date().toISOString();

    // Add selected suggestions
    selectedSuggestions.forEach(title => {
      const suggestion = allSuggestions.find(s => s.title === title);
      if (suggestion) {
        tasksToAdd.push({
          id: `local-task-${Date.now()}-${Math.random()}`,
          title: suggestion.title,
          frequency: suggestion.freq,
          areaId: areaId,
          lastCompletedDate: null,
          nextDueDate: now,
          assignedTo: newTaskAssignee || undefined
        });
      }
    });

    // Add custom task if provided
    if (newTaskTitle.trim()) {
      tasksToAdd.push({
        id: `local-task-${Date.now()}-custom`,
        title: newTaskTitle.trim(),
        frequency: newTaskFreq,
        areaId: areaId,
        lastCompletedDate: null,
        nextDueDate: now,
        assignedTo: newTaskAssignee || undefined
      });
    }

    if (tasksToAdd.length === 0) return;

    if (tasksToAdd.length === 1) {
      addTask(tasksToAdd[0]);
    } else {
      if (addTasks) {
        addTasks(tasksToAdd);
      }
    }

    setNewTaskTitle('');
    setNewTaskFreq(Frequency.WEEKLY);
    setNewTaskAssignee('');
    setSelectedSuggestions([]);
    setIsModalOpen(false);
  };

  const handleEditArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editAreaName.trim()) {
      const newName = editAreaName.trim();
      const finalName = newName === (t(area.name as any) || area.name) ? area.name : newName;
      await updateArea(areaId, finalName);
      setIsEditAreaModalOpen(false);
    }
  };

  const handleDeleteArea = async () => {
    if (window.confirm(t('areYouSureDeleteArea'))) {
      await deleteArea(areaId);
      onBack();
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTaskToDelete(taskId);
    setIsDeleteTaskModalOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (taskToDelete) {
      await deleteTask(taskToDelete);
      setIsDeleteTaskModalOpen(false);
      setTaskToDelete(null);
    }
  };

  if (!area) return <div>{t('areaNotFound')}</div>;

  const apartment = state.apartments.find(a => a.id === area.apartmentId);
  
  const members = state.apartmentUsers.filter(au => au.apartmentId === area.apartmentId);
  const acceptedMembers = members.filter(m => m.status === 'accepted');
  const owner = state.profiles.find(p => p.id === apartment?.ownerId);
  
  const assignableUsers = [];
  if (owner) assignableUsers.push(owner);
  acceptedMembers.forEach(m => {
    const profile = state.profiles.find(p => p.id === m.userId);
    if (profile && profile.id !== owner?.id) assignableUsers.push(profile);
  });

  const handleComplete = (taskId: string) => {
    completeTask(taskId);
  };

  const handleAskAI = (taskTitle: string) => {
    setSelectedTaskForAI(taskTitle);
    setShowAI(true);
  };

  const handleAssignTask = async (taskId: string, userId: string) => {
    await assignTask(taskId, userId);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
     // Sort by due date ascending (overdue first)
     return new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime();
  });

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center justify-between sticky top-0 bg-slate-50/90 backdrop-blur-sm py-4 z-10 border-b border-gray-200">
        <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition">
            <i className="fa-solid fa-arrow-left text-gray-600"></i>
            </button>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <i className={`fa-solid ${area.icon}`}></i>
                </div>
                <h2 className="text-xl font-bold text-gray-800">{t(area.name as any) || area.name} {t('tasks')}</h2>
                <button 
                  onClick={() => {
                    setEditAreaName(t(area.name as any) || area.name);
                    setIsEditAreaModalOpen(true);
                  }}
                  className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition"
                  title={t('editArea')}
                >
                  <i className="fa-solid fa-pen text-sm"></i>
                </button>
                <button 
                  onClick={handleDeleteArea}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                  title={t('deleteArea')}
                >
                  <i className="fa-solid fa-trash text-sm"></i>
                </button>
            </div>
        </div>
        <button 
            onClick={() => {
              setSelectedSuggestions([]);
              setNewTaskTitle('');
              setIsModalOpen(true);
            }}
            className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full shadow-md hover:bg-sky-600 transition"
        >
            <i className="fa-solid fa-plus"></i>
        </button>
      </div>

      <div className="space-y-3">
        {sortedTasks.length === 0 && (
             <div className="py-12 text-center text-gray-400">
                 <p>{t('noTasksYet')}</p>
             </div>
        )}
        {sortedTasks.map(task => {
          const now = new Date();
          const dueDate = new Date(task.nextDueDate);
          const isDue = dueDate <= now;
          const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));
          
          return (
            <div 
                key={task.id} 
                className={`
                    relative p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center gap-4 transition-all
                    ${isDue ? 'bg-white border-orange-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-75'}
                `}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-800">{t(task.title as any) || task.title}</h4>
                    {isDue && (
                        <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {daysOverdue > 0 ? `${t('overdue')} ${daysOverdue}d` : t('dueToday')}
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2">
                    <span className="flex items-center gap-1">
                        <i className="fa-regular fa-clock"></i> {t(task.frequency.toLowerCase() as any) || task.frequency}
                    </span>
                    {task.lastCompletedDate && (
                         <span className="flex items-center gap-1 text-green-600">
                            <i className="fa-solid fa-check"></i> {t('lastCompleted')}: {new Date(task.lastCompletedDate).toLocaleDateString()}
                        </span>
                    )}
                    <div className="flex items-center gap-1 ml-auto sm:ml-0">
                        <i className="fa-solid fa-user"></i>
                        <select
                            value={task.assignedTo || ''}
                            onChange={(e) => handleAssignTask(task.id, e.target.value)}
                            className="bg-transparent border-none text-xs font-semibold text-gray-600 focus:ring-0 cursor-pointer"
                        >
                            <option value="">{t('unassigned')}</option>
                            {assignableUsers.map(u => (
                                <option key={u.id} value={u.id}>{u.name || u.email}</option>
                            ))}
                        </select>
                    </div>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end mt-3 sm:mt-0">
                <button
                    onClick={() => handleAskAI(task.title)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                    title={t('getAIAdvice')}
                >
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                </button>
                <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition"
                    title={t('deleteTask')}
                >
                    <i className="fa-solid fa-trash"></i>
                </button>
                
                {isDue ? (
                    <button
                        onClick={() => handleComplete(task.id)}
                        className="flex-1 sm:flex-none px-6 py-2 bg-secondary hover:bg-emerald-600 text-white font-bold rounded-lg shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <i className="fa-solid fa-check"></i> {t('complete')}
                    </button>
                ) : (
                    <div className="text-xs font-semibold text-gray-400 bg-gray-200 px-3 py-1 rounded-md">
                        {t('due')} {dueDate.toLocaleDateString()}
                    </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AIChatModal 
        isOpen={showAI} 
        onClose={() => setShowAI(false)} 
        taskTitle={t(selectedTaskForAI as any) || selectedTaskForAI} 
        areaName={t(area.name as any) || area.name} 
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('addTasks')}>
        <form onSubmit={handleAddTasks} className="space-y-6">
            
            {/* Task Suggestions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">{t('suggestedTasks')}</label>
                <button 
                  type="button"
                  onClick={() => {
                    if (selectedSuggestions.length === availableSuggestions.length) {
                      setSelectedSuggestions([]);
                    } else {
                      setSelectedSuggestions(availableSuggestions.map(s => s.title));
                    }
                  }}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  {selectedSuggestions.length === availableSuggestions.length && availableSuggestions.length > 0 ? t('deselectAll') : t('selectAll')}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                {availableSuggestions.map(suggestion => (
                  <label 
                    key={suggestion.title}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                      ${selectedSuggestions.includes(suggestion.title) ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white border-gray-200 hover:border-primary/50'}
                    `}
                  >
                    <input 
                      type="checkbox"
                      className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                      checked={selectedSuggestions.includes(suggestion.title)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSuggestions(prev => [...prev, suggestion.title]);
                        } else {
                          setSelectedSuggestions(prev => prev.filter(t => t !== suggestion.title));
                        }
                      }}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800">{t(suggestion.title as any) || suggestion.title}</span>
                      <span className="text-xs text-gray-500">{t(suggestion.freq.toLowerCase() as any) || suggestion.freq}</span>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-4 border-t border-gray-100 pt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('howOftenDoYouClean')}
                </label>
                <select
                  value={houseCleaningFreq}
                  onChange={e => setHouseCleaningFreq(e.target.value as Frequency)}
                  className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-primary focus:outline-none mb-3 text-sm"
                >
                  {Object.values(Frequency).map(freq => (
                    <option key={freq} value={freq}>{t(freq.toLowerCase() as any) || freq}</option>
                  ))}
                </select>
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleSuggestMore}
                    disabled={isSuggesting}
                    className="text-sm text-primary font-semibold hover:underline flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSuggesting ? (
                      <><i className="fa-solid fa-spinner fa-spin"></i> {t('suggesting')}</>
                    ) : (
                      <><i className="fa-solid fa-wand-magic-sparkles"></i> {t('suggestMoreTasks')}</>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('addCustomTask')}</label>
                <input 
                    type="text" 
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder={t('egDustFan')}
                />
            </div>
            {newTaskTitle.trim() && (
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('customTaskFrequency')}</label>
                  <select 
                      value={newTaskFreq}
                      onChange={e => setNewTaskFreq(e.target.value as Frequency)}
                      className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                      {Object.values(Frequency).map(freq => (
                          <option key={freq} value={freq}>{t(freq.toLowerCase() as any) || freq}</option>
                      ))}
                  </select>
              </div>
            )}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('assignToOptional')}</label>
                <select 
                    value={newTaskAssignee}
                    onChange={e => setNewTaskAssignee(e.target.value)}
                    className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-primary focus:outline-none bg-white"
                >
                    <option value="">{t('unassigned')}</option>
                    {assignableUsers.map(u => (
                        <option key={u.id} value={u.id}>{u.name || u.email}</option>
                    ))}
                </select>
            </div>
            <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={selectedSuggestions.length === 0 && !newTaskTitle.trim()}
                  className="w-full bg-primary text-white font-bold py-2 rounded-lg hover:bg-sky-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {t('add')} {selectedSuggestions.length + (newTaskTitle.trim() ? 1 : 0)} {selectedSuggestions.length + (newTaskTitle.trim() ? 1 : 0) !== 1 ? t('tasksLower') : t('taskLower')}
                </button>
            </div>
        </form>
      </Modal>

      <Modal isOpen={isEditAreaModalOpen} onClose={() => setIsEditAreaModalOpen(false)} title={t('editArea')}>
        <form onSubmit={handleEditArea} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('areaName')}</label>
            <input 
                type="text" 
                required
                value={editAreaName}
                onChange={e => setEditAreaName(e.target.value)}
                className="w-full rounded-lg border-gray-300 border p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                placeholder={t('egKitchen')}
            />
          </div>
          <div className="pt-2">
            <button type="submit" className="w-full bg-primary text-white font-bold py-2 rounded-lg hover:bg-sky-600 transition">
                {t('saveChanges')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteTaskModalOpen} onClose={() => setIsDeleteTaskModalOpen(false)} title={t('deleteTask')}>
        <div className="space-y-4">
          <p className="text-gray-700">{t('areYouSureDeleteTask')}</p>
          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => setIsDeleteTaskModalOpen(false)}
              className="flex-1 bg-gray-100 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-200 transition"
            >
              {t('cancel')}
            </button>
            <button 
              onClick={confirmDeleteTask}
              className="flex-1 bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700 transition"
            >
              {t('delete')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AreaView;