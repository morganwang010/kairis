import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, message, Tag, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { getProjects,deleteProjects,updateProject,createProject } from '../api';
import { useTranslation } from 'react-i18next';

// 项目接口定义
interface Project {
  id: string;
  projectName: string;
  projectShortName: string;
  startTime: string;
  endTime: string;
  responsiblePerson: string;
  clientProjectManager: string;
  clientCompanyName: string;
  contactPhone: string;
  description: string;
  status: string;
  askesAlwByNation: number;
}

// 表单值接口
interface ProjectFormValues {
  projectName: string;
  projectShortName: string;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  responsiblePerson: string;
  clientProjectManager: string;
  clientCompanyName: string;
  contactPhone: string;
  description: string;
  status: string;
  askesAlwByNation: number;
}

const ProjectPage: React.FC = () => {
  const { t } = useTranslation();
  const [messageApi, contextHolder] = message.useMessage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [modal, modalContextHolder] = Modal.useModal();
  // 加载项目数据
  useEffect(() => {
    loadProjects();
  }, []);
  
  const loadProjects = async () => {
    try {
      const data = await getProjects();
      console.log(t('common.loadProjectData'), ':', data);
      // 转换后端数据格式为前端需要的格式
      const formattedProjects = data.map((item: any) => ({
        id: item.id.toString(),
        projectName: item.project_name,
        projectShortName: item.project_abbr,
        startTime: item.start_time,
        endTime: item.end_time || '',
        responsiblePerson: item.manager,
        clientProjectManager: item.party_a_manager,
        clientCompanyName: item.party_a_company,
        contactPhone: item.contact_phone,
        status: item.status,
        description: item.project_desc || '',
        askesAlwByNation: item.askes_alw_by_nation,
      }));
      setProjects(formattedProjects);
    } catch (error) {
      console.error(t('common.loadProjectDataFailed'), ':', error);
      messageApi.error(t('common.loadProjectDataFailedRetry'));
    }
  };
  

  
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [form] = Form.useForm<ProjectFormValues>();
  const [searchText, setSearchText] = useState('');

  // 表格列定义
  const columns: ColumnsType<Project> = [
    {
      title: t('projectPage.projectName'),
      dataIndex: 'projectName',
      key: 'projectName',
      width: 200,
    },
        {
      title: t('projectPage.projectShortName'),
      dataIndex: 'projectShortName',
      key: 'projectShortName',
      width: 200,
    },
    // {
    //   title: t('projectPage.startTime'),
    //   dataIndex: 'startTime',
    //   key: 'startTime',
    //   width: 120,
    // },
    // {
    //   title: t('projectPage.endTime'),
    //   dataIndex: 'endTime',
    //   key: 'endTime',
    //   width: 120,
    // },
    {
      title: t('projectPage.askesBpjsAlw'),
      dataIndex: 'askesAlwByNation',
      key: 'askesAlwByNation',
      width: 120,
    },
    {
      title: t('projectPage.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        if (status === 'active') return <Tag color="green">{t('projectPage.statusActive')}</Tag>;
        if (status === 'completed') return <Tag color="blue">{t('projectPage.statusCompleted')}</Tag>;
        return <Tag color="gray">{status}</Tag>;
      }
    },
    {
      title: t('common.action'),
      key: 'action',
      // fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {t('projectPage.edit')}
          </Button>
          
          <Button
            type="primary"
            size="small"
             danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            {t('projectPage.delete')}
          </Button>
        </Space>
      ),
    },
  ];

  // 搜索功能
  const filteredProjects = projects.filter((project) => 
    project.projectName.includes(searchText) ||
    project.clientCompanyName.includes(searchText) ||
    project.responsiblePerson.includes(searchText)
  );


  // 打开新增模态框
  const handleAdd = () => {
    form.resetFields();
    setIsEditMode(false);
    setCurrentProject(null);
    setIsModalVisible(true);
  };

  // 打开编辑模态框
  const handleEdit = (project: Project) => {
    setIsEditMode(true);
    setCurrentProject(project);
    form.setFieldsValue({
      projectName: project.projectName,
      projectShortName: project.projectShortName,
      startTime: project.startTime ? dayjs(project.startTime) : null,
      endTime: project.endTime ? dayjs(project.endTime) : null,
      responsiblePerson: project.responsiblePerson,
      clientProjectManager: project.clientProjectManager,
      clientCompanyName: project.clientCompanyName,
      contactPhone: project.contactPhone,
      description: project.description,
    });
    setIsModalVisible(true);
  };

  // 删除项目
  const handleDelete = (id: string) => {
    // setIsEditMode(false);
    // setIsModalVisible(true);
    console.log(t('common.deleteProjectId'), id);
    modal.confirm({
      title: t('projectPage.confirmDelete'),
      content: t('projectPage.deleteConfirmText', { projectName: filteredProjects.find(project => project.id === id)?.projectName || '' }),
      onOk: async () => {
        try {
          // 调用删除项目API
          console.log(t('common.startDeleteProject'), id);
          deleteProjects({ project_id: parseInt(id) }).then(() => {
            // 刷新项目列表
             console.log(t('common.endDeleteProject'), id);
            loadProjects();
          });
          setProjects(projects.filter(project => project.id !== id));
          messageApi.success(t('projectPage.deleteSuccess'));
        } catch (error) {
          console.error(t('common.deleteProjectFailed'), ':', error);
          messageApi.error(t('common.deleteFailedRetry'));
        }
      },
    });
  };

  // 提交表单
  const handleSubmit = () => {
    console.log(t('common.formValues'), form.getFieldsValue());
    form.validateFields().then(async values => {
      if (isEditMode && currentProject) {
        // 编辑模式 - 仅更新本地数据，后续可添加后端API调用
        const updatedProject: Project = {
          ...currentProject,
          // id: values.id,
          projectName: values.projectName,
          projectShortName: values.projectShortName,
          // startTime: values.startTime?.format('YYYY-MM-DD') || '',
          // endTime: values.endTime?.format('YYYY-MM-DD') || '',
          // responsiblePerson: values.responsiblePerson,
          // clientProjectManager: values.clientProjectManager,
          // clientCompanyName: values.clientCompanyName,
          // contactPhone: values.contactPhone,
          // description: values.description,
        };
        console.log(currentProject);
        try {
          // 调用更新项目API
          await updateProject(updatedProject);
          // 刷新项目列表
          loadProjects();
          setProjects(projects.map(project => 
            project.id === currentProject.id ? updatedProject : project
          ));
          messageApi.success(t('projectPage.updateSuccess'));
        } catch (error) {
          console.error('更新项目失败:', error);
          messageApi.error(t('common.updateProjectFailedRetry'));
        }
      } else {
        // 新增模式 - 调用后端API创建项目
        const newProjectData = {
          projectName: values.projectName,
          projectShortName: values.projectShortName,
          startTime: values.startTime?.format('YYYY-MM-DD') || '',
          endTime: values.endTime?.format('YYYY-MM-DD') || '',
          responsiblePerson: values.responsiblePerson,
          clientProjectManager: values.clientProjectManager,
          clientCompanyName: values.clientCompanyName,
          contactPhone: values.contactPhone,
          description: values.description,
          status: 'active'
        };
        
        try {
          // 调用创建项目API
          await createProject(newProjectData);
          // 刷新项目列表
          loadProjects();
          messageApi.success(t('projectPage.addSuccess'));
        } catch (error) {
          console.error(t('common.createProjectFailed'), ':', error);
          messageApi.error(t('common.createProjectFailedRetry'));
        }
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };
// 引入 useTranslation 钩子

  
  return (
    <div>
      {contextHolder}  {/* 将contextHolder移到组件顶层 */}
      {modalContextHolder}  {/* 添加modal的contextHolder */}
            <Card style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{t('common.projects')}</h2>
        <Space>
          <Input.Search
        placeholder={t('projectPage.searchPlaceholder')}
        allowClear
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ width: 300 }}
      />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            {t('projectPage.addProject')}
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredProjects}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />

            </Card>


      <Modal
        title={isEditMode ? t('projectPage.editProject') : t('projectPage.addProject')}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={true}
        >
          <Form.Item
            label={t('projectPage.projectName')}
            name="projectName"
            rules={[{ required: true, message: t('projectPage.projectNameRequired') }]}
          >
            <Input placeholder={t('projectPage.projectNamePlaceholder')} />
          </Form.Item>

          <Form.Item
            label={t('projectPage.projectShortName')}
            name="projectShortName"
            rules={[{ required: true, message: t('projectPage.projectShortNameRequired') }]}
          >
            <Input placeholder={t('projectPage.projectShortNamePlaceholder')} />
          </Form.Item>

          {/* <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              label={t('projectPage.startTime')}
              name="startTime"
              style={{ flex: 1 }}
            >
              <DatePicker style={{ width: '100%' }} placeholder={t('projectPage.startTimePlaceholder')} />
            </Form.Item>

            <Form.Item
              label={t('projectPage.endTime')}
              name="endTime"
              style={{ flex: 1 }}
            >
              <DatePicker style={{ width: '100%' }} placeholder={t('projectPage.endTimePlaceholder')} />
            </Form.Item>
          </div>

          <Form.Item
            label={t('projectPage.responsiblePerson')}
            name="responsiblePerson"
          >
            <Input placeholder={t('projectPage.responsiblePersonPlaceholder')} />
          </Form.Item>

          <Form.Item
            label={t('projectPage.clientProjectManager')}
            name="clientProjectManager"
          >
            <Input placeholder={t('projectPage.clientProjectManagerPlaceholder')} />
          </Form.Item>

          <Form.Item
            label={t('projectPage.clientCompanyName')}
            name="clientCompanyName"
          >
            <Input placeholder={t('projectPage.clientCompanyNamePlaceholder')} />
          </Form.Item>

          <Form.Item
            label={t('projectPage.contactPhone')}
            name="contactPhone"
            rules={[
              { required: false, pattern: /^1[3-9]\d{9}$/, message: t('projectPage.contactPhoneFormat') }
            ]}
          >
            <Input placeholder={t('projectPage.contactPhonePlaceholder')} />
          </Form.Item>

          <Form.Item
            label={t('projectPage.description')}
            name="description"
          >
            <Input.TextArea rows={4} placeholder={t('projectPage.descriptionPlaceholder')} />
          </Form.Item> */}
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectPage;