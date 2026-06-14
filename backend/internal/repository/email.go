package repository

import (
	"kairis/backend/internal/model"

	"gorm.io/gorm"
)

type EmailRepository struct {
	db *gorm.DB
}

func NewEmailRepository(db *gorm.DB) *EmailRepository {
	return &EmailRepository{db: db}
}

// GetEmailConfig 获取邮件配置
func (r *EmailRepository) GetEmailConfig() (map[string]string, error) {
	var configs []model.SystemConfig
	err := r.db.Where("name IN ?", []string{"email_smtp_address", "email_smtp_port", "email_password", "email_address"}).Find(&configs).Error
	if err != nil {
		return nil, err
	}

	configMap := make(map[string]string)
	for _, config := range configs {
		configMap[config.Name] = config.Config
	}

	return configMap, nil
}

// SalaryWithEmployee 薪资与员工信息联合查询结果
type SalaryWithEmployee struct {
	model.SalarySlip
	EmployeeName string `gorm:"column:employee_name" json:"employee_name"`
	Department   string `gorm:"column:department" json:"department"`
	Position     string `gorm:"column:position" json:"position"`
	IdCard       string `gorm:"column:id_card" json:"id_card"`
	JoinDate     string `gorm:"column:join_date" json:"join_date"`
	LocationName string `gorm:"column:location_name" json:"location_name"`
	Email        string `gorm:"column:email" json:"email"`
	ProjectName  string `gorm:"column:project_name" json:"project_name"`
	// Fixed Allowance fields from employees
	PostFunctionAlwMonth  float64 `gorm:"column:post_function_alw_month" json:"post_function_alw_month"`
	PhoneAlwMonth         float64 `gorm:"column:phone_alw_month" json:"phone_alw_month"`
	InternetAlwMonth      float64 `gorm:"column:internet_alw_month" json:"internet_alw_month"`
	IncentiveMonth        float64 `gorm:"column:incentive_month" json:"incentive_month"`
	OperationalAlwMonth   float64 `gorm:"column:operational_alw_month" json:"operational_alw_month"`
	HousingAlwMonth       float64 `gorm:"column:housing_alw_month" json:"housing_alw_month"`
	SeniorityAlwMonth     float64 `gorm:"column:seniority_alw_month" json:"seniority_alw_month"`
	TransportAlwMonth     float64 `gorm:"column:transport_alw_month" json:"transport_alw_month"`
	FieldAlwMonth         float64 `gorm:"column:field_alw_month" json:"field_alw_month"`
	AccommodationAlwMonth float64 `gorm:"column:accommodation_alw_month" json:"accommodation_alw_month"`
}

// GetSalaryWithEmployeeByID 获取带员工信息的薪资数据
func (r *EmailRepository) GetSalaryWithEmployeeByMonth(employeeID, month string, projectID string) (*SalaryWithEmployee, error) {
	var salary SalaryWithEmployee
	err := r.db.Table("salaries as s").
		Select(`s.*, e.employee_name, e.tax_type, e.npwp, e.join_date, e.resign_date,e.id_card, e.position,e.email,ir.thr, ir.bonus, ir.compensation, ir.acting_alw, ir.salary_prorate, ir.rapel, ir.tax_alw, ir.tax_ded,ir.other_add,ir.other_ded,e.bpjs_health_tambahan_status,e.date_of_birth,e.post_function_alw_month,e.phone_alw_month,e.internet_alw_month,e.incentive_month,e.operational_alw_month,e.housing_alw_month,e.seniority_alw_month,e.transport_alw_month,e.field_alw_month,e.accommodation_alw_month,e.work_day,e.on_day,e.bt_day,e.oa_day,e.travell_day,e.tnt_day,e.st_day,e.tr_day, p.project_name as project_name`).
		Joins("JOIN employees as e ON s.employee_id = e.employee_id AND s.project_id = e.project_id").
		Joins("Left Join incidents as ir on s.employee_id = ir.employee_id and s.month = ir.month and s.project_id = ir.project_id").
		Joins("LEFT JOIN projects as p ON s.project_id = p.id").
		Where("s.employee_id = ? AND s.month = ? AND s.project_id = ? AND s.delete_flag = 0", employeeID, month, projectID).
		First(&salary).Error
	if err != nil {
		return nil, err
	}
	return &salary, nil
}

func (r *EmailRepository) UpdateSalaryEmailSent(employeeID, month, projectID string, emailSent bool) error {
	return r.db.Table("salaries").
		Where("employee_id = ? AND month = ? AND project_id = ? AND delete_flag = 0", employeeID, month, projectID).
		Update("salary_slip_status", "1").Error
}
