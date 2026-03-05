import { Table, Button, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const PermissionManagement = () => {
  const { t } = useTranslation();

  const columns = [
    {
      title: t('permission.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('permission.code'),
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: t('permission.type'),
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'menu' ? 'blue' : 'green'}>
          {type === 'menu' ? t('permission.menu') : t('permission.button')}
        </Tag>
      ),
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
    { key: '1', name: '查看用户', code: 'user:view', type: 'button' },
    { key: '2', name: '新增用户', code: 'user:add', type: 'button' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />}>
          {t('common.add')}
        </Button>
      </div>
      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default PermissionManagement;
