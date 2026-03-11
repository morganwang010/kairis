import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Table, Button, Space, Modal, Form, Input, DatePicker, InputNumber, message, Upload, Tabs,Pagination, Switch } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, SyncOutlined, InboxOutlined , FileExcelOutlined} from '@ant-design/icons'
import ScientificNumberDisplay from '../components/ScientificNumberDisplay'
import { calculateMonthlySalary, getSalaries, updateSalary as apiUpdateSalary, addSalary as apiAddSalary, importSingleSalaryRecord, importSalaryRecords ,updateSalaryCalculateStatus, deleteSalaryRecord} from '../api';
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'
import type { UploadProps } from 'antd'
import type { ColumnsType } from 'antd/es/table'
// import { paginationTotalProps } from 'element-plus/es/components/pagination/src/components/total.mjs';
interface NewSalaryPageProps {
  projectId?: string
  projectName?: string
}

interface SalaryRecord {
  id: number,
  employee_id: string,
  employee_name: string,
  department: string,
  basic_salary: number,
  final_salary: number,
  project_id: number,
  housing_alw: number,
  position_alw: number,
  field_alw: number,
  fix_alw: number,
  jmstk_alw: number,
  pension_alw: number,
  meal_alw: number,
  transp_alw: number,
  tax_alw_salary: number,
  tax_alw_phk: number,
  comp_phk: number,
  askes_bpjs_alw: number,
  med_alw: number,
  pulsa_alw: number,
  others: number,
  att_alw: number,
  housing_alw_tetap: number,
  religious_alw: number,
  rapel_basic_salary: number,
  rapel_jmstk_alw: number,
  incentive_alw: number,
  acting: number,
  performance_alw: number,
  trip_alw: number,
  ot_hour: number,
  ew_hour: number,
  ot_wages: number,
  et_wages: number,
  correct_add: number,
  correct_sub: number,
  leav_comp: number,
  total_accept: number,
  jmstk_fee: number,
  pension_ded: number,
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
  id_card: string,
  npwp: string,
  hierarchy_id: string,
  hierarchy_name: string,
  location_name: string,
  join_date: string,
  resign_date: string,
  position: string,
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
  total_net_wages: number,
  ot1: number,
  ew1: number,
  ew2: number,
  ew3: number,
  ot1_hour: number,
  ew1_hour: number,
  ew2_hour: number,
  ew3_hour: number,
  ew1_wages: number,
  ew2_wages: number,
  ew3_wages: number,
  ot1_wages: number,
  ot2_wages: number,
  ot3_wages: number,
  unpresent: number,
  is_calculate:number,
}

interface SheetData {
  [key: string]: any
}

interface ParsedSheet {
  name: string
  data: SheetData[]
  columns: ColumnsType<SheetData>
}

const NewSalaryPage: React.FC<NewSalaryPageProps> = ({ projectId = 'all',  }) => {
  const { t } = useTranslation()
  const [modal, contextHolder] = Modal.useModal()
  const [messageApi, messageContextHolder] = message.useMessage();
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  // 从API获取薪资数据
  const fetchSalaryData = async () => {
    try {
      const params = {
        month: currentMonth,
        project_id: projectId,
        page: currentPage.toString(),
        page_size: pageSize.toString(),
        ...filterValues
      };
      const result = await getSalaries(params);
      // 先断言为 unknown，再断言为目标类型，避免 TypeScript 类型重叠警告
      const response = (result as unknown) as { data: any[]; total: number };
      // console.log('获取到的薪资数据:', response);
      setTotal(response.total)
      return response.data;
    } catch (error) {
      console.error('获取薪资数据失败:', error);
      messageApi.error('获取薪资数据失败');
      return [];
    }
  }

  // 计算月度薪资并重新加载数据
  const handleCalculateMonthlySalary = async () => {
    // 获取loading提示的关闭函数
    const hideLoading = messageApi.loading('正在计算薪资...', 0);
    try {
      // 调用薪资计算API
      await calculateMonthlySalary({ month: currentMonth, project_id: projectId });
      // 计算成功，关闭loading提示并显示成功信息
      hideLoading();
      messageApi.success('薪资计算成功');
      // 重新加载薪资数据
      const data = await fetchSalaryData();
      setSalaryRecords(data);
    } catch (error) {
      // 计算失败，关闭loading提示并显示错误信息
      hideLoading();
      console.error('薪资计算失败:', error);
      messageApi.error('薪资计算失败，请稍后重试');
    }
  }

  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([])
  // 导入相关状态
  const [importModalVisible, setImportModalVisible] = useState(false)
  const [parsedSheets, setParsedSheets] = useState<ParsedSheet[]>([])
  const [activeTabKey, setActiveTabKey] = useState('')
  const [importLoading, setImportLoading] = useState(false)
  const [singleImportLoading, setSingleImportLoading] = useState<{[key: string]: boolean}>({})
  const [selectedMonth, setSelectedMonth] = useState(dayjs().startOf('month'))
  const [currentMonth, setCurrentMonth] = useState(dayjs().format('YYYY-MM'))
  const [filterForm] = Form.useForm()
  const [filterValues, setFilterValues] = useState<{[key: string]: any}>({})
const loadData = async () => {
      const allData = await fetchSalaryData();
      
      // 根据projectId筛选数据
      if (projectId === 'all') {
        setSalaryRecords(allData);
        // setTotal(allData.length)
      } else {
        // 假设projectId与projectName存在某种映射关系
        // 实际应用中可能需要根据具体的业务逻辑进行筛选
        // const filteredData = allData.filter(item => 
        //   item.project_id.toString() === projectId.toString()
        // );
        // console.log('筛选后的薪资数据:', filteredData);
        // setSalaryRecords(filteredData);
        setSalaryRecords(allData);
      }
    };  
  // 根据projectId从API获取并筛选数据
  useEffect(() => {
    
    
    loadData();
  }, [projectId, currentMonth, currentPage, pageSize, filterValues])
  
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [currentRecord, setCurrentRecord] = useState<SalaryRecord | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [form] = Form.useForm()
  
  // showAddModal函数暂时未使用，需要时取消注释
  // const showAddModal = () => {
  //     setIsEditMode(false)
  //     setCurrentRecord(null)
  //     form.resetFields()
  //     setIsModalVisible(true)
  //   }

  const showEditModal = (record: SalaryRecord) => {
    setIsEditMode(true)
    setCurrentRecord(record)
    // 设置Form组件中所有SalaryRecord字段
    form.setFieldsValue({
      employee_id: record.employee_id,
      employee_name: record.employee_name,
      department: record.department,
      project_id: record.project_id,
      basic_salary: record.basic_salary,
      final_salary: record.final_salary,
      housing_alw: record.housing_alw,
      position_alw: record.position_alw,
      field_alw: record.field_alw,
      fix_alw: record.fix_alw,
      meal_alw: record.meal_alw,
      transp_alw: record.transp_alw,
      ot1_hour: record.ot1_hour,
      ew1_hour: record.ew1_hour,
      ew1_wages: record.ew1_wages,
      ew2_hour: record.ew2_hour,
      ew2_wages: record.ew2_wages,
      ew3_hour: record.ew3_hour,
      ew3_wages: record.ew3_wages,
      month: record.month,
      tax_type: record.tax_type,
      total_accept: record.total_accept,
      net_accept: record.net_accept,
      // 添加所有其他字段
      jmstk_alw: record.jmstk_alw,
      pension_alw: record.pension_alw,
      tax_alw_salary: record.tax_alw_salary,
      tax_alw_phk: record.tax_alw_phk,
      comp_phk: record.comp_phk,
      askes_bpjs_alw: record.askes_bpjs_alw,
      med_alw: record.med_alw,
      pulsa_alw: record.pulsa_alw,
      others: record.others,
      att_alw: record.att_alw,
      housing_alw_tetap: record.housing_alw_tetap,
      religious_alw: record.religious_alw,
      rapel_basic_salary: record.rapel_basic_salary,
      rapel_jmstk_alw: record.rapel_jmstk_alw,
      incentive_alw: record.incentive_alw,
      acting: record.acting,
      performance_alw: record.performance_alw,
      trip_alw: record.trip_alw,
      correct_add: record.correct_add,
      correct_sub: record.correct_sub,
      leav_comp: record.leav_comp,
      jmstk_fee: record.jmstk_fee,
      pension_ded: record.pension_ded,
      tax_ded_salary: record.tax_ded_salary,
      tax_ded_phk: record.tax_ded_phk,
      askes_bpjs_ded: record.askes_bpjs_ded,
      incentive_ded: record.incentive_ded,
      purapel_basic_sal: record.purapel_basic_sal,
      loan_ded: record.loan_ded,
      absent_ded: record.absent_ded,
      round_off_salary: record.round_off_salary,
      tax_status: record.tax_status,
      id_card: record.id_card,
      npwp: record.npwp,
      hierarchy_id: record.hierarchy_id,
      hierarchy_name: record.hierarchy_name,
      location_name: record.location_name,
      join_date: record.join_date,
      resign_date: record.resign_date,
      position: record.position,
      work: record.work,
      off: record.off,
      permission: record.permission,
      unpresent: record.unpresent,
      sick: record.sick,
      standby: record.standby,
      ew: record.ew,
      annualleave: record.annualleave,
      salary_slip_status: record.salary_slip_status,
      pulsa_alw_month: record.pulsa_alw_month,
      total_net_wages: record.total_net_wages,



    })
    setIsModalVisible(true)
  }

  const handleDelete = (_id: string) => {
    modal.confirm({
      title: '确认删除',
      content: '确定要删除这条薪资记录吗？',
      onOk: async () => {
        try {
          await deleteSalaryRecord(Number(_id));
          // 从本地状态中移除删除的记录
          setSalaryRecords(prev => prev.filter(record => record.id !== Number(_id)));
          messageApi.success('薪资记录删除成功');
        } catch (error) {
          console.error('删除薪资记录失败:', error);
          messageApi.error('删除薪资记录失败，请稍后重试');
        }
      }
    })
  }
  const handleSwitchChange = (record: SalaryRecord) => async (checked: boolean) => {
    try {
      console.log('切换计算状态:', record.id, checked);
      // 调用API更新is_calculate字段
      await updateSalaryCalculateStatus(
        record.id,
        checked ? 1: 0
      );
      
      // 更新本地状态
      setSalaryRecords(prev => 
        prev.map(item => 
          item.id === record.id 
            ? { ...item, is_calculate: checked ? 1 : 0 }
            : item
        )
      );
      
      messageApi.success('计算状态更新成功');
    } catch (error) {
      console.error('更新计算状态失败:', error);
      // messageApi里需要显示error信息
      messageApi.error('更新计算状态失败 ' + error);
    }
  }



  // 封装API调用函数
  const updateSalary = async (id: number, data: Partial<SalaryRecord>) => {
    try {
      // 调用实际的API更新薪资记录
      if (apiUpdateSalary) {
        await apiUpdateSalary(id, data);
      } else {
        console.log('API函数updateSalary不可用，模拟更新:', id, data);
      }
      // 重新加载数据以反映更新
      const updatedData = await fetchSalaryData();
      setSalaryRecords(updatedData);
      return true;
    } catch (error) {
      console.error('更新薪资记录失败:', error);
      messageApi.error('更新薪资记录失败');
      return false;
    }
  };

  const addSalary = async (data: Omit<SalaryRecord, 'id' | 'create_time' | 'update_time'>) => {
    try {
      // 调用实际的API添加薪资记录
      if (apiAddSalary) {
        await apiAddSalary(data);
      } else {
        console.log('API函数addSalary不可用，模拟添加:', data);
      }
      // 重新加载数据以反映新添加的记录
      const updatedData = await fetchSalaryData();
      setSalaryRecords(updatedData);
      return true;
    } catch (error) {
      console.error('添加薪资记录失败:', error);
      messageApi.error('添加薪资记录失败');
      return false;
    }
  };

  const handleSave = async () => {
    try {
      const formValues = await form.validateFields();
      const now = new Date().toISOString();
      
      // 直接使用表单中的值，InputNumber组件会自动处理数值类型
      // 只添加必要的时间戳字段
      const salaryData = {
        ...formValues,
        update_time: now
      };
      
      if (isEditMode && currentRecord) {
        // 编辑模式 - 与API函数匹配，正确传递参数
        await updateSalary(currentRecord.id, salaryData);
        messageApi.success('薪资记录更新成功');
      } else {
        // 添加模式 - 与API函数匹配，正确传递参数
        const newData = {
          ...salaryData,
          create_time: now
          // 不设置临时ID，让后端生成
        };
        await addSalary(newData);
        messageApi.success('薪资记录添加成功');
      }
      
      setIsModalVisible(false);
      form.resetFields();
      
      // 重新加载数据以确保显示最新数据
      const updatedData = await fetchSalaryData();
      setSalaryRecords(updatedData);
      
    } catch (error) {
      console.error('保存薪资记录失败:', error);
      // messageApi.error('保存失败: ' + (error.message || '请重试'));
    }
  }

  // 处理Excel文件上传
  const handleUpload: UploadProps['onChange'] = ({ file }) => {
    console.log('文件上传状态变更:', file.status, '文件名:', file)
    
    if (file.name) {
      console.log('开始处理文件:', file.name)
      processFile(file)
    } else {
      console.error('文件对象无效或不存在:', file.originFileObj)
      messageApi.error('无效的文件')
    }
    
    if (file.status === 'error') {
      console.error('文件上传失败')
      messageApi.error('文件上传失败')
    } else if (file.status === 'removed') {
      console.log('文件已移除')
      setParsedSheets([])
      setActiveTabKey('')
    }
  }

  // 处理单条记录导入
  const handleSingleImport = async (record: SheetData, index: number) => {
    try {
      if (!projectId) {
        messageApi.warning('请选择项目');
        return;
      }
      
      setSingleImportLoading(prev => ({ ...prev, [`${activeTabKey}-${index}`]: true }))
      
      // 构建薪资信息数据
      const salaryRecord = {
        employee_id: record['Employee_Id'] || record['employee_id'] || record['员工ID'],
        month: selectedMonth.format('YYYY-MM'),
        project_id: projectId,
        basic_salary: record['Basic_Salary'] || record['basic_salary'] || record['基本工资'] || 0,
        housing_alw: record['Housing_Alw'] || record['housing_alw'] || record['住房补贴'] || 0,
        position_alw: record['Position_Alw'] || record['position_alw'] || record['职务补贴'] || 0,
        field_alw: record['Field_Alw'] || record['field_alw'] || record['外勤补贴'] || 0,
        fix_alw: record['Fix_Alw'] || record['fix_alw'] || record['固定补贴'] || 0,
        jmstk_alw: record['Jmstk_Alw'] || record['jmstk_alw'] || record['加班补贴'] || 0,
        pension_alw: record['Pension_Alw'] || record['pension_alw'] || record['养老金补贴'] || 0,
        meal_alw: record['Meal_Alw'] || record['meal_alw'] || record['餐费补助'] || 0,
        transp_alw: record['Transp_Alw'] || record['transp_alw'] || record['交通补助'] || 0,
        tax_alw_salary: record['Tax_Alw_Salary'] || record['tax_alw_salary'] || record['税率补贴'] || 0,
        tax_alw_phk: record['Tax_Alw_PHK'] || record['tax_alw_phk'] || record['PHK补贴'] || 0,
        comp_phk: record['Comp_PHK'] || record['comp_phk'] || record['PHK补贴'] || 0,
        askes_bpjs_alw: record['Askes_BPJS_Alw'] || record['askes_bpjs_alw'] || record['BPJS补贴'] || 0,
        med_alw: record['Med_Alw'] || record['med_alw'] || record['医疗补贴'] || 0,
        pulsa_alw: record['Pulsa_Alw'] || record['pulsa_alw'] || record['话费补助'] || 0,
        others: record['Others'] || record['others'] || record['其他补助'] || 0,
        att_alw: record['ATT_Alw'] || record['att_alw'] || record['考勤补助'] || 0,
        housing_alw_tidak_tetap: record['Housing_Alw_Tidak_Tetap'] || record['housing_alw_tidak_tetap'] || record['住房补贴(未到岗)'] || 0,
        religious_alw: record['Religious_Alw'] || record['religious_alw'] || record['宗教补贴'] || 0,
        absent_ded: record['Absent_Ded'] || record['absent_ded'] || record['缺勤扣款'] || 0,
        rapel_basic_salary: record['Rapel_Basic_Salary'] || record['rapel_basic_salary'] || record['重聘基本工资'] || 0,
        rapel_jmstk_alw: record['Rapel_Jmstk_Alw'] || record['rapel_jmstk_alw'] || record['重聘加班补贴'] || 0,
        incentive_alw: record['Incentive_Alw'] || record['incentive_alw'] || record['激励补贴'] || 0,
        acting: record['Acting'] || record['acting'] || record['Acting'] || 0,
        performance_alw: record['Performance_Alw'] || record['performance_alw'] || record['绩效补贴'] || 0,
        trip_alw: record['Trip_Alw'] || record['trip_alw'] || record['行程补贴'] || 0,
        ot_hour: record['OT_Hour'] || record['ot_hour'] || record['加班小时'] || 0,
        ew_hour: record['EW_Hour'] || record['ew_hour'] || record['弹性加班小时'] || 0,
        ot_wages: record['OT_Wages'] || record['ot_wages'] || record['加班工资'] || 0,
        et_wages: record['ET_Wages'] || record['et_wages'] || record['弹性加班工资'] || 0,
        correct_add: record['Correction_Add'] || record['correct_add'] || record['修正补贴'] || 0,
        correct_sub: record['Correction_Sub'] || record['correct_sub'] || record['修正补贴'] || 0,
        leav_comp: record['Leave_Comp'] || record['leav_comp'] || record['请假补贴'] || 0,
        total_accept: record['Total_Accept'] || record['total_accept'] || record['总接受补贴'] || 0,
        jmstk_fee: record['Jmstk_Fee'] || record['jmstk_fee'] || record['加班补贴(月)'] || 0,
        pension_ded: record['Pension_Ded'] || record['pension_ded'] || record['养老金扣款'] || 0,
        tax_ded_salary: record['Tax_Ded_Salary'] || record['tax_ded_salary'] || record['税率扣款'] || 0,
        tax_ded_phk: record['Tax_Ded_PHK'] || record['tax_ded_phk'] || record['PHK扣款'] || 0,
        askes_bpjs_ded: record['Askes_BPJS_Ded'] || record['askes_bpjs_ded'] || record['BPJS扣款'] || 0,
        incentive_ded: record['Incentive_Ded'] || record['incentive_ded'] || record['激励扣款'] || 0,
        loan_ded: record['Loan_Ded'] || record['loan_ded'] || record['贷款扣款'] || 0,
        net_accept: record['Net_Accept'] || record['net_accept'] || record['净接受补贴'] || 0,
        round_off_salary: record['Round_Off_Salary'] || record['round_off_salary'] || record['四舍五入工资'] || 0,
        mandah_alw: record['Mandah_Alw'] || record['mandah_alw'] || record['Mandah补贴'] || 0,
      }
      
      // 检查必要字段
      if (!salaryRecord.employee_id) {
        messageApi.error('缺少员工ID')
        return
      }
      
      const result = await importSingleSalaryRecord(salaryRecord)
      messageApi.success(String(result) || t('newSalaryPage.importSuccess'))
      getSalaries()
      setImportModalVisible(false);
      // 重置导入状态
      setParsedSheets([]);
      setActiveTabKey('');
    } catch (error) {
      console.error('导入失败:', error)
      messageApi.error('导入失败')
    } finally {
      setSingleImportLoading(prev => ({ ...prev, [`${activeTabKey}-${index}`]: false }))
    }
  }

  // 处理全部导入
  const handleImportAll = async () => {
    try {
      if (!projectId) {
        messageApi.warning('请选择项目');
        return;
      }
      
      setImportLoading(true)
      
      const currentSheet = parsedSheets.find(sheet => sheet.name === activeTabKey)
      if (!currentSheet) {
        messageApi.error('没有活动的工作表')
        return
      }
      
      // 转换数据格式
      const records = currentSheet.data.map(record => ({
          // 基础信息类
          no: record['No'].toString(),  // 序号
          month: record['Month'].toString(),  // 薪资核算月份
          project_name: record['Project_Name'].toString(),  // 所属项目名称
          employee_name: record['Employee_Name'].toString(),  // 员工姓名
          employee_id: record['Employee_Id'].toString(),  // 员工编号
          tax_status: record['Tax_Status'].toString(),  // 税务状态
          idcard_number: record['IDCard_Number'].toString(),  // 身份证号
          npwp: record['NPWP'].toString(),  // 印尼税务识别号
          hierarchy_id: record['Hierarchy_Id'].toString(),  // 层级ID
          hierarchy_name: record['Hierarchy_Name'].toString(),  // 层级名称（如部门/职级）
          location_name: record['Location_Name'].toString(),  // 工作地点
          join: record['Join'].toString(),  // 入职日期
          resign: record['Resign'].toString(),  // 离职日期
          position: record['Position'].toString(),  // 职位
          email: record['Email'].toString(),  // 员工邮箱

          // 考勤类
          in_: record['In'].toString(),  // 出勤天数/时长（别名加下划线避免与关键字冲突）
          off: record['Off'].toString(),  // 休假天数
          permission: record['Permission'].toString(),  // 请假批准时长/天数
          unpresent: record['Unpresent'].toString(),  // 旷工天数/时长
          sick: record['Sick'].toString(),  // 病假天数/时长
          standby: record['Standby'].toString(),  // 待命时长/天数
          ew: record['EW'].toString(),  // 加班基础项（通用）
          leave_replc: record['Leave_Replc'].toString(),  // 调休假冲抵

          // 加班细分项（时长+薪资）
          ot1: record['OT1'].toString(),  // 1倍加班
          ew1: record['EW1'].toString(),  // 加班类型1
          ew2: record['EW2'].toString(),  // 加班类型2
          ew3: record['EW3'].toString(),  // 加班类型3
          ot1_hour: record['OT1_Hour'].toString(),  // OT1加班时长
          ot1_wages: record['OT1_Wages'].toString(),  // OT1加班薪资
          ew1_hour: record['EW1_Hour'].toString(),  // EW1加班时长
          ew1_wages: record['EW1_Wages'].toString(),  // EW1加班薪资
          ew2_hour: record['EW2_Hour'].toString(),  // EW2加班时长
          ew2_wages: record['EW2_Wages'].toString(),  // EW2加班薪资
          ew3_hour: record['EW3_Hour'].toString(),  // EW3加班时长
          ew3_wages: record['EW3_Wages'].toString(),  // EW3加班薪资
          ot2_wages: record['OT2_Wages'].toString(),  // OT2加班薪资
          ot3_wages: record['OT3_Wages'].toString(),  // OT3加班薪资

          // 固定薪资类
          basic_salary: record['Basic_Salary'].toString(),  // 基本工资
          housing_alw: record['Housing_Alw'].toString(),  // 住房补贴
          position_alw: record['Position_Alw'].toString(),  // 职位补贴
          field_alw: record['Field_Alw'].toString(),  // 外勤补贴
          fix_alw: record['Fix_Alw'].toString(),  // 固定补贴
          total_net_wages: record['Total_Net_Wages'].toString(),  // 薪资净额合计

          // 浮动/专项补贴类
          housing_alw_tetap: record['Housing_Alw/TJ_Tidak_Tetap'].toString(),  // 非固定住房补贴（印尼语TJ Tidak Tetap：非固定）
          pulsa_alw_month: record['Pulsa_Alw/Month'].toString(),  // 月度话费补贴
          jmstk_alw: record['Jmstk_Alw'].toString(),  // 公积金补贴（印尼Jaminan Sosial：社保）
          pension_alw: record['Pension_Alw'].toString(),  // 养老金补贴
          meal_alw: record['Meal_Alw'].toString(),  // 餐补
          transp_alw: record['Transp_Alw'].toString(),  // 交通补贴
          tax_alw_salary: record['Tax_Alw_Salary'].toString(),  // 薪资税务补贴
          askes_bpjs_alw: record['Askes_BPJS_Alw'].toString(),  // 印尼BPJS社保补贴
          pulsa_alw: record['Pulsa_Alw'].toString(),  // 话费补贴（通用）
          att_alw: record['ATT_Alw'].toString(),  // 考勤补贴
          med_alw: record['Med_Alw'].toString(),  // 医疗补贴
          others: record['Others'].toString(),  // 其他补贴
          religious_alw: record['Religious_Alw'].toString(),  // 宗教补贴（印尼特色）
          rapel_basic_salary: record['Rapel_Basic_Salary'].toString(),  // 基本工资追溯补发
          rapel_jmstk_alw: record['Rapel_Jmstk_Alw'].toString(),  // 公积金补贴追溯补发
          acting: record['Acting'].toString(),  // 代岗补贴
          performance_alw: record['Performance_Alw'].toString(),  // 绩效补贴
          trip_alw: record['Trip_Alw'].toString(),  // 差旅补贴
          mandah_alw: record['Mandah_Alw'].toString(),  // 津贴（印尼语Mandah：补贴）
          incentive_alw: record['Incentive_Alw'].toString(),  // 激励奖金/补贴

          // 扣除类
          absent_ded: record['Absent_Ded'].toString(),  // 缺勤扣款
          leave_comp: record['Leave_Comp'].toString(),  // 调休抵扣扣款
          comp_phk: record['Comp_Phk'].toString(),  // 印尼PHK（解雇）补偿金
          tax_alw_phk: record['Tax_Alw_Phk'].toString(),  // 解雇补偿金税务补贴
          absent_ded2: record['Absent_Ded2'].toString(),  // 缺勤扣款2（细分项）
          incentive_ded: record['Incentive_Ded'].toString(),  // 激励奖金扣款
          loan_ded: record['Loan_Ded'].toString(),  // 借款扣款
          correct_add: record['Correct_Add'].toString(),  // 薪资更正（加项）
          correct_sub: record['Correct_Sub'].toString(),  // 薪资更正（减项）
          tax_ded_phk: record['Tax_Ded_Phk'].toString(),  // 解雇补偿金税务扣款
          jmstk_fee: record['Jmstk_Fee'].toString(),  // 公积金费用（个人承担）
          pension_ded: record['Pension_Ded'].toString(),  // 养老金扣款（个人承担）
          tax_ded_salary: record['Tax_Ded_Salary'].toString(),  // 薪资税务扣款
          askes_bpjs_ded: record['Askes_BPJS_Ded'].toString(),  // 印尼BPJS社保扣款（个人承担）

          // 最终结算类
          total_accept: record['Total_Accept'].toString(),  // 总收入
          net_accept: record['Net_Accept'].toString(),  // 实际到手收入
          round_off_salary: record['Round_Off_Salary'].toString(),  // 薪资四舍五入调整项
      })).filter(record => record.employee_id)
      
      if (records.length === 0) {
        console.log('没有有效记录可导入')
        messageApi.error('没有有效记录可导入')
        return
      }
      
      const result = await importSalaryRecords(parseInt(projectId), selectedMonth.format('YYYY-MM'), records)
      messageApi.success(String(result) || t('newSalaryPage.importSuccess'))
      getSalaries()
      setImportModalVisible(false);
      // 重置导入状态
      setParsedSheets([]);
      setActiveTabKey('');
    } catch (error) {
      console.log('捕获到的错误:', error)
      console.error('批量导入失败:', error)
      messageApi.error('批量导入失败')
    } finally {
      setImportLoading(false)
    }
  }

  // 单独的文件处理函数
  const processFile =(file: any) => {

      const reader = new FileReader()
      console.log('开始处理文件111:', file.name)
      reader.onload = (e) => {
        console.log('文件读取成功2222，开始解析Excel');
        try {
          console.log('文件读取成功，开始解析Excel');
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          // const data = e.target?.result
          const workbook = XLSX.read(data, { type: 'array' });
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
          messageApi.error('解析Excel失败');
        }


      
      // reader.readAsArrayBuffer(file);
    } 
      console.log('文件读取完成666:', file.name);
      reader.onerror = () => {
      console.error('文件读取失败');
      messageApi.error(t('employeePage.fileReadFailed'));
    }
    
      reader.readAsArrayBuffer(file);
  }

  // 配置上传组件
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls',
    beforeUpload: (file) => {
      const isExcel = file.type === 'application/vnd.ms-excel' || 
                      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                      file.name.endsWith('.xls') || 
                      file.name.endsWith('.xlsx');
      
      if (!isExcel) {
        messageApi.error('请上传Excel文件');
        return Upload.LIST_IGNORE;
      }
      
      const isLessThan10M = file.size / 1024 / 1024 < 10;
      if (!isLessThan10M) {
        messageApi.error('文件大小不能超过10MB');
        return Upload.LIST_IGNORE;
      }
      
      return false;
    },
    onChange: handleUpload,
    showUploadList: true,
    fileList: [],
    customRequest: ({ onSuccess }) => {
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


  const columns: ColumnsType<SalaryRecord> = [
     {
      title: t('common.no'),
      key: 'serialNo',
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: t('newSalaryPage.month'),
      dataIndex: 'month',
      key: 'month'
    },    
    // {
    //   title: t('newSalaryPage.projectName'),
    //   dataIndex: 'project_name',
    //   key: 'project_name'
    // },
    {
      title: t('newSalaryPage.employeeName'),
      dataIndex: 'employee_name',
      key: 'employee_name'
    },
    {
      title: t('newSalaryPage.employeeId'),
      dataIndex: 'employee_id',
      key: 'employee_id'
    },

    {
      title: t('newSalaryPage.taxType'),
      dataIndex: 'tax_type',
      key: 'tax_type'
    },
    {
      title: t('newSalaryPage.idCard'),
      dataIndex: 'id_card',
      key: 'id_card'
    },
    {
      title: t('newSalaryPage.npwp'),
      dataIndex: 'npwp',
      key: 'npwp'
    },
    
    {
      title: t('newSalaryPage.hierarchyId'),
      dataIndex: 'hierarchy_id',
      key: 'hierarchy_id'
    },
    {
      title: t('newSalaryPage.hierarchyName'),
      dataIndex: 'hierarchy_name',
      key: 'hierarchy_name'
    },
    {
      title: t('newSalaryPage.locationName'),
      dataIndex: 'location_name',
      key: 'location_name'
    },
    {
      title: t('newSalaryPage.joinDate'),
      dataIndex: 'join_date',
      key: 'join_date'
    },
    {
      title: t('newSalaryPage.resignDate'),
      dataIndex: 'resign_date',
      key: 'resign_date'
    },
    {
      title: t('newSalaryPage.position'),
      dataIndex: 'position',
      key: 'position'
    },
    {
      title: t('newSalaryPage.email'),
      dataIndex: 'email',
      key: 'email'
    },    
        {
      title: t('newSalaryPage.work'),
      dataIndex: 'work',
      key: 'work'
    },
        {
      title: t('newSalaryPage.off'),
      dataIndex: 'off',
      key: 'off'
    },
        {
      title: t('newSalaryPage.permission'),
      dataIndex: 'permission',
      key: 'permission'
    },
        {
      title: t('newSalaryPage.absent'),
      dataIndex: 'unpresent',
      key: 'unpresent'
    },
        {
      title: t('newSalaryPage.sick'),
      dataIndex: 'sick',
      key: 'sick'
    },
    {
      title: t('newSalaryPage.standby'),
      dataIndex: 'standby',
      key: 'standby'
    },

        {
      title: t('newSalaryPage.extrawork'),
      dataIndex: 'ew',
      key: 'ew'
    },
        {
      title: t('newSalaryPage.annualleave'),
      dataIndex: 'annualleave',
      key: 'annualleave'
    },
          {
      title: t('newSalaryPage.OT1'),
      dataIndex: 'ot1',
      key: 'ot1'
    },
          {
      title: t('newSalaryPage.EW1'),
      dataIndex: 'ew1',
      key: 'ew1'
    },    
    {
      title: t('newSalaryPage.EW2'),
      dataIndex: 'ew2',
      key: 'ew2'
    },    
    {
      title: t('newSalaryPage.EW3'),
      dataIndex: 'ew3',
      key: 'ew3'
    },      
    {
      title: t('newSalaryPage.basicSalary'),
      dataIndex: 'basic_salary',
      key: 'basic_salary',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.housingAllowance'),
      dataIndex: 'housing_alw',
      key: 'housing_alw',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.positionAllowance'),
      dataIndex: 'position_alw',
      key: 'position_alw',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.fieldAllowance'),
      dataIndex: 'field_alw',
      key: 'field_alw',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    // {
    //   title: t('newSalaryPage.fixedAllowance'),
    //   dataIndex: 'fix_alw',
    //   key: 'fix_alw',
    //   render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    // },
        {
      title: t('newSalaryPage.totalNetWages'),
      dataIndex: 'total_net_wages',
      key: 'total_net_wages',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.HousingAlwTetap'),
      dataIndex: 'housing_alw_tetap',
      key: 'housing_alw_tetap',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    }, 
        {
      title: t('newSalaryPage.phoneAllowanceByMonth'),
      dataIndex: 'pulsa_alw_month',
      key: 'pulsa_alw_month',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.jmstkAllowance'),
      dataIndex: 'jmstk_alw',
      key: 'jmstk_alw',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.pensionAllowance'),
      dataIndex: 'pension_alw',
      key: 'pension_alw',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
 
   {      title: t('newSalaryPage.overtimeHours'),      dataIndex: 'ot1_hour',      key: 'ot1_hour',      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
        {
      title: t('newSalaryPage.overtimeWages'),
      dataIndex: 'ot1_wages',
      key: 'ot1_wages',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.extraWorkHours'),
      dataIndex: 'ew1_hour',
      key: 'ew1_hour',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },

    {
      title: t('newSalaryPage.extraWages'),
      dataIndex: 'ew1_wages',
      key: 'ew1_wages',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
       {
      title: t('newSalaryPage.extraWorkHours2'),
      dataIndex: 'ew2_hour',
      key: 'ew2_hour',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.extraWages2'),
      dataIndex: 'ew2_wages',
      key: 'ew2_wages',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
       {
      title: t('newSalaryPage.extraWorkHours3'),
      dataIndex: 'ew3_hour',
      key: 'ew3_hour',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },

    {
      title: t('newSalaryPage.extraWages3'),
      dataIndex: 'ew3_wages',
      key: 'ew3_wages',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
       {
      title: t('newSalaryPage.mealAllowance'),
      dataIndex: 'meal_alw',
      key: 'meal_alw',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.transportAllowance'),
      dataIndex: 'transp_alw',
      key: 'transp_alw',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.taxAllowanceSalary'),
      dataIndex: 'tax_alw_salary',
      key: 'tax_alw_salary',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.bpjsAllowance'),
      dataIndex: 'askes_bpjs_alw',
      key: 'askes_bpjs_alw',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.phoneAllowanceByDay'),
      dataIndex: 'pulsa_alw',
      key: 'pulsa_alw',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
       {
      title: t('newSalaryPage.attendanceAllowance'),
      dataIndex: 'att_alw',
      key: 'att_alw',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    }, 
       {
      title: t('newSalaryPage.absentDeduction'),
      dataIndex: 'absent_ded',
      key: 'absent_ded',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.leaveCompensation'),
      dataIndex: 'leave_comp',
      key: 'leave_comp',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.medicalAllowance'),
      dataIndex: 'med_alw',
      key: 'med_alw',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.otherAllowance'),
      dataIndex: 'others',
      key: 'others',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.religiousAllowance'),
      dataIndex: 'religious_alw',
      key: 'religious_alw',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.rapelBasicSalary'),
      dataIndex: 'rapel_basic_salary',
      key: 'rapel_basic_salary',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.rapelJmstkAlw'),
      dataIndex: 'rapel_jmstk_alw',
      key: 'rapel_jmstk_alw',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.actingAllowance'),
      dataIndex: 'acting',
      key: 'acting',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.performanceAllowance'),
      dataIndex: 'performance_alw',
      key: 'performance_alw',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.travelAllowance'),
      dataIndex: 'trip_alw',
      key: 'trip_alw',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.mandahAllowance'),
      dataIndex: 'mandah_alw',
      key: 'mandah_alw',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.incentiveAllowance'),
      dataIndex: 'incentive_alw',
      key: 'incentive_alw',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.overtimeWages2'),
      dataIndex: 'ot2_wages',
      key: 'ot2_wages',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.overtimeWages3'),
      dataIndex: 'ot3_wages',
      key: 'ot3_wages',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.phkCompensation'),
      dataIndex: 'comp_phk',
      key: 'comp_phk',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.taxAllowancePhk'),
      dataIndex: 'tax_alw_phk',
      key: 'tax_alw_phk',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.absentDed2'),
      dataIndex: 'absent_ded2',
      key: 'absent_ded2',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.incentiveDeduction'),
      dataIndex: 'incentive_ded',
      key: 'incentive_ded',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.loanDeduction'),
      dataIndex: 'loan_ded',
      key: 'loan_ded',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },

    {
      title: t('newSalaryPage.positiveCorrection'),
      dataIndex: 'correct_add',
      key: 'correct_add',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.negativeCorrection'),
      dataIndex: 'correct_sub',
      key: 'correct_sub',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.taxDeductionPhk'),
      dataIndex: 'tax_ded_phk',
      key: 'tax_ded_phk',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.totalAcceptance'),
      dataIndex: 'total_accept',
      key: 'total_accept',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.jmstkFee'),
      dataIndex: 'jmstk_fee',
      key: 'jmstk_fee',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.pensionDeduction'),
      dataIndex: 'pension_ded',
      key: 'pension_ded',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.taxDeductionSalary'),
      dataIndex: 'tax_ded_salary',
      key: 'tax_ded_salary',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.bpjsDeduction'),
      dataIndex: 'askes_bpjs_ded',
      key: 'askes_bpjs_ded',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },

    {
      title: t('newSalaryPage.netAcceptance'),
      dataIndex: 'net_accept',
      key: 'net_accept',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.salaryRounding'),
      dataIndex: 'round_off_salary',
      key: 'round_off_salary',
      render: (text: number | string | null | undefined) => <ScientificNumberDisplay value={text} />
    },
    {
      title: t('newSalaryPage.isCalculate'),
      dataIndex: 'is_calculate',
      key: 'is_calculate',
      render: (is_calculate: number, record: SalaryRecord) => (
        <Switch
         checkedChildren="Yes" unCheckedChildren="No"
          checked={is_calculate === 1}
          style={{ backgroundColor: is_calculate === 1 ? '#52c41a' : '#ff4d4f' }}
          onChange={handleSwitchChange(record)}
        />
      )
    },
    {
      title: t('common.action'),
      key: 'action',
      // fixed: 'right',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
          >{t('common.edit')}</Button>
          <Button 
            type="primary" 
            size="small" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
          >{t('common.delete')}</Button>

        </Space>
      )
    }
  ]

  //导出excel下载功能，
  const handleExportToExcel = () => {
    if (salaryRecords.length === 0) {
      messageApi.warning('没有数据可导出');
      return;
    }
    // 准备导出数据，使用表格列标题作为Excel列名
    const exportData = salaryRecords.map(record => {
      const row: { [key: string]: any } = {};
      columns.forEach(column => {
        if ('dataIndex' in column && column.title && column.dataIndex) {
          // 使用列标题作为键，确保导出的Excel有正确的列名
          row[column.title as string] = record[column.dataIndex as keyof SalaryRecord];
        }
      });
      return row;
    });
    // 创建工作簿和工作表
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, '薪资记录');
    // 生成Excel文件并下载
      const excelFileName = `Salary_Records_${currentMonth}.xlsx`;
    XLSX.writeFile(workbook, excelFileName);
    messageApi.success('Export Excel Sucess');



     // 修复：使用Blob和下载链接来触发浏览器的保存对话框
  // 这样用户可以选择保存路径
  // const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  // const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  // const url = URL.createObjectURL(blob);
  // const link = document.createElement('a');
  // link.href = url;
  // link.download = excelFileName;
  // link.style.display = 'none';
  
  // // 触发点击事件，打开保存对话框
  // document.body.appendChild(link);
  // link.click();
  
  // // 清理
  // document.body.removeChild(link);
  // URL.revokeObjectURL(url);
  // messageApi.success('Excel导出成功');


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
      
      // 直接使用formattedValues调用fetchSalaryData的逻辑，而不是依赖于状态更新
      const newCurrentPage = 1
      
      // 手动执行fetchSalaryData的逻辑，使用新的参数
      try {
        const params = {
          month: currentMonth,
          project_id: projectId,
          page: newCurrentPage.toString(),
          page_size: pageSize.toString(),
          ...formattedValues
        };
        
        console.log('加载薪资数据参数:', params);
        
        // 直接调用getSalaries，使用新的参数
        getSalaries(params).then(result => {
          // 先断言为 unknown，再断言为目标类型，避免 TypeScript 类型重叠警告
          const response = (result as unknown) as { data: any[]; total: number };
          console.log('获取到的薪资数据:', response);
          setTotal(response.total);
          
          // 根据projectId筛选数据
          if (projectId === 'all') {
            setSalaryRecords(response.data);
          } else {
            setSalaryRecords(response.data);
          }
        }).catch(error => {
          console.error('获取薪资数据失败:', error);
          messageApi.error('获取薪资数据失败');
        });
      } catch (error) {
        console.error('获取薪资数据失败:', error);
        messageApi.error('获取薪资数据失败');
      }
    })
  }
  
  // 处理筛选表单重置
  const handleFilterReset = () => {
    filterForm.resetFields()
    // 重置后设置month字段为当前月份
    filterForm.setFieldsValue({
      month: dayjs(currentMonth)
    })
    setFilterValues({})
    loadData()
  }

  return (
    <div>
      {messageContextHolder}
      {contextHolder}
      <Card style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
        <style>
          {`
            .table-row-light {
              background-color: #ffffff;
            }
            .table-row-light:hover {
              background-color: #f5f5f5 !important;
            }
            .table-row-dark {
              background-color: #fafafa;
            }
            .table-row-dark:hover {
              background-color: #f5f5f5 !important;
            }
          `}
        </style>
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
          <div style={{ display: 'flex', gap: 8 }}>
          {/* 多个按钮放在 div 中，通过 gap 控制间距 */}
          <Button size="small" type="primary" icon={<PlusOutlined />} onClick={handleCalculateMonthlySalary}>{t('newSalaryPage.calculateMonthlySalary')}</Button>
          <Button size="small" type="primary" icon={<UploadOutlined />} onClick={() => setImportModalVisible(true)}>{t('newSalaryPage.importSalaryRecords')}</Button>
          <Button size="small" type="primary" icon={<FileExcelOutlined />} onClick={handleExportToExcel}>{t('newSalaryPage.exportToExcel')}</Button>
          </div>
        </div> 
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Table 
            columns={columns} 
            dataSource={salaryRecords} 
            rowKey="id"
            rowClassName={(_, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
            style={{ width: '100%', height: '100%' }}
            pagination={false}
            scroll={{ x: 'max-content', y: 'calc(100vh - 450px)' }}
          />
        </div>
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
        title={isEditMode ? t('newSalaryPage.editSalaryRecord') : t('newSalaryPage.addSalaryRecord')}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item name="employee_id" label={t('newSalaryPage.employeeId')} rules={[{ required: true }]}>
              <Input placeholder={t('newSalaryPage.enterEmployeeId')} />
            </Form.Item>
            <Form.Item name="employee_name" label={t('newSalaryPage.employeeName')} rules={[{ required: true }]}>
              <Input placeholder={t('newSalaryPage.enterEmployeeName')} />
            </Form.Item> 
            <Form.Item name="month" label={t('newSalaryPage.month')} rules={[{ required: true }]}>
              <Input placeholder={t('newSalaryPage.enterMonthFormat')} />
            </Form.Item>                   
            <Form.Item name="basic_salary" label={t('newSalaryPage.basicSalary')} rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterBasicSalary')} min={0} />
              </Form.Item>
            <Form.Item name="housing_alw" label={t('newSalaryPage.housingAllowance')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterHousingAllowance')} min={0} />
            </Form.Item>
            <Form.Item name="position_alw" label={t('newSalaryPage.positionAllowance')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterPositionAllowance')} min={0} />
            </Form.Item>
            <Form.Item name="field_alw" label={t('newSalaryPage.fieldAllowance')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterFieldAllowance')} min={0} />
            </Form.Item>
            {/* <Form.Item name="fix_alw" label={t('newSalaryPage.fixedAllowance')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterFixedAllowance')} min={0} />
            </Form.Item> */}
            <Form.Item name="total_net_wages" label={t('newSalaryPage.totalNetWages')}>
                <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterTotalNetWages')} min={0} />
              </Form.Item>
            {/* <Form.Item name="jmstk_alw" label={t('newSalaryPage.jmstkAllowance')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterJmstkAllowance')} min={0} />
            </Form.Item>   */}
            <Form.Item name="pension_alw" label={t('newSalaryPage.pensionAllowance')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterPensionAllowance')} min={0} />
            </Form.Item>
            <Form.Item name="ot1_hour" label={t('newSalaryPage.overtimeHours')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterOvertimeHours')} min={0} />
            </Form.Item>
            <Form.Item name="ew1_hour" label={t('newSalaryPage.extraWorkHours')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterExtraWorkHours')} min={0} />
            </Form.Item>
            <Form.Item name="ew1_wages" label={t('newSalaryPage.extraWages')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterOvertimeWages')} min={0} />
            </Form.Item>
            <Form.Item name="ew2_hour" label={t('newSalaryPage.extraWorkHours2')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterExtraWorkHours2')} min={0} />
            </Form.Item>
            <Form.Item name="ew2_wages" label={t('newSalaryPage.extraWages2')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterExtraWages')} min={0} />
            </Form.Item>
            <Form.Item name="ew3_hour" label={t('newSalaryPage.extraWorkHours3')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterExtraWorkHours3')} min={0} />
            </Form.Item>
            <Form.Item name="ew3_wages" label={t('newSalaryPage.extraWages3')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterExtraWages3')} min={0} />
            </Form.Item>
                                
            <Form.Item name="meal_alw" label={t('newSalaryPage.mealAllowance')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterMealAllowance')} min={0} />
            </Form.Item>
            <Form.Item name="transp_alw" label={t('newSalaryPage.transportAllowance')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterTransportAllowance')} min={0} />
            </Form.Item>            

            <Form.Item name="tax_alw_salary" label={t('newSalaryPage.taxAllowanceSalary')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterTaxAllowanceSalary')} min={0} />
            </Form.Item>
            <Form.Item name="tax_alw_phk" label={t('newSalaryPage.taxAllowancePhk')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterTaxAllowancePhk')} min={0} />
            </Form.Item>
            <Form.Item name="comp_phk" label={t('newSalaryPage.phkCompensation')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterPhkCompensation')} min={0} />
            </Form.Item>
            <Form.Item name="askes_bpjs_alw" label={t('newSalaryPage.bpjsAllowance')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterBpjsAllowance')} min={0} />
            </Form.Item>
            <Form.Item name="correct_add" label={t('newSalaryPage.positiveCorrection')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterPositiveCorrection')} min={0} />
            </Form.Item>
            <Form.Item name="correct_sub" label={t('newSalaryPage.negativeCorrection')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterNegativeCorrection')} min={0} />
            </Form.Item>
            <Form.Item name="others" label={t('newSalaryPage.otherAllowance')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterOtherAllowance')} min={0} />
            </Form.Item>
            <Form.Item name="att_alw" label={t('newSalaryPage.attendanceAllowance')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterAttendanceAllowance')} min={0} />
            </Form.Item>
          </div>
          
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item name="housing_alw_tetap" label={t('newSalaryPage.HousingAlwTetap')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterTemporaryHousingAllowance')} min={0} />
            </Form.Item>
            <Form.Item name="religious_alw" label={t('newSalaryPage.religiousAllowance')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterReligiousAllowance')} min={0} />
            </Form.Item>
            <Form.Item name="absent_ded" label={t('newSalaryPage.absentDeduction')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterAbsentDeduction')} min={0} />
            </Form.Item>
            <Form.Item name="rapel_basic_salary" label={t('newSalaryPage.rapelBasicSalary')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterBasicSalaryAdjustment')} min={0} />
            </Form.Item>
            <Form.Item name="rapel_jmstk_alw" label={t('newSalaryPage.rapelJmstkAlw')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterJmstkAdjustment')} min={0} />
            </Form.Item>
            <Form.Item name="incentive_alw" label={t('newSalaryPage.incentiveAllowance')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterIncentiveAllowance')} min={0} />
            </Form.Item>
            <Form.Item name="acting" label={t('newSalaryPage.actingAllowance')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterActingAllowance')} min={0} />
            </Form.Item>
            <Form.Item name="performance_alw" label={t('newSalaryPage.performanceAllowance')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterPerformanceAllowance')} min={0} />
            </Form.Item>
            <Form.Item name="trip_alw" label={t('newSalaryPage.travelAllowance')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterTravelAllowance')} min={0} />
            </Form.Item>
            <Form.Item name="total_accept" label={t('newSalaryPage.totalAcceptance')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterTotalAcceptance')} min={0} />
            </Form.Item>
            <Form.Item name="jmstk_fee" label={t('newSalaryPage.jmstkFee')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterJmstkFee')} min={0} />
            </Form.Item>
            <Form.Item name="pension_ded" label={t('newSalaryPage.pensionDeduction')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterPensionDeduction')} min={0} />
            </Form.Item>
            {/* <Form.Item name="pension_ded2" label={t('newSalaryPage.pensionDeduction')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterPensionDeduction')} min={0} />
            </Form.Item> */}
            <Form.Item name="tax_ded_salary" label={t('newSalaryPage.taxDeductionSalary')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterTaxDeductionSalary')} min={0} />
            </Form.Item>
            <Form.Item name="tax_ded_phk" label={t('newSalaryPage.taxDeductionPhk')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterTaxDeductionPhk')} min={0} />
            </Form.Item>
          </div>
          
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item name="askes_bpjs_ded" label={t('newSalaryPage.bpjsDeduction')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterBpjsDeduction')} min={0} />
            </Form.Item>
            <Form.Item name="incentive_ded" label={t('newSalaryPage.incentiveDeduction')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterIncentiveDeduction')} min={0} />
            </Form.Item>
            <Form.Item name="loan_ded" label={t('newSalaryPage.loanDeduction')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterLoanDeduction')} min={0} />
            </Form.Item>

            <Form.Item name="net_accept" label={t('newSalaryPage.netAcceptance')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.enterNetIncome')} min={0} />
            </Form.Item>
            <Form.Item name="round_off_salary" label={t('newSalaryPage.salaryRounding')}>
              <InputNumber style={{ width: '100%' }} placeholder={t('newSalaryPage.salaryRounding')} min={0} />
            </Form.Item>
            </div>
        </Form>
      </Modal>

      {/* 导入工资的Modal */}
      <Modal
        title={t('newSalaryPage.importSalaryRecords')}
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={null}
        width={1000}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ marginRight: 16 }}>
              <span>{t('newSalaryPage.month')}: </span>
              <DatePicker
                picker="month"
                value={selectedMonth}
                onChange={(date) => date && setSelectedMonth(date)}
                style={{ width: 150 }}
              />
            </div>
          </div>
          
          <Upload.Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              {t('newSalaryPage.clickOrDragToUpload')}
            </p>
            <p className="ant-upload-hint">
              {t('newSalaryPage.supportSingleExcelUpload')}
            </p>
          </Upload.Dragger>
          
          {parsedSheets.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{
                marginBottom: 16,
                display: 'block',
                marginLeft: 'auto',   // 左右auto实现块级元素水平居中
                marginRight: 'auto',
                textAlign: 'center'   // 可选：如果是文本内容，加这个确保文本也居中
              }}>
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
          )}
        </div>
      </Modal>
    </div>
  )
}

export default NewSalaryPage