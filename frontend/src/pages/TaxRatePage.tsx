import { useState, useEffect } from 'react'
import { Card, Table, Button, Modal, Form, InputNumber, Tabs, message, Select, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { TabsProps } from 'antd'
import { useTranslation } from 'react-i18next';
import ScientificNumberDisplay from '../components/ScientificNumberDisplay';
import {
  getTaxRates,
  addTaxRate,
  updateTaxRate,
  deleteTaxRate,
  getTaxFreeBases,
  addTaxFreeBase,
  updateTaxFreeBase,
  deleteTaxFreeBase
} from '../api/index'

interface TaxRate {
  id: string
  grade: string
  salary_min: number
  sd: number
  salary_max: number
  tax_rate: number
}

interface TaxFreeBase {
  id: string
  grade: string
  free_tax_base: number
}

type Grade = 'TK/0,TK/1,K/0' | 'TK/2,TK/3,K/1,K/2' | 'K/3' 

const TaxRatePage = () => {
  const { t } = useTranslation()

  const [dialogVisible, setDialogVisible] = useState(false)
  const [taxFreeDialogVisible, setTaxFreeDialogVisible] = useState(false)
  const [form] = Form.useForm()
  const [taxFreeForm] = Form.useForm()
  const [editingRate, setEditingRate] = useState<TaxRate | null>(null)
  const [editingTaxFree, setEditingTaxFree] = useState<TaxFreeBase | null>(null)
  const [currentGrade, setCurrentGrade] = useState<Grade>('TK/0,TK/1,K/0')
  const [activeTabKey, setActiveTabKey] = useState<string>('1')
  const [regularTaxRates, setRegularTaxRates] = useState<TaxRate[]>([])
  const [temporaryTaxRates, setTemporaryTaxRates] = useState<TaxRate[]>([])
  const [contractTaxRates, setContractTaxRates] = useState<TaxRate[]>([])  
  const [taxFreeBases, setTaxFreeBases] = useState<TaxFreeBase[]>([])
  

  // 从API加载税率数据
  const loadTaxRates = async (grade: Grade) => {
    try {
      // 转换为string类型以匹配API参数要求
      const data = await getTaxRates(grade.toString())
      // 将下划线命名转换为驼峰命名
      console.log('tax-rates原始数据:', data)
      const formattedData = data.data.map((item: any) => ({
        id: item.id,
        grade: item.grade,
        salary_min: item.salary_min,
        sd: item.sd,
        salary_max: item.salary_max === null ? Infinity : item.salary_max,
        tax_rate: item.tax_rate
      }))
      
      switch (grade) {
        case 'TK/0,TK/1,K/0':
          setRegularTaxRates(formattedData)
          break
        case 'TK/2,TK/3,K/1,K/2':
          setTemporaryTaxRates(formattedData)
          break
        case 'K/3':
          setContractTaxRates(formattedData)
          break
      }
    } catch (error) {
      message.error(`加载等级${grade}税率数据失败`)
      console.error(`加载等级${grade}税率数据失败:`, error)
    }
  }

  // 从API加载免税收入基数数据
  const loadTaxFreeBases = async () => {
    try {
      const data = await getTaxFreeBases()
      // 将下划线命名转换为驼峰命名
      const formattedData = data.data.map((item: any) => ({
        id: item.id,
        grade: item.grade,
        free_tax_base: item.free_tax_base
      }))
      setTaxFreeBases(formattedData)
    } catch (error) {
      message.error('加载免税收入基数数据失败')
      console.error('加载免税收入基数数据失败:', error)
    }
  }

  // 移除未使用的函数

  // 初始加载数据
  useEffect(() => {
    loadTaxRates('TK/0,TK/1,K/0')
    loadTaxRates('TK/2,TK/3,K/1,K/2')
    loadTaxRates('K/3')
    loadTaxFreeBases()
  }, [])

  // 获取当前选中的税率数据
  const getCurrentRates = (): TaxRate[] => {
    switch (currentGrade) {
      case 'TK/0,TK/1,K/0':
        return regularTaxRates
      case 'TK/2,TK/3,K/1,K/2': 
        return temporaryTaxRates
      case 'K/3':
        return contractTaxRates
      default:
        return []
    }
  }

  // 移除未使用的函数

  // 打开税率添加对话框
  const openAddDialog = () => {
    setEditingRate(null)
    const nextId = (getCurrentRates().length + 1).toString().padStart(3, '0')
    form.setFieldsValue({
      id: `${currentGrade}${nextId}`,
      grade: currentGrade,
      salary_min: 0,
      salary_max: 0,
      rate: 0,
      sd: 0,
    })
    setDialogVisible(true)
  }

  // 打开税率编辑对话框
  const openEditDialog = (row: TaxRate) => {
    setEditingRate(row)
    form.setFieldsValue(row)
    setDialogVisible(true)
  }

  // 打开免税收入基数添加对话框
  const openAddTaxFreeDialog = () => {
    setEditingTaxFree(null)
    const lastId = taxFreeBases.length > 0 ? taxFreeBases[taxFreeBases.length - 1].id : '000'
    const nextId = String(parseInt(lastId.slice(-3)) + 1).padStart(3, '0')
    
    taxFreeForm.setFieldsValue({
      id: `TFB${nextId}`,
      workType: '',
      baseAmount: 0
    })
    setTaxFreeDialogVisible(true)
  }

  // 打开免税收入基数编辑对话框
  const openEditTaxFreeDialog = (row: TaxFreeBase) => {
    setEditingTaxFree(row)
    taxFreeForm.setFieldsValue(row)
    setTaxFreeDialogVisible(true)
  }

  // 删除税率记录
  const handleDelete = async (id: string) => {
    try {
      const currentRates = getCurrentRates()
      if (currentRates.length <= 1) {
        message.error('至少需要保留一条税率记录')
        return
      }
      
      await deleteTaxRate(id)
      message.success('删除成功')
      
      // 重新加载数据
      await loadTaxRates(currentGrade)  
    } catch (error) {
      message.error('删除失败')
      console.error('删除税率记录失败:', error)
    }
  }

  // 删除免税收入基数记录
  const handleDeleteTaxFree = async (id: string) => {
    try {
      if (taxFreeBases.length <= 1) {
        message.error('至少需要保留一条免税收入基数记录')
        return
      }
      
      await deleteTaxFreeBase(id)
      message.success('删除成功')
      
      // 重新加载数据
      await loadTaxFreeBases()
    } catch (error) {
      message.error('删除失败')
      console.error('删除免税收入基数记录失败:', error)
    }
  }

  // 提交税率表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      // 准备提交给后端的数据（使用下划线命名）
      const submitData = {
        id: values.id,
        grade: currentGrade,
        salary_min: values.salary_min,
        sd: values.sd,
        salary_max: values.salary_max === Infinity ? null : values.salary_max,
        tax_rate: values.tax_rate
      }
      
      if (editingRate) {
        // 更新现有记录
        await updateTaxRate(submitData)
        message.success('更新成功')
      } else {
        // 添加新记录
        await addTaxRate(submitData)
        message.success('添加成功')
      }
      
      form.resetFields()
      setEditingRate(null)
      
      // 重新加载数据
      await loadTaxRates(currentGrade)
      setDialogVisible(false)
    } catch (error) {
      message.error('操作失败')
      console.error('提交税率表单失败:', error)
    }
  }

  // 提交免税收入基数表单
  const handleTaxFreeSubmit = async () => {
    try {
      const values = await taxFreeForm.validateFields()
      const workTypeName = values.grade
      
      // 准备提交给后端的数据（使用下划线命名）
      const submitData = {
        id: values.id,
        grade: values.grade,
        work_type_name: workTypeName,
        base_amount: values.base_amount
      }
      
      if (editingTaxFree) {
        // 更新现有记录
        await updateTaxFreeBase(submitData)
        message.success('更新成功')
      } else {
        // 添加新记录
        await addTaxFreeBase(submitData)
        message.success('添加成功')
      }
      
      // 重新加载数据
      await loadTaxFreeBases()
      setTaxFreeDialogVisible(false)
    } catch (error) {
      message.error('操作失败')
      console.error('提交免税收入基数表单失败:', error)
    }
  }

  // 税率表格列配置
  const columns: ColumnsType<TaxRate> = [
    { title: t('common.id'), dataIndex: 'id', key: 'id', width: 100, render: (_: any, __: any, index: number) => index + 1 },
    { title: t('taxRatePage.minSalary'), dataIndex: 'salary_min', key: 'salary_min', width: 120, render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} /> },
    { title: t('taxRatePage.sd'), dataIndex: 'sd', key: 'sd', width: 80, render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} /> },
    { 
      title: t('taxRatePage.maxSalary'),
      dataIndex: 'salary_max', 
      key: 'salary_max', 
      width: 120, 
      render: (text) => text === Infinity ? '无上限' : <ScientificNumberDisplay value={text} /> 
    },
    { 
      title: t('taxRatePage.rate'),
      dataIndex: 'tax_rate', 
      key: 'tax_rate', 
      width: 100, 
      render: (text) => `${(text * 100).toFixed(2)}%` 
    },
    {
      title: t('common.action'),
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <span>
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />} 
            onClick={() => openEditDialog(record)}
            style={{ marginRight: 8 }}
          >
            {t('common.edit')}
          </Button>
          <Popconfirm
            title="确定要删除这条税率记录吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
              // disabled={getCurrentRates().length <= 1}
            >
              {t('common.delete')}
            </Button>
          </Popconfirm>
        </span>
      ),
    },
  ]

  // 免税收入基数表格列配置
  const taxFreeColumns: ColumnsType<TaxFreeBase> = [
    { title: t('common.id'), dataIndex: 'id', key: 'id', width: 100, render: (_: any, __: any, index: number) => index + 1 },
    { title: t('taxRatePage.taxType'), dataIndex: 'grade', key: 'grade', width: 150 },
    { title: t('taxRatePage.taxFreeBaseAmount'), dataIndex: 'free_tax_base', key: 'free_tax_base', width: 200 },
    {
      title: t('common.action'),
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <span>
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />} 
            onClick={() => openEditTaxFreeDialog(record)}
            style={{ marginRight: 8 }}
          >
            {t('common.edit')}
          </Button>
          <Popconfirm
            title="确定要删除这条免税收入基数记录吗？"
            onConfirm={() => handleDeleteTaxFree(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
              // disabled={taxFreeBases.length <= 1}
            >
              {t('common.delete')}
            </Button>
          </Popconfirm>
        </span>
      ),
    },
  ]

  // 页签配置
  const tabItems: TabsProps['items'] = [
    {
      key: '1',
      label: 'PTKP (TK/0, TK/1, K/0)',
      children: (
        <div>
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>PTKP (TK/0, TK/1, K/0)</h3>
            <Button type="primary" icon={<PlusOutlined />} onClick={openAddDialog}>添加税率</Button>
          </div>
          <Table 
            columns={columns} 
            dataSource={regularTaxRates} 
            rowKey="id"
            style={{ width: '100%' }}
            scroll={{ x: 'max-content' }}
          />
        </div>
      ),
    },
    {
      key: '2',
      label: 'PTKP (TK/2, TK/3, K/1, K/2)',
      children: (
        <div>
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>PTKP (TK/2, TK/3, K/1, K/2)</h3>
            <Button type="primary" icon={<PlusOutlined />} onClick={openAddDialog}>添加税率</Button>
          </div>
          <Table 
            columns={columns} 
            dataSource={temporaryTaxRates} 
            rowKey="id"
            style={{ width: '100%' }}
            scroll={{ x: 'max-content' }}
          />
        </div>
      ),
    },
    {
      key: '3',
      label: 'PTKP (K/3)',
      children: (
        <div>
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>PTKP (K/3)</h3>
            <Button type="primary" icon={<PlusOutlined />} onClick={openAddDialog}>添加税率</Button>
          </div>
          <Table 
            columns={columns} 
            dataSource={contractTaxRates} 
            rowKey="id"
            style={{ width: '100%' }}
            scroll={{ x: 'max-content' }}
          />
        </div>
      ),
    },
    {
      key: 'tax-free',
      label: t('taxRatePage.taxFreeBase'),
      children: (
        <div>
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>{t('taxRatePage.taxFreeBase')}</h3>
            <Button type="primary" icon={<PlusOutlined />} onClick={openAddTaxFreeDialog}>
              {t('common.addTaxFreeBase')}
            </Button>
          </div>
          <Table 
            columns={taxFreeColumns} 
            dataSource={taxFreeBases} 
            rowKey="id"
            style={{ width: '100%' }}
            scroll={{ x: 'max-content' }}
          />
        </div>
      ),
    },
  ]

  return (
    <div>
      <Card >
        <div>
          <Tabs 
            activeKey={activeTabKey}
            onChange={(key) => {
              setActiveTabKey(key)
              if (key !== 'tax-free') {
                setCurrentGrade(key as Grade)
              }
            }} 
            items={tabItems}
          />
        </div>
      </Card>
      
      {/* 税率编辑模态框 */}
      <Modal
        title={editingRate ? '编辑税率' : '添加税率'}
        open={dialogVisible}
        onCancel={() => setDialogVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setDialogVisible(false)}>
            {t('common.cancel')}
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>
            {t('common.confirm')}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="id" label={t('common.id')} hidden={!!editingRate}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="salary_min" label={t('taxRatePage.minSalary')} rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="sd" label={t('taxRatePage.sd')}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="salary_max" label={t('taxRatePage.maxSalary')} rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="tax_rate" label={t('taxRatePage.rate')} rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} max={1} step={0.0001} />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 免税收入基数编辑模态框 */}
      <Modal
        title={editingTaxFree ? t('common.editTaxFreeBase') : t('common.addTaxFreeBase')}
        open={taxFreeDialogVisible}
        onCancel={() => setTaxFreeDialogVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setTaxFreeDialogVisible(false)}>
            {t('common.cancel')}
          </Button>,
          <Button key="submit" type="primary" onClick={handleTaxFreeSubmit}>
            {t('common.confirm')}
          </Button>,
        ]}
      >
        <Form form={taxFreeForm} layout="vertical">
          <Form.Item name="id" label="序号" hidden={!!editingTaxFree}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="grade" label="等级" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'Grade 1', value: 'TK/0,TK/1,K/0' },
                { label: 'Grade 2', value: 'TK/2,TK/3,K/1,K/2' },
                { label: 'Grade 3', value: 'K/3' }
              ]}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item name="base_amount" label={t('taxRatePage.taxFreeBaseAmount')} rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TaxRatePage