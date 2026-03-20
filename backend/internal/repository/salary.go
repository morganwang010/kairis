package repository

import (
	"kairis/backend/internal/model"
	"log/slog"
	"time"

	"gorm.io/gorm"
)

type SalaryRepository struct {
	db *gorm.DB
}

type AttendanceWithEmployee struct {
	model.Attendances
	// model.Employee

	EmployeeName    string  `gorm:"column:employee_name" json:"employee_name"`
	BasicSalary     float64 `gorm:"column:basic_salary" json:"basic_salary"`
	Department      string  `gorm:"column:department" json:"department"`
	IdCard          string  `gorm:"column:id_card" json:"id_card"`
	HierarchyID     string  `gorm:"column:hierarchy_id" json:"hierarchy_id"`
	HierarchyName   string  `gorm:"column:hierarchy_name" json:"hierarchy_name"`
	Position        string  `gorm:"column:position" json:"position"`
	ResignDate      string  `gorm:"column:resign_date" json:"resign_date"`
	Email           string  `gorm:"column:email" json:"email"`
	FieldAlw        float64 `gorm:"column:field_alw" json:"field_alw"`
	HousingAlw      float64 `gorm:"column:housing_alw" json:"housing_alw"`
	PositionAlw     float64 `gorm:"column:position_alw" json:"position_alw"`
	FixAlw          float64 `gorm:"column:fix_alw"`
	MealAlwDay      float64 `gorm:"column:meal_alw_day" json:"meal_alw_day"`
	TranspAlwDay    float64 `gorm:"column:transp_alw_day" json:"transp_alw_day"`
	PulsaAlwDay     float64 `gorm:"column:pulsa_alw_day" json:"pulsa_alw_day"`
	AttAlwDay       float64 `gorm:"column:att_alw_day" json:"att_alw_day"`
	TaxType         string  `gorm:"column:tax_type" json:"tax_type"`
	Npwp            string  `gorm:"column:npwp" json:"npwp"`
	LocationName    string  `gorm:"column:location_name" json:"location_name"`
	JoinDate        string  `gorm:"column:join_date" json:"join_date"`
	PulsaAlwMonth   float64 `gorm:"column:pulsa_alw_month" json:"pulsa_alw_month"`
	HousingAlwTetap float64 `gorm:"column:housing_alw_tetap" json:"housing_alw_tetap"`
	LeaveComp       float64 `gorm:"column:leave_comp" json:"leave_comp"`
}

type AttendanceWithEmployeeAndIncident struct {
	AttendanceWithEmployee
	LeaveComp        float64   `gorm:"column:leave_comp" json:"leave_comp"`
	MedAlw           float64   `gorm:"column:med_alw" json:"med_alw"`
	Others           float64   `gorm:"column:others" json:"others"`
	ReligiousAlw     float64   `gorm:"column:religious_alw" json:"religious_alw"`
	RapelBasicSalary float64   `gorm:"column:rapel_basic_salary" json:"rapel_basic_salary"`
	RapelJmstkAlw    float64   `gorm:"column:rapel_jmstk_alw" json:"rapel_jmstk_alw"`
	IncentiveAlw     float64   `gorm:"column:incentive_alw" json:"incentive_alw"`
	Acting           float64   `gorm:"column:acting" json:"acting"`
	PerformanceAlw   float64   `gorm:"column:performance_alw" json:"performance_alw"`
	TripAlw          float64   `gorm:"column:trip_alw" json:"trip_alw"`
	Ot2Wages         float64   `gorm:"column:ot2_wages" json:"ot2_wages"`
	Ot3Wages         float64   `gorm:"column:ot3_wages" json:"ot3_wages"`
	CompPhk          float64   `gorm:"column:comp_phk" json:"comp_phk"`
	TaxAlwPhk        float64   `gorm:"column:tax_alw_phk" json:"tax_alw_phk"`
	AbsentDed        float64   `gorm:"column:absent_ded" json:"absent_ded"`
	AbsentDed2       float64   `gorm:"column:absent_ded2" json:"absent_ded2"`
	IncentiveDed     float64   `gorm:"column:incentive_ded" json:"incentive_ded"`
	LoanDed          float64   `gorm:"column:loan_ded" json:"loan_ded"`
	TaxDedPhk        float64   `gorm:"column:tax_ded_phk" json:"tax_ded_phk"`
	CorrectAdd       float64   `gorm:"column:correct_add" json:"correct_add"`
	CorrectSub       float64   `gorm:"column:correct_sub" json:"correct_sub"`
	MandahAlw        float64   `gorm:"column:mandah_alw" json:"mandah_alw"`
	MealAlwDay       float64   `gorm:"column:meal_alw_day" json:"meal_alw_day"`
	TranspAlwDay     float64   `gorm:"column:transp_alw_day" json:"transp_alw_day"`
	PulsaAlwDay      float64   `gorm:"column:pulsa_alw_day" json:"pulsa_alw_day"`
	AttAlwDay        float64   `gorm:"column:att_alw_day" json:"att_alw_day"`
	TaxType          string    `gorm:"column:tax_type" json:"tax_type"`
	Npwp             string    `gorm:"column:npwp" json:"npwp"`
	LocationName     string    `gorm:"column:location_name" json:"location_name"`
	JoinDate         string    `gorm:"column:join_date" json:"join_date"`
	PulsaAlwMonth    float64   `gorm:"column:pulsa_alw_month" json:"pulsa_alw_month"`
	DeleteFlag       int       `gorm:"column:delete_flag" json:"delete_flag"`
	Month            string    `gorm:"column:month;not null" json:"month"`
	ProjectID        int       `gorm:"column:project_id;default:0" json:"project_id"`
	EmployeeID       string    `gorm:"column:employee_id;not null" json:"employee_id"`
	TaxStatus        float64   `gorm:"column:tax_status;default:0" json:"tax_status"`
	BasicSalary      float64   `gorm:"column:basic_salary;default:0.00" json:"basic_salary"`
	HousingAlw       float64   `gorm:"column:housing_alw;default:0.00" json:"housing_alw"`
	PositionAlw      float64   `gorm:"column:position_alw;default:0.00" json:"position_alw"`
	FieldAlw         float64   `gorm:"column:field_alw;default:0.00" json:"field_alw"`
	FixAlw           float64   `gorm:"column:fix_alw;default:0.00" json:"fix_alw"`
	JmstkAlw         float64   `gorm:"column:jmstk_alw;default:0.00" json:"jmstk_alw"`
	PensionAlw       float64   `gorm:"column:pension_alw;default:0.00" json:"pension_alw"`
	MealAlw          float64   `gorm:"column:meal_alw;default:0.00" json:"meal_alw"`
	TranspAlw        float64   `gorm:"column:transp_alw;default:0.00" json:"transp_alw"`
	TaxAlwSalary     float64   `gorm:"column:tax_alw_salary;default:0.00" json:"tax_alw_salary"`
	AskesBpjsAlw     float64   `gorm:"column:askes_bpjs_alw;default:0.00" json:"askes_bpjs_alw"`
	PulsaAlw         float64   `gorm:"column:pulsa_alw;default:0.00" json:"pulsa_alw"`
	AttAlw           float64   `gorm:"column:att_alw;default:0.00" json:"att_alw"`
	HousingAlwTetap  float64   `gorm:"column:housing_alw_tetap;default:0.00" json:"housing_alw_tetap"`
	Ot1Wages         float64   `gorm:"column:ot1_wages;default:0.00" json:"ot1_wages"`
	Ot1Hour          float64   `gorm:"column:ot1_hour;default:0.00" json:"ot1_hour"`
	Ew1Hour          float64   `gorm:"column:ew1_hour;default:0.00" json:"ew1_hour"`
	Ew1Wages         float64   `gorm:"column:ew1_wages;default:0.00" json:"ew1_wages"`
	Ew2Hour          float64   `gorm:"column:ew2_hour;default:0.00" json:"ew2_hour"`
	Ew2Wages         float64   `gorm:"column:ew2_wages;default:0.00" json:"ew2_wages"`
	Ew3Hour          float64   `gorm:"column:ew3_hour;default:0.00" json:"ew3_hour"`
	Ew3Wages         float64   `gorm:"column:ew3_wages;default:0.00" json:"ew3_wages"`
	TotalAccept      float64   `gorm:"column:total_accept;default:0.00" json:"total_accept"`
	JmstkFee         float64   `gorm:"column:jmstk_fee;default:0.00" json:"jmstk_fee"`
	PensionDed       float64   `gorm:"column:pension_ded;default:0.00" json:"pension_ded"`
	TaxDedSalary     float64   `gorm:"column:tax_ded_salary;default:0.00" json:"tax_ded_salary"`
	AskesBpjsDed     float64   `gorm:"column:askes_bpjs_ded;default:0.00" json:"askes_bpjs_ded"`
	NetAccept        float64   `gorm:"column:net_accept;default:0.00" json:"net_accept"`
	RoundOffSalary   float64   `gorm:"column:round_off_salary;default:0.00" json:"round_off_salary"`
	CreateTime       time.Time `gorm:"column:create_time;default:CURRENT_TIMESTAMP" json:"create_time"`
	UpdateTime       time.Time `gorm:"column:update_time;default:CURRENT_TIMESTAMP;autoUpdateTime" json:"update_time"`
	TotalNetWages    float64   `gorm:"column:total_net_wages;default:0.00" json:"total_net_wages"`
	SalarySlipStatus string    `gorm:"column:salary_slip_status;default:'0'" json:"salary_slip_status"`
	IsCalculate      int       `gorm:"column:is_calculate;default:1" json:"is_calculate"`
}

func NewSalaryRepository(db *gorm.DB) *SalaryRepository {
	return &SalaryRepository{db: db}
}

func (r *SalaryRepository) Create(salary *model.Salaries) error {
	return r.db.Create(salary).Error
}

func (r *SalaryRepository) Get(id uint) (*model.Salaries, error) {
	var salary model.Salaries
	if err := r.db.First(&salary, id).Error; err != nil {
		return nil, err
	}
	return &salary, nil
}

func (r *SalaryRepository) List(month string, projectID int) ([]AttendanceWithEmployeeAndIncident, error) {
	var salaries []AttendanceWithEmployeeAndIncident
	if err := r.db.Table("salaries as s").
		Select(`s.*, e.employee_name, e.basic_salary, e.department, e.field_alw, e.housing_alw, e.position_alw, e.fix_alw, e.meal_alw_day, e.transp_alw_day, e.pulsa_alw_day, e.att_alw_day, e.tax_type, e.npwp, e.location_name, e.join_date, e.pulsa_alw_month, e.housing_alw_tetap, ir.leave_comp, ir.med_alw, ir.others, ir.religious_alw, ir.rapel_basic_salary, ir.rapel_jmstk_alw, ir.incentive_alw, ir.acting, ir.performance_alw, ir.trip_alw, ir.ot2_wages, ir.ot3_wages, ir.comp_phk, ir.tax_alw_phk, ir.absent_ded2, ir.incentive_ded, ir.loan_ded, ir.tax_ded_phk, ir.correct_add, ir.correct_sub, ir.mandah_alw, a.work, a.off, a.ot1, a.ew1, a.ew2, a.ew3, a.ew, a.unpresent,a.sick,a.standby,a.leave_replc,e.id_card,e.hierarchy_id,e.hierarchy_name,e.position,e.email,a.permission`).
		Joins("LEFT JOIN attendances as a ON s.employee_id = a.employee_id AND s.month = a.month").
		Joins("LEFT JOIN employees as e ON s.employee_id = e.employee_id").
		Joins("LEFT JOIN incidents as ir ON s.employee_id = ir.employee_id AND s.month = ir.month").
		Where("s.month = ? AND s.project_id = ? AND s.delete_flag = 0", month, projectID).
		Find(&salaries).Error; err != nil {
		return nil, err
	}
	return salaries, nil
}

func (r *SalaryRepository) Update(salary *model.Salaries) error {
	return r.db.Save(salary).Error
}

func (r *SalaryRepository) Delete(id uint) error {
	return r.db.Delete(&model.Salaries{}, id).Error
}

func (r *SalaryRepository) Calculate(month string, projectID int) error {
	// 1. 从salary_coefficient表获取计算系数
	var coefficient model.SalaryCoefficient
	if err := r.db.Where("is_delete = 0").First(&coefficient).Error; err != nil {
		return err
	}

	// 2. 从project表获取项目的askes_alw_by_nation系数
	var project model.Project
	if err := r.db.First(&project, projectID).Error; err != nil {
		return err
	}
	askesAlwByNation := float64(project.AskesAlw)

	// 3. 获取考勤记录和员工信息

	var attendanceRecords []AttendanceWithEmployeeAndIncident
	if err := r.db.Table("attendances as a").
		Select(`a.*, e.employee_name, e.basic_salary, e.department, e.field_alw, e.housing_alw, e.position_alw, e.fix_alw, e.meal_alw_day, e.transp_alw_day, e.pulsa_alw_day, e.att_alw_day, e.tax_type, e.npwp, e.location_name, e.join_date, e.pulsa_alw_month, e.housing_alw_tetap, ir.leave_comp, ir.med_alw, ir.others, ir.religious_alw, ir.rapel_basic_salary, ir.rapel_jmstk_alw, ir.incentive_alw, ir.acting, ir.performance_alw, ir.trip_alw, ir.ot2_wages, ir.ot3_wages, ir.comp_phk, ir.tax_alw_phk, ir.absent_ded2, ir.incentive_ded, ir.loan_ded, ir.tax_ded_phk, ir.correct_add, ir.correct_sub, ir.mandah_alw`).
		Joins("LEFT JOIN employees as e ON a.employee_id = e.employee_id").
		Joins("LEFT JOIN incidents as ir ON a.employee_id = ir.employee_id AND a.month = ir.month").
		Where("a.month = ? AND a.project_id = ?", month, projectID).
		Find(&attendanceRecords).Error; err != nil {
		return err
	}

	// 4. 计算薪资并更新或插入记录
	for _, record := range attendanceRecords {
		// 计算总补助
		totalAlw := record.FieldAlw + record.HousingAlw + record.PositionAlw + record.FixAlw
		// 计算总工资
		totalNetWages := record.BasicSalary + totalAlw

		// 计算保险补助有封顶额度
		jmstkAlw := 0.0
		if record.BasicSalary > coefficient.JmstkMax {
			jmstkAlw = coefficient.JmstkMax * coefficient.CJmstkAlw
		} else {
			jmstkAlw = record.BasicSalary * coefficient.CJmstkAlw
		}

		// 计算养老金补助
		pensionAlw := 0.0
		if record.BasicSalary > coefficient.PensionMax {
			pensionAlw = coefficient.PensionMax * coefficient.CPensionAlw
		} else {
			pensionAlw = record.BasicSalary * coefficient.CPensionAlw
		}

		// 计算社保补助
		askesBpjsAlw := 0.0
		if record.BasicSalary > coefficient.AskesMax {
			askesBpjsAlw = coefficient.AskesMax * coefficient.CAskesAlw * askesAlwByNation
		} else {
			askesBpjsAlw = record.BasicSalary * coefficient.CAskesAlw * askesAlwByNation
		}

		// 计算加班时长和工资
		ot1Hour := record.Ot1 * coefficient.COtHour1
		ot1Wages := (ot1Hour / coefficient.COtWages1) * totalNetWages

		ew1Hour := record.Ew1 * coefficient.CEwHour1
		ew1Wages := (ew1Hour / coefficient.CEwWages1) * totalNetWages

		ew2Hour := record.Ew2 * coefficient.CEwHour2
		ew2Wages := (ew2Hour / coefficient.CEwWages2 / coefficient.CEwHour2) * totalNetWages

		ew3Hour := record.Ew3 * coefficient.CEwHour3
		ew3Wages := (ew3Hour / coefficient.CEwWages3 / coefficient.CEwHour2) * totalNetWages

		// 计算工作日数
		workDays := float64(record.Work) + record.Ew

		// 计算各项补助
		mealAlw := workDays * record.MealAlwDay
		transpAlw := workDays * record.TranspAlwDay
		pulsaAlw := record.PulsaAlwDay * workDays
		attAlw := workDays * record.AttAlwDay

		// 计算缺勤扣除
		absentDed1 := record.Unpresent / 30.0 * record.BasicSalary

		// 计算税前总收入
		totalAcceptNoTax := totalNetWages + record.HousingAlwTetap + record.PulsaAlwMonth + jmstkAlw + pensionAlw + ot1Wages + ew1Wages + ew2Wages + ew3Wages + mealAlw + transpAlw + askesBpjsAlw + pulsaAlw + attAlw + record.LeaveComp + record.MedAlw + record.Others + record.ReligiousAlw + record.RapelBasicSalary + record.RapelJmstkAlw + record.Acting + record.PerformanceAlw + record.TripAlw + record.MandahAlw + record.IncentiveAlw + record.Ot2Wages + record.Ot3Wages + record.CompPhk + record.TaxAlwPhk + record.CorrectAdd - record.CorrectSub - absentDed1 - record.AbsentDed2 - record.IncentiveDed - record.LoanDed - record.TaxDedPhk

		// 计算税额
		taxAlwSalary := 0.0
		if totalAcceptNoTax > 0 {
			// 从税率表查询区间
			var taxRates []model.TaxRates
			if record.TaxType == "K/3" {
				if err := r.db.Where("grade = ?", record.TaxType).Order("salary_min").Find(&taxRates).Error; err != nil {
					return err
				}
			} else {
				if err := r.db.Where("grade LIKE ?", "%"+record.TaxType+"%").Order("salary_min").Find(&taxRates).Error; err != nil {
					return err
				}
			}

			// 查找税率
			rate := 0.0
			for _, taxRate := range taxRates {
				if totalAcceptNoTax >= taxRate.SalaryMin && totalAcceptNoTax < taxRate.SalaryMax {
					rate = taxRate.TaxRate
					break
				}
			}
			slog.Info("tax rate", "rate", rate)
			// 迭代计算税额
			maxIterations := 100
			iteration := 0
			currentRate := rate

			for iteration < maxIterations {
				iteration++
				x := totalAcceptNoTax * currentRate / (1.0 - currentRate)
				aPlusX := totalAcceptNoTax + x

				// 重新查找税率
				newRate := currentRate
				for _, taxRate := range taxRates {
					if aPlusX >= taxRate.SalaryMin && aPlusX < taxRate.SalaryMax {
						newRate = taxRate.TaxRate
						break
					}
				}

				if newRate == currentRate {
					taxAlwSalary = x
					break
				}

				currentRate = newRate
			}
		}

		// 计算总接受额
		totalAccept := totalAcceptNoTax + taxAlwSalary

		// 计算各项扣除
		jmstkFee := 0.0
		if record.BasicSalary > coefficient.JmstkMax {
			jmstkFee = coefficient.JmstkMax * coefficient.CJmstkFee
		} else {
			jmstkFee = record.BasicSalary * coefficient.CJmstkFee
		}

		pensionDed := 0.0
		if record.BasicSalary > coefficient.PensionMax {
			pensionDed = coefficient.PensionMax * coefficient.CPensionDed
		} else {
			pensionDed = record.BasicSalary * coefficient.CPensionDed
		}

		taxDedSalary := taxAlwSalary

		// 计算社保扣除
		cappedSalary := 0.0
		if record.BasicSalary <= coefficient.AskesMin {
			cappedSalary = coefficient.AskesMin
		} else if record.BasicSalary <= coefficient.AskesMax {
			cappedSalary = record.BasicSalary
		} else {
			cappedSalary = coefficient.AskesMax
		}
		askesBpjsDed := cappedSalary * coefficient.CAskesDed

		// 计算实发工资
		netAccept := totalAccept - jmstkFee - pensionDed - taxDedSalary - askesBpjsDed

		// 实发工资取整百
		roundOffSalary := float64(int((netAccept+50)/100)) * 100

		// 5. 插入或更新薪资记录
		var existingSalary model.Salaries
		result := r.db.Where("employee_id = ? AND month = ? AND is_calculate = 1", record.EmployeeID, month).First(&existingSalary)

		if result.Error == nil {
			// 更新现有记录
			existingSalary.BasicSalary = record.BasicSalary
			existingSalary.JmstkAlw = jmstkAlw
			existingSalary.PensionAlw = pensionAlw
			existingSalary.AskesBpjsAlw = askesBpjsAlw
			existingSalary.Ot1Wages = ot1Wages
			existingSalary.MealAlw = mealAlw
			existingSalary.TranspAlw = transpAlw
			existingSalary.PulsaAlw = pulsaAlw
			existingSalary.AttAlw = attAlw
			existingSalary.TotalAccept = totalAccept
			existingSalary.CompPhk = record.CompPhk
			existingSalary.TaxAlwPhk = record.TaxAlwPhk
			existingSalary.AbsentDed = absentDed1
			existingSalary.AbsentDed2 = record.AbsentDed2
			existingSalary.IncentiveDed = record.IncentiveDed
			existingSalary.LoanDed = record.LoanDed
			existingSalary.TotalNetWages = totalNetWages
			existingSalary.SalarySlipStatus = "0"
			existingSalary.Others = record.Others
			existingSalary.IncentiveAlw = record.IncentiveAlw
			existingSalary.PulsaAlwMonth = record.PulsaAlwMonth
			existingSalary.TaxAlwSalary = taxAlwSalary
			existingSalary.NetAccept = netAccept
			existingSalary.RoundOffSalary = roundOffSalary
			existingSalary.TaxDedPhk = record.TaxDedPhk
			existingSalary.JmstkFee = jmstkFee
			existingSalary.PensionDed = pensionDed
			existingSalary.TaxDedSalary = taxDedSalary
			existingSalary.AskesBpjsDed = askesBpjsDed
			existingSalary.CorrectAdd = record.CorrectAdd
			existingSalary.CorrectSub = record.CorrectSub
			existingSalary.MandahAlw = record.MandahAlw
			existingSalary.Ot1Hour = ot1Hour
			existingSalary.Ew1Hour = ew1Hour
			existingSalary.Ew1Wages = ew1Wages
			existingSalary.Ew2Hour = ew2Hour
			existingSalary.Ew2Wages = ew2Wages
			existingSalary.Ew3Hour = ew3Hour
			existingSalary.Ew3Wages = ew3Wages
			existingSalary.ReligiousAlw = record.ReligiousAlw
			existingSalary.RapelBasicSalary = record.RapelBasicSalary
			existingSalary.Acting = record.Acting
			existingSalary.PerformanceAlw = record.PerformanceAlw
			existingSalary.TripAlw = record.TripAlw
			existingSalary.HousingAlw = record.HousingAlw
			existingSalary.PositionAlw = record.PositionAlw
			existingSalary.FieldAlw = record.FieldAlw
			existingSalary.FixAlw = record.FixAlw
			existingSalary.JmstkAlw = jmstkAlw
			existingSalary.PensionAlw = pensionAlw
			existingSalary.AskesBpjsAlw = askesBpjsAlw
			existingSalary.MedAlw = record.MedAlw
			existingSalary.PulsaAlwMonth = record.PulsaAlwMonth
			existingSalary.HousingAlwTetap = record.HousingAlwTetap
			existingSalary.RapelJmstkAlw = record.RapelJmstkAlw
			existingSalary.JmstkFee = jmstkFee
			existingSalary.PensionDed = pensionDed
			existingSalary.TaxDedSalary = taxDedSalary
			existingSalary.AskesBpjsDed = askesBpjsDed
			// existingSalary.LeaveComp = record.LeaveComp

			if err := r.db.Save(&existingSalary).Error; err != nil {
				return err
			}
		} else {
			// 插入新记录
			newSalary := model.Salaries{
				Month:            month,
				ProjectID:        projectID,
				EmployeeID:       record.EmployeeID,
				BasicSalary:      record.BasicSalary,
				JmstkAlw:         jmstkAlw,
				PensionAlw:       pensionAlw,
				AskesBpjsAlw:     askesBpjsAlw,
				Ot1Wages:         ot1Wages,
				MealAlw:          mealAlw,
				TranspAlw:        transpAlw,
				PulsaAlw:         pulsaAlw,
				AttAlw:           attAlw,
				TotalAccept:      totalAccept,
				CompPhk:          record.CompPhk,
				TaxAlwPhk:        record.TaxAlwPhk,
				AbsentDed:        absentDed1,
				AbsentDed2:       record.AbsentDed2,
				IncentiveDed:     record.IncentiveDed,
				LoanDed:          record.LoanDed,
				TotalNetWages:    totalNetWages,
				SalarySlipStatus: "0",
				Others:           record.Others,
				IncentiveAlw:     record.IncentiveAlw,
				PulsaAlwMonth:    record.PulsaAlwMonth,
				NetAccept:        netAccept,
				TaxAlwSalary:     taxAlwSalary,
				RoundOffSalary:   roundOffSalary,
				TaxDedPhk:        record.TaxDedPhk,
				JmstkFee:         jmstkFee,
				PensionDed:       pensionDed,
				TaxDedSalary:     taxDedSalary,
				AskesBpjsDed:     askesBpjsDed,
				CorrectAdd:       record.CorrectAdd,
				CorrectSub:       record.CorrectSub,
				MandahAlw:        record.MandahAlw,
				Ew1Wages:         ew1Wages,
				Ew2Wages:         ew2Wages,
				Ew3Wages:         ew3Wages,
				Ot1Hour:          ot1Hour,
				Ew1Hour:          ew1Hour,
				Ew2Hour:          ew2Hour,
				Ew3Hour:          ew3Hour,
				ReligiousAlw:     record.ReligiousAlw,
				RapelBasicSalary: record.RapelBasicSalary,
				Acting:           record.Acting,
				PerformanceAlw:   record.PerformanceAlw,
				TripAlw:          record.TripAlw,
				IsCalculate:      1,
				DeleteFlag:       0,
				HousingAlw:       record.HousingAlw,
				PositionAlw:      record.PositionAlw,
				FieldAlw:         record.FieldAlw,
				FixAlw:           record.FixAlw,
				MedAlw:           record.MedAlw,
				HousingAlwTetap:  record.HousingAlwTetap,
				RapelJmstkAlw:    record.RapelJmstkAlw,
				// LeaveComp:        record.LeaveComp,
			}

			if err := r.db.Create(&newSalary).Error; err != nil {
				return err
			}
		}
	}

	return nil
}
