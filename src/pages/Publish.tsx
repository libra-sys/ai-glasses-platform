import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/common/ImageUpload';
import { useAuth } from '@/components/auth/AuthProvider';
import { componentsApi, storageApi } from '@/db/api';
import { toast } from 'sonner';

export default function Publish() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    version: '1.0.0'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [componentFile, setComponentFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('请先登录');
      navigate('/login');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('请输入组件名称');
      return;
    }

    if (!componentFile) {
      toast.error('请上传组件文件');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await storageApi.uploadComponentImage(user.id, imageFile);
      }

      const fileUrl = await storageApi.uploadComponentFile(user.id, componentFile);

      await componentsApi.createComponent({
        name: formData.name,
        description: formData.description || null,
        category: formData.category || null,
        version: formData.version || null,
        author_id: user.id,
        file_url: fileUrl,
        image_url: imageUrl || null,
        status: 'pending'
      });

      toast.success('组件发布成功，等待审核');
      navigate('/profile');
    } catch (error: any) {
      toast.error(error.message || '发布失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>发布组件</CardTitle>
            <CardDescription>填写组件信息并上传文件</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">组件名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入组件名称"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">组件描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="请输入组件描述"
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">分类</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="例如：工具、娱乐"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="version">版本号</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="例如：1.0.0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>组件封面图</Label>
                <ImageUpload
                  value={imagePreview}
                  onChange={setImagePreview}
                  onFileChange={setImageFile}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">组件文件 *</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setComponentFile(e.target.files?.[0] || null)}
                  required
                />
                {componentFile && (
                  <p className="text-sm text-muted-foreground">
                    已选择: {componentFile.name}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '发布中...' : '发布组件'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
