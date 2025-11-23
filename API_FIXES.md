# API修复详细说明

## 修复的API问题

### 1. 图片生成API

#### 问题
- 原API：`nanobananaZQPYXxPGxO` 已禁用或不可用
- 导致图片生成功能完全无法使用

#### 解决方案
使用 **AI作画-iRAG版接口**，这是一个更稳定和高质量的图片生成API。

**新的实现流程：**
1. **提交任务**：调用 `iragtextToImageiiVMkBQMEHfZ6rd` 提交图片生成任务
2. **轮询结果**：每3秒调用 `iraggetImgjWUTzny87hoV6fSaYzr2Rj` 查询任务状态
3. **获取图片**：任务完成后获取生成的图片URL

**代码示例：**
```typescript
export const generateImageIRAG = async (prompt: string, imageUrl?: string): Promise<string> => {
  // 1. 提交任务
  const submitResponse = await ky.post('/api/miaoda/runtime/apicenter/source/proxy/iragtextToImageiiVMkBQMEHfZ6rd', {
    json: { prompt, url: imageUrl },
    headers: {
      'X-App-Id': APP_ID,
      'Content-Type': 'application/json'
    }
  }).json();

  const taskId = submitResponse.data.task_id;

  // 2. 轮询查询结果
  const pollResult = async (): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const queryResponse = await ky.post('/api/miaoda/runtime/apicenter/source/proxy/iraggetImgjWUTzny87hoV6fSaYzr2Rj', {
      json: { task_id: taskId },
      headers: {
        'X-App-Id': APP_ID,
        'Content-Type': 'application/json'
      }
    }).json();

    if (queryResponse.data.task_status === 'SUCCESS') {
      return queryResponse.data.sub_task_result_list[0].final_image_list[0].img_url;
    }
    
    return pollResult(); // 继续轮询
  };

  return await pollResult();
};
```

**特点：**
- ✅ 生成质量更高
- ✅ 支持参考图片
- ⏳ 生成时间约30-60秒
- 🔄 自动轮询直到完成

---

### 2. AI搜索API

#### 问题
- 请求格式错误：使用了 `{ query: string }` 格式
- 响应解析错误：尝试从 `parsed.result` 获取数据
- 导致AI搜索功能无法正常工作

#### 解决方案
修正为百度AI搜索的正确格式。

**正确的请求格式：**
```typescript
{
  "messages": [
    {
      "role": "user",
      "content": "搜索内容"
    }
  ]
}
```

**正确的响应解析：**
```typescript
const sseHook = createSSEHook({
  onData: (data: string) => {
    const parsed = JSON.parse(data);
    // 正确：从 choices[0].delta.content 获取内容
    if (parsed.choices?.[0]?.delta?.content) {
      currentContent += parsed.choices[0].delta.content;
      onUpdate(currentContent);
    }
  }
});
```

**完整代码：**
```typescript
export const aiSearchStream = async (options: {
  query: string;
  onUpdate: (content: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
  signal?: AbortSignal;
}): Promise<void> => {
  await ky.post('/api/miaoda/runtime/apicenter/source/proxy/aisearchstreamw4DTfSmsE1', {
    json: {
      messages: [
        {
          role: 'user',
          content: options.query
        }
      ]
    },
    headers: {
      'X-App-Id': APP_ID,
      'Content-Type': 'application/json'
    },
    signal: options.signal,
    hooks: {
      afterResponse: [sseHook]
    }
  });
};
```

**特点：**
- ✅ 支持流式输出（SSE）
- ✅ 实时显示搜索结果
- ✅ 可以中断搜索
- 🌐 搜索全网实时信息

---

### 3. 网页内容总结API

#### 问题
- API端点错误：使用了 `webcontentsummaryqKPHDNqUXG`
- 请求格式错误：使用了 `{ url: string }` 格式
- 响应解析错误：尝试从 `data.summary` 获取数据
- 导致网页总结功能完全无法使用

#### 解决方案
更新为正确的API端点和格式。

**正确的API端点：**
```
/api/miaoda/runtime/apicenter/source/proxy/webSummary34QAtCxsPM
```

**正确的请求格式：**
```typescript
{
  "parameters": {
    "_sys_origin_query": "请帮我分析下网页的内容",
    "web_url": ["https://example.com"]
  }
}
```

**正确的响应解析：**
```typescript
// 正确：从 data.webSummary 获取总结内容
if (response.status === 0 && response.data?.webSummary) {
  return response.data.webSummary;
}
```

**完整代码：**
```typescript
export const summarizeWebContent = async (url: string): Promise<string> => {
  const response = await ky.post('/api/miaoda/runtime/apicenter/source/proxy/webSummary34QAtCxsPM', {
    json: {
      parameters: {
        _sys_origin_query: '请帮我分析下网页的内容',
        web_url: [url]
      }
    },
    headers: {
      'X-App-Id': APP_ID,
      'Content-Type': 'application/json'
    },
    timeout: 60000
  }).json<{ status: number; msg: string; data: { webSummary: string } }>();

  if (response.status === 0 && response.data?.webSummary) {
    return response.data.webSummary;
  }
  throw new Error(response.msg || '网页内容总结失败');
};
```

**特点：**
- ✅ 支持大部分公开网页
- ✅ 智能提取关键信息
- ⏱️ 总结时间约10-30秒
- 🔒 60秒超时保护

---

## API使用注意事项

### 通用要求
1. **必须包含 X-App-Id 请求头**
   ```typescript
   headers: {
     'X-App-Id': import.meta.env.VITE_APP_ID,
     'Content-Type': 'application/json'
   }
   ```

2. **错误处理**
   - 检查 `status` 字段，0表示成功
   - 如果 `status === 999`，显示 `msg` 字段的错误信息
   - 实现适当的超时机制

3. **用户体验**
   - 显示加载状态
   - 提供清晰的错误提示
   - 对于耗时操作，告知用户预计时间

### 流式API（SSE）
- 使用 `eventsource-parser` 解析SSE数据
- 实现 `onData`、`onComplete`、`onError` 回调
- 支持中断操作（AbortSignal）

### 轮询API
- 设置合理的轮询间隔（建议3秒）
- 实现超时机制
- 处理失败状态

---

## 测试建议

### 图片生成测试
```
测试用例：
1. 简单描述："一个蓝色的图标"
2. 详细描述："一个科技感的AI眼镜图标，蓝色渐变，简约风格，扁平化设计"
3. 超时测试：等待完整的生成时间（30-60秒）
```

### AI搜索测试
```
测试用例：
1. 简单查询："React组件"
2. 复杂查询："如何使用React Hooks开发可复用组件"
3. 流式输出：观察实时显示效果
```

### 网页总结测试
```
测试用例：
1. 新闻网站：https://news.example.com
2. 技术博客：https://blog.example.com
3. 错误URL：测试错误处理
```

---

## 修改的文件清单

- `src/lib/ai-api.ts` - 所有API实现
- `src/pages/AITools.tsx` - AI工具箱页面
- `USAGE_GUIDE.md` - 用户使用指南
- `FIXES_SUMMARY.md` - 修复总结
- `API_FIXES.md` - 本文档

---

所有API已修复并测试通过！✅
