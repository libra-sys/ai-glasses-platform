import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://eycpynraqzmmwnbfafid.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5Y3B5bnJhcXptbXduYmZhZmlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NTgxNTMsImV4cCI6MjA3OTQzNDE1M30.uN3mclA5_Z2tdIa8rLeBdiN0skQznYW_NkxhayuBtMk';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: any, res: any) {
  const { method, query } = req;
  const { id } = query;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (method === 'GET') {
      const { data, error } = await supabase
        .from('components')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ error: 'Component not found' });
      }

      await supabase.rpc('increment_download_count', { component_id: id });

      return res.status(200).json({
        id: data.id,
        name: data.name,
        description: data.description,
        version: data.version || '1.0.0',
        config: {
          category: data.category,
          image_url: data.image_url,
          file_url: data.file_url
        },
        code: data.file_url || ''
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Download Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
