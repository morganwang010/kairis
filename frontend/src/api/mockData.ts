// Mock数据服务，用于开发和演示

// 员工数据
export const mockEmployees = [
  { id: 1, name: '张三', department: '技术部', position: '前端工程师', hire_date: '2022-01-15', salary: 12000 },
  { id: 2, name: '李四', department: '技术部', position: '后端工程师', hire_date: '2021-11-20', salary: 15000 },
  { id: 3, name: '王五', department: '人事部', position: 'HR专员', hire_date: '2023-03-10', salary: 9000 },
  { id: 4, name: '赵六', department: '财务部', position: '财务助理', hire_date: '2022-07-05', salary: 10000 },
  { id: 5, name: '钱七', department: '市场部', position: '市场专员', hire_date: '2022-09-18', salary: 11000 },
];

// 薪资数据
export const mockSalaries = [
  { id: 1, employee_id: 1, employee_name: '张三', month: '2023-10', basic_salary: 10000, bonus: 2000, allowance: 1000, deduction: 500, total: 12500, status: '已发放' },
  { id: 2, employee_id: 2, employee_name: '李四', month: '2023-10', basic_salary: 12000, bonus: 3000, allowance: 1000, deduction: 800, total: 15200, status: '已发放' },
  { id: 3, employee_id: 3, employee_name: '王五', month: '2023-10', basic_salary: 8000, bonus: 1000, allowance: 800, deduction: 300, total: 9500, status: '已发放' },
  { id: 4, employee_id: 4, employee_name: '赵六', month: '2023-10', basic_salary: 9000, bonus: 1500, allowance: 800, deduction: 400, total: 10900, status: '未发放' },
  { id: 5, employee_id: 5, employee_name: '钱七', month: '2023-10', basic_salary: 8500, bonus: 1200, allowance: 800, deduction: 350, total: 10150, status: '未发放' },
];

// 项目数据
export const mockProjects = [
  {
    id: '1',
    projectName: '薪资管理系统开发',
    projectShortName: '薪资管理系统',
    startTime: '2024-01-15',
    endTime: '2024-03-30',
    responsiblePerson: '张三',
    clientProjectManager: '李四',
    clientCompanyName: 'ABC科技有限公司',
    contactPhone: '13800138000',
    description: '开发一套完整的薪资管理系统，包括员工管理、薪资核算、报表生成等功能。'
  },
  {
    id: '2',
    projectName: '人力资源管理系统升级',
    projectShortName: '人力资源管理系统',
    startTime: '2024-02-01',
    endTime: '2024-04-15',
    responsiblePerson: '王五',
    clientProjectManager: '赵六',
    clientCompanyName: 'XYZ企业集团',
    contactPhone: '13900139000',
    description: '对现有人力资源管理系统进行功能升级和性能优化。'
  }
];