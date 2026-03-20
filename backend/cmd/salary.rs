use super::super::{database::connect_database, models::*};
use chrono::Local;
use rusqlite::{ToSql, params};
use serde::Deserialize;
use serde_json::{Value, json};
use std::{collections::HashMap, string};

// 薪资导入请求模型
#[derive(Debug, Deserialize)]
pub struct SalaryImportRequest {
    pub employee_id: String,
    pub project_id: String,
    pub month: String,
    pub data: HashMap<String, String>,
}

// 薪资批量导入请求模型
#[derive(Debug, Deserialize)]
pub struct BatchSalaryImportRequest {
    pub project_id: String,
    pub month: String,
    pub records: Vec<HashMap<String, String>>,
}
// // 获取所有薪资总和(round_off_salary)API
#[tauri::command]
pub async fn get_totalSalaries(query: HashMap<String, String>) -> Result<f64, String> {
    // 获取查询参数
    let month = query.get("month");
    let project_id = query.get("project_id");

    // 连接数据库
    let mut conn = connect_database()?;

    // 构建SQL查询
    let sql = String::from("SELECT COALESCE(SUM(round_off_salary), 0) FROM salary");
    // };
    // let sql = if month.is_some() && project_id.is_some() {
    //     "SELECT COALESCE(SUM(round_off_salary), 0) FROM salary WHERE month = ? AND project_id = ?"
    // } else if month.is_some() {
    //     "SELECT COALESCE(SUM(round_off_salary), 0) FROM salary WHERE month = ?"
    // } else if project_id.is_some() {
    //     "SELECT COALESCE(SUM(round_off_salary), 0) FROM salary WHERE project_id = ?"
    // } else {
    //     "SELECT COALESCE(SUM(round_off_salary), 0) FROM salary"
    // };

    // 准备查询参数
    // let params: &[&dyn ToSql] = match (month, project_id) {
    // (Some(m), Some(pid)) => {
    //     // 将project_id转换为u32类型
    //     let pid_u32 = pid.parse::<u32>().map_err(|e| format!("项目ID转换失败: {}", e))?;
    //     rusqlite::params![m, pid_u32]
    // },
    // (Some(m), None) => {
    //     rusqlite::params![m]
    // },
    // (None, Some(pid)) => {
    //     // 将project_id转换为u32类型并直接在params!宏中使用
    //     let pid_u32 = pid.parse::<u32>().map_err(|e| format!("项目ID转换失败: {}", e))?;
    //     rusqlite::params![pid_u32]
    // },
    //     (None, None) => {
    //         rusqlite::params![]
    //     }
    // };

    // 执行查询
    let total: f64 = conn
        .query_row(&sql, [], |row| row.get(0))
        .map_err(|e| format!("查询薪资总和失败: {}", e))?;

    Ok(total)
}

// 薪资计算API
#[tauri::command]
pub async fn calculate_monthly_salary(
    query: HashMap<String, String>,
) -> Result<Vec<SalaryRecord>, String> {
    // 获取查询参数
    let month = match query.get("month") {
        Some(m) => m,
        None => return Err("缺少月份参数".to_string()),
    };
    let project_id = query.get("project_id");

    // 连接数据库
    let mut conn = connect_database()?;

    // 从salary_coefficient表获取计算系数
    let coefficient_query = "SELECT c_jmstk_alw,c_pension_alw, c_askes_alw, c_ot_hour1, c_ot_wages1, c_ew_hour1, c_ew_wages1, c_ew_hour2, c_ew_wages2, c_ew_hour3, c_ew_wages3, c_jmstk_fee, c_pension_ded, c_askes_ded, jmstk_max, pension_max, askes_max,askes_min FROM salary_coefficient LIMIT 1";
    let mut coefficient_stmt = conn
        .prepare(coefficient_query)
        .map_err(|e| format!("准备系数查询失败: {}", e))?;
    let (
        c_jmstk_alw,
        c_pension_alw,
        c_askes_alw,
        c_ot_hour1,
        c_ot_wages1,
        c_ew_hour1,
        c_ew_wages1,
        c_ew_hour2,
        c_ew_wages2,
        c_ew_hour3,
        c_ew_wages3,
        c_jmstk_fee,
        c_pension_ded,
        c_askes_ded,
        jmstk_max,
        pension_max,
        askes_max,
        askes_min,
    ): (
        f64,
        f64,
        f64,
        f64,
        f64,
        f64,
        f64,
        f64,
        f64,
        f64,
        f64,
        f64,
        f64,
        f64,
        f64,
        f64,
        f64,
        f64,
    ) = coefficient_stmt
        .query_row([], |row| {
            Ok((
                row.get(0)?,
                row.get(1)?,
                row.get(2)?,
                row.get(3)?,
                row.get(4)?,
                row.get(5)?,
                row.get(6)?,
                row.get(7)?,
                row.get(8)?,
                row.get(9)?,
                row.get(10)?,
                row.get(11)?,
                row.get(12)?,
                row.get(13)?,
                row.get(14)?,
                row.get(15)?,
                row.get(16)?,
                row.get(17)?,
            ))
        })
        .map_err(|e| format!("获取系数失败: {}", e))?;

    // 从project表获取项目的askes_alw_by_nation系数
    let project_askes_query = "SELECT askes_alw_by_nation FROM project WHERE id = ? ";
    let mut project_stmt = conn
        .prepare(project_askes_query)
        .map_err(|e| format!("准备保险系数查询失败: {}", e))?;
    let (askes_alw_by_nation): (f64) = project_stmt
        .query_row([project_id.unwrap().to_string()], |row| Ok(row.get(0)?))
        .map_err(|e| format!("获取保险系数失败: {}", e))?;

    // 获取考勤记录  连和 从偶发事件记录获取员工信息
    let sql = if project_id.is_some() {
        format!(
            "SELECT a.employee_id, a.work, a.off, a.ot1, IFNULL(e.name, '') AS employee_name,  -- 名称通常非空，用空字符串更合理
            CAST(IFNULL(e.basic_salary, 0) AS REAL) AS basic_salary,
            IFNULL(e.department, '') AS department,  -- 部门用空字符串
            CAST(IFNULL(e.field_alw, 0) AS REAL) AS field_alw,
            CAST(IFNULL(e.housing_alw, 0) AS REAL) AS housing_alw,
            CAST(IFNULL(e.position_alw, 0) AS REAL) AS position_alw,
            CAST(IFNULL(e.fix_alw, 0) AS REAL) AS fix_alw,
            CAST(IFNULL(e.meal_alw_day, 0) AS REAL) AS meal_alw_day,
            CAST(IFNULL(e.transp_alw_day, 0) AS REAL) AS transp_alw_day,
            CAST(IFNULL(e.pulsa_alw_day, 0) AS REAL) AS pulsa_alw_day,
            CAST(IFNULL(e.att_alw_day, 0) AS REAL) AS att_alw_day,
            IFNULL(a.ew1, 0) AS ew1,
            IFNULL(ir.leave_comp, 0) AS leave_comp,  IFNULL(ir.med_alw, 0) AS med_alw,  IFNULL(ir.others, 0) AS others,  IFNULL(ir.religious_alw, 0) AS religious_alw,  IFNULL(ir.rapel_basic_salary, 0) AS rapel_basic_salary,  IFNULL(ir.rapel_jmstk_alw, 0) AS rapel_jmstk_alw,  IFNULL(ir.incentive_alw, 0) AS incentive_alw,  IFNULL(ir.acting, 0) AS acting,  IFNULL(ir.performance_alw, 0) AS performance_alw,  IFNULL(ir.trip_alw, 0) AS trip_alw,  IFNULL(ir.ot2_wages, 0) AS ot2_wages,  IFNULL(ir.ot3_wages, 0) AS ot3_wages,  IFNULL(ir.comp_phk, 0) AS comp_phk,  IFNULL(ir.tax_alw_phk, 0) AS tax_alw_phk,  IFNULL(ir.absent_ded, 0) AS absent_ded,
            IFNULL(ir.absent_ded2, 0) AS absent_ded2,  IFNULL(ir.incentive_ded, 0) AS incentive_ded,  IFNULL(ir.loan_ded, 0) AS loan_ded,
            e.tax_type,e.npwp,e.location_name,e.join_date,CAST(IFNULL(e.pulsa_alw_month, 0) AS REAL) AS pulsa_alw_month,
            IFNULL(ir.tax_ded_phk, 0) AS tax_ded_phk,
            IFNULL(ir.correct_add, 0) AS correct_add,
            IFNULL(ir.correct_sub, 0) AS correct_sub,
            IFNULL(a.ew2, 0) AS ew2,
            IFNULL(a.ew3, 0) AS ew3,
            IFNULL(a.unpresent, 0) AS unpresent,
            IFNULL(ir.mandah_alw, 0) AS mandah_alw,
            IFNULL(a.ew, 0) AS ew,
            IFNULL(e.housing_alw_tetap, 0) AS housing_alw_tetap 
             FROM attendance a 
             LEFT JOIN employees e ON a.employee_id = e.employee_id 
             LEFT JOIN incident_records ir ON a.employee_id = ir.employee_id AND a.month = ir.month
             WHERE a.month = '{}' AND a.project_id = '{}'",
            month,
            project_id.unwrap()
        )
    } else {
        format!(
            "SELECT a.employee_id, a.work, a.off, a.ot1, IFNULL(e.name, '') AS employee_name,  -- 名称通常非空，用空字符串更合理
            CAST(IFNULL(e.basic_salary, 0) AS REAL) AS basic_salary,
            IFNULL(e.department, '') AS department,  -- 部门用空字符串
            CAST(IFNULL(e.field_alw, 0) AS REAL) AS field_alw,
            CAST(IFNULL(e.housing_alw, 0) AS REAL) AS housing_alw,
            CAST(IFNULL(e.position_alw, 0) AS REAL) AS position_alw,
            CAST(IFNULL(e.fix_alw, 0) AS REAL) AS fix_alw,
            CAST(IFNULL(e.meal_alw_day, 0) AS REAL) AS meal_alw_day,
            CAST(IFNULL(e.transp_alw_day, 0) AS REAL) AS transp_alw_day,
            CAST(IFNULL(e.pulsa_alw_day, 0) AS REAL) AS pulsa_alw_day,
            CAST(IFNULL(e.att_alw_day, 0) AS REAL) AS att_alw_day,
            IFNULL(a.ew1, 0) AS ew1,
            IFNULL(ir.leave_comp, 0) AS leave_comp,  IFNULL(ir.med_alw, 0) AS med_alw,  IFNULL(ir.others, 0) AS others,  IFNULL(ir.religious_alw, 0) AS religious_alw,  IFNULL(ir.rapel_basic_salary, 0) AS rapel_basic_salary,  IFNULL(ir.rapel_jmstk_alw, 0) AS rapel_jmstk_alw,  IFNULL(ir.incentive_alw, 0) AS incentive_alw,  IFNULL(ir.acting, 0) AS acting,  IFNULL(ir.performance_alw, 0) AS performance_alw,  IFNULL(ir.trip_alw, 0) AS trip_alw,  IFNULL(ir.ot2_wages, 0) AS ot2_wages,  IFNULL(ir.ot3_wages, 0) AS ot3_wages,  IFNULL(ir.comp_phk, 0) AS comp_phk,  IFNULL(ir.tax_alw_phk, 0) AS tax_alw_phk,  IFNULL(ir.absent_ded, 0) AS absent_ded,
            IFNULL(ir.absent_ded2, 0) AS absent_ded2,  IFNULL(ir.incentive_ded, 0) AS incentive_ded,  IFNULL(ir.loan_ded, 0) AS loan_ded,
            e.tax_type,e.npwp,e.location_name,e.join_date,CAST(IFNULL(e.pulsa_alw_month, 0) AS REAL) AS pulsa_alw_month,
            IFNULL(ir.tax_ded_phk, 0) AS tax_ded_phk,
            IFNULL(ir.correct_add, 0) AS correct_add,
            IFNULL(ir.correct_sub, 0) AS correct_sub,
            IFNULL(a.ew2, 0) AS ew2,
            IFNULL(a.ew3, 0) AS ew3,
            IFNULL(a.unpresent, 0) AS unpresent,
            IFNULL(ir.mandah_alw, 0) AS mandah_alw,
            IFNULL(a.ew, 0) AS ew,
              IFNULL(e.housing_alw_tetap, 0) AS housing_alw_tetap  
             FROM attendance a 
             LEFT JOIN employees e ON a.employee_id = e.employee_id 
             LEFT JOIN incident_records ir ON a.employee_id = ir.employee_id AND a.month = ir.month
             WHERE a.month = '{}' AND a.project_id = '{}'",
            month,
            project_id.unwrap()
        )
    };

    let mut stmt = conn
        .prepare(&sql)
        .map_err(|e| format!("准备查询失败: {}", e))?;
    let rows = stmt
        .query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, f64>(1)?,
                row.get::<_, f64>(2)?,
                row.get::<_, f64>(3)?,
                row.get::<_, String>(4)?,
                row.get::<_, f64>(5)?, // 先读取为字符串再转换为f64
                row.get::<_, String>(6)?,
                row.get::<_, f64>(7)?,
                row.get::<_, f64>(8)?,
                row.get::<_, f64>(9)?,
                row.get::<_, f64>(10)?,
                row.get::<_, f64>(11)?,
                row.get::<_, f64>(12)?,
                row.get::<_, f64>(13)?,
                row.get::<_, f64>(14)?,
                row.get::<_, f64>(15)?,
                row.get::<_, f64>(16)?,
                row.get::<_, f64>(17)?,
                row.get::<_, f64>(18)?,
                row.get::<_, f64>(19)?,
                row.get::<_, f64>(20)?,
                row.get::<_, f64>(21)?,
                row.get::<_, f64>(22)?,
                row.get::<_, f64>(23)?,
                row.get::<_, f64>(24)?,
                row.get::<_, f64>(25)?,
                row.get::<_, f64>(26)?,
                row.get::<_, f64>(27)?,
                row.get::<_, f64>(28)?,
                row.get::<_, f64>(29)?,
                row.get::<_, f64>(30)?,
                row.get::<_, f64>(31)?,
                row.get::<_, f64>(32)?,
                row.get::<_, f64>(33)?,
                row.get::<_, String>(34)?,
                row.get::<_, String>(35)?,
                row.get::<_, String>(36)?,
                row.get::<_, String>(37)?,
                row.get::<_, f64>(38)?,
                row.get::<_, f64>(39)?,
                row.get::<_, f64>(40)?,
                row.get::<_, f64>(41)?,
                row.get::<_, f64>(42)?,
                row.get::<_, f64>(43)?,
                row.get::<_, f64>(44)?,
                row.get::<_, f64>(45)?,
                row.get::<_, f64>(46)?,
                row.get::<_, f64>(47)?,
            ))
        })
        .map_err(|e| format!("执行查询失败: {}", e))?;

    let mut results = Vec::new();

    // 遍历考勤记录计算薪资
    for row_result in rows {
        let (
            employee_id,
            work_days_str,
            off_days,
            ot1,
            employee_name,
            basic_salary,
            department,
            field_alw,
            housing_alw,
            position_alw,
            fix_alw,
            meal_alw_day,
            transp_alw_day,
            pulsa_alw_day,
            att_alw_day,
            ew1,
            leave_comp,
            med_alw,
            others,
            religious_alw,
            rapel_basic_salary,
            rapel_jmstk_alw,
            incentive_alw,
            acting,
            performance_alw,
            trip_alw,
            ot2_wages,
            ot3_wages,
            comp_phk,
            tax_alw_phk,
            absent_ded,
            absent_ded2,
            incentive_ded,
            loan_ded,
            tax_type,
            npwp,
            location,
            join_date,
            pulsa_alw_month,
            tax_ded_phk,
            correct_add,
            correct_sub,
            ew2,
            ew3,
            unpresent,
            mandah_alw,
            ew,
            housing_alw_tetap,
        ) = row_result.map_err(|e| format!("读取记录失败47: {}", e))?;
        // 计算总补助
        let total_alw = field_alw + housing_alw + position_alw + fix_alw;
        // println!("basic_salary is :{}", basic_salary);
        // println!("total_alw is :{}", total_alw);
        // let basic_salary = basic_salary.parse::<f64>().unwrap_or(0.0);
        // 计算总工资
        let total_net_wages = basic_salary + total_alw;

        // 计算保险补助有封顶额度
        let jmstk_alw = if basic_salary > jmstk_max {
            jmstk_max * c_jmstk_alw
        } else {
            basic_salary * c_jmstk_alw
        };
        // 保险补助无封顶%
        // let jmstk_alw = basic_salary * c_jmstk_alw ;
        // 取消jmstk_alw
        // let jmstk_alw = 0.0;
        // 计算保险补助
        let pension_alw = if basic_salary > pension_max {
            pension_max * c_pension_alw
        } else {
            basic_salary * c_pension_alw
        };
        // 取消pension_alw
        // let pension_alw = 0.0;

  
        let mut askes_bpjs_alw = if basic_salary > askes_max {
            askes_max * c_askes_alw * askes_alw_by_nation
        } else {
            basic_salary * c_askes_alw * askes_alw_by_nation
        };
      // 计算社保补助,bohai_ho为0 
        // if project_id == Some(&"1".to_string()) {
        //     askes_bpjs_alw = 0.0
        // }
        println!("askes_bpjs_alw is :{}", askes_bpjs_alw);
        //计算加班时长
        let ot1_hour = ot1 * c_ot_hour1;

    
        // 计算加班工资（正常加班1倍）
        let ot1_wages = (ot1_hour / c_ot_wages1) * total_net_wages;
    // 计算额外加班时长
        let ew1_hour = ew1 * c_ew_hour1;

        // 计算额外加班时长1
        let ew1_wages = (ew1_hour / c_ew_wages1) * total_net_wages;

            // 计算额外加班时长
        let ew2_hour = ew2 * c_ew_hour2;

        // 计算额外加班时长1
        let ew2_wages = (ew2_hour / c_ew_wages2 / c_ew_hour2) * total_net_wages;

            // 计算额外加班时长
        let ew3_hour = ew3 * c_ew_hour3;

        // 计算额外加班时长1
        let ew3_wages = (ew3_hour / c_ew_wages3 / c_ew_hour2) * total_net_wages;
        
        // 解析工作日数及加班天数
        let work_days = work_days_str + ew;

        // 计算餐补
        let meal_alw = work_days as f64 * meal_alw_day;

        // 计算交通补助
        let transp_alw = work_days as f64 * transp_alw_day;

        // 计算通讯补助按月计算
        let pulsa_alw = pulsa_alw_day*(work_days);

        let pulsa_alw_month = pulsa_alw_month;
        // 计算考勤补助
        let att_alw = work_days as f64 * att_alw_day;

        let absent_ded1 = unpresent / 30.0 * basic_salary;

        let total_accept_no_tax = total_net_wages
            + housing_alw_tetap
            + pulsa_alw_month
            + jmstk_alw 
            + pension_alw
            + ot1_wages
            + ew1_wages
            + ew2_wages
            + ew3_wages
            + meal_alw
            + transp_alw
            // + tax_alw_salary   //得删除
            + askes_bpjs_alw
            +  pulsa_alw
            + att_alw
            + leave_comp
            + med_alw
            + others
            + religious_alw
            + rapel_basic_salary
            + rapel_jmstk_alw
            + acting
            + performance_alw
            + trip_alw
            + mandah_alw
            + incentive_alw
            + ot2_wages
            + ot3_wages
            + comp_phk
            + tax_alw_phk
            + correct_add
            - correct_sub
            - absent_ded1
            - absent_ded2	
            - incentive_ded
            - loan_ded
            - tax_ded_phk;


        // 计算应纳税所得额
        // 从税率表查询区间
        let mut tax = 0.00;
        let tax_sql = if tax_type == "K/3" {
            format!(
                "SELECT salary_min, salary_max, tax_rate FROM tax_rates where grade = '{}' ORDER BY salary_min",
                tax_type
            )
        } else {
            format!(
                "SELECT salary_min, salary_max, tax_rate FROM tax_rates where grade like '%{}%' ORDER BY salary_min",
                tax_type
            )
        };
        // println!("tax_type: {}", tax_type);
        // println!("tax_sql: {}", tax_sql);
        let mut tax_stmt = conn
            .prepare(&tax_sql)
            .map_err(|e| format!("准备税率查询失败: {}", e))?;
        let tax_rows = tax_stmt
            .query_map([], |row| {
                Ok((
                    row.get::<_, f64>(0)?,
                    row.get::<_, Option<f64>>(1)?,
                    row.get::<_, f64>(2)?,
                ))
            })
            .map_err(|e| format!("查询税率失败: {}", e))?;
        let salary_slip_status = '0'.to_string();
        // 计算应纳税所得额（A）
        let a = total_accept_no_tax;
        // println!("no tax the total accept is : {}", a);
        let mut x = 0.0;
        if a <= 0.0 {
            // 无需缴税
            tax = 0.0;
        } else {
            // 查找A对应的税率区间
            let mut r = 0.0;
            for row_result in tax_rows {
                let (min, max, rate) = row_result.map_err(|e| format!("读取税率失败: {}", e))?;
                if a >= min && (max.is_none() || a < max.unwrap()) {
                    r = rate;
                    break;
                }
            }

            // 迭代计算，直到找到合适的税率
            let mut max_iterations = 100; // 最大迭代次数，防止无限循环
            let mut iteration = 0;
            let mut current_r = r;
            
            loop {
                iteration += 1;
                if iteration > max_iterations {
                    println!("达到最大迭代次数，停止迭代");
                    break;
                }
                
                // 计算X
                x = a * current_r / (1.0 - current_r);
                println!("迭代 {}: x = {}", iteration, x);
                
                // 验证A+X是否仍在同一区间
                let a_plus_x = a + x;
                
                // 重新查找A+X对应的税率区间
                let tax_rows2 = tax_stmt
                    .query_map([], |row| {
                        Ok((
                            row.get::<_, f64>(0)?,
                            row.get::<_, Option<f64>>(1)?,
                            row.get::<_, f64>(2)?,
                        ))
                    })
                    .map_err(|e| format!("查询税率失败: {}", e))?;

                let mut new_r = current_r;
                for row_result in tax_rows2 {
                    let (min, max, rate) =
                        row_result.map_err(|e| format!("读取税率失败: {}", e))?;
                    if a_plus_x >= min && (max.is_none() || a_plus_x < max.unwrap()) {
                        new_r = rate;
                        break;
                    }
                }
                
                // 如果税率没有变化，说明找到了合适的税率
                if new_r == current_r {
                    println!("找到合适的税率: {}", current_r);
                    break;
                }
                
                // 更新税率，继续迭代
                current_r = new_r;
            }

            // 最终税额 = X - 速算扣除数
            // tax = x - new_deduction;
            // if tax < 0.0 {
            //     tax = 0.0;
            // }
        }
        let tax_alw_salary = x;

        // 计算实发工资
        let total_accept = total_accept_no_tax + tax_alw_salary;

        let jmstk_fee =  if basic_salary > jmstk_max {
            jmstk_max * c_jmstk_fee
        } else {
            basic_salary * c_jmstk_fee
        };

        let pension_ded = if basic_salary > pension_max {
            pension_max * c_pension_ded
        } else {
            basic_salary * c_pension_ded
        };

        let tax_ded_salary = tax_alw_salary;
        // println!("tax_ded_salary: {}", tax_ded_salary);

        // let tax_ded_phk = tax_ded_phk;

        // 工资小于等于3.000.000按3.000.000计算，大于3.000.000且小于等于12.000.000按实际计算，大于12.000.000按12.000.000计算
        let capped_salary = if basic_salary <= askes_min {
            askes_min
        } else if basic_salary <= askes_max {
            basic_salary
        } else {
            askes_max
        };
        let askes_bpjs_ded = capped_salary * c_askes_ded;

        let net_accept =
            total_accept  - jmstk_fee - pension_ded - tax_ded_salary - askes_bpjs_ded;

        // 实发工资取整百
        let round_off_salary = (net_accept / 100.0).round() * 100.0;

        // 检查是否已存在记录
        let check_sql =
            "SELECT id FROM salary WHERE employee_id = ? AND month LIKE ? AND is_calculate = 1"; // 只检查需要计算的记录，导入的记录不参与
        let mut check_stmt = conn
            .prepare(check_sql)
            .map_err(|e| format!("准备查询失败: {}", e))?;
        let month_pattern = format!("{}%", month);

        match check_stmt.query_row([&employee_id, &month_pattern], |row| {
            row.get::<_, Option<i32>>(0)
        }) {
            Ok(Some(id)) => {
                // 更新现有记录
                let update_sql = "UPDATE salary SET basic_salary = ?,jmstk_alw = ?,pension_alw = ?,askes_bpjs_alw = ?,ot1_wages = ?,meal_alw = ?,transp_alw = ?,pulsa_alw = ?,att_alw = ?,total_accept = ?,comp_phk = ?,tax_alw_phk = ?,absent_ded = ?,absent_ded2 = ?,incentive_ded = ?,loan_ded = ?,total_net_wages = ?,salary_slip_status = ?,others = ?,incentive_alw = ?,pulsa_alw_month = ? ,tax_alw_salary = ? ,net_accept = ? , round_off_salary = ? ,tax_ded_phk = ?,jmstk_fee = ? ,pension_ded = ?,tax_ded_salary = ?,tax_ded_phk = ?,askes_bpjs_ded = ?,correct_add = ?,correct_sub =?,mandah_alw = ?,ot1_hour = ?,ew1_hour = ?,ew1_wages = ?,ew2_hour = ?,ew2_wages = ?,ew3_hour = ?,ew3_wages = ?, religious_alw = ? ,rapel_basic_salary = ?,acting = ?,performance_alw = ?,trip_alw = ? WHERE employee_id = ? and month = ?";
                let mut update_stmt = conn
                    .prepare(update_sql)
                    .map_err(|e| format!("准备更新失败: {}", e))?;

                update_stmt
                    .execute(rusqlite::params![
                        &basic_salary,
                        &jmstk_alw,
                        &pension_alw,
                        &askes_bpjs_alw,
                        &ot1_wages,
                        &meal_alw,
                        &transp_alw,
                        &pulsa_alw,
                        &att_alw,
                        &total_accept,
                        &comp_phk,
                        &tax_alw_phk,
                        &absent_ded1,
                        &absent_ded2,
                        &incentive_ded,
                        &loan_ded,
                        &total_net_wages,
                        &salary_slip_status,
                        &others,
                        &incentive_alw,
                        &pulsa_alw_month,
                        &tax_alw_salary,
                        &net_accept,
                        &round_off_salary,
                        &tax_ded_phk,
                        &jmstk_fee,
                        &pension_ded,
                        &tax_ded_salary,
                        &tax_ded_phk,
                        &askes_bpjs_ded,
                        &correct_add,
                        &correct_sub,
                        &mandah_alw,
                        &ot1_hour,
                        &ew1_hour,
                        &ew1_wages,
                        &ew2_hour,
                        &ew2_wages,
                        &ew3_hour,
                        &ew3_wages,
                        &religious_alw,
                        &rapel_basic_salary,
                        &acting,
                        &performance_alw,
                        &trip_alw,
                        &employee_id,
                        &month,
                        
                    ])
                    .map_err(|e| format!("执行更新失败: {}", e))?;
            }

            _ => {
                // 插入新记录
                let insert_sql = "INSERT INTO salary (employee_id, project_id, basic_salary, month,
                    jmstk_alw, pension_alw, askes_bpjs_alw, ot1_wages, meal_alw, transp_alw, pulsa_alw, att_alw, total_accept, comp_phk, tax_alw_phk, absent_ded, absent_ded2, incentive_ded, loan_ded, total_net_wages, salary_slip_status, others, incentive_alw, pulsa_alw_month, net_accept, tax_alw_salary, round_off_salary, tax_ded_phk, jmstk_fee, pension_ded, tax_ded_salary, askes_bpjs_ded, correct_add, correct_sub, mandah_alw,ew1_wages,ew2_wages,ew3_wages,ot1_hour,ew1_hour,ew2_hour,ew3_hour,religious_alw,rapel_basic_salary,acting,performance_alw,trip_alw) 
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?,?,?,?);";
                let mut insert_stmt = conn
                    .prepare(insert_sql)
                    .map_err(|e| format!("准备插入失败了: {}", e))?;
                insert_stmt
                    .execute(rusqlite::params![
                        &employee_id,
                        &project_id,
                        &basic_salary,
                        &month,
                        &jmstk_alw,
                        &pension_alw,
                        &askes_bpjs_alw,
                        &ot1_wages,
                        &meal_alw,
                        &transp_alw,
                        &pulsa_alw,
                        &att_alw,
                        &total_accept,
                        &comp_phk,
                        &tax_alw_phk,
                        &absent_ded1,
                        &absent_ded2,
                        &incentive_ded,
                        &loan_ded,
                        &total_net_wages,
                        &salary_slip_status,
                        &others,
                        &incentive_alw,
                        &pulsa_alw_month,
                        &net_accept,
                        &tax_alw_salary,
                        &round_off_salary,
                        &tax_ded_phk,
                        &jmstk_fee,
                        &pension_ded,
                        &tax_ded_salary,
                        &askes_bpjs_ded,
                        &correct_add,
                        &correct_sub,
                        &mandah_alw,
                        &ew1_wages,
                        &ew2_wages,
                        &ew3_wages,
                        &ot1_hour,
                        &ew1_hour,
                        &ew2_hour,
                        &ew3_hour,
                        &religious_alw,
                        &rapel_basic_salary,
                        &acting,
                        &performance_alw,
                        &trip_alw,
                    
                    ])
                    .map_err(|e| format!("执行插入失败: {}", e))?;
            }
        }

        // 添加到结果列表
        results.push(SalaryRecord {
            id: 0,
            employee_id: employee_id.clone(),
            employee_name: employee_name.clone(),
            department: department.clone(),
            basic_salary: tax,
            // final_salary,
            project_id: project_id
                .as_ref()
                .and_then(|id| id.parse::<i32>().ok())
                .unwrap_or(0),
            // tax_status: tax_status,
            housing_alw: 0.0,
            position_alw: 0.0,
            field_alw: 0.0,
            fix_alw: fix_alw.clone(),
            jmstk_alw: 0.0,
            pension_alw: 0.0,
            meal_alw: 0.0,
            transp_alw: 0.0,
            tax_alw_salary: 0.0,
            tax_alw_phk: 0.0,
            comp_phk: 0.0,
            askes_bpjs_alw: 0.0,
            med_alw: 0.0,
            pulsa_alw: 0.0,
            others: 0.0,
            att_alw: 0.0,
            housing_alw_tetap: 0.0,
            religious_alw: 0.0,
            rapel_basic_salary: 0.0,
            rapel_jmstk_alw: 0.0,
            incentive_alw: incentive_alw.clone(),
            acting: 0.0,
            performance_alw: 0.0,
            trip_alw: 0.0,
            ot1_hour: 0.0,
            ew1_hour: 0.0,
            ew1_wages: 0.0,
            ew2_wages: 0.0,
            correct_add: 0.0,
            correct_sub: 0.0,
            leav_comp: 0.0,
            total_accept: 0.0,
            jmstk_fee: 0.0,
            pension_ded: 0.0,
            tax_ded_salary: 0.0,
            tax_ded_phk: 0.0,
            askes_bpjs_ded: 0.0,
            incentive_ded: 0.0,
            loan_ded: 0.0,
            absent_ded: 0.0,
            net_accept: net_accept.clone(),
            round_off_salary: round_off_salary.clone(),
            create_time: "".to_string(),
            update_time: "".to_string(),
            month: month.clone(),
            tax_type: tax_type.to_string(),
            salary_slip_status: salary_slip_status.clone(),
            npwp: npwp.clone(),
            location: location.clone(),
            join_date: join_date.clone(),
            pulsa_alw_month: 0.0,
            mandah_alw: mandah_alw.clone(),
        });
    }

    Ok(results)
}

// 获取薪资列表API
#[tauri::command]
pub async fn get_salaries(query: HashMap<String, String>) -> Result<serde_json::Value, String> {
    let conn = connect_database()?;

    // 获取查询参数
    let month = query.get("month");
    let project_id = query.get("project_id");
    let employee_id = query.get("employee_id");
    let employee_name = query.get("name");
    let page = query.get("page").map(|s| s.parse::<usize>().unwrap_or(1));
    let page_size = query
        .get("page_size")
        .map(|s| s.parse::<usize>().unwrap_or(10));

    // 构建SQL查询
    let mut sql = String::from(
        "SELECT s.id, s.employee_id, e.name, e.department, s.project_id,e.basic_salary, e.housing_alw,e.position_alw, e.field_alw,e.fix_alw,s.jmstk_alw, s.pension_alw, s.meal_alw, s.transp_alw,s.tax_alw_salary, s.tax_alw_phk, s.comp_phk, s.askes_bpjs_alw, ir.med_alw, s.pulsa_alw, s.others, s.att_alw, e.housing_alw_tetap, s.religious_alw, s.rapel_basic_salary,  ir.rapel_jmstk_alw, s.incentive_alw, s.acting, s.performance_alw,  s.trip_alw,s.correct_add, s.correct_sub,  s.leav_comp, s.total_accept, s.jmstk_fee,  s.pension_ded, s.tax_ded_salary, s.tax_ded_phk, s.askes_bpjs_ded, s.incentive_ded, s.loan_ded,  s.absent_ded,  s.net_accept, s.round_off_salary, s.create_time,  s.update_time,  s.month ,e.tax_type,s.salary_slip_status,e.npwp,e.location_name,e.join_date,e.id_card,e.hierarchy_id,e.hierarchy_name,e.resign_date,e.position,a.work,a.off,a.sick,a.absent,a.annualleave,a.permission,a.ew,s.total_net_wages,a.standby,e.pulsa_alw_month,s.mandah_alw,a.ew1,a.ew2,a.ew3,a.unpresent,s.ot1_hour,s.ew1_hour,s.ew2_hour,s.ew3_hour,s.ew1_wages,s.ew2_wages,s.ew3_wages,s.is_calculate,a.ot1,s.ot1_wages,ir.ot2_wages,ir.ot3_wages,ir.absent_ded2,ir.leave_comp FROM salary s INNER JOIN employees e ON s.employee_id = e.employee_id INNER JOIN attendance as a on s.employee_id = a.employee_id INNER JOIN incident_records as ir on s.employee_id = ir.employee_id WHERE 1=1",
    );

    // 添加月份过滤条件
    println!("the month  is:{:?}", month);
    if let Some(m) = month {
        sql.push_str(&format!(
            " AND s.month LIKE '{}' AND a.month LIKE '{}' and ir.month LIKE '{}' ",
            m, m,m  
        ));
    }

    // 添加项目ID过滤条件
    println!("the project id is:{:?}", project_id);
    if let Some(pid) = project_id {
        if pid != "all" {
            sql.push_str(&format!(
                " AND e.project_id = {}",
                pid.parse::<i32>().unwrap_or(0)
            ));
        }
    }

    // 添加员工ID过滤条件
    println!("the employee id is:{:?}", employee_id);
    if let Some(eid) = employee_id {
        if !eid.is_empty() {
            sql.push_str(&format!(" AND s.employee_id LIKE '{}' ", eid));
        }
    }

    // 添加员工姓名过滤条件
    println!("the employee name is:{:?}", employee_name);
    if let Some(name) = employee_name {
        if !name.is_empty() {
            sql.push_str(&format!(" AND e.name LIKE '%{}%' ", name));
        }
    }

    // 添加删除标志过滤条件
    sql.push_str(" AND s.delete_flag = 0");

    sql.push_str(" ORDER BY s.month DESC, s.employee_id");
    // 添加分页
    if let (Some(page), Some(page_size)) = (page, page_size) {
        let offset = (page - 1) * page_size;
        sql.push_str(&format!(" LIMIT {} OFFSET {}", page_size, offset));
    }
    println!("the sql is:{:?}", sql);
    let mut stmt = conn
        .prepare(&sql)
        .map_err(|e| format!("准备查询失败: {}", e))?;
    let rows = stmt
        .query_map([], |row| {
            Ok(SalaryShowRecord {
                id: row.get::<_, i32>(0)?,
                employee_id: row.get::<_, String>(1)?,
                employee_name: row.get::<_, String>(2)?,
                department: row
                    .get::<_, Option<String>>(3)?
                    .unwrap_or_else(|| "-".to_string()),
                project_id: row.get::<_, i32>(4)?,
                basic_salary: row.get::<_, f64>(5)?,
                housing_alw: row.get::<_, f64>(6)?,
                position_alw: row.get::<_, f64>(7)?,
                field_alw: row.get::<_, f64>(8)?,
                fix_alw: row.get::<_, f64>(9)?,
                jmstk_alw: row.get::<_, f64>(10)?,
                pension_alw: row.get::<_, f64>(11)?,
                meal_alw: row.get::<_, f64>(12)?,
                transp_alw: row.get::<_, f64>(13)?,
                tax_alw_salary: row.get::<_, f64>(14)?,
                tax_alw_phk: row.get::<_, f64>(15)?,
                comp_phk: row.get::<_, f64>(16)?,
                askes_bpjs_alw: row.get::<_, f64>(17)?,
                med_alw: row.get::<_, f64>(18)?,
                pulsa_alw: row.get::<_, f64>(19)?,
                others: row.get::<_, f64>(20)?,
                att_alw: row.get::<_, f64>(21)?,
                housing_alw_tetap: row.get::<_, f64>(22)?,
                religious_alw: row.get::<_, f64>(23)?,
                rapel_basic_salary: row.get::<_, f64>(24)?,
                rapel_jmstk_alw: row.get::<_, f64>(25)?,
                incentive_alw: row.get::<_, f64>(26)?,
                acting: row.get::<_, f64>(27)?,
                performance_alw: row.get::<_, f64>(28)?,
                trip_alw: row.get::<_, f64>(29)?,
                correct_add: row.get::<_, f64>(30)?,
                correct_sub: row.get::<_, f64>(31)?,
                leav_comp: row.get::<_, f64>(32)?,
                total_accept: row.get::<_, f64>(33)?,
                jmstk_fee: row.get::<_, f64>(34)?,
                pension_ded: row.get::<_, f64>(35)?,
                tax_ded_salary: row.get::<_, f64>(36)?,
                tax_ded_phk: row.get::<_, f64>(37)?,
                askes_bpjs_ded: row.get::<_, f64>(38)?,
                incentive_ded: row.get::<_, f64>(39)?,
                loan_ded: row.get::<_, f64>(40)?,
                absent_ded: row.get::<_, f64>(41)?,
                net_accept: row.get::<_, f64>(42)?,
                round_off_salary: row.get::<_, f64>(43)?,
                create_time: row.get::<_, String>(44)?,
                update_time: row.get::<_, String>(45)?,
                month: row.get::<_, String>(46)?,
                tax_type: row.get::<_, String>(47)?,
                salary_slip_status: row.get::<_, String>(48)?,
                npwp: row.get::<_, String>(49)?,
                location_name: row.get::<_, String>(50)?,
                join_date: row.get::<_, String>(51)?,
                id_card: row.get::<_, String>(52)?,
                hierarchy_id: row.get::<_, String>(53)?,
                hierarchy_name: row.get::<_, String>(54)?,
                resign_date: row.get::<_, String>(55)?,
                position: row.get::<_, String>(56)?,
                work: row.get::<_, i32>(57)?,
                off: row.get::<_, i32>(58)?,
                sick: row.get::<_, i32>(59)?,
                absent: row.get::<_, i32>(60)?,
                annualleave: row.get::<_, i32>(61)?,
                permission: row.get::<_, i32>(62)?,
                ew: row.get::<_, f64>(63)?,
                total_net_wages: row.get::<_, f64>(64)?,
                standby: row.get::<_, i32>(65)?,
                pulsa_alw_month: row.get::<_, f64>(66)?,
                mandah_alw: row.get::<_, f64>(67)?,
                ew1: row.get::<_, f64>(68)?,
                ew2: row.get::<_, f64>(69)?,
                ew3: row.get::<_, f64>(70)?,
                unpresent: row.get::<_, f64>(71)?,
                ot1_hour: row.get::<_, f64>(72)?,
                ew1_hour: row.get::<_, f64>(73)?,
                ew2_hour: row.get::<_, f64>(74)?,
                ew3_hour: row.get::<_, f64>(75)?,
                ew1_wages: row.get::<_, f64>(76)?,
                ew2_wages: row.get::<_, f64>(77)?,
                ew3_wages: row.get::<_, f64>(78)?,
                is_calculate: row.get::<_, i32>(79)?,
                ot1: row.get::<_, f64>(80)?,
                ot1_wages: row.get::<_, f64>(81)?,
                ot2_wages: row.get::<_, f64>(82)?,
                ot3_wages: row.get::<_, f64>(83)?,
                absent_ded2: row.get::<_, f64>(84)?,
                leave_comp: row.get::<_, f64>(85)?,
                // rapel_jmstk_alw: row.get::<_, f64>(86)?,
            })
        })
        .map_err(|e| format!("执行查询失败: {}", e))?;

    let mut salaries = Vec::new();
    for salary_result in rows {
        salaries.push(salary_result.map_err(|e| format!("读取记录失败: {}", e))?);
    }
    // 查询总记录数
    let mut count_sql = String::from("SELECT COUNT(*) FROM salary s INNER JOIN employees e ON s.employee_id = e.employee_id INNER JOIN attendance as a on s.employee_id = a.employee_id WHERE 1=1");

    // 添加月份过滤条件
    if let Some(m) = month {
        count_sql.push_str(&format!(" AND s.month LIKE '{}' AND a.month LIKE '{}' ", m, m));
    }

    // 添加项目ID过滤条件
    if let Some(pid) = project_id {
        if pid != "all" {
            count_sql.push_str(&format!(" AND e.project_id = {}", pid.parse::<i32>().unwrap_or(0)));
        }
    }

    // 添加员工ID过滤条件
    if let Some(eid) = employee_id {
        if !eid.is_empty() {
            count_sql.push_str(&format!(" AND s.employee_id LIKE '{}' ", eid));
        }
    }

    // 添加员工姓名过滤条件
    if let Some(name) = employee_name {
        if !name.is_empty() {
            count_sql.push_str(&format!(" AND e.name LIKE '%{}%' ", name));
        }
    }

    // 添加删除标志过滤条件
    count_sql.push_str(" AND s.delete_flag = 0");

    let total: i64 = conn
        .query_row(
            &count_sql,
            [],
            |row| row.get(0),
        )
        .map_err(|e| format!("查询总记录数失败: {}", e))?;
    // 构建包含数据和总记录数的JSON响应
    let response = serde_json::json!({
        "data": salaries,
        "total": total
    });
    Ok(response)
}

// 单条薪资记录导入API
#[tauri::command]
pub async fn import_single_salary_record(req: SalaryImportRequest) -> Result<String, String> {
    let mut conn = connect_database()?;

    // 首先验证员工是否存在（在事务外执行以避免借用问题）
    let check_employee_sql = "SELECT employee_id FROM employees WHERE employee_id = ?";
    let mut conn_pre = conn
        .prepare(check_employee_sql)
        .map_err(|e| format!("准备员工验证查询失败: {}", e))?;
    let employee_exists: Option<String> = conn_pre
        .query_row([&req.employee_id], |row| row.get(0))
        .ok();
    drop(conn_pre); // 立即释放借用

    if employee_exists.is_none() {
        return Err(format!("员工ID {} 不存在", req.employee_id));
    }

    // 开始事务
    let mut tx = conn
        .transaction()
        .map_err(|e| format!("开始事务失败: {}", e))?;

    // 检查是否已存在记录
    let check_sql = "SELECT id FROM salary WHERE employee_id = ? AND month = ?";
    let mut check_stmt = tx
        .prepare(check_sql)
        .map_err(|e| format!("准备查询失败: {}", e))?;
    let record_exists = check_stmt
        .query_row([&req.employee_id, &req.month], |row| {
            row.get::<_, Option<i32>>(0)
        })
        .ok()
        .flatten()
        .is_some();
    drop(check_stmt); // 立即释放借用

    let result = if record_exists {
        // 更新现有记录
        update_salary_record(
            &mut tx,
            &req.employee_id,
            &req.project_id,
            &req.month,
            &req.data,
        )?;
        format!("员工 {} 的薪资记录已更新", req.employee_id)
    } else {
        // 插入新记录
        insert_salary_record(
            &mut tx,
            &req.employee_id,
            &req.project_id,
            &req.month,
            &req.data,
        )?;
        format!("员工 {} 的薪资记录已插入", req.employee_id)
    };

    // 提交事务
    tx.commit().map_err(|e| format!("提交事务失败: {}", e))?;

    Ok(result)
}

// 批量薪资记录导入API
#[tauri::command]
pub async fn import_salary_records(
    project_id: i32,
    month: String,
    records: Vec<HashMap<String, String>>,
) -> Result<String, String> {
    println!("the salary record project_id33333333: {}", project_id);

    let mut conn = connect_database()?;
    println!("the salary record project_id: {}", project_id);
    // 开始事务
    let mut tx: rusqlite::Transaction<'_> = conn
        .transaction()
        .map_err(|e| format!("开始事务失败: {}", e))?;

    let mut success_count = 0;
    let mut error_count = 0;
    let mut error_messages = Vec::new();
    for (index, record) in records.iter().enumerate() {
        // 获取员工ID
        if let Some(employee_id) = record.get("employee_id") {
            // 验证员工是否存在 - 在事务外执行查询以避免借用冲突
            let check_employee_sql = "SELECT employee_id FROM employees WHERE employee_id = ?";
            let mut check_employee_stmt = match tx.prepare(check_employee_sql) {
                Ok(stmt) => stmt,
                Err(e) => {
                    error_count += 1;
                    error_messages.push(format!("行 {}: 准备员工验证查询失败: {}", index + 2, e));
                    continue;
                }
            };

            let employee_exists =
                match check_employee_stmt.query_row([employee_id], |row| row.get::<_, String>(0)) {
                    Ok(_) => true,
                    Err(_) => false,
                };

            // 显式删除语句以释放借用
            drop(check_employee_stmt);

            if employee_exists {
                // 检查是否已存在记录
                let check_sql = "SELECT id FROM salary WHERE employee_id = ? AND month = ?";
                let mut check_stmt = match tx.prepare(check_sql) {
                    Ok(stmt) => stmt,
                    Err(e) => {
                        error_count += 1;
                        error_messages.push(format!("行 {}: 准备查询失败: {}", index + 2, e));
                        continue;
                    }
                };

                let record_exists = match check_stmt
                    .query_row([employee_id, &month], |row| row.get::<_, Option<i32>>(0))
                {
                    Ok(Some(_)) => true,
                    _ => false,
                };

                // 显式删除语句以释放借用
                drop(check_stmt);

                // 直接使用可变引用
                let project_id_str = &project_id.to_string();
                if record_exists {
                    // 更新现有记录
                    println!(
                        "更新现有记录, employee_id: {}, project_id: {}, month: {}",
                        employee_id, project_id_str, &month
                    );
                    if let Err(err) =
                        update_salary_record(&mut tx, employee_id, project_id_str, &month, record)
                    {
                        error_count += 1;
                        error_messages.push(format!(
                            "行 {} (员工 {}): {}",
                            index + 2,
                            employee_id,
                            err
                        ));
                    } else {
                        success_count += 1;
                    }
                } else {
                    // 插入新记录
                    if let Err(err) =
                        insert_salary_record(&mut tx, employee_id, project_id_str, &month, record)
                    {
                        error_count += 1;
                        error_messages.push(format!(
                            "行 {} (员工 {}): {}",
                            index + 2,
                            employee_id,
                            err
                        ));
                    } else {
                        success_count += 1;
                    }
                }
            } else {
                error_count += 1;
                error_messages.push(format!("行 {}: 员工ID {} 不存在", index + 2, employee_id));
            }
        } else {
            error_count += 1;
            error_messages.push(format!("行 {}: 缺少员工ID", index + 2));
        }
    }

    // 根据结果提交或回滚事务
    if error_count > 0 {
        tx.rollback().map_err(|e| format!("回滚事务失败: {}", e))?;
        let mut result = format!("导入失败，共 {} 条记录错误:\n", error_count);
        result.push_str(&error_messages.join("\n"));
        return Err(result);
    } else {
        tx.commit().map_err(|e| format!("提交事务失败: {}", e))?;
        return Ok(format!("成功导入 {} 条薪资记录", success_count));
    }
}

// 更新薪资记录的辅助函数
fn update_salary_record(
    conn: &mut rusqlite::Transaction,
    employee_id: &str,
    project_id: &str,
    month: &str,
    data: &HashMap<String, String>,
) -> Result<bool, String> {
    // 构建动态更新SQL
    let mut update_fields = Vec::new();
    let mut update_params: Vec<Box<dyn ToSql>> = Vec::new();
    // 将project_id转为i32
    let project_id = project_id
        .parse::<i32>()
        .map_err(|e| format!("项目ID转换失败: {}", e))?;
    // 遍历数据，构建更新字段和参数
    let salary_fields = [
        "basic_salary",
        "housing_alw",
        "position_alw",
        "field_alw",
        "fix_alw",
        "jmstk_alw",
        "pension_alw",
        "meal_alw",
        "transp_alw",
        "tax_alw_salary",
        "tax_alw_phk",
        "comp_phk",
        "askes_bpjs_alw",
        "med_alw",
        "pulsa_alw",
        "others",
        "att_alw",
        "housing_alw_tetap",
        "religious_alw",
        "rapel_basic_salary",
        "rapel_jmstk_alw",
        "incentive_alw",
        "acting",
        "performance_alw",
        "trip_alw",
        "ot1_wages",
        "total_net_wages",
        "total_accept",
        "jmstk_fee",
        "pension_ded",
        "tax_ded_salary",
        "tax_ded_phk",
        "askes_bpjs_ded",
        "incentive_ded",
        "loan_ded",
        "absent_ded",
        "net_accept",
        "round_off_salary",
        "correct_add",
        "correct_sub",
        "absent_ded2",
        "pulsa_alw_month",
    ];

    for field in &salary_fields {
        if let Some(value) = data.get(*field) {
            if !value.is_empty() {
                update_fields.push(format!("{} = ?", field));
                // value值中有科学计数法带入的逗号，需要去掉，尝试将值解析为f64，如果失败则设为0.0
                let cleaned_value = value.replace(',', "");
                let num_value: f64 = cleaned_value.parse().unwrap_or(0.0);
                update_params.push(Box::new(num_value) as Box<dyn ToSql>);
            }
        }
    }

    // 添加固定字段
    update_fields.push("project_id = ?".to_string());
    update_params.push(Box::new(project_id) as Box<dyn ToSql>);

    // 添加更新时间
    update_fields.push("update_time = ?".to_string());
    update_params.push(
        Box::new(chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string()) as Box<dyn ToSql>,
    );

    // 添加WHERE条件参数
    update_params.push(Box::new(employee_id.to_string()) as Box<dyn ToSql>);
    update_params.push(Box::new(month.to_string()) as Box<dyn ToSql>);

    update_params.push(Box::new(project_id.to_string()) as Box<dyn ToSql>);

    // 构建完整的更新SQL
    let update_sql = format!(
        "UPDATE salary SET {}
        WHERE employee_id = ? AND month = ? AND project_id = ?",
        update_fields.join(", ")
    );
    println!("update_sql: {}", update_sql);

    // 确保参数顺序正确匹配SQL语句中的占位符
    // 前N个参数是SET子句的，接着是WHERE子句的三个参数(employee_id, month, project_id)

    // 执行更新
    let mut stmt = conn
        .prepare(&update_sql)
        .map_err(|e| format!("准备更新失败: {}", e))?;
    stmt.execute(rusqlite::params_from_iter(update_params))
        .map_err(|e| format!("执行更新失败: {}", e))?;

    Ok(true)
}

// 获取薪资汇总
#[tauri::command]
pub async fn get_salary_summary() -> Result<f64, String> {
    // 连接数据库
    let mut conn = connect_database()?;

    // 查询salary表中round_off_salary字段的总和
    let sql = "SELECT COALESCE(SUM(round_off_salary), 0) as total FROM salary WHERE round_off_salary IS NOT NULL AND round_off_salary != ''";

    let total: f64 = conn
        .query_row(sql, [], |row| row.get(0))
        .map_err(|e| format!("查询薪资汇总失败: {}", e))?;

    Ok(total)
}

// 更新薪资记录计算状态
#[tauri::command]
pub async fn update_calculate_status(
    id: String,
    is_calculate: String,
    isCalculate: String,
) -> Result<String, String> {
    // 连接数据库
    println!(
        "id: {}, is_calculate: {}, isCalculate: {}",
        id, is_calculate, isCalculate
    );
    let mut conn = connect_database()?;

    // 开启事务
    let tx = conn
        .transaction()
        .map_err(|e| format!("开启事务失败: {}", e))?;

    // 执行更新
    let update_sql = "UPDATE salary SET is_calculate = ?, update_time = ? WHERE id = ?";
    let current_time = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    let rows_affected = tx
        .execute(update_sql, params![is_calculate, current_time, id])
        .map_err(|e| format!("更新计算状态失败: {}", e))?;

    // 提交事务
    tx.commit().map_err(|e| format!("提交事务失败: {}", e))?;

    if rows_affected > 0 {
        Ok("计算状态更新成功".to_string())
    } else {
        Err("未找到匹配的薪资记录".to_string())
    }
}

// 逻辑删除薪资记录
#[tauri::command]
pub async fn delete_salary_record(id: String) -> Result<String, String> {
    // 连接数据库
    let mut conn = connect_database()?;

    // 开启事务
    let tx = conn
        .transaction()
        .map_err(|e| format!("开启事务失败: {}", e))?;

    // 执行逻辑删除
    let update_sql = "UPDATE salary SET delete_flag = 1, update_time = ? WHERE id = ?";
    let current_time = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    let rows_affected = tx
        .execute(update_sql, params![current_time, id])
        .map_err(|e| format!("删除薪资记录失败: {}", e))?;

    // 提交事务
    tx.commit().map_err(|e| format!("提交事务失败: {}", e))?;

    if rows_affected > 0 {
        Ok("薪资记录删除成功".to_string())
    } else {
        Err("未找到匹配的薪资记录".to_string())
    }
}

// 插入薪资记录的辅助函数
fn insert_salary_record(
    conn: &mut rusqlite::Transaction,
    employee_id: &str,
    project_id: &str,
    month: &str,
    data: &HashMap<String, String>,
) -> Result<bool, String> {
    // 获取员工基本信息
    let get_employee_sql = "SELECT name, department,  tax_type, npwp, location_name, join_date, basic_salary FROM employees WHERE employee_id = ?";
    let mut get_employee_stmt = conn
        .prepare(get_employee_sql)
        .map_err(|e| format!("准备获取员工信息失败: {}", e))?;

    let (name, department, tax_type, npwp, location_name, join_date, basic_salary): (
        String,
        String,
        String,
        String,
        String,
        String,
        f64,
    ) = get_employee_stmt
        .query_row([employee_id], |row| {
            Ok((
                row.get(0)?,
                row.get(1)?,
                row.get(2)?,
                row.get(3)?,
                row.get(4)?,
                row.get(5)?,
                row.get(6)?,
            ))
        })
        .map_err(|e| format!("获取员工信息失败: {}", e))?;

    // 构建插入SQL
    let sql = "INSERT INTO salary (
        employee_id, project_id,month,basic_salary,housing_alw, position_alw, field_alw,
        fix_alw, jmstk_alw, pension_alw, meal_alw, transp_alw, tax_alw_salary, tax_alw_phk,
        comp_phk,med_alw, pulsa_alw, others, att_alw, housing_alw_tetap,
        religious_alw, rapel_basic_salary, rapel_jmstk_alw, incentive_alw, acting, performance_alw,
        trip_alw, ot1_wages, total_net_wages, total_accept, jmstk_fee, pension_ded, tax_ded_salary,
        tax_ded_phk, askes_bpjs_ded, incentive_ded, loan_ded, absent_ded, net_accept,
        round_off_salary,correct_add, correct_sub, absent_ded2, pulsa_alw_month, askes_bpjs_alw, 
        ot1_hour, ot1_wages, ew1_hour, ew1_wages, ew2_hour, ew2_wages, ew3_hour, ew3_wages,is_calculate
    ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19,
        ?20, ?21, ?22, ?23, ?24, ?25, ?26, ?27, ?28, ?29, ?30, ?31, ?32, ?33, ?34, ?35, ?36, ?37,
        ?38, ?39, ?40, ?41, ?42, ?43, ?44, ?45, ?46, ?47, ?48, ?49, ?50, ?51,?52,?53,?54)";

    let mut stmt = conn
        .prepare(sql)
        .map_err(|e| format!("准备插入失败: {}", e))?;

    // 解析薪资数据
    let get_field_value = |field: &str, default: f64| {
        data.get(field)
            .and_then(|v| v.parse::<f64>().ok())
            .unwrap_or(default)
    };

    // 执行插入
    stmt.execute(params![
        employee_id, // 1
        project_id,  // 2
        month,       // 3
        get_field_value("basic_salary", 0.0),
        get_field_value("housing_alw", 0.0),
        get_field_value("position_alw", 0.0),
        get_field_value("field_alw", 0.0),
        get_field_value("fix_alw", 0.0),
        get_field_value("jmstk_alw", 0.0),
        get_field_value("pension_alw", 0.0),
        get_field_value("meal_alw", 0.0),
        get_field_value("transp_alw", 0.0),
        get_field_value("tax_alw_salary", 0.0),
        get_field_value("tax_alw_phk", 0.0),
        get_field_value("comp_phk", 0.0),
        get_field_value("med_alw", 0.0),
        get_field_value("pulsa_alw", 0.0),
        get_field_value("others", 0.0),
        get_field_value("att_alw", 0.0),
        get_field_value("housing_alw_tetap", 0.0),
        get_field_value("religious_alw", 0.0),
        get_field_value("rapel_basic_salary", 0.0),
        get_field_value("rapel_jmstk_alw", 0.0),
        get_field_value("incentive_alw", 0.0),
        get_field_value("acting", 0.0),
        get_field_value("performance_alw", 0.0),
        get_field_value("trip_alw", 0.0),
        get_field_value("ot1_wages", 0.0),
        get_field_value("total_net_wages", 0.0),
        get_field_value("total_accept", 0.0),
        get_field_value("jmstk_fee", 0.0),
        get_field_value("pension_ded", 0.0),
        get_field_value("tax_ded_salary", 0.0),
        get_field_value("tax_ded_phk", 0.0),
        get_field_value("askes_bpjs_ded", 0.0),
        get_field_value("incentive_ded", 0.0),
        get_field_value("loan_ded", 0.0),
        get_field_value("absent_ded", 0.0),
        get_field_value("net_accept", 0.0),
        get_field_value("round_off_salary", 0.0),
        get_field_value("correct_add", 0.0),
        get_field_value("correct_sub", 0.0),
        get_field_value("absent_ded2", 0.0),
        get_field_value("pulsa_alw_month", 0.0),
        get_field_value("askes_bpjs_alw", 0.0),
        get_field_value("ot1_hour", 0.0),
        get_field_value("ot1_wages", 0.0),
        get_field_value("ew1_hour", 0.0),
        get_field_value("ew1_wages", 0.0),
        get_field_value("ew2_hour", 0.0),
        get_field_value("ew2_wages", 0.0),
        get_field_value("ew3_hour", 0.0),
        get_field_value("ew3_wages", 0.0),
        0, // is_calculate 导入时，不参与计算
    ])
    .map_err(|e| format!("执行插入失败: {}", e))?;

    Ok(true)
}

// #[tauri::command]
// pub fn get_totalSalaries(month: Option<String>, project_id: Option<u32>) -> Result<f64, String> {
//     let conn = establish_connection().map_err(|e| e.to_string())?;

//     let (sql, params) = match (month, project_id) {
//         (Some(month_val), Some(project_id_val)) => {
//             ("SELECT SUM(round_off_salary) FROM salary WHERE month = ? AND project_id = ?",
//              [month_val as &dyn ToSql, project_id_val as &dyn ToSql])
//         },
//         (Some(month_val), None) => {
//             ("SELECT SUM(round_off_salary) FROM salary WHERE month = ?",
//              [month_val as &dyn ToSql])
//         },
//         (None, Some(project_id_val)) => {
//             ("SELECT SUM(round_off_salary) FROM salary WHERE project_id = ?",
//              [project_id_val as &dyn ToSql])
//         },
//         (None, None) => {
//             ("SELECT SUM(round_off_salary) FROM salary", [])
//         }
//     };

//     let result: f64 = conn.query_row(sql, &params, |row| row.get(0)).map_err(|e| {
//         format!("查询错误: {}", e)
//     })?;

//     Ok(result)
// }

// 通用函数：将JSON值转换为字符串
fn json_to_string(value: Option<&Value>) -> String {
    match value {
        Some(Value::String(s)) => s.clone(),
        Some(Value::Number(n)) => n.to_string(),
        _ => "-".to_string(),
    }
}
