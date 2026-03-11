import { useState, useEffect, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Table, Button, Modal, Form, Input, Select, DatePicker, Pagination,  message,  Upload, Tabs, Checkbox } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, SyncOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { getDepartments, deleteEmployee, getProjects, importEmployeeRecords, importSingleEmployeeRecord, updateEmployee } from '../api'
// import { invoke, isTauri } from '@tauri-apps/api/core'
import dayjs from 'dayjs'
import ScientificNumberDisplay from '../components/ScientificNumberDisplay';
import * as XLSX from 'xlsx';

interface EmployeePageProps {
  projectId: string
  projectName?: string
}

interface Employee {
  id: number
  name: string // 员工姓名
  employee_id: string // 员工ID
  department: string // 部门
  position: string // 职务
  hire_date: string // 入职时间
  leave_date: string // 离职时间
  salary: number // 工资
  hierarchy_id: string // 层级
  hierarchy_name: string // 层级名称
  join_date: string // 加入时间
  resign_date: string // 离职时间
  email: string // 邮箱
  feild_alw: number // 外勤补助是否 Always
  fix_alw: number // 固定补助是否 Always
  position_alw: number // 岗位津贴是否 Always
  housing_alw: number // 住房补助是否 Always
  basic_salary: number // 基本工资
  tax_type: string
  meal_alw_day: number // 餐补是否 Always
  transp_alw_day: number // 车补是否 Always
  pulsa_alw_day: number // 话补是否 Always
  pulsa_alw_month: number // 话补是否 Always
  att_alw_day: number // 出勤补是否 Always
  npwp: string // NPWP
  project_id: number // 项目ID
  project_name: string // 项目名称
  location_name: string // 位置名称
}

const EmployeePage: FC<EmployeePageProps> = ({ projectId, projectName }) => {
  const [dialogVisible, setDialogVisible] = useState(false)
  const [importModalVisible, setImportModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [filterForm] = Form.useForm()
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [employeesData, setEmployeesData] = useState<Employee[]>([])
  const [parsedSheets, setParsedSheets] = useState<{name: string; data: any[]; columns: any[]}[]>([])
  const [activeTabKey, setActiveTabKey] = useState('')
  const [importLoading, setImportLoading] = useState(false)
  const [singleImportLoading, setSingleImportLoading] = useState<Record<string, boolean>>({})
  // const [selectedProject, setSelectedProject] = useState<string>('')
  // const [projects, setProjects] = useState<any[]>([])
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  // const [ranks, setRanks] = useState<{ id: any; name: string; salary?: number }[]>([])
  const [loading, setLoading] = useState(false)
  const [filterValues, setFilterValues] = useState<{[key: string]: any}>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const { t } = useTranslation()
  const [modal, contextHolder] = Modal.useModal()
  const [messageApi, messageContextHolder] = message.useMessage();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  console.log('projectName', projectName)
  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowKeys(employeesData.map(emp => emp.id))
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
      messageApi.warning(t('employeePage.selectAtLeastOne'))
      return
    }

    modal.confirm({
      title: t('projectPage.confirmDelete'),
      content: t('employeePage.confirmBatchDelete', { count: selectedRowKeys.length }),
      onOk: async () => {
        try {
          for (const id of selectedRowKeys) {
            await deleteEmployee(id.toString())
          }
          setEmployeesData(prev => prev.filter(emp => !selectedRowKeys.includes(emp.id)))
          setSelectedRowKeys([])
          messageApi.success(t('employeePage.batchDeleteSuccess'))
          loadEmployees({})
        } catch (error) {
          console.error(t('employeePage.deleteEmployeeError'), error)
          messageApi.error(t('employeePage.deleteError'))
        }
      },
    })
  }

  // 加载部门数据
  const loadDepartments = async () => {
    try {
      setLoading(true)
      const deptData = await getDepartments()
      // 确保id为字符串类型
      setDepartments(deptData.map((item: { id: number; name: string }) => ({ id: item.id.toString(), name: item.name })))
    } catch (error) {
      console.error(t('employeePage.loadDepartmentsError'), error)
      messageApi.error(t('employeePage.loadDepartmentsError'))
    } finally {
      setLoading(false)
    }
  }

  // 加载职级数据
  const loadRanks = async () => {
    try {
      setLoading(true)
      // const rankData = await getRanks()
      // setRanks(rankData)
    } catch (error) {
      console.error(t('employeePage.loadRanksError'), error)
      messageApi.error(t('employeePage.loadRanksError'))
      // 提供默认职级数据作为备选

    } finally {
      setLoading(false)
    }
  }

  // 加载员工数据
  const loadEmployees = async (filters?: any) => {
    try {
      if (await isTauri()) {
        // 在Tauri环境中，调用后端API，传递分页参数
        const result = await invoke('get_employees', {
          query: {
            ...filters,
            project_id: projectId,
            page: currentPage.toString(),
            page_size: pageSize.toString()
          }
        })
        const response = result as { data: any[]; total: number };
        console.log(response.data)
        setEmployeesData(response.data)
        setTotal(response.total)
      } 
    } catch (error) {
      console.error(t('employeePage.loadEmployeesError'), error)
      messageApi.error(t('employeePage.loadEmployeesError'))
      // 失败时使用生成的mock数据作为后备
      // const mockData = generateMockData()
      // setEmployeesData(mockData)
      // setTotal(mockData.length)
    }
  }

  // 获取项目列表用于导入
  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      // setProjects(data || []);
      console.log(t('employeePage.fetchProjectsSuccess'), data);
    } catch (error) {
      console.error(t('employeePage.fetchProjectsError'), error);
      messageApi.error(t('employeePage.fetchProjectsError'));
    }
  };

  // 初始化加载数据
  useEffect(() => {
    // 先加载部门和职级数据
    const loadInitialData = async () => {
      await Promise.all([
        loadDepartments(),
        loadRanks(),
        fetchProjects()
      ])
      // 再加载员工数据
      loadEmployees(filterValues)
    }
    loadInitialData()
  }, [currentPage, pageSize, filterValues, projectId])
  
  // 处理筛选表单提交
  const handleFilterSubmit = () => {
    filterForm.validateFields().then(values => {
      const formattedValues = {
        ...values,
        location: values.location_name // 使用location_name字段作为location筛选条件
      }
      setFilterValues(formattedValues)
      setCurrentPage(1) // 筛选时回到第一页
      loadEmployees(formattedValues)
    })
  }
  
  // 处理筛选表单重置
  const handleFilterReset = () => {
    filterForm.resetFields()
    setFilterValues({})
    loadEmployees({})
  }

  const openEditDialog = (row: Employee) => {
    setEditingEmployee(row)
    // 将日期字符串转换为 dayjs 对象
    const formattedRow = {
      ...row,
      join_date: row.join_date ? dayjs(row.join_date) : null,
      resign_date: row.resign_date ? dayjs(row.resign_date) : null
    }
    form.setFieldsValue(formattedRow)
    setDialogVisible(true)
  }

  const handleDelete = async (id: number) => {
      // setIsEditMode(false);
      // setIsModalVisible(true);
      console.log("ssssssssssssssssssthe delete project id is: "+id);
      modal.confirm({
        title: t('projectPage.confirmDelete'),
        content: t('employeePage.confirmDelete'),
        onOk: async () => {
          try {
            // 调用删除项目API
            console.log("start delete project id is: "+id);
            await deleteEmployee(id.toString());
            setEmployeesData(prev => prev.filter(emp => emp.id !== id));
            // deleteProjects({ project_id: parseInt(id) }).then(() => {
            //   // 刷新项目列表
            //   console.log("end delete project id is: "+id);
            //   loadProjects();
            // });
            // setProjects(projects.filter(project => project.id !== id));
            messageApi.success(t('employeePage.deleteSuccess'));
          } catch (error) {
            console.error(t('employeePage.deleteEmployeeError'), error);
            messageApi.error(t('employeePage.deleteError'));
          }
        },
      });
    };


  // 文件上传处理
  const handleUpload = ({ file }: any) => {
    console.log('文件上传状态变更:', file.status, '文件名:', file)
    console.log('文件状态:', file.originFileObj)
    
    // 当文件被添加（无论状态如何），立即开始处理
    if (file.name) {
      console.log('开始处理文件:', file.name)
      processFile(file)
    } else {
      console.error('文件对象无效或不存在:', file.originFileObj)
      messageApi.error(t('employeePage.invalidFile'))
    }
    
    // 处理其他状态
    if (file.status === 'error') {
      console.error('文件上传失败')
      messageApi.error(t('employeePage.fileUploadFailed'))
    } else if (file.status === 'removed') {
      console.log('文件已移除')
      // 当文件被移除时，清空解析结果
      setParsedSheets([])
      setActiveTabKey('')
    }
  };
  
  // 处理Excel文件
  const processFile = (file: File) => {
    console.log('开始处理Excel文件:', file.name);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        console.log('文件读取成功，开始解析Excel');
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        console.log('Excel工作簿解析成功，工作表数量:', workbook.SheetNames.length);
        
        const sheets: any[] = [];
        
        // 处理每个工作表
        workbook.SheetNames.forEach((sheetName: string) => {
          console.log('正在处理工作表:', sheetName);
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          console.log('工作表数据行数:', jsonData.length);
          
          if (jsonData.length > 0) {
            // 创建列映射，处理合并单元格和重复列名
            const headerMapping: Record<string, string> = {};
            const headerCount: Record<string, number> = {};
            
            // 处理表头
            if (jsonData.length > 0 && Array.isArray(jsonData[0])) {
              jsonData[0].forEach((header: any, index: number) => {
                const headerValue = String(header || 'Unnamed Column ' + (index + 1));
                let mappedHeader = headerValue;
                
                if (headerCount[mappedHeader]) {
                  headerCount[mappedHeader]++;
                  mappedHeader = `${mappedHeader} ${headerCount[mappedHeader]}`;
                } else {
                  headerCount[mappedHeader] = 1;
                }
                
                const key = String.fromCharCode(65 + index); // A, B, C, ...
                headerMapping[key] = mappedHeader;
              });
              console.log('表头映射:', headerMapping);
            }
            
            // 处理数据行
            const processedData: any[] = [];
            for (let i = 1; i < jsonData.length; i++) {
              const row = jsonData[i];
              const processedRow: any = {};
              let hasData = false;
              
              Object.keys(headerMapping).forEach((key, index) => {
                const headerName = headerMapping[key];
                const cellValue = (row as any[])[index];
               
                if (headerName && cellValue !== undefined && cellValue !== null) {
                  processedRow[headerName] = cellValue;
                  if (cellValue !== '') {
                    hasData = true;
                  }
                }
              });
              
              if (hasData || Object.keys(processedRow).length > 0) {
                processedData.push(processedRow);
              }
            }
            console.log('处理后的数据行数:', processedData.length);
            
            // 生成表格列配置
            const columns: any[] = Object.values(headerMapping).map((header, index) => ({
              title: header,
              dataIndex: header,
              key: `column-${index}`,
              ellipsis: true,
            }));
            
            // 添加操作列
            columns.push({
              title: t('common.action'),
              key: 'action',
              render: ( record: any, index: number) => (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="small"
                  onClick={() => handleSingleImport(record, index)}
                  loading={singleImportLoading[`${sheetName}-${index}`]}
                >
                  {t('employeePage.import')}
                </Button>
              )
            });
            
            sheets.push({
              name: sheetName,
              data: processedData,
              columns
            });
            console.log('工作表处理完成:', sheetName, '数据行数:', processedData.length);
          }
        });
        
        console.log('所有工作表处理完成，总共:', sheets.length, '个工作表');
        setParsedSheets(sheets);
        if (sheets.length > 0) {
          setActiveTabKey(sheets[0].name);
          messageApi.success(t('employeePage.fileParseSuccess'));
        } else {
          messageApi.warning(t('employeePage.noDataInFile'));
        }
      } catch (error) {
        console.error('解析Excel失败:', error);
        messageApi.error(t('employeePage.fileParseFailed'));
      }
    };
    
    reader.onerror = () => {
      console.error('文件读取失败');
      messageApi.error(t('employeePage.fileReadFailed'));
    };
    
    reader.readAsArrayBuffer(file);
  };
  
  // 单条记录导入
  const handleSingleImport = async (record: any, index: number) => {
    if (!projectId) {
      messageApi.warning(t('employeePage.selectProject'));
      return;
    }
    
    setSingleImportLoading(prev => ({
      ...prev,
      [`${activeTabKey}-${index}`]: true
    }));
    
    try {
      const employeeData = {
        ...record,
        project_id: projectId
      };
      
      // 使用importSingleEmployeeRecord API函数替代直接的fetch调用
      try {
        await importSingleEmployeeRecord(employeeData);
        messageApi.success(t('employeePage.importSuccess'));
      } catch (error) {
        console.error('导入失败:', error);
        messageApi.error(t('employeePage.importFailed'));
      }
      loadEmployees(); // 重新加载员工数据
    } catch (error) {
      console.error('导入失败:', error);
      messageApi.error(t('employeePage.importFailed'));
    } finally {
      setSingleImportLoading(prev => ({
        ...prev,
        [`${activeTabKey}-${index}`]: false
      }));
    }
  };
  
  // 批量导入
  const handleImportAll = async () => {

    if (!projectId) {
      messageApi.warning(t('employeePage.selectProject'));
      return;
    }
    console.log('选择的项目ID:',  projectId);
    
    setImportLoading(true);
    
    try {
      const currentSheet = parsedSheets.find(sheet => sheet.name === activeTabKey);
      if (!currentSheet) return;
      
      const importData = currentSheet.data.map((record: any) => ({
        ...record,
        project_id: projectId
      }));
      console.log('选择的项目ID:',  projectId);
      
      // 使用importEmployeeRecords API函数替代直接的fetch调用
      try {
        await importEmployeeRecords(importData);
        messageApi.success(t('employeePage.importAllSuccess', { count: importData.length }));
        loadEmployees(); // 重新加载员工数据
        setImportModalVisible(false);
        // 重置导入状态
        setParsedSheets([]);
        setActiveTabKey('');
      } catch (error) {
        console.error('批量导入失败:', error);
        messageApi.error(t('employeePage.batchImportFailed'));
      }
    } finally {
      setImportLoading(false);
    }
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      if (editingEmployee) {
        handleUpdate(values);
      } else {
        handleAdd(values);
      }
    });
  };
  
  // 配置上传组件
  const uploadProps: any = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls',
    beforeUpload: (file: File) => {
      // 检查文件类型
      const isExcel = file.type === 'application/vnd.ms-excel' || 
                      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                      file.name.endsWith('.xls') || 
                      file.name.endsWith('.xlsx');
      
      if (!isExcel) {
        messageApi.error(t('employeePage.pleaseUploadExcelFile'));
        return Upload.LIST_IGNORE;
      }
      
      // 检查文件大小（这里设置为10MB）
      const isLessThan10M = file.size / 1024 / 1024 < 10;
      if (!isLessThan10M) {
        messageApi.error(t('employeePage.fileSizeExceeded'));
        return Upload.LIST_IGNORE;
      }
      
      // 返回false阻止默认上传行为，我们将在onChange中处理
      return false;
    },
    onChange: handleUpload,
    showUploadList: true,
    fileList: [],
    customRequest: ({ onSuccess }: any) => {
      if (onSuccess) {
        setTimeout(() => onSuccess('ok'), 0);
      }
    },
  };
  
  // 生成标签页项
  const tabItems = parsedSheets.map((sheet) => ({
    key: sheet.name,
    label: sheet.name,
    children: (
      <div style={{ marginTop: 20 }}>
        {/* <Select
          value={selectedProject}
          onChange={setSelectedProject}
          placeholder={t('employeePage.selectProject')}
          style={{ marginBottom: 16, width: 300 }}
          options={projects.map(project => ({
            value: project.id,
            label: project.project_name
          }))}
        /> */}
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
  }));
  
  // 添加员工
  const handleAdd = (values: any) => {
    console.log('提交表单', values)
    // 实际应用中应该有API调用
    // 这里简单实现本地数据更新
    const newEmployee = {
      ...values,
      id: employeesData.length + 1,
      // 确保员工ID和姓名格式正确
      employee_id: values.employee_id || `EMP${String(employeesData.length + 1).padStart(5, '0')}`,
    }
    setEmployeesData(prev => [...prev, newEmployee])
    messageApi.success(t('employeePage.addSuccess'))
    setDialogVisible(false)
  }
  
  // 更新员工
  const handleUpdate = async (values: any) => {
    try {
      console.log('提交表单', values)
      // 调用真实的API更新员工数据
      await updateEmployee(editingEmployee!.id.toString(), projectId, values)
      
      // 重新加载员工数据
      loadEmployees(filterValues)
      
      messageApi.success(t('employeePage.updateSuccess'))
      setDialogVisible(false)
    } catch (error) {
      console.error('更新员工失败:', error)
      messageApi.error(t('employeePage.updateError'))
    }
  }

  const columns: ColumnsType<Employee> = [
    {
      title: (
        <Checkbox
          checked={selectedRowKeys.length === employeesData.length && employeesData.length > 0}
          indeterminate={selectedRowKeys.length > 0 && selectedRowKeys.length < employeesData.length}
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
      ),
      key: 'selection',
      width: 60,
      render: (_, record) => (
        <Checkbox
          checked={selectedRowKeys.includes(record.id)}
          onChange={(e) => handleSelectRow(record.id, e.target.checked)}
        />
      ),
    },
    {
      title: t('common.no'),
      key: 'serial',
      width: 80,
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    { title: t('employeePage.projectName'), dataIndex: 'project_name', key: 'project_name', width: 140 },
    { title: t('employeePage.employeeName'), dataIndex: 'name', key: 'name', width: 150 },
    { title: t('employeePage.employeeId'), dataIndex: 'employee_id', key: 'employee_id', width: 120 },
    { title: t('employeePage.taxStatus'), dataIndex: 'tax_type', key: 'tax_type', width: 80 },
    { title: t('employeePage.idCard'), dataIndex: 'id_card', key: 'id_card', width: 150 },
    { title: t('employeePage.npwp'), dataIndex: 'npwp', key: 'npwp', width: 150 },
    { title: t('employeePage.hierarchyId'), dataIndex: 'hierarchy_id', key: 'hierarchy_id', width: 120 },
    { title: t('employeePage.hierarchyName'), dataIndex: 'hierarchy_name', key: 'hierarchy_name', width: 150 },
    { title: t('employeePage.workLocation'), dataIndex: 'location_name', key: 'location_name', width: 150 },
    { title: t('employeePage.hireDate'), dataIndex: 'join_date', key: 'join_date', width: 120 },
    { title: t('employeePage.resignDate'), dataIndex: 'resign_date', key: 'resign_date', width: 120, render: (text: string) => text !== "-" ? dayjs(text,'DD-MM-YYYY').format('YYYY-MM-DD') : '-' },
    { title: t('employeePage.position'), dataIndex: 'position', key: 'position', width: 120 },
    { title: t('employeePage.email'), dataIndex: 'email', key: 'email', width: 180 },
    { title: t('employeePage.basicSalary'), dataIndex: 'basic_salary', key: 'basic_salary', width: 120, render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} /> },
    { title: t('employeePage.housingAllowance'), dataIndex: 'housing_alw', key: 'housing_alw', width: 120, render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} /> },
    { title: t('employeePage.positionAllowance'), dataIndex: 'position_alw', key: 'position_alw', width: 120, render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} /> },
    { title: t('employeePage.fieldAllowance'), dataIndex: 'field_alw', key: 'field_alw', width: 100, render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} /> },
    // { title: t('employeePage.fixedAllowance'), dataIndex: 'fix_alw', key: 'fix_alw', width: 100, render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} /> },
    // { title: t('employeePage.incentiveAllowance'), dataIndex: 'incentive_alw', key: 'incentive_alw', width: 100, render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} /> },
    { title: t('employeePage.housingAllowanceTetap'), dataIndex: 'housing_alw_tetap', key: 'housing_alw_tetap', width: 150, render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} /> },
    { title: t('employeePage.phoneAllowanceMonth'), dataIndex: 'pulsa_alw_month', key: 'pulsa_alw_month', width: 150, render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} /> },
    { title: t('employeePage.mealAllowanceDay'), dataIndex: 'meal_alw_day', key: 'meal_alw_day', width: 150, render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} /> },
    { title: t('employeePage.transportAllowanceDay'), dataIndex: 'transp_alw_day', key: 'transp_alw_day', width: 150, render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} /> },
    { title: t('employeePage.phoneAllowanceDay'), dataIndex: 'pulsa_alw_day', key: 'pulsa_alw_day', width: 150, render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} /> },
    { title: t('employeePage.attendanceAllowanceDay'), dataIndex: 'att_alw_day', key: 'att_alw_day', width: 150, render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} /> },

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
    },
  ]

  return (
    
    <div style={{ padding: '5px', height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
       {contextHolder}
       {messageContextHolder}
      <Card style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <style>
          {`
            .table-row-light {
              background-color: #ffffff;
            }
            .table-row-light:hover {
              background-color: #f5f5f5 !important;
            }
            .table-row-dark {
              background-color: #ebeff5ff;
            }
            .table-row-dark:hover {
              background-color: #f5f5f5 !important;
            }
          `}
        </style>
        <div style={{ marginBottom: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* <h2>{t('employeePage.employeeManagement')}</h2> */}
          <>
            {/* <Button type="primary" icon={<PlusOutlined />} onClick={openAddDialog} style={{ marginLeft: 10 }}>{t('employeePage.addEmployee')}</Button> */}
          </>
        </div>
        


        {/* 筛选表单 */}
        <div style={{ marginBottom: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
          <Form form={filterForm} layout="inline" style={{ marginBottom: 20 }}>
            <Form.Item name="employee_id" label={t('employeePage.employeeId')}>
              <Input placeholder={t('employeePage.enterEmployeeId')} />
            </Form.Item>
            <Form.Item name="name" label={t('employeePage.employeeName')}>
              <Input placeholder={t('employeePage.enterEmployeeName')} />
            </Form.Item>
            <Form.Item name="project_name" label={t('employeePage.projectName')}>
              <Input placeholder={t('employeePage.enterProjectName')} />
            </Form.Item>
            <Form.Item name="location_name" label={t('employeePage.workLocation')}>
              <Input placeholder={t('employeePage.enterWorkLocation')} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={handleFilterSubmit} style={{ marginRight: 8 }}>{t('common.search')}</Button>
              <Button onClick={handleFilterReset}>{t('common.reset')}</Button>
            </Form.Item>
          </Form>
          </div>
          <div style={{ marginLeft: 16, display: 'flex', alignItems: 'center' }}>
           <Button type="primary" icon={<UploadOutlined />} onClick={() => setImportModalVisible(true)}>{t('employeePage.importEmployee')}</Button>
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
        </div>
        <Table 
          columns={columns} 
          dataSource={employeesData} 
          rowKey="id"
          rowClassName={(_, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
          style={{ width: '100%', flex: 1 }}
          pagination={false}
          scroll={{ x: 'calc(700px + 50%)', y: 'calc(100vh - 400px)' }}
        />
        
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
          style={{ marginTop: 20, textAlign: 'center' }}
        />
      </Card>
      
      <Modal
        title={editingEmployee ? t('employeePage.editEmployee') : t('employeePage.addEmployee')}
        open={dialogVisible}
        onOk={handleSubmit}
        onCancel={() => setDialogVisible(false)}
        width={800}
        bodyStyle={{ maxHeight: '600px', overflowY: 'auto' }}
      >
        <Form 
          form={form}
          layout="vertical"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
        >
          {editingEmployee && (
            <Form.Item label={t('employeePage.index')} name="id">
              <Input disabled />
            </Form.Item>
          )}
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <Form.Item labelCol={{ span: 8 }} label={t('employeePage.projectId')} name="project_id" hidden>
              <Input />
            </Form.Item>
            <Form.Item labelCol={{ span: 8 }} label={t('employeePage.employeeName')} name="name" rules={[{ required: true, message: t('employeePage.enterEmployeeName') }]}>
              <Input />
            </Form.Item>
            <Form.Item labelCol={{ span: 8 }} label={t('employeePage.employeeId')} name="employee_id" rules={[{ required: true, message: t('employeePage.enterEmployeeId') }]}>
              <Input />
            </Form.Item>
            <Form.Item labelCol={{ span: 8 }} label={t('employeePage.taxStatus')} name="tax_type" rules={[{ required: true, message: t('employeePage.enterTaxStatus') }]}>
              <Input />
            </Form.Item>
            <Form.Item labelCol={{ span: 8 }} label={t('employeePage.idCard')} name="id_card">
              <Input />
            </Form.Item>
            <Form.Item labelCol={{ span: 8 }} label={t('employeePage.npwp')} name="npwp">
              <Input />
            </Form.Item>
            <Form.Item labelCol={{ span: 8 }} label={t('employeePage.department')} name="department" rules={[{ required: true, message: t('employeePage.enterDepartment') }]}>
              <Select loading={loading}>
                {departments.map(dept => (
                  <Select.Option key={dept.id} value={dept.name}>{dept.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item labelCol={{ span: 8 }} label={t('employeePage.position')} name="position" rules={[{ required: true, message: t('employeePage.enterPosition') }]}>
                <Input />
            </Form.Item>
            <Form.Item labelCol={{ span: 8 }} label={t('employeePage.hierarchyId')} name="hierarchy_id">
              <Input />
              {/* <Select 
                loading={loading}
                onChange={(value) => {
                  const selectedLevel = ranks.find(l => l.id === value);
                  if (selectedLevel) {
                    form.setFieldsValue({ levelName: selectedLevel.name });
                  }
                }}
              >
                {ranks.map(level => (
                  <Select.Option key={level.id} value={level.id}>{level.id}</Select.Option>
                ))}
              </Select> */}
            </Form.Item>
            <Form.Item labelCol={{ span: 8 }} label={t('employeePage.hierarchyName')} name="hierarchy_name">
              <Input  />
            </Form.Item>
            <Form.Item labelCol={{ span: 8 }} label={t('employeePage.workLocation')} name="location_name">
              <Input  />
            </Form.Item>
            <Form.Item labelCol={{ span: 8 }} label={t('employeePage.email')} name="email">
              <Input />
            </Form.Item>
            <Form.Item labelCol={{ span: 8 }} label={t('employeePage.joinDate')} name="join_date">
              <DatePicker style={{ width: '100%' }} format="YYYY-MM" picker="month" />
            </Form.Item>
            <Form.Item labelCol={{ span: 8 }} label={t('employeePage.resignDate')} name="resign_date">
              <DatePicker style={{ width: '100%' }} format="YYYY-MM" picker="month" />
            </Form.Item>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ marginBottom: '12px' }}>{t('employeePage.salaryAllowanceStandard')}</h4>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item label={t('employeePage.basicSalary')} name="basic_salary" rules={[{ required: true, message: t('employeePage.enterBasicSalary') }]}>
              <Input type="number" addonBefore="" />
            </Form.Item>
            <Form.Item label={t('employeePage.fieldAllowance')} name="field_alw">
              <Input type="number" addonBefore="" />
            </Form.Item>
            <Form.Item label={t('employeePage.housingAllowance')} name="housing_alw">
              <Input type="number" addonBefore="" />
            </Form.Item>
            <Form.Item label={t('employeePage.fixedAllowance')} name="fix_alw">
              <Input type="number" addonBefore="" />
            </Form.Item>
            <Form.Item label={t('employeePage.positionAllowance')} name="position_alw">
              <Input type="number" addonBefore="" />
            </Form.Item>
            <Form.Item label={t('employeePage.mealAllowanceDay')} name="meal_alw_day">
              <Input type="number" addonBefore="" />
            </Form.Item>
            <Form.Item label={t('employeePage.transportAllowanceDay')} name="transp_alw_day">
              <Input type="number" addonBefore="" />
            </Form.Item>
            <Form.Item label={t('employeePage.phoneAllowanceDay')} name="pulsa_alw_day">
              <Input type="number" addonBefore="" />
            </Form.Item>
            <Form.Item label={t('employeePage.phoneAllowanceMonth')} name="pulsa_alw_month">
              <Input type="number" addonBefore="" />
            </Form.Item>
            <Form.Item label={t('employeePage.attendanceAllowanceDay')} name="att_alw_day">
              <Input type="number" addonBefore="" />
            </Form.Item>

          </div>
        </Form>
      </Modal>
      
      {/* 导入员工Modal */}
      <Modal
        title={t('employeePage.importEmployee')}
        open={importModalVisible}
        onCancel={() => {
          setImportModalVisible(false);
          setParsedSheets([]);
          setActiveTabKey('');
        }}
        width={900}
        footer={null}
      >
        <div style={{ marginBottom: 20, textAlign: 'center' }}>
          <Upload.Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">{t('common.clickOrDragToUpload')}</p>
            <p className="ant-upload-hint">
              {t('common.supportSingleExcelUpload')}
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
      </Modal>
    </div>
  )
}

export default EmployeePage