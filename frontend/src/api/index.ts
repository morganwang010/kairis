import jsPDF from 'jspdf';
import 'jspdf-autotable';
import request from '../utils/request';

// Extend jsPDF interface to include autoTable methods
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}
// 配置API基础URL，使用Vite环境变量
// const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`;

// 创建axios实例
const apiClient = request;

// // 添加请求拦截器，从 Redux 动态获取 token
// apiClient.interceptors.request.use(
//   (config) => {
//     const state = store.getState();
//     const token = state.user.token;
//     if (token && config.headers) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// 添加响应拦截器处理 401 错误
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       // 清除认证状态
//       // store.dispatch({ type: 'user/logout' });
//       // sessionStorage.clear();
//       // localStorage.clear();
//       window.location.href = '/app';
//     }
//     return Promise.reject(error);
//   }
// );

// 员工相关API
export const getEmployees = async (params?: {
  department?: string;
  project_id?: string;
  position?: string;
  name?: string;
  employee_id?: string;
  location?: string;
  currentPage?: number;
  pageSize?: number;
}) => {
  try {
    const response = await apiClient.get('/employees', { params });
    return response;
  } catch (error) {
    console.error('获取员工列表失败:', error);
    throw error;
  }
};

export const deleteEmployee = async (id: string) => {
 try {
    const result = await apiClient.delete(`/employees/${id}`);
    console.log('删除员工成功:', result);
    return result;
  } catch (error) {
    console.error('删除员工失败:', error);
    throw error;
  }
};
export const updateEmployee = async (id: string, projectId: string, data: any) => {
  try {
    console.log('开始更新员工数据:', id, projectId, data);
    const result = await apiClient.put(`/employees/${id}`, { projectId, employeeData: data });
    console.log('更新员工成功:', result);
    return result;
  } catch (error) {
    console.error('更新员工失败:', error);
    throw error;
  }
};

// 薪资相关API
export const getSalaries = async (params?: {
  month?: string;
  project_id?: string;
  page?: string;
  pageSize?: string;
  employee_id?: string;
  employee_name?: string;
}) => {
  try {
    const response = await apiClient.get('/salaries', { params });
    console.log('获取薪资列表成功:', response);
    return response;  // ✅ 不再需要 .data，拦截器已处理
  } catch (error) {
    console.error('获取薪资列表失败:', error);
    throw error;
  }
};

// 获取薪资汇总
export const getSalariesTotal = async (params?: {
  month?: string;
  project_id?: string;
}) => {
  try {
    const response = await apiClient.get('/salaries/total', { params });
    return response;
  } catch (error) {
    console.error('获取薪资汇总失败:', error);
    throw error;
  }
};



// 更新薪资
export const updateSalary = async (_id: number, data: any) => {
  try {
    const response = await apiClient.put(`/salaries/${_id}`, data);
    return response.data;
  } catch (error) {
    console.error('更新薪资失败:', error);
    throw error;
  }
};

// 添加薪资
export const addSalary = async (data: any) => {
  try {
    const response = await apiClient.post('/salaries', data);
    return response.data;
  } catch (error) {
    console.error('添加薪资失败:', error);
    throw error;
  }
};

// 工资条相关API
export const getSalarySlips = async (params: {
  month: string;
  employee_id?: string;
  project_id?: string;
}) => {
  try {
    console.log('工资条查询参数:', params);
    const response = await apiClient.get('/salary-slips', { params });
    return response;
  } catch (error) {
    console.error('获取工资条列表失败:', error);
    throw error;
  }
};

export const getSalarySlipDetail = async (id: number) => {
  try {
    const response = await apiClient.get(`/salary-slips/detail?id=${id}`);
    return response.data;
  } catch (error) {
    console.error('获取工资条详情失败:', error);
    throw error;
  }
};

// 健康检查
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('健康检查失败:', error);
    throw error;
  }
};

// 部门相关API
export const getDepartments = async () => {
  try {
    const response = await apiClient.get('/departments');
    return response.data;
  } catch (error) {
    console.error('获取部门列表失败:', error);
    throw error;
  }
};

// 职级相关API
export const getRanks = async () => {
  try {
    const response = await apiClient.get('/ranks');
    return response.data;
  } catch (error) {
    console.error('获取职级列表失败:', error);
    throw error;
  }
};

// 项目相关API
export const getProjects = async (params?: {
  project_name?: string;
  manager?: string;
  is_active?: boolean;
  page?: number;
  page_size?: number;
}) => {
  try {
    const response = await apiClient.get('/projects', { params });
    return response.data;
  } catch (error) {
    console.error('获取项目列表失败:', error);
    throw error;
  }
};

// 添加项目
export const addProject = async (projectData: any) => {
  try {
    const response = await apiClient.post('/projects', projectData);
    return response.data;
  } catch (error) {
    console.error('添加项目失败:', error);
    throw error;
  }
};

// 更新项目
// export const updateProject = async (id: number, projectData: any) => {
//   try {
//     const response = await apiClient.put(`/projects/${id}`, projectData);
//     return response.data;
//   } catch (error) {
//     console.error('更新项目失败:', error);
//     throw error;
//   }
// };

// 薪资导入相关API
export const importSingleSalaryRecord = async (record: any) => {
  try {
    const response = await apiClient.post('/salary/import', record);
    return response.data;
  } catch (error) {
    console.error('导入单条薪资记录失败:', error);
    throw error;
  }
};

export const importSalaryRecords = async (project_id: number, month: string, records: any[]) => {
  console.log('project_id', project_id);
  // 把record里的内容都打印出来

  records.forEach((record, index) => {
    console.log(`记录${index + 1}:`, record);
  });
  
  try {
    const response = await apiClient.post('/salary/import', { projectId: project_id, month, records });
    return response.data;
  } catch (error) {
    console.error('批量导入薪资记录失败:', error);
    throw error;
  }
};

// 逻辑删除薪资记录
export const deleteSalaryRecord = async (id: number) => {
  try {
    console.log('删除薪资记录:', id);
    const response = await apiClient.delete('/salary/delete', {
      data: id.toString(),
    });
    return response;
  } catch (error) {
    console.error('删除薪资记录失败:', error);
    throw error;
  }
};

// 根据ID数据，批量删除薪资记录
export const deleteSalaryRecordByIds = async (ids: number[]) => {
  try {
    console.log('批量删除薪资记录请求:', ids);
    const result = await apiClient.delete('/salaries/batch', { data: { ids } as any });
    console.log('批量删除薪资记录成功:', result);
    return result;
  } catch (error) {
    console.error('批量删除薪资记录失败:', error);
    throw error;
  }
};
// 更新薪资计算状态
export const updateSalaryCalculateStatus = async (id: number, checked: number) => {
  try {
    console.log('更新薪资计算状态:', id, checked);
    const response = await apiClient.put('/salary/calculate-status', {
      id: id.toString(),
      is_calculate: checked.toString(),
      isCalculate: checked.toString(),
    });
    return response;
  } catch (error) {
    console.error('更新薪资计算状态失败:', error);
    throw error;
  }
};


// 删除项目
export const deleteProjects = async (id: string) => {
  try {
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data;
  } catch (error) {
    console.error('删除项目失败:', error);
    throw error;
  }
};

// 考勤相关API
export const getAttendanceRecords = async (params?: {
  project_id?: string;
  month?: string;
  page?: number;
  page_size?: number;
  employee_id?: string;
  employee_name?: string;
}) => {
  try {
    console.log('考勤查询参数:', params)
    const response = await apiClient.get('/attendances', { params });
    console.log('获取考勤记录成功:', response.data);
    return response;
  } catch (error) {
    console.error('获取考勤记录失败:', error);
    throw error;
  }
};

// 添加考勤记录
export const addAttendanceRecord = async (record: any) => {
  try {
    const response = await apiClient.post('/attendances', record);
    console.log('添加考勤记录成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('添加考勤记录失败:', error);
    throw error;
  }
};

// 批量导入考勤记录
export const importAttendanceRecords = async (records: any[]) => {
  try {
    const response = await apiClient.post('/attendances/import', { records });
    console.log('批量导入考勤记录成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('批量导入考勤记录失败:', error);
    throw error;
  }
};

// 单条导入考勤记录
export const importSingleAttendanceRecord = async (record: any) => {
  try {
    const response = await apiClient.post('/attendances/import', record);
    console.log('单条导入考勤记录成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('单条导入考勤记录失败:', error);
    throw error;
  }
};

// 更新考勤记录
export const updateAttendanceRecord = async (record: any) => {
  try {
    console.log('更新考勤记录请求:', record);
    const response = await apiClient.put(`/attendances/${record.id}`, record);
    console.log('更新考勤记录成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('更新考勤记录失败:', error);
    throw error;
  }
};

// 删除考勤记录
export const deleteAttendanceRecord = async (id: string) => {
  try {
    const response = await apiClient.delete(`/attendances/${id}`);
    console.log('删除考勤记录成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('删除考勤记录失败:', error);
    throw error;
  }
};

// 根据ID数据，批量删除考勤记录
export const deleteAttendanceRecordByIds = async (ids: number[]) => {
  try {
    console.log('批量删除考勤记录请求:', ids);
    const result = await apiClient.delete('/attendances/batch', { data: { ids } as any });
    console.log('批量删除考勤记录成功:', result);
    return result;
  } catch (error) {
    console.error('批量删除考勤记录失败:', error);
    throw error;
  }
};

// 删除所有考勤记录
export const deleteAllAttendanceRecord = async (projectId: string, month: string) => {
  try {
    console.log('删除所有考勤记录请求:', projectId, month);
    const result = await apiClient.delete('/attendances', { params: { projectId, month } });
    console.log('删除所有考勤记录成功:', result);
    return result;
  } catch (error) {
    console.error('删除所有考勤记录失败:', error);
    throw error;
  }
};
// 偶发事件相关API
// 获取偶发事件记录
export const getIncidentRecords = async (projectId: string, month: string,pageSize:number,currentPage:number,employeeID?: string,employeeName?: string) => {
  try {
    const response = await apiClient.get('/incidents', { params: { projectId, month,pageSize,currentPage,employeeID,employeeName } });
    console.log('获取偶发事件记录成功:', response.data);
    return response;
  } catch (error) {
    console.error('获取偶发事件记录失败:', error);
    throw error;
  }
};

// 添加偶发事件记录
export const addIncident = async (record: any) => {
  try {
    const response = await apiClient.post('/incidents', record);
    console.log('添加偶发事件记录成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('添加偶发事件记录失败:', error);
    throw error;
  }
};

// 更新偶发事件记录
export const updateIncident = async (record: any) => {
  try {
    // console.log('更新偶发事件记录请求:', record);
    const response = await apiClient.put(`/incidents/${record.id}`, record);
    console.log('更新偶发事件记录成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('更新偶发事件记录失败:', error);
    throw error;
  }
};

// 删除偶发事件记录
export const deleteIncident = async (id: number) => {
  try {
    const response = await apiClient.delete(`/incidents/${id}`);
    console.log('删除偶发事件记录成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('删除偶发事件记录失败:', error);
    throw error;
  }
};

// 根据ID数据，批量删除偶发事件记录
export const deleteIncidentRecordByIds = async (ids: number[]) => {
  try {
    console.log('批量删除偶发事件记录请求:', ids);
    const result = await apiClient.delete('/incidents/batch', { data: { ids } as any });
    console.log('批量删除偶发事件记录成功:', result);
    return result;
  } catch (error) {
    console.error('批量删除偶发事件记录失败:', error);
    throw error;
  }
};



// 删除所有偶发事件记录
export const deleteAllIncidentRecords = async (projectId: string, month: string) => {
  try {
    console.log('删除所有偶发事件记录请求:', projectId, month);
    const result = await apiClient.delete('/incidents', { params: { projectId, month } });
    console.log('删除所有偶发事件记录成功:', result);
    return result;
  } catch (error) {
    console.error('删除所有偶发事件记录失败:', error);
    throw error;
  }
};

// 税率相关API
// 获取税率列表
export const getTaxRates = async (grade: string) => {
  try {
    const response = await apiClient.get('/tax-rates/grade', { params: { grade } });
    console.log('获取税率列表成功:', response.data);
    return response;
  } catch (error) {
    console.error('获取税率列表失败:', error);
    throw error;
  }
};

// 添加税率记录
export const addTaxRate = async (record: any) => {
  try {
    const response = await apiClient.post('/tax-rates', record);
    console.log('添加税率记录成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('添加税率记录失败:', error);
    throw error;
  }
};

// 更新税率记录
export const updateTaxRate = async (record: any) => {
  try {
    const response = await apiClient.put('/tax-rates', record);
    console.log('更新税率记录成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('更新税率记录失败:', error);
    throw error;
  }
};

// 删除税率记录
export const deleteTaxRate = async (id: string) => {
  try {
    const response = await apiClient.delete(`/tax-rates/${id}`);
    console.log('删除税率记录成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('删除税率记录失败:', error);
    throw error;
  }
};

// 获取免税收入基数列表
export const getTaxFreeBases = async () => {
  try {
    const response = await apiClient.get('/tax-free-bases');
    // console.log('获取免税收入基数列表成功:', response.data);
    return response;
  } catch (error) {
    console.error('获取免税收入基数列表失败:', error);
    throw error;
  }
};

// 添加免税收入基数记录
export const addTaxFreeBase = async (record: any) => {
  try {
    const response = await apiClient.post('/tax-free-bases', record);
    console.log('添加免税收入基数记录成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('添加免税收入基数记录失败:', error);
    throw error;
  }
};

// 更新免税收入基数记录
export const updateTaxFreeBase = async (record: any) => {
  try {
    const response = await apiClient.put('/tax-free-bases', record);
    console.log('更新免税收入基数记录成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('更新免税收入基数记录失败:', error);
    throw error;
  }
};

// 删除免税收入基数记录
export const deleteTaxFreeBase = async (id: string) => {
  try {
    const response = await apiClient.delete(`/tax-free-bases/${id}`);
    console.log('删除免税收入基数记录成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('删除免税收入基数记录失败:', error);
    throw error;
  }
};

// 员工信息导入API
export const importEmployeeRecords = async (records: any[]) => {
  try {
    console.log('批量导入员工信息请求:', records);
    const response = await apiClient.post('/employees/import', { records });
    console.log('批量导入员工信息成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('批量导入员工信息失败:', error);
    throw error;
  }
};

// 单条导入员工信息
export const importSingleEmployeeRecord = async (record: any) => {
  try {
    const response = await apiClient.post('/employees/import-single', record);
    console.log('单条导入员工信息成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('单条导入员工信息失败:', error);
    throw error;
  }
};

// 偶发事件导入API
export const importIncidentRecords = async (records: any[]) => {
  try {
    const response = await apiClient.post('/incidents/import', { records });
    console.log('批量导入偶发事件成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('批量导入偶发事件失败:', error);
    throw error;
  }
};

// 单条导入偶发事件
export const importSingleIncidentRecord = async (record: any) => {
  try {
    const response = await apiClient.post('/incidents/import-single', record);
    console.log('单条导入偶发事件成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('单条导入偶发事件失败:', error);
    throw error;
  }
};

// 薪资计算API
export const calculateMonthlySalary = async (params: {
  month: string;
  project_id?: string;
}) => {
  try {
    const response = await apiClient.post('/salaries/calculate', { params });
    console.log('计算薪资成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('计算薪资失败:', error);
    throw error;
  }
};

// 邮件发送API
export const sendEmail = async (record: any, month: string, projectID: string) => {
  try {
    // 确保员工邮箱存在，避免"missing field `to`"错误
    if (!record || !record.email) {
      throw new Error('员工邮箱地址不存在，无法发送邮件');
    }
    
    let emailData: {
      from: string;
      to: string;
      subject: string;
      body: string;
      employee_id: string;
      month: string;
      project_id?: string;
    } = {
      from: 'hrms@example.com',
      to: record.email,
      subject: '您的薪资详情',
      body: `您的薪资详情如下：\n${record.salary_details || '暂无详细信息'}`,
      employee_id: record.employee_id || '',
      month: record.month || month,
      project_id: projectID || '',
    };
    
    const response = await apiClient.post('/email/send', emailData);
    console.log('发送邮件成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('发送邮件失败:', error);
    throw error;
  }
};

// System Config API
export const getSystemConfigs = async () => {
  const response = await apiClient.get('/system-configs');
  console.log('获取系统配置成功:', response.data);
  return response.data;
};

export const getSystemConfigByName = async (name: string) => {
  const response = await apiClient.get('/system-configs/name', { params: { name } });
  return response.data;
};

export const updateSystemConfig = async (id: number, name: string, config: any) => {
  const response = await apiClient.put(`/system-configs/${id}`, { name, config });
  return response.data;
};

export const insertSystemConfig = async (config: any) => {
  const response = await apiClient.post('/system-configs', config);
  return response.data;
};

// Salary Coefficient API
export const getSalaryCoefficient = async () => {
  const response = await apiClient.get('/salary-coefficients');
  console.log('获取薪资系数成功:', response.data);
  return response.data[0];
};

export const updateSalaryCoefficient = async (coefficient: any) => {
  const response = await apiClient.put(`/salary-coefficients/${coefficient.id}`, coefficient);
  return response.data;
};



export const logout = async (token: string) => {
  try {
    const result = await apiClient.post('logout', { token });
    return { success: result.data.success, message: result.data.message } as { success: boolean; message: string };
  } catch (error) {
    console.error('登出失败:', error);
    throw error;
  }
};

// 获取员工总数（在职员工）
export const getEmployeeCount = async (config: any) => {
  try {
    // 使用getEmployees API获取总数，page=1, page_size=1即可获取总数而不需要获取大量数据
    const result = await apiClient.get('employees/totalEmployees', config);
    // const response = result as { total: number };
    return { "total": result.data.total };
  } catch (error) {
    console.error('获取员工总数失败:', error);
    throw error;
  }
};


// System Config API

export const deleteSystemConfig = async (id: number) => {
  const result = await apiClient.delete(`/settings/${id}`);
  return result;
};



// 创建项目
export const createProject = async (data: any) => {
  try {
    // 构建查询参数
    const queryParams: Record<string, string | number> = {
      project_name: data.projectName,
      project_abbr: data.projectShortName,
      start_time: data.startTime || '',
      end_time: data.endTime || '',
      manager: data.responsiblePerson || '',
      project_desc: data.description || '',
      status: data.status || 'active',
      askes_alw: Number(data.askesAlwByNation) || 1,
      ot_hours_on: Number(data.otHoursOn) || 0,
      ew_hours_on: Number(data.ewHoursOn) || 0,
    };

    const response = await apiClient.post('/projects', queryParams);
    return response;
  } catch (error) {
    console.error('创建项目失败:', error);
    throw error;
  }
};
// 更新项目
export const updateProject = async (data: any) => {
  try {
    // 转换为HashMap格式，只传递存在的参数
    const queryParams: Record<string, string | number> = {
      project_id: data.id,
      project_name: data.projectName,
      project_abbr: data.projectShortName,
      ot_hours_on: Number(data.otHoursOn) || 0,
      ew_hours_on: Number(data.ewHoursOn) || 0,
      askes_alw: Number(data.askesAlwByNation) || 0,
    };

    // 只传递存在的可选参数
    if (data.startTime) queryParams.start_time = data.startTime;
    if (data.endTime) queryParams.end_time = data.endTime;
    if (data.responsiblePerson) queryParams.manager = data.responsiblePerson;
    if (data.clientProjectManager) queryParams.party_a_manager = data.clientProjectManager;
    if (data.clientCompanyName) queryParams.party_a_company = data.clientCompanyName;
    if (data.contactPhone) queryParams.contact_phone = data.contactPhone;
    if (data.description) queryParams.project_desc = data.description;

    console.log("project_id {}",data.id)
    const response = await apiClient.put(`/projects/${data.id}`, queryParams);
    return response;
  } catch (error) {
    console.error('更新项目失败:', error);
    throw error;
  }
};


export const generateAndDownloadPDF = (records: any | any[], projectName?: string) => {
  // 确保records是一个数组
  const recordList = Array.isArray(records) ? records : [records];
  
  // 为每条记录生成PDF
  recordList.forEach((record, index) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // 添加公司信息标题
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Great Wall Drilling Company', 105, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('GWDC', 105, 22, { align: 'center' });
    
    // 添加 PAYROLL SLIP 标题
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYROLL SLIP', 105, 35, { align: 'center' });
    
    // 格式化金额为数字格式
    const formatAmount = (amount: number): string => {
      return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount || 0);
    };
    
    // 员工信息表格
    const employeeInfo: any[] = [
      ['Employee_Name', record.employee_name || '', 'Project', record.project_name || '-'],
      ['Designation', record.position || record.department || '', 'Month', record.period || record.month || ''],
    ];
    
    let startY = 45;
    
    (doc as any).autoTable({
      startY: startY,
      body: employeeInfo,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: {
          halign: 'left',
          fontStyle: 'bold'
        },
        1: {
          halign: 'left'
        },
        2: {
          halign: 'left',
          fontStyle: 'bold'
        },
        3: {
          halign: 'left'
        }
      }
    });
    
    // Fixed Allowance 部分
    startY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Fixed_Alw:', 15, startY);
    doc.text(formatAmount(record.total_fixed_alw), 185, startY, { align: 'right' });
    
    const fixedAlwData: any[] = [
      ['Basic_Salary', formatAmount(record.basic_salary)],
      ['Post_Function', formatAmount(record.post_function_alw_month ?? 0)],
      ['Phone_Alw', formatAmount(record.phone_alw_month ?? 0)],
      ['Internet_Alw', formatAmount(record.internet_alw_month ?? 0)],
      ['Incentive', formatAmount(record.incentive_month ?? 0)],
      ['Operational', formatAmount(record.operational_alw_month ?? 0)],
      ['Housing_Alw', formatAmount(record.housing_alw_month ?? 0)],
      ['Seniority', formatAmount(record.seniority_alw_month ?? 0)],
      ['Transport_Alw', formatAmount(record.transport_alw_month ?? 0)],
      ['Field_Alw', formatAmount(record.field_alw_month ?? 0)],
      ['Accomodation', formatAmount(record.accommodation_alw_month ?? 0)],
    ];
    
    (doc as any).autoTable({
      startY: startY + 8,
      body: fixedAlwData,
      theme: 'plain',
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      columnStyles: {
        0: {
          halign: 'left',
          width: 70
        },
        1: {
          halign: 'right',
          width: 50
        }
      }
    });
    
    // Non-Fixed Allowance 部分
    startY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Non_Fixed_Alw:', 15, startY);
    doc.text(formatAmount(record.total_non_fixed_alw), 185, startY, { align: 'right' });
    
    const nonFixedAlwData: any[] = [
      ['THR', formatAmount(record.thr)],
      ['Bonus', formatAmount(record.bonus)],
      ['Compensation', formatAmount(record.compensation)],
      ['Acting_Alw', formatAmount(record.acting_alw)],
      ['Salary_Prorate', formatAmount(record.salary_prorate)],
      ['Other', formatAmount(record.other_non_fixed)],
      ['Work_Prorate', formatAmount(record.work_prorate)],
      ['Work_Alw', formatAmount(record.work_alw)],
      ['OSOA_Alw', formatAmount(record.osoa_alw)],
      ['OVT_Alw', formatAmount(record.ovt_alw)],
      ['BT_Alw', formatAmount(record.bt_alw)],
      ['On_Alw', formatAmount(record.on_alw)],
      ['OT_Alw', formatAmount(record.ot_alw)],
      ['T_Alw', formatAmount(record.t_alw)],
      ['TNT_Alw', formatAmount(record.tnt_alw)],
      ['AL_Alw', formatAmount(record.al_alw)],
      ['ROT_Alw', formatAmount(record.rot_alw)],
      ['TR_Alw', formatAmount(record.tr_alw)],
      ['ST_Alw', formatAmount(record.st_alw)],
      ['LS_Alw', formatAmount(record.ls_alw)],
    ];
    
    (doc as any).autoTable({
      startY: startY + 8,
      body: nonFixedAlwData,
      theme: 'plain',
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      columnStyles: {
        0: {
          halign: 'left',
          width: 70
        },
        1: {
          halign: 'right',
          width: 50
        }
      }
    });
    
    // Salary Deduction 部分
    startY = doc.lastAutoTable.finalY + 10;
    const totalSalaryDed = record.q_ded + record.pl_ded + record.late_ded + record.sc_ded + record.sc1_ded + record.co_ded + record.pm_ded + record.na_ded + record.salary_ded;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Salary_Ded:', 15, startY);
    doc.text(formatAmount(totalSalaryDed), 185, startY, { align: 'right' });
    
    const salaryDedData: any[] = [
      ['Q_Ded', formatAmount(record.q_ded)],
      ['PL_Ded', formatAmount(record.pl_ded)],
      ['Late_Ded', formatAmount(record.late_ded)],
      ['SC_Ded', formatAmount(record.sc_ded)],
      ['SC1_Ded', formatAmount(record.sc1_ded)],
      ['CO_Ded', formatAmount(record.co_ded)],
      ['PM_Ded', formatAmount(record.pm_ded)],
      ['NA_Ded', formatAmount(record.na_ded)],
      ['Other', formatAmount(record.salary_ded)],
    ];
    
    (doc as any).autoTable({
      startY: startY + 8,
      body: salaryDedData,
      theme: 'plain',
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      columnStyles: {
        0: {
          halign: 'left',
          width: 70
        },
        1: {
          halign: 'right',
          width: 50
        }
      }
    });
    
    // Gross Salary 部分
    startY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Gross Salary:', 15, startY);
    doc.text(formatAmount(record.gross_salary), 185, startY, { align: 'right' });
    
    // BPJS/TAX Deduction 部分
    startY = startY + 10;
    const totalBpjsTaxDed = record.bpjs_work_ded + record.bpjs_health_ded + record.tax_ded;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('BPJS/TAX_Ded:', 15, startY);
    doc.text(formatAmount(totalBpjsTaxDed), 185, startY, { align: 'right' });
    
    const bpjsTaxData: any[] = [
      ['BPJS_Work_Ded', formatAmount(record.bpjs_work_ded)],
      ['BPJS_Health_Ded', formatAmount(record.bpjs_health_ded + (record.bpjs_health_tambahan || 0))],
      ['Tax_Ded', formatAmount(record.tax_ded)],
    ];
    
    (doc as any).autoTable({
      startY: startY + 8,
      body: bpjsTaxData,
      theme: 'plain',
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      columnStyles: {
        0: {
          halign: 'left',
          width: 70
        },
        1: {
          halign: 'right',
          width: 50
        }
      }
    });
    
    // Final Staff Receive 部分
    startY = doc.lastAutoTable.finalY + 15;
    doc.setDrawColor(0);
    doc.setLineWidth(2);
    doc.rect(15, startY - 5, 170, 25);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Final_Staff_Receive:', 105, startY + 8, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text(formatAmount(record.final_staff_receive), 105, startY + 18, { align: 'center' });
    
    // 添加备注
    startY = startY + 40;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('This slip is computer generated, no signature required.', 105, startY, { align: 'center' });
    
    // 生成文件名
    let pdfFileName =  `${record.employee_name || 'unknown'}_${record.month || 'unknown'}_${index + 1}.pdf`;
    
    // 如果有项目名称，添加到文件名前缀
    if (projectName) {
      pdfFileName = `${projectName}_${pdfFileName}`;
    }
    
    // 下载PDF
    doc.save(pdfFileName);
  });
};

// Project API
export const getProjectName = async (projectId: string) => {
  try {
    const result = await apiClient.get(`/projects/${projectId}`);
    return (result as any)?.project_name || '';
  } catch (error) {
    console.error('获取项目名称失败:', error);
    return '';
  }
};
// License API
export const checkLicenseStatus = async () => {
  // console.log("checkLicenseStatus")
  const result = await apiClient.get('licenses/check');
  return result;
};

export const activateLicense = async (request: {
  "license_key": string;
  "company_name": string;
}) => {
console.log("activateLicense request:",request)
  const result = await apiClient.post('/licenses/activate', { 
    ...request,
  });
  return result;
};

export const deactivateLicense = async (license_key: string) => {
  const result = await apiClient.post('/licenses/deactivate', { license_key });
  return result;
};

export const getAllLicenses = async () => {
  const result = await apiClient.get('/get_all_licenses');
  return result;
};