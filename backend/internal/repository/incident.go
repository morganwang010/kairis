package repository

import (
	"kairis/backend/internal/model"

	"gorm.io/gorm"
)

type IncidentRepository struct {
	db *gorm.DB
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

func (r *IncidentRepository) List(offset, limit int, projectID, month string) ([]model.Incidents, int64, error) {
	var incidents []model.Incidents
	var total int64

	query := r.db.Model(&model.Incidents{})

	if projectID != "" {
		query = query.Where("project_id = ?", projectID)
	}

	if month != "" {
		query = query.Where("month = ?", month)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.Offset(offset).Limit(limit).Find(&incidents).Error
	return incidents, total, err
}

func (r *IncidentRepository) Update(incident *model.Incidents) error {
	return r.db.Save(incident).Error
}

func (r *IncidentRepository) Delete(id uint) error {
	return r.db.Delete(&model.Incidents{}, id).Error
}
