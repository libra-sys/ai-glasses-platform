/*
# 创建公告表

1. 新建表
  - `announcements`
    - `id` (uuid, 主键, 默认值: gen_random_uuid())
    - `title` (text, 非空) - 公告标题
    - `content` (text, 非空) - 公告内容
    - `priority` (text, 默认: 'normal') - 优先级: high, normal, low
    - `is_active` (boolean, 默认: true) - 是否激活
    - `created_by` (uuid, 外键引用profiles.id) - 创建者
    - `created_at` (timestamptz, 默认: now())
    - `updated_at` (timestamptz, 默认: now())

2. 安全策略
  - 启用RLS
  - 所有人可以查看激活的公告
  - 只有管理员可以创建、更新、删除公告

3. 索引
  - 在created_at上创建索引以优化查询性能
*/

-- 创建公告表
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  priority text DEFAULT 'normal' CHECK (priority IN ('high', 'normal', 'low')),
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);

-- 启用RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看激活的公告
CREATE POLICY "Anyone can view active announcements" ON announcements
  FOR SELECT USING (is_active = true);

-- 管理员可以查看所有公告
CREATE POLICY "Admins can view all announcements" ON announcements
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

-- 管理员可以创建公告
CREATE POLICY "Admins can create announcements" ON announcements
  FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));

-- 管理员可以更新公告
CREATE POLICY "Admins can update announcements" ON announcements
  FOR UPDATE TO authenticated USING (is_admin(auth.uid()));

-- 管理员可以删除公告
CREATE POLICY "Admins can delete announcements" ON announcements
  FOR DELETE TO authenticated USING (is_admin(auth.uid()));

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_announcements_updated_at();