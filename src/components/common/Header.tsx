import { Link, useNavigate } from 'react-router-dom';
import { Glasses, LogOut, User, Settings, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

export default function Header() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('已退出登录');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || '退出登录失败');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Glasses className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-foreground">AI眼镜组件平台</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              首页
            </Link>
            <Link to="/components" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              组件库
            </Link>
            <Link to="/ai-tools" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              AI工具
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Button asChild variant="default" size="sm">
                  <Link to="/publish">
                    <Upload className="h-4 w-4 mr-2" />
                    发布组件
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {profile?.username?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center gap-2 p-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {profile?.username?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{profile?.username}</span>
                        <span className="text-xs text-muted-foreground">
                          {profile?.role === 'admin' ? '管理员' : '用户'}
                        </span>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      个人中心
                    </DropdownMenuItem>
                    {profile?.role === 'admin' && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Settings className="mr-2 h-4 w-4" />
                        管理后台
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      退出登录
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button asChild variant="default" size="sm">
                <Link to="/login">登录</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

