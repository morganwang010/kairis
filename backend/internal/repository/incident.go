package repository

import (
	"kairis/backend/internal/model"

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
