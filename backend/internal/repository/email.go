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
	EmployeeName  string `gorm:"column:employee_name" json:"employee_name"`
	Department    string `gorm:"column:department" json:"department"`
	Position      string `gorm:"column:position" json:"position"`
	IdCard        string `gorm:"column:id_card" json:"id_card"`
	Npwp          string `gorm:"column:npwp" json:"npwp"`
	JoinDate      string `gorm:"column:join_date" json:"join_date"`
	LocationName  string `gorm:"column:location_name" json:"location_name"`
	Email         string `gorm:"column:email" json:"email"`
}

// GetSalaryWithEmployeeByID 获取带员工信息的薪资数据
func (r *EmailRepository) GetSalaryWithEmployeeByMonth(employeeID, month string, projectID int) (*SalaryWithEmployee, error) {
	var salary SalaryWithEmployee
	err := r.db.Table("salaries").
		Select("salaries.*, employees.employee_name, employees.department, employees.position, employees.id_card, employees.npwp, employees.join_date, employees.email").
		Joins("LEFT JOIN employees ON salaries.employee_id = employees.employee_id AND salaries.project_id = employees.project_id").
		Where("salaries.employee_id = ? AND salaries.month = ? AND salaries.project_id = ? AND salaries.delete_flag = 0", employeeID, month, projectID).
		First(&salary).Error
	if err != nil {
		return nil, err
	}
	return &salary, nil
}
