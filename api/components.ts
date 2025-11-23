import { supabase } from '../src/db/supabase.js';

export default async function handler(req: any, res: any) {
  const { method, query } = req;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (method === 'GET') {
      const { keyword } = query;

      let queryBuilder = supabase
        .from('components')
        .select(`
          *,
          author:profiles(username, avatar_url)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (keyword) {
        queryBuilder = queryBuilder.or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;

      const components = data?.map(comp => ({
        id: comp.id,
        name: comp.name,
        description: comp.description,
        icon: comp.category === 'navigation' ? '🧭' : 
              comp.category === 'translation' ? '🌐' :
              comp.category === 'health' ? '❤️' :
              comp.category === 'entertainment' ? '🎮' :
              comp.category === 'productivity' ? '📝' : '📱',
        color: '#007AFF',
        author: comp.author?.username || 'Unknown',
        version: comp.version || '1.0.0',
        downloads: comp.download_count || 0,
        rating: 4.5,
        size: '2MB',
        category: comp.category,
        image_url: comp.image_url,
        file_url: comp.file_url
      })) || [];

      return res.status(200).json({ components });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
