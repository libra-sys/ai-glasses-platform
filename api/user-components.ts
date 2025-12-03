import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://eycpynraqzmmwnbfafid.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5Y3B5bnJhcXptbXduYmZhZmlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NTgxNTMsImV4cCI6MjA3OTQzNDE1M30.uN3mclA5_Z2tdIa8rLeBdiN0skQznYW_NkxhayuBtMk';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: any, res: any) {
  const { method, query } = req;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { userId } = query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (method === 'GET') {
      const { data, error } = await supabase
        .from('user_components')
        .select(`
          *,
          component:components(*)
        `)
        .eq('user_id', userId)
        .order('installed_at', { ascending: false });

      if (error) throw error;

      const userComponents = data?.map(uc => ({
        id: uc.component.id,
        name: uc.component.name,
        description: uc.component.description,
        category: uc.component.category,
        version: uc.component.version,
        file_url: uc.component.file_url,
        image_url: uc.component.image_url,
        installed_at: uc.installed_at,
        config: uc.config,
        enabled: uc.enabled
      })) || [];

      return res.status(200).json({ components: userComponents });
    }

    if (method === 'POST') {
      const { componentId } = req.body;

      if (!componentId) {
        return res.status(400).json({ error: 'Component ID is required' });
      }

      const { data, error } = await supabase
        .from('user_components')
        .insert({
          user_id: userId,
          component_id: componentId
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return res.status(200).json({ message: 'Component already installed' });
        }
        throw error;
      }

      return res.status(200).json({ message: 'Component installed', data });
    }

    if (method === 'DELETE') {
      const { componentId } = query;

      if (!componentId) {
        return res.status(400).json({ error: 'Component ID is required' });
      }

      const { error } = await supabase
        .from('user_components')
        .delete()
        .eq('user_id', userId)
        .eq('component_id', componentId);

      if (error) throw error;

      return res.status(200).json({ message: 'Component uninstalled' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
