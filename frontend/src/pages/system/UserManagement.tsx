import { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  message, 
  Popconfirm, 
  Card,
  Row,
  Col,
  Select,
  Avatar
} from 'antd';
import type { TablePaginationConfig } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ReloadOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { userApi, type CreateUserParams } from '../../api/user';
import type { User } from '../../types';

const { Option } = Select;



const UserManagement = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userApi.list({
        page: pagination.current,
        pageSize: pagination.pageSize,
      });
      if (response?.data) {
        {   
        setUsers(response.data.list);
        setTotal(response.data.total);
      }
    }
   } catch (error) {
      message.error(t('common.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, pagination.pageSize]);

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination({
      current: newPagination.current || 1,
      pageSize: newPagination.pageSize || 10,
    });
  };

  const handleAddClick = () => {
    setModalTitle(t('user.add'));
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditClick = (user: User) => {
    setModalTitle(t('user.edit'));
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      phone: user.email || '',
      avatar: user.avatar || '',
      status: 'active',
    });
    setModalVisible(true);
  };

  const handleDeleteClick = async (userId: string) => {
    try {
      await userApi.delete(userId);
      message.success(t('common.deleteSuccess'));
      fetchUsers();
    } catch (_error) {
      message.error(t('common.deleteFailed'));
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      // 如果是新增，需要验证密码
      if (!editingUser && (!values.password || values.password.length < 6)) {
        message.error(t('user.minPasswordLength'));
        return;
      }
      
      // 验证确认密码
      if (!editingUser && values.password !== values.confirmPassword) {
        message.error(t('user.passwordMismatch'));
        return;
      }

      const userData: CreateUserParams = {
        username: values.username,
        email: values.email,
        phone: values.email || '',
        avatar: values.avatar,
        password: values.password,
      };

      // 只有新增时才包含密码
      if (!editingUser) {
        userData.password = values.password;
      }

      if (editingUser) {
        await userApi.update(editingUser.id, { 
          ...userData, 
          status: values.status 
        });
        message.success(t('common.editSuccess'));
      } else {
        await userApi.create(userData);
        message.success(t('common.addSuccess'));
      }

      setModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  const columns = [
    {
      title: t('user.username'),
      dataIndex: 'username',
      key: 'username',
      render: (text: string, record: User) => (
        <Space>
          <Avatar 
            size="small" 
            src={record.avatar} 
            icon={!record.avatar && <UserOutlined />}
          />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: t('user.email'),
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: t('user.phone'),
      dataIndex: 'phone',
      key: 'phone',
      render: (text: string) => text || '-',
    },
    {
      title: t('user.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? t('user.active') : t('user.inactive')}
        </Tag>
      ),
    },
    {
      title: t('common.operation'),
      key: 'action',
      width: 150,
      render: (_: unknown, record: User) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEditClick(record)}
          >
            {t('common.edit')}
          </Button>
          <Popconfirm
            title={t('common.confirmDelete')}
            onConfirm={() => handleDeleteClick(record.id)}
            okText={t('common.confirm')}
            cancelText={t('common.cancel')}
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              {t('common.delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddClick}
          >
            {t('user.add')}
          </Button>
        </Col>
        <Col>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefresh}
            loading={loading}
          >
            {t('common.refresh')}
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={users.map(user => ({ ...user, key: user.id }))}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => t('common.totalItems', { total }),
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          name="userForm"
          initialValues={{ status: 'active' }}
        >
          <Form.Item
            name="username"
            label={t('user.username')}
            rules={[
              { required: true, message: t('common.requiredField') },
              { min: 3, message: t('user.minUsernameLength') },
              { max: 50, message: t('common.maxLength', { length: 50 }) },
            ]}
          >
            <Input placeholder={t('common.pleaseEnter', { field: t('user.username') })} />
          </Form.Item>

          <Form.Item
            name="email"
            label={t('user.email')}
            rules={[
              { required: true, message: t('common.requiredField') },
              { type: 'email', message: t('user.invalidEmail') },
              { max: 100, message: t('common.maxLength', { length: 100 }) },
            ]}
          >
            <Input placeholder={t('common.pleaseEnter', { field: t('user.email') })} />
          </Form.Item>

          {!editingUser && (
            <>
              <Form.Item
                name="password"
                label={t('user.password')}
                rules={[
                  { required: true, message: t('common.pleaseEnter', { field: t('user.password') }) },
                  { min: 6, message: t('user.minPasswordLength') },
                  { max: 50, message: t('common.maxLength', { length: 50 }) },
                ]}
              >
                <Input.Password placeholder={t('common.pleaseEnter', { field: t('user.password') })} />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label={t('user.confirmPassword')}
                rules={[
                  { required: true, message: t('common.pleaseEnter', { field: t('user.confirmPassword') }) },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error(t('user.passwordMismatch')));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder={t('common.pleaseEnter', { field: t('user.confirmPassword') })} />
              </Form.Item>
            </>
          )}

          <Form.Item
            name="phone"
            label={t('user.phone')}
            rules={[
              { pattern: /^1[3-9]\d{9}$/, message: t('user.invalidPhone') },
            ]}
          >
            <Input placeholder={t('common.pleaseEnter', { field: t('user.phone') })} />
          </Form.Item>

          <Form.Item
            name="avatar"
            label={t('user.avatarUrl')}
            rules={[
              { type: 'url', message: t('user.invalidUrl') },
              { max: 500, message: t('common.maxLength', { length: 500 }) },
            ]}
          >
            <Input placeholder={`${t('common.pleaseEnter', { field: t('user.avatarUrl') })}（${t('common.optional')}）`} />
          </Form.Item>

          {editingUser && (
            <Form.Item
              name="status"
              label={t('user.status')}
              rules={[{ required: true, message: t('common.requiredField') }]}
            >
              <Select>
                <Option value="active">{t('user.active')}</Option>
                <Option value="inactive">{t('user.inactive')}</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Card>
  );
};

export default UserManagement;
