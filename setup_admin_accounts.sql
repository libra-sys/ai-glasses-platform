-- ============================================
-- 管理员账号设置脚本
-- ============================================
-- 
-- 使用说明：
-- 1. 确保已经注册了user1、user2、user3、user4这4个账号
-- 2. 在Supabase控制台的SQL Editor中执行此脚本
-- 3. 检查执行结果，确认4个账号都已设置为管理员
--
-- 管理员账号信息：
-- - 用户名：user1, user2, user3, user4
-- - 密码：123456
-- - 角色：管理员
-- ============================================

-- 步骤1：查看当前所有用户（可选）
SELECT 
  username,
  role,
  created_at
FROM profiles 
ORDER BY created_at DESC;

-- 步骤2：将user1-4设置为管理员
UPDATE profiles 
SET role = 'admin'::user_role 
WHERE username IN ('user1', 'user2', 'user3', 'user4');

-- 步骤3：验证管理员设置
SELECT 
  username,
  role,
  email,
  created_at,
  CASE 
    WHEN role = 'admin'::user_role THEN '✅ 管理员'
    ELSE '❌ 普通用户'
  END as status
FROM profiles 
WHERE username IN ('user1', 'user2', 'user3', 'user4')
ORDER BY username;

-- 步骤4：查看所有管理员账号
SELECT 
  username,
  email,
  role,
  created_at
FROM profiles 
WHERE role = 'admin'::user_role
ORDER BY created_at;

-- ============================================
-- 预期结果：
-- 应该看到4条记录，username分别为user1、user2、user3、user4
-- 所有记录的role字段都应该是'admin'
-- status列应该显示'✅ 管理员'
-- ============================================
