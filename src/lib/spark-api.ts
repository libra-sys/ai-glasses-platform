// 讯飞星火 API 配置
const SPARK_CONFIG = {
  appId: '6595110b',
  apiSecret: 'YzAyMDZjYmNkNjZiNTBhNTc3OWE0M2Ew',
  apiKey: '3973edddd07ca05aab5b96c64cd20a52',
  chatUrl: 'https://spark-api-open.xf-yun.com/v1/chat/completions'
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatOptions {
  messages: ChatMessage[];
  onUpdate: (content: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

// AI 对话流式接口
export async function sendChatStream(options: ChatOptions) {
  const { messages, onUpdate, onComplete, onError } = options;

  try {
    const response = await fetch(SPARK_CONFIG.chatUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'generalv3.5',
        messages,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    if (!reader) {
      throw new Error('无法读取响应流');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            onComplete();
            return;
          }

          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content || '';
            if (content) {
              fullContent += content;
              onUpdate(fullContent);
            }
          } catch (e) {
            console.error('解析 JSON 失败:', e);
          }
        }
      }
    }

    onComplete();
  } catch (error) {
    onError(error as Error);
  }
}

// 辅助生成组件描述
export async function generateComponentDescription(componentName: string, features: string[]) {
  return new Promise<string>((resolve, reject) => {
    const prompt = `请为以下智能眼镜组件生成简洁的描述：
组件名称：${componentName}
主要功能：${features.join('、')}

要求：
1. 描述要简洁明了，不超过100字
2. 突出组件的核心价值和应用场景
3. 使用专业但易懂的语言`;

    let result = '';

    sendChatStream({
      messages: [{ role: 'user', content: prompt }],
      onUpdate: (content) => {
        result = content;
      },
      onComplete: () => {
        resolve(result);
      },
      onError: (error) => {
        reject(error);
      }
    });
  });
}
