import { Layout, Menu, Select, Button, Dropdown, Avatar, Space } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { HomeOutlined, SettingOutlined, AppstoreOutlined, PieChartOutlined, AccountBookOutlined, InfoCircleOutlined, LockOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next'
import i18n from '../i18n'
import { getProjects } from '../api'
import { useAuth } from './AuthProvider'

const { Header, Sider, Content } = Layout

const LayoutComponent = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname || '/' 
  const [openKeys, setOpenKeys] = useState<string[]>([])
  const [activeProjects, setActiveProjects] = useState<Array<{id: string, name: string}>>([])
  const [collapsed, setCollapsed] = useState(false)
  const { t, i18n: { language } } = useTranslation()
  const { user, logout } = useAuth()
  
  // 处理语言切换
  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value)
    localStorage.setItem('i18nextLng', value)
  }
  
  // 加载项目数据
  const loadActiveProjects = useCallback(async () => {
    try {
      // 获取所有项目，筛选出在建项目（is_active=true）
      const projects = await getProjects({ is_active: true });
      // console.log('获取到的项目数据:', projects);
      // 转换数据格式，只保留需要的字段
      const formattedProjects = projects.map((project: any) => ({
        id: project.id.toString(),
        name: project.project_abbr // 使用项目简称作为菜单名称
      }));
      
      setActiveProjects(formattedProjects);
    } catch (error) {
      console.error('加载项目数据失败:', error);
    }
  }, []);
  
  // 初始化加载项目数据
  useEffect(() => {
    loadActiveProjects();
  }, [loadActiveProjects]);
  
  // 根据当前路径设置默认打开的菜单
  useEffect(() => {
    if (currentPath.startsWith('/salary')) {
      setOpenKeys(['salary'])
    }
    // 保留其他菜单的展开状态，不强制关闭
  }, [currentPath])
  
  // 处理菜单展开/折叠事件
  const handleOpenChange = useCallback((keys: string[]) => {
    console.log('菜单展开/折叠事件:', keys);
    // 折叠状态下不处理子菜单展开
    if (collapsed) return;
    
    // 只处理顶级菜单的展开/折叠
    const latestOpenKey = keys.find(key => openKeys.indexOf(key) === -1)
    if (latestOpenKey) {
      setOpenKeys(latestOpenKey === 'salary' ? ['salary'] : [])
            // 当展开薪资菜单时，重新加载项目数据
      if (latestOpenKey === 'salary') {
        loadActiveProjects();
      }
    } else {
      setOpenKeys(keys)
    }
  }, [openKeys, loadActiveProjects, collapsed])
  
  // 切换折叠状态
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
    // 折叠时清空展开的菜单
    if (!collapsed) {
      setOpenKeys([]);
    }
  };
  
  // 处理菜单点击事件
  const handleMenuClick = useCallback(({ key }: { key: string }) => {
    // 对于子菜单，直接使用key作为路径
    if (key.startsWith('/')) {
      navigate(key, { replace: false });
    }
  }, [navigate])

  // 处理登出
  const handleLogout = async () => {
    await logout()
  }

  // 用户菜单项
  const userMenuItems = [
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: handleLogout
    }
  ]

  return (
      <Layout style={{ height: '100vh', minHeight: '100vh', width: '100%', margin: 0, padding: 0 }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#eff0f1ff', color: '#080808ff', padding: '0 16px', flexShrink: 0, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{t('common.systemName')}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user && (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <span>{user.full_name || user.username}</span>
              </Space>
            </Dropdown>
          )}
          <Select 
            value={language} 
            style={{ width: 120 }} 
            onChange={handleLanguageChange}
            options={[
              { value: 'zh', label: '中文' },
              { value: 'en', label: 'English' },
              // { value: 'id', label: 'Bahasa' }
            ]}
          />
        </div>
      </Header>
      <Layout style={{ flex: 1, display: 'flex', minHeight: 0, position: 'relative' }}>

        <Content style={{ 
          background: '#fff', 
          padding: 4, 
          margin: 0, 
          minHeight: 0,
          width: '100%',
          flex: 1,
          overflow: 'auto',
          height: 'calc(100vh - 64px)'
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default LayoutComponent