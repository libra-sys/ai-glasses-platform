import { Link } from 'react-router-dom';
import { Download, Star, User } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ComponentWithAuthor } from '@/types/types';

interface ComponentCardProps {
  component: ComponentWithAuthor;
  averageRating?: number;
}

export function ComponentCard({ component, averageRating = 0 }: ComponentCardProps) {
  const statusMap = {
    pending: { label: '待审核', variant: 'secondary' as const },
    approved: { label: '已通过', variant: 'default' as const },
    rejected: { label: '已拒绝', variant: 'destructive' as const }
  };

  const status = statusMap[component.status];

  return (
    <Link to={`/components/${component.id}`}>
      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border border-border">
        <CardHeader className="p-0">
          {component.image_url ? (
            <img
              src={component.image_url}
              alt={component.name}
              className="w-full h-48 object-cover rounded-t-lg"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="w-full h-48 bg-muted flex items-center justify-center rounded-t-lg">
              <span className="text-4xl text-muted-foreground">📦</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-lg text-foreground line-clamp-1">
              {component.name}
            </h3>
            <Badge variant={status.variant} className="shrink-0">
              {status.label}
            </Badge>
          </div>
          
          {component.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {component.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {component.category && (
              <Badge variant="outline" className="text-xs">
                {component.category}
              </Badge>
            )}
            {component.version && (
              <span className="text-xs">v{component.version}</span>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span className="line-clamp-1">{component.author?.username || '未知'}</span>
          </div>
          <div className="flex items-center gap-3">
            {averageRating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span>{averageRating.toFixed(1)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>{component.download_count}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
