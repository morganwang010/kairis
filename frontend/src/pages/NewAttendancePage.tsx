import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Table, Button, Modal, Form, Input, DatePicker, InputNumber, message, Card, Upload, Tabs, Checkbox, Pagination } from 'antd'
import { EditOutlined, DeleteOutlined, UploadOutlined, SyncOutlined } from '@ant-design/icons'
import * as XLSX from 'xlsx'
import type { ColumnsType } from 'antd/es/table'
import type { UploadProps } from 'antd'
import dayjs from 'dayjs'

import { getAttendanceRecords, addAttendanceRecord, updateAttendanceRecord, deleteAttendanceRecord, importAttendanceRecords, importSingleAttendanceRecord ,deleteAllAttendanceRecord} from '../api'
interface AttendancePageProps {
  projectId?: string
  projectName?: string
}

interface AttendanceRecord {
  id: string
  employee_id: string
  employee_name: string
  position: string
  project: string
  month: string // YYYY-MM format
  work: number
  off: number
  permission: number
  sick: number
  standby: number
  ew: number
  leave_replc: number
  absent: number
  unpresent: number
  extrawork: number
  ot1: number
  ew1: number
  ew2: number
  ew3: number

  days: Record<number, string> // day number to status (W, O, etc.)
}

interface SheetData {
  [key: string]: any
}

interface ParsedSheet {
  name: string
  data: SheetData[]
  columns: ColumnsType<SheetData>
}



const NewAttendancePage: React.FC<AttendancePageProps> = ({ projectId = 'all', projectName = '所有项目' }) => {
  const { t } = useTranslation()
  const [messageApi, msgContextHolder] = message.useMessage()
  const [data, setData] = useState<AttendanceRecord[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null)
  const [form] = Form.useForm()
  const [currentMonth, setCurrentMonth] = useState(dayjs().format('YYYY-MM'))
  const [loading, setLoading] = useState(false)
  const [importModalVisible, setImportModalVisible] = useState(false) // 导入考勤模态框状态
  // 导入考勤相关状态
  const [parsedSheets, setParsedSheets] = useState<ParsedSheet[]>([])
  const [activeTabKey, setActiveTabKey] = useState('')
  const [importLoading, setImportLoading] = useState(false)
  const [singleImportLoading, setSingleImportLoading] = useState<{[key: string]: boolean}>({})
  const [modal, contextHolder] = Modal.useModal();
  // 选中状态管理
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  // 点击行高亮状态
  const [highlightedRowId, setHighlightedRowId] = useState<string | null>(null)
  // 分页状态管理
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [filterForm] = Form.useForm()
  const [filterValues, setFilterValues] = useState<{[key: string]: any}>({})

  // 数据刷新后恢复高亮状态
  useEffect(() => {
    if (highlightedRowId) {
      setTimeout(() => {
        const row = document.querySelector(`.ant-table-tbody tr[data-row-key="${highlightedRowId}"]`);
        if (row) {
          const tds = row.querySelectorAll('td');
          tds.forEach(td => {
            (td as HTMLElement).style.backgroundColor = '#e6f7ff';
          });
        }
      }, 100);
    }
  }, [data, highlightedRowId, currentPage]);
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
        trimmedRecord[key] = value
      }
    })
    return trimmedRecord
  }
  

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowKeys(data.map(record => record.id))
    } else {
      setSelectedRowKeys([])
    }
  }

  // 选择/取消选择单行
  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRowKeys(prev => [...prev, id])
    } else {
      setSelectedRowKeys(prev => prev.filter(key => key !== id))
    }
  }

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      messageApi.warning('请至少选择一条记录')
      return
    }

    modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 条记录吗？`,
      onOk: async () => {
        try {
          for (const id of selectedRowKeys) {
            await deleteAttendanceRecord(Number(id).toString())  
          }
          setData(data.filter(item => !selectedRowKeys.includes(item.id)))
          setSelectedRowKeys([])
          messageApi.success('批量删除成功')
        } catch (error) {
          console.error('批量删除考勤记录失败:', error)
          messageApi.error('删除失败，请稍后重试')
        }
      },
    })
  }

  // 批量删除
  const handleDeleteAll = () => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除当前月的记录吗？`,
      onOk: async () => {
        try {
          await deleteAllAttendanceRecord(projectId,currentMonth)  

          messageApi.success('当前月全部删除成功')
        } catch (error) {
          console.error('当前月删除考勤记录失败:', error)
          messageApi.error('删除失败，请稍后重试')
        }
      },
    })
  }
  
  // 处理导入成功后的刷新
  const handleImportSuccess = () => {
    // 刷新考勤数据
    loadAttendanceData()
    // 关闭导入模态框
    setImportModalVisible(false)
    // 重置导入状态
    setParsedSheets([])
    setActiveTabKey('')
  }

  // 处理Excel文件上传
  const handleUpload: UploadProps['onChange'] = ({ file }) => {
    console.log('文件上传状态变更:', file.status, '文件名:', file)
    console.log('文件状态:', file.originFileObj)
    console.log('project_id:', projectId)
    
    // 当文件被添加（无论状态如何），立即开始处理
    if (file.name) {
      console.log('开始处理文件:', file.name)
      processFile(file)
    } else {
      console.error('文件对象无效或不存在:', file.originFileObj)
      messageApi.error(t('attendanceUploadPage.invalidFile'))
    }
    
    // 处理其他状态
    if (file.status === 'error') {
      console.error('文件上传失败')
      messageApi.error(t('attendanceUploadPage.uploadError'))
    } else if (file.status === 'removed') {
      console.log('文件已移除')
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
      
      // 构建考勤记录数据
      const attendanceRecord = {
        employee_id: trimmedRecord['Employee_Id'],
        project_id: projectId,
        project_name: trimmedRecord['Project_Name'] || projectName,
        month: trimmedRecord['Month'] || new Date().toISOString().slice(0, 7),
        work: trimmedRecord['In'] || "0",
        off: trimmedRecord['Off'] || "0",
        permission: trimmedRecord['Permission'] || "0",
        unpresent: trimmedRecord['Unpresent'] || "0",
        sick: trimmedRecord['Sick'] || "0",
        standby: trimmedRecord['SB'] || trimmedRecord['Standby'] || "0",
        leave_replc: trimmedRecord['Leave_Replc'] || trimmedRecord['AnnualLeave'] || "0",
        absent: trimmedRecord['A'] || trimmedRecord['Absent'] || "0",
        ew: trimmedRecord['EW'] || trimmedRecord['ExtraWork'] || "0",
        ot1: trimmedRecord['OT1'] || trimmedRecord['OT1'] || "0",
        ew1: trimmedRecord['EW1'] || trimmedRecord['ExtraWork1'] || "0",
        ew2: trimmedRecord['EW2'] || trimmedRecord['ExtraWork2'] || "0",
        ew3: trimmedRecord['EW3'] || trimmedRecord['ExtraWork3'] || "0",
        days: {}
      }
      
      // 检查必要字段
      if (!attendanceRecord.employee_id) {
        messageApi.error(t('attendanceUploadPage.missingEmployeeId'))
        return
      }
      
      const result = await importSingleAttendanceRecord(attendanceRecord)
      messageApi.success(String(result) || '导入成功')
    } catch (error) {
      console.error('导入失败:', error)
      messageApi.error(t('attendanceUploadPage.importError'))
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
        messageApi.error(t('attendanceUploadPage.noActiveSheet'))
        return
      }
      
      // 转换数据格式
      const records = currentSheet.data.map(record => {
        // 去除空格
        const trimmedRecord = trimRecord(record)
        
        return {
        employee_id: trimmedRecord['Employee_Id'],
        project_id: projectId,
        project_name: trimmedRecord['Project_Name'] || projectName,
        month: trimmedRecord['Month'] || new Date().toISOString().slice(0, 7),
        work: trimmedRecord['In'] || "0",
        off: trimmedRecord['Off'] || "0",
        permission: trimmedRecord['Permission'] || "0",
        unpresent: trimmedRecord['Unpresent'] || "0",
        sick: trimmedRecord['Sick'] || "0",
        standby: trimmedRecord['SB'] || trimmedRecord['Standby'] || "0",
        leave_replc: trimmedRecord['Leave_Replc'] || trimmedRecord['AnnualLeave'] || "0",
        absent: trimmedRecord['A'] || trimmedRecord['Absent'] || "0",
        ew: trimmedRecord['EW'] || trimmedRecord['ExtraWork'] || "0",
        ot1: trimmedRecord['OT1'] || trimmedRecord['OT1'] || "0",
        ot2: trimmedRecord['OT2'] || trimmedRecord['OT2'] || "0",
        ot3: trimmedRecord['OT3'] || trimmedRecord['OT3'] || "0",
        ew1: trimmedRecord['EW1'] || trimmedRecord['ExtraWork1'] || "0",
        ew2: trimmedRecord['EW2'] || trimmedRecord['ExtraWork2'] || "0",
        ew3: trimmedRecord['EW3'] || trimmedRecord['ExtraWork3'] || "0",
        days: {}
        }
      }).filter(record => record.employee_id)
      
      if (records.length === 0) {
        console.log('没有有效记录可导入')
        messageApi.error(t('attendanceUploadPage.noValidRecords'))
        return
      }
      console.log('批量导入o数据:', records)
      const result = await importAttendanceRecords(records)

      messageApi.success(String(result) || '批量导入成功')
      // 导入成功后刷新数据
      handleImportSuccess()
    } catch (error) {
      console.log('捕获到的错误:', error)
      console.error('批量导入失败:', error)
      messageApi.error(t('attendanceUploadPage.batchImportError'))
    } finally {
      setImportLoading(false)
    }
  }
  
  // 单独的文件处理函数
  const processFile = (file: any) => {
    try {
      // 读取文件内容
      const reader = new FileReader()
      console.log('创建FileReader开始读取文件')
      
      reader.onload = (e) => {
        console.log('文件读取完成')
        
        try {
          const data = e.target?.result
          console.log('读取到的数据类型:', typeof data)
          
          if (!data) {
              console.error('读取到的数据为空')
              messageApi.error(t('common.error'))
              return
            }

          // 解析Excel文件
          console.log('开始解析Excel文件')
          const workbook = XLSX.read(data, { type: 'array' })
          console.log('Excel解析成功，工作表数量:', workbook.SheetNames.length)
          console.log('工作表名称列表:', workbook.SheetNames)
          
          const sheets: ParsedSheet[] = []

          // 处理每个工作表
          workbook.SheetNames.forEach((sheetName) => {
            console.log(`开始处理工作表: ${sheetName}`)
            
            // 获取工作表
            const worksheet = workbook.Sheets[sheetName]
            
            // 处理合并单元格
            const mergedCells = worksheet['!merges'] || []
            console.log(`工作表${sheetName}中合并单元格数量:`, mergedCells.length)
            
            // 克隆工作表以避免修改原始数据
            const ws = JSON.parse(JSON.stringify(worksheet))
            
            // 处理合并单元格，确保合并区域内的所有单元格都有与左上角单元格相同的值
            mergedCells.forEach((merge: any) => {
              // 获取合并区域的范围
              const startRow = merge.s.r;
              const startCol = merge.s.c;
              const endRow = merge.e.r;
              const endCol = merge.e.c;
              
              // 获取左上角单元格的引用（例如A1）
              const startCellAddress = XLSX.utils.encode_cell({r: startRow, c: startCol});
              const startCell = ws[startCellAddress];
              
              // 如果左上角单元格有值，将其复制到合并区域的所有单元格
              if (startCell) {
                for (let row = startRow; row <= endRow; row++) {
                  for (let col = startCol; col <= endCol; col++) {
                    // 跳过左上角单元格，它已经有值
                    if (row === startRow && col === startCol) continue;
                    
                    const cellAddress = XLSX.utils.encode_cell({r: row, c: col});
                    ws[cellAddress] = {...startCell}; // 复制单元格的值和格式
                  }
                }
              }
            })
            
            // 将处理后的工作表转换为JSON，raw设为false可以处理日期等特殊格式
            const jsonData = XLSX.utils.sheet_to_json(ws, { 
              header: 'A', // 使用字母作为默认表头，这样可以获取所有列
              raw: false, // 保留日期等特殊格式
              range: 0 // 从第一行开始解析
            })
            
            // 处理表头，假设第一行是表头
            const headerRow = jsonData[0]
            
            if (!headerRow) {
              console.warn(`工作表${sheetName}没有表头行`)
              return
            }

            // 创建映射，将字母列名转换为实际表头名
            // 添加对重复列名的处理
            const headerMapping: { [key: string]: string } = {}
            const headerCount: { [key: string]: number } = {}
            
            Object.keys(headerRow).forEach((key) => {
              let headerValue = (headerRow as Record<string, any>)[key]
              if (headerValue && typeof headerValue === 'string') {
                headerValue = headerValue.trim()
                
                // 处理重复列名
                if (headerCount[headerValue] !== undefined) {
                  headerCount[headerValue]++
                  const uniqueHeader = `${headerValue}-${headerCount[headerValue]}`
                  headerMapping[key] = uniqueHeader
                } else {
                  headerCount[headerValue] = 0
                  headerMapping[key] = headerValue
                }
              }
            })

            // 处理数据行，跳过表头行
            const processedData: SheetData[] = []
            for (let i = 1; i < jsonData.length; i++) {
              const row = jsonData[i]
              const processedRow: SheetData = {}
              let hasData = false
              
              // 按原始顺序处理列，确保所有数据都被保留
              Object.keys(row as Record<string, any>).forEach((key) => {
                const headerName = headerMapping[key]
                const cellValue = (row as Record<string, any>)[key]
                
                if (headerName) {
                  // 设置值并标记行有数据
                  processedRow[headerName] = cellValue
                  if (cellValue !== undefined && cellValue !== null && cellValue !== '') {
                    hasData = true
                  }
                }
              })

              // 只添加有数据的行
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
                // 处理特殊格式
                if (text instanceof Date) {
                  return text.toLocaleDateString()
                }
                return text || ''
              }
            }))
            
            // 添加操作列
            columns.push({
              title: '操作',
              key: 'action',
              render: (_, record, index) => (
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleSingleImport(record, index)}
                  loading={singleImportLoading[`${sheetName}-${index}`]}
                >
                  {t('attendanceUploadPage.insert')}
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
              messageApi.success(String(t('common.success')) || '成功')
          } else {
            message.warning(t('common.noData'))
          }
        } catch (error) {
            console.error('解析Excel失败:', error)
            messageApi.error(t('common.error'))
          } finally {
            console.log('文件处理流程完成')
          }
      }
      
      reader.onerror = (error) => {
        console.error('文件读取错误:', error)
        messageApi.error('文件读取失败')
      }
      
      reader.onabort = () => {
        console.error('文件读取被中止')
        messageApi.error(t('common.error'))
      }
      
      console.log('开始以二进制字符串形式读取文件')
      reader.readAsArrayBuffer(file)
    } catch (error) {
      console.error('处理文件失败:', error)
      messageApi.error(t('common.error'))
    }
  }

  // 配置上传组件
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls',
    beforeUpload: (file) => {
      console.log('选择的文件:', file.name, file.type, file.size)
      // 检查文件类型
      const isExcel = file.type === 'application/vnd.ms-excel' || 
                      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                      file.name.endsWith('.xls') || 
                      file.name.endsWith('.xlsx')
      
      if (!isExcel) {
        messageApi.error(t('attendanceUploadPage.uploadError'))
        return Upload.LIST_IGNORE
      }
      
      // 检查文件大小（这里设置为10MB）
      const isLessThan10M = file.size / 1024 / 1024 < 10
      if (!isLessThan10M) {
        messageApi.error(t('attendanceUploadPage.maxSize'))
        return Upload.LIST_IGNORE
      }
      
      // 返回false阻止默认上传行为，我们将在onChange中处理
      return false
    },
    onChange: handleUpload,
    showUploadList: true, // 显示上传列表，方便用户查看和移除
    fileList: [], // 初始为空列表
    customRequest: ({ onSuccess }) => {
      // 提供自定义请求处理，确保文件状态正确更新
      if (onSuccess) {
        setTimeout(() => onSuccess('ok'), 0)
      }
    },
  }

  // 获取考勤数据
  const loadAttendanceData = async () => {
    setLoading(true)
    console.log('加载考勤数据参数month:', currentMonth)
    try {
      const params: any = {
        month: currentMonth.toString(),
        page: currentPage,
        page_size: pageSize,
        ...filterValues
      }
      // console.log('加载考勤数据参数:', projectId, currentMonth, currentPage, pageSize, filterValues)
      // 如果不是'所有项目'，则添加project_id参数
      if (projectId && projectId !== 'all') {
        params.project_id = projectId
        params.employee_id = filterValues.employee_id
        params.employee_name = filterValues.employee_name
        console.log('get records params', params)
        const records = await getAttendanceRecords(params)
        const response = (records as unknown) as { data: any[]; total: number };
        setTotal(response.total)
        // 转换后端数据格式以匹配前端需求
        console.log('raw records', response.total)
        if (response.total > 0) {
          const formattedRecords = response.data.map((record: any) => ({
          id: record.id || `${record.employee_id}-${record.month}`,
          employee_id: record.employee_id,
          employee_name: record.employee_name,
          position: record.position,
          projectId: record.project_id,
          project: record.project_name,
          work: record.work,
          off: record.off,
          unpresent: record.unpresent,
          absent: record.absent,
          sick: record.sick,
          leave_replc: record.leave_replc || 0,
          ew: record.ew,
          standby: record.standby,
          extrawork: record.extrawork || 0,
          ot1: record.ot1 || 0,
          ew1: record.ew1 || 0,
          ew2: record.ew2 || 0,
          ew3: record.ew3 || 0,
          month: record.month,
          days: record.days || {} ,// 确保days字段存在
          permission: record.permission || 0
        }))
        console.log('formattedAttendanceRecords', formattedRecords)
         setData(formattedRecords)
      
      } else {
        // 当选择'所有项目'时，显示提示并清空数据
        // messageApi.info('请选择具体项目查看考勤数据')
        setData([])
        setTotal(0)
      }
    }
    } catch (error) {
      console.error('加载考勤数据失败:', error)
      messageApi.error('加载考勤数据失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // console.log('the new projectId', projectId)
    loadAttendanceData()
  }, [projectId, currentMonth, currentPage, pageSize])

  // 生成表格列 - 不包含1-31天的详细信息
  const generateColumns = (): ColumnsType<any> => {
    const columns: ColumnsType<any> = [
      {
        title: (
          <Checkbox
            checked={selectedRowKeys.length === data.length && data.length > 0}
            indeterminate={selectedRowKeys.length > 0 && selectedRowKeys.length < data.length}
            onChange={(e) => handleSelectAll(e.target.checked)}
          />
        ),
        key: 'selection',
        width: 60,
        render: (_, record: AttendanceRecord) => (
          <Checkbox
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
      {
        title: t('common.month'),
        dataIndex: 'month',
        key: 'month',
        width: 100,
      },      
      {
        title: t('newAttendancePage.employeeId'),
        dataIndex: 'employee_id',
        key: 'employee_id',
        width: 100,
      },
      {
        title: t('newAttendancePage.employeeName'),
        dataIndex: 'employee_name',
        key: 'employee_name',
        width: 100,
      },
      {
        title: t('newAttendancePage.position'),
        dataIndex: 'position',
        key: 'position',
        width: 120,
      },
      {
        title: t('newAttendancePage.work'),
        dataIndex: 'work',
        key: 'work',
        width: 100,
      },
      {
        title: t('newAttendancePage.off'),
        dataIndex: 'off',
        key: 'off',
        width: 100,
      },
      {
        title: t('newAttendancePage.permission'),
        dataIndex: 'permission',
        key: 'permission',
        width: 100,
      },
      {
        title: t('newAttendancePage.unpresent'),
        dataIndex: 'unpresent',
        key: 'unpresent',
        width: 100,
      },
      {
        title: t('newAttendancePage.sick'),
        dataIndex: 'sick',
        key: 'sick',
        width: 100,
      },
      {
        title: t('newAttendancePage.standby'),
        dataIndex: 'standby',
        key: 'standby',
        width: 100,
      },
      {
        title: t('newAttendancePage.extrawork'),
        dataIndex: 'ew',
        key: 'ew',
        width: 100,
      },
      {
        title: t('newAttendancePage.leaveReplc'),
        dataIndex: 'leave_replc',
        key: 'leave_replc',
        width: 100,
      },
      {
        title: t('newAttendancePage.ot1'),
        dataIndex: 'ot1',
        key: 'ot1',
        width: 100,
      },
       {
        title: t('newAttendancePage.ew1'),
        dataIndex: 'ew1',
        key: 'ew1',
        width: 100,
      },
      {
        title: t('newAttendancePage.ew2'),
        dataIndex: 'ew2',
        key: 'ew2',
        width: 100,
      },
      {
        title: t('newAttendancePage.ew3'),
        dataIndex: 'ew3',
        key: 'ew3',
        width: 100,
      },                 
    ]

    
    // 添加合计列
    columns.push({
      title: t('newAttendancePage.total'),
      key: 'total',
      width: 80,
      render: (record: AttendanceRecord) => {
        // 计算所有状态的天数总和
        let total = 0;
        total = record.leave_replc + record.work + record.off + record.sick + record.standby  + record.absent + record.permission;
        // for (let i = 1; i <= 31; i++) {
        //   if (record.days[i]) {
        //     total++;
        //   }
        // }
        return (
          <span style={{
            fontWeight: 'bold',
            color: '#1890ff'
          }}>
            {total}
          </span>
        );
      },
    })

    // 添加操作列
    columns.push({
      title: t('common.action'),
      key: 'action',
      // fixed: 'right',      
      width: '10%',
      render: (_, record: AttendanceRecord) => (
        <span>
          <Button
            // type="link"
             type="primary" 
            size="small"
            icon={<EditOutlined />}
             style={{ marginRight: 8 }}
            onClick={() => handleEdit(record)}
          >
            {t('common.edit')}
          </Button>
          <Button 
            // type="link"
            type="primary" 
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            {t('common.delete')}
          </Button>
        
        </span>
      ),
    })

    return columns
  }



  const handleEdit = (record: AttendanceRecord) => {
    setEditingRecord(record)
    form.setFieldsValue({
      employee_id: record.employee_id,
      employee_name: record.employee_name,
      position: record.position,
      project: record.project,
      month: dayjs(record.month),
      work: record.work,
      off: record.off,
      unpresent: record.unpresent || 0,
      absent: record.absent,
      sick: record.sick,
      leave_replc: record.leave_replc,
      ew: record.ew,
      standby: record.standby,
      extrawork: record.extrawork,
      ot1: record.ot1 || 0,
      ew1: record.ew1 || 0,
      ew2: record.ew2 || 0,
      ew3: record.ew3 || 0,
    })
    setIsModalVisible(true)
  }

  const handleDelete = (id: string) => {
    console.log("start delete attendance")
    modal.confirm({
      title: t('newAttendancePage.confirmDeleteTitle'),
      content: t('newAttendancePage.confirmDeleteContent'),
      onOk: async () => {
        try {
          await deleteAttendanceRecord(id)  
          setData(data.filter(item => item.id !== id))
          messageApi.success('删除成功')
        } catch (error) {
          console.error('删除考勤记录失败:', error)
          messageApi.error('删除失败，请稍后重试')
        }
      },
    })
  }

  // 获取状态对应的文字颜色

  const handleSubmit = () => {
    form.validateFields()
      .then(async values => {
        try {
          const recordData = {
            id: editingRecord?.id || `${values.employee_id}-${values.month.format('YYYY-MM')}`,
            employee_id: values.employee_id,
            employee_name: values.employee_name,
            position: values.position,
            // 获取当前项目ID
            project_id: projectId,
            project: projectName, // 添加project属性
            month: values.month.format('YYYY-MM'),
            work: values.work || 0,
            off: values.off || 0,
            unpresent: values.unpresent || 0,
            sick: values.sick || 0,
            standby: values.standby || 0,
            ew: values.ew || 0,
            extrawork: values.extrawork || 0,
            absent: values.absent || 0,
            ot1: values.ot1 || 0,
            ew1: values.ew1 || 0,
            ew2: values.ew2 || 0,
            ew3: values.ew3 || 0,
            days: editingRecord?.days || {},
            permission: values.permission || 0,
            leave_replc: values.leave_replc || 0,
          }

          // 初始化天数记录
          if (!editingRecord) {
            const daysData: Record<string, string> = {}
            for (let i = 1; i <= 31; i++) {
              const date = dayjs(`${values.month.format('YYYY-MM')}-${i.toString().padStart(2, '0')}`)
              if (date.day() === 0 || date.day() === 6) {
                daysData[i.toString()] = 'O'
              } else {
                daysData[i.toString()] = 'W'
              }
            }
            recordData.days = daysData
          }

          if (editingRecord) {
            // 更新记录
            console.log("editingRecord--now")
            console.log(recordData)
            await updateAttendanceRecord(recordData)
            setData(data.map(item => (item.id === editingRecord.id ? recordData : item)))
            messageApi.success('更新成功')
          } else {
            // 添加新记录
            await addAttendanceRecord(recordData)
            setData([...data, recordData])
            messageApi.success('添加成功')
          }

          setIsModalVisible(false)
        } catch (error) {
          console.error(editingRecord ? '更新考勤记录失败:' : '添加考勤记录失败:', error)
          messageApi.error(editingRecord ? t('newAttendancePage.editFailed') : t('newAttendancePage.addFailed'))
        }
      })
  }
// 导出Excel下载功能
  const handleExportToExcel = () => {
    if (data.length === 0) {
      messageApi.warning('没有数据可导出');
      return;
    }
    // 准备导出数据，使用表格列标题作为Excel列名
    const exportData = data.map(record => {
      const row: { [key: string]: any } = {};
      const cols = generateColumns();
      cols.forEach(column => {
        if ('dataIndex' in column && column.title && column.dataIndex) {
          // 使用列标题作为键，确保导出的Excel有正确的列名
          row[column.title as string] = record[column.dataIndex as keyof AttendanceRecord];
        }
      });
      return row;
    });
    // 创建工作簿和工作表
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, '考勤记录');
    // 生成Excel文件并下载
    const excelFileName = `Attendance_Records_${currentMonth}.xlsx`;
    XLSX.writeFile(workbook, excelFileName);
    messageApi.success('Export Excel Sucess');
  } 
  // 处理筛选表单提交
  const handleFilterSubmit = () => {
    filterForm.validateFields().then(values => {
      const formattedValues = {
        ...values,
        // 确保month字段是字符串形式
        month: values.month ? values.month.format('YYYY-MM') : undefined
      }
      console.log(formattedValues)
      setFilterValues(formattedValues)
      setCurrentPage(1) // 筛选时回到第一页
      
      // 直接使用formattedValues调用loadAttendanceData，而不是依赖于状态更新
      const newCurrentPage = 1
      const params: any = {
        month: currentMonth.toString(),
        page: newCurrentPage,
        page_size: pageSize,
        ...formattedValues
      }
      
      // 手动执行loadAttendanceData的逻辑，使用新的参数
      setLoading(true)
      console.log('加载考勤数据参数month:', currentMonth)
      try {
        console.log('加载考勤数据参数:', projectId, currentMonth, newCurrentPage, pageSize, formattedValues)
        // 如果不是'所有项目'，则添加project_id参数
        if (projectId && projectId !== 'all') {
          params.project_id = projectId
          params.employee_id = formattedValues.employee_id
          params.employee_name = formattedValues.employee_name
          getAttendanceRecords(params).then(records => {
            const response = (records as unknown) as { data: any[]; total: number };
            setTotal(response.total)
            // 转换后端数据格式以匹配前端需求
            console.log('raw records', response.total)
            if (response.total > 0) {
              const formattedRecords = response.data.map((record: any) => ({
              id: record.id || `${record.employee_id}-${record.month}`,
              employee_id: record.employee_id,
              employee_name: record.employee_name,
              position: record.position,
              projectId: record.project_id,
              project: record.project_name,
              work: record.work,
              off: record.off,
              unpresent: record.unpresent || 0,
              absent: record.absent,
              sick: record.sick,
              leave_replc: record.leave_replc,
              ew: record.ew,
              standby: record.standby,
              extrawork: record.extrawork || 0,
              ot1: record.ot1 || 0,
              ew1: record.ew1 || 0,
              ew2: record.ew2 || 0,
              ew3: record.ew3 || 0,
              month: record.month,
              days: record.days || {} ,// 确保days字段存在
              permission: record.permission || 0
            }))
             setData(formattedRecords)
          
          } else {
            // 当选择'所有项目'时，显示提示并清空数据
            // messageApi.info('请选择具体项目查看考勤数据')
            setData([])
            setTotal(0)
          }
          setLoading(false)
        })
        } else {
          // 当选择'所有项目'时，显示提示并清空数据
          // messageApi.info('请选择具体项目查看考勤数据')
          setData([])
          setTotal(0)
          setLoading(false)
        }
      } catch (error) {
        console.error('加载考勤数据失败:', error)
        messageApi.error('加载考勤数据失败，请稍后重试')
        setLoading(false)
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
    loadAttendanceData()
  }

  return (
    // <div style={{ padding: '5px', height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
    <div style={{ padding: '0px' }}>
      {contextHolder}
      {msgContextHolder}
      <Card >
        <style>
          {`
            .table-row-light {
              background-color: #ffffff;
            }
            .table-row-dark {
              background-color: #fafafa;
            }
            .ant-table-tbody > tr:hover > td {
              background-color: #f5f5f5 !important;
            }
          `}
        </style>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <div className="header-actions">

    {/* 筛选表单 */}
          <div style={{ flex: 1 }}>
          <Form form={filterForm} layout="inline" style={{ marginBottom: 1 }}>
            <Form.Item name="employee_id" label={t('employeePage.employeeId')}>
              <Input placeholder={t('employeePage.enterEmployeeId')} />
            </Form.Item>
            <Form.Item name="employee_name" label={t('employeePage.employeeName')}>
              <Input placeholder={t('employeePage.enterEmployeeName')} />
            </Form.Item>
            <Form.Item name="month" label={t('attendancePage.month')}  initialValue={dayjs(currentMonth)}>
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
           



            {/* {selectedRowKeys.length > 0 && (
              <Button
                type="primary"
                danger
                onClick={handleBatchDelete}
                style={{ marginLeft: 8 }}
              >
                批量删除 ({selectedRowKeys.length})
              </Button>
            )} */}
          </div>
          <div style={{ marginTop: -5, display: 'flex', alignItems: 'top' }}>
          <Button type="primary" icon={<UploadOutlined />} onClick={() => setImportModalVisible(true)}>
            {t('attendancePage.import')}
          </Button>
          <Button type="primary" onClick={handleExportToExcel} style={{ marginLeft: 8 }}>
            {t('newAttendancePage.exportToExcel')}
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
          columns={generateColumns()}
          dataSource={data}
          rowKey="id"
          rowClassName={(index) => {
            return index % 2 === 0 ? 'table-row-light' : 'table-row-dark';
          }}
          scroll={{ x: 'max-content', y: 'calc(100vh - 450px)' }}
          pagination={false}
          loading={loading}
          onRow={(record) => ({
            onClick: (e) => {
              const newHighlightedId = highlightedRowId === record.id ? null : record.id;
              setHighlightedRowId(newHighlightedId);
              
              // 直接通过DOM操作确保立即生效
              const row = e.currentTarget;
              const allRows = document.querySelectorAll('.ant-table-tbody > tr');
              
              allRows.forEach((r) => {
                const tds = r.querySelectorAll('td');
                tds.forEach(td => {
                  (td as HTMLElement).style.backgroundColor = '';
                });
              });
              
              if (newHighlightedId) {
                const tds = row.querySelectorAll('td');
                tds.forEach((td: Element) => {
                  (td as HTMLElement).style.backgroundColor = '#e6f7ff';
                });
              }
            },
            style: { cursor: 'pointer' }
          })}
        />

          <Pagination
          current={currentPage}
          pageSize={pageSize}
          pageSizeOptions={['10', '20', '50', '100']}
          showSizeChanger
          showTotal={(total) => t('common.totalRecords', { count: total })}
          total={total}
          onChange={(page) => setCurrentPage(page)}
          onShowSizeChange={(_current, pageSize) => {
            setPageSize(pageSize)
            setCurrentPage(1) // 改变每页条数时回到第一页
          }}
          style={{ marginTop: 20, textAlign: 'center' }}
        />




      </Card>
      
      <Modal
        title={editingRecord ? t('newAttendancePage.editAttendance') : t('newAttendancePage.addAttendance')}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            month: dayjs()

          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item
              name="employee_id"
              label={t('newAttendancePage.employeeId')}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="employee_name"
              label={t('newAttendancePage.employeeName')}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="position"
              label={t('newAttendancePage.position')}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="month"
              label={t('newAttendancePage.month')}
            >
              <DatePicker picker="month" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="work"
              label={t('newAttendancePage.work')}
            >
              <InputNumber placeholder="请输入工作日" min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="off"
              label={t('newAttendancePage.off')}
            >
              <InputNumber placeholder="请输入休息日" min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="unpresent"
              label={t('newAttendancePage.permission')}
            >
              <InputNumber placeholder="请输入请假天数" min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="absent"
              label={t('newAttendancePage.unpresent')}
            >
              <InputNumber placeholder="请输入缺勤天数" min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="sick"
              label={t('newAttendancePage.sick')}
            >
              <InputNumber placeholder="请输入病假天数" min={0} style={{ width: '100%' }} />
            </Form.Item> 
            <Form.Item
              name="standby"
              label={t('newAttendancePage.standby')}
            >
              <InputNumber placeholder="请输入待命天数" min={0} style={{ width: '100%' }} />
            </Form.Item>   
            <Form.Item
              name="ew"
              label={t('newAttendancePage.extrawork')}
            >
              <InputNumber placeholder="请输入加班天数" min={0} style={{ width: '100%' }} />
            </Form.Item> 
            <Form.Item
              name="leave_replc"
              label={t('newAttendancePage.leaveReplc')}
            >
              <InputNumber placeholder="请输入年假天数" min={0} style={{ width: '100%' }} />
            </Form.Item> 
            <Form.Item
              name="ot1"
              label={t('newAttendancePage.ot1')}
            >
              <InputNumber placeholder="请输入OT1天数" min={0} style={{ width: '100%' }} />
            </Form.Item> 
            <Form.Item
              name="ew1"
              label={t('newAttendancePage.ew1')}
            >
              <InputNumber placeholder="请输入EW1天数" min={0} style={{ width: '100%' }} />
            </Form.Item> 
            <Form.Item
              name="ew2"
              label={t('newAttendancePage.ew2')}
            >
              <InputNumber placeholder="请输入EW2天数" min={0} style={{ width: '100%' }} />
            </Form.Item> 
            <Form.Item
              name="ew3"
              label={t('newAttendancePage.ew3')}
            >
              <InputNumber placeholder="请输入EW3天数" min={0} style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: 8 }}>
             {t('common.cancel')}
            </Button>
            <Button type="primary" htmlType="submit">
              {t('common.submit')}
            </Button>
          </div>
        </Form>
      </Modal>
      
      {/* 导入考勤模态框 */}
      <Modal
        title={t('attendanceUploadPage.title')}
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={null}
        width={900}
      >
        <div style={{ marginBottom: 20, textAlign: 'center' }}>
          <div style={{ marginBottom: 20 }}>
            <span style={{ color: '#1890ff' }}>{t('attendanceUploadPage.selectedProject')}: {projectName}</span>
          </div>
          <Upload.Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">{t('attendanceUploadPage.dragFile')} {t('attendanceUploadPage.clickToUpload')}</p>
            <p className="ant-upload-hint">
              {t('attendanceUploadPage.supportedFormats')}，{t('attendanceUploadPage.maxSize')}
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
    </div>
  )
}

export default NewAttendancePage