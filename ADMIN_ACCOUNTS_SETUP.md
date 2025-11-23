# 管理员账号设置指南

## 管理员账号信息

平台有4个预设的管理员账号：

| 用户名 | 密码 | 角色 |
|--------|------|------|
| user1  | 123456 | 管理员 |
| user2  | 123456 | 管理员 |
| user3  | 123456 | 管理员 |
| user4  | 123456 | 管理员 |

---

## 设置步骤

### 方法一：自动设置（推荐）

#### 步骤1：注册账号
1. 访问平台首页
2. 点击"登录/注册"
3. 依次注册以下账号：
   - 用户名：user1，密码：123456
   - 用户名：user2，密码：123456
   - 用户名：user3，密码：123456
   - 用户名：user4，密码：123456

#### 步骤2：设置管理员权限
在Supabase控制台执行以下SQL：

```sql
-- 将user1-4设置为管理员
UPDATE profiles 
SET role = 'admin'::user_role 
WHERE username IN ('user1', 'user2', 'user3', 'user4');
```

#### 步骤3：验证设置
```sql
-- 查询管理员账号
SELECT id, username, role, created_at 
FROM profiles 
WHERE role = 'admin'::user_role;
```

应该看到4条记录，分别是user1-4。

---

### 方法二：通过Supabase控制台手动设置

#### 步骤1：注册账号
按照方法一的步骤1注册4个账号。

#### 步骤2：在Table Editor中设置
1. 登录Supabase控制台
2. 进入Table Editor
3. 选择`profiles`表
4. 找到user1的记录，点击编辑
5. 将`role`字段改为`admin`
6. 保存
7. 重复步骤4-6，设置user2、user3、user4

---

## 验证管理员权限

### 1. 登录测试
使用任一管理员账号登录：
- 用户名：user1（或user2、user3、user4）
- 密码：123456

### 2. 检查权限
登录后应该能看到：
- ✅ 右上角用户菜单中有"管理后台"选项
- ✅ 用户角色显示为"管理员"
- ✅ 可以访问`/admin`路径

### 3. 测试管理功能
进入管理后台，确认可以：
- ✅ 查看和审核组件
- ✅ 发布和管理公告
- ✅ 查看用户列表

---

## 快速设置SQL脚本

如果4个账号已经注册，可以直接运行以下完整脚本：

```sql
-- ============================================
-- 管理员账号设置脚本
-- ============================================

-- 1. 查看当前所有用户
SELECT username, role FROM profiles ORDER BY created_at;

-- 2. 将user1-4设置为管理员
UPDATE profiles 
SET role = 'admin'::user_role 
WHERE username IN ('user1', 'user2', 'user3', 'user4');

-- 3. 验证管理员设置
SELECT 
  username,
  role,
  created_at,
  CASE 
    WHEN role = 'admin'::user_role THEN '✅ 管理员'
    ELSE '❌ 普通用户'
  END as status
FROM profiles 
WHERE username IN ('user1', 'user2', 'user3', 'user4')
ORDER BY username;

-- 4. 查看所有管理员
SELECT 
  username,
  email,
  created_at
FROM profiles 
WHERE role = 'admin'::user_role
ORDER BY created_at;
```

---

## 注意事项

### 安全提醒
⚠️ **重要**：这些是预设的管理员账号，密码较为简单（123456）。在生产环境中，建议：
1. 修改为更复杂的密码
2. 定期更换密码
3. 限制管理员账号的使用范围

### 密码修改
如需修改密码，可以：
1. 登录对应的管理员账号
2. 进入个人中心
3. 修改密码（如果实现了密码修改功能）
4. 或者在Supabase控制台的Authentication中重置密码

### 账号管理
- 这4个账号是平台的核心管理员
- 请妥善保管账号信息
- 不要随意删除这些账号
- 如需添加新管理员，参考`ADMIN_SETUP.md`

---

## 常见问题

### Q: 注册时提示用户名已存在怎么办？
A: 说明该用户名已被注册，可以直接使用SQL设置其为管理员。

### Q: 设置后仍然看不到管理后台？
A: 请检查：
1. 是否已退出登录并重新登录
2. SQL是否执行成功
3. 在profiles表中确认role字段是否为'admin'

### Q: 可以删除某个管理员账号吗？
A: 可以，但建议保留至少一个管理员账号。删除方法：
```sql
UPDATE profiles SET role = 'user'::user_role WHERE username = 'user1';
```

### Q: 可以添加第5个管理员吗？
A: 可以，参考`ADMIN_SETUP.md`文档。

### Q: 忘记管理员密码怎么办？
A: 在Supabase控制台的Authentication > Users中找到对应用户，点击重置密码。

---

## 执行清单

设置管理员账号时，请按照以下清单操作：

- [ ] 注册user1账号（密码：123456）
- [ ] 注册user2账号（密码：123456）
- [ ] 注册user3账号（密码：123456）
- [ ] 注册user4账号（密码：123456）
- [ ] 在Supabase控制台执行SQL设置管理员权限
- [ ] 验证SQL执行结果（应该有4条记录）
- [ ] 使用user1登录测试
- [ ] 确认可以访问管理后台
- [ ] 测试组件审核功能
- [ ] 测试公告发布功能
- [ ] 使用user2-4分别登录测试
- [ ] 记录管理员账号信息（安全保存）

---

## 相关文档

- `ADMIN_SETUP.md` - 通用管理员设置指南
- `ADMIN_FEATURES.md` - 管理员功能说明
- `QUICK_START.md` - 快速开始指南
- `USAGE_GUIDE.md` - 用户使用指南

---

**管理员账号设置完成后，即可开始管理平台！** 🎉
