import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://eycpynraqzmmwnbfafid.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5Y3B5bnJhcXptbXduYmZhZmlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NTgxNTMsImV4cCI6MjA3OTQzNDE1M30.uN3mclA5_Z2tdIa8rLeBdiN0skQznYW_NkxhayuBtMk';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: any, res: any) {
  const { method } = req;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, email, password, weixinOpenid } = req.body;

    if (action === 'wechat-login') {
      if (!weixinOpenid) {
        return res.status(400).json({ error: 'weixinOpenid is required' });
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('weixin_openid', weixinOpenid)
        .single();

      if (profile) {
        return res.status(200).json({
          success: true,
          userId: profile.user_id,
          isBound: true
        });
      }

      const randomEmail = `wx_${weixinOpenid.substring(0, 16)}@miniapp.local`;
      const randomPassword = weixinOpenid.substring(0, 20);

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: randomEmail,
        password: randomPassword
      });

      if (signUpError) throw signUpError;

      if (signUpData.user) {
        await supabase
          .from('profiles')
          .update({ weixin_openid: weixinOpenid })
          .eq('id', signUpData.user.id);
      }

      return res.status(200).json({
        success: true,
        userId: signUpData.user?.id,
        isBound: false,
        autoCreated: true
      });
    }

    if (action === 'register') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) throw error;

      return res.status(200).json({
        success: true,
        userId: data.user?.id,
        email: data.user?.email
      });
    }

    if (action === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return res.status(200).json({
        success: true,
        userId: data.user?.id,
        email: data.user?.email,
        accessToken: data.session?.access_token
      });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error: any) {
    console.error('Auth Error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}
