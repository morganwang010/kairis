import React, { lazy, Suspense, type ComponentType } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from '../components/Layout'
import HomePage from '../pages/HomePage'
import SettingsPage from '../pages/SettingsPage'
import ProjectPage from '../pages/ProjectPage'
import SalaryMainPage from '../pages/SalaryMainPage'
import TaxRatePage from '../pages/TaxRatePage'
import NewAttendancePage from '../pages/NewAttendancePage'
import SalarySlipPage from '../pages/SalarySlipPage'
import ImportManagementPage from '../pages/ImportManagementPage'
import AboutPage from '../pages/AboutPage'
import LicensePage from '../pages/LicensePage'
import LoginPage from '../pages/LoginPage'
import AuthProvider from '../components/AuthProvider'
import LicenseProvider from '../components/LicenseProvider'

// 包装lazy组件，返回一个组件
const WithSuspense = (Component: React.LazyExoticComponent<ComponentType<any>>) => {
  return () => (
    <Suspense fallback={<div>Loading...</div>}>
      <Component />
    </Suspense>
  );
};

// 导入布局组件
const MainLayout = WithSuspense(lazy(() => import('../layouts/MainLayout')));
const SystemLayout = WithSuspense(lazy(() => import('../layouts/SystemLayout')));

const Dashboard = lazy(() => import('../pages/Dashboard'));
const UserManagement = lazy(() => import('../pages/system/UserManagement'));
const RoleManagement = lazy(() => import('../pages/system/RoleManagement'));
const PermissionManagement = lazy(() => import('../pages/system/PermissionManagement'));
const MenuManagement = lazy(() => import('../pages/system/MenuManagement'));

// 根路径重定向组件
const RootRedirect = () => {
  const token = localStorage.getItem('savedUser')
  console.log('first check token:', token)
  return <Navigate to={token ? '/app' : '/login'} replace />
}

// 创建一个包装组件，用于包装所有需要认证和授权的路由
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <LicenseProvider>
        {children}
      </LicenseProvider>
    </AuthProvider>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
  },
  {
    path: '/login',
    element: (
      <AuthProvider>
        <LicenseProvider>
          <LoginPage />
        </LicenseProvider>
      </AuthProvider>
    ),
  },

  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { path: '', element: <HomePage /> },
      { path: 'salary', element: <SalaryMainPage /> },
      { path: 'salary/:projectId', element: <SalaryMainPage /> },
      { path: 'tax-rates', element: <TaxRatePage /> },
      { path: 'projects', element: <ProjectPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'attendance', element: <NewAttendancePage /> },
      { path: 'attendance/:projectId', element: <NewAttendancePage /> },
      { path: 'import-management', element: <ImportManagementPage /> },
      { path: 'salary-slips', element: <SalarySlipPage /> },
      { path: 'salary-slips/:projectId', element: <SalarySlipPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'license', element: <LicensePage /> },
    ],
  },
  {
    path: '*',
    element: (
      <ProtectedRoute>
        <Navigate to="/" replace />
      </ProtectedRoute>
    ),
  },
])

export default router
