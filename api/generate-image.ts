const ALIYUN_CONFIG = {
  apiKey: 'sk-e8449026027e4526b12ab3d19ae7b8db',
  apiUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis'
};

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

    const response = await fetch(ALIYUN_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ALIYUN_CONFIG.apiKey}`,
        'X-DashScope-Async': 'enable'
      },
      body: JSON.stringify({
        model: 'wanx-v1',
        input: {
          prompt: prompt
        },
        parameters: {
          size: '512*512',
          n: 1
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Aliyun API Error:', error);
      
      const imageUrl = `https://via.placeholder.com/512x512/6366f1/ffffff?text=${encodeURIComponent('AI图片生成')}`;
      return res.status(200).json({ 
        imageUrl,
        message: '使用占位图片（API调用失败）'
      });
    }

    const data = await response.json();
    
    if (data.output?.task_status === 'PENDING' || data.output?.task_status === 'RUNNING') {
      const taskId = data.output.task_id;
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const resultResponse = await fetch(`${ALIYUN_CONFIG.apiUrl}/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ALIYUN_CONFIG.apiKey}`
        }
      });
      
      const resultData = await resultResponse.json();
      
      if (resultData.output?.task_status === 'SUCCEEDED') {
        const imageUrl = resultData.output.results[0].url;
        return res.status(200).json({ 
          imageUrl,
          message: '图片生成成功'
        });
      }
    }
    
    if (data.output?.results?.[0]?.url) {
      return res.status(200).json({ 
        imageUrl: data.output.results[0].url,
        message: '图片生成成功'
      });
    }

    const imageUrl = `https://via.placeholder.com/512x512/6366f1/ffffff?text=${encodeURIComponent('生成中')}`;
    return res.status(200).json({ 
      imageUrl,
      message: '图片生成中，请稍后重试'
    });
  } catch (error: any) {
    console.error('Image generation error:', error);
    const imageUrl = `https://via.placeholder.com/512x512/6366f1/ffffff?text=${encodeURIComponent('生成出错')}`;
    return res.status(200).json({ 
      imageUrl,
      message: error.message || '生成失败'
    });
  }
}
