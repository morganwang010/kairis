package repository

import (
	"kairis/backend/internal/model"
)

func (r *SalaryRepository) ListSalarySlips(offset, limit int, month string, projectID int) ([]model.Salaries, int64, error) {
	var salarySlips []model.Salaries
	var total int64

	query := r.db.Model(&model.Salaries{}).Where("delete_flag = 0")

	if month != "" {
		query = query.Where("month = ?", month)
	}
	if projectID > 0 {
		query = query.Where("project_id = ?", projectID)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Offset(offset).Limit(limit).Find(&salarySlips).Error; err != nil {
		return nil, 0, err
	}

	return salarySlips, total, nil
}

func (r *SalaryRepository) UpdateSalarySlip(salarySlip *model.Salaries) error {
	return r.db.Save(salarySlip).Error
}

func (r *SalaryRepository) GetByEmployeeIDAndMonth(employeeID, month string, projectID int) (*model.Salaries, error) {
	var salarySlip model.Salaries
	err := r.db.Where("employee_id = ? AND month = ? AND project_id = ? AND delete_flag = 0", employeeID, month, projectID).First(&salarySlip).Error
	if err != nil {
		return nil, err
	}
	return &salarySlip, nil
}
