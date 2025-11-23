import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ComponentCard } from '@/components/common/ComponentCard';
import { useAuth } from '@/components/auth/AuthProvider';
import { componentsApi, favoritesApi } from '@/db/api';
import type { ComponentWithAuthor } from '@/types/types';
import { toast } from 'sonner';

export default function Profile() {
  const { user, profile } = useAuth();
  const [myComponents, setMyComponents] = useState<ComponentWithAuthor[]>([]);
  const [favorites, setFavorites] = useState<ComponentWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [componentsData, favoritesData] = await Promise.all([
        componentsApi.getComponents({ authorId: user!.id }),
        favoritesApi.getFavorites(user!.id)
      ]);
      setMyComponents(componentsData);
      setFavorites(favoritesData);
    } catch (error: any) {
      toast.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">个人中心</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><span className="font-semibold">用户名:</span> {profile?.username}</p>
              <p><span className="font-semibold">角色:</span> {profile?.role === 'admin' ? '管理员' : '用户'}</p>
              {profile?.bio && <p><span className="font-semibold">简介:</span> {profile.bio}</p>}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="my-components">
          <TabsList>
            <TabsTrigger value="my-components">我的组件 ({myComponents.length})</TabsTrigger>
            <TabsTrigger value="favorites">我的收藏 ({favorites.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-components" className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-80 bg-muted animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : myComponents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myComponents.map((component) => (
                  <ComponentCard key={component.id} component={component} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">暂无组件</p>
            )}
          </TabsContent>
          
          <TabsContent value="favorites" className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-80 bg-muted animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((component) => (
                  <ComponentCard key={component.id} component={component} />
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">暂无收藏</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
