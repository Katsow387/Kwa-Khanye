import { supabase } from '../../supabaseClient';

export const tribeService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('tribes')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  }
};
