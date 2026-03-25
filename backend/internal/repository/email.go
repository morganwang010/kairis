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
	model.Salaries
	EmployeeName string `gorm:"column:employee_name" json:"employee_name"`
	Department   string `gorm:"column:department" json:"department"`
	Position     string `gorm:"column:position" json:"position"`
	IdCard       string `gorm:"column:id_card" json:"id_card"`
	Npwp         string `gorm:"column:npwp" json:"npwp"`
	JoinDate     string `gorm:"column:join_date" json:"join_date"`
	LocationName string `gorm:"column:location_name" json:"location_name"`
	Email        string `gorm:"column:email" json:"email"`
}

// GetSalaryWithEmployeeByID 获取带员工信息的薪资数据
func (r *EmailRepository) GetSalaryWithEmployeeByMonth(employeeID, month string, projectID string) (*SalaryWithEmployee, error) {
	var salary SalaryWithEmployee
	err := r.db.Table("salaries as s").
		Select("s.*, e.employee_name, e.department, e.position, e.id_card, e.npwp, e.join_date, e.location_name, e.email").
		Joins("JOIN employees as e ON s.employee_id = e.employee_id AND s.project_id = e.project_id").
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
