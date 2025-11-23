# 管理员账号登录故障排查指南

## 问题：管理员账号登录不了

### 可能的原因和解决方案

---

## 原因1：账号还没有注册 ⭐ 最常见

### 问题描述
管理员账号（user1-4）需要先在平台上注册，才能登录。

### 解决步骤

#### 步骤1：注册管理员账号
1. 访问平台首页
2. 点击右上角"登录/注册"按钮
3. 切换到"注册"标签
4. 依次注册以下账号：

**第一个账号：**
- 用户名：`user1`
- 密码：`123456`
- 点击"注册"

**第二个账号：**
- 退出登录（如果自动登录了）
- 用户名：`user2`
- 密码：`123456`
- 点击"注册"

**第三个账号：**
- 退出登录
- 用户名：`user3`
- 密码：`123456`
- 点击"注册"

**第四个账号：**
- 退出登录
- 用户名：`user4`
- 密码：`123456`
- 点击"注册"

#### 步骤2：设置管理员权限

**方法A：使用SQL脚本（推荐）**

1. 登录Supabase控制台
2. 进入SQL Editor
3. 执行以下SQL：

```sql
-- 将user1-4设置为管理员
UPDATE profiles 
SET role = 'admin'::user_role 
WHERE username IN ('user1', 'user2', 'user3', 'user4');

-- 验证设置
SELECT username, role FROM profiles 
WHERE username IN ('user1', 'user2', 'user3', 'user4');
```

**方法B：使用提供的SQL文件**

1. 打开 `setup_admin_accounts.sql` 文件
2. 复制全部内容
3. 在Supabase SQL Editor中执行

#### 步骤3：验证登录

1. 退出当前登录（如果有）
2. 使用管理员账号登录：
   - 用户名：`user1`
   - 密码：`123456`
3. 登录成功后，点击右上角用户头像
4. 应该能看到"管理后台"菜单项
5. 点击进入管理后台

---

## 原因2：账号已注册但没有设置为管理员

### 问题描述
账号可以登录，但看不到"管理后台"菜单。

### 解决步骤

#### 检查当前角色
在Supabase控制台执行：

```sql
SELECT username, role FROM profiles 
WHERE username IN ('user1', 'user2', 'user3', 'user4');
```

如果role显示为'user'而不是'admin'，执行：

```sql
UPDATE profiles 
SET role = 'admin'::user_role 
WHERE username IN ('user1', 'user2', 'user3', 'user4');
```

---

## 原因3：密码错误

### 问题描述
提示"登录失败"或"密码错误"。

### 解决步骤

#### 确认密码
- 管理员密码统一为：`123456`（6个数字）
- 注意：密码区分大小写
- 确保没有多余的空格

#### 重置密码（如果忘记）

**方法A：通过Supabase控制台**
1. 登录Supabase控制台
2. 进入Authentication > Users
3. 找到对应的用户（邮箱格式：user1@miaoda.com）
4. 点击用户，选择"Send password recovery"
5. 或直接在控制台重置密码

**方法B：重新注册**
1. 在Supabase控制台删除旧账号
2. 重新注册该账号
3. 设置管理员权限

---

## 原因4：用户名格式错误

### 问题描述
输入用户名时提示"用户名只能包含字母、数字和下划线"。

### 解决步骤
- 确保用户名为：`user1`、`user2`、`user3`、`user4`
- 全部小写
- 没有空格
- 没有特殊字符

---

## 原因5：数据库连接问题

### 问题描述
登录时一直加载或提示网络错误。

### 解决步骤

#### 检查环境变量
查看 `.env` 文件，确认以下变量已配置：

```env
VITE_SUPABASE_URL=你的Supabase URL
VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥
VITE_APP_ID=app-7pdiv8w9evi9
```

#### 检查Supabase项目状态
1. 登录Supabase控制台
2. 确认项目状态为"Active"
3. 检查数据库是否正常运行

---

## 完整的设置流程（从零开始）

### 第一步：确认环境
```bash
# 检查.env文件
cat .env

# 应该包含：
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
# VITE_APP_ID=app-7pdiv8w9evi9
```

### 第二步：注册账号
访问平台，依次注册user1、user2、user3、user4（密码都是123456）

### 第三步：设置管理员
在Supabase SQL Editor执行：
```sql
UPDATE profiles 
SET role = 'admin'::user_role 
WHERE username IN ('user1', 'user2', 'user3', 'user4');
```

### 第四步：验证
```sql
-- 应该返回4条记录，role都是'admin'
SELECT username, role, created_at 
FROM profiles 
WHERE username IN ('user1', 'user2', 'user3', 'user4');
```

### 第五步：登录测试
使用user1/123456登录，确认可以访问管理后台。

---

## 快速验证清单

使用以下清单快速定位问题：

- [ ] 账号是否已注册？
  - 在Supabase控制台 Authentication > Users 中查看
  - 应该能看到 user1@miaoda.com 等邮箱

- [ ] 密码是否正确？
  - 确认密码为 `123456`
  - 没有多余空格

- [ ] 角色是否设置为管理员？
  - 在Supabase Table Editor > profiles 中查看
  - role字段应该是 'admin'

- [ ] 是否能正常登录？
  - 登录后能看到用户头像
  - 点击头像能看到用户菜单

- [ ] 是否能看到管理后台入口？
  - 用户菜单中有"管理后台"选项
  - 用户角色显示为"管理员"

- [ ] 是否能访问管理后台？
  - 可以访问 /admin 路径
  - 能看到组件管理、公告管理、用户管理三个标签

---

## 常见错误信息及解决方案

### 错误1：Invalid login credentials
**原因**：用户名或密码错误，或账号不存在

**解决**：
1. 确认账号已注册
2. 确认密码为123456
3. 确认用户名拼写正确

### 错误2：用户名只能包含字母、数字和下划线
**原因**：用户名格式不正确

**解决**：
- 使用 `user1` 而不是 `User1` 或 `user 1`

### 错误3：密码至少需要6个字符
**原因**：密码太短

**解决**：
- 确保密码为 `123456`（6个字符）

### 错误4：看不到管理后台菜单
**原因**：账号不是管理员

**解决**：
```sql
UPDATE profiles 
SET role = 'admin'::user_role 
WHERE username = 'user1';
```

---

## 测试脚本

在Supabase SQL Editor中运行以下脚本进行完整测试：

```sql
-- ============================================
-- 管理员账号测试脚本
-- ============================================

-- 1. 查看所有用户
SELECT 
  username,
  email,
  role,
  created_at
FROM profiles 
ORDER BY created_at DESC;

-- 2. 查看管理员账号是否存在
SELECT 
  username,
  role,
  CASE 
    WHEN role = 'admin'::user_role THEN '✅ 是管理员'
    WHEN role = 'user'::user_role THEN '❌ 是普通用户'
    ELSE '⚠️ 角色未知'
  END as status
FROM profiles 
WHERE username IN ('user1', 'user2', 'user3', 'user4')
ORDER BY username;

-- 3. 如果不是管理员，设置为管理员
UPDATE profiles 
SET role = 'admin'::user_role 
WHERE username IN ('user1', 'user2', 'user3', 'user4')
  AND role != 'admin'::user_role;

-- 4. 最终验证
SELECT 
  COUNT(*) as admin_count,
  STRING_AGG(username, ', ') as admin_usernames
FROM profiles 
WHERE role = 'admin'::user_role
  AND username IN ('user1', 'user2', 'user3', 'user4');

-- 预期结果：admin_count = 4, admin_usernames = 'user1, user2, user3, user4'
```

---

## 联系支持

如果以上方法都无法解决问题，请提供以下信息：

1. 错误信息截图
2. 浏览器控制台错误（F12 > Console）
3. 以下SQL查询结果：
```sql
SELECT username, role FROM profiles 
WHERE username IN ('user1', 'user2', 'user3', 'user4');
```

---

## 相关文档

- `ADMIN_ACCOUNTS_SETUP.md` - 管理员账号设置指南
- `ADMIN_FEATURES.md` - 管理员功能说明
- `setup_admin_accounts.sql` - SQL设置脚本

---

**按照本指南操作，管理员账号应该可以正常登录！** ✅
