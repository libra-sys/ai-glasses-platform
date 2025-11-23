-- 重置管理员账号密码
-- 在 Supabase SQL Editor 中执行此脚本

-- 步骤1：查看现有的 user1-4 账号
SELECT 
  p.username,
  p.email,
  p.role,
  p.id,
  au.email as auth_email,
  au.id as auth_id
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.username IN ('user1', 'user2', 'user3', 'user4')
ORDER BY p.username;

-- 如果上面查询显示 auth_email 和 auth_id 都是 NULL，说明认证用户不存在
-- 需要手动在网站上重新注册这些账号

-- 步骤2：如果账号存在，将他们设置为管理员
UPDATE profiles 
SET role = 'admin'::user_role 
WHERE username IN ('user1', 'user2', 'user3', 'user4');

-- 步骤3：验证管理员设置
SELECT 
  username,
  email,
  role,
  CASE 
    WHEN role = 'admin'::user_role THEN '✅ 管理员'
    ELSE '❌ 普通用户'
  END as status
FROM profiles 
WHERE username IN ('user1', 'user2', 'user3', 'user4')
ORDER BY username;
