import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState, Task, Apartment, Area, TaskStatus, Profile, ApartmentUser, Language } from '../types';
import { calculateNextDueDate } from '../services/storageService';
import { 
  fetchSupabaseData, 
  syncInitialDataToSupabase, 
  updateTaskInSupabase, 
  insertTaskToSupabase, 
  insertTasksToSupabase,
  deleteTaskFromSupabase,
  insertApartmentToSupabase, 
  updateApartmentInSupabase,
  deleteApartmentFromSupabase,
  insertAreaToSupabase,
  insertAreasToSupabase,
  updateAreaInSupabase,
  deleteAreaFromSupabase,
  inviteUserToApartment,
  acceptInvitation,
  assignAllTasksInApartment
} from '../services/supabaseService';
import { INITIAL_APARTMENTS, INITIAL_AREAS, INITIAL_TASKS } from '../constants';
import { supabase } from '../services/supabaseClient';
import { translations, TranslationKey } from '../i18n';

interface AppContextType {
  state: AppState;
  isLoading: boolean;
  session: any;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey | string) => string;
  completeTask: (taskId: string) => void;
  addTask: (task: Task) => void;
  addTasks: (tasks: Task[]) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addApartment: (apartment: Apartment) => void;
  updateApartment: (id: string, name: string) => Promise<void>;
  deleteApartment: (id: string) => Promise<void>;
  addArea: (area: Area) => void;
  addAreas: (areas: Area[]) => Promise<void>;
  updateArea: (id: string, name: string) => Promise<void>;
  deleteArea: (id: string) => Promise<void>;
  getTasksByArea: (areaId: string) => Task[];
  getAreasByApartment: (aptId: string) => Area[];
  getApartmentProgress: (aptId: string) => { completed: number, total: number, percentage: number };
  getTotalProgress: () => { completed: number, total: number, percentage: number };
  refreshData: () => void;
  syncWithSheet: () => Promise<void>;
  inviteUser: (apartmentId: string, email: string) => Promise<void>;
  acceptInvite: (invitationId: string) => Promise<void>;
  assignAllTasks: (apartmentId: string, userId: string) => Promise<void>;
  assignTask: (taskId: string, userId: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<any>(null);
  const [language, setLanguageState] = useState<Language>('es');
  
  const setLanguage = (lang: Language) => {
    setLanguageState('es');
    localStorage.setItem('language', 'es');
  };

  const t = useCallback((key: TranslationKey | string): string => {
    const translation = translations['es'][key as TranslationKey];
    if (translation) return translation;
    
    // Fallback: format camelCase to Title Case
    const result = key.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
  }, []);

  const [state, setState] = useState<AppState>({
    apartments: [],
    areas: [],
    tasks: [],
    apartmentUsers: [],
    profiles: [],
    currentUser: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) {
      syncWithSheet();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  const syncWithSheet = async () => {
    if (!session?.user) return;
    setIsLoading(true);
    
    // Ensure initial data is in Supabase
    await syncInitialDataToSupabase(session.user.id);
    
    // Fetch data from Supabase
    const supabaseData = await fetchSupabaseData(session.user.id);
    
    if (supabaseData) {
      setState(supabaseData);
    }
    setIsLoading(false);
  };

  const refreshData = useCallback(() => {
    syncWithSheet();
  }, [session]);

  const completeTask = async (taskId: string) => {
    let updatedTask: Task | undefined;
    
    setState(prev => {
      const newTasks = prev.tasks.map(t => {
        if (t.id === taskId) {
          const now = new Date();
          const nextDue = calculateNextDueDate(t.frequency, now);
          updatedTask = {
            ...t,
            lastCompletedDate: now.toISOString(),
            nextDueDate: nextDue.toISOString(),
            assignedTo: prev.currentUser?.id
          };
          return updatedTask;
        }
        return t;
      });
      return { ...prev, tasks: newTasks };
    });
    
    if (updatedTask) {
      await updateTaskInSupabase(updatedTask);
    }
  };

  const addTask = async (task: Task) => {
    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, task]
    }));
    await insertTaskToSupabase(task);
  };

  const addTasks = async (tasks: Task[]) => {
    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, ...tasks]
    }));
    try {
      await insertTasksToSupabase(tasks);
    } catch (error: any) {
      alert(`Database error: ${error.message}`);
    }
  };

  const deleteTask = async (taskId: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId)
    }));
    try {
      await deleteTaskFromSupabase(taskId);
    } catch (error: any) {
      alert(`Database error: ${error.message}`);
    }
  };

  const addApartment = async (apartment: Apartment) => {
    setState(prev => ({
      ...prev,
      apartments: [...prev.apartments, apartment]
    }));
    try {
      await insertApartmentToSupabase(apartment);
    } catch (error: any) {
      alert(`Database error: ${error.message}`);
    }
  };

  const updateApartment = async (id: string, name: string) => {
    setState(prev => ({
      ...prev,
      apartments: prev.apartments.map(a => a.id === id ? { ...a, name } : a)
    }));
    try {
      await updateApartmentInSupabase(id, name);
    } catch (error: any) {
      alert(`Database error: ${error.message}`);
    }
  };

  const deleteApartment = async (id: string) => {
    setState(prev => ({
      ...prev,
      apartments: prev.apartments.filter(a => a.id !== id),
      areas: prev.areas.filter(a => a.apartmentId !== id),
      tasks: prev.tasks.filter(t => !prev.areas.find(a => a.id === t.areaId && a.apartmentId === id))
    }));
    try {
      await deleteApartmentFromSupabase(id);
    } catch (error: any) {
      alert(`Database error: ${error.message}`);
    }
  };

  const addArea = async (area: Area) => {
    setState(prev => ({
      ...prev,
      areas: [...prev.areas, area]
    }));
    await insertAreaToSupabase(area);
  };

  const addAreas = async (areas: Area[]) => {
    setState(prev => ({
      ...prev,
      areas: [...prev.areas, ...areas]
    }));
    try {
      await insertAreasToSupabase(areas);
    } catch (error: any) {
      alert(`Database error: ${error.message}`);
    }
  };

  const updateArea = async (id: string, name: string) => {
    setState(prev => ({
      ...prev,
      areas: prev.areas.map(a => a.id === id ? { ...a, name } : a)
    }));
    try {
      await updateAreaInSupabase(id, name);
    } catch (error: any) {
      alert(`Database error: ${error.message}`);
    }
  };

  const deleteArea = async (id: string) => {
    setState(prev => ({
      ...prev,
      areas: prev.areas.filter(a => a.id !== id),
      tasks: prev.tasks.filter(t => t.areaId !== id)
    }));
    try {
      await deleteAreaFromSupabase(id);
    } catch (error: any) {
      alert(`Database error: ${error.message}`);
    }
  };

  const inviteUser = async (apartmentId: string, email: string) => {
    await inviteUserToApartment(apartmentId, email);
    await syncWithSheet();
  };

  const acceptInvite = async (invitationId: string) => {
    if (!session?.user) return;
    await acceptInvitation(invitationId, session.user.id);
    await syncWithSheet();
  };

  const assignAllTasks = async (apartmentId: string, userId: string) => {
    await assignAllTasksInApartment(apartmentId, userId);
    await syncWithSheet();
  };
  
  const assignTask = async (taskId: string, userId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
      const updatedTask = { ...task, assignedTo: userId };
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? updatedTask : t)
      }));
      await updateTaskInSupabase(updatedTask);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const getTasksByArea = (areaId: string) => {
    return state.tasks.filter(t => t.areaId === areaId);
  };

  const getAreasByApartment = (aptId: string) => {
    return state.areas.filter(a => a.apartmentId === aptId);
  };

  const getApartmentProgress = (aptId: string) => {
    const areaIds = state.areas.filter(a => a.apartmentId === aptId).map(a => a.id);
    const tasks = state.tasks.filter(t => areaIds.includes(t.areaId));
    
    if (tasks.length === 0) return { completed: 0, total: 0, percentage: 100 };

    const now = new Date();
    const pendingCount = tasks.filter(t => new Date(t.nextDueDate) <= now).length;
    const totalCount = tasks.length;
    const onTrackCount = totalCount - pendingCount;
    
    return {
      completed: onTrackCount,
      total: totalCount,
      percentage: totalCount === 0 ? 100 : Math.round((onTrackCount / totalCount) * 100)
    };
  };

  const getTotalProgress = () => {
     const tasks = state.tasks;
     if (tasks.length === 0) return { completed: 0, total: 0, percentage: 100 };
     
     const now = new Date();
     const pendingCount = tasks.filter(t => new Date(t.nextDueDate) <= now).length;
     const totalCount = tasks.length;
     const onTrackCount = totalCount - pendingCount;

     return {
      completed: onTrackCount,
      total: totalCount,
      percentage: totalCount === 0 ? 100 : Math.round((onTrackCount / totalCount) * 100)
    };
  };

  return (
    <AppContext.Provider value={{ 
      state, 
      isLoading,
      session,
      language,
      setLanguage,
      t,
      completeTask, 
      addTask,
      addTasks,
      deleteTask,
      addApartment, 
      updateApartment,
      deleteApartment,
      addArea,
      addAreas,
      updateArea,
      deleteArea,
      getTasksByArea, 
      getAreasByApartment,
      getApartmentProgress,
      getTotalProgress,
      refreshData,
      syncWithSheet,
      inviteUser,
      acceptInvite,
      assignAllTasks,
      assignTask,
      signOut
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};