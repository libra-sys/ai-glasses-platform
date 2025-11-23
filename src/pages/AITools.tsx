import { useState } from 'react';
import { Sparkles, Send, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { sendChatStream, generateComponentImage } from '@/lib/spark-api';
import { toast } from 'sonner';

export default function AITools() {
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const [imageLoading, setImageLoading] = useState(false);

  const handleChat = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      await sendChatStream({
        messages: [{ role: 'user', content: userMessage }],
        onUpdate: (content) => {
          setChatMessages(prev => {
            const newMessages = [...prev];
            if (newMessages[newMessages.length - 1]?.role === 'assistant') {
              newMessages[newMessages.length - 1].content = content;
            } else {
              newMessages.push({ role: 'assistant', content });
            }
            return newMessages;
          });
        },
        onComplete: () => {
          setChatLoading(false);
        },
        onError: (error) => {
          toast.error(error.message || 'AI对话失败');
          setChatLoading(false);
        }
      });
    } catch (error: any) {
      toast.error(error.message || 'AI对话失败');
      setChatLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      toast.error('请输入图片描述');
      return;
    }

    setImageLoading(true);
    setGeneratedImage('');
    
    try {
      toast.info('正在生成图片，请稍候...');
      const imageUrl = await generateComponentImage(imagePrompt);
      setGeneratedImage(imageUrl);
      toast.success('图片生成完成！');
    } catch (error: any) {
      console.error('图片生成失败:', error);
      toast.error(error.message || '图片生成失败，请稍后重试');
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-foreground mb-8">AI助手</h1>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">
              <Sparkles className="h-4 w-4 mr-2" />
              组件描述
            </TabsTrigger>
            <TabsTrigger value="image">
              <ImageIcon className="h-4 w-4 mr-2" />
              封面图生成
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  组件描述助手
                </CardTitle>
                <CardDescription>辅助编写组件描述和文档</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-96 overflow-y-auto border border-border rounded-lg p-4 space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>开始对话，我可以帮你编写组件描述</p>
                      </div>
                    </div>
                  ) : (
                    chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-3 ${
                          msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <Textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="例如：帮我写一个实时翻译组件的描述，支持中英日韩四种语言..."
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleChat())}
                    rows={3}
                  />
                  <Button onClick={handleChat} disabled={chatLoading} size="icon" className="h-auto">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="image">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  组件封面图生成
                </CardTitle>
                <CardDescription>使用 AI 生成组件封面图</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="描述你想生成的图片，例如：一个智能眼镜的现代科技风格图标，蓝色主色调"
                    rows={4}
                  />
                </div>
                <Button 
                  onClick={handleGenerateImage} 
                  disabled={imageLoading}
                  className="w-full"
                >
                  {imageLoading ? '生成中...' : '生成图片'}
                </Button>
                {generatedImage && (
                  <div className="border border-border rounded-lg p-4">
                    <img 
                      src={generatedImage} 
                      alt="Generated" 
                      className="w-full rounded-lg"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
