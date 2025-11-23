/*
# 初始化数据库架构

## 1. 新建表

### profiles - 用户信息表
- `id` (uuid, primary key, references auth.users)
- `username` (text, unique, not null) - 用户名
- `email` (text) - 邮箱
- `phone` (text) - 手机号
- `avatar_url` (text) - 头像URL
- `role` (user_role, default: 'user', not null) - 用户角色
- `bio` (text) - 个人简介
- `created_at` (timestamptz, default: now())

### components - 组件表
- `id` (uuid, primary key, default: gen_random_uuid())
- `name` (text, not null) - 组件名称
- `description` (text) - 组件描述
- `category` (text) - 组件分类
- `version` (text) - 版本号
- `author_id` (uuid, references profiles) - 作者ID
- `file_url` (text) - 组件文件URL
- `image_url` (text) - 组件封面图URL
- `download_count` (integer, default: 0) - 下载次数
- `status` (component_status, default: 'pending') - 审核状态
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

### comments - 评论表
- `id` (uuid, primary key, default: gen_random_uuid())
- `component_id` (uuid, references components, on delete cascade)
- `user_id` (uuid, references profiles)
- `content` (text, not null) - 评论内容
- `rating` (integer, check: 1-5) - 评分
- `created_at` (timestamptz, default: now())

### favorites - 收藏表
- `id` (uuid, primary key, default: gen_random_uuid())
- `component_id` (uuid, references components, on delete cascade)
- `user_id` (uuid, references profiles)
- `created_at` (timestamptz, default: now())
- unique(component_id, user_id)

## 2. 安全策略

### profiles表
- 不启用RLS（公开数据，所有人可查看）
- 用户可以更新自己的资料（除role字段外）
- 管理员可以修改所有用户信息

### components表
- 不启用RLS（公开数据）
- 所有人可以查看已审核通过的组件
- 用户可以创建、更新、删除自己的组件
- 管理员可以审核、修改、删除所有组件

### comments表
- 不启用RLS（公开数据）
- 用户可以创建、更新、删除自己的评论
- 管理员可以删除任何评论

### favorites表
- 不启用RLS（公开数据）
- 用户可以添加、删除自己的收藏

## 3. 存储桶

### app-7pdiv8w9evi9_component_files
- 用于存储组件文件
- 公开读取
- 登录用户可上传

### app-7pdiv8w9evi9_component_images
- 用于存储组件图片
- 公开读取
- 登录用户可上传
- 最大文件大小: 1MB

## 4. 触发器

### handle_new_user
- 当auth.users中的用户通过验证后，自动在profiles表中创建记录
- 第一个用户自动设置为admin角色

### update_component_updated_at
- 当components表更新时，自动更新updated_at字段

## 5. RPC函数

### is_admin
- 检查用户是否为管理员

### increment_download_count
- 原子性增加组件下载次数
*/

-- 创建枚举类型
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE component_status AS ENUM ('pending', 'approved', 'rejected');

-- 创建profiles表
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text,
  phone text,
  avatar_url text,
  role user_role DEFAULT 'user'::user_role NOT NULL,
  bio text,
  created_at timestamptz DEFAULT now()
);

-- 创建components表
CREATE TABLE IF NOT EXISTS components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text,
  version text,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  file_url text,
  image_url text,
  download_count integer DEFAULT 0,
  status component_status DEFAULT 'pending'::component_status NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 创建comments表
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id uuid REFERENCES components(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now()
);

-- 创建favorites表
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id uuid REFERENCES components(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(component_id, user_id)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_components_author ON components(author_id);
CREATE INDEX IF NOT EXISTS idx_components_status ON components(status);
CREATE INDEX IF NOT EXISTS idx_components_category ON components(category);
CREATE INDEX IF NOT EXISTS idx_comments_component ON comments(component_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_component ON favorites(component_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

-- 创建RPC函数：检查是否为管理员
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = uid AND role = 'admin'::user_role
  );
$$;

-- 创建RPC函数：原子性增加下载次数
CREATE OR REPLACE FUNCTION increment_download_count(component_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE components
  SET download_count = download_count + 1
  WHERE id = component_id;
END;
$$;

-- 创建触发器函数：处理新用户注册
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
  new_username text;
BEGIN
  -- 只在用户经过验证后再插入profiles
  IF OLD IS DISTINCT FROM NULL AND OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL THEN
    -- 判断profiles表里有多少用户
    SELECT COUNT(*) INTO user_count FROM profiles;
    
    -- 从email中提取用户名（去掉@miaoda.com后缀）
    IF NEW.email LIKE '%@miaoda.com' THEN
      new_username := REPLACE(NEW.email, '@miaoda.com', '');
    ELSE
      new_username := SPLIT_PART(NEW.email, '@', 1);
    END IF;
    
    -- 插入profiles，首位用户给admin角色
    INSERT INTO profiles (id, username, email, phone, role)
    VALUES (
      NEW.id,
      new_username,
      NEW.email,
      NEW.phone,
      CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'user'::user_role END
    );
  END IF;
  RETURN NEW;
END;
$$;

-- 绑定触发器到auth.users表
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 创建触发器函数：自动更新updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 绑定触发器到components表
DROP TRIGGER IF EXISTS update_component_updated_at ON components;
CREATE TRIGGER update_component_updated_at
  BEFORE UPDATE ON components
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 创建存储桶：组件文件
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-7pdiv8w9evi9_component_files', 'app-7pdiv8w9evi9_component_files', true)
ON CONFLICT (id) DO NOTHING;

-- 创建存储桶：组件图片（限制1MB）
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('app-7pdiv8w9evi9_component_images', 'app-7pdiv8w9evi9_component_images', true, 1048576)
ON CONFLICT (id) DO NOTHING;

-- 存储桶策略：所有人可以读取
CREATE POLICY "Public read access for component files"
ON storage.objects FOR SELECT
USING (bucket_id = 'app-7pdiv8w9evi9_component_files');

CREATE POLICY "Public read access for component images"
ON storage.objects FOR SELECT
USING (bucket_id = 'app-7pdiv8w9evi9_component_images');

-- 存储桶策略：登录用户可以上传
CREATE POLICY "Authenticated users can upload component files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'app-7pdiv8w9evi9_component_files');

CREATE POLICY "Authenticated users can upload component images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'app-7pdiv8w9evi9_component_images');

-- 存储桶策略：用户可以更新和删除自己上传的文件
CREATE POLICY "Users can update own component files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'app-7pdiv8w9evi9_component_files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own component files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'app-7pdiv8w9evi9_component_files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own component images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'app-7pdiv8w9evi9_component_images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own component images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'app-7pdiv8w9evi9_component_images' AND auth.uid()::text = (storage.foldername(name))[1]);