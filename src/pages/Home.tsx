import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, TrendingUp, Sparkles, Upload, BookOpen, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ComponentCard } from '@/components/common/ComponentCard';
import { componentsApi, announcementsApi } from '@/db/api';
import type { ComponentWithAuthor, AnnouncementWithAuthor } from '@/types/types';


export default function Home() {
  const [components, setComponents] = useState<ComponentWithAuthor[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadComponents();
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const data = await announcementsApi.getAnnouncements(true);
      setAnnouncements(data.slice(0, 3));
    } catch (error: any) {
      console.error('加载公告失败:', error);
    }
  };

  const loadComponents = async () => {
    try {
      const data = await componentsApi.getComponents({
        status: 'approved',
        pageSize: 6
      });
      setComponents(data);
    } catch (error: any) {
      console.error('加载组件失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/components?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              AI眼镜组件发布平台
            </h1>
            <p className="text-xl text-muted-foreground">
              专为蓝牙智能AI眼镜用户打造的组件发布与分享平台
            </p>
            <div className="flex gap-2 max-w-xl mx-auto">
              <Input
                placeholder="搜索组件..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                搜索
              </Button>
            </div>
            <div className="flex gap-4 justify-center pt-4 flex-wrap">
              <Button asChild size="lg">
                <Link to="/components">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  浏览组件
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/publish">
                  <Upload className="h-5 w-5 mr-2" />
                  发布组件
                </Link>
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" variant="secondary">
                    <BookOpen className="h-5 w-5 mr-2" />
                    开发文档
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>AI眼镜组件开发文档</DialogTitle>
                    <DialogDescription>
                      查看详细的开发指南和API文档
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="border border-border rounded-lg p-4 space-y-2">
                      <h3 className="font-semibold text-lg">📚 使用指南</h3>
                      <p className="text-sm text-muted-foreground">
                        查看平台使用说明，了解如何注册、发布组件、使用AI工具等功能
                      </p>
                      <Button asChild variant="outline" className="w-full">
                        <Link to="/dev-doc">
                          查看使用指南
                        </Link>
                      </Button>
                    </div>
                    
                    <div className="border border-border rounded-lg p-4 space-y-2">
                      <h3 className="font-semibold text-lg">🛠️ AI工具箱</h3>
                      <p className="text-sm text-muted-foreground">
                        使用AI对话、搜索、网页总结和图片生成工具辅助开发
                      </p>
                      <Button asChild variant="outline" className="w-full">
                        <Link to="/ai-tools">
                          打开AI工具箱
                        </Link>
                      </Button>
                    </div>

                    <div className="border border-border rounded-lg p-4 space-y-2">
                      <h3 className="font-semibold text-lg">💡 快速开始</h3>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>注册账号后即可发布组件</li>
                        <li>管理员需要在数据库中手动设置</li>
                        <li>组件需要审核通过后才会公开显示</li>
                        <li>使用AI工具辅助编写组件描述和生成封面图</li>
                      </ul>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </section>

      {announcements.length > 0 && (
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-4">
              <Megaphone className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">平台公告</h2>
            </div>
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <Alert key={announcement.id} className={
                  announcement.priority === 'high' ? 'border-destructive' :
                  announcement.priority === 'normal' ? 'border-primary' : 'border-border'
                }>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <AlertTitle className="flex items-center gap-2">
                        {announcement.title}
                        {announcement.priority === 'high' && (
                          <Badge variant="destructive" className="text-xs">重要</Badge>
                        )}
                      </AlertTitle>
                      <AlertDescription className="mt-2 text-sm">
                        {announcement.content}
                      </AlertDescription>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(announcement.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">热门组件</h2>
            <Button asChild variant="ghost">
              <Link to="/components">查看全部 →</Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : components.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {components.map((component) => (
                <ComponentCard key={component.id} component={component} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              暂无组件
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-accent/5">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">平台特色</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">便捷发布</h3>
              <p className="text-muted-foreground">
                简单快速地发布和分享您的AI眼镜组件
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">AI辅助</h3>
              <p className="text-muted-foreground">
                集成多种AI工具，辅助组件开发和文档编写
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">社区互动</h3>
              <p className="text-muted-foreground">
                评论、评分、收藏，与开发者社区互动交流
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
