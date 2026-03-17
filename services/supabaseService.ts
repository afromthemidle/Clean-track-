import { supabase } from './supabaseClient';
import { Apartment, Area, Task, AppState, ApartmentUser, Profile, Frequency } from '../types';
import { INITIAL_APARTMENTS, INITIAL_AREAS, INITIAL_TASKS } from '../constants';

export const fetchSupabaseData = async (userId: string): Promise<AppState | null> => {
  try {
    // 1. Get user profile
    let { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      if (profileError.code === 'PGRST116') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: user.email,
              name: user.email?.split('@')[0] || 'User'
            })
            .select()
            .single();
            
          if (insertError) throw insertError;
          profileData = newProfile;
        } else {
          throw new Error('User not found in auth');
        }
      } else {
        throw profileError;
      }
    }

    // 2. Get apartments where user is owner
    const { data: ownedApts } = await supabase
      .from('apartments')
      .select('*')
      .eq('owner_id', userId);

    // 3. Get apartments where user is accepted member or pending invite
    const { data: memberLinks } = await supabase
      .from('apartment_users')
      .select('apartment_id')
      .eq('email', profileData.email);

    const memberAptIds = memberLinks?.map(link => link.apartment_id) || [];
    const ownedAptIds = ownedApts?.map(a => a.id) || [];
    const allAptIds = [...new Set([...ownedAptIds, ...memberAptIds])];

    if (allAptIds.length === 0) {
      return {
        apartments: [],
        areas: [],
        tasks: [],
        apartmentUsers: [],
        profiles: [profileData],
        currentUser: profileData
      };
    }

    // 4. Fetch all relevant data for these apartments
    const [apartmentsRes, areasRes, tasksRes, aptUsersRes, profilesRes] = await Promise.all([
      supabase.from('apartments').select('*').in('id', allAptIds),
      supabase.from('areas').select('*').in('apartment_id', allAptIds),
      supabase.from('tasks').select('*, areas!inner(apartment_id)').in('areas.apartment_id', allAptIds),
      supabase.from('apartment_users').select('*').in('apartment_id', allAptIds),
      supabase.from('profiles').select('*')
    ]);

    // Map data
    const apartments: Apartment[] = (apartmentsRes.data || []).map(a => ({
      id: a.id,
      name: a.name,
      address: a.address,
      ownerId: a.owner_id,
      cleaningFrequency: a.cleaning_frequency || Frequency.WEEKLY
    }));

    const areas: Area[] = (areasRes.data || []).map(a => ({
      id: a.id,
      name: a.name,
      icon: a.icon,
      apartmentId: a.apartment_id
    }));

    const tasks: Task[] = (tasksRes.data || []).map(t => {
      let description = t.description;
      let suggestedFrequency = undefined;
      try {
        if (description && description.startsWith('{')) {
          const parsed = JSON.parse(description);
          description = parsed.text;
          suggestedFrequency = parsed.suggestedFrequency;
        }
      } catch (e) {
        // Not a JSON string
      }
      return {
        id: t.id,
        title: t.title,
        description,
        frequency: t.frequency,
        suggestedFrequency,
        lastCompletedDate: t.last_completed_date,
        nextDueDate: t.next_due_date,
        assignedTo: t.assigned_to,
        areaId: t.area_id
      };
    });

    const apartmentUsers: ApartmentUser[] = (aptUsersRes.data || []).map(au => ({
      id: au.id,
      apartmentId: au.apartment_id,
      email: au.email,
      userId: au.user_id,
      status: au.status
    }));

    const profiles: Profile[] = (profilesRes.data || []).map(p => ({
      id: p.id,
      email: p.email,
      name: p.name
    }));

    return {
      apartments,
      areas,
      tasks,
      apartmentUsers,
      profiles,
      currentUser: profileData
    };
  } catch (e) {
    console.error("Error fetching Supabase data", e);
    return null;
  }
};

export const syncInitialDataToSupabase = async (userId: string) => {
  try {
    // Check if data exists
    const { count } = await supabase.from('apartments').select('*', { count: 'exact', head: true });
    
    if (count === 0) {
      console.log('Seeding initial data to Supabase...');
      
      // Insert Apartments
      const aptsToInsert = INITIAL_APARTMENTS.map(a => ({
        id: a.id,
        name: a.name,
        address: a.address,
        owner_id: userId,
        cleaning_frequency: a.cleaningFrequency || Frequency.WEEKLY
      }));
      try {
        await supabase.from('apartments').insert(aptsToInsert);
      } catch (e) {
        // Fallback if cleaning_frequency doesn't exist
        const fallbackApts = INITIAL_APARTMENTS.map(a => ({
          id: a.id,
          name: a.name,
          address: a.address,
          owner_id: userId
        }));
        await supabase.from('apartments').insert(fallbackApts);
      }

      // Insert Areas
      const areasToInsert = INITIAL_AREAS.map(a => ({
        id: a.id,
        name: a.name,
        icon: a.icon,
        apartment_id: a.apartmentId
      }));
      await supabase.from('areas').insert(areasToInsert);

      // Insert Tasks
      const tasksToInsert = INITIAL_TASKS.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        frequency: t.frequency,
        last_completed_date: t.lastCompletedDate,
        next_due_date: t.nextDueDate,
        assigned_to: userId,
        area_id: t.areaId
      }));
      await supabase.from('tasks').insert(tasksToInsert);
      
      console.log('Seeding complete.');
    }
  } catch (e) {
    console.error("Error seeding Supabase data", e);
  }
};

export const updateTaskInSupabase = async (task: Task) => {
  try {
    const description = task.suggestedFrequency ? JSON.stringify({ text: task.description || '', suggestedFrequency: task.suggestedFrequency }) : (task.description || null);
    const { error } = await supabase
      .from('tasks')
      .update({
        title: task.title,
        description,
        frequency: task.frequency,
        last_completed_date: task.lastCompletedDate || null,
        next_due_date: task.nextDueDate,
        assigned_to: task.assignedTo || null
      })
      .eq('id', task.id);
      
    if (error) throw error;
  } catch (e) {
    console.error("Error updating task in Supabase", e);
    throw e;
  }
};

export const insertTaskToSupabase = async (task: Task) => {
  try {
    const description = task.suggestedFrequency ? JSON.stringify({ text: task.description || '', suggestedFrequency: task.suggestedFrequency }) : (task.description || null);
    const { error } = await supabase
      .from('tasks')
      .insert({
        id: task.id,
        title: task.title,
        description,
        frequency: task.frequency,
        last_completed_date: task.lastCompletedDate || null,
        next_due_date: task.nextDueDate,
        assigned_to: task.assignedTo || null,
        area_id: task.areaId
      });
      
    if (error) throw error;
  } catch (e) {
    console.error("Error inserting task to Supabase", e);
    throw e;
  }
};

export const insertApartmentToSupabase = async (apartment: Apartment) => {
  try {
    const { error } = await supabase
      .from('apartments')
      .insert({
        id: apartment.id,
        name: apartment.name,
        address: apartment.address,
        owner_id: apartment.ownerId,
        cleaning_frequency: apartment.cleaningFrequency || Frequency.WEEKLY
      });
    if (error) throw error;
  } catch (e) {
    const { error } = await supabase
      .from('apartments')
      .insert({
        id: apartment.id,
        name: apartment.name,
        address: apartment.address,
        owner_id: apartment.ownerId
      });
    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }
  }
};

export const updateApartmentInSupabase = async (id: string, name: string, address?: string, cleaningFrequency?: string) => {
  try {
    const { error } = await supabase
      .from('apartments')
      .update({ name, address, cleaning_frequency: cleaningFrequency })
      .eq('id', id);
    if (error) throw error;
  } catch (e) {
    const { error } = await supabase
      .from('apartments')
      .update({ name, address })
      .eq('id', id);
    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }
  }
};

export const deleteApartmentFromSupabase = async (id: string) => {
  const { error } = await supabase
    .from('apartments')
    .delete()
    .eq('id', id);
  if (error) {
    console.error("Supabase delete error:", error);
    throw error;
  }
};

export const insertAreasToSupabase = async (areas: Area[]) => {
  try {
    const { error } = await supabase
      .from('areas')
      .insert(areas.map(area => ({
        id: area.id,
        name: area.name,
        icon: area.icon,
        apartment_id: area.apartmentId
      })));
      
    if (error) throw error;
  } catch (e) {
    console.error("Error inserting areas to Supabase", e);
    throw e;
  }
};

export const deleteTaskFromSupabase = async (id: string) => {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) {
    console.error("Supabase delete task error:", error);
    throw error;
  }
};

export const insertTasksToSupabase = async (tasks: Task[]) => {
  try {
    const { error } = await supabase.from('tasks').insert(tasks.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      frequency: t.frequency,
      last_completed_date: t.lastCompletedDate,
      next_due_date: t.nextDueDate,
      assigned_to: t.assignedTo,
      area_id: t.areaId
    })));
    if (error) throw error;
  } catch (e) {
    console.error("Error inserting tasks to Supabase", e);
    throw e;
  }
};

export const updateAreaInSupabase = async (id: string, name: string) => {
  const { error } = await supabase.from('areas').update({ name }).eq('id', id);
  if (error) {
    console.error("Supabase update area error:", error);
    throw error;
  }
};

export const deleteAreaFromSupabase = async (id: string) => {
  const { error } = await supabase.from('areas').delete().eq('id', id);
  if (error) {
    console.error("Supabase delete area error:", error);
    throw error;
  }
};

export const insertAreaToSupabase = async (area: Area) => {
  try {
    const { error } = await supabase
      .from('areas')
      .insert({
        id: area.id,
        name: area.name,
        icon: area.icon,
        apartment_id: area.apartmentId
      });
      
    if (error) throw error;
  } catch (e) {
    console.error("Error inserting area to Supabase", e);
  }
};

export const inviteUserToApartment = async (apartmentId: string, email: string) => {
  const { data, error } = await supabase
    .from('apartment_users')
    .insert({ apartment_id: apartmentId, email, status: 'pending' })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const acceptInvitation = async (invitationId: string, userId: string) => {
  const { error } = await supabase
    .from('apartment_users')
    .update({ status: 'accepted', user_id: userId })
    .eq('id', invitationId);
  if (error) throw error;
};

export const assignAllTasksInApartment = async (apartmentId: string, userId: string) => {
  const { data: areas } = await supabase.from('areas').select('id').eq('apartment_id', apartmentId);
  if (!areas || areas.length === 0) return;
  const areaIds = areas.map(a => a.id);
  
  const { error } = await supabase
    .from('tasks')
    .update({ assigned_to: userId })
    .in('area_id', areaIds);
    
  if (error) throw error;
};
