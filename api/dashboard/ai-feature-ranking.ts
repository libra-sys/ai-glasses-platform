import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://eycpynraqzmmwnbfafid.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5Y3B5bnJhcXptbXduYmZhZmlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NTgxNTMsImV4cCI6MjA3OTQzNDE1M30.uN3mclA5_Z2tdIa8rLeBdiN0skQznYW_NkxhayuBtMk';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data: components } = await supabase
      .from('components')
      .select('name, download_count, category')
      .eq('status', 'approved')
      .order('download_count', { ascending: false })
      .limit(10);

    if (!components || components.length === 0) {
      return res.status(200).json({ items: [] });
    }

    const totalDownloads = components.reduce((sum, c) => sum + (c.download_count || 0), 0);

    const items = components.map(c => ({
      feature: c.name,
      count: c.download_count || 0,
      ratio: totalDownloads > 0 ? (c.download_count || 0) / totalDownloads : 0
    }));

    return res.status(200).json({ items });
  } catch (error: any) {
    console.error('Dashboard Feature Ranking Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
