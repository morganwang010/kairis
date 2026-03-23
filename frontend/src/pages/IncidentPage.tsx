import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import ScientificNumberDisplay from '../components/ScientificNumberDisplay'
import { Card, Table, Button, Modal, Form, Input, DatePicker, Pagination, message,  Upload, Tabs, Checkbox } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, SyncOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { UploadProps } from 'antd'
import * as XLSX from 'xlsx'
import dayjs from 'dayjs'
// const { MonthPicker } = DatePicker;
import { getIncidentRecords, addIncident, updateIncident, deleteIncident, importIncidentRecords, importSingleIncidentRecord,deleteAllIncidentRecords } from '../api/index'
import { getEmployees } from '../api/index'

interface IncidentPageProps {
  projectId?: string
  projectName?: string
}

interface IncidentRecord {
  id: number
  month: string
  project_id: number
  project_name?: string
  employee_id: string
  employee_name?: string
  leave_comp: number
  med_alw: number
  others: number
  religious_alw: number
  rapel_basic_salary: number
  rapel_jmstk_alw: number
  incentive_alw: number
  acting: number
  performance_alw: number
  trip_alw: number
  ot2_wages: number
  ot3_wages: number
  comp_phk: number
  tax_alw_phk: number
  incentive_ded: number
  loan_ded: number
  correct_add: number
  correct_sub: number
  absent_ded: number
  absent_ded2: number
}

interface SheetData {
  [key: string]: any
}

interface ParsedSheet {
  name: string
  data: SheetData[]
  columns: ColumnsType<SheetData>
}

const IncidentPage: React.FC<IncidentPageProps> = ({ projectId = 'all' }) => {
  const { t } = useTranslation()
  const [dialogVisible, setDialogVisible] = useState(false)
  const [importModalVisible, setImportModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  
  const [editingIncident, setEditingIncident] = useState<IncidentRecord | null>(null)
  const [incidentsData, setIncidentsData] = useState<IncidentRecord[]>([])
  const [totalRecords, setTotalRecords] = useState<number>(0)
  
  // 导入相关状态
  const [parsedSheets, setParsedSheets] = useState<ParsedSheet[]>([])
  const [activeTabKey, setActiveTabKey] = useState('')
  const [importLoading, setImportLoading] = useState(false)
  const [singleImportLoading, setSingleImportLoading] = useState<{[key: string]: boolean}>({})
  const [employees, setEmployees] = useState<{id: number; name: string}[]>([])
  const [currentMonth, setCurrentMonth] = useState(dayjs().format('YYYY-MM'))
  const [modal, contextHolder] = Modal.useModal()
  const [messageApi, messageContextHolder] = message.useMessage();
  
  // 选中状态管理
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [filterForm] = Form.useForm()
  const [filterValues, setFilterValues] = useState<{[key: string]: any}>({})
// 页面加载时设定当前月份
  useEffect(() => {
    setCurrentMonth(dayjs().format('YYYY-MM'))
  }, [])

  // 去除空格的函数
  const trimRecord = (record: SheetData): SheetData => {
    const trimmedRecord: SheetData = {}
    Object.keys(record).forEach(key => {
      const value = record[key]
      if (typeof value === 'string') {
        trimmedRecord[key] = value.trim()
      } else {
        trimmedRecord[key] = String(value).trim()
      }
    })
    return trimmedRecord
  }
  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowKeys(incidentsData.map(record => record.id))
    } else {
      setSelectedRowKeys([])
    }
  }

  // 选择/取消选择单行
  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRowKeys(prev => [...prev, id])
    } else {
      setSelectedRowKeys(prev => prev.filter(key => key !== id))
    }
  }

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      messageApi.warning('Please select at least one record to delete.')
      return
    }

    modal.confirm({
      title: 'Delete Selected Records',
      content: `Are you sure you want to delete ${selectedRowKeys.length} selected records?`,
      onOk: async () => {
        try {
          for (const id of selectedRowKeys) {
            await deleteIncident(Number(id))  
          }
          setIncidentsData(incidentsData.filter(item => !selectedRowKeys.includes(item.id)))
          setSelectedRowKeys([])
          messageApi.success('Selected records deleted successfully')
        } catch (error) {
          console.error('Batch delete incident records failed:', error)
          messageApi.error('Delete failed, please try again later')
        }
      },
    })
  }

  // 批量删除
    const handleDeleteAll = () => {
      modal.confirm({
        title: 'Delete All Records for Current Month',
        content: `Are you sure you want to delete all records for ${currentMonth}?`,
        onOk: async () => {
          try {
            await deleteAllIncidentRecords(projectId,currentMonth)  
  
            messageApi.success('All records for current month deleted successfully')
          } catch (error) {
            console.error('Delete all incident records for current month failed:', error) 
            messageApi.error('Delete failed, please try again later')
          }
        },
      })
    }


  // 加载员工列表
  const loadEmployees = async () => {
    try {
      const empData = await getEmployees();
      // 确保empData是一个数组
      if (Array.isArray(empData)) {
        setEmployees(empData.map((emp: any) => ({ id: emp.employee_id || emp.id, name: emp.name })));
      } else if (empData && Array.isArray(empData.data)) {
        // 如果empData是一个对象，且包含data数组
        setEmployees(empData.data.map((emp: any) => ({ id: emp.employee_id || emp.id, name: emp.name })));
      } else if (empData && Array.isArray(empData.list)) {
        // 如果empData是一个对象，且包含list数组
        setEmployees(empData.list.map((emp: any) => ({ id: emp.employee_id || emp.id, name: emp.name })));
      } else {
        console.error('Invalid employee data format:', empData);
        setEmployees([]);
      }
      employees.forEach(emp => {
        form.setFieldValue(`employee_name_${emp.id}`, emp.name)
      })
    } catch (error) {
      console.error(t('incidentPage.loadEmployeesError'), error);
      messageApi.error(t('incidentPage.loadEmployeesError'));
      setEmployees([]);
    }
  }

  // 加载偶发事件数据
  const loadIncidents = async () => {
    try {
      // console.log("the incident projectId:", projectId)
        const params: any = {
          month: currentMonth,
          page: currentPage,
          page_size: pageSize,
          project_id: projectId,
          ...filterValues
        }
 
        console.log('加载偶发事件数据参数:', params)
        const response = await getIncidentRecords(projectId, currentMonth)
        console.log('加载偶发事件数据响应:', response)
        
        // 确保response是一个对象
        if (response) {
          // 检查response.data是否存在且是一个对象
          if (response.data) {
            // 检查response.data.list是否存在且是一个数组
            if (Array.isArray(response.data.list)) {
              setIncidentsData(response.data.list)
              setTotalRecords(response.data.total || 0)
            } else if (Array.isArray(response.data)) {
              // 如果response.data直接是一个数组
              setIncidentsData(response.data)
              setTotalRecords(response.data.length)
            } else {
              console.error('Invalid incident data format:', response.data)
              setIncidentsData([])
              setTotalRecords(0)
            }
          } else if (Array.isArray(response)) {
            // 如果response直接是一个数组
            setIncidentsData(response)
            setTotalRecords(response.length)
          } else {
            console.error('Invalid response format:', response)
            setIncidentsData([])
            setTotalRecords(0)
          }
        } else {
          console.error('Empty response:', response)
          setIncidentsData([])
          setTotalRecords(0)
        }
      
    } catch (error) {
      console.error(t('incidentPage.loadIncidentsError'), error)
      messageApi.error(t('incidentPage.loadIncidentsError'))
      setIncidentsData([])
      setTotalRecords(0)
    }
  }

  // 根据projectId加载数据
  useEffect(() => {
    loadEmployees();
    loadIncidents();
  }, [projectId, currentMonth, currentPage, pageSize, filterValues])


  // 打开编辑对话框
  const openEditDialog = (row: IncidentRecord) => {
    setEditingIncident(row)
    form.setFieldsValue({
      ...row,
      month: dayjs(row.month) // Convert string to dayjs object for MonthPicker compatibility
    })
    setDialogVisible(true)
  }

  // 删除记录
  const handleDelete = async (id: number)  => {
    console.log(t('common.startDeleteIncident') + id);
    
    modal.confirm({
      title: t('incidentPage.confirmDelete'),
      content: t('incidentPage.confirmDelete'),
      okText: t('common.confirm'),
      cancelText: t('common.cancel'),
      onOk: async () => {
        try {
          console.log(id)
          await deleteIncident(id);
          
          // 更新本地状态
          setIncidentsData(prevData => prevData.filter(item => item.id !== id));
          
          messageApi.success(t('incidentPage.deleteSuccess'));
        } catch (error) {
          console.error('删除失败:', error);
          messageApi.error(t('incidentPage.deleteError'));
        }
      }
    });
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await trimRecord(form.validateFields())
      
      if (editingIncident) {
        // 更新记录
        await updateIncident({ ...values, id: editingIncident.id })
        setIncidentsData(prev => prev.map(incident => 
          incident.id === editingIncident.id ? { ...incident, ...values } : incident
        ))
        messageApi.success(t('incidentPage.updateSuccess'))
      } else {
        // 添加新记录
        const newRecord = { ...values, project_id: parseInt(projectId) }
        await addIncident(newRecord)
        messageApi.success(t('incidentPage.addSuccess'))
        // 重新加载数据
        loadIncidents()
      }
      setDialogVisible(false)
    } catch (error) {
      console.error(t('incidentPage.submitError'), error)
      messageApi.error(editingIncident ? t('incidentPage.updateError') : t('incidentPage.addError'))
    }
  }

  // 处理员工选择变化
  // const handleEmployeeChange = (value: number) => {
  //   const selectedEmployee = employees.find(emp => emp.id === value)
  //   if (selectedEmployee) {
  //     form.setFieldsValue({ employee_name: selectedEmployee.name })
  //   }
  // }
  
  // 处理Excel文件上传
  const handleUpload: UploadProps['onChange'] = ({ file }) => {
    if (file.name) {
      processFile(file)
    } else {
      messageApi.error(t('incidentUploadPage.invalidFile'))
    }
    
    if (file.status === 'error') {
      messageApi.error(t('incidentUploadPage.uploadError'))
    } else if (file.status === 'removed') {
      // 当文件被移除时，清空解析结果
      setParsedSheets([])
      setActiveTabKey('')
    }
  }
  
  // 处理单条记录导入
  const handleSingleImport = async (record: SheetData, index: number) => {
    try {
      setSingleImportLoading(prev => ({ ...prev, [`${activeTabKey}-${index}`]: true }))
      
      // 去除空格
      const trimmedRecord = trimRecord(record)
      
      // 构建事件记录数据
      const incidentRecord = {
        employee_id: trimmedRecord['员工ID'] || trimmedRecord['employee_id'] || trimmedRecord['工号'] || trimmedRecord['Employee_Id'],
        project_id: projectId === 'all' ? 0 : parseInt(projectId),
        month: trimmedRecord['月份'] || trimmedRecord['month'] || trimmedRecord['Month'] || new Date().toISOString().slice(0, 7),
        leave_comp: trimmedRecord['Leave_Comp'] || trimmedRecord['leave_comp'] || 0,
        med_alw: trimmedRecord['Med_Alw'] || trimmedRecord['med_alw'] || 0,
        others: trimmedRecord['Others'] || trimmedRecord['others'] || 0,
        religious_alw: trimmedRecord['Religious_Alw'] || trimmedRecord['religious_alw'] || 0,
        rapel_basic_salary: trimmedRecord['Rapel_Basic_Salary'] || trimmedRecord['rapel_basic_salary'] || 0,
        rapel_jmstk_alw: trimmedRecord['Rapel_Jmstk_Alw'] || trimmedRecord['rapel_jmstk_alw'] || 0,
        incentive_alw: trimmedRecord['Incentive_Alw'] || trimmedRecord['incentive_alw'] || 0,
        acting: trimmedRecord['Acting'] || trimmedRecord['acting'] || 0,
        performance_alw: trimmedRecord['Performance_Alw'] || trimmedRecord['performance_alw'] || 0,
        trip_alw: trimmedRecord['Trip_Alw'] || trimmedRecord['trip_alw'] || 0,
        ot2_wages: trimmedRecord['OT2_Wages'] || trimmedRecord['ot2_wages'] || 0,
        ot3_wages: trimmedRecord['OT3_Wages'] || trimmedRecord['ot3_wages'] || 0,
        comp_phk: trimmedRecord['Comp_Phk'] || trimmedRecord['comp_phk'] || 0,
        tax_alw_phk: trimmedRecord['Tax_Alw_Phk'] || trimmedRecord['tax_alw_phk'] || 0,
        absent_ded: trimmedRecord['Absent_ded'] || trimmedRecord['absent_ded'] || 0,
        absent_ded2: trimmedRecord['Absent_Ded2'] || trimmedRecord['absent_ded2'] || 0,
        incentive_ded: trimmedRecord['Incentive_Ded'] || trimmedRecord['incentive_ded'] || 0,
        loan_ded: trimmedRecord['Loan_Ded'] || trimmedRecord['loan_ded'] || 0,
        correct_add: trimmedRecord['Correct_Add'] || trimmedRecord['correct_add'] || 0,
        correct_sub: trimmedRecord['Correct_Sub'] || trimmedRecord['correct_sub'] || 0,
        tax_ded_phk: trimmedRecord['Tax_Ded_Phk'] || trimmedRecord['tax_ded_phk'] || 0,
        mandah_alw: trimmedRecord['Mandah_Alw'] || trimmedRecord['mandah_alw'] || 0
      }
      
      // 检查必要字段
      if (!incidentRecord.employee_id) {
        messageApi.error(t('incidentUploadPage.missingEmployeeId'))
        return
      }
      
      await importSingleIncidentRecord(incidentRecord)
      messageApi.success(t('common.success'))
    } catch (error) {
      console.error(t('incidentPage.importFailed'), error)
      messageApi.error(t('incidentPage.importFailed'))
    } finally {
      setSingleImportLoading(prev => ({ ...prev, [`${activeTabKey}-${index}`]: false }))
    }
  }
  
  // 处理全部导入
  const handleImportAll = async () => {
    try {
      setImportLoading(true)
      
      // 获取当前激活的工作表
      const currentSheet = parsedSheets.find(sheet => sheet.name === activeTabKey)
      if (!currentSheet) {
        messageApi.error(t('incidentUploadPage.noActiveSheet'))
        return
      }
      
      // 转换数据格式
      const records = currentSheet.data.map(record => {
        // 去除空格
        const trimmedRecord = trimRecord(record)
        
        return {
          employee_id: trimmedRecord['employee_id'] || trimmedRecord['Employee_Id'],
          project_id: projectId === 'all' ? 0 : (projectId),
          month: trimmedRecord['month'] || trimmedRecord['Month'] || new Date().toISOString().slice(0, 7),
          leave_comp: trimmedRecord['Leave_Comp'] || trimmedRecord['leave_comp'] || "0",
          med_alw: trimmedRecord['Med_Alw'] || trimmedRecord['med_alw'] || "0",
          others: trimmedRecord['Others'] || trimmedRecord['others'] || "0",
          religious_alw: trimmedRecord['Religious_Alw'] || trimmedRecord['religious_alw'] || "0",
          rapel_basic_salary: trimmedRecord['Rapel_Basic_Salary'] || trimmedRecord['rapel_basic_salary'] || "0",
          rapel_jmstk_alw: trimmedRecord['Rapel_Jmstk_Alw'] || trimmedRecord['rapel_jmstk_alw'] || "0",
          incentive_alw: trimmedRecord['Incentive_Alw'] || trimmedRecord['incentive_alw'] || "0",
          acting: trimmedRecord['Acting'] || trimmedRecord['acting'] || "0",
          performance_alw: trimmedRecord['Performance_Alw'] || trimmedRecord['performance_alw'] || "0",
          trip_alw: trimmedRecord['Trip_Alw'] || trimmedRecord['trip_alw'] || "0",
          ot2_wages: trimmedRecord['OT2_Wages'] || trimmedRecord['ot2_wages'] || "0",
          ot3_wages: trimmedRecord['OT3_Wages'] || trimmedRecord['ot3_wages'] || "0",
          comp_phk: trimmedRecord['Comp_Phk'] || trimmedRecord['comp_phk'] || "0",
          tax_alw_phk: trimmedRecord['Tax_Alw_Phk'] || trimmedRecord['tax_alw_phk'] || "0",
          absent_ded: trimmedRecord['Absent_ded'] || trimmedRecord['absent_ded'] || "0",
          absent_ded2: trimmedRecord['Absent_Ded2'] || trimmedRecord['absent_ded2'] || "0",
          incentive_ded: trimmedRecord['Incentive_Ded'] || trimmedRecord['incentive_ded'] || "0",
          loan_ded: trimmedRecord['Loan_Ded'] || trimmedRecord['loan_ded'] || "0",
          correct_add: trimmedRecord['Correct_Add'] || trimmedRecord['correct_add'] || "0",
          correct_sub: trimmedRecord['Correct_Sub'] || trimmedRecord['correct_sub'] || "0",
          tax_ded_phk: trimmedRecord['Tax_Ded_Phk'] || trimmedRecord['tax_ded_phk'] || "0",
          mandah_alw: trimmedRecord['Mandah_Alw'] || trimmedRecord['mandah_alw'] || "0"
        }
      }).filter(record => record.employee_id)
      
      if (records.length === 0) {
        messageApi.error(t('incidentUploadPage.noValidRecords'))
        return
      }
      console.log('incident records:', records)
      
      await importIncidentRecords(records)
      messageApi.success(t('common.success'))
      loadIncidents() // 导入成功后重新加载数据
      setImportModalVisible(false);
        // 重置导入状态
      setParsedSheets([]);
      setActiveTabKey('');
    } catch (error) {
      console.error(t('incidentPage.batchImportFailed'), error)
      messageApi.error(t('incidentPage.batchImportFailed'))
    } finally {
      setImportLoading(false)
    }
  }
  
  // 单独的文件处理函数
  const processFile = (file: any) => {
    try {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          
          if (!data) {
            messageApi.error(t('common.error'))
            return
          }
          
          const workbook = XLSX.read(data, { type: 'array' })
          const sheets: ParsedSheet[] = []
          
          workbook.SheetNames.forEach((sheetName) => {
            const worksheet = workbook.Sheets[sheetName]
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
              header: 'A',
              raw: false,
              range: 0
            })
            
            // 处理表头，假设第一行是表头
            const headerRow = jsonData[0]
            
            if (!headerRow) {
              return
            }
            
            // 创建映射，将字母列名转换为实际表头名
            const headerMapping: { [key: string]: string } = {}
            Object.keys(headerRow).forEach((key) => {
              let headerValue = (headerRow as Record<string, any>)[key]
              if (headerValue && typeof headerValue === 'string') {
                headerValue = headerValue.trim()
                headerMapping[key] = headerValue
              }
            })
            
            // 处理数据行，跳过表头行
            const processedData: SheetData[] = []
            for (let i = 1; i < jsonData.length; i++) {
              const row = jsonData[i]
              const processedRow: SheetData = {}
              let hasData = false
              
              Object.keys(row as Record<string, any>).forEach((key) => {
                const headerName = headerMapping[key]
                const cellValue = (row as Record<string, any>)[key]
                
                if (headerName) {
                  processedRow[headerName] = cellValue
                  if (cellValue !== undefined && cellValue !== null && cellValue !== '') {
                    hasData = true
                  }
                }
              })
              
              if (hasData || Object.keys(processedRow).length > 0) {
                processedData.push(processedRow)
              }
            }
            
            // 生成表格列配置
            const columns: ColumnsType<SheetData> = Object.values(headerMapping).map((header, index) => ({
              title: header,
              dataIndex: header,
              key: `column-${index}`,
              ellipsis: true,
              render: (text) => {
                if (text instanceof Date) {
                  return text.toLocaleDateString()
                }
                return text || ''
              }
            }))
            
            // 添加操作列
            columns.push({
              title: t('common.action'),
              // fixed: 'right',
              key: 'action',
              render: (_, record, index) => (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="small"
                  onClick={() => handleSingleImport(record, index)}
                  loading={singleImportLoading[`${sheetName}-${index}`]}
                >
                  {t('incidentUploadPage.insert')}
                </Button>
              )
            })
            
            sheets.push({
              name: sheetName,
              data: processedData,
              columns
            })
          })
          
          setParsedSheets(sheets)
          
          if (sheets.length > 0) {
            setActiveTabKey(sheets[0].name)
            messageApi.success(t('common.success'))
          } else {
            message.warning(t('common.noData'))
          }
        } catch (error) {
          console.error(t('incidentPage.excelParseError'), error)
          messageApi.error(t('incidentPage.excelParseError'))
        }
      }
      
      reader.onerror = (error) => {
        console.error(t('incidentPage.fileReadError'), error)
        messageApi.error(t('incidentPage.fileReadError'))
      }
      
      reader.readAsArrayBuffer(file)
    } catch (error) {
      console.error(t('incidentPage.fileProcessError'), error)
      messageApi.error(t('incidentPage.fileProcessError'))
    }
  }
  
  // 配置上传组件
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls',
    beforeUpload: (file) => {
      // 检查文件类型
      const isExcel = file.type === 'application/vnd.ms-excel' || 
                      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                      file.name.endsWith('.xls') || 
                      file.name.endsWith('.xlsx')
      
      if (!isExcel) {
        messageApi.error(t('incidentUploadPage.uploadError'))
        return Upload.LIST_IGNORE
      }
      
      // 检查文件大小（这里设置为10MB）
      const isLessThan10M = file.size / 1024 / 1024 < 10
      if (!isLessThan10M) {
        messageApi.error(t('incidentUploadPage.maxSize'))
        return Upload.LIST_IGNORE
      }
      
      // 返回false阻止默认上传行为
      return false
    },
    onChange: handleUpload,
    showUploadList: true,
    fileList: [],
    customRequest: ({ onSuccess }) => {
      if (onSuccess) {
        setTimeout(() => onSuccess('ok'), 0)
      }
    },
  }

  // 表格列配置
  const columns: ColumnsType<IncidentRecord> = [
    {
      title: (
        <Checkbox
          type="checkbox"
          checked={selectedRowKeys.length === incidentsData.length && incidentsData.length > 0}
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
      ),
      key: 'selection',
      width: 60,
      render: (_, record: IncidentRecord) => (
        <Checkbox
          type="checkbox"
          checked={selectedRowKeys.includes(record.id)}
          onChange={(e) => handleSelectRow(record.id, e.target.checked)}
        />
      ),
    },
    {
      title: t('common.no'),
      key: 'index',
      width: 80,
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    { title: t('incidentPage.month'), dataIndex: 'month', key: 'month', width: 120 },
    { title: t('incidentPage.employeeName'), dataIndex: 'employee_name', key: 'employee_name', width: 120 },
    { title: t('incidentPage.employeeId'), dataIndex: 'employee_id', key: 'employee_id', width: 120 },
    { title: t('incidentPage.leaveComp'), dataIndex: 'leave_comp', key: 'leave_comp', width: 120, render: (text) => text > 0 ? <ScientificNumberDisplay value={text} /> : '-' },
    { title: t('incidentPage.medAlw'), dataIndex: 'med_alw', key: 'med_alw', width: 120, render: (text) => text > 0 ? <ScientificNumberDisplay value={text} /> : '-' },
    { title: t('incidentPage.others'), dataIndex: 'others', key: 'others', width: 120, render: (text) => text > 0 ? <ScientificNumberDisplay value={text} /> : '-' },
    { title: t('incidentPage.religiousAlw'), dataIndex: 'religious_alw', key: 'religious_alw', width: 120, render: (text) => text > 0 ? <ScientificNumberDisplay value={text} /> : '-' },
    { title: t('incidentPage.rapelBasicSal'), dataIndex: 'rapel_basic_salary', key: 'rapel_basic_salary', width: 120, render: (text) => text > 0 ? <ScientificNumberDisplay value={text} /> : '-' },
    { title: t('incidentPage.rapelJmstkAlw'), dataIndex: 'rapel_jmstk_alw', key: 'rapel_jmstk_alw', width: 120, render: (text) => text > 0 ? <ScientificNumberDisplay value={text} /> : '-' },
    { title: t('incidentPage.incentiveAlw'), dataIndex: 'incentive_alw', key: 'incentive_alw', width: 120, render: (text) => text > 0 ? <ScientificNumberDisplay value={text} /> : '-' },
    { title: t('incidentPage.acting'), dataIndex: 'acting', key: 'acting', width: 120, render: (text) => text > 0 ? <ScientificNumberDisplay value={text} /> : '-' },
    { title: t('incidentPage.performanceAlw'), dataIndex: 'performance_alw', key: 'performance_alw', width: 120, render: (text) => text > 0 ? <ScientificNumberDisplay value={text} /> : '-' },
    { title: t('incidentPage.tripAlw'), dataIndex: 'trip_alw', key: 'trip_alw', width: 120, render: (text) => text > 0 ? <ScientificNumberDisplay value={text} /> : '-' },
    { title: t('incidentPage.mandahAlw'), dataIndex: 'mandah_alw', key: 'mandah_alw', width: 120, render: (text) => text > 0 ? <ScientificNumberDisplay value={text} /> : '-' },
    { title: t('incidentPage.otWages2'), dataIndex: 'ot2_wages', key: 'ot2_wages', width: 120, render: (text) => text > 0 ? <ScientificNumberDisplay value={text} /> : '-' },
    { title: t('incidentPage.otWages3'), dataIndex: 'ot3_wages', key: 'ot3_wages', width: 120, render: (text) => text > 0 ? <ScientificNumberDisplay value={text} /> : '-' },
    { title: t('incidentPage.compPhk'), dataIndex: 'comp_phk', key: 'comp_phk', width: 120, render: (text) => text > 0 ? <ScientificNumberDisplay value={text} /> : '-' },
    { title: t('incidentPage.taxAlwPhk'), dataIndex: 'tax_alw_phk', key: 'tax_alw_phk', width: 120, render: (text) => text > 0 ? <ScientificNumberDisplay value={text} /> : '-' },
    { title: t('incidentPage.absentDed2'), dataIndex: 'absent_ded2', key: 'absent_ded2', width: 120, render: (text) => text > 0 ? <ScientificNumberDisplay value={text} /> : '-' },
    { title: t('incidentPage.incentiveDed'), dataIndex: 'incentive_ded', key: 'incentive_ded', width: 120, render: (text) => text > 0 ? <ScientificNumberDisplay value={text} /> : '-' },
    { title: t('incidentPage.loanDed'), dataIndex: 'loan_ded', key: 'loan_ded', width: 120, render: (text) => text > 0 ? <ScientificNumberDisplay value={text} /> : '-' },
    { title: t('incidentPage.correctAdd'), dataIndex: 'correct_add', key: 'correct_add', width: 120, render: (text) => text > 0 ? <ScientificNumberDisplay value={text} /> : '-' },
    { title: t('incidentPage.correctSub'), dataIndex: 'correct_sub', key: 'correct_sub', width: 120, render: (text) => text > 0 ? <ScientificNumberDisplay value={text} /> : '-' },
    { title: t('incidentPage.taxDedPhk'), dataIndex: 'tax_ded_phk', key: 'tax_ded_phk', width: 120, render: (text) => text > 0 ? <ScientificNumberDisplay value={text} /> : '-' },
    {
      title: t('common.action'),
      key: 'action',
      
      width: 180,
      // fixed: 'right',
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
          <Button
            size="small"
             danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            {t('common.delete')}
          </Button>
          {/* <Popconfirm
            title="确定删除该记录吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
                删除
              </Button>
          </Popconfirm> */}
        </span>
      ),
    },
  ]
// 导出Excel下载功能
  const handleExportToExcel = () => {
    if (incidentsData.length === 0) {
      messageApi.warning('没有数据可导出');
      return;
    }
    // 准备导出数据，使用表格列标题作为Excel列名
    const exportData = incidentsData.map(record => {  
      const row: { [key: string]: any } = {};
      const cols = columns;
      cols.forEach(column => {
        if ('dataIndex' in column && column.title && column.dataIndex) {
          // 使用列标题作为键，确保导出的Excel有正确的列名
          row[column.title as string] = record[column.dataIndex as keyof IncidentRecord];
        }
      });
      return row;
    });
    // 创建工作簿和工作表
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, '-incidentRecords');
    // 生成Excel文件并下载
    const excelFileName = `incidentRecords_${currentMonth}.xlsx`;
    XLSX.writeFile(workbook, excelFileName);
    messageApi.success('Excel导出成功');
  } 
// 处理筛选表单提交
  const handleFilterSubmit = () => {
    filterForm.validateFields().then(values => {
      const formattedValues = {
        ...values,
        // 确保month字段是字符串形式
        month: values.month ? values.month.format('YYYY-MM') : undefined
      }
      console.log('筛选参数:', formattedValues)
      setFilterValues(formattedValues)
      setCurrentPage(1) // 筛选时回到第一页
      
      // 直接使用formattedValues调用loadIncidents的逻辑，而不是依赖于状态更新
      const newCurrentPage = 1
      const params: any = {
        month: currentMonth.toString(),
        page: newCurrentPage,
        page_size: pageSize,
        project_id: projectId,
        ...formattedValues
      }
      
      // 手动执行loadIncidents的逻辑，使用新的参数
      try {
        console.log('加载偶发事件数据参数:', params)
        
        // 直接调用getIncidentRecords，使用新的参数
        getIncidentRecords(projectId, currentMonth.toString()).then(response => {
          console.log('加载偶发事件数据响应:', response)
          setIncidentsData((response as any).data)
          setTotalRecords((response as any).total)
        }).catch(error => {
          console.error(t('incidentPage.loadIncidentsError'), error)
          messageApi.error(t('incidentPage.loadIncidentsError'))
          setIncidentsData([])
          setTotalRecords(0)
        })
      } catch (error) {
        console.error(t('incidentPage.loadIncidentsError'), error)
        messageApi.error(t('incidentPage.loadIncidentsError'))
        setIncidentsData([])
        setTotalRecords(0)
      }
    })
  }
  
  // 处理筛选表单重置
  const handleFilterReset = () => {
    filterForm.resetFields()
    setFilterValues({})
    // 重置后设置month字段为当前月份
    filterForm.setFieldsValue({
      month: dayjs(currentMonth)
    })
    loadIncidents()
  }

  return (
    <div style={{ padding: '0px' }}>
       {contextHolder}
       {messageContextHolder}           
      <Card >
       <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
               <div className="header-actions">

                {/* 筛选表单 */}
                          <div style={{ flex: 1 }}>
                          <Form form={filterForm} layout="inline" style={{ marginBottom: 1 }}>
                            <Form.Item name="employee_id" label={t('employeePage.employeeId')}>
                              <Input placeholder={t('employeePage.enterEmployeeId')} />
                            </Form.Item>
                            <Form.Item name="name" label={t('employeePage.employeeName')}>
                              <Input placeholder={t('employeePage.enterEmployeeName')} />
                            </Form.Item>
                            <Form.Item name="month" label={t('attendancePage.month')} initialValue={dayjs(currentMonth)}>
                              <DatePicker
                                picker="month"
                                onChange={(date) => {
                                  if (date) {
                                    setCurrentMonth(date.format('YYYY-MM'))
                                  }
                                }}
                                className="month-picker"
                              />
                            </Form.Item>
                             <Form.Item>
                              <Button type="primary" onClick={handleFilterSubmit} style={{ marginRight: 8 }}>{t('common.search')}</Button>
                              <Button onClick={handleFilterReset}>{t('common.reset')}</Button>
                            </Form.Item>
                          </Form>
                          
                          </div>
{/*                            
                 <DatePicker
                   picker="month"
                   value={dayjs(currentMonth)}
                   onChange={(date) => {
                     if (date) {
                       setCurrentMonth(date.format('YYYY-MM'))
                     }
                   }}
                   className="month-picker"
                 /> */}
            
               </div>
              <div>
              {/* <Button type="primary" icon={<PlusOutlined />} onClick={() => {
              setEditingIncident(null)
              form.resetFields()
              setDialogVisible(true)
            }} style={{ marginRight: 8 }}>
              {t('incidentPage.addIncident')}
            </Button> */}
                {/* {selectedRowKeys.length > 0 && (
                  <Button 
                    type="primary" 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={handleBatchDelete}
                    style={{ marginRight: 8 }}
                  >
                    {t('common.batchDelete')} ({selectedRowKeys.length})
                  </Button>
                )} */}
                <Button type="primary" icon={<UploadOutlined />} onClick={() => setImportModalVisible(true)}>
                  {t('incidentPage.import')}
                </Button>
                <Button type="primary" onClick={handleExportToExcel} style={{ marginLeft: 8 }}>
                  {t('incidentPage.exportToExcel')}
                </Button>
              </div>
             </div> 
                        {/* 操作栏 */}
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                  <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleBatchDelete}
                    disabled={selectedRowKeys.length === 0}
                    style={{ marginRight: 8 }}
                  >
                    {t('employeePage.batchDelete')} ({selectedRowKeys.length})
                  </Button>
                  <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleDeleteAll}
                    disabled={selectedRowKeys.length === 0}
                    style={{ marginRight: 8 }}
                  >
                    {t('common.deleteAll')} 
                  </Button>
                </div>
        <Table 
          columns={columns} 
          dataSource={incidentsData} 
          rowKey="id"
          style={{ width: '100%' }}
          pagination={false}
          scroll={{ x: 'max-content', y: 'calc(100vh - 450px)' }}
        />
        
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          pageSizeOptions={['10', '20', '50', '100']}
          showSizeChanger
          showTotal={(total) => t('common.totalRecords', { count: total })}
          total={totalRecords}
          onChange={(page) => setCurrentPage(page)}
          onShowSizeChange={(_, size) => {
            setPageSize(size)
            setCurrentPage(1)
          }}
          style={{ marginTop: 20, textAlign: 'center' }}
        />
      </Card>
      
      <Modal
        title={t('incidentPage.title')}
        open={importModalVisible}
        onCancel={() => {
          setImportModalVisible(false)
          setParsedSheets([])
          setActiveTabKey('')
        }}
        footer={null}
        width={1200}
        bodyStyle={{ maxHeight: '700px', overflowY: 'auto' }}
      >
        <div style={{ marginBottom: 20, textAlign: 'center' }}>
          <Upload.Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">{t('incidentPage.dragFile')} {t('incidentPage.clickToUpload')}</p>
            <p className="ant-upload-hint">
              {t('incidentPage.supportedFormats')}，{t('incidentPage.maxSize')}
            </p>
          </Upload.Dragger>
        </div>

        {parsedSheets.length > 0 ? (
          <div>
            <div style={{ marginBottom: 20, textAlign: 'center' }}>
              <Button
                type="primary"
                icon={<SyncOutlined />}
                onClick={handleImportAll}
                loading={importLoading}
              >
                {t('common.importAll')}
              </Button>
            </div>
            <Tabs
              activeKey={activeTabKey}
              onChange={setActiveTabKey}
              items={parsedSheets.map((sheet) => ({
                key: sheet.name,
                label: sheet.name,
                children: (
                  <div style={{ marginTop: 20 }}>
                    <Table
                      columns={sheet.columns}
                      dataSource={sheet.data}
                      rowKey={(_, index) => `row-${index}`}
                      pagination={{ pageSize: 10 }}
                      scroll={{ x: 'max-content' }}
                      locale={{
                        emptyText: t('common.noData')
                      }}
                    />
                  </div>
                ),
              }))}
              style={{ width: '100%' }}
            />
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: 60, 
            backgroundColor: '#f5f5f5', 
            borderRadius: 8,
            color: '#999'
          }}>
            <p>{t('common.noData')}</p>
          </div>
        )}
      </Modal>
      
      {/* 编辑对话框 */}
      <Modal
        title={editingIncident ? t('incidentPage.editIncident') : t('incidentPage.addIncident')}
        open={dialogVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setDialogVisible(false)
          setEditingIncident(null)
          form.resetFields()
        }}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            month: dayjs(),
            leave_comp: 0,
            med_alw: 0,
            others: 0,
            religious_alw: 0,
            rapel_basic_salary: 0,
            rapel_jmstk_alw: 0,
            incentive_alw: 0,
            acting: 0,
            performance_alw: 0,
            trip_alw: 0,
            mandah_alw: 0,
            ot2_wages: 0,
            ot3_wages: 0,
            comp_phk: 0,
            tax_alw_phk: 0,
            absent_ded2: 0,
            incentive_ded: 0,
            loan_ded: 0,
            correct_add: 0,
            correct_sub: 0,
            tax_ded_phk: 0,
          }}
        >
          <Form.Item
            label={t('incidentPage.month')}
            name="month"
            rules={[{ required: true, message: t('incidentPage.monthRequired') }]}
          >
            <DatePicker picker="month" style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            label={t('incidentPage.employeeId')}
            name="employee_id"
            rules={[{ required: true, message: t('incidentPage.employeeIdRequired') }]}
          >
            <Input />
          </Form.Item>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h4>{t('incidentPage.compensationSection')}</h4>
              <Form.Item label={t('incidentPage.leaveComp')} name="leave_comp">
                <Input type="number" />
              </Form.Item>
              <Form.Item label={t('incidentPage.medAlw')} name="med_alw">
                <Input type="number" />
              </Form.Item>
              <Form.Item label={t('incidentPage.others')} name="others">
                <Input type="number" />
              </Form.Item>
              <Form.Item label={t('incidentPage.religiousAlw')} name="religious_alw">
                <Input type="number" />
              </Form.Item>
            </div>
            
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h4>{t('incidentPage.rapelSection')}</h4>
              <Form.Item label={t('incidentPage.rapelBasicSal')} name="rapel_basic_salary">
                <Input type="number" />
              </Form.Item>
              <Form.Item label={t('incidentPage.rapelJmstkAlw')} name="rapel_jmstk_alw">
                <Input type="number" />
              </Form.Item>
            </div>
            
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h4>{t('incidentPage.incentiveSection')}</h4>
              <Form.Item label={t('incidentPage.incentiveAlw')} name="incentive_alw">
                <Input type="number" />
              </Form.Item>
              <Form.Item label={t('incidentPage.acting')} name="acting">
                <Input type="number" />
              </Form.Item>
              <Form.Item label={t('incidentPage.performanceAlw')} name="performance_alw">
                <Input type="number" />
              </Form.Item>
              <Form.Item label={t('incidentPage.tripAlw')} name="trip_alw">
                <Input type="number" />
              </Form.Item>
              <Form.Item label={t('incidentPage.mandahAlw')} name="mandah_alw">
                <Input type="number" />
              </Form.Item>
            </div>
            
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h4>{t('incidentPage.otSection')}</h4>
              <Form.Item label={t('incidentPage.otWages2')} name="ot2_wages">
                <Input type="number" />
              </Form.Item>
              <Form.Item label={t('incidentPage.otWages3')} name="ot3_wages">
                <Input type="number" />
              </Form.Item>
              <Form.Item label={t('incidentPage.compPhk')} name="comp_phk">
                <Input type="number" />
              </Form.Item>
              <Form.Item label={t('incidentPage.taxAlwPhk')} name="tax_alw_phk">
                <Input type="number" />
              </Form.Item>
            </div>
            
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h4>{t('incidentPage.deductionSection')}</h4>
              <Form.Item label={t('incidentPage.absentDed2')} name="absent_ded2">
                <Input type="number" />
              </Form.Item>
              <Form.Item label={t('incidentPage.incentiveDed')} name="incentive_ded">
                <Input type="number" />
              </Form.Item>
              <Form.Item label={t('incidentPage.loanDed')} name="loan_ded">
                <Input type="number" />
              </Form.Item>
            </div>
            
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h4>{t('incidentPage.correctionSection')}</h4>
              <Form.Item label={t('incidentPage.correctAdd')} name="correct_add">
                <Input type="number" />
              </Form.Item>
              <Form.Item label={t('incidentPage.correctSub')} name="correct_sub">
                <Input type="number" />
              </Form.Item>
              <Form.Item label={t('incidentPage.taxDedPhk')} name="tax_ded_phk">
                <Input type="number" />
              </Form.Item>
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default IncidentPage
