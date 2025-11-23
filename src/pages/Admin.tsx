import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { componentsApi, profilesApi, announcementsApi } from '@/db/api';
import { useAuth } from '@/components/auth/AuthProvider';
import type { ComponentWithAuthor, Profile, AnnouncementWithAuthor, AnnouncementPriority } from '@/types/types';
import { toast } from 'sonner';

export default function Admin() {
  const { user } = useAuth();
  const [components, setComponents] = useState<ComponentWithAuthor[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'normal' as AnnouncementPriority,
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [componentsData, usersData, announcementsData] = await Promise.all([
        componentsApi.getComponents({ pageSize: 100 }),
        profilesApi.getAllProfiles(),
        announcementsApi.getAnnouncements(false)
      ]);
      setComponents(componentsData);
      setUsers(usersData);
      setAnnouncements(announcementsData);
    } catch (error: any) {
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await componentsApi.updateComponent(id, { status: 'approved' });
      toast.success('已通过审核');
      loadData();
    } catch (error: any) {
      toast.error('操作失败');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await componentsApi.updateComponent(id, { status: 'rejected' });
      toast.success('已拒绝');
      loadData();
    } catch (error: any) {
      toast.error('操作失败');
    }
  };

  const handleDeleteComponent = async (id: string) => {
    if (!confirm('确定要删除这个组件吗？')) return;
    
    try {
      await componentsApi.deleteComponent(id);
      toast.success('已删除');
      loadData();
    } catch (error: any) {
      toast.error('删除失败');
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) {
      toast.error('请填写标题和内容');
      return;
    }

    try {
      await announcementsApi.createAnnouncement({
        ...announcementForm,
        created_by: user!.id
      });
      toast.success('公告发布成功');
      setAnnouncementDialogOpen(false);
      setAnnouncementForm({
        title: '',
        content: '',
        priority: 'normal',
        is_active: true
      });
      loadData();
    } catch (error: any) {
      toast.error('发布失败');
    }
  };

  const handleToggleAnnouncement = async (id: string, isActive: boolean) => {
    try {
      await announcementsApi.updateAnnouncement(id, { is_active: isActive });
      toast.success(isActive ? '已激活' : '已停用');
      loadData();
    } catch (error: any) {
      toast.error('操作失败');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('确定要删除这个公告吗？')) return;
    
    try {
      await announcementsApi.deleteAnnouncement(id);
      toast.success('已删除');
      loadData();
    } catch (error: any) {
      toast.error('删除失败');
    }
  };

  const getPriorityBadge = (priority: AnnouncementPriority) => {
    const variants = {
      high: 'destructive',
      normal: 'default',
      low: 'secondary'
    };
    const labels = {
      high: '高',
      normal: '普通',
      low: '低'
    };
    return <Badge variant={variants[priority] as any}>{labels[priority]}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-foreground mb-8">管理后台</h1>

        <Tabs defaultValue="components">
          <TabsList>
            <TabsTrigger value="components">组件管理 ({components.length})</TabsTrigger>
            <TabsTrigger value="announcements">公告管理 ({announcements.length})</TabsTrigger>
            <TabsTrigger value="users">用户管理 ({users.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="components" className="mt-6">
            {loading ? (
              <div className="text-center py-12">加载中...</div>
            ) : (
              <div className="space-y-4">
                {components.map((component) => (
                  <Card key={component.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{component.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            作者: {component.author?.username} | 
                            下载: {component.download_count} | 
                            分类: {component.category || '未分类'}
                          </p>
                        </div>
                        <Badge variant={
                          component.status === 'approved' ? 'default' :
                          component.status === 'rejected' ? 'destructive' : 'secondary'
                        }>
                          {component.status === 'approved' ? '已通过' :
                           component.status === 'rejected' ? '已拒绝' : '待审核'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {component.description || '无描述'}
                      </p>
                      <div className="flex gap-2">
                        {component.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => handleApprove(component.id)}>
                              通过
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleReject(component.id)}>
                              拒绝
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteComponent(component.id)}>
                          删除
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="announcements" className="mt-6">
            <div className="mb-4">
              <Dialog open={announcementDialogOpen} onOpenChange={setAnnouncementDialogOpen}>
                <DialogTrigger asChild>
                  <Button>发布新公告</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>发布公告</DialogTitle>
                    <DialogDescription>创建新的平台公告</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>标题</Label>
                      <Input
                        value={announcementForm.title}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                        placeholder="输入公告标题"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>内容</Label>
                      <Textarea
                        value={announcementForm.content}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                        placeholder="输入公告内容"
                        rows={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>优先级</Label>
                      <Select 
                        value={announcementForm.priority} 
                        onValueChange={(value: AnnouncementPriority) => 
                          setAnnouncementForm({ ...announcementForm, priority: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">高</SelectItem>
                          <SelectItem value="normal">普通</SelectItem>
                          <SelectItem value="low">低</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={announcementForm.is_active}
                        onCheckedChange={(checked) => 
                          setAnnouncementForm({ ...announcementForm, is_active: checked })
                        }
                      />
                      <Label>立即激活</Label>
                    </div>
                    <Button onClick={handleCreateAnnouncement} className="w-full">
                      发布公告
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="text-center py-12">加载中...</div>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <Card key={announcement.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle>{announcement.title}</CardTitle>
                            {getPriorityBadge(announcement.priority)}
                            <Badge variant={announcement.is_active ? 'default' : 'secondary'}>
                              {announcement.is_active ? '激活' : '停用'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            发布者: {announcement.author?.username} | 
                            发布时间: {new Date(announcement.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">
                        {announcement.content}
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleToggleAnnouncement(announcement.id, !announcement.is_active)}
                        >
                          {announcement.is_active ? '停用' : '激活'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                        >
                          删除
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            {loading ? (
              <div className="text-center py-12">加载中...</div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{user.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.email || '无邮箱'} | 
                            注册时间: {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? '管理员' : '用户'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
