import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, Menu, theme, Button, Dropdown, Avatar } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  GlobalOutlined,
  DashboardOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../stores';
import { toggleCollapsed } from '../stores/slices/menuSlice';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.user);

  const handleLogout = () => {
    dispatch({ type: 'user/logout' });
    navigate('/login');
  };

  const handleLanguageChange = (lang: string) => {
    localStorage.setItem('language', lang);
    window.location.reload();
  };

  const languageMenuItems = [
    {
      key: 'zh-CN',
      label: '简体中文',
      onClick: () => handleLanguageChange('zh-CN'),
    },
    {
      key: 'en-US',
      label: 'English',
      onClick: () => handleLanguageChange('en-US'),
    },
  ];

  const userMenuItems = [
    {
      key: 'logout',
      label: t('common.logout'),
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', width: '100vw', boxSizing: 'border-box' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: collapsed ? 16 : 20, fontWeight: 'bold' }}>
          {collapsed ? 'K' : 'Kairis'}
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          defaultSelectedKeys={['dashboard']}
          defaultOpenKeys={['system']}
          style={{ height: '100%', borderRight: 0 }}
          items={[
            {
              key: 'Home',
              label: t('common.home'),
              onClick: () => navigate('/dashboard'),
              icon: <DashboardOutlined />,
            },
            {
              key: 'system',
              label: t('menu.system'),
              icon: <SettingOutlined />,
              children: [
                {
                  key: 'user',
                  label: t('menu.user'),
                  onClick: () => navigate('/system/user'),
                },
                {
                  key: 'role',
                  label: t('menu.role'),
                  onClick: () => navigate('/system/role'),
                },
                {
                  key: 'permission',
                  label: t('menu.permission'),
                  onClick: () => navigate('/system/permission'),
                },
                {
                  key: 'menu',
                  label: t('menu.menu'),
                  onClick: () => navigate('/system/menu'),
                },
              ],
            },
            {
              key: 'app',
              label: t('common.project'),
              onClick: handleLogout,
              icon: <LogoutOutlined />,
              children: [
              {
                key: 'user',
                label: t('menu.user'),
                onClick: () => navigate('/system/user'),
              },
            ]
            },
          ]}
        />
      </Sider>
      <Layout 
        style={{
          marginLeft: collapsed ? 80 : 200,
          transition: 'all 0.3s',
          minHeight: '100vh',
          width: 'calc(100% )',
        }}
      >
        <Header 
          style={{ 
            padding: '0 24px', 
            background: token.colorBgContainer, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Dropdown menu={{ items: languageMenuItems }} placement="bottomRight">
              <Button type="text" icon={<GlobalOutlined />} />
            </Dropdown>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <span>{user?.username}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: 24,
            padding: 24,
            minHeight: 'calc(100vh - 136px)',
            background: token.colorBgContainer,
            borderRadius: 8,
            width: 'calc(100% - 48px)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
