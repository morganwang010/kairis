import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Table, Button, Modal, Form, Input, DatePicker, message, Card, Upload, Tabs, Checkbox, Pagination, Select } from 'antd'
import { DeleteOutlined, UploadOutlined, SyncOutlined } from '@ant-design/icons'
import * as XLSX from 'xlsx'
import type { ColumnsType } from 'antd/es/table'
import type { UploadProps } from 'antd'
import dayjs from 'dayjs'
import { useParams, useLocation } from 'react-router-dom'

import { getFlightRecords, addFlightRecord, updateFlightRecord, deleteFlightRecordByIds, importFlightRecords, getProjects, calculateFlight, calculateFlightBatch, calculateTripClosure } from '../api'

interface FlightPageProps {
  projectId?: string
  projectName?: string
}

interface FlightRecord {
  id: string | number
  employee_id: string
  employee_name?: string
  project_id?: number
  month: string
  flight_num: string
  depart_destination: string
  jakarta_china: string
  china_jakarta: string
  jakarta_site: string
  site_jakarta: string
  return_destination: string
  return_jakarta: string
  return_china_jakarta: string
  return_jakarta_site: string
  return_site_jakarta: string
  category?: number
  work_days?: number
  overtime_days?: number
  leave_days?: number
  calculated_at?: string
  calendar_days?: number
  indonesia_start_date?: string
  indonesia_end_date?: string
  off_site_attendance_days?: number
  on_site_attendance_days?: number
  frontline_base_days?: number
  china_holiday_overtime_days?: number
  overseas_attendance_days?: number
  safety_allowance_days?: number
  sea_age?: number
  overdue_work_days?: number
}

interface SheetData {
  [key: string]: any
}

interface ParsedSheet {
  name: string
  data: SheetData[]
  columns: ColumnsType<SheetData>
}

const FlightPage: React.FC<FlightPageProps> = ({ projectId: propProjectId, projectName: propProjectName }) => {
  const { t } = useTranslation()
  const params = useParams<{ projectId?: string }>()
  const location = useLocation() as { state?: { projectName?: string } }
  const routeProjectId = params.projectId || propProjectId
  const routeProjectName = location.state?.projectName || propProjectName

  const [messageApi, msgContextHolder] = message.useMessage()
  const [data, setData] = useState<FlightRecord[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<FlightRecord | null>(null)
  const [form] = Form.useForm()
  const [currentMonth, setCurrentMonth] = useState(dayjs().format('YYYY-MM'))
  const [loading, setLoading] = useState(false)
  const [importModalVisible, setImportModalVisible] = useState(false)
  const [parsedSheets, setParsedSheets] = useState<ParsedSheet[]>([])
  const [activeTabKey, setActiveTabKey] = useState('')
  const [importLoading, setImportLoading] = useState(false)
  const [singleImportLoading, setSingleImportLoading] = useState<{[key: string]: boolean}>({})
  const [modal, contextHolder] = Modal.useModal()
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [highlightedRowId, setHighlightedRowId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [total, setTotal] = useState(0)
  const [filterForm] = Form.useForm()
  const [filterValues, setFilterValues] = useState<{[key: string]: any}>({})
  const [projects, setProjects] = useState<{value: string; label: string}[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(routeProjectId)
  const [selectedProjectName, setSelectedProjectName] = useState<string | undefined>(routeProjectName)
  const [calcModalVisible, setCalcModalVisible] = useState(false)
  const [calcLoading, setCalcLoading] = useState(false)
  const [calcResult, setCalcResult] = useState<{
    work_days: number
    overtime_days: number
    leave_days: number
    total_days: number
    breakdown: string[]
    calendar_days: number
    indonesia_start_date: string
    indonesia_end_date: string
    off_site_attendance_days: number
    on_site_attendance_days: number
    frontline_base_days: number
    china_holiday_overtime_days: number
    overseas_attendance_days: number
    safety_allowance_days: number
    sea_age: number
    overdue_work_days: number
  } | null>(null)

  useEffect(() => {
    if (routeProjectId) {
      setSelectedProjectId(routeProjectId)
    }
    if (routeProjectName) {
      setSelectedProjectName(routeProjectName)
    }
  }, [routeProjectId, routeProjectName])

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await getProjects({ page_size: 100 })
        let projectList: any[] = []
        if (Array.isArray(response)) {
          projectList = response
        } else if (response && Array.isArray(response.data)) {
          projectList = response.data
        }
        const options = projectList.map((p: any) => ({
          value: String(p.id),
          label: p.project_abbr || p.project_name,
        }))
        setProjects(options)
      } catch (error) {
        console.error('加载项目列表失败:', error)
      }
    }
    loadProjects()
  }, [])

  useEffect(() => {
    setEditingRecord(null)
    if (highlightedRowId) {
      setTimeout(() => {
        const row = document.querySelector(`.ant-table-tbody tr[data-row-key="${highlightedRowId}"]`)
        if (row) {
          const tds = row.querySelectorAll('td')
          tds.forEach(td => {
            (td as HTMLElement).style.backgroundColor = '#e6f7ff'
          })
        }
      }, 100)
    }
  }, [data, highlightedRowId, currentPage])

  useEffect(() => {
    setCurrentMonth(dayjs().format('YYYY-MM'))
  }, [])

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

  // parseCategory accepts either numeric (1/2) or textual (OnSite/现场/OffSite/非现场)
  const parseCategory = (raw: any): number => {
    if (raw === null || raw === undefined || raw === '') return 1 // default OnSite
    if (typeof raw === 'number') return raw === 2 ? 2 : 1
    const s = String(raw).trim().toLowerCase()
    if (s === '2' || s === 'offsite' || s === 'off_site' || s === 'off-site' || s === 'off' || s.includes('非现场')) return 2
    if (s === '1' || s === 'onsite' || s === 'on_site' || s === 'on-site' || s === 'on' || s.includes('现场')) return 1
    return 1 // default
  }

  const formatCategory = (c?: number): string => {
    if (c === 2) return 'OffSite (非现场)'
    return 'OnSite (现场)'
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowKeys(data.map(record => record.id))
    } else {
      setSelectedRowKeys([])
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRowKeys(prev => [...prev, id])
    } else {
      setSelectedRowKeys(prev => prev.filter(key => key !== id))
    }
  }

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
          await deleteFlightRecordByIds(selectedRowKeys.map(id => Number(id)))
          setSelectedRowKeys([])
          messageApi.success('批量删除成功')
          loadFlightData()
        } catch (error) {
          console.error('批量删除航班记录失败:', error)
          messageApi.error('删除失败，请稍后重试')
        }
      },
    })
  }

  const handleImportSuccess = () => {
    loadFlightData()
    setImportModalVisible(false)
    setParsedSheets([])
    setActiveTabKey('')
  }

  const handleUpload: UploadProps['onChange'] = ({ file }) => {
    if (file.name) {
      processFile(file)
    }
    if (file.status === 'error') {
      messageApi.error('文件上传失败')
    } else if (file.status === 'removed') {
      setParsedSheets([])
      setActiveTabKey('')
    }
  }

  const handleSingleImport = async (record: SheetData, index: number) => {
    try {
      setSingleImportLoading(prev => ({ ...prev, [`${activeTabKey}-${index}`]: true }))
      const trimmedRecord = trimRecord(record)
      const effectiveProjectId = selectedProjectId || routeProjectId
      const projectIDNum = parseInt(effectiveProjectId || '0', 10) || 0

      const flightRecord = {
        employee_id: trimmedRecord['Employee_Id'] || trimmedRecord['employee_id'],
        project_id: projectIDNum,
        month: trimmedRecord['Month'] || currentMonth,
        flight_num: trimmedRecord['Flight No.'] || trimmedRecord['Flight_Num'] || trimmedRecord['flight_num'] || '',
        depart_destination: trimmedRecord['Departure-Destination'] || trimmedRecord['Depart_Destination'] || '',
        china_jakarta: trimmedRecord['China--Jakarta'] || '',
        jakarta_china: trimmedRecord['Jakarta--China'] || '',
        jakarta_site: trimmedRecord['Jakarta--Site'] || '',
        site_jakarta: trimmedRecord['Site--Jakarta'] || '',
        return_destination: trimmedRecord['Return_Destination'] || trimmedRecord['Return Destination'] || '',
        return_jakarta: trimmedRecord['Return_Jakarta'] || trimmedRecord['Return Jakarta'] || '',
        return_china_jakarta: trimmedRecord['Return_China_Jakarta'] || trimmedRecord['Return China--Jakarta'] || '',
        return_jakarta_site: trimmedRecord['Return_Jakarta_Site'] || trimmedRecord['Return Jakarta--Site'] || '',
        return_site_jakarta: trimmedRecord['Return_Site_Jakarta'] || trimmedRecord['Return Site--Jakarta'] || '',
        category: parseCategory(trimmedRecord['Category'] || trimmedRecord['category'] || trimmedRecord['人员类别'] || ''),
      }

      if (!flightRecord.employee_id) {
        messageApi.error('缺少 Employee_Id 字段')
        return
      }

      await addFlightRecord(flightRecord)
      messageApi.success('导入成功')
    } catch (error) {
      console.error('导入失败:', error)
      messageApi.error('导入失败')
    } finally {
      setSingleImportLoading(prev => ({ ...prev, [`${activeTabKey}-${index}`]: false }))
    }
  }

  const handleImportAll = async () => {
    try {
      setImportLoading(true)
      const currentSheet = parsedSheets.find(sheet => sheet.name === activeTabKey)
      if (!currentSheet) {
        messageApi.error('没有可导入的工作表')
        return
      }

      const effectiveProjectId = selectedProjectId || routeProjectId
      const projectIDNum = parseInt(effectiveProjectId || '0', 10) || 0

      const flights = currentSheet.data.map(record => {
        const trimmedRecord = trimRecord(record)
        const employeeId = trimmedRecord['Employee_Id'] || trimmedRecord['employee_id']
        const month = trimmedRecord['Month'] || currentMonth
        const flightNum = trimmedRecord['Flight No.'] || trimmedRecord['Flight_Num'] || trimmedRecord['flight_num'] || ''
        const departDestination = trimmedRecord['Departure-Destination'] || trimmedRecord['Depart_Destination'] || ''

        if (!employeeId) return null

        return {
          employee_id: employeeId,
          project_id: projectIDNum,
          month: month,
          flight_num: flightNum,
          depart_destination: departDestination,
          china_jakarta: trimmedRecord['China--Jakarta'] || '',
          jakarta_china: trimmedRecord['Jakarta--China'] || '',
          jakarta_site: trimmedRecord['Jakarta--Site'] || '',
          site_jakarta: trimmedRecord['Site--Jakarta'] || '',
          category: parseCategory(trimmedRecord['Category'] || trimmedRecord['category'] || trimmedRecord['人员类别'] || ''),
        }
      }).filter((record): record is NonNullable<typeof record> => record !== null)

      const totalRaws = flights.reduce((sum, f) => {
        const row = f as any
        let s = 0
        if (row.china_jakarta) s++
        if (row.jakarta_china) s++
        if (row.jakarta_site) s++
        if (row.site_jakarta) s++
        return sum + s
      }, 0)

      if (flights.length === 0) {
        messageApi.error('没有有效记录可导入')
        return
      }

      await importFlightRecords(flights)

      const empMonthSet = new Set<string>()
      flights.forEach(f => {
        empMonthSet.add(`${f.employee_id}|${f.month}`)
      })
      for (const key of empMonthSet) {
        const [empId, m] = key.split('|')
        try {
          await calculateTripClosure({ employee_id: empId, month: m })
        } catch {
          // silently ignore closure calc failures
        }
      }

      messageApi.success(`批量导入成功，共 ${flights.length} 条记录，${totalRaws} 段行程`)
      handleImportSuccess()
    } catch (error) {
      console.error('批量导入失败:', error)
      messageApi.error('批量导入失败')
    } finally {
      setImportLoading(false)
    }
  }

  const processFile = (file: any) => {
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          if (!data) {
            messageApi.error('读取文件失败')
            return
          }

          const workbook = XLSX.read(data, { type: 'array' })
          const sheets: ParsedSheet[] = []

          workbook.SheetNames.forEach((sheetName) => {
            const worksheet = workbook.Sheets[sheetName]
            const mergedCells = worksheet['!merges'] || []
            const ws = JSON.parse(JSON.stringify(worksheet))

            mergedCells.forEach((merge: any) => {
              const startRow = merge.s.r
              const startCol = merge.s.c
              const endRow = merge.e.r
              const endCol = merge.e.c
              const startCellAddress = XLSX.utils.encode_cell({r: startRow, c: startCol})
              const startCell = ws[startCellAddress]
              if (startCell) {
                for (let row = startRow; row <= endRow; row++) {
                  for (let col = startCol; col <= endCol; col++) {
                    if (row === startRow && col === startCol) continue
                    const cellAddress = XLSX.utils.encode_cell({r: row, c: col})
                    ws[cellAddress] = {...startCell}
                  }
                }
              }
            })

            const jsonData = XLSX.utils.sheet_to_json(ws, {
              header: 'A',
              raw: false,
              range: 0
            })

            const headerRow = jsonData[0]
            if (!headerRow) return

            const headerMapping: { [key: string]: string } = {}
            const headerCount: { [key: string]: number } = {}

            Object.keys(headerRow).forEach((key) => {
              let headerValue = (headerRow as Record<string, any>)[key]
              if (headerValue && typeof headerValue === 'string') {
                headerValue = headerValue.trim()
                if (headerCount[headerValue] !== undefined) {
                  headerCount[headerValue]++
                  headerMapping[key] = `${headerValue}-${headerCount[headerValue]}`
                } else {
                  headerCount[headerValue] = 0
                  headerMapping[key] = headerValue
                }
              }
            })

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
                  导入
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
            messageApi.success('解析成功')
          } else {
            messageApi.warning('无数据')
          }
        } catch (error) {
          console.error('解析Excel失败:', error)
          messageApi.error('解析Excel失败')
        }
      }

      reader.onerror = () => {
        messageApi.error('文件读取失败')
      }
      reader.readAsArrayBuffer(file)
    } catch (error) {
      console.error('处理文件失败:', error)
      messageApi.error('处理文件失败')
    }
  }

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls',
    beforeUpload: (file) => {
      const isExcel = file.type === 'application/vnd.ms-excel' ||
                      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                      file.name.endsWith('.xls') ||
                      file.name.endsWith('.xlsx')
      if (!isExcel) {
        messageApi.error('请上传Excel文件')
        return Upload.LIST_IGNORE
      }
      const isLessThan10M = file.size / 1024 / 1024 < 10
      if (!isLessThan10M) {
        messageApi.error('文件不能超过10MB')
        return Upload.LIST_IGNORE
      }
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

  const loadFlightData = async () => {
    setLoading(true)
    try {
      const params: any = {
        month: currentMonth.toString(),
        page: currentPage,
        pageSize: pageSize,
      }
      const effectiveProjectId = selectedProjectId || routeProjectId
      if (effectiveProjectId && effectiveProjectId !== 'all') {
        params.project_id = effectiveProjectId
      }
      if (filterValues.employee_id) {
        params.employee_id = filterValues.employee_id
      }
      if (filterValues.employee_name) {
        params.employee_name = filterValues.employee_name
      }

      const records = await getFlightRecords(params)
      const response = (records as unknown) as { data: any[]; total: number }
      setTotal(response.total || 0)

      if (response.total > 0) {
        const formattedRecords = response.data.map((record: any) => ({
          // Spread all backend fields first (covers all calc result fields
          // like work_days, on_site_attendance_days, etc. automatically)
          ...record,
          // Any frontend-specific overrides go below — currently none needed
        }))
        setData(formattedRecords)
      } else {
        setData([])
        setTotal(0)
      }
    } catch (error) {
      console.error('加载航班数据失败:', error)
      messageApi.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFlightData()
  }, [selectedProjectId, currentMonth, currentPage, pageSize, filterValues])

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
        render: (_, record: FlightRecord) => (
          <Checkbox
            checked={selectedRowKeys.includes(record.id)}
            onChange={(e) => handleSelectRow(String(record.id), e.target.checked)}
          />
        ),
      },
      {
        title: 'No',
        key: 'index',
        width: 60,
        render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
      },
      { title: 'Project', dataIndex: 'project_id', key: 'project_id', width: 120, render: () => selectedProjectName || routeProjectName || '-' },
      { title: 'Month', dataIndex: 'month', key: 'month', width: 100 },
      { title: 'Employee ID', dataIndex: 'employee_id', key: 'employee_id', width: 120 },
      { title: 'Employee Name', dataIndex: 'employee_name', key: 'employee_name', width: 140 },
      { title: 'Category', dataIndex: 'category', key: 'category', width: 150, render: (v?: number) => formatCategory(v) },
      { title: 'Flight Num', dataIndex: 'flight_num', key: 'flight_num', width: 120 },
      { title: 'Depart Destination', dataIndex: 'depart_destination', key: 'depart_destination', width: 140 },
      { title: 'Jakarta -> China', dataIndex: 'jakarta_china', key: 'jakarta_china', width: 140 },
      { title: 'China -> Jakarta', dataIndex: 'china_jakarta', key: 'china_jakarta', width: 140 },
      { title: 'Jakarta -> Site', dataIndex: 'jakarta_site', key: 'jakarta_site', width: 140 },
      { title: 'Site -> Jakarta', dataIndex: 'site_jakarta', key: 'site_jakarta', width: 140 },
      // { title: 'Return Destination', dataIndex: 'return_destination', key: 'return_destination', width: 140 },
      // { title: 'Return Jakarta', dataIndex: 'return_jakarta', key: 'return_jakarta', width: 140 },
      // { title: 'Return China -> Jakarta', dataIndex: 'return_china_jakarta', key: 'return_china_jakarta', width: 160 },
      // { title: 'Return Jakarta -> Site', dataIndex: 'return_jakarta_site', key: 'return_jakarta_site', width: 160 },
      // { title: 'Return Site -> Jakarta', dataIndex: 'return_site_jakarta', key: 'return_site_jakarta', width: 160 },
      { title: 'Work Days', dataIndex: 'work_days', key: 'work_days', width: 90, render: (v: number) => v || 0 },
      { title: 'Overtime Days', dataIndex: 'overtime_days', key: 'overtime_days', width: 110, render: (v: number) => <span style={{ color: v > 0 ? '#faad14' : undefined }}>{v || 0}</span> },
      { title: 'Leave Days', dataIndex: 'leave_days', key: 'leave_days', width: 90, render: (v: number) => v || 0 },
      { title: 'Calendar Days', dataIndex: 'calendar_days', key: 'calendar_days', width: 110, render: (v: number) => v || 0 },
      { title: 'Indonesia Start', dataIndex: 'indonesia_start_date', key: 'indonesia_start_date', width: 130 },
      { title: 'Indonesia End', dataIndex: 'indonesia_end_date', key: 'indonesia_end_date', width: 130 },
      { title: 'Off-Site Attendance', dataIndex: 'off_site_attendance_days', key: 'off_site_attendance_days', width: 140, render: (v: number) => v || 0 },
      { title: 'On-Site Attendance', dataIndex: 'on_site_attendance_days', key: 'on_site_attendance_days', width: 140, render: (v: number) => v || 0 },
      { title: 'Frontline Base', dataIndex: 'frontline_base_days', key: 'frontline_base_days', width: 120, render: (v: number) => v || 0 },
      { title: 'Holiday Overtime', dataIndex: 'china_holiday_overtime_days', key: 'china_holiday_overtime_days', width: 130, render: (v: number) => <span style={{ color: v > 0 ? '#ff4d4f' : undefined }}>{v || 0}</span> },
      { title: 'Overseas Attendance', dataIndex: 'overseas_attendance_days', key: 'overseas_attendance_days', width: 140, render: (v: number) => <span style={{ color: v > 0 ? '#1890ff' : undefined }}>{v || 0}</span> },
      { title: 'Safety Allowance', dataIndex: 'safety_allowance_days', key: 'safety_allowance_days', width: 130, render: (v: number) => v || 0 },
      { title: 'Sea Age', dataIndex: 'sea_age', key: 'sea_age', width: 90, render: (v: number) => v || 0 },
      { title: 'Overdue Work', dataIndex: 'overdue_work_days', key: 'overdue_work_days', width: 120, render: (v: number) => <span style={{ color: v > 0 ? '#ff4d4f' : undefined }}>{v || 0}</span> },
      {
        title: '操作',
        key: 'action',
        width: 160,
        fixed: 'right',
        render: (_, record: FlightRecord) => (
          <span>
            <Button
              type="link"
              size="small"
              style={{ marginRight: 4 }}
              onClick={async () => {
                try {
                  await calculateFlight(Number(record.id))
                  messageApi.success('计算成功')
                  loadFlightData()
                } catch (err) {
                  console.error(err)
                  messageApi.error('计算失败')
                }
              }}
            >
              计算
            </Button>
            <Button
              type="link"
              size="small"
              style={{ marginRight: 4 }}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
            <Button
              type="link"
              size="small"
              danger
              onClick={() => handleDelete(record.id)}
            >
              删除
            </Button>
          </span>
        ),
      },
    ]
    return columns
  }

  const handleEdit = (record: FlightRecord) => {
    setEditingRecord(record)
    form.setFieldsValue({
      employee_id: record.employee_id,
      month: dayjs(record.month),
      flight_num: record.flight_num,
      depart_destination: record.depart_destination,
      jakarta_china: record.jakarta_china,
      china_jakarta: record.china_jakarta,
      jakarta_site: record.jakarta_site,
      site_jakarta: record.site_jakarta,
      return_destination: record.return_destination,
      return_jakarta: record.return_jakarta,
      return_china_jakarta: record.return_china_jakarta,
      return_jakarta_site: record.return_jakarta_site,
      return_site_jakarta: record.return_site_jakarta,
    })
    setIsModalVisible(true)
  }

  const handleDelete = (id: string | number) => {
    modal.confirm({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      onOk: async () => {
        try {
          await deleteFlightRecordByIds([Number(id)])
          messageApi.success('删除成功')
          loadFlightData()
        } catch (error) {
          console.error('删除失败:', error)
          messageApi.error('删除失败')
        }
      },
    })
  }

  const handleSubmit = () => {
    form.validateFields()
      .then(async values => {
        try {
          const effectiveProjectId = selectedProjectId || routeProjectId
          const projectIDNum = parseInt(effectiveProjectId || '0', 10) || 0
          const recordData = {
            id: editingRecord?.id,
            employee_id: values.employee_id,
            project_id: projectIDNum,
            month: values.month.format('YYYY-MM'),
            flight_num: values.flight_num,
            depart_destination: values.depart_destination,
            jakarta_china: values.jakarta_china,
            china_jakarta: values.china_jakarta,
            jakarta_site: values.jakarta_site,
            site_jakarta: values.site_jakarta,
            return_destination: values.return_destination,
            return_jakarta: values.return_jakarta,
            return_china_jakarta: values.return_china_jakarta,
            return_jakarta_site: values.return_jakarta_site,
            return_site_jakarta: values.return_site_jakarta,
          }

          if (editingRecord) {
            await updateFlightRecord(recordData)
            messageApi.success('更新成功')
          } else {
            await addFlightRecord(recordData)
            messageApi.success('添加成功')
          }
          setIsModalVisible(false)
          loadFlightData()
        } catch (error) {
          console.error(editingRecord ? '更新失败:' : '添加失败:', error)
          messageApi.error(editingRecord ? '更新失败' : '添加失败')
        }
      })
  }

  const handleExportToExcel = () => {
    if (data.length === 0) {
      messageApi.warning('没有数据可导出')
      return
    }
    const exportData = data.map(record => ({
      'Employee ID': record.employee_id,
      'Employee Name': record.employee_name || '',
      'Month': record.month,
      'Flight Num': record.flight_num,
      'Depart Destination': record.depart_destination,
      'Jakarta -> China': record.jakarta_china,
      'China -> Jakarta': record.china_jakarta,
      'Jakarta -> Site': record.jakarta_site,
      'Site -> Jakarta': record.site_jakarta,
      'Return Destination': record.return_destination,
      'Return Jakarta': record.return_jakarta,
      'Return China -> Jakarta': record.return_china_jakarta,
      'Return Jakarta -> Site': record.return_jakarta_site,
      'Return Site -> Jakarta': record.return_site_jakarta,
      'Work Days': record.work_days || 0,
      'Overtime Days': record.overtime_days || 0,
      'Leave Days': record.leave_days || 0,
      'Calendar Days': record.calendar_days || 0,
      'Indonesia Start': record.indonesia_start_date || '',
      'Indonesia End': record.indonesia_end_date || '',
      'Off-Site Attendance': record.off_site_attendance_days || 0,
      'On-Site Attendance': record.on_site_attendance_days || 0,
      'Frontline Base': record.frontline_base_days || 0,
      'Holiday Overtime': record.china_holiday_overtime_days || 0,
      'Overseas Attendance': record.overseas_attendance_days || 0,
      'Safety Allowance': record.safety_allowance_days || 0,
      'Sea Age': record.sea_age || 0,
      'Overdue Work': record.overdue_work_days || 0,
    }))
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Flight Records')
    const excelFileName = `Flight_Records_${currentMonth}.xlsx`
    XLSX.writeFile(workbook, excelFileName)
    messageApi.success('导出成功')
  }

  const handleFilterSubmit = () => {
    filterForm.validateFields().then(values => {
      const formattedValues = {
        ...values,
        month: values.month ? values.month.format('YYYY-MM') : undefined
      }
      if (values.project_id) {
        setSelectedProjectId(values.project_id)
        const proj = projects.find(p => p.value === values.project_id)
        setSelectedProjectName(proj?.label)
      }
      setFilterValues(formattedValues)
      setCurrentPage(1)
    })
  }

  const handleCalculate = async () => {
    if (data.length === 0) {
      messageApi.warning('没有航班数据可计算')
      return
    }

    setCalcLoading(true)
    try {
      const effectiveProjectId = selectedProjectId || routeProjectId
      const projectIDNum = parseInt(effectiveProjectId || '0', 10) || 0

      // Group flights by employee_id for batch calculation
      const employeeMap = new Map<string, { count: number; results: any[] }>()

      for (const record of data) {
        const empId = record.employee_id
        const existing = employeeMap.get(empId)
        if (existing) {
          existing.count++
        } else {
          employeeMap.set(empId, { count: 1, results: [] })
        }
      }

      // Calculate for each employee
      let totalWorkDays = 0
      let totalOvertimeDays = 0
      let totalLeaveDays = 0
      let totalCalendarDays = 0
      let totalOffSiteAttendance = 0
      let totalOnSiteAttendance = 0
      let totalFrontlineBase = 0
      let totalChinaHolidayOvertime = 0
      let totalOverseasAttendance = 0
      let totalSafetyAllowance = 0
      let totalSeaAge = 0
      let totalOverdueWork = 0
      const allBreakdown: string[] = []
      let indonesiaStartDate = ''
      let indonesiaEndDate = ''

      const uniqueEmployeeIds = Array.from(employeeMap.keys())

      for (const empId of uniqueEmployeeIds) {
        try {
          const response = await calculateFlightBatch({
            employee_id: empId,
            month: currentMonth,
            project_id: projectIDNum,
          })

          const results = response?.data || []
          for (const r of results) {
            totalWorkDays += r.work_days || 0
            totalOvertimeDays += r.overtime_days || 0
            totalLeaveDays += r.leave_days || 0
            totalCalendarDays += r.calendar_days || 0
            totalOffSiteAttendance += r.off_site_attendance_days || 0
            totalOnSiteAttendance += r.on_site_attendance_days || 0
            totalFrontlineBase += r.frontline_base_days || 0
            totalChinaHolidayOvertime += r.china_holiday_overtime_days || 0
            totalOverseasAttendance += r.overseas_attendance_days || 0
            totalSafetyAllowance += r.safety_allowance_days || 0
            totalSeaAge += r.sea_age || 0
            totalOverdueWork += r.overdue_work_days || 0
            if (r.indonesia_start_date) indonesiaStartDate = r.indonesia_start_date
            if (r.indonesia_end_date) indonesiaEndDate = r.indonesia_end_date
            if (r.breakdown) {
              allBreakdown.push(...r.breakdown)
            }
          }
        } catch (err) {
          console.error(`计算员工 ${empId} 航班信息失败:`, err)
        }
      }

      setCalcResult({
        work_days: totalWorkDays,
        overtime_days: totalOvertimeDays,
        leave_days: totalLeaveDays,
        total_days: totalWorkDays + totalOvertimeDays + totalLeaveDays,
        breakdown: allBreakdown,
        calendar_days: totalCalendarDays,
        indonesia_start_date: indonesiaStartDate,
        indonesia_end_date: indonesiaEndDate,
        off_site_attendance_days: totalOffSiteAttendance,
        on_site_attendance_days: totalOnSiteAttendance,
        frontline_base_days: totalFrontlineBase,
        china_holiday_overtime_days: totalChinaHolidayOvertime,
        overseas_attendance_days: totalOverseasAttendance,
        safety_allowance_days: totalSafetyAllowance,
        sea_age: totalSeaAge,
        overdue_work_days: totalOverdueWork,
      })

      messageApi.success('计算完成')
      loadFlightData() // Refresh data to show calculated values
    } catch (error) {
      console.error('计算航班信息失败:', error)
      messageApi.error('计算航班信息失败')
    } finally {
      setCalcLoading(false)
    }
  }

  const handleFilterReset = () => {
    filterForm.resetFields()
    setFilterValues({})
    filterForm.setFieldsValue({ month: dayjs(currentMonth) })
    loadFlightData()
  }

  return (
    <div className="flex flex-col p-1">
      {contextHolder}
      {msgContextHolder}
      <Card className="border-blue-500/10 shadow-lg shadow-blue-500/5 overflow-hidden" styles={{ body: { padding: '12px' } }}>
        <style>{`
          .table-row-light { background-color: #ffffff; }
          .table-row-dark { background-color: #f1f5f9; }
          .ant-table-tbody > tr:hover > td { background-color: #eef2ff !important; }
          .ant-table-wrapper .ant-table-thead > tr > th {
            background: linear-gradient(135deg, #f8faff, #eef2ff) !important;
            color: #1e293b !important;
            font-weight: 600 !important;
            border-bottom: 1px solid #c7d2fe !important;
          }
          .ant-card { border-radius: 12px !important; }
        `}</style>
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-50/60 to-indigo-50/60 rounded-lg px-4 py-3 border border-blue-500/10 mb-1">
          <div style={{ flex: 1 }}>
            <Form form={filterForm} layout="inline" style={{ marginBottom: 1 }}>
              {!routeProjectId && (
                <Form.Item name="project_id" label="Project">
                  <Select
                    placeholder="选择项目"
                    allowClear
                    style={{ width: 180 }}
                    options={projects}
                    value={selectedProjectId}
                    onChange={(value) => {
                      setSelectedProjectId(value)
                      const proj = projects.find(p => p.value === value)
                      setSelectedProjectName(proj?.label)
                    }}
                  />
                </Form.Item>
              )}
              <Form.Item name="employee_id" label="Employee ID">
                <Input placeholder="请输入Employee ID" />
              </Form.Item>
              <Form.Item name="employee_name" label="Employee Name">
                <Input placeholder="请输入Employee Name" />
              </Form.Item>
              <Form.Item name="month" label="Month" initialValue={dayjs(currentMonth)}>
                <DatePicker
                  picker="month"
                  onChange={(date) => {
                    if (date) setCurrentMonth(date.format('YYYY-MM'))
                  }}
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={handleFilterSubmit} style={{ marginRight: 8 }}>查询</Button>
                <Button onClick={handleFilterReset}>重置</Button>
              </Form.Item>
            </Form>
          </div>
          <div style={{ marginTop: -5, display: 'flex', alignItems: 'top' }}>
            <Button type="primary" icon={<UploadOutlined />} onClick={() => setImportModalVisible(true)}>
                  {t('flightPage.import')}
            </Button>
            <Button type="primary" onClick={handleExportToExcel} style={{ marginLeft: 8 }}>
              {t('flightPage.export')}
            </Button>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={handleBatchDelete}
            disabled={selectedRowKeys.length === 0}
            style={{ marginRight: 8 }}
          >
            批量删除 ({selectedRowKeys.length})
          </Button>
          <Button
            type="primary"
            onClick={() => {
              setEditingRecord(null)
              form.resetFields()
              form.setFieldsValue({ month: dayjs(currentMonth) })
              setIsModalVisible(true)
            }}
          >
            添加航班记录
          </Button>
          <Button
            type="primary"
            onClick={() => {
              setCalcResult(null)
              setCalcModalVisible(true)
            }}
          >
            计算航班信息
          </Button>
        </div>

        <Table
          columns={generateColumns()}
          dataSource={data}
          rowKey="id"
          rowClassName={(index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}
          scroll={{ x: 'max-content', y: 'calc(100vh - 450px)' }}
          pagination={false}
          loading={loading}
          onRow={(record) => ({
            onClick: (e) => {
              const newHighlightedId = highlightedRowId === String(record.id) ? null : String(record.id)
              setHighlightedRowId(newHighlightedId)
              const row = e.currentTarget
              const allRows = document.querySelectorAll('.ant-table-tbody > tr')
              allRows.forEach((r) => {
                const tds = r.querySelectorAll('td')
                tds.forEach(td => { (td as HTMLElement).style.backgroundColor = '' })
              })
              if (newHighlightedId) {
                const tds = row.querySelectorAll('td')
                tds.forEach((td: Element) => { (td as HTMLElement).style.backgroundColor = '#e6f7ff' })
              }
            },
            style: { cursor: 'pointer' }
          })}
        />

        <Pagination
          current={currentPage}
          pageSize={pageSize}
          pageSizeOptions={['50', '100', '200']}
          showSizeChanger
          showTotal={(total) => `共 ${total} 条记录`}
          total={total}
          onChange={(page) => setCurrentPage(page)}
          onShowSizeChange={(_current, pageSize) => {
            setPageSize(pageSize)
            setCurrentPage(1)
          }}
          className="mt-5 text-center"
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑航班记录' : '添加航班记录'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ month: dayjs() }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="employee_id" label="Employee ID" rules={[{ required: true, message: '请输入 Employee ID' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="month" label="Month" rules={[{ required: true, message: '请选择月份' }]}>
              <DatePicker picker="month" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="flight_num" label="Flight Number">
              <Input />
            </Form.Item>
            <Form.Item name="depart_destination" label="Depart Destination">
              <Input />
            </Form.Item>
            <Form.Item name="jakarta_china" label="Jakarta -> China">
              <Input />
            </Form.Item>
            <Form.Item name="china_jakarta" label="China -> Jakarta">
              <Input />
            </Form.Item>
            <Form.Item name="jakarta_site" label="Jakarta -> Site">
              <Input />
            </Form.Item>
            <Form.Item name="site_jakarta" label="Site -> Jakarta">
              <Input />
            </Form.Item>
            <Form.Item name="return_destination" label="Return Destination">
              <Input />
            </Form.Item>
            <Form.Item name="return_jakarta" label="Return Jakarta">
              <Input />
            </Form.Item>
            <Form.Item name="return_china_jakarta" label="Return China -> Jakarta">
              <Input />
            </Form.Item>
            <Form.Item name="return_jakarta_site" label="Return Jakarta -> Site">
              <Input />
            </Form.Item>
            <Form.Item name="return_site_jakarta" label="Return Site -> Jakarta">
              <Input />
            </Form.Item>
          </div>
          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: 8 }}>取消</Button>
            <Button type="primary" htmlType="submit">提交</Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title="导入航班记录"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={null}
        width={900}
      >
        <div style={{ marginBottom: 20, textAlign: 'center' }}>
          <div style={{ marginBottom: 20 }}>
            <span style={{ color: '#1890ff' }}>当前项目: {selectedProjectName || routeProjectName || '未选择'}</span>
          </div>
          <Upload.Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽Excel文件到此处上传</p>
            <p className="ant-upload-hint">支持 .xlsx, .xls 格式，最大10MB</p>
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
                全部导入
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
                      pagination={{ pageSize: 50 }}
                      scroll={{ x: 'max-content' }}
                      locale={{ emptyText: '无数据' }}
                    />
                  </div>
                ),
              }))}
              style={{ width: '100%' }}
            />
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 60, backgroundColor: '#f5f5f5', borderRadius: 8, color: '#999' }}>
            <p>暂无数据</p>
          </div>
        )}
      </Modal>

      <Modal
        title="计算航班信息"
        open={calcModalVisible}
        onCancel={() => setCalcModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setCalcModalVisible(false)}>
            关闭
          </Button>,
          <Button
            key="calculate"
            type="primary"
            loading={calcLoading}
            onClick={handleCalculate}
            style={{ marginRight: 8 }}
          >
            开始计算
          </Button>,
        ]}
        width={800}
      >
        <div style={{ marginBottom: 16 }}>
          <p style={{ marginBottom: 8 }}>
            将根据当前筛选的航班数据，计算以下内容：
          </p>
          <ul style={{ marginLeft: 20, paddingLeft: 0 }}>
            <li>日历天数（当月自然天数）</li>
            <li>印尼起止日期、现场/非现场出勤天数</li>
            <li>一线基地、中国假日加班、境外出勤天数</li>
            <li>安全津贴、海龄、超期工作天数</li>
          </ul>
          <p style={{ color: '#888', fontSize: 12 }}>
            计算将基于员工当月所有航班记录中的日期字段，按照业务规则自动判定
          </p>
        </div>

        {calcResult && (
          <div
            style={{
              backgroundColor: '#f0f5ff',
              border: '1px solid #adc6ff',
              borderRadius: 8,
              padding: 16,
              marginTop: 16,
            }}
          >
            <h3 style={{ marginTop: 0 }}>计算结果汇总</h3>
            
            {/* 核心指标 */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, textAlign: 'center', padding: 12, backgroundColor: '#fff', borderRadius: 8 }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1890ff' }}>
                  {calcResult.work_days}
                </div>
                <div style={{ fontSize: 12 }}>工作日</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: 12, backgroundColor: '#fff', borderRadius: 8 }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#faad14' }}>
                  {calcResult.overtime_days}
                </div>
                <div style={{ fontSize: 12 }}>加班日</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: 12, backgroundColor: '#fff', borderRadius: 8 }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#52c41a' }}>
                  {calcResult.leave_days}
                </div>
                <div style={{ fontSize: 12 }}>休假</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: 12, backgroundColor: '#fff', borderRadius: 8 }}>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#722ed1' }}>
                  {calcResult.total_days}
                </div>
                <div style={{ fontSize: 12 }}>总计</div>
              </div>
            </div>

            {/* 详细指标表格 */}
            <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <h4 style={{ marginBottom: 8, marginTop: 0 }}>详细指标</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px 16px' }}>
                <div style={{ padding: '4px 0' }}>
                  <span style={{ color: '#666' }}>日历天数:</span> <strong>{calcResult.calendar_days}</strong>
                </div>
                <div style={{ padding: '4px 0' }}>
                  <span style={{ color: '#666' }}>印尼起始:</span> <strong>{calcResult.indonesia_start_date || '-'}</strong>
                </div>
                <div style={{ padding: '4px 0' }}>
                  <span style={{ color: '#666' }}>印尼结束:</span> <strong>{calcResult.indonesia_end_date || '-'}</strong>
                </div>
                <div style={{ padding: '4px 0' }}>
                  <span style={{ color: '#666' }}>海龄:</span> <strong>{calcResult.sea_age}</strong>
                </div>
                <div style={{ padding: '4px 0' }}>
                  <span style={{ color: '#666' }}>非现场出勤:</span> <strong>{calcResult.off_site_attendance_days}</strong>
                </div>
                <div style={{ padding: '4px 0' }}>
                  <span style={{ color: '#666' }}>现场出勤:</span> <strong>{calcResult.on_site_attendance_days}</strong>
                </div>
                <div style={{ padding: '4px 0' }}>
                  <span style={{ color: '#666' }}>一线基地:</span> <strong>{calcResult.frontline_base_days}</strong>
                </div>
                <div style={{ padding: '4px 0' }}>
                  <span style={{ color: '#666' }}>安全津贴:</span> <strong>{calcResult.safety_allowance_days}</strong>
                </div>
                <div style={{ padding: '4px 0' }}>
                  <span style={{ color: '#666' }}>假日加班:</span> <strong style={{ color: calcResult.china_holiday_overtime_days > 0 ? '#ff4d4f' : undefined }}>{calcResult.china_holiday_overtime_days}</strong>
                </div>
                <div style={{ padding: '4px 0' }}>
                  <span style={{ color: '#666' }}>境外出勤:</span> <strong style={{ color: calcResult.overseas_attendance_days > 0 ? '#1890ff' : undefined }}>{calcResult.overseas_attendance_days}</strong>
                </div>
                <div style={{ padding: '4px 0' }}>
                  <span style={{ color: '#666' }}>超期工作:</span> <strong style={{ color: calcResult.overdue_work_days > 0 ? '#ff4d4f' : undefined }}>{calcResult.overdue_work_days}</strong>
                </div>
              </div>
            </div>

            {calcResult.breakdown.length > 0 && (
              <div>
                <h4 style={{ marginBottom: 8 }}>明细</h4>
                <div
                  style={{
                    maxHeight: 200,
                    overflowY: 'auto',
                    backgroundColor: '#fff',
                    borderRadius: 4,
                    padding: 8,
                  }}
                >
                  {calcResult.breakdown.map((item, index) => (
                    <div key={index} style={{ padding: '4px 8px', borderBottom: index < calcResult.breakdown.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default FlightPage
