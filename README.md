# AI眼镜组件发布平台

一个专为蓝牙智能AI眼镜用户打造的组件发布与分享平台，基于现代化的Web技术栈构建。

## 技术栈

- **前端**: React 18 + TypeScript + Vite
- **UI框架**: shadcn/ui + Tailwind CSS
- **后端服务**: Supabase (数据库 + 认证 + 存储)
- **AI集成**: 百度AI API (图片生成、AI搜索、网页内容总结)

## 核心功能

### 1. 用户系统
- 注册/登录功能，无需邮箱验证
- 角色管理（普通用户/管理员）
- 个人中心，支持个人信息管理

### 2. 组件管理
- 组件发布与分享
- 分类筛选与搜索
- 组件详情查看
- 下载统计
- 评论与评分
- 收藏功能

### 3. 管理后台
- 组件审核流程
- 公告发布与管理
- 用户管理

### 4. AI工具箱
- **图片生成**: 使用AI作画-iRAG版接口，支持详细描述和参考图片
- **AI搜索**: 实时流式搜索结果返回
- **网页内容总结**: 智能提取网页关键信息

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-username/ai-glasses-components-platform.git
cd ai-glasses-components-platform
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 文件为 `.env`，并填写相应的配置信息：

```bash
cp .env.example .env
# 编辑 .env 文件，填写你的 API 密钥
```

### 4. 启动开发服务器

```bash
npm run dev
```

### 5. 构建生产版本

```bash
npm run build
```

## 环境变量配置

项目需要配置以下环境变量：

- **Supabase配置**
  - `VITE_SUPABASE_URL`: Supabase项目URL
  - `VITE_SUPABASE_ANON_KEY`: Supabase匿名访问密钥

- **讯飞星火API配置（前端）**
  - `VITE_SPARK_APP_ID`: 讯飞星火App ID
  - `VITE_SPARK_API_SECRET`: 讯飞星火API密钥
  - `VITE_SPARK_API_KEY`: 讯飞星火API Key

- **讯飞星火API配置（后端）**
  - `SPARK_APP_ID`: 讯飞星火App ID
  - `SPARK_API_SECRET`: 讯飞星火API密钥
  - `SPARK_API_KEY`: 讯飞星火API Key

- **阿里云API配置（后端）**
  - `ALIYUN_API_KEY`: 阿里云API密钥

## 数据库设置

项目使用Supabase作为数据库，需要创建以下表：

- `profiles`: 用户信息表
- `components`: 组件表
- `comments`: 评论表
- `favorites`: 收藏表
- `announcements`: 公告表

详细的数据库迁移文件可以在 `supabase/migrations/` 目录中找到。

## 管理员设置

要设置管理员账户，请参考 `ADMIN_SETUP.md` 文件中的说明。

## 项目结构

```
├── src/
│   ├── components/      # React组件
│   ├── db/             # 数据库API封装
│   ├── hooks/          # 自定义Hooks
│   ├── lib/            # 工具库（AI API等）
│   ├── pages/          # 页面组件
│   ├── services/       # 服务层
│   ├── types/          # TypeScript类型定义
│   ├── App.tsx         # 应用入口
│   └── routes.tsx      # 路由配置
├── supabase/           # 数据库迁移与配置
├── api/                # API端点
└── components/         # 示例组件
```

## 贡献指南

欢迎提交Issue和Pull Request！请确保遵循以下规范：

1. 代码风格：使用项目现有的代码风格
2. 提交信息：清晰描述你的更改
3. 测试：确保你的更改不会破坏现有功能

## 许可证

MIT License

## 联系方式

如有问题或建议，请通过GitHub Issues联系我们。
