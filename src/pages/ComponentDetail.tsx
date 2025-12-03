import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Download, Star, Heart, User, Calendar, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { componentsApi, commentsApi, favoritesApi } from '@/db/api';
import { useAuth } from '@/components/auth/AuthProvider';
import type { ComponentWithAuthor, CommentWithUser } from '@/types/types';
import { toast } from 'sonner';

export default function ComponentDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [component, setComponent] = useState<ComponentWithAuthor | null>(null);
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadComponent();
      loadComments();
      if (user) {
        checkFavorite();
        checkInstalled();
      }
    }
  }, [id, user]);

  const loadComponent = async () => {
    try {
      const data = await componentsApi.getComponent(id!);
      setComponent(data);
    } catch (error: any) {
      toast.error('加载组件失败');
      navigate('/components');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const data = await commentsApi.getComments(id!);
      setComments(data);
    } catch (error) {
      console.error('加载评论失败:', error);
    }
  };

  const checkFavorite = async () => {
    try {
      const result = await favoritesApi.isFavorite(user!.id, id!);
      setIsFavorite(result);
    } catch (error) {
      console.error('检查收藏状态失败:', error);
    }
  };

  const checkInstalled = async () => {
    try {
      const response = await fetch(`/api/user-components?userId=${user!.id}`);
      const result = await response.json();
      const installed = result.data?.some((c: any) => c.componentId === id);
      setIsInstalled(installed);
    } catch (error) {
      console.error('检查安装状态失败:', error);
    }
  };

  const handleDownload = async () => {
    if (!component?.file_url) {
      toast.error('组件文件不存在');
      return;
    }

    try {
      await componentsApi.incrementDownloadCount(id!);
      window.open(component.file_url, '_blank');
      toast.success('开始下载');
      loadComponent();
    } catch (error: any) {
      toast.error('下载失败');
    }
  };

  const handleInstall = async () => {
    if (!user) {
      toast.error('请先登录');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`/api/user-components?userId=${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          componentId: id
        })
      });

      if (!response.ok) {
        throw new Error('安装失败');
      }

      setIsInstalled(true);
      toast.success('已安装到我的眼镜，请在小程序中查看');
      
      // 增加下载计数
      await componentsApi.incrementDownloadCount(id!);
      loadComponent();
    } catch (error: any) {
      toast.error(error.message || '安装失败');
    }
  };

  const handleUninstall = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/user-components?userId=${user.id}&componentId=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('卸载失败');
      }

      setIsInstalled(false);
      toast.success('已从我的眼镜中移除');
    } catch (error: any) {
      toast.error(error.message || '卸载失败');
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      toast.error('请先登录');
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await favoritesApi.removeFavorite(user.id, id!);
        setIsFavorite(false);
        toast.success('已取消收藏');
      } else {
        await favoritesApi.addFavorite(user.id, id!);
        setIsFavorite(true);
        toast.success('已收藏');
      }
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('请先登录');
      navigate('/login');
      return;
    }

    if (!commentContent.trim()) {
      toast.error('请输入评论内容');
      return;
    }

    setSubmitting(true);
    try {
      await commentsApi.createComment({
        component_id: id!,
        user_id: user.id,
        content: commentContent,
        rating
      });
      toast.success('评论成功');
      setCommentContent('');
      setRating(5);
      loadComments();
    } catch (error: any) {
      toast.error(error.message || '评论失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!component) {
    return null;
  }

  const averageRating = comments.length > 0
    ? comments.reduce((sum, c) => sum + (c.rating || 0), 0) / comments.filter(c => c.rating).length
    : 0;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                {component.image_url && (
                  <img
                    src={component.image_url}
                    alt={component.name}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                    crossOrigin="anonymous"
                  />
                )}
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl mb-2">{component.name}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <Link to={`/profile?user=${component.author_id}`} className="hover:text-primary">
                          {component.author?.username}
                        </Link>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(component.created_at).toLocaleDateString()}
                      </div>
                      {component.version && (
                        <Badge variant="outline">v{component.version}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">组件描述</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {component.description || '暂无描述'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>评论 ({comments.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {user && (
                  <form onSubmit={handleSubmitComment} className="space-y-4 pb-6 border-b border-border">
                    <div>
                      <Label>评分</Label>
                      <Select value={rating.toString()} onValueChange={(v) => setRating(Number(v))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 4, 3, 2, 1].map((r) => (
                            <SelectItem key={r} value={r.toString()}>
                              {'⭐'.repeat(r)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>评论内容</Label>
                      <Textarea
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="分享您的使用体验..."
                        rows={4}
                      />
                    </div>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? '提交中...' : '发表评论'}
                    </Button>
                  </form>
                )}

                {comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="border-b border-border pb-4 last:border-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{comment.user?.username}</span>
                            {comment.rating && (
                              <div className="flex items-center gap-1 text-sm">
                                <Star className="h-4 w-4 fill-primary text-primary" />
                                <span>{comment.rating}</span>
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-muted-foreground whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">暂无评论</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>操作</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isInstalled ? (
                  <Button variant="destructive" className="w-full" onClick={handleUninstall}>
                    <Package className="h-4 w-4 mr-2" />
                    从我的眼镜移除
                  </Button>
                ) : (
                  <Button className="w-full" onClick={handleInstall}>
                    <Package className="h-4 w-4 mr-2" />
                    安装到我的眼镜
                  </Button>
                )}
                <Button variant="outline" className="w-full" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  下载组件文件
                </Button>
                <Button variant="outline" className="w-full" onClick={handleFavorite}>
                  <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-primary text-primary' : ''}`} />
                  {isFavorite ? '已收藏' : '收藏'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>统计信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">下载次数</span>
                  <span className="font-semibold">{component.download_count}</span>
                </div>
                {averageRating > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">平均评分</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="font-semibold">{averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">评论数</span>
                  <span className="font-semibold">{comments.length}</span>
                </div>
                {component.category && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">分类</span>
                    <Badge>{component.category}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
