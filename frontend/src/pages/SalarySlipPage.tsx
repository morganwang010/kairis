import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getSalarySlips, sendEmail, generateAndDownloadPDF, getProjectName } from '../api'
import { Card, Input, Button, Table, Modal, Descriptions, Row, Col, Typography ,DatePicker, message, Pagination} from 'antd'
import type { TableColumnsType, TableProps } from 'antd';
// import type { ColumnsType } from 'antd/es/table'

import dayjs from 'dayjs'
import ScientificNumberDisplay from '../components/ScientificNumberDisplay'

const { Title } = Typography
// const { RangePicker } = DatePicker
interface SalarySlipPageProps {
  projectId?: string
  projectName?: string
}
// MonthPicker暂时未使用，需要时取消注释
// const { MonthPicker } = DatePicker;
// 定义工资条记录接口
interface SalarySlipRecord {
  id: string;
  employee_name: string;
  employee_id: string;
  id_card: string;
  department: string;
  period: string;
  npwp: string;
  location: string;
  joinDate: string;
  basic_salary: number;
  meal_alw: number;
  pulsaAllowance: number;
  pulsaAllowanceMonth: number;
  overtimeExtra: number;
  bpjsDeduction: number;
  pphDeduction: number;
  astekDeduction: number;
  totalAccept: number;
  totalTransfer: number;
  final_salary: number,
  fix_alw: number,
  jmstk_fee: number;
  pension_ded: number;
  transp_alw: number;
  others: number;
  tax_alw_salary: number;
  incentive_alw: number;
  email: string;
  att_alw: number;
  tjastek: number;
  field_alw: number;
  bpjs_alw: number;
  askes_bpjs_alw: number,
  position: string,
  housing_alw: number,
  position_alw: number,
  total_net_wages: number,
  pension_alw: number,
  tax_alw_phk: number,
  comp_phk: number,
  med_alw: number,
  pulsa_alw: number,
  housing_alw_tetap: number,
  religious_alw: number,
  rapel_basic_salary: number,
  rapel_jmstk_alw: number,
  acting: number,
  performance_alw: number,
  trip_alw: number,
  // ot_hour: number,
  // ew_hour: number,
  // ot_wages: number,
  // et_wages: number,
  jmstk_alw: number,
  correct_add: number,
  correct_sub: number,
  leave_comp: number,
  total_accept: number,
  tax_ded_salary: number,
  tax_ded_phk: number,
  askes_bpjs_ded: number,
  incentive_ded: number,
  purapel_basic_sal: number,
  loan_ded: number,
  absent_ded: number,
  net_accept: number, 
  round_off_salary: number,
  create_time: string,
  update_time: string,
  month: string,
  tax_status: number,
  tax_type: string,
  hierarchy_id: string,
  hierarchy_name: string,
  location_name: string,
  join_date: string,
  resign_date: string,
  work: number,
  off: number,
  permission: number,
  absent: number,
  sick: number,
  standby: number,
  ew: number,
  annualleave: number,
  salary_slip_status: number,
  pulsa_alw_month: number,
  ot1_hour: number,
  ot1_wages: number,
  ot2_hour: number,
  ot2_wages: number,
  ot3_hour: number,
  ot3_wages: number,
  ew1_hour: number,
  ew1_wages: number,
  ew2_hour: number,
  ew2_wages: number,
  ew3_hour: number,
  ew3_wages: number,
  unpresent: number,
  mandah_alw: number,
  absent_ded2: number,

}


const SalarySlipPage: React.FC<SalarySlipPageProps> = ({  projectId = 'all' }) => {
  const { t } = useTranslation();
  // const [form] = Form.useForm()
  const [selectedSlip, setSelectedSlip] = useState<SalarySlipRecord | null>(null)
  const [slipModalVisible, setSlipModalVisible] = useState(false)
  const [filteredData, setFilteredData] = useState<SalarySlipRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(dayjs().format('YYYY-MM'))
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [messageApi, messageContextHolder] = message.useMessage();
  const [ _, contextHolder] = Modal.useModal();
  // 分页状态管理
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  
  // 搜索表单状态
  const [searchFormValues, setSearchFormValues] = useState({
    employeeName: '',
    employee_id: ''
  });
  // 是否正在执行搜索的标志
  const [isSearching, setIsSearching] = useState(false);
  // getCurrentMonth函数暂时未使用，需要时取消注释
  // const getCurrentMonth = () => {
  //   const now = new Date()
  //   return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
  // }

  // 数据转换函数：将后端返回的字段映射到前端所需的接口
  const transformBackendData = (backendData: any[]): SalarySlipRecord[] => {
    return backendData.map(item => ({
      id: item.id?.toString() || '',
      employee_name: item.employee_name || '',
      employee_id: item.employee_id?.toString() || '',
      id_card: item.id_card || '',
      department: item.department || '',
      period: item.month || '',
      npwp: item.npwp || '',
      location: item.location || '',
      joinDate: item.join_date || '',
      basic_salary: item.basic_salary || 0,
      meal_alw: item.meal_alw || 0,
      field_alw: item.field_alw || 0,
      askes_bpjs_alw: item.askes_bpjs_alw || 0,
      pulsaAllowance: item.pulsa_alw || 0,
      overtimeExtra: item.ot_wages || 0,
      bpjsDeduction: item.askes_bpjs_ded || 0,
      pphDeduction: item.tax_ded_salary || 0,
      astekDeduction: item.pension_ded || 0,
      totalAccept: item.net_accept || 0,
      totalTransfer: item.round_off_salary || 0,
      salarySlipStatus: item.salary_slip_status || '0',
      jmstk_fee: item.jmstk_fee || 0,
      pension_ded: item.pension_ded || 0,
      transp_alw: item.transp_alw || 0,
      pulsaAllowanceMonth: item.pulsa_alw_month || 0,
      jmstk_alw: item.jmstk_alw || 0,
      others: item.others || 0,
      tax_alw_salary: item.tax_alw_salary || 0,
      incentive_alw: item.incentive_alw || 0,
      email: item.email || '',
      att_alw: item.att_alw || 0,
      tjastek: item.tjastek || 0,
      bpjs_alw: item.bpjs_alw || 0,
      position: item.position || '',
      housing_alw: item.housing_alw || 0,
      position_alw: item.position_alw || 0,
      total_net_wages: item.total_net_wages || 0,
      pension_alw: item.pension_alw || 0,
      tax_alw_phk: item.tax_alw_phk || 0,
      comp_phk: item.comp_phk || 0,
      med_alw: item.med_alw || 0,
      housing_alw_tetap: item.housing_alw_tetap || 0,
      religious_alw: item.religious_alw || 0,
      rapel_basic_salary: item.rapel_basic_salary || 0,
      rapel_jmstk_alw: item.rapel_jmstk_alw || 0,
      acting: item.acting || 0,
      performance_alw: item.performance_alw || 0,
      trip_alw: item.trip_alw || 0,
      final_salary: item.final_salary || 0,
      fix_alw: item.fix_alw || 0,
      pulsa_alw: item.pulsa_alw || 0,
      ot_hour: item.ot_hour || 0,
      ew_hour: item.ew_hour || 0,
      ot_wages: item.ot_wages || 0,
      et_wages: item.et_wages || 0,
      correct_add: item.correct_add || 0,
      correct_sub: item.correct_sub || 0,
      leave_comp: item.leave_comp || 0,
      total_accept: item.total_accept || 0,
      tax_ded_salary: item.tax_ded_salary || 0,
      tax_ded_phk: item.tax_ded_phk || 0,
      askes_bpjs_ded: item.askes_bpjs_ded || 0,
      incentive_ded: item.incentive_ded || 0,
      purapel_basic_sal: item.purapel_basic_sal || 0,
      loan_ded: item.loan_ded || 0,
      absent_ded: item.absent_ded || 0,
      net_accept: item.net_accept || 0,
      round_off_salary: item.round_off_salary || 0,
      create_time: item.create_time || '',
      update_time: item.update_time || '',
      month: item.month || '',
      tax_status: item.tax_status || 0,
      tax_type: item.tax_type || '',
      hierarchy_id: item.hierarchy_id || '',
      hierarchy_name: item.hierarchy_name || '',
      location_name: item.location_name || '',
      join_date: item.join_date || '',
      resign_date: item.resign_date || '',
      work: item.work || 0,
      off: item.off || 0,
      permission: item.permission || 0,
      absent: item.absent || 0,
      sick: item.sick || 0,
      standby: item.standby || 0,
      ew: item.ew || 0,
      annualleave: item.annualleave || 0,
      salary_slip_status: item.salary_slip_status || 0,
      pulsa_alw_month: item.pulsa_alw_month || 0,
      ot1_hour: item.ot1_hour || 0,
      ot1_wages: item.ot1_wages || 0,
      ot2_hour: item.ot2_hour || 0,
      ot2_wages: item.ot2_wages || 0,
      ot3_hour: item.ot3_hour || 0,
      ot3_wages: item.ot3_wages || 0,
      ew1_hour: item.ew1_hour || 0,
      ew1_wages: item.ew1_wages || 0,
      ew2_hour: item.ew2_hour || 0,
      ew2_wages: item.ew2_wages || 0,
      ew3_hour: item.ew3_hour || 0,
      ew3_wages: item.ew3_wages || 0,
      unpresent: item.unpresent || 0,
      mandah_alw: item.mandah_alw || 0,
      absent_ded2: item.absent_ded2 || 0,
    }))
  }

  // 获取工资条数据
  const fetchSalarySlips = async (params?: any) => {
    setLoading(true)
    try {
      // 默认参数：当前月份
      const queryParams = {
        month: currentMonth,
        project_id: projectId,
        page: currentPage,
        page_size: pageSize,
        ...params
      }
      // console.log('Query params:', queryParams)
      // 调用后端API
      const response = await getSalarySlips(queryParams)
      // console.log('Backend response:', response)
      // 假设后端返回格式为 { data: [...], total: number }
      const backendData = response.data || response
      const totalCount = response.total || backendData.length
      // 转换数据格式
      const transformedData = transformBackendData(backendData)
      setFilteredData(transformedData)
      setTotal(totalCount)
      
      // 如果没有搜索参数，重置搜索状态
      if (!params || (!params.employee_id && !params.employee_name)) {
        setIsSearching(false)
      }
    } catch (error) {
      console.error('获取工资条数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 页面加载时获取数据
  useEffect(() => {
    fetchSalarySlips()
  }, [projectId,currentMonth,currentPage,pageSize])

  // 搜索和筛选处理
  const handleSearch = () => {
    // 设置为搜索状态
    setIsSearching(true);
    // 构建搜索参数
    const searchParams: any = {
      month: currentMonth,
      project_id: projectId,
      page: 1,
      page_size: 10,
    }

    // 只在employee_id存在且不为空时添加
    if (searchFormValues.employee_id !== undefined && searchFormValues.employee_id !== null && searchFormValues.employee_id !== '') {
      searchParams.employee_id = searchFormValues.employee_id
    }

    // 只在employeeName存在且不为空时添加
    if (searchFormValues.employeeName !== undefined && searchFormValues.employeeName !== null && searchFormValues.employeeName !== '') {
      searchParams.employee_name = searchFormValues.employeeName
    }

    console.log('构建的搜索参数:', searchParams)
    
    // 调用后端API搜索
    fetchSalarySlips(searchParams)
  }

  // 重置搜索
  const handleReset = () => {
    // searchFormRef.current?.resetFields();
    setSearchFormValues({ employeeName: '', employee_id: '' });
    setIsSearching(false);
    fetchSalarySlips();
  }

  // 重置搜索
  // const handleReset = () => {
  //   form.resetFields()
  //   fetchSalarySlips()
  // }

  // 查看工资条详情
  const handleViewSlip = (record: SalarySlipRecord) => {
    setSelectedSlip(record)
    setSlipModalVisible(true)
  }

  // 全选处理
  const handleSelectAll = () => {
    const allKeys = filteredData.map(item => item.id)
    // 检查当前是否已经全选
    const isAllSelected = selectedRowKeys.length === allKeys.length && selectedRowKeys.length > 0
    if (isAllSelected) {
      // 如果已经全选，则取消全选
      setSelectedRowKeys([])
    } else {
      // 如果没有全选，则全选所有
      setSelectedRowKeys(allKeys)
    }
  }

  // 发送邮件处理
  const handleSendEmail = async () => {
    console.log('Selected row keys:', selectedRowKeys)
    if (selectedRowKeys.length === 0) {
      messageApi.warning(t('salarySlipPage.selectRecords'))
      return
    }

    try {
      setLoading(true)
      const selectedRecords = filteredData.filter(item => selectedRowKeys.includes(item.id))
      
      // 调用发送邮件API
      for (const record of selectedRecords) {
        await sendEmail(record,currentMonth,projectId)
      }
      
      messageApi.success(t('salarySlipPage.sendSuccess', { count: selectedRecords.length }))
      setSelectedRowKeys([]) // 清空选择
      
      // 刷新数据
      fetchSalarySlips()
    } catch (error) {
      console.error('发送邮件失败:', error)
      messageApi.error(`${t('salarySlipPage.sendError')}: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  // 批量导出PDF处理
  const handleExportPdf = async () => {
    console.log('Selected row keys:', selectedRowKeys)
    if (selectedRowKeys.length === 0) {
      messageApi.warning(t('salarySlipPage.selectRecords'))
      return
    }
    
    try {
      setLoading(true)
      
      // 获取选中的记录
      const selectedRecords = filteredData.filter(item => selectedRowKeys.includes(item.id))
      
      if (selectedRecords.length === 0) {
        messageApi.warning(t('salarySlipPage.selectRecords'))
        return
      }
      // 根据projectId，获取项目名称
      const projectName = await getProjectName(projectId)
      // 为每条记录生成并下载PDF
      generateAndDownloadPDF(selectedRecords,projectName)
      
      messageApi.success(t('salarySlipPage.exportSuccess', { count: selectedRecords.length }))
      
      // 清空选择
      setSelectedRowKeys([])
    } catch (error) {
      console.error('导出PDF失败:', error)
      messageApi.error(t('salarySlipPage.exportError'))
    } finally {
      setLoading(false)
    }
  }
    const handleSingleSendEmail = async (record?: SalarySlipRecord) => {
    // 如果传入了record参数，直接使用该记录；否则使用选中的记录
    let targetRecord: SalarySlipRecord | undefined;
    
    if (record) {
      // 使用传入的单条记录
      targetRecord = record;
    } else {
      // 使用选中的记录（保持原有逻辑）
      console.log('Selected row keys:', selectedRowKeys)
      if (selectedRowKeys.length === 0) {
        messageApi.warning(t('salarySlipPage.selectRecords'))
        return
      }
      const selectedRecords = filteredData.filter(item => selectedRowKeys.includes(item.id))
      if (selectedRecords.length === 0) {
        messageApi.warning(t('salarySlipPage.selectRecords'))
        return
      }
      targetRecord = selectedRecords[0]; // 只处理第一条记录
    }

    try {
      setLoading(true)
      
      // 调用发送邮件API
      await sendEmail(targetRecord,currentMonth,projectId)
      
      messageApi.success(t('salarySlipPage.sendSuccess', { count: 1 }))
      
      // 如果是使用选中记录的方式，清空选择
      if (!record) {
        setSelectedRowKeys([]) // 清空选择
      }
      
      // 刷新数据
      fetchSalarySlips()
    } catch (error) {
      console.error('发送邮件失败:', error)
      messageApi.error(t('salarySlipPage.sendError'))
    } finally {
      setLoading(false)
    }
  }
  // 行选择配置
  const rowSelection: TableProps<SalarySlipRecord>['rowSelection'] = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys)
    },
  }

  // 格式化金额
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // 表格列定义
  const columns: TableColumnsType<SalarySlipRecord> = [
     {
      title: t('common.no'),
      key: 'serial',
      width: 80,
      render: (_, __, index) => {
        // 检查是否正在执行搜索
        // 有搜索时从1开始计数，否则使用分页逻辑
        return isSearching ? index + 1 : (currentPage - 1) * pageSize + index + 1;
      },
    },
    {
      title: t('salarySlipPage.employeeId'),
      dataIndex: 'employee_id',
      key: 'employee_id',
      ellipsis: true,
    },
    {
      title: t('salarySlipPage.employeeName'),
      dataIndex: 'employee_name',
      key: 'employee_name',
      ellipsis: true,
    },
    {
      title: t('salarySlipPage.npwp'),
      dataIndex: 'npwp',
      key: 'npwp',
    },
    {
      title: t('salarySlipPage.idCardNumber'),
      dataIndex: 'id_card',
      key: 'id_card',
    },
    // {
    //   title: t('salarySlipPage.department'),
    //   dataIndex: 'department',
    //   key: 'department',
    //   ellipsis: true,
    // },
  
    {
      title: t('salarySlipPage.lokasi'),
      dataIndex: 'location',
      key: 'location',
      ellipsis: true,  
    },
    
    {
      title: t('salarySlipPage.position'),
      dataIndex: 'position',
      key: 'position',
      ellipsis: true,  
    },
    
    //     {
    //   title: t('salarySlipPage.jabatan'),
    //   dataIndex: 'department',
    //   key: 'department',
    //   ellipsis: true,  
    // },
        {
      title: t('salarySlipPage.tglMasuk'),
      dataIndex: 'joinDate',
      key: 'joinDate',
    },
    // {
    //   title: t('salarySlipPage.joinDate'),
    //   dataIndex: 'joinDate',
    //   key: 'joinDate',
    //   ellipsis: true,
    // },  
    {
      title: t('salarySlipPage.basicSalary'),
      dataIndex: 'basic_salary',
      key: 'basic_salary',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },
    
    {
      title: t('salarySlipPage.houseAllowance'),
      dataIndex: 'housing_alw',
      key: 'housing_alw',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },   
    {
      title: t('salarySlipPage.positionAllowance'),
      dataIndex: 'position_alw',
      key: 'position_alw',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },   

    {
      title: t('salarySlipPage.fieldAllowance'),
      dataIndex: 'field_alw',
      key: 'field_alw',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },   
    {
      title: t('salarySlipPage.totalNetWages'),
      dataIndex: 'total_net_wages',
      key: 'total_net_wages',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    }, 
    {
      title: t('salarySlipPage.housingAlwTidakTetap'),
      dataIndex: 'housing_alw_tetap',
      key: 'housing_alw_tetap',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    }, 
    {
      title: t('salarySlipPage.mealAllowance'),
      dataIndex: 'meal_alw',
      key: 'meal_alw',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    }, 
    {
      title: t('salarySlipPage.pulsaAllowanceMonth'),
      dataIndex: 'pulsa_alw_month',
      key: 'pulsa_alw_month',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    }, 
    {
      title: t('salarySlipPage.jmstkAllowance'),
      dataIndex: 'jmstk_alw',
      key: 'jmstk_alw',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },
    {
      title: t('salarySlipPage.taxAllowanceSalary'),
      dataIndex: 'tax_alw_salary',
      key: 'tax_alw_salary',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },  
    {
      title: t('salarySlipPage.askesBpjsAllowance'),
      dataIndex: 'askes_bpjs_alw',
      key: 'askes_bpjs_alw',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    }, 
    {
      title: t('salarySlipPage.pulsaAllowance'),
      dataIndex: 'pulsa_alw',
      key: 'pulsa_alw',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },     
    {
      title: t('salarySlipPage.attAllowance'),
      dataIndex: 'att_alw',
      key: 'att_alw',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    }, 
    {
      title: t('salarySlipPage.leaveCompensation'),
      dataIndex: 'leave_comp',
      key: 'leave_comp',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    }, 
    {
      title: t('salarySlipPage.medAllowance'),
      dataIndex: 'med_alw',
      key: 'med_alw',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },         
    {
      title: t('salarySlipPage.others'),
      dataIndex: 'others',
      key: 'others',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },       
    {
      title: t('salarySlipPage.religiousAllowance'),
      dataIndex: 'religious_alw',
      key: 'religious_alw',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },
    {
      title: t('salarySlipPage.rapelBasicSalary'),
      dataIndex: 'rapel_basic_salary',
      key: 'rapel_basic_salary',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    }, 
    {
      title: t('salarySlipPage.acting'),
      dataIndex: 'acting',
      key: 'acting',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },
    {
      title: t('salarySlipPage.performanceAllowance'),  
      dataIndex: 'performance_alw',
      key: 'performance_alw',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },   
    {
      title: t('salarySlipPage.tripAllowance'),
      dataIndex: 'trip_alw',
      key: 'trip_alw',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    }, 
    {
      title: t('salarySlipPage.ot1Wages'),
      dataIndex: 'ot1_wages',
      key: 'ot1_wages',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },   
    {
      title: t('salarySlipPage.ot2Wages'),
      dataIndex: 'ot2_wages',
      key: 'ot2_wages',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },    
    {
      title: t('salarySlipPage.ot3Wages'),
      dataIndex: 'ot3_wages',
      key: 'ot3_wages',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },   
    {
      title: t('salarySlipPage.ew1Wages'),
      dataIndex: 'ew1_wages',
      key: 'ew1_wages',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },         
    {
      title: t('salarySlipPage.ew2Wages'),
      dataIndex: 'ew2_wages',
      key: 'ew2_wages',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    }, 
    {
      title: t('salarySlipPage.ew3Wages'),
      dataIndex: 'ew3_wages',
      key: 'ew3_wages',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    }, 
    {
      title: t('salarySlipPage.mandahAllowance'),
      dataIndex: 'mandah_alw',
      key: 'mandah_alw',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },  
    {
      title: t('salarySlipPage.incentiveAllowance'),
      dataIndex: 'incentive_alw',
      key: 'incentive_alw',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },        
    {
      title: t('salarySlipPage.compPHk'),
      dataIndex: 'comp_phk',
      key: 'comp_phk',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },  
    {
      title: t('salarySlipPage.taxAllowancePhk'),
      dataIndex: 'tax_alw_phk',
      key: 'tax_alw_phk',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },     
     {
      title: t('salarySlipPage.correctAdd'),
      dataIndex: 'correct_add',
      key: 'correct_add',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    }, 
    {
      title: t('salarySlipPage.correctSub'),
      dataIndex: 'correct_sub',
      key: 'correct_sub',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },    
    {
      title: t('salarySlipPage.absentDed'),
      dataIndex: 'absent_ded',
      key: 'absent_ded',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },  
    {
      title: t('salarySlipPage.absentDed2'),
      dataIndex: 'absent_ded2',
      key: 'absent_ded2',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },                                      
    {
      title: t('salarySlipPage.incentiveDed'),
      dataIndex: 'incentive_ded',
      key: 'incentive_ded',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    }, 
    {
      title: t('salarySlipPage.loanDed'),
      dataIndex: 'loan_ded',
      key: 'loan_ded',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },         
    {
      title: t('salarySlipPage.taxDedPhk'),
      dataIndex: 'tax_ded_phk',
      key: 'tax_ded_phk',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },                           

    {
      title: t('salarySlipPage.totalAccept'),
      dataIndex: 'totalAccept',
      key: 'totalAccept',
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },    
    {
      title: t('salarySlipPage.astekDeduction'),
      dataIndex: 'jmstk_fee',
      key: 'jmstk_fee',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },
    {
      title: t('salarySlipPage.taxDedSalary'),
      dataIndex: 'tax_ded_salary',
      key: 'tax_ded_salary',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },
    {
      title: t('salarySlipPage.pensionDed'),
      dataIndex: 'pension_ded',
      key: 'pension_ded',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },   
    {
      title: t('salarySlipPage.askesBpjsDeduction'),
      dataIndex: 'askes_bpjs_ded',
      key: 'askes_bpjs_ded',
      ellipsis: true,
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },    
    {
      title: t('salarySlipPage.roundOffSalary'),
      dataIndex: 'round_off_salary',
      key: 'round_off_salary',
      render: (amount) => <ScientificNumberDisplay value={amount} precision={0} />,
    },
    {
      title: t('salarySlipPage.salarySlipStatus'),
      dataIndex: 'salarySlipStatus',
      key: 'salarySlipStatus',
      render: (status) => (status === '1' ? t('common.sent') : t('common.notSent')),
    },
    {
      title: t('common.action'),
      key: 'action',
      render: (_, record) => (
        <span>
        <Button type="primary" onClick={() => handleViewSlip(record)} style={{ marginRight: 5 }}>
          {t('salarySlipPage.viewSlip')}
        </Button>
        <Button type="primary" onClick={() => handleSingleSendEmail(record)} style={{ marginRight: 5 }}>
          {t('common.sendEmail')}
        </Button>   

        </span>
 

      ),
    },
  ]

  return (
    <div style={{ padding: '0px' }}>
      {messageContextHolder}
        {contextHolder}

    <Card  style={{ margin: 0, border: 'none', boxShadow: 'none' }}>
      {/* 表格隔行换色样式 */}
      <style
        type="text/css"
        dangerouslySetInnerHTML={{
          __html: `
            .table-row-light {
              background-color: #ffffff;
            }
            .table-row-dark {
              background-color: #fafafa;
            }
            .table-row-light:hover,
            .table-row-dark:hover {
              background-color: #f5f5f5 !important;
            }
          `
        }}
      />
      {/* 搜索和筛选表单 */}
      <div style={{ marginBottom: 10, width: '100%' }}>
        <Row gutter={5} align="middle" justify="space-between" style={{ width: '100%' }}>
          <Col xs={24} sm={12} md={6} lg={4}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: '14px', whiteSpace: 'nowrap' }}>{t('salarySlipPage.employeeName')}</label>
              <Input 
                placeholder={t('salarySlipPage.employeeName')}
                value={searchFormValues.employeeName}
                onChange={(e) => setSearchFormValues(prev => ({ ...prev, employeeName: e.target.value }))}
                style={{ flex: 1 }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: '14px', whiteSpace: 'nowrap' }}>{t('salarySlipPage.employeeId')}</label>
              <Input 
                placeholder={t('salarySlipPage.employeeId')}
                value={searchFormValues.employee_id}
                onChange={(e) => setSearchFormValues(prev => ({ ...prev, employee_id: e.target.value }))}
                style={{ flex: 1 }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: '14px', whiteSpace: 'nowrap' }}>{t('salarySlipPage.period')}</label>
              <DatePicker
                picker="month"
                value={dayjs(currentMonth)}
                onChange={(date) => {
                  if (date) {
                    setCurrentMonth(date.format('YYYY-MM'))
                  }
                }}
                className="month-picker"
                style={{ flex: 1 }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button type="primary" onClick={handleSearch}>
                {t('common.search')}
              </Button>
              <Button onClick={handleReset}>
                {t('common.reset')}
              </Button>
            </div>
          </Col>
        </Row>

        {/* 操作按钮区域 */}
        <Row style={{ marginTop: 10, width: '100%' }}>
          <Col span={24}>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button type="primary" onClick={handleSelectAll}>
                 {t('salarySlipPage.selectAll')}
              </Button>
              <Button type="primary" onClick={handleSendEmail} loading={loading}>
                {t('salarySlipPage.sendEmail')} ({selectedRowKeys.length})
              </Button>
              <Button type="primary" onClick={handleExportPdf} loading={loading}>
                {t('salarySlipPage.exportPdf')} ({selectedRowKeys.length})
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      {/* 工资条列表 */}
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        pagination={false}
        scroll={{ x: 'max-content', y: 'calc(100vh - 400px)' }}
        loading={loading}
        rowClassName={(_, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}
        locale={{
            emptyText: t('common.noData')
          }}
      />
      
      {/* 分页组件 */}
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'left' }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          pageSizeOptions={['10', '20', '50', '100']}
          showSizeChanger
          showTotal={(total) => t('common.totalRecords', { count: total })}
          total={total}
          onChange={(page) => setCurrentPage(page)}
          onShowSizeChange={(_current, size) => {
            setPageSize(size)
            setCurrentPage(1) // 改变每页条数时回到第一页
          }}
        />
      </div>

      {/* 工资条详情弹窗 */}
      <Modal
        title={t('salarySlipPage.slipDetail')}
        open={slipModalVisible}
        onCancel={() => setSlipModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setSlipModalVisible(false)}>
            {t('common.close')}
          </Button>,
          <Button key="print" type="primary" onClick={() => window.print()}>
            {t('common.print')}
          </Button>,
        ]}
        width={1000}
      >
        {selectedSlip && (
          <>
            {/* Print-only styles */}
            <style
              type="text/css"
              dangerouslySetInnerHTML={{
                __html: `
                  @media print {
                    /* Hide all non-printable elements except the modal */
                    body * {
                      visibility: hidden !important;
                    }

                    /* Show only the modal content */
                    .ant-modal-wrap, .ant-modal-wrap * {
                      visibility: visible !important;
                    }

                    /* Hide modal mask, header and footer */
                    .ant-modal-mask,
                    .ant-modal-header,
                    .ant-modal-footer {
                      display: none !important;
                    }

                    /* Adjust modal styles for printing */
                    .ant-modal {
                      position: static !important;
                      width: 100% !important;
                      height: auto !important;
                      background: transparent !important;
                      margin: 0 !important;
                      padding: 0 !important;
                    }

                    .ant-modal-content {
                      position: static !important;
                      width: 100% !important;
                      background: white !important;
                      margin: 0 !important;
                      padding: 20px !important;
                      border: none !important;
                      box-shadow: none !important;
                    }

                    /* Set page size and margins */
                    @page {
                      size: A4;
                      margin: 20mm;
                    }
                  }
                `
              }}
            ></style>
            {/* Printable content wrapper */}
            <div id="printable-slip-content" style={{ fontFamily: 'Arial, sans-serif' }}>
            {/* 工资条头部 */}
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
              <Title level={3}>SLIP GAJI</Title>
            </div>

            {/* 员工信息 */}
            <div style={{ marginBottom: 30 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label={t('salarySlipPage.bulan')}>{selectedSlip.period}</Descriptions.Item>
                    <Descriptions.Item label={t('salarySlipPage.nama')}>{selectedSlip.employee_name}</Descriptions.Item>
                    <Descriptions.Item label={t('salarySlipPage.nik')}>{selectedSlip.employee_id}</Descriptions.Item>
                    <Descriptions.Item label={t('salarySlipPage.jabatan')}>{selectedSlip.department}</Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col span={12}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label={t('salarySlipPage.npwp')}>{selectedSlip.npwp}</Descriptions.Item>
                    <Descriptions.Item label={t('salarySlipPage.lokasi')}>{selectedSlip.location}</Descriptions.Item>
                    <Descriptions.Item label={t('salarySlipPage.tglMasuk')}>{selectedSlip.joinDate}</Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </div>

            {/* 工资明细 */}
            <div style={{ marginBottom: 30 }}>
              <Row gutter={16}>
                <Col span={12}>
                  {/* <Title level={5}>{t('salarySlipPage.incomeDetails')}</Title> */}
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label={t('salarySlipPage.basicSalary')}>{formatCurrency(selectedSlip.basic_salary)}</Descriptions.Item>
                      <Descriptions.Item label={t('salarySlipPage.fieldAllowance')}>
                        {formatCurrency(selectedSlip.field_alw)}
                      </Descriptions.Item>
                        <Descriptions.Item label={t('salarySlipPage.bpjsAllowance')}>
                        {formatCurrency(selectedSlip.bpjs_alw)}
                      </Descriptions.Item>
                      <Descriptions.Item label={t('salarySlipPage.pulsaAllowance')} >
                        {selectedSlip.pulsaAllowance !== 0
                          ? formatCurrency(selectedSlip.pulsaAllowance)
                          : formatCurrency(selectedSlip.pulsaAllowanceMonth)}
                      </Descriptions.Item>
                     <Descriptions.Item label={t('salarySlipPage.overtimeExtra')}>
                        {formatCurrency(selectedSlip.overtimeExtra)}
                      </Descriptions.Item>
                     <Descriptions.Item label={t('salarySlipPage.attAllowance')}>
                        {formatCurrency(selectedSlip.att_alw)}
                      </Descriptions.Item>                      
                     <Descriptions.Item label={t('salarySlipPage.tjastek')}>
                        {formatCurrency(selectedSlip.transp_alw)}
                      </Descriptions.Item>

                      {/* <Descriptions.Item label={t('salarySlipPage.others')}>{formatCurrency(selectedSlip.others)}</Descriptions.Item> */}
                      {/* <Descriptions.Item label={t('salarySlipPage.jmstkFee')}>{formatCurrency(selectedSlip.jmstk_fee)}</Descriptions.Item> */}
                      <Descriptions.Item label={t('salarySlipPage.taxAlwSalry')}>{formatCurrency(selectedSlip.tax_alw_salary)}</Descriptions.Item>
                      {/* <Descriptions.Item label={t('salarySlipPage.incentiveAlw')}>{formatCurrency(selectedSlip.incentive_alw)}</Descriptions.Item> */}
                     {/* <Descriptions.Item label={t('salarySlipPage.bpjsAllowance')}>{formatCurrency(selectedSlip.bpjsAllowance)}</Descriptions.Item>

                     <Descriptions.Item label={t('salarySlipPage.overtimeExtra')}>{formatCurrency(selectedSlip.overtimeExtra)}</Descriptions.Item>
                    <Descriptions.Item label={t('salarySlipPage.totalAccept')} style={{ fontWeight: 'bold' }}>
                      {formatCurrency(selectedSlip.totalAccept)}
                    </Descriptions.Item> */}
                  </Descriptions>
                </Col>
                <Col span={12}>
                  {/* <Title level={5}>{t('salarySlipPage.deductionDetails')}</Title> */}
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label={t('salarySlipPage.bpjsDeduction')}>{formatCurrency(selectedSlip.bpjsDeduction)}</Descriptions.Item>
                     <Descriptions.Item label={t('salarySlipPage.pphDeduction')}>{formatCurrency(selectedSlip.pphDeduction)}</Descriptions.Item>
                     <Descriptions.Item
                       label={
                         <>
                           {t('salarySlipPage.astekDeduction') + ' 9.89%'}
                           <br />
                           ~6.89% dari perusahaan & 3% dari kary
                         </>
                       }
                     >
                       {formatCurrency(selectedSlip.jmstk_fee + selectedSlip.pension_ded)}
                     </Descriptions.Item>
                    <Descriptions.Item label={t('salarySlipPage.totalAccept')} style={{ fontWeight: 'bold' }}>
                      {formatCurrency(selectedSlip.totalAccept)}
                    </Descriptions.Item>
                     <Descriptions.Item label={t('salarySlipPage.totalTransfer')} style={{ fontWeight: 'bold' }}>
                      {formatCurrency(selectedSlip.totalTransfer)}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </div>

            {/* 备注信息 */}
            <div style={{ textAlign: 'center', marginTop: 40, fontSize: '12px', color: '#666' }}>
              <p>{t('salarySlipPage.slipNote')}</p>
            </div>
          </div>
        </>
      )}
      </Modal>
    </Card>
    </div>
  )
}

export default SalarySlipPage