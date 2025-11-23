import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.static(join(__dirname, 'dist')));

// API 路由
import sparkChatHandler from './api/spark-chat.js';
import componentsHandler from './api/components.js';
import componentDownloadHandler from './api/components/[id]/download.js';

app.post('/api/spark-chat', async (req, res) => {
  try {
    await sparkChatHandler(req, res);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/components', async (req, res) => {
  try {
    await componentsHandler(req, res);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/components/:id/download', async (req, res) => {
  try {
    req.query = { ...req.query, id: req.params.id };
    await componentDownloadHandler(req, res);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// SPA 路由处理
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});
