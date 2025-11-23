import { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { sendChatStream } from '@/lib/spark-api';
import { toast } from 'sonner';

export default function AITools() {
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-foreground mb-8">AI助手</h1>

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
      </div>
    </div>
  );
}
