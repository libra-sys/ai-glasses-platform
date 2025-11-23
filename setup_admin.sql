-- 设置管理员账号
-- 请先在网站上注册 admin 账号（用户名：admin，密码：admin123456）
-- 然后在 Supabase SQL Editor 中执行此脚本

-- 将 admin 用户设置为管理员
UPDATE profiles 
SET role = 'admin'::user_role 
WHERE username = 'admin';

-- 验证设置结果
SELECT 
  username,
  email,
  role,
  CASE 
    WHEN role = 'admin'::user_role THEN '✅ 管理员权限已设置'
    ELSE '❌ 仍是普通用户'
  END as status
FROM profiles 
WHERE username = 'admin';
