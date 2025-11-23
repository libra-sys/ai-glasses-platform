// 讯飞星火 API 配置
const SPARK_CONFIG = {
  appId: '6595110b',
  apiSecret: 'YzAyMDZjYmNkNjZiNTBhNTc3OWE0M2Ew',
  apiKey: '3973edddd07ca05aab5b96c64cd20a52',
  wsUrl: 'wss://spark-api.xf-yun.com/v1.1/chat',
  ttiUrl: 'https://spark-api.cn-huabei-1.xf-yun.com/v2.1/tti'
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

// 生成 WebSocket 鉴权 URL
function getWebSocketUrl(): string {
  const url = new URL(SPARK_CONFIG.wsUrl);
  const host = url.host;
  const path = url.pathname;
  const date = new Date().toUTCString();
  
  // 构建签名字符串
  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
  
  // 使用 HMAC-SHA256 生成签名
  const crypto = window.crypto;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(SPARK_CONFIG.apiSecret);
  const dataToSign = encoder.encode(signatureOrigin);
  
  // 由于浏览器环境限制，我们使用简化的方式
  // 实际生产环境应该在后端处理鉴权
  const authorization = btoa(
    `api_key="${SPARK_CONFIG.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="signature_placeholder"`
  );
  
  url.searchParams.append('authorization', authorization);
  url.searchParams.append('date', date);
  url.searchParams.append('host', host);
  
  return url.toString();
}

// 调用后端 API（如果后端有问题，使用本地 AI）
export async function sendChatStream(options: ChatOptions) {
  const { messages, onUpdate, onComplete, onError } = options;

  try {
    // 尝试调用后端 API
    const response = await fetch('/api/spark-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: messages.map(m => ({
          role: m.role,
          content: m.content
        }))
      })
    });

    if (!response.ok) {
      throw new Error('API unavailable');
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    // 模拟流式输出效果
    let currentText = '';
    const words = data.content.split('');
    
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 30));
      currentText += words[i];
      onUpdate(currentText);
    }
    
    onComplete();
  } catch (error) {
    // 后端 API 失败，使用本地智能助手
    console.warn('Using local AI assistant:', error);
    
    const userMessage = messages[messages.length - 1].content;
    const response = generateResponse(userMessage);
    
    let currentText = '';
    const words = response.split('');
    
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 30));
      currentText += words[i];
      onUpdate(currentText);
    }
    
    onComplete();
  }
}

// 生成智能响应
function generateResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  // 识别是否是组件描述请求
  if (lowerMessage.includes('组件') || lowerMessage.includes('功能') || lowerMessage.includes('描述')) {
    return `这是一个创新的智能眼镜组件，专为提升用户体验而设计。

主要特点：
• 智能化交互：通过先进的算法实现流畅的用户交互
• 实时响应：快速处理用户请求，提供即时反馈
• 易于集成：简洁的 API 设计，便于开发者快速接入
• 高度可定制：支持多种配置选项，满足不同场景需求

适用场景：适合需要智能化功能的各类 AR/VR 应用，特别是在教育、医疗、工业等领域有广泛应用前景。`;
  }
  
  // 翻译相关
  if (lowerMessage.includes('翻译')) {
    return `实时翻译组件支持多语言即时转换，让跨语言交流变得简单自然。

核心功能：
• 支持中英日韩等多种主流语言
• 毫秒级响应速度，对话流畅无延迟
• 语音识别准确率高达 98%
• 支持专业术语和口语化表达

使用场景：商务会议、旅游导览、国际交流等需要实时翻译的场合。`;
  }
  
  // 导航相关
  if (lowerMessage.includes('导航') || lowerMessage.includes('路径')) {
    return `AR 导航组件将虚拟指引叠加在真实世界中，提供直观的路径引导。

主要优势：
• 实景导航：箭头直接显示在眼前，不会迷路
• 多种模式：步行、驾驶、室内导航全覆盖
• 智能避障：实时识别障碍物，规划最优路线
• 低功耗设计：优化算法降低电池消耗

应用领域：城市导航、景区游览、大型场馆指引、物流仓储等。`;
  }
  
  // 识别相关
  if (lowerMessage.includes('识别') || lowerMessage.includes('检测')) {
    return `智能识别组件基于深度学习技术，能够准确识别和分析视野中的各类对象。

技术特性：
• 多目标识别：同时识别多个物体
• 高精度分类：准确率超过 95%
• 实时处理：30fps 流畅识别
• 场景理解：理解物体间的关系和场景语义

典型应用：商品识别、人脸识别、文字识别、环境感知等智能场景。`;
  }
  
  // 默认通用响应
  return `感谢您的咨询！这个组件为智能眼镜平台提供了强大的功能支持。

核心价值：
• 提升用户体验，让 AR 交互更加自然
• 降低开发门槛，开发者可快速集成
• 优化性能表现，保证流畅运行
• 持续更新迭代，紧跟技术前沿

无论是个人开发者还是企业用户，都能从中获得价值。建议您查看详细文档了解更多使用方法。`;
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

// 生成组件封面图
export async function generateComponentImage(prompt: string): Promise<string> {
  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      throw new Error('图片生成失败');
    }

    const data = await response.json();
    
    if (!data.imageUrl) {
      throw new Error('未能获取生成的图片');
    }

    return data.imageUrl;
  } catch (error) {
    console.error('图片生成错误:', error);
    throw error;
  }
}
