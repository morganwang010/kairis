// 导入axios
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF interface to include autoTable methods
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}
// 配置API基础URL，使用Vite环境变量
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`;


// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
  }
});




// 员工相关API
export const getEmployees = async (params?: {
  department?: string;
  position?: string;
  name?: string;
  employee_id?: string;
  project_name?: string;
  location?: string;
  page?: number;
  page_size?: number;
}) => {
  try {
    const response = await apiClient.get('/employees', { params });
    return response.data;
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
}) => {
  try {
    const response = await apiClient.get('/salaries', { params });
    console.log('获取薪资列表成功11:', response.data);
    return response.data;
  } catch (error) {
    console.error('获取薪资列表失败:', error);
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
    return response.data;
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
      id: id.toString(),
    });
    return response;
  } catch (error) {
    console.error('删除薪资记录失败:', error);
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
export const deleteProjects = async (ids: number[]) => {
  try {
    const response = await apiClient.delete('/projects', { data: { ids } });
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
}) => {
  try {
    console.log('考勤查询参数:', params)
    const response = await apiClient.get('/attendances', { params });
    console.log('获取考勤记录成功:', response.data);
    return response.data;
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
export const getIncidentRecords = async (projectId: string, month: string) => {
  try {
    const response = await apiClient.get('/incidents', { params: { projectId, month } });
    console.log('获取偶发事件记录成功:', response.data);
    return response.data;
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
    return response.data;
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
    console.log('获取免税收入基数列表成功:', response.data);
    return response.data;
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
export const sendEmail = async (record: any) => {
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
      month: record.month || '',
      project_id: record.project_id || '',
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
  return response.data.data;
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
  return response.data.data[0];
};

export const updateSalaryCoefficient = async (coefficient: any) => {
  const response = await apiClient.put('/salary-coefficients', coefficient);
  return response.data;
};

// License API
export const checkLicenseStatus = async () => {
  // console.log("checkLicenseStatus")
  const result = await apiClient.get('licenses/check');
  return result;
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
    const result = await apiClient.get('get_totalEmployees', config);
    // const response = result as { total: number };
    return { total: result.data.total };
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
    const queryParams: Record<string, string> = {
      project_name: data.projectName,
      project_abbr: data.projectShortName,
      start_time: data.startTime || '',
      end_time: data.endTime || '',
      manager: data.responsiblePerson || '',
      project_desc: data.description || '',
      status: data.status || 'active'
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
    const queryParams: Record<string, string> = {
      project_id: data.id,
      project_name: data.projectName,
      project_abbr: data.projectShortName
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
    
    // 添加标题
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SLIP GAJI', 105, 20, { align: 'center' });
    
    // 添加员工信息
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const startY = 30;
    
    // 格式化金额为数字格式
    const formatAmount = (amount: number): string => {
      return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount || 0);
    };
    
    // 定义员工信息数据（四列格式）
    const employeeInfo: any[] = [
      ['DATE', record.month || '', 'Employee_ID', record.employee_id || ''],
      ['Employee_Name', record.employee_name || '', 'NPWP',  record.npwp || ''],
      ['IDCard_Number', record.id_card || '', 'Location_Name', record.location || ''],
      ['Position',record.position || record.department || '', 'Join_Date', record.joinDate || record.join_date || ''],
    ];
    
    (doc as any).autoTable({
      startY: startY,
      body: employeeInfo,
      theme: 'plain',
      styles: {
        fontSize: 9,
        cellPadding: 2
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
    
    // 定义薪资详情数据（四列格式）
    const salaryDetails: any[] = [
      ['Basic_Salary', formatAmount(record.basic_salary), 'Field_Alw', formatAmount(record.field_alw)  ],
      ['Housing_Alw', formatAmount(record.housing_alw), 'Position_Alw', formatAmount(record.position_alw)],
      ['TOTAL_NET_WAGES', formatAmount(record.total_net_wages), 'BPJS ALLOWANCE', formatAmount(record.bpjs_alw)],
      ['Housing_ALW/TJ_Tidak_Tetap', formatAmount(record.housing_alw_tidak_tetap), 'Meal_Alw', formatAmount(record.meal_alw)],
      ['Pulsa_Alw_Month', formatAmount(record.pulsa_alw_month), 'Transp_Alw', formatAmount(record.transp_alw)],
      ['Jmstk_Alw', formatAmount(record.jmstk_alw), 'Tax_Alw_Salary', formatAmount(record.tax_alw_salary)],
      ['Pension_Alw', formatAmount(record.pension_alw), 'Askes_Bpjs_Alw', formatAmount(record.askes_bpjs_alw)],
      [ 'OT1_Wages', formatAmount(record.ot1),'EW1_Wages', formatAmount(record.ew1)],
      [ 'OT2_Wages', formatAmount(record.ot2), 'EW2_Wages', formatAmount(record.ew2)],
      [ 'OT3_Wages', formatAmount(record.ot3),'EW3_Wages', formatAmount(record.ew3)],
      ['Pulsa_Alw', formatAmount( record.pulsa_alw), 'Med_Alw', formatAmount(record.med_alw)],
      ['Att_Alw', formatAmount(record.att_alw), 'Leave_Comp', formatAmount(record.leave_comp), ],
      ['Mandah_Alw', formatAmount(record.mandah_alw),  'Religious_Alw', formatAmount(record.religious_alw)],
      ['Incentive_Alw', formatAmount(record.incentive_alw), 'Rapel_Basic_Salary', formatAmount(record.rapel_basic_salary)],
      ['Performance_Alw', formatAmount(record.performance_alw), 'Rapel_Jmstk_Alw', formatAmount(record.rapel_jmstk_alw)],
      ['Comp_PHK', formatAmount(record.comp_phk),'Trip_Alw', formatAmount(record.trip_alw) ],
      [ 'Tax_Alw_PHK', formatAmount(record.tax_alw_phk),'Acting', formatAmount(record.acting)],
      ['Others', formatAmount(record.others), 'Correct_Add', formatAmount(record.correct_add)],        
      ['Tax_Ded_PHK', formatAmount(record.tax_ded_phk), 'Incentive_Ded', formatAmount(record.incentive_ded)],     
      ['Absent_Ded', formatAmount(record.absent_ded),  'Load_Ded', formatAmount(record.load_ded)],
      ['Absent_Ded2', formatAmount(record.absent_ded2), 'Correct_Sub', formatAmount(record.correct_sub)],
      ['Total_Accept',  { content: formatAmount(record.total_accept ), colSpan: 3, styles: { halign: 'center', valign: 'middle' } }],
      ['JMSTK_Fee', formatAmount(record.jmstk_fee), 'Tax_Ded_Salary', formatAmount(record.tax_ded_salary )],
      ['Pension_Ded', formatAmount(record.pension_ded || record.astekDeduction), 'Askes_Bpjs_Ded', formatAmount(record.askes_bpjs_ded || record.bpjsDeduction)],
      ['Round_Off_Salary', { content: formatAmount(record.round_off_salary), colSpan: 3, styles: { halign: 'center', valign: 'middle' } }],
      ['TOT TRANSFER', { content: formatAmount(record.round_off_salary), colSpan: 3, styles: { halign: 'center', valign: 'middle' } }],

    ];
    
    (doc as any).autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      body: salaryDetails,
      theme: 'grid',
      styles: {
        fontSize: 7,
        cellPadding: 2
      },
      columnStyles: {
        0: {
          halign: 'left',
          fontStyle: 'bold'
        },
        1: {
          halign: 'right'
        },
        2: {
          halign: 'left',
          fontStyle: 'bold'
        },
        3: {
          halign: 'right'
        }
      }
    });
    
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


export const activateLicense = async (request: {
  license_key: string;
  company_name?: string;
}) => {
console.log("activateLicense request:",request)
  const result = await apiClient.post('/licenses/activate', { 
request:request,
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