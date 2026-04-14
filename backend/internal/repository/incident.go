package repository

import (
	"kairis/backend/internal/model"
	"log/slog"

	"gorm.io/gorm"
)

type IncidentRepository struct {
	db *gorm.DB
}
type IncidentWithEmployee struct {
	model.Incidents
	EmployeeName string `json:"employee_name"`
}

func NewIncidentRepository(db *gorm.DB) *IncidentRepository {
	return &IncidentRepository{db: db}
}

func (r *IncidentRepository) Create(incident *model.Incidents) error {
	return r.db.Create(incident).Error
}

func (r *IncidentRepository) GetByID(id uint) (*model.Incidents, error) {
	var incident model.Incidents
	err := r.db.First(&incident, id).Error
	if err != nil {
		return nil, err
	}
	return &incident, nil
}

func (r *IncidentRepository) List(offset, limit int, projectID, month string) ([]IncidentWithEmployee, int64, error) {
	var incidents []IncidentWithEmployee
	var total int64

	// 先查询总数
	if err := r.db.Table("incidents as a").
		Joins("LEFT JOIN employees as e ON a.employee_id = e.employee_id").
		Where("a.month = ? AND a.project_id = ?", month, projectID).
		Count(&total).Error; err != nil {
		return incidents, total, err
	}

	// 再查询分页数据
	if err := r.db.Table("incidents as a").
		Select(`a.*, e.employee_name,e.position`).
		Joins("LEFT JOIN employees as e ON a.employee_id = e.employee_id").
		Where("a.month = ? AND a.project_id = ?", month, projectID).
		Order("a.employee_id DESC").
		Offset(offset).
		Limit(limit).
		Find(&incidents).Error; err != nil {
		return incidents, total, err
	}
	return incidents, total, nil
}

func (r *IncidentRepository) Update(incident *model.Incidents) error {
	return r.db.Save(incident).Error

}

func (r *IncidentRepository) Delete(id uint) error {
	return r.db.Delete(&model.Incidents{}, id).Error
}

func (r *IncidentRepository) DeleteByIDs(ids []uint) error {
	if len(ids) == 0 {
		return nil
	}
	return r.db.Where("id IN ?", ids).Delete(&model.Incidents{}).Error
}

func (r *IncidentRepository) GetByEmployeeIDAndMonth(employeeID, month string, projectID int) (*model.Incidents, error) {
	var incident model.Incidents
	slog.Info("Searching for incident", "employee_id", employeeID, "project_id", projectID, "month", month)
	err := r.db.Where("employee_id = ? AND month = ? AND project_id = ?", employeeID, month, projectID).First(&incident).Error
	if err != nil {
		incident = model.Incidents{}
		slog.Error("Failed to find incident", "error", err, "employee_id", employeeID, "project_id", projectID, "month", month)
		return &incident, nil
	}
	return &incident, nil
}
