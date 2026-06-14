package repository

import (
	"kairis/backend/internal/model"
)

func (r *SalaryRepository) ListSalarySlips(offset, limit int, month string, projectID int) ([]model.Salaries, int64, error) {
	var salarySlips []model.Salaries
	var total int64

	query := r.db.Model(&model.Salaries{}).
		Select(`
			salaries.*,
			employees.employee_name,
			employees.position,
			employees.department,
			employees.npwp,
			employees.location,
			employees.join_date,
			employees.id_card,
			projects.project_name
		`).
		Joins("LEFT JOIN employees ON salaries.employee_id = employees.employee_id").
		Joins("LEFT JOIN projects ON salaries.project_id = projects.id").
		Where("salaries.delete_flag = 0 AND salaries.month = ? AND salaries.project_id = ?", month, projectID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Order("salaries.employee_id DESC").Offset(offset).Limit(limit).Scan(&salarySlips).Error; err != nil {
		return nil, 0, err
	}

	return salarySlips, total, nil
}

func (r *SalaryRepository) UpdateSalarySlip(salarySlip *model.Salaries) error {
	return r.db.Save(salarySlip).Error
}

func (r *SalaryRepository) GetByEmployeeIDAndMonth(employeeID, month string, projectID int) (*model.Salaries, error) {
	var salarySlip model.Salaries
	err := r.db.Model(&model.Salaries{}).
		Select(`
			salaries.*,
			employees.employee_name,
			employees.position,
			employees.department,
			employees.npwp,
			employees.location,
			employees.join_date,
			employees.id_card,
			projects.project_name
		`).
		Joins("LEFT JOIN employees ON salaries.employee_id = employees.employee_id").
		Joins("LEFT JOIN projects ON salaries.project_id = projects.id").
		Where("salaries.employee_id = ? AND salaries.month = ? AND salaries.project_id = ? AND salaries.delete_flag = 0", employeeID, month, projectID).
		First(&salarySlip).Error
	if err != nil {
		return nil, err
	}
	return &salarySlip, nil
}
