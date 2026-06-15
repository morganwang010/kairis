import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getSalarySlips, sendEmail, generateAndDownloadPDF, getProjectName } from '../api'
import { Card, Input, Button, Table, Modal,  Row, Col, DatePicker, message, Pagination} from 'antd'
import type { TableColumnsType, TableProps } from 'antd';

import dayjs from 'dayjs'
import ScientificNumberDisplay from '../components/ScientificNumberDisplay'

// const { Title } = Typography

interface SalarySlipPageProps {
  projectId?: string
  projectName?: string
}

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
  position: string;
  project_name: string;
  project_id: string;  // 添加 project_id 字段
  
  basic_salary: number;
  operational_alw: number;
  housing_alw: number;
  seniority_alw: number;
  transport_alw: number;
  field_alw: number;
  accommodation_alw: number;
  total_fixed_alw: number;
  
  thr: number;
  bonus: number;
  compensation: number;
  acting_alw: number;
  salary_prorate: number;
  other_non_fixed: number;
  work_prorate: number;
  work_alw: number;
  osoa_alw: number;
  ovt_alw: number;
  bt_alw: number;
  t_alw: number;
  tnt_alw: number;
  al_alw: number;
  rot_alw: number;
  tr_alw: number;
  st_alw: number;
  ls_alw: number;
  on_alw: number;
  ot_alw: number;
  total_non_fixed_alw: number;
  
  q_ded: number;
  pl_ded: number;
  late_ded: number;
  sc_ded: number;
  sc1_ded: number;
  co_ded: number;
  pm_ded: number;
  na_ded: number;
  salary_ded: number;
  
  gross_salary: number;
  
  bpjs_work_ded: number;
  bpjs_health_ded: number;
  bpjs_health_tambahan: number;
  tax_ded: number;
  total_bpjs_tax_ded: number;
  
  final_staff_receive: number;
  
  meal_alw: number;
  pulsaAllowance: number;
  pulsaAllowanceMonth: number;
  overtimeExtra: number;
  bpjsDeduction: number;
  pphDeduction: number;
  astekDeduction: number;
  totalAccept: number;
  totalTransfer: number;
  final_salary: number;
  fix_alw: number;
  jmstk_fee: number;
  pension_ded: number;
  others: number;
  tax_alw_salary: number;
  email: string;
  pulsa_alw?: number;
  housing_alw_tetap?: number;
  religious_alw?: number;
  rapel_basic_salary?: number;
  rapel_jmstk_alw?: number;
  acting?: number;
  performance_alw?: number;
  trip_alw?: number;
  
  annualleave: number;
  salary_slip_status: number;
 
  age?: number;
  post_function_alw_month?: number;
  phone_alw_month?: number;
  internet_alw_month?: number;
  incentive_month?: number;
  operational_alw_month?: number;
  housing_alw_month?: number;
  seniority_alw_month?: number;
  transport_alw_month?: number;
  field_alw_month?: number;
  accommodation_alw_month?: number;
  work_day?: number;
  on_day?: number;
  bt_day?: number;
  oa_day?: number;
  travell_day?: number;
  tnt_day?: number;
  st_day?: number;
  tr_day?: number;
  w?: number;
  ons?: number;
  os?: number;
  oa?: number;
  ot?: number;
  ovt?: number;
  bt?: number;
  t?: number;
  al?: number;
  rot?: number;
  st?: number;
  ls?: number;
  q?: number;
  wfh?: number;
  pl?: number;
  l?: number;
  sc?: number;
  sc1?: number;
  co?: number;
  pm?: number;
  na?: number;
  jkk_alw?: number;
  jkm_alw?: number;
  jht_alw?: number;
  jp_alw?: number;
  bpjs_manpower_alw?: number;
  bpjs_health_alw?: number;
  jht_ded?: number;
  jp_ded?: number;
  total_deduction?: number;
  total_bpjs_health_ded?: number;
  bpjs_health_tambahan_status?: string;
  date_of_birth?: string;
  rapel?: number;
  tax_alw?: number;
  other_add?: number;
  other_ded?: number;
}

const SalarySlipPage: React.FC<SalarySlipPageProps> = ({  projectId = 'all',  projectName }) => {
  const { t } = useTranslation();
  const [selectedSlip, setSelectedSlip] = useState<SalarySlipRecord | null>(null)
  const [slipModalVisible, setSlipModalVisible] = useState(false)
  const [filteredData, setFilteredData] = useState<SalarySlipRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(dayjs().format('YYYY-MM'))
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [messageApi, messageContextHolder] = message.useMessage();
  const [ _, contextHolder] = Modal.useModal();
  
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  
  const [searchFormValues, setSearchFormValues] = useState({
    employeeName: '',
    employee_id: ''
  });
  const [_isSearching, setIsSearching] = useState(false);

  const transformBackendData = (backendData: any[]): SalarySlipRecord[] => {
    if (!backendData || !Array.isArray(backendData)) {
      return [];
    }
    return backendData.map(item => ({
      id: item.id?.toString() || '',
      project_name: projectName || '',
      employee_name: item.employee_name || '',
      employee_id: item.employee_id?.toString() || '',
      id_card: item.id_card || '',
      department: item.department || '',
      period: item.month || '',
      npwp: item.npwp || '',
      location: item.location || '',
      joinDate: item.join_date || '',
      position: item.position || '',
      // project_name: item.project_name || '',
      project_id: item.project_id?.toString() || '',
      
      basic_salary: item.basic_salary || 0,
      post_function_alw: item.post_function_alw || 0,
      phone_alw: item.phone_alw || 0,
      internet_alw: item.internet_alw || 0,
      incentive: item.incentive || 0,
      operational_alw: item.operational_alw || 0,
      housing_alw: item.housing_alw || 0,
      seniority_alw: item.seniority_alw || 0,
      transport_alw: item.transport_alw || 0,
      field_alw: item.field_alw || 0,
      accommodation_alw: item.accommodation_alw || 0,
      total_fixed_alw: item.total_fixed_alw || 0,
      
      thr: item.thr || 0,
      bonus: item.bonus || 0,
      compensation: item.compensation || 0,
      acting_alw: item.acting_alw || 0,
      salary_prorate: item.salary_prorate || 0,
      other_non_fixed: item.other_non_fixed || 0,
      work_prorate: item.work_prorate || 0,
      work_alw: item.work_alw || 0,
      osoa_alw: item.osoa_alw || 0,
      ovt_alw: item.ovt_alw || 0,
      bt_alw: item.bt_alw || 0,
      t_alw: item.t_alw || 0,
      tnt_alw: item.tnt_alw || 0,
      al_alw: item.al_alw || 0,
      rot_alw: item.rot_alw || 0,
      tr_alw: item.tr_alw || 0,
      st_alw: item.st_alw || 0,
      ls_alw: item.ls_alw || 0,
      on_alw: item.on_alw || 0,
      ot_alw: item.ot_alw || 0,
      total_non_fixed_alw: item.total_non_fixed_alw || 0,
      
      q_ded: item.q_ded || 0,
      pl_ded: item.pl_ded || 0,
      late_ded: item.late_ded || 0,
      sc_ded: item.sc_ded || 0,
      sc1_ded: item.sc1_ded || 0,
      co_ded: item.co_ded || 0,
      pm_ded: item.pm_ded || 0,
      na_ded: item.na_ded || 0,
      salary_ded: item.salary_ded || 0,
      
      gross_salary: item.gross_salary || 0,
      
      bpjs_work_ded: item.bpjs_work_ded || 0,
      bpjs_health_ded: item.bpjs_health_ded || 0,
      bpjs_health_tambahan: item.bpjs_health_tambahan || 0,
      tax_ded: item.tax_ded || 0,
      total_bpjs_tax_ded: item.total_bpjs_tax_ded || 0,
      
      final_staff_receive: item.final_staff_receive || 0,

      meal_alw: item.meal_alw || 0,
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
      pulsaAllowanceMonth: item.pulsa_alw_month || 0,
      jmstk_alw: item.jmstk_alw || 0,
      others: item.others || 0,
      tax_alw_salary: item.tax_alw_salary || 0,
      incentive_alw: item.incentive_alw || 0,
      email: item.email || '',
      bpjs_alw: item.bpjs_alw || 0,
      position_alw: item.position_alw || 0,
      pension_alw: item.pension_alw || 0,
      tax_alw_phk: item.tax_alw_phk || 0,
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
      annualleave: item.annualleave || 0,
      salary_slip_status: item.salary_slip_status || 0,
      pulsa_alw_month: item.pulsa_alw_month || 0,
      
      age: item.age,
      post_function_alw_month: item.post_function_alw_month,
      phone_alw_month: item.phone_alw_month,
      internet_alw_month: item.internet_alw_month,
      incentive_month: item.incentive_month,
      operational_alw_month: item.operational_alw_month,
      housing_alw_month: item.housing_alw_month,
      seniority_alw_month: item.seniority_alw_month,
      transport_alw_month: item.transport_alw_month,
      field_alw_month: item.field_alw_month,
      accommodation_alw_month: item.accommodation_alw_month,
      work_day: item.work_day,
      on_day: item.on_day,
      bt_day: item.bt_day,
      oa_day: item.oa_day,
      travell_day: item.travell_day,
      tnt_day: item.tnt_day,
      st_day: item.st_day,
      tr_day: item.tr_day,
      w: item.w,
      ons: item.ons,
      os: item.os,
      oa: item.oa,
      ot: item.ot,
      ovt: item.ovt,
      bt: item.bt,
      t: item.t,
      al: item.al,
      rot: item.rot,
      st: item.st,
      ls: item.ls,
      q: item.q,
      wfh: item.wfh,
      pl: item.pl,
      l: item.l,
      sc: item.sc,
      sc1: item.sc1,
      co: item.co,
      pm: item.pm,
      na: item.na,
      jkk_alw: item.jkk_alw,
      jkm_alw: item.jkm_alw,
      jht_alw: item.jht_alw,
      jp_alw: item.jp_alw,
      bpjs_manpower_alw: item.bpjs_manpower_alw,
      bpjs_health_alw: item.bpjs_health_alw,
      jht_ded: item.jht_ded,
      jp_ded: item.jp_ded,
      total_deduction: item.total_deduction,
      total_bpjs_health_ded: item.total_bpjs_health_ded,
      bpjs_health_tambahan_status: item.bpjs_health_tambahan_status,
      date_of_birth: item.date_of_birth,
      rapel: item.rapel,
      tax_alw: item.tax_alw,
      other_add: item.other_add,
      other_ded: item.other_ded,
    }))
  }

  const fetchSalarySlips = async (params?: any) => {
    setLoading(true)
    try {
      const queryParams = {
        month: currentMonth,
        project_id: projectId,
        page: currentPage,
        pageSize: pageSize,
        ...params
      }
      const response = await getSalarySlips(queryParams)
      const backendData = response.data 
      const totalCount = response.total 
      let transformedData = transformBackendData(backendData)
      
      for (const item of transformedData) {
        if (!item.project_name && item.project_id) {
          const projectName = await getProjectName(item.project_id)
          item.project_name = projectName
        }
      }
      
      setFilteredData(transformedData)
      setTotal(totalCount)
      
      if (!params || (!params.employee_id && !params.employee_name)) {
        setIsSearching(false)
      }
    } catch (error) {
      console.error('获取工资条数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSalarySlips()
  }, [projectId, currentMonth, currentPage, pageSize])

  const handleSearch = () => {
    setIsSearching(true);
    const searchParams: any = {
      month: currentMonth,
      project_id: projectId,
      page: 1,
      pageSize: 10,
    }

    if (searchFormValues.employee_id !== undefined && searchFormValues.employee_id !== null && searchFormValues.employee_id !== '') {
      searchParams.employee_id = searchFormValues.employee_id
    }

    if (searchFormValues.employeeName !== undefined && searchFormValues.employeeName !== null && searchFormValues.employeeName !== '') {
      searchParams.employee_name = searchFormValues.employeeName
    }

    fetchSalarySlips(searchParams)
  }

  const handleReset = () => {
    setSearchFormValues({ employeeName: '', employee_id: '' });
    // setIsSearching(false);
    fetchSalarySlips();
  }

  const handleViewSlip = (record: SalarySlipRecord) => {
    setSelectedSlip(record)
    setSlipModalVisible(true)
  }

  const handleSelectAll = () => {
    const allKeys = filteredData.map(item => item.id)
    const isAllSelected = selectedRowKeys.length === allKeys.length && selectedRowKeys.length > 0
    if (isAllSelected) {
      setSelectedRowKeys([])
    } else {
      setSelectedRowKeys(allKeys)
    }
  }

  const handleSendEmail = async () => {
    if (selectedRowKeys.length === 0) {
      messageApi.warning(t('salarySlipPage.selectRecords'))
      return
    }

    try {
      setLoading(true)
      const selectedRecords = filteredData.filter(item => selectedRowKeys.includes(item.id))
      
      for (const record of selectedRecords) {
        await sendEmail(record, currentMonth, projectId)
      }
      
      messageApi.success(t('salarySlipPage.sendSuccess', { count: selectedRecords.length }))
      setSelectedRowKeys([])
      fetchSalarySlips()
    } catch (error) {
      console.error('发送邮件失败:', error)
      messageApi.error(`${t('salarySlipPage.sendError')}: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const handleExportPdf = async () => {
    if (selectedRowKeys.length === 0) {
      messageApi.warning(t('salarySlipPage.selectRecords'))
      return
    }
    
    try {
      setLoading(true)
      
      const selectedRecords = filteredData.filter(item => selectedRowKeys.includes(item.id))
      
      if (selectedRecords.length === 0) {
        messageApi.warning(t('salarySlipPage.selectRecords'))
        return
      }
      const projectName = await getProjectName(projectId)
      generateAndDownloadPDF(selectedRecords, projectName)
      
      messageApi.success(t('salarySlipPage.exportSuccess', { count: selectedRecords.length }))
      setSelectedRowKeys([])
    } catch (error) {
      console.error('导出PDF失败:', error)
      messageApi.error(t('salarySlipPage.exportError'))
    } finally {
      setLoading(false)
    }
  }

  const handleSingleSendEmail = async (record?: SalarySlipRecord) => {
    let targetRecord: SalarySlipRecord | undefined;
    
    if (record) {
      targetRecord = record;
    } else {
      if (selectedRowKeys.length === 0) {
        messageApi.warning(t('salarySlipPage.selectRecords'))
        return
      }
      const selectedRecords = filteredData.filter(item => selectedRowKeys.includes(item.id))
      if (selectedRecords.length === 0) {
        messageApi.warning(t('salarySlipPage.selectRecords'))
        return
      }
      targetRecord = selectedRecords[0];
    }

    try {
      setLoading(true)
      await sendEmail(targetRecord, currentMonth, projectId)
      messageApi.success(t('salarySlipPage.sendSuccess', { count: 1 }))
      
      if (!record) {
        setSelectedRowKeys([])
      }
      
      fetchSalarySlips()
    } catch (error) {
      console.error('发送邮件失败:', error)
      messageApi.error(t('salarySlipPage.sendError'))
    } finally {
      setLoading(false)
    }
  }

  const rowSelection: TableProps<SalarySlipRecord>['rowSelection'] = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys)
    },
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // 表格列定义 - 参考NewSalaryPage.tsx简化版
  const columns: TableColumnsType<SalarySlipRecord> = [
    {
      title: t('common.no'),
      key: 'serialNo',
      width: 60,
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    { 
      title: t('employeePage.projectName'), 
      dataIndex: 'project_name', 
      key: 'project_name', 
      width: 150,
      render: () => projectName || '-',
    },
    {
      title: t('newSalaryPage.month'),
      dataIndex: 'month',
      key: 'month',
      width: 100,
    },
    {
      title: t('newSalaryPage.employeeName'),
      dataIndex: 'employee_name',
      key: 'employee_name',
      width: 120,
    },
    {
      title: t('newSalaryPage.employeeId'),
      dataIndex: 'employee_id',
      key: 'employee_id',
      width: 120,
    },
    { 
      title: t('employeePage.taxStatus'), 
      dataIndex: 'tax_type', 
      key: 'tax_type', 
      width: 80 
    },
    { 
      title: t('employeePage.bpjsHealthTambahanStatus'), 
      dataIndex: 'bpjs_health_tambahan_status', 
      key: 'bpjs_health_tambahan_status', 
      width: 150 
    },
    { 
      title: t('employeePage.position'), 
      dataIndex: 'position', 
      key: 'position', 
      width: 120 
    },
    { 
      title: t('employeePage.hireDate'), 
      dataIndex: 'join_date', 
      key: 'join_date', 
      width: 120, 
      render: (text: string) => text !== "-" && text !== "" ? dayjs(text, 'YYYY-MM-DD').format('YYYY-MM-DD') : '-' 
    },
    { 
      title: t('employeePage.resignDate'), 
      dataIndex: 'resign_date', 
      key: 'resign_date', 
      width: 120, 
      render: (text: string) => text !== "" && text !== "0001-01-01T00:00:00Z" ? dayjs(text, 'YYYY-MM-DD').format('YYYY-MM-DD') : '-' 
    },
    { 
      title: t('employeePage.dateOfBirth'), 
      dataIndex: 'date_of_birth', 
      key: 'date_of_birth', 
      width: 150,
      render: (text: string) => text !== "" && text !== "0001-01-01T00:00:00Z" ? dayjs(text, 'YYYY-MM-DD').format('YYYY-MM-DD') : '-' 
    },
    { 
      title: t('employeePage.email'), 
      dataIndex: 'email', 
      key: 'email', 
      width: 180 
    },
    { 
      title: t('employeePage.basicSalary'), 
      dataIndex: 'basic_salary', 
      key: 'basic_salary', 
      width: 120, 
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} /> 
    },
    { 
      title: t('newSalaryPage.totalFixedAllowance'), 
      dataIndex: 'total_fixed_alw', 
      key: 'total_fixed_alw', 
      width: 150,
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} /> 
    },
    { 
      title: t('newSalaryPage.totalNonFixedAllowance'), 
      dataIndex: 'total_non_fixed_alw', 
      key: 'total_non_fixed_alw', 
      width: 150,
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} /> 
    },
    { 
      title: t('newSalaryPage.grossSalary'), 
      dataIndex: 'gross_salary', 
      key: 'gross_salary', 
      width: 120,
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} /> 
    },
    { 
      title: t('newSalaryPage.bpjsWorkDeduction'), 
      dataIndex: 'bpjs_work_ded', 
      key: 'bpjs_work_ded', 
      width: 140,
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} /> 
    },
    { 
      title: t('newSalaryPage.bpjsHealthDeduction'), 
      dataIndex: 'bpjs_health_ded', 
      key: 'bpjs_health_ded', 
      width: 150,
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} /> 
    },
    { 
      title: t('newSalaryPage.taxDed'), 
      dataIndex: 'tax_ded', 
      key: 'tax_ded', 
      width: 100,
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} /> 
    },
    { 
      title: t('newSalaryPage.totalDeduction'), 
      dataIndex: 'total_deduction', 
      key: 'total_deduction', 
      width: 130,
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} /> 
    },
    { 
      title: t('newSalaryPage.finalStaffReceive'), 
      dataIndex: 'final_staff_receive', 
      key: 'final_staff_receive', 
      width: 150,
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} /> 
    },
    {
      title: t('common.action'),
      key: 'action',
      width: 180,
      render: (_, record) => (
        <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button type="primary" onClick={() => handleViewSlip(record)} size="small">
            {t('salarySlipPage.viewSlip')}
          </Button>
          <Button type="primary" onClick={() => handleSingleSendEmail(record)} size="small">
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

      <Card style={{ margin: 0, border: 'none', boxShadow: 'none' }}>
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
              setCurrentPage(1)
            }}
          />
        </div>

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
              <style
                type="text/css"
                dangerouslySetInnerHTML={{
                  __html: `
                    @media print {
                      body * {
                        visibility: hidden !important;
                      }

                      .ant-modal-wrap, .ant-modal-wrap * {
                        visibility: visible !important;
                      }

                      .ant-modal-mask,
                      .ant-modal-header,
                      .ant-modal-footer {
                        display: none !important;
                      }

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

                      @page {
                        size: A4;
                        margin: 20mm;
                      }
                    }
                  `
                }}
              ></style>
              <div id="printable-slip-content" style={{ fontFamily: 'Arial, sans-serif' }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Great Wall Drilling Company</div>
                  <div style={{ fontSize: '12px' }}>GWDC</div>
                </div>

                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', textDecoration: 'underline' }}>PAYROLL SLIP</div>
                </div>

                <div style={{ marginBottom: 20, padding: '10px', border: '1px solid #000' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontWeight: 'bold' }}>Employee_Name:</span> {selectedSlip.employee_name}
                    </div>
                    <div>
                      <span style={{ fontWeight: 'bold' }}>Project:</span> {selectedSlip.project_name || '-'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontWeight: 'bold' }}>Designation:</span> {selectedSlip.position || selectedSlip.department}
                    </div>
                    <div>
                      <span style={{ fontWeight: 'bold' }}>Month:</span> {selectedSlip.period}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: 15 }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontWeight: 'bold', borderTop: '1px solid #000', borderBottom: '1px solid #000', paddingTop: '5px' }}>
                    <span>Fixed_Alw:</span>
                    <span>{formatCurrency(selectedSlip.total_fixed_alw)}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Basic_Salary</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.basic_salary)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Post_Function</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.post_function_alw_month ?? 0)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Phone_Alw</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.phone_alw_month ?? 0)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Internet_Alw</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.internet_alw_month ?? 0)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Incentive</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.incentive_month ?? 0)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Operational</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.operational_alw_month ?? 0)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Housing_Alw</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.housing_alw_month ?? 0)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Seniority</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.seniority_alw_month ?? 0)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Transport_Alw</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.transport_alw_month ?? 0)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Field_Alw</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.field_alw_month ?? 0)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Accomodation</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.accommodation_alw_month ?? 0)}</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: 15 }}>
                  {/* <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '10px' }}>Non_Fixed_Alw:</div> */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontWeight: 'bold', borderTop: '1px solid #000', borderBottom: '1px solid #000', paddingTop: '5px' }}>
                    <span>Non_Fixed_Alw</span>
                    <span>{formatCurrency(selectedSlip.total_non_fixed_alw)}</span>
                  </div>
                 
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>THR</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.thr)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Bonus</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.bonus)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Compensation</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.compensation)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Acting_Alw</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.acting_alw)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Salary_Prorate</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.salary_prorate)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Other</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.other_non_fixed)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Work_Prorate</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.work_prorate)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Work_Alw</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.work_alw)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>OSOA_Alw</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.osoa_alw)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>OVT_Alw</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.ovt_alw)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>BT_Alw</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.bt_alw)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>On_Alw</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.on_alw)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>OT_Alw</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.ot_alw)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>T_Alw</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.t_alw)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>TNT_Alw</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.tnt_alw)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>AL_Alw</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.al_alw)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>ROT_Alw</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.rot_alw)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>TR_Alw</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.tr_alw)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>ST_Alw</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.st_alw)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>LS_Alw</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.ls_alw)}</span>
                    </div>
                  </div>

                </div>

                <div style={{ marginBottom: 15 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontWeight: 'bold', borderTop: '1px solid #000',borderBottom: '1px solid #000', paddingTop: '5px' }}>
                    <span>Salary_Ded</span>
                    <span>{formatCurrency(selectedSlip.q_ded + selectedSlip.pl_ded + selectedSlip.late_ded + selectedSlip.sc_ded + selectedSlip.sc1_ded + selectedSlip.co_ded + selectedSlip.pm_ded + selectedSlip.na_ded + selectedSlip.salary_ded)}</span>
                  </div>                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Q_Ded</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.q_ded)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>PL_Ded</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.pl_ded)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Late_Ded</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.late_ded)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>SC_Ded</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.sc_ded)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>SC1_Ded</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.sc1_ded)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>CO_Ded</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.co_ded)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>PM_Ded</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.pm_ded)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>NA_Ded</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.na_ded)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Other</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.salary_ded)}</span>
                    </div>
                  </div>
                  {/* <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontWeight: 'bold', borderTop: '1px solid #000', paddingTop: '5px' }}>
                    <span>Total Salary Deduction</span>
                    <span>{formatCurrency(selectedSlip.q_ded + selectedSlip.pl_ded + selectedSlip.late_ded + selectedSlip.sc_ded + selectedSlip.sc1_ded + selectedSlip.co_ded + selectedSlip.pm_ded + selectedSlip.na_ded + selectedSlip.salary_ded)}</span>
                  </div> */}
                </div>

                {/* <div style={{ marginBottom: 15, padding: '10px',  }}> */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontWeight: 'bold', borderTop: '1px solid #000',borderBottom: '1px solid #000', paddingTop: '5px' }}>
                    <span>Gross Salary:</span>
                    <span>{formatCurrency(selectedSlip.gross_salary)}</span>
                  </div>    
                {/* </div> */}
<br/>
                <div style={{ marginBottom: 15 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontWeight: 'bold', borderTop: '1px solid #000',borderBottom: '1px solid #000', paddingTop: '5px' }}>
                    <span>BPJS/TAX_Ded:</span>
                     <span style={{ marginLeft: 'auto' }}>{formatCurrency(selectedSlip.bpjs_work_ded + selectedSlip.bpjs_health_ded  + selectedSlip.tax_ded)}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>BPJS_Work_Ded</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.bpjs_work_ded)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>BPJS_Health_Ded</span>
                      <span style={{ marginLeft: '20px' }}>{formatCurrency(selectedSlip.bpjs_health_ded + selectedSlip.bpjs_health_tambahan)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Tax_Ded</span>
                      <span style={{ marginLeft: 'auto' }}>{formatCurrency(selectedSlip.tax_ded)}</span>
                    </div>
                  </div>
                  {/* <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontWeight: 'bold', borderTop: '1px solid #000', paddingTop: '5px' }}>
                    <span>Total BPJS/TAX Deduction</span>
                    <span>{formatCurrency(selectedSlip.total_bpjs_tax_ded)}</span>
                  </div> */}
                </div>

                <div style={{ padding: '15px', border: '2px solid #000', marginTop: '20px' }}>
                  <div style={{ fontWeight: 'bold', textDecoration: 'underline', marginBottom: '10px', textAlign: 'center' }}>Final_Staff_Receive:</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px' }}>
                    <span>Final Staff Receive</span>
                    <span>{formatCurrency(selectedSlip.final_staff_receive)}</span>
                  </div>
                </div>

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
