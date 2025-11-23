import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ComponentCard } from '@/components/common/ComponentCard';
import { componentsApi } from '@/db/api';
import type { ComponentWithAuthor } from '@/types/types';
import { toast } from 'sonner';

export default function Components() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [components, setComponents] = useState<ComponentWithAuthor[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadComponents();
  }, [searchParams]);

  const loadCategories = async () => {
    try {
      const data = await componentsApi.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };

  const loadComponents = async () => {
    setLoading(true);
    try {
      const data = await componentsApi.getComponents({
        status: 'approved',
        search: searchParams.get('search') || undefined,
        category: searchParams.get('category') || undefined,
        pageSize: 50
      });
      setComponents(data);
    } catch (error: any) {
      console.error('加载组件失败:', error);
      toast.error('加载失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
    setSearchParams(params);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (value !== 'all') params.set('category', value);
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-foreground mb-8">组件库</h1>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 flex gap-2">
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
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : components.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {components.map((component) => (
              <ComponentCard key={component.id} component={component} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">未找到相关组件</p>
          </div>
        )}
      </div>
    </div>
  );
}
