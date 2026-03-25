import { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  message, 
  Popconfirm, 
  Card,
  Row,
  Col
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ReloadOutlined 
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { roleApi, type CreateRoleParams } from '../../api/role';
import type { Role } from '../../types';

const { TextArea } = Input;

// interface RoleFormValues {
//   name: string;
//   code: string;
//   description?: string;
// }

const RoleManagement = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await roleApi.list({
        page: pagination.current,
        pageSize: pagination.pageSize,
      });
      if (response?.data?.list) {
        setRoles(response.data.list || []);
        setTotal(response.data.total);
      }
    } catch (error) {
      message.error(t('common.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [pagination.current, pagination.pageSize]);

  const handleTableChange = (newPagination: any) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const handleAddClick = () => {
    setModalTitle(t('role.add'));
    setEditingRole(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditClick = (role: Role) => {
    setModalTitle(t('role.edit'));
    setEditingRole(role);
    form.setFieldsValue({
      name: role.name,
      code: role.code,
      description: role.description || '',
    });
    setModalVisible(true);
  };

  const handleDeleteClick = async (roleId: string) => {
    try {
      await roleApi.delete(roleId);
      message.success(t('common.deleteSuccess'));
      fetchRoles();
    } catch (error) {
      message.error(t('common.deleteFailed'));
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const roleData: CreateRoleParams = {
        name: values.name,
        code: values.code,
        description: values.description,
      };

      if (editingRole) {
        await roleApi.update(editingRole.id, { ...roleData, id: editingRole.id });
        message.success(t('common.editSuccess'));
      } else {
        await roleApi.create(roleData);
        message.success(t('common.addSuccess'));
      }

      setModalVisible(false);
      fetchRoles();
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  const handleRefresh = () => {
    fetchRoles();
  };

  const columns = [
    {
      title: t('role.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('role.code'),
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: t('role.description'),
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    {
      title: t('common.operation'),
      key: 'action',
      width: 150,
      render: (_: any, record: Role) => (
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
            {t('role.add')}
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
        dataSource={roles.map(role => ({ ...role, key: role.id }))}
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
          name="roleForm"
        >
          <Form.Item
            name="name"
            label={t('role.name')}
            rules={[
              { required: true, message: t('common.requiredField') },
              { max: 50, message: t('common.maxLength', { length: 50 }) },
            ]}
          >
            <Input placeholder={t('common.pleaseEnter', { field: t('role.name') })} />
          </Form.Item>

          <Form.Item
            name="code"
            label={t('role.code')}
            rules={[
              { required: true, message: t('common.requiredField') },
              { pattern: /^[a-zA-Z0-9_-]+$/, message: t('role.codePattern') },
              { max: 50, message: t('common.maxLength', { length: 50 }) },
            ]}
          >
            <Input placeholder={t('common.pleaseEnter', { field: t('role.code') })} />
          </Form.Item>

          <Form.Item
            name="description"
            label={t('role.description')}
            rules={[
              { max: 200, message: t('common.maxLength', { length: 200 }) },
            ]}
          >
            <TextArea
              rows={3}
              placeholder={t('common.pleaseEnter', { field: t('role.description') })}
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default RoleManagement;
