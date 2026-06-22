package repository

import (
	"kairis/backend/internal/model"
	"log/slog"
	"math"
	"strconv"
	"strings"
	"time"

	"gorm.io/gorm"
)

type SalaryRepository struct {
	db *gorm.DB
}

type AttendanceWithEmployee struct {
	model.Attendances
	// model.Employee

	EmployeeName             string  `gorm:"column:employee_name" json:"employee_name"`
	BasicSalary              float64 `gorm:"column:basic_salary" json:"basic_salary"`
	Department               string  `gorm:"column:department" json:"department"`
	IdCard                   string  `gorm:"column:id_card" json:"id_card"`
	HierarchyID              string  `gorm:"column:hierarchy_id" json:"hierarchy_id"`
	HierarchyName            string  `gorm:"column:hierarchy_name" json:"hierarchy_name"`
	Position                 string  `gorm:"column:position" json:"position"`
	ResignDate               string  `gorm:"column:resign_date" json:"resign_date"`
	Email                    string  `gorm:"column:email" json:"email"`
	PostFunctionAlwMonth     float64 `gorm:"column:post_function_alw_month" json:"post_function_alw_month"`
	BPJSHealthTambahanStatus string  `gorm:"column:bpjs_health_tambahan_status" json:"bpjs_health_tambahan_status"` // INTEGER default 0
	DateOfBirth              string  `gorm:"column:date_of_birth;default:CURRENT_TIMESTAMP" json:"date_of_birth"`
	PhoneAlwMonth            float64 `gorm:"column:phone_alw_month;default:0.00" json:"phone_alw_month"`                 // NUMERIC default 0.00
	InternetAlwMonth         float64 `gorm:"column:internet_alw_month;default:0.00" json:"internet_alw_month"`           // NUMERIC default 0.00
	IncentiveMonth           float64 `gorm:"column:incentive_month;default:0.00" json:"incentive_month"`                 // NUMERIC default 0.00
	OperationalAlwMonth      float64 `gorm:"column:operational_alw_month;default:0.00" json:"operational_alw_month"`     // NUMERIC default 0.00
	HousingAlwMonth          float64 `gorm:"column:housing_alw_month;default:0.00" json:"housing_alw_month"`             // NUMERIC default 0.00
	SeniorityAlwMonth        float64 `gorm:"column:seniority_alw_month;default:0.00" json:"seniority_alw_month"`         // NUMERIC default 0.00
	TransportAlwMonth        float64 `gorm:"column:transport_alw_month;default:0.00" json:"transport_alw_month"`         // NUMERIC default 0.00
	FieldAlwMonth            float64 `gorm:"column:field_alw_month;default:0.00" json:"field_alw_month"`                 // NUMERIC default 0.00
	AccommodationAlwMonth    float64 `gorm:"column:accommodation_alw_month;default:0.00" json:"accommodation_alw_month"` // NUMERIC default 0.00
	WorkDay                  float64 `gorm:"column:work_day;default:0" json:"work_day"`                                  // INTEGER default 0
	OnDay                    float64 `gorm:"column:on_day;default:0" json:"on_day"`                                      // INTEGER default 0
	BTDay                    float64 `gorm:"column:bt_day;default:0" json:"bt_day"`                                      // INTEGER default 0
	OSDay                    float64 `gorm:"column:os_day;default:0" json:"os_day"`                                      // INTEGER default 0
	OADay                    float64 `gorm:"column:oa_day;default:0" json:"oa_day"`                                      // INTEGER default 0
	TravellDay               float64 `gorm:"column:travell_day;default:0" json:"travell_day"`                            // INTEGER default 0
	TnTDay                   float64 `gorm:"column:tnt_day;default:0" json:"tnt_day"`                                    // INTEGER default 0
	STDay                    float64 `gorm:"column:st_day;default:0" json:"st_day"`                                      // INTEGER default 0
	TRDay                    float64 `gorm:"column:tr_day;default:0" json:"tr_day"`
}

type AttendanceWithEmployeeAndIncident struct {
	AttendanceWithEmployee

	CorrectAdd    float64 `gorm:"column:correct_add" json:"correct_add"`
	CorrectSub    float64 `gorm:"column:correct_sub" json:"correct_sub"`
	TaxType       string  `gorm:"column:tax_type" json:"tax_type"`
	Npwp          string  `gorm:"column:npwp" json:"npwp"`
	LocationName  string  `gorm:"column:location_name" json:"location_name"`
	JoinDate      string  `gorm:"column:join_date" json:"join_date"`
	PulsaAlwMonth float64 `gorm:"column:pulsa_alw_month" json:"pulsa_alw_month"`
	DeleteFlag    int     `gorm:"column:delete_flag" json:"delete_flag"`
	Month         string  `gorm:"column:month;not null" json:"month"`
	ProjectID     int     `gorm:"column:project_id;default:0" json:"project_id"`
	EmployeeID    string  `gorm:"column:employee_id;not null" json:"employee_id"`
	TaxStatus     float64 `gorm:"column:tax_status;default:0" json:"tax_status"`
	BasicSalary   float64 `gorm:"column:basic_salary;default:0.00" json:"basic_salary"`

	CreateTime         time.Time `gorm:"column:create_time;default:CURRENT_TIMESTAMP" json:"create_time"`
	UpdateTime         time.Time `gorm:"column:update_time;default:CURRENT_TIMESTAMP;autoUpdateTime" json:"update_time"`
	SalarySlipStatus   string    `gorm:"column:salary_slip_status;default:'0'" json:"salary_slip_status"`
	IsCalculate        int       `gorm:"column:is_calculate;default:1" json:"is_calculate"`
	Thr                float64   `gorm:"column:thr;default:0.00" json:"thr"`
	Age                float64   `gorm:"column:age;default:0" json:"age"`
	Bonus              float64   `gorm:"column:bonus;default:0.00" json:"bonus"`
	Compensation       float64   `gorm:"column:compensation;default:0.00" json:"compensation"`
	ActingAllowance    float64   `gorm:"column:acting_alw;default:0.00" json:"acting_alw"`
	SalaryProrate      float64   `gorm:"column:salary_prorate;default:0.00" json:"salary_prorate"`
	Rapel              float64   `gorm:"column:rapel;default:0.00" json:"rapel"`
	TaxAlw             float64   `gorm:"column:tax_alw;default:0.00" json:"tax_alw"`
	TaxDed             float64   `gorm:"column:tax_ded;default:0.00" json:"tax_ded"`
	OtherAdd           float64   `gorm:"column:other_add;default:0.00" json:"other_add"`
	OtherDed           float64   `gorm:"column:other_ded;default:0.00" json:"other_ded"`
	OnAlw              float64   `gorm:"column:on_alw;default:0.00" json:"on_alw"`
	BTDay              float64   `gorm:"column:bt_day;default:0" json:"bt_day"`
	OADay              float64   `gorm:"column:oa_day;default:0" json:"oa_day"`
	TravellDay         float64   `gorm:"column:travell_day;default:0" json:"travell_day"`
	TnTDay             float64   `gorm:"column:tnt_day;default:0" json:"tnt_day"`
	STDay              float64   `gorm:"column:st_day;default:0" json:"st_day"`
	TRDay              float64   `gorm:"column:tr_day;default:0" json:"tr_day"`
	WorkDay            float64   `gorm:"column:work_day;default:0" json:"work_day"`
	OnDay              float64   `gorm:"column:on_day;default:0" json:"on_day"`
	OsAlw              float64   `gorm:"column:os_alw;default:0.00" json:"os_alw"`
	OaAlw              float64   `gorm:"column:oa_alw;default:0.00" json:"oa_alw"`
	TotalFixedAlw      float64   `gorm:"column:total_fixed_alw;default:0.00" json:"total_fixed_alw"`
	WorkAlw            float64   `gorm:"column:work_alw;default:0.00" json:"work_alw"`
	OTAlw              float64   `gorm:"column:ot_alw;default:0.00" json:"ot_alw"`
	OVTAlw             float64   `gorm:"column:ovt_alw;default:0.00" json:"ovt_alw"`
	BTAlw              float64   `gorm:"column:bt_alw;default:0.00" json:"bt_alw"`
	TnTAlw             float64   `gorm:"column:tnt_alw;default:0.00" json:"tnt_alw"`
	STAlw              float64   `gorm:"column:st_alw;default:0.00" json:"st_alw"`
	TRAlw              float64   `gorm:"column:tr_alw;default:0.00" json:"tr_alw"`
	TAlw               float64   `gorm:"column:t_alw;default:0.00" json:"t_alw"`
	AlAlw              float64   `gorm:"column:al_alw;default:0.00" json:"al_alw"`
	RotAlw             float64   `gorm:"column:rot_alw;default:0.00" json:"rot_alw"`
	LSAlw              float64   `gorm:"column:ls_alw;default:0.00" json:"ls_alw"`
	QAlw               float64   `gorm:"column:q_alw;default:0.00" json:"q_alw"`
	WfhAlw             float64   `gorm:"column:wfh_alw;default:0.00" json:"wfh_alw"`
	PlAlw              float64   `gorm:"column:pl_alw;default:0.00" json:"pl_alw"`
	LAlw               float64   `gorm:"column:l_alw;default:0.00" json:"l_alw"`
	SCAlw              float64   `gorm:"column:sc_alw;default:0.00" json:"sc_alw"`
	SC1Alw             float64   `gorm:"column:sc1_alw;default:0.00" json:"sc1_alw"`
	PMAlw              float64   `gorm:"column:pm_alw;default:0.00" json:"pm_alw"`
	NAAlw              float64   `gorm:"column:na_alw;default:0.00" json:"na_alw"`
	OffAlw             float64   `gorm:"column:off_alw;default:0.00" json:"off_alw"`
	TotalNonFixedAlw   float64   `gorm:"column:total_non_fixed_alw;default:0.00" json:"total_non_fixed_alw"`
	QDed               float64   `gorm:"column:q_ded;default:0.00" json:"q_ded"`
	PLDed              float64   `gorm:"column:pl_ded;default:0.00" json:"pl_ded"`
	LateDed            float64   `gorm:"column:late_ded;default:0.00" json:"late_ded"`
	SCDed              float64   `gorm:"column:sc_ded;default:0.00" json:"sc_ded"`
	SC1Ded             float64   `gorm:"column:sc1_ded;default:0.00" json:"sc1_ded"`
	CODed              float64   `gorm:"column:co_ded;default:0.00" json:"co_ded"`
	PMDed              float64   `gorm:"column:pm_ded;default:0.00" json:"pm_ded"`
	NaDed              float64   `gorm:"column:na_ded;default:0.00" json:"na_ded"`
	SalaryDed          float64   `gorm:"column:salary_ded;default:0.00" json:"salary_ded"`
	JkkAlw             float64   `gorm:"column:jkk_alw;default:0.00" json:"jkk_alw"`
	JKMAlw             float64   `gorm:"column:jkm_alw;default:0.00" json:"jkm_alw"`
	JHTAlw             float64   `gorm:"column:jht_alw;default:0.00" json:"jht_alw"`
	JPAlw              float64   `gorm:"column:jp_alw;default:0.00" json:"jp_alw"`
	BpjsManpowerAlw    float64   `gorm:"column:bpjs_manpower_alw;default:0.00" json:"bpjs_manpower_alw"`
	BpjsHealthAlw      float64   `gorm:"column:bpjs_health_alw;default:0.00" json:"bpjs_health_alw"`
	GrossSalary        float64   `gorm:"column:gross_salary;default:0.00" json:"gross_salary"`
	JHTDed             float64   `gorm:"column:jht_ded;default:0.00" json:"jht_ded"`
	JPDed              float64   `gorm:"column:jp_ded;default:0.00" json:"jp_ded"`
	BpjsWorkDed        float64   `gorm:"column:bpjs_work_ded;default:0.00" json:"bpjs_work_ded"`
	BpjsHealthDed      float64   `gorm:"column:bpjs_health_ded;default:0.00" json:"bpjs_health_ded"`
	BpjsHealthTambahan float64   `gorm:"column:bpjs_health_tambahan;default:0.00" json:"bpjs_health_tambahan"`
	TotalDed           float64   `gorm:"column:total_deduction;default:0.00" json:"total_deduction"`
	FinalStaffReceive  float64   `gorm:"column:final_staff_receive;default:0.00" json:"final_staff_receive"`
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

func (r *SalaryRepository) List(offset, limit int, month string, projectID int, employeeID, employeeName string) ([]AttendanceWithEmployeeAndIncident, int64, error) {
	var salaries []AttendanceWithEmployeeAndIncident
	var total int64

	// 构建基础查询条件
	query := r.db.Table("salaries as s").
		Joins("LEFT JOIN employees as e ON s.employee_id = e.employee_id").
		Where("s.month = ? AND s.project_id = ? AND s.delete_flag = 0", month, projectID)

	// 添加employeeID和employeeName的条件过滤
	if employeeID != "" {
		query = query.Where("s.employee_id = ?", employeeID)
	}
	if employeeName != "" {
		query = query.Where("e.employee_name LIKE ?", "%"+employeeName+"%")
	}

	// 先查询总数
	if err := query.Count(&total).Error; err != nil {
		return salaries, total, err
	}

	// 再查询分页数据
	if err := query.
		Select(`s.*, e.employee_name, e.tax_type, e.npwp, e.join_date, e.resign_date,e.id_card, e.position,e.email,ir.thr, ir.bonus, ir.compensation, ir.acting_alw, ir.salary_prorate, ir.rapel, ir.tax_alw, ir.tax_ded,ir.other_add,ir.other_ded,e.bpjs_health_tambahan_status,e.date_of_birth,e.post_function_alw_month,e.phone_alw_month,e.internet_alw_month,e.incentive_month,e.operational_alw_month,e.housing_alw_month,e.seniority_alw_month,e.transport_alw_month,e.field_alw_month,e.accommodation_alw_month,e.work_day,e.on_day,e.bt_day,e.oa_day,e.os_day,e.travell_day,e.tnt_day,e.st_day,e.tr_day,a.w,a.ons,a.os,a.oa,a.ot,a.ovt,a.bt,a.t,a.tnt,a.al,a.rot,a.tr,a.st,a.ls,a.q,a.wfh,a.pl,a.l,a.sc,a.sc1,a.co,a.pm,a.na,a.off`).
		Joins("LEFT JOIN attendances as a ON s.employee_id = a.employee_id AND s.month = a.month AND s.project_id = a.project_id").
		Joins("LEFT JOIN incidents as ir ON s.employee_id = ir.employee_id AND s.month = ir.month AND s.project_id = ir.project_id").
		Order("s.employee_id DESC").
		Offset(offset).
		Limit(limit).
		Find(&salaries).Error; err != nil {
		return salaries, total, err
	}
	return salaries, total, nil
}

func (r *SalaryRepository) Update(salary *model.Salaries) error {
	return r.db.Save(salary).Error
}

func (r *SalaryRepository) Delete(id uint) error {
	return r.db.Delete(&model.Salaries{}, id).Error
}

func (r *SalaryRepository) DeleteByIDs(ids []uint) error {
	if len(ids) == 0 {
		return nil
	}
	return r.db.Where("id IN ?", ids).Delete(&model.Salaries{}).Error
}

func (r *SalaryRepository) calculateAge(dateOfBirth string) int {
	if dateOfBirth == "" {
		return 0
	}

	// 尝试解析日期格式，支持常见格式
	layouts := []string{
		"2006-01-02",
		"02-01-2006",
		"2006/01/02",
		"02/01/2006",
		"2006-1-2",
		"2-1-2006",
	}

	var birth time.Time
	var err error
	for _, layout := range layouts {
		birth, err = time.Parse(layout, dateOfBirth)
		if err == nil {
			break
		}
	}

	if err != nil {
		return 0
	}

	// 使用当前日期计算年龄
	today := time.Now()
	age := today.Year() - birth.Year()

	// 如果今年的生日还没到，年龄减1
	if today.Month() < birth.Month() || (today.Month() == birth.Month() && today.Day() < birth.Day()) {
		age--
	}

	return age
}

func (r *SalaryRepository) Calculate(month string, projectID int) error {
	// 1. 从salary_coefficient表获取计算系数
	var coefficient model.SalaryCoefficient
	if err := r.db.Where("is_delete = 0").First(&coefficient).Error; err != nil {
		return err
	}

	// 2. 从project表获取项目的askes_alw_by_nation系数和ot_hours_on、ew_hours_on系数
	var project model.Project
	if err := r.db.First(&project, projectID).Error; err != nil {
		return err
	}
	// askesAlwByNation := float64(project.AskesAlw)
	// otHoursOn := float64(project.OtHoursOn)
	// ewHoursOn := float64(project.EwHoursOn)

	// 3. 获取考勤记录和员工信息

	var attendanceRecords []AttendanceWithEmployeeAndIncident
	if err := r.db.Table("attendances as a").
		Select(`a.*, e.employee_name, e.tax_type, e.npwp, e.join_date, e.id_card, ir.thr, ir.bonus, ir.compensation, ir.acting_alw, ir.salary_prorate, ir.rapel, ir.tax_alw, ir.tax_ded,ir.other_add,ir.other_ded,e.basic_salary,e.bpjs_health_tambahan_status,e.date_of_birth,e.post_function_alw_month,e.phone_alw_month,e.internet_alw_month,e.incentive_month,e.operational_alw_month,e.housing_alw_month,e.seniority_alw_month,e.transport_alw_month,e.field_alw_month,e.accommodation_alw_month,e.work_day,e.on_day,e.bt_day,e.oa_day,e.os_day,e.travell_day,e.tnt_day,e.st_day,e.tr_day`).
		Joins("LEFT JOIN employees as e ON a.employee_id = e.employee_id").
		Joins("LEFT JOIN incidents as ir ON a.employee_id = ir.employee_id AND a.month = ir.month").
		Where("a.month = ? AND a.project_id = ?", month, projectID).
		Find(&attendanceRecords).Error; err != nil {
		return err
	}

	// 4. 计算薪资并更新或插入记录
	for _, record := range attendanceRecords {
		// 基础变量
		basicSalary := record.BasicSalary
		workDays := float64(record.WorkDay)
		slog.Info("WorkDays:", "WorkDays", workDays)
		onDays := float64(record.OnDay)

		// Total_Fixed_Alw = Basic_Salary/Month + Post_Function_Alw/Month + Phone_Alw/Month + Internet_Alw/Month + Incentive/Month + Operational_Alw/Month + Housing_Alw/Month + Seniority_Alw/Month + Transport_Alw/Month + Field_Alw/Month + Accomodation_alw/Month
		totalFixedAlw := basicSalary + record.PostFunctionAlwMonth + record.PhoneAlwMonth + record.InternetAlwMonth + record.IncentiveMonth + record.OperationalAlwMonth + record.HousingAlwMonth + record.SeniorityAlwMonth + record.TransportAlwMonth + record.FieldAlwMonth + record.AccommodationAlwMonth

		// Work_Alw = W * Work/day
		// slog.Info("W is:", "W", record.W)
		workAlw := record.W * workDays

		// On_Alw = On/day + On * Work/day
		onAlw := record.Ons * (workDays + onDays)
		slog.Info("workDays:", "workDays", workDays)
		slog.Info("onDays:", "onDays", onDays)
		slog.Info("ons:", "ons", record.Ons)
		OSAlw := record.OSDay * record.Os
		_ = OSAlw // 避免未使用变量错误
		OaAlw := record.Oa * (onDays + record.OADay)

		// OT_Alw = OT * (Basic_Salary * 2) / (30 * 8)

		slog.Info("OT is:", "OT", record.Ot)
		otAlw := math.Round(record.Ot * (basicSalary * 2) / (30 * 8))

		// OVT_Alw = OVT * basic_salary * 29 / OVT / 173
		ovtAlw := math.Round(record.Ovt * basicSalary * 29 / 173)

		// BT_Alw = BT * (BT/Day + On/day + Work/day)
		btAlw := record.Bt * (record.BTDay + onDays + workDays)

		// T_Alw = T * Travel/Day
		tAlw := record.T * record.TravellDay

		// TNT_Alw = TNT * TNT/Day
		tntAlw := record.Tnt * record.TnTDay

		// AL_Alw (年假) = AL * Work/day
		alAlw := record.Al * workDays

		// ROT_Alw = Basic_Salary * 7.5 * ROT / 173
		rotAlw := math.Round(basicSalary * 7.5 * record.Rot / 173)

		// TR_Alw (境外培训) = TR * TR/day
		trAlw := record.Tr * record.TRDay

		// ST_Alw = ST * ST/day
		stAlw := record.St * record.STDay

		// LS_Alw = LS * basic_salary * 24 / 173
		lsAlw := math.Round(record.Ls * basicSalary * 24 / 173)
		lateDed := max((record.L-3)*record.TravellDay, 0)

		// Q_Ded = Total_Fixed_Alw * Q / 30
		qDed := math.Round(totalFixedAlw * record.Q / 30)

		// PL_Ded (事假) = Total_Fixed_Alw * PL / 30
		plDed := math.Round(totalFixedAlw * record.Pl / 30)

		// SC_Ded (病假) = Total_Fixed_Alw * SC / 30
		scDed := math.Round(totalFixedAlw * record.Sc / 30)

		// SC1_Ded (病假无证明) = Total_Fixed_Alw * SC1 / 22
		sc1Ded := math.Round(totalFixedAlw * record.Sc1 / 22)

		// CO_Ded = Total_Fixed_Alw * CO / 30
		coDed := math.Round(totalFixedAlw * record.Co / 30)

		// PM_Ded = Total_Fixed_Alw * PM / 30
		pmDed := math.Round(totalFixedAlw * record.Pm / 30)

		// NA_Ded = Total_Fixed_Alw * NA / 22
		naDed := math.Round(totalFixedAlw * record.Na / 22)

		// Total_Non_Fixed_Alw = Work_Alw + On_Alw + OS/OA_Alw + OT_Alw + OVT_Alw + BT_Alw + T_Alw + TNT_Alw + AL_Alw + ROT_Alw + TR_Alw + ST_Alw + LS_Alw + THR + Bonus + Compensation + Acting_Allowance + Salary_Prorate + Other_Add
		totalNonFixedAlw := workAlw + onAlw + OaAlw + OSAlw + otAlw + ovtAlw + btAlw + tAlw + tntAlw + alAlw + rotAlw + trAlw + stAlw + lsAlw + record.Thr + record.Bonus + record.Compensation + record.ActingAllowance + record.SalaryProrate + record.OtherAdd

		// Salary_Ded = Q_Ded + PL_Ded + SC_Ded + SC1_Ded + CO_Ded + PM_Ded + NA_Ded + Other_Ded
		salaryDed := qDed + plDed + lateDed + scDed + sc1Ded + coDed + pmDed + naDed + record.OtherDed

		// JKK_Alw = Basic_Salary/Month * 1.74%
		jkkAlw := math.Round(basicSalary * 0.0174)

		// JKM_Alw = Basic_Salary/Month * 0.3%
		jkmAlw := math.Round(basicSalary * 0.003)

		// JHT_Alw = Basic_Salary/Month * 3.7%
		jhtAlw := math.Round(basicSalary * 0.037)

		// JP_Alw - 根据年龄计算
		// 当年年龄大于等于58时, JP_Alw=0, JP_Ded=0
		// AGE < 58时: JP_Alw = (Basic_Salary/Month + Rapel) * 2%
		// JKK_Alw = (Basic_Salary/Month + Rapel) * 1%
		// JP_Alw = JKK_Alw + JHT_Alw + JP_Alw
		rapel := record.Rapel
		jpAlw := 0.0
		// 根据data_of_birth计算年龄
		age := r.calculateAge(record.DateOfBirth)

		if age < 58 {
			jpAlw = math.Round(min((basicSalary+rapel), 11086300) * 0.02)

		} else {
			jpAlw = 0.0
		}

		// BPJS_Manpower_Alw = Basic_Salary/Month * 4%
		bpjsManpowerAlw := jkkAlw + jkmAlw + jhtAlw + jpAlw

		// BPJS_Health_Alw = Basic_Salary/Month * 4% (封顶处理)
		healthAlw := 0.0
		if basicSalary > 12000000 {
			healthAlw = 12000000
		} else if basicSalary < 3450000 {
			healthAlw = 3450000
		} else {
			healthAlw = basicSalary
		}

		bpjsHealthAlw := math.Round(healthAlw * 0.04)
		// Gross_Salary = Total_Fixed_Alw + Total_Non_Fixed_Alw + Tax_Alw - Salary_Ded
		taxAlw := record.TaxAlw
		grossSalary := totalFixedAlw + totalNonFixedAlw + taxAlw - salaryDed
		// 如果grossSalary最后两位大于50，就进位，小于50，则舍掉后两位
		lastTwoDigits := int(grossSalary) % 100
		if lastTwoDigits >= 50 {
			grossSalary = math.Ceil(grossSalary/100) * 100
		} else {
			grossSalary = math.Floor(grossSalary/100) * 100
		}

		// JHT_Ded = Basic_Salary/Month * 2%
		jhtDed := math.Round(basicSalary * 0.02)

		// JP_Ded = (Basic_Salary/Month + Rapel) * 1% (年龄<58时)
		jpDedTotal := basicSalary + rapel
		if jpDedTotal > 11086300 {
			jpDedTotal = 11086300
		}
		jpDed := 0.0
		if age < 58 {
			jpDed = math.Round((jpDedTotal) * 0.01)
		} else {
			jpDed = 0.0
		}

		// BPJS_Work_Ded = JHT_Ded + JP_Ded
		bpjsWorkDed := jhtDed + jpDed

		// BPJS_Health_Ded = Basic_Salary/Month * 1% (封顶处理)
		healthDed := 0.0
		if basicSalary > 12000000 {
			healthDed = 12000000
		} else if basicSalary < 3450000 {
			healthDed = 3450000
		} else {
			healthDed = basicSalary
		}
		bpjsHealthDed := healthDed * 0.01
		// BPJS_Health_Tambahan = Basic_Salary * BPJS_Health_Tambahan_Status(这个是个百分数)
		bpjsHealthTambahanRate, _ := strconv.ParseFloat(record.BPJSHealthTambahanStatus, 64)
		healthTambahan := 0.0
		if basicSalary > 12000000 {
			healthTambahan = 12000000
		} else if basicSalary < 3450000 {
			healthTambahan = 3450000
		} else {
			healthTambahan = basicSalary
		}

		bpjsHealthTambahan := healthTambahan * bpjsHealthTambahanRate

		// BPJS_Health_Ded = BPJS_Health_Ded + BPJS_Health_Tambahan
		totalBpjsHealthDed := bpjsHealthDed + bpjsHealthTambahan

		// 计算税额
		taxAlwSalary := 0.0
		if grossSalary > 0 {
			var taxRates []model.TaxRates
			record.TaxType = strings.TrimSpace(record.TaxType)
			if record.TaxType == "K/3" {
				if err := r.db.Where("grade = ?", record.TaxType).Order("salary_min").Find(&taxRates).Error; err != nil {
					return err
				}
			} else {
				if err := r.db.Where("grade LIKE ?", "%"+record.TaxType+"%").Order("salary_min").Find(&taxRates).Error; err != nil {
					return err
				}
			}

			rate := 0.0
			for _, taxRate := range taxRates {
				if grossSalary >= taxRate.SalaryMin && grossSalary < taxRate.SalaryMax {
					rate = taxRate.TaxRate
					break
				}
			}

			maxIterations := 100
			iteration := 0
			currentRate := rate

			for iteration < maxIterations {
				iteration++
				x := grossSalary * currentRate / (1.0 - currentRate)
				aPlusX := grossSalary + x

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
		taxAlwSalary = record.TaxAlw - taxAlwSalary

		totalDed := bpjsWorkDed + totalBpjsHealthDed + record.TaxDed

		// 计算总接受额
		totalAccept := grossSalary - totalDed
		lastTwoDigits1 := int(totalAccept) % 100
		if lastTwoDigits1 >= 50 {
			totalAccept = math.Ceil(totalAccept/100) * 100
		} else {
			totalAccept = math.Floor(totalAccept/100) * 100
		}
		// 计算各项扣除
		// jmstkFee := bpjsWorkDed
		// pensionDed := 0.0
		// if basicSalary > coefficient.PensionMax {
		// 	pensionDed = coefficient.PensionMax * coefficient.CPensionDed
		// } else {
		// 	pensionDed = basicSalary * coefficient.CPensionDed
		// }
		// taxDedSalary := taxAlwSalary
		// askesBpjsDed := bpjsHealthDed

		// // 计算实发工资
		// netAccept := totalAccept - jmstkFee - pensionDed - taxDedSalary - askesBpjsDed

		// // 实发工资取整百
		// roundOffSalary := float64(int((netAccept+50)/100)) * 100

		// 5. 插入或更新薪资记录
		var existingSalary model.Salaries
		result := r.db.Where("employee_id = ? AND month = ? AND project_id = ? AND is_calculate = 1", record.EmployeeID, month, projectID).First(&existingSalary)

		if result.Error == nil && existingSalary.ID != 0 {
			// 更新现有记录
			existingSalary.EmployeeID = record.EmployeeID
			existingSalary.Month = month
			existingSalary.ProjectID = projectID
			existingSalary.BasicSalary = record.BasicSalary
			existingSalary.Age = float64(age)
			existingSalary.TotalFixedAlw = totalFixedAlw
			existingSalary.WorkAlw = workAlw
			existingSalary.OnAlw = onAlw
			// existingSalary.OSDay = osDay
			existingSalary.OSAlw = OSAlw
			existingSalary.OaAlw = OaAlw
			existingSalary.OtAlw = otAlw
			existingSalary.OvtAlw = ovtAlw
			existingSalary.BtAlw = btAlw
			existingSalary.TAlw = tAlw
			existingSalary.TntAlw = tntAlw
			existingSalary.AlAlw = alAlw
			existingSalary.RotAlw = rotAlw
			existingSalary.TrAlw = trAlw
			existingSalary.StAlw = stAlw
			existingSalary.LsAlw = lsAlw
			existingSalary.TotalNonFixedAlw = totalNonFixedAlw
			existingSalary.LateDed = lateDed
			existingSalary.QDed = qDed
			existingSalary.PlDed = plDed
			existingSalary.ScDed = scDed
			existingSalary.Sc1Ded = sc1Ded
			existingSalary.CoDed = coDed
			existingSalary.PmDed = pmDed
			existingSalary.NaDed = naDed
			existingSalary.SalaryDed = salaryDed
			existingSalary.JkkAlw = jkkAlw
			existingSalary.JkmAlw = jkmAlw
			existingSalary.JhtAlw = jhtAlw
			existingSalary.JpAlw = jpAlw
			existingSalary.BpjsManpowerAlw = bpjsManpowerAlw
			existingSalary.BpjsHealthAlw = bpjsHealthAlw
			existingSalary.GrossSalary = grossSalary
			existingSalary.JhtDed = jhtDed
			existingSalary.JpDed = jpDed
			existingSalary.BpjsWorkDed = bpjsWorkDed
			existingSalary.BpjsHealthDed = bpjsHealthDed
			existingSalary.BpjsHealthTambahan = bpjsHealthTambahan
			existingSalary.SalarySlipStatus = "0"
			existingSalary.TotalDeduction = totalDed
			existingSalary.FinalStaffReceive = totalAccept
			existingSalary.IsCalculate = 1
			existingSalary.DeleteFlag = 0

			if err := r.db.Save(&existingSalary).Error; err != nil {
				return err
			}
		} else {
			// 插入新记录
			newSalary := model.Salaries{
				Month:              month,
				ProjectID:          projectID,
				EmployeeID:         record.EmployeeID,
				BasicSalary:        record.BasicSalary,
				Age:                float64(age),
				TotalFixedAlw:      totalFixedAlw,
				WorkAlw:            workAlw,
				OnAlw:              onAlw,
				OSAlw:              OSAlw,
				OaAlw:              OaAlw,
				OtAlw:              otAlw,
				OvtAlw:             ovtAlw,
				BtAlw:              btAlw,
				TAlw:               tAlw,
				TntAlw:             tntAlw,
				AlAlw:              alAlw,
				RotAlw:             rotAlw,
				TrAlw:              trAlw,
				StAlw:              stAlw,
				LsAlw:              lsAlw,
				TotalNonFixedAlw:   totalNonFixedAlw,
				LateDed:            lateDed,
				QDed:               qDed,
				PlDed:              plDed,
				ScDed:              scDed,
				Sc1Ded:             sc1Ded,
				CoDed:              coDed,
				PmDed:              pmDed,
				NaDed:              naDed,
				SalaryDed:          salaryDed,
				JkkAlw:             jkkAlw,
				JkmAlw:             jkmAlw,
				JhtAlw:             jhtAlw,
				JpAlw:              jpAlw,
				BpjsManpowerAlw:    bpjsManpowerAlw,
				BpjsHealthAlw:      bpjsHealthAlw,
				GrossSalary:        grossSalary,
				JhtDed:             jhtDed,
				JpDed:              jpDed,
				BpjsWorkDed:        bpjsWorkDed,
				BpjsHealthDed:      bpjsHealthDed,
				BpjsHealthTambahan: bpjsHealthTambahan,
				SalarySlipStatus:   "0",
				TotalDeduction:     totalDed,
				FinalStaffReceive:  totalAccept,
				IsCalculate:        1,
				DeleteFlag:         0,
			}

			if err := r.db.Create(&newSalary).Error; err != nil {
				return err
			}
		}
	}

	return nil
}

// Total 获取薪资汇总
func (r *SalaryRepository) Total() (float64, error) {
	var total float64
	// GORM Sum 方法正确用法：Sum("列名", &接收变量)
	if err := r.db.Model(&model.Salaries{}).Select("COALESCE(SUM(final_staff_receive), 0)").Scan(&total).Error; err != nil {
		return 0, err
	}
	return total, nil
}
