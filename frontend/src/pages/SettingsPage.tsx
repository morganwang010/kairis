import { useState, useEffect } from 'react'
import { Card, Form, Input, Button, message, Tabs, Table, Space, Modal } from 'antd'
import { getSalaryCoefficient, getSystemConfigs, updateSalaryCoefficient, updateSystemConfig, deleteSystemConfig, insertSystemConfig } from '../api'
import { useTranslation } from 'react-i18next'
import {  EditOutlined, DeleteOutlined } from '@ant-design/icons'


const SettingsPage = () => {
  const [messageApi, messageContextHolder] = message.useMessage();
  const [modal, contextHolder] = Modal.useModal()
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('system');
  const [systemForm] = Form.useForm();
  const [salaryForm] = Form.useForm();
  // 系统配置列表
  const [systemConfigs, setSystemConfigs] = useState<any[]>([]);
  // 编辑模态框状态
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  // 添加模态框状态
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<any>(null);
  // 编辑表单实例
  const [editForm] = Form.useForm();
  // 添加表单实例
  const [addForm] = Form.useForm();
  // 系统配置状态暂时注释
  const [salaryCoefficient, setSalaryCoefficient] = useState({
    c_jmstk_alw: 0,
    c_pension_alw: 0,
    c_askes_alw: 0,
    c_ot_hour1: 0,
    c_ot_wages1: 0,
    c_ew_hour1: 0,
    c_ew_wages1: 0,
    c_ew_hour2: 0,
    c_ew_wages2: 0,
    c_ew_hour3: 0,
    c_ew_wages3: 0,
    c_jmstk_fee: 0,
    c_pension_ded: 0,
    c_askes_ded: 0,
    jmstk_max: 0,
    pension_max: 0,
    askes_max: 0,
    askes_min: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch system configurations
        const configs = await getSystemConfigs();

        setSystemConfigs(configs as any[]);

        // Fetch salary coefficients
        const coefficient = await getSalaryCoefficient();
        // 薪资系数API已经返回正确的数据结构，可以直接使用
        console.log('薪资系数:', coefficient);
        // 为了构建通过，使用默认值
        // setSalaryCoefficient({
        //     c_jmstk_alw: 0,
        //     c_pension_alw: 0,
        //     c_askes_alw: 0,
        //     c_ot_hour1: 0,
        //     c_ot_wages1: 0,
        //     c_ew_hour1: 0,
        //     c_ew_wages1: 0,
        //     c_ew_hour2: 0,
        //     c_ew_wages2: 0,
        //     c_ew_hour3: 0,
        //     c_ew_wages3: 0,
        //     c_jmstk_fee: 0,
        //     c_pension_ded: 0,
        //     c_askes_ded: 0,
        //     jmstk_max: 0,
        //     pension_max: 0,
        //     askes_max: 0,
        //     askes_min: 0
        //   });
        salaryForm.setFieldsValue(coefficient);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        messageApi.error(t('settingsPage.fetchSettingsFailed'));
      }
    };

    fetchData();
  }, [systemForm, salaryForm]);

  const handleSalaryCoefficientSubmit = () => {
    salaryForm.validateFields()
      .then(async (values) => {
        try {
          await updateSalaryCoefficient({ ...salaryCoefficient, ...values });
          setSalaryCoefficient(prev => ({ ...prev, ...values }));
          messageApi.success('工资系数已保存');
        } catch (error) {
        console.error('Failed to update salary coefficient:', error);
        messageApi.error(t('settingsPage.saveSalaryCoefficientFailed'));
        }
      })
      .catch(info => {
        console.log('Validation failed:', info);
        messageApi.error('表单验证失败');
      });
  };

  // 编辑系统配置
  const handleEditConfig = (record: any) => {
    setCurrentConfig(record);
    setIsEditModalVisible(true);
  };

  // 关闭编辑模态框
  const handleCancelEdit = () => {
    setIsEditModalVisible(false);
    setCurrentConfig(null);
  };

  // 提交编辑配置
  const handleEditSubmit = async () => {
    try {
      if (!currentConfig) return;
      const values = await editForm.validateFields();
      console.log('编辑配置:', values);
      // 调用更新系统配置API
      await updateSystemConfig(currentConfig.id, values.name, values.config);
      messageApi.success('配置更新成功');
      setIsEditModalVisible(false);
      setCurrentConfig(null);
      // 更新本地状态
      setSystemConfigs(prevConfigs =>
        prevConfigs.map(config =>
          config.id === currentConfig.id ? { ...config, ...values } : config
        )
      );
    } catch (error: any) {
        messageApi.error(t('settingsPage.configUpdateFailed') + ': ' + (error.message || t('common.unknownError')));
    }
  };

  // 监听编辑模态框显示，设置表单值
  useEffect(() => {
    if (isEditModalVisible && currentConfig) {
      editForm.setFieldsValue(currentConfig);
    }
  }, [isEditModalVisible, currentConfig]);

  // 删除系统配置
  const handleDeleteConfig = async (record: any) => {

    modal.confirm({
      title: '确认删除',
      content: `确定要删除 ${record.name} 配置吗？`,
      okText: '确定',
      okType: 'danger',
      onOk: async () => {
        try {
          if (!record) return;
          await deleteSystemConfig(record.id);
          messageApi.success(`删除 ${record.name} 配置成功`);
          // 更新本地状态
          setSystemConfigs(prevConfigs =>
            prevConfigs.filter(config => config.id !== record.id)
          );
        } catch (error: any) {
          messageApi.error('配置删除失败: ' + (error.message || t('common.unknownError')));
        }
      },
      onCancel: () => {
        messageApi.info('删除操作已取消');
      }
    });
  };

  // 关闭添加模态框
  const handleCancelAdd = () => {
    setIsAddModalVisible(false);
  };

  // 提交添加配置
  const handleAddSubmit = async () => {
    try {
      const values = await addForm.validateFields();
      console.log('添加配置:', values);
      // 调用添加系统配置API
      const newConfigId = await insertSystemConfig(values);
      messageApi.success('配置添加成功');
      setIsAddModalVisible(false);
      addForm.resetFields();
      // 更新本地状态
      setSystemConfigs(prevConfigs => [...prevConfigs, { id: newConfigId, ...values }]);
    } catch (error: any) {
      messageApi.error('配置添加失败: ' + (error.message || t('common.unknownError')));
    }
  };

  // 备份和恢复功能暂未实现
  // const handleBackup = () => {
  //   console.log('手动备份');
  //   message.success('备份成功');
  // };

  // const handleRestore = (file: any) => {
  //   console.log('恢复备份', file);
  // };

  return (
    <div>
       {contextHolder} 
       {messageContextHolder}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>

          <Tabs.TabPane tab={t('settingsPage.salaryCoefficient')} key="salary">
            <h2>{t('settingsPage.salaryCoefficientSettings')}</h2>
            <Form
              form={salaryForm}
              initialValues={salaryCoefficient}
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 14 }}
              style={{ marginTop: '20px' }}
            >
              <h3>{t('settingsPage.subsidyCoefficient')}</h3>
              <Form.Item label={t('settingsPage.coefficientID')} name="id" rules={[{ required: true, message: t('common.required') }]} style={{ display: 'none' }}>
                <Input type="number" step="0.01" placeholder={t('settingsPage.enterJmstkSubsidyCoefficient')} />
              </Form.Item>
              <Form.Item label={t('settingsPage.jmstkSubsidyCoefficient')} name="c_jmstk_alw" rules={[{ required: true, message: t('common.required') }]}>
                <Input type="number" step="0.01" placeholder={t('settingsPage.enterJmstkSubsidyCoefficient')} />
              </Form.Item>
              <Form.Item label={t('settingsPage.pensionSubsidyCoefficient')} name="c_pension_alw" rules={[{ required: true, message: t('common.required') }]}>
                <Input type="number" step="0.01" placeholder={t('settingsPage.enterPensionSubsidyCoefficient')} />
              </Form.Item>
              <Form.Item label={t('settingsPage.insuranceSubsidyCoefficient')} name="c_askes_alw" rules={[{ required: true, message: t('common.required') }]}>
                <Input type="number" step="0.01" placeholder={t('settingsPage.enterInsuranceSubsidyCoefficient')} />
              </Form.Item>

              <h3 style={{ marginTop: '30px' }}>{t('settingsPage.overtimeSalaryCoefficient')}</h3>
              <Form.Item label={t('settingsPage.ot1HourCoefficient')} name="c_ot_hour1" rules={[{ required: true, message: t('common.required') }]}>
                <Input type="number" step="0.01" placeholder={t('settingsPage.enterOt1HourCoefficient')} />
              </Form.Item>
              <Form.Item label={t('settingsPage.ot1SalaryCoefficient')} name="c_ot_wages1" rules={[{ required: true, message: t('common.required') }]}>
                <Input type="number" step="0.01" placeholder={t('settingsPage.enterOt1SalaryCoefficient')} />
              </Form.Item>
              <Form.Item label={t('settingsPage.ew1HourCoefficient')} name="c_ew_hour1" rules={[{ required: true, message: t('common.required') }]}>
                <Input type="number" step="0.01" placeholder={t('settingsPage.enterEw1HourCoefficient')} />
              </Form.Item>
              <Form.Item label={t('settingsPage.ew1SalaryCoefficient')} name="c_ew_wages1" rules={[{ required: true, message: t('common.required') }]}>
                <Input type="number" step="0.01" placeholder={t('settingsPage.enterEw1SalaryCoefficient')} />
              </Form.Item>
              <Form.Item label={t('settingsPage.ew2HourCoefficient')} name="c_ew_hour2" rules={[{ required: true, message: t('common.required') }]}>
                <Input type="number" step="0.01" placeholder={t('settingsPage.enterEw2HourCoefficient')} />
              </Form.Item>
              <Form.Item label={t('settingsPage.ew2SalaryCoefficient')} name="c_ew_wages2" rules={[{ required: true, message: t('common.required') }]}>
                <Input type="number" step="0.01" placeholder={t('settingsPage.enterEw2SalaryCoefficient')} />
              </Form.Item>
              <Form.Item label={t('settingsPage.ew3HourCoefficient')} name="c_ew_hour3" rules={[{ required: true, message: t('common.required') }]}>
                <Input type="number" step="0.01" placeholder={t('settingsPage.enterEw3HourCoefficient')} />
              </Form.Item>
              <Form.Item label={t('settingsPage.ew3SalaryCoefficient')} name="c_ew_wages3" rules={[{ required: true, message: t('common.required') }]}>
                <Input type="number" step="0.01" placeholder={t('settingsPage.enterEw3SalaryCoefficient')} />
              </Form.Item>

              <h3 style={{ marginTop: '30px' }}>{t('settingsPage.deductionCoefficient')}</h3>
              <Form.Item label={t('settingsPage.jmstkDeductionCoefficient')} name="c_jmstk_fee" rules={[{ required: true, message: t('common.required') }]}>
                <Input type="number" step="0.01" placeholder={t('settingsPage.enterJmstkDeductionCoefficient')} />
              </Form.Item>
              <Form.Item label={t('settingsPage.pensionDeductionCoefficient')} name="c_pension_ded" rules={[{ required: true, message: t('common.required') }]}>
                <Input type="number" step="0.01" placeholder={t('settingsPage.enterPensionDeductionCoefficient')} />
              </Form.Item>
              <Form.Item label={t('settingsPage.insuranceDeductionCoefficient')} name="c_askes_ded" rules={[{ required: true, message: t('common.required') }]}>
                <Input type="number" step="0.01" placeholder={t('settingsPage.enterInsuranceDeductionCoefficient')} />
              </Form.Item>

              <h3 style={{ marginTop: '30px' }}>{t('settingsPage.maximumMinimumValues')}</h3>
              <Form.Item label={t('settingsPage.jmstkMaximum')} name="jmstk_max" rules={[{ required: true, message: t('common.required') }]}>
                <Input type="number" step="0.01" placeholder={t('settingsPage.enterJmstkMaximum')} />
              </Form.Item>
              <Form.Item label={t('settingsPage.pensionMaximum')} name="pension_max" rules={[{ required: true, message: t('common.required') }]}>
                <Input type="number" step="0.01" placeholder={t('settingsPage.enterPensionMaximum')} />
              </Form.Item>
              <Form.Item label={t('settingsPage.insuranceMaximum')} name="askes_max" rules={[{ required: true, message: t('common.required') }]}>
                <Input type="number" step="0.01" placeholder={t('settingsPage.enterInsuranceMaximum')} />
              </Form.Item>
              <Form.Item label={t('settingsPage.insuranceMinimum')} name="askes_min" rules={[{ required: true, message: t('common.required') }]}>
                <Input type="number" step="0.01" placeholder={t('settingsPage.enterInsuranceMinimum')} />
              </Form.Item>
              <Form.Item label={t('settingsPage.updateTime')} name="update_time" rules={[{ required: true, message: t('common.required') }]} style={{ display: 'none' }}>
                <Input type="number" step="0.01" placeholder={t('settingsPage.enterJmstkSubsidyCoefficient')} value={Date.now()} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={handleSalaryCoefficientSubmit}>{t('settingsPage.saveSalaryCoefficient')}</Button>
                {/* <Button style={{ marginLeft: '10px' }} onClick={() => salaryForm.resetFields()}>{t('common.cancel')}</Button> */}
              </Form.Item>
            </Form>
          </Tabs.TabPane>

          
          <Tabs.TabPane tab={t('settingsPage.systemConfig')} key="system">
            <h2>{t('settingsPage.systemConfigList')}</h2>
            <div style={{ marginBottom: '20px' }}>
              <Button type="primary" onClick={() => setIsAddModalVisible(true)}>{t('common.add')}</Button>
            </div>
            <Table
              dataSource={systemConfigs}
              columns={[
                { title: t('common.no'), key: 'serialNo', render: (_, __, index) => index + 1 },
                { title: t('common.name'), dataIndex: 'name', key: 'name' },
                { title: t('settingsPage.configValue'), dataIndex: 'config', key: 'config' },
                { 
                  title: t('common.action'), 
                  key: 'action', 
                  render: (_text, record) => (
                    <Space size="middle">
                      <Button type="primary" size="small" icon={<EditOutlined />}  onClick={() => handleEditConfig(record)}>{t('common.edit')}</Button>
                      <Button type="primary" size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteConfig(record)} danger>{t('common.delete')}</Button>

                    </Space>
                  )
                }
              ]}
              rowKey="id"
              pagination={false}
              style={{ marginBottom: '20px' }}
            />

            {/* 编辑模态框 */}
            <Modal
              title={t('settingsPage.editSystemConfig')}
              visible={isEditModalVisible}
              onCancel={handleCancelEdit}
              footer={[
                <Button key="back" onClick={handleCancelEdit}>
                  {t('common.cancel')}
                </Button>,
                <Button key="submit" type="primary" onClick={handleEditSubmit}>
                  {t('common.save')}
                </Button>,
              ]}
            >
              <Form
                form={editForm}
                layout="vertical"
              >
                <Form.Item
                  name="name"
                  label={t('settingsPage.configName')}
                  rules={[{ required: true, message: t('settingsPage.enterConfigName') }]}
                >
                  <Input placeholder={t('settingsPage.enterConfigName')} />
                </Form.Item>
                <Form.Item
                  name="config"
                  label={t('settingsPage.configValue')}
                  rules={[{ required: true, message: t('settingsPage.enterConfigValue') }]}
                >
                  <Input placeholder={t('settingsPage.enterConfigValue')} />
                </Form.Item>
              </Form>
            </Modal>

            {/* 添加配置模态框 */}
            <Modal
              title={t('settingsPage.addSystemConfig')}
              visible={isAddModalVisible}
              onCancel={handleCancelAdd}
              footer={[
                <Button key="back" onClick={handleCancelAdd}>
                  {t('common.cancel')}
                </Button>,
                <Button key="submit" type="primary" onClick={handleAddSubmit}>
                  {t('common.save')}
                </Button>,
              ]}
            >
              <Form
                form={addForm}
                layout="vertical"
              >
                <Form.Item
                  name="name"
                  label={t('settingsPage.configName')}
                  rules={[{ required: true, message: t('settingsPage.enterConfigName') }]}
                >
                  <Input placeholder={t('settingsPage.enterConfigName')} />
                </Form.Item>
                <Form.Item
                  name="config"
                  label={t('settingsPage.configValue')}
                  rules={[{ required: true, message: t('settingsPage.enterConfigValue') }]}
                >
                  <Input placeholder={t('settingsPage.enterConfigValue')} />
                </Form.Item>
              </Form>
            </Modal>
            

          </Tabs.TabPane>

          
        </Tabs>
      </Card>
    </div>
  );
};

export default SettingsPage;