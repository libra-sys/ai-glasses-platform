import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as crypto from 'crypto';
import WebSocket from 'ws';

const SPARK_CONFIG = {
  appId: '6595110b',
  apiSecret: 'YzAyMDZjYmNkNjZiNTBhNTc3OWE0M2Ew',
  apiKey: '3973edddd07ca05aab5b96c64cd20a52',
  wsUrl: 'wss://spark-api.xf-yun.com/chat/max-32k'
};

// 生成鉴权 URL
function getAuthUrl(): string {
  const url = new URL(SPARK_CONFIG.wsUrl);
  const host = url.host;
  const path = url.pathname;
  const date = new Date().toUTCString();

  // 构建签名字符串
  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
  
  // HMAC-SHA256 签名
  const signature = crypto
    .createHmac('sha256', SPARK_CONFIG.apiSecret)
    .update(signatureOrigin)
    .digest('base64');

  // 构建 authorization
  const authorizationOrigin = `api_key="${SPARK_CONFIG.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
  const authorization = Buffer.from(authorizationOrigin).toString('base64');

  // 构建完整 URL
  return `${SPARK_CONFIG.wsUrl}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${host}`;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages' });
  }

  try {
    const wsUrl = getAuthUrl();
    const ws = new WebSocket(wsUrl);

    let fullResponse = '';

    ws.on('open', () => {
      const requestData = {
        header: {
          app_id: SPARK_CONFIG.appId,
          uid: 'user_' + Date.now()
        },
        parameter: {
          chat: {
            domain: 'max-32k',
            temperature: 0.8,
            max_tokens: 2048
          }
        },
        payload: {
          message: {
            text: messages
          }
        }
      };

      ws.send(JSON.stringify(requestData));
    });

    ws.on('message', (data: any) => {
      try {
        const response = JSON.parse(data.toString());
        
        if (response.header.code !== 0) {
          ws.close();
          return res.status(500).json({ error: response.header.message });
        }

        const text = response.payload?.choices?.text || [];
        text.forEach((item: any) => {
          fullResponse += item.content;
        });

        // 如果是最后一条消息
        if (response.header.status === 2) {
          ws.close();
          return res.status(200).json({ 
            content: fullResponse,
            usage: response.payload?.usage
          });
        }
      } catch (error) {
        ws.close();
        return res.status(500).json({ error: 'Parse error' });
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      return res.status(500).json({ error: 'WebSocket connection failed' });
    });

    ws.on('close', () => {
      if (fullResponse && !res.headersSent) {
        return res.status(200).json({ content: fullResponse });
      }
    });

  } catch (error: any) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
