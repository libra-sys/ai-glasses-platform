-- 创建用户组件关联表
CREATE TABLE IF NOT EXISTS user_components (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  component_id UUID NOT NULL REFERENCES components(id) ON DELETE CASCADE,
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  config JSONB DEFAULT '{}'::jsonb,
  enabled BOOLEAN DEFAULT true,
  UNIQUE(user_id, component_id)
);

CREATE INDEX idx_user_components_user_id ON user_components(user_id);
CREATE INDEX idx_user_components_component_id ON user_components(component_id);

COMMENT ON TABLE user_components IS '用户安装的组件列表';
COMMENT ON COLUMN user_components.user_id IS '用户ID';
COMMENT ON COLUMN user_components.component_id IS '组件ID';
COMMENT ON COLUMN user_components.installed_at IS '安装时间';
COMMENT ON COLUMN user_components.config IS '组件配置';
COMMENT ON COLUMN user_components.enabled IS '是否启用';
