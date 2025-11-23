import crypto from 'crypto';
import { URL } from 'url';

const SPARK_CONFIG = {
  appId: '6595110b',
  apiSecret: 'YzAyMDZjYmNkNjZiNTBhNTc3OWE0M2Ew',
  apiKey: '3973edddd07ca05aab5b96c64cd20a52',
  imageUrl: 'https://spark-api.cn-huabei-1.xf-yun.com/v2.1/tti'
};

function getAuthHeader(): string {
  const date = new Date().toUTCString();
  const url = new URL(SPARK_CONFIG.imageUrl);
  const host = url.host;
  const path = url.pathname;
  
  const signatureOrigin = `host: ${host}\ndate: ${date}\nPOST ${path} HTTP/1.1`;
  
  const signature = crypto
    .createHmac('sha256', SPARK_CONFIG.apiSecret)
    .update(signatureOrigin)
    .digest('base64');
  
  const authorizationOrigin = `api_key="${SPARK_CONFIG.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
  const authorization = Buffer.from(authorizationOrigin).toString('base64');
  
  return `${date}|${authorization}`;
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

    const authHeader = getAuthHeader();
    const [date, authorization] = authHeader.split('|');

    const response = await fetch(SPARK_CONFIG.imageUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorization,
        'Date': date,
        'Host': 'spark-api.cn-huabei-1.xf-yun.com'
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
      throw new Error('图片生成失败');
    }

    const data = await response.json();
    
    if (data.header?.code !== 0) {
      throw new Error(data.header?.message || '图片生成失败');
    }

    const imageData = data.payload?.choices?.text?.[0]?.content;
    if (!imageData) {
      throw new Error('未能获取生成的图片');
    }

    return res.status(200).json({ 
      imageUrl: `data:image/png;base64,${imageData}`,
      message: '图片生成成功'
    });
  } catch (error: any) {
    console.error('Image generation error:', error);
    return res.status(500).json({ error: error.message });
  }
}
