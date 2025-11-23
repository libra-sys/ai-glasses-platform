import crypto from 'crypto';

const SPARK_CONFIG = {
  appId: '6595110b',
  apiSecret: 'YzAyMDZjYmNkNjZiNTBhNTc3OWE0M2Ew',
  apiKey: '3973edddd07ca05aab5b96c64cd20a52',
  imageUrl: 'https://spark-api.cn-huabei-1.xf-yun.com/v2.1/tti'
};

function getAuthUrl(): string {
  const date = new Date().toUTCString();
  const host = 'spark-api.cn-huabei-1.xf-yun.com';
  const path = '/v2.1/tti';
  
  const signatureOrigin = `host: ${host}\ndate: ${date}\nPOST ${path} HTTP/1.1`;
  
  const signature = crypto
    .createHmac('sha256', SPARK_CONFIG.apiSecret)
    .update(signatureOrigin)
    .digest('base64');
  
  const authorizationOrigin = `api_key="${SPARK_CONFIG.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
  const authorization = Buffer.from(authorizationOrigin).toString('base64');
  
  return `${SPARK_CONFIG.imageUrl}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${host}`;
}

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

    const authUrl = getAuthUrl();

    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        header: {
          app_id: SPARK_CONFIG.appId,
          uid: 'user_' + Date.now()
        },
        parameter: {
          chat: {
            domain: 'general',
            width: 512,
            height: 512
          }
        },
        payload: {
          message: {
            text: [
              {
                role: 'user',
                content: prompt
              }
            ]
          }
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Image API Error:', error);
      
      const imageUrl = `https://via.placeholder.com/512x512/6366f1/ffffff?text=${encodeURIComponent('AI图片生成')}`;
      return res.status(200).json({ 
        imageUrl,
        message: '使用占位图片（API调用失败）'
      });
    }

    const data = await response.json();
    
    if (data.header?.code !== 0) {
      console.error('Image API Response Error:', data);
      const imageUrl = `https://via.placeholder.com/512x512/6366f1/ffffff?text=${encodeURIComponent('生成失败')}`;
      return res.status(200).json({ 
        imageUrl,
        message: data.header?.message || '图片生成失败'
      });
    }

    const imageData = data.payload?.choices?.text?.[0]?.content;
    if (!imageData) {
      const imageUrl = `https://via.placeholder.com/512x512/6366f1/ffffff?text=${encodeURIComponent('无数据')}`;
      return res.status(200).json({ 
        imageUrl,
        message: '未能获取生成的图片'
      });
    }

    return res.status(200).json({ 
      imageUrl: `data:image/png;base64,${imageData}`,
      message: '图片生成成功'
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
