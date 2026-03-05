import { Table, Button, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const MenuManagement = () => {
  const { t } = useTranslation();

  const columns = [
    {
      title: t('menu.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('menu.path'),
      dataIndex: 'path',
      key: 'path',
    },
    {
      title: t('menu.icon'),
      dataIndex: 'icon',
      key: 'icon',
    },
    {
      title: t('menu.sort'),
      dataIndex: 'sort',
      key: 'sort',
    },
    {
      title: t('common.operation'),
      key: 'action',
      render: () => (
        <Space>
          <Button type="link" icon={<EditOutlined />} size="small">
            {t('common.edit')}
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} size="small">
            {t('common.delete')}
          </Button>
        </Space>
      ),
    },
  ];

  const data = [
    { key: '1', name: '仪表盘', path: '/dashboard', icon: 'DashboardOutlined', sort: 1 },
    { key: '2', name: '系统管理', path: '/system', icon: 'SettingOutlined', sort: 2 },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />}>
          {t('menu.add')}
        </Button>
      </div>
      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default MenuManagement;
