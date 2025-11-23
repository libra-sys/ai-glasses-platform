import type { ReactNode } from 'react';
import Home from './pages/Home';
import Components from './pages/Components';
import ComponentDetail from './pages/ComponentDetail';
import Publish from './pages/Publish';
import Profile from './pages/Profile';
import AITools from './pages/AITools';
import Admin from './pages/Admin';
import Login from './pages/Login';
import DevDoc from './pages/DevDoc';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: '首页',
    path: '/',
    element: <Home />,
    visible: false
  },
  {
    name: '组件库',
    path: '/components',
    element: <Components />
  },
  {
    name: '组件详情',
    path: '/components/:id',
    element: <ComponentDetail />,
    visible: false
  },
  {
    name: '发布组件',
    path: '/publish',
    element: <Publish />,
    visible: false
  },
  {
    name: '个人中心',
    path: '/profile',
    element: <Profile />,
    visible: false
  },
  {
    name: 'AI助手',
    path: '/ai-tools',
    element: <AITools />
  },
  {
    name: '开发文档',
    path: '/dev-doc',
    element: <DevDoc />
  },
  {
    name: '管理后台',
    path: '/admin',
    element: <Admin />,
    visible: false
  },
  {
    name: '登录',
    path: '/login',
    element: <Login />,
    visible: false
  }
];

export default routes;