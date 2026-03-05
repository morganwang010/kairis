import { lazy } from 'react';
import type { RouteConfig } from '../types';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const Login = lazy(() => import('../pages/Login'));
const UserManagement = lazy(() => import('../pages/system/UserManagement'));
const RoleManagement = lazy(() => import('../pages/system/RoleManagement'));
const PermissionManagement = lazy(() => import('../pages/system/PermissionManagement'));
const MenuManagement = lazy(() => import('../pages/system/MenuManagement'));

export const routes: RouteConfig[] = [
  {
    path: '/login',
    element: Login,
  },
  {
    path: '/',
    element: lazy(() => import('../layouts/MainLayout')),
    children: [
      {
        path: 'dashboard',
        element: Dashboard,
        meta: { title: 'Dashboard', icon: 'DashboardOutlined' },
      },
      {
        path: 'system',
        element: lazy(() => import('../layouts/SystemLayout')),
        children: [
          {
            path: 'user',
            element: UserManagement,
            meta: { title: 'User Management', icon: 'UserOutlined' },
          },
          {
            path: 'role',
            element: RoleManagement,
            meta: { title: 'Role Management', icon: 'TeamOutlined' },
          },
          {
            path: 'permission',
            element: PermissionManagement,
            meta: { title: 'Permission Management', icon: 'SafetyOutlined' },
          },
          {
            path: 'menu',
            element: MenuManagement,
            meta: { title: 'Menu Management', icon: 'MenuOutlined' },
          },
        ],
      },
    ],
  },
];
