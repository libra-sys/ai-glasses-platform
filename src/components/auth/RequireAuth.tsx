import { useEffect, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

interface RequireAuthProps {
  children: ReactNode;
  whiteList?: string[];
}

export function RequireAuth({ children, whiteList = [] }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      const isWhitelisted = whiteList.some(path => {
        if (path.endsWith('/*')) {
          const basePath = path.slice(0, -2);
          return location.pathname.startsWith(basePath);
        }
        return location.pathname === path;
      });

      if (!isWhitelisted) {
        navigate('/login', { state: { from: location.pathname } });
      }
    }
  }, [user, loading, location.pathname, navigate, whiteList]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
