# Windows Server 2016 部署教程

## 前置要求
- Windows Server 2016
- 管理员权限
- 域名已解析到服务器 IP

## 第一步：安装 Node.js

1. 下载 Node.js：https://nodejs.org/dist/v18.20.0/node-v18.20.0-x64.msi
2. 双击安装，全部默认选项
3. 验证安装：
```powershell
node -v
npm -v
```

## 第二步：上传项目文件

**方法一：使用 Git**
```powershell
# 安装 Git：https://git-scm.com/download/win
# 克隆项目
cd C:\
git clone https://github.com/libra-sys/ai-glasses-platform.git
cd ai-glasses-platform
```

**方法二：使用 FTP**
- 将整个项目文件夹上传到 `C:\ai-glasses-platform`

## 第三步：安装依赖和构建

```powershell
cd C:\ai-glasses-platform
npm install
npm run build
```

## 第四步：配置环境变量

创建 `.env` 文件：
```powershell
notepad .env
```

填入内容：
```
VITE_SUPABASE_URL=https://eycpynraqzmmwnbfafid.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5Y3B5bnJhcXptbXduYmZhZmlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NTgxNTMsImV4cCI6MjA3OTQzNDE1M30.uN3mclA5_Z2tdIa8rLeBdiN0skQznYW_NkxhayuBtMk
PORT=3000
```

## 第五步：安装 PM2（进程守护）

```powershell
npm install -g pm2
npm install -g pm2-windows-startup

# 配置开机自启
pm2-startup install
```

## 第六步：启动应用

```powershell
cd C:\ai-glasses-platform
pm2 start server.js --name ai-glasses
pm2 save
```

## 第七步：安装 IIS 和配置反向代理

1. **安装 IIS**
   - 打开"服务器管理器"
   - 添加角色和功能
   - 选择"Web 服务器(IIS)"
   - 安装完成

2. **安装 URL Rewrite 和 ARR**
   - 下载 URL Rewrite：https://www.iis.net/downloads/microsoft/url-rewrite
   - 下载 ARR：https://www.iis.net/downloads/microsoft/application-request-routing
   - 依次安装

3. **配置反向代理**
   - 打开 IIS 管理器
   - 选择网站 → "URL 重写"
   - 添加规则 → "反向代理"
   - 输入：`localhost:3000`
   - 确定

4. **绑定域名**
   - 右键网站 → 编辑绑定
   - 添加绑定：
     - 类型：http
     - 主机名：help.hlw.work
     - 端口：80

## 第八步：配置 SSL（可选但推荐）

1. **获取 SSL 证书**
   - 使用阿里云/腾讯云免费证书
   - 或使用 Let's Encrypt

2. **导入证书到 IIS**
   - IIS 管理器 → 服务器证书
   - 导入证书
   - 绑定到网站（HTTPS/443端口）

## 第九步：配置防火墙

```powershell
# 允许 80 端口
New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow

# 允许 443 端口（如果使用 HTTPS）
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

## 常用管理命令

```powershell
# 查看应用状态
pm2 status

# 查看日志
pm2 logs ai-glasses

# 重启应用
pm2 restart ai-glasses

# 停止应用
pm2 stop ai-glasses

# 删除应用
pm2 delete ai-glasses
```

## 故障排查

**问题1：端口被占用**
```powershell
# 查看端口占用
netstat -ano | findstr :3000

# 结束进程
taskkill /PID <进程ID> /F
```

**问题2：PM2 无法启动**
```powershell
# 以管理员身份运行 PowerShell
# 设置执行策略
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**问题3：Node 模块错误**
```powershell
# 清除缓存重装
rm -r node_modules
npm cache clean --force
npm install
```

## 验证部署

访问：http://help.hlw.work

应该能看到网站正常运行。

## 自动更新脚本

创建 `update.ps1`：
```powershell
cd C:\ai-glasses-platform
git pull
npm install
npm run build
pm2 restart ai-glasses
```

需要更新时运行：
```powershell
.\update.ps1
```
