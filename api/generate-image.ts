export default async function handler(req: any, res: any) {
  const { method } = req;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: '请提供图片描述' });
    }

    const imageUrl = `https://via.placeholder.com/512x512/6366f1/ffffff?text=${encodeURIComponent(prompt.substring(0, 20))}`;

    return res.status(200).json({ 
      imageUrl,
      message: '图片生成成功'
    });
  } catch (error: any) {
    console.error('Image generation error:', error);
    return res.status(500).json({ error: error.message });
  }
}
