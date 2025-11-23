# 服务器部署步骤

## 1. 上传文件到服务器
将以下文件上传到服务器（例如 `/var/www/ai-glasses`）：
- 整个项目文件夹

## 2. 安装依赖
```bash
cd /var/www/ai-glasses
npm install
```

## 3. 构建项目
```bash
npm run build
```

## 4. 配置环境变量
创建 `.env` 文件：
```bash
VITE_SUPABASE_URL=https://eycpynraqzmmwnbfafid.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5Y3B5bnJhcXptbXduYmZhZmlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NTgxNTMsImV4cCI6MjA3OTQzNDE1M30.uN3mclA5_Z2tdIa8rLeBdiN0skQznYW_NkxhayuBtMk
PORT=3000
```

## 5. 配置 PM2（进程守护）
```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start server.js --name ai-glasses

# 设置开机自启
pm2 startup
pm2 save
```

## 6. 配置 Nginx
将 `nginx.conf` 文件内容复制到：
```bash
/etc/nginx/sites-available/ai-glasses
```

修改配置中的域名，然后：
```bash
# 创建软链接
ln -s /etc/nginx/sites-available/ai-glasses /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重启 Nginx
systemctl restart nginx
```

## 7. 配置 SSL（可选但推荐）
```bash
# 安装 certbot
apt install certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d your-domain.com
```

## 8. 查看运行状态
```bash
# 查看 PM2 状态
pm2 status

# 查看日志
pm2 logs ai-glasses

# 重启应用
pm2 restart ai-glasses
```

## 常用命令
```bash
# 停止应用
pm2 stop ai-glasses

# 删除应用
pm2 delete ai-glasses

# 查看实时日志
pm2 logs ai-glasses --lines 100
```
