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
    const limit = parseInt(req.query.limit as string) || 50;

    const { data: recentInstalls } = await supabase
      .from('user_components')
      .select(`
        id,
        user_id,
        component_id,
        installed_at,
        enabled,
        component:components(name, category)
      `)
      .order('installed_at', { ascending: false })
      .limit(limit);

    const events = (recentInstalls || []).map((install: any, index: number) => {
      const componentName = install.component?.name || 'Unknown';
      const category = install.component?.category || 'unknown';
      
      return {
        id: install.id,
        event_type: 'component_install',
        source: 'miniapp',
        device_sn: null,
        user_id: install.user_id?.substring(0, 8),
        component_id: install.component_id,
        feature: componentName,
        success: install.enabled,
        accuracy: null,
        message: `用户安装了组件【${componentName}】(${category})`,
        created_at: install.installed_at
      };
    });

    return res.status(200).json({ events });
  } catch (error: any) {
    console.error('Dashboard Events Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
