import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { RequireAuth } from '@/components/auth/RequireAuth';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import routes from './routes';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Toaster position="top-center" richColors />
        <RequireAuth whiteList={['/', '/components', '/components/:id', '/ai-tools', '/login']}>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <Routes>
                {routes.map((route, index) => (
                  <Route
                    key={index}
                    path={route.path}
                    element={route.element}
                  />
                ))}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </RequireAuth>
      </AuthProvider>
    </Router>
  );
}

export default App;
