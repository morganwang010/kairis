import React, { useState, useEffect } from 'react'
import { Upload, Table, Card, message, Tabs, Button, Select } from 'antd'
import { UploadOutlined, SyncOutlined, PlusOutlined } from '@ant-design/icons'
import * as XLSX from 'xlsx'
import type { UploadProps } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useTranslation } from 'react-i18next'
import { importAttendanceRecords, importSingleAttendanceRecord, getProjects } from '../api'

const { Option } = Select;

interface SheetData {
  [key: string]: any
}

interface ParsedSheet {
  name: string
  data: SheetData[]
  columns: ColumnsType<SheetData>
}

const AttendanceUploadPage: React.FC = () => {
  const { t } = useTranslation();
  const [parsedSheets, setParsedSheets] = useState<ParsedSheet[]>([])
  const [activeTabKey, setActiveTabKey] = useState('')
  const [importLoading, setImportLoading] = useState(false)
  const [singleImportLoading, setSingleImportLoading] = useState<{[key: string]: boolean}>({})
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState('')

  // 获取项目列表
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects()
        setProjects(data)
        // 默认选择第一个项目
        if (data.length > 0) {
          setSelectedProject(data[0].id)
        }
      } catch (error) {
        console.error('获取项目列表失败:', error)
        message.error(t('common.error'))
      }
    }
    fetchProjects()
  }, [t])

  // 处理Excel文件上传
  const handleUpload: UploadProps['onChange'] = ({ file }) => {
    console.log('文件上传状态变更:', file.status, '文件名:', file)
    console.log('文件状态:', file.originFileObj)
    console.log('project_id:', selectedProject)
    
    // 当文件被添加（无论状态如何），立即开始处理
    // if (file.name && file.originFileObj instanceof File) {
    if (file.name) {
      console.log('开始处理文件:', file.name)
      processFile(file)
    } else {
      console.error('文件对象无效或不存在:', file.originFileObj)
      message.error(t('attendanceUploadPage.invalidFile'))
    }
    
    // 处理其他状态
    if (file.status === 'error') {
      console.error('文件上传失败')
      message.error(t('attendanceUploadPage.uploadError'))
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
      
      // 构建考勤记录数据
      const attendanceRecord = {
        employee_id: record['employee_id'],
        project_id: selectedProject,
        month: record['Month'] || new Date().toISOString().slice(0, 7),
        work: record['W'] || 0,
        off: record['O'] || 0,
        sick: record['S'] || 0,
        standby: record['SB'] || record['Standby'] || 0,
        annualleave: record['I&C'] || record['AnnualLeave'] || 0,
        quarantime: record['Q'] || record['Quarantime'] || 0,
        absent: record['A'] || record['Absent'] || 0,
        ew1: record['EW1'] || record['ew1'] || 0,
        ew2: record['EW2'] || record['ew2'] || 0,
        ew3: record['EW3'] || record['ew3'] || 0,
        ot1: record['OT1'] || record['ot1'] || 0,
        ot2: record['OT2'] || record['ot2'] || 0,
        ot3: record['OT3'] || record['ot3'] || 0,
        leave_replc: record['Leave_Replc'] || record['leave_replc'] || 0,
        unpresent: record['UP'] || record['Unpresent'] || 0,
        total_days: record['TOTAL'] || record['total'] || 0,
        day1: record['1'] || 0,
        day2: record['2'] || 0,
        day3: record['3'] || 0,
        day4: record['4'] || 0,
        day5: record['5'] || 0,
        day6: record['6'] || 0,
        day7: record['7'] || 0,
        day8: record['8'] || 0,
        day9: record['9'] || 0,
        day10: record['10'] || 0,
        day11: record['11'] || 0,
        day12: record['12'] || 0,
        day13: record['13'] || 0,
        day14: record['14'] || 0,
        day15: record['15'] || 0,
        day16: record['16'] || 0,
        day17: record['17'] || 0,
        day18: record['18'] || 0,
        day19: record['19'] || 0,
        day20: record['20'] || 0,
        day21: record['21'] || 0,
        day22: record['22'] || 0,
        day23: record['23'] || 0,
        day24: record['24'] || 0,
        day25: record['25'] || 0,
        day26: record['26'] || 0,
        day27: record['27'] || 0,
        day28: record['28'] || 0,
        day29: record['29'] || 0,
        day30: record['30'] || 0,
        day31: record['31'] || 0
      }
      
      // 检查必要字段
      if (!attendanceRecord.employee_id) {
        message.error(t('attendanceUploadPage.missingEmployeeId'))
        return
      }
      
      const result = await importSingleAttendanceRecord(attendanceRecord)
      message.success(String(result) || '导入成功')
    } catch (error) {
      console.error('导入失败:', error)
      message.error(t('attendanceUploadPage.importError'))
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
        message.error(t('attendanceUploadPage.noActiveSheet'))
        return
      }
      console.log('当前工作表中第一行数据:', currentSheet.data[0]['1'])
      console.log('当前工作表数据:', currentSheet.data)
      // 转换数据格式
      const records = currentSheet.data.map(record => ({
        // console.log(record['1'])
        employee_id: record['employee_id'],
        project_id: selectedProject,
        month: record['Month'] || new Date().toISOString().slice(0, 7),
        work: record['W'] || 0,
        off: record['O'] || 0,
        sick: record['S'] || 0,
        standby: record['SB'] || record['Standby'] || 0,
        annualleave: record['I&C'] || record['AnnualLeave'] || 0,
        quarantime: record['Q'] || record['Quarantime'] || 0,
        absent: record['A'] || record['Absent'] || 0,
        unpresent: record['UP'] || record['Unpresent'] || 0,
        ew1: record['EW1'] || record['ew1'] || 0,
        ew2: record['EW2'] || record['ew2'] || 0,
        ew3: record['EW3'] || record['ew3'] || 0,
        ot1: record['OT1'] || record['ot1'] || 0,
        ot2: record['OT2'] || record['ot2'] || 0,
        ot3: record['OT3'] || record['ot3'] || 0,
        total_days: record['TOTAL'] || record['TOTAL'] || 0,
        day1: record['1'] || 0,
        day2: record['2'] || 0,
        day3: record['3'] || 0,
        day4: record['4'] || 0,
        day5: record['5'] || 0,
        day6: record['6'] || 0,
        day7: record['7'] || 0,
        day8: record['8'] || 0,
        day9: record['9'] || 0,
        day10: record['10'] || 0,
        day11: record['11'] || 0,
        day12: record['12'] || 0,
        day13: record['13'] || 0,
        day14: record['14'] || 0,
        day15: record['15'] || 0,
        day16: record['16'] || 0,
        day17: record['17'] || 0,
        day18: record['18'] || 0,
        day19: record['19'] || 0,
        day20: record['20'] || 0,
        day21: record['21'] || 0,
        day22: record['22'] || 0,
        day23: record['23'] || 0,
        day24: record['24'] || 0,
        day25: record['25'] || 0,
        day26: record['26'] || 0,
        day27: record['27'] || 0,
        day28: record['28'] || 0,
        day29: record['29'] || 0,
        day30: record['30'] || 0,
        day31: record['31'] || 0
        
      })).filter(record => record.employee_id )
      // . filter((_, index) => index >= 1) // 过滤掉没有员工ID的记录,还要从第三条数据开始,因为前两条是标题
      
      if (records.length === 0) {
        console.log('没有有效记录可导入')
        message.error(t('attendanceUploadPage.noValidRecords'))
        return
      }
      console.log('准备导入的记录:', records)
      const result = await importAttendanceRecords(records)
      message.success(String(result) || '批量导入成功')
    } catch (error) {
      console.log('捕获到的错误:', error)
      console.error('批量导入失败:', error)
      message.error(t('attendanceUploadPage.batchImportError'))
    } finally {
      setImportLoading(false)
    }
  }
  
  // 单独的文件处理函数
  const processFile = (file: any) => {
    // console.log('开始处理文件:', file.name)
    // console.log('文件大小:', file.size, '字节')
    // console.log('文件类型:', file.type)
    
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
              message.error(t('common.error'))
              return
            }

          // 解析Excel文件
          console.log('开始解析Excel文件')
          const workbook = XLSX.read(data, { type: 'binary' })
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
            console.log('合并单元格详情:', mergedCells)
            
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
              
              console.log(`处理合并区域: ${startCellAddress} 到 ${XLSX.utils.encode_cell({r: endRow, c: endCol})}`)
              
              // 如果左上角单元格有值，将其复制到合并区域的所有单元格
              if (startCell) {
                for (let row = startRow; row <= endRow; row++) {
                  for (let col = startCol; col <= endCol; col++) {
                    // 跳过左上角单元格，它已经有值
                    if (row === startRow && col === startCol) continue;
                    
                    const cellAddress = XLSX.utils.encode_cell({r: row, c: col});
                    ws[cellAddress] = {...startCell}; // 复制单元格的值和格式
                    console.log(`设置单元格 ${cellAddress} 值为:`, startCell.v)
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
            console.log('处理合并单元格后的数据格式:', jsonData.length > 0 ? typeof jsonData[0] : '无数据')
            
            console.log(`工作表${sheetName}转换为JSON数据，总行数:`, jsonData.length)
            console.log('前3行数据:', JSON.stringify(jsonData.slice(0, 3), null, 2))

            // 处理表头，假设第一行是表头
            const headerRow = jsonData[0]
            console.log('表头行数据:', headerRow)
            
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
                  console.log(`映射列 ${key} -> ${uniqueHeader} (原列为${headerValue})`)
                } else {
                  headerCount[headerValue] = 0
                  headerMapping[key] = headerValue
                  console.log(`映射列 ${key} -> ${headerValue}`)
                }
              }
            })
            
            console.log('最终列映射:', headerMapping)
            console.log('列名计数:', headerCount)

            // 处理数据行，跳过表头行
            const processedData: SheetData[] = []
            for (let i = 1; i < jsonData.length; i++) {
              const row = jsonData[i]
              const processedRow: SheetData = {}
              let hasData = false
              
              // 按原始顺序处理列，确保所有数据都被保留
              // 直接使用字母列名作为键，避免重复列名覆盖问题
              Object.keys(row as Record<string, any>).forEach((key) => {
                const headerName = headerMapping[key]
                const cellValue = (row as Record<string, any>)[key]
                
                if (headerName) {
                  // 设置值并标记行有数据
                  processedRow[headerName] = cellValue
                  if (cellValue !== undefined && cellValue !== null && cellValue !== '') {
                    hasData = true
                  }
                  console.log(`设置 ${headerName} = ${cellValue}`)
                }
              })

              // 只添加有数据的行
              if (hasData || Object.keys(processedRow).length > 0) {
                processedData.push(processedRow)
                console.log(`添加行 ${i}:`, processedRow)
              }
            }
            
            console.log(`共添加 ${processedData.length} 行数据`)
            
            console.log(`工作表${sheetName}处理完成，有效数据行数:`, processedData.length)
            console.log('前2行处理后的数据:', JSON.stringify(processedData.slice(0, 2), null, 2))

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
                  icon={<PlusOutlined />}
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
            
            console.log(`工作表${sheetName}已添加到结果列表`)
          })

          setParsedSheets(sheets)
          console.log('所有工作表处理完成，最终结果数量:', sheets.length)
          
          if (sheets.length > 0) {
              setActiveTabKey(sheets[0].name)
              message.success(String(t('common.success')) || '成功')
              console.log('激活第一个工作表:', sheets[0].name)
          } else {
            message.warning(t('common.noData'))
            console.log('没有找到可显示的数据')
          }
        } catch (error) {
            console.error('解析Excel失败:', error)
            message.error(t('common.error'))
          } finally {
            console.log('文件处理流程完成')
          }
      }
      
      reader.onerror = (error) => {
        console.error('文件读取错误:', error)
        message.error('文件读取失败')
      }
      
      reader.onabort = () => {
        console.error('文件读取被中止')
        message.error(t('common.error'))
      }
      
      console.log('开始以二进制字符串形式读取文件')
      reader.readAsArrayBuffer(file)
    } catch (error) {
      console.error('处理文件失败:', error)
      message.error(t('common.error'))
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
        message.error(t('attendanceUploadPage.uploadError'))
        return Upload.LIST_IGNORE
      }
      
      // 检查文件大小（这里设置为10MB）
      const isLessThan10M = file.size / 1024 / 1024 < 10
      if (!isLessThan10M) {
        message.error(t('attendanceUploadPage.maxSize'))
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

  // 生成标签页项
  const tabItems = parsedSheets.map((sheet) => ({
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
  }))

  return (
    <Card title={t('attendanceUploadPage.title')} style={{ margin: 0, border: 'none', boxShadow: 'none' }}>
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ marginRight: 10 }}>{t('attendanceUploadPage.selectProject')}:</span>
          <Select
            value={selectedProject}
            onChange={setSelectedProject}
            style={{ width: 200 }}
          >
            {projects.map(project => (
              <Option key={project.id} value={project.id}>
                {project.project_name}
              </Option>
            ))}
          </Select>
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
              {t('attendanceUploadPage.importAll')}
            </Button>
          </div>
          <Tabs
            activeKey={activeTabKey}
            onChange={setActiveTabKey}
            items={tabItems}
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
    </Card>
  )
}

export default AttendanceUploadPage