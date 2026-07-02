import { supabase } from '../../supabaseClient';

export const authService = {
  signUp: async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.fullName,
          role: userData.role || 'user',
          preferred_tribe_id: userData.preferredTribeId
        }
      }
    });
    if (error) throw error;
    
    const { error: profileError } = await supabase
      .from('users')
      .insert([{
        id: data.user.id,
        email: email,
        full_name: userData.fullName,
        role: userData.role || 'user',
        preferred_tribe_id: userData.preferredTribeId,
        bio: userData.bio
      }]);
    
    if (profileError) throw profileError;
    return data;
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  isAuthenticated: async () => {
    const session = await authService.getSession();
    return !!session;
  },

  getUserRole: async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data?.role;
  }
};