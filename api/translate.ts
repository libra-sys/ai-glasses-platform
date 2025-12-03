const ALIYUN_CONFIG = {
  apiKey: 'sk-2ca3ccbc4c7944748f46bae80a33fa5b',
  apiUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/translation/translation'
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
    const { text, source, target } = req.body;

    if (!text) {
      return res.status(400).json({ error: '请提供要翻译的文本' });
    }

    const response = await fetch(ALIYUN_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ALIYUN_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        input: {
          messages: [
            {
              role: 'system',
              content: `你是一个专业的翻译助手。将用户输入的文本从${getLanguageName(source)}翻译成${getLanguageName(target)}。只返回翻译结果，不要添加任何解释。`
            },
            {
              role: 'user',
              content: text
            }
          ]
        },
        parameters: {
          result_format: 'text'
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Translation API Error:', error);
      throw new Error('翻译服务暂时不可用');
    }

    const data = await response.json();
    
    const translatedText = data.output?.text || data.output?.choices?.[0]?.message?.content || '';
    
    if (!translatedText) {
      throw new Error('未能获取翻译结果');
    }

    return res.status(200).json({ 
      translatedText,
      source,
      target
    });
  } catch (error: any) {
    console.error('Translation error:', error);
    return res.status(500).json({ error: error.message || '翻译失败' });
  }
}

function getLanguageName(code: string): string {
  const langMap: Record<string, string> = {
    'zh': '中文',
    'en': '英语',
    'ja': '日语',
    'ko': '韩语',
    'es': '西班牙语',
    'fr': '法语',
    'de': '德语',
    'ru': '俄语'
  };
  return langMap[code] || code;
}
