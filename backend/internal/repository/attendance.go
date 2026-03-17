package repository

import (
	"kairis/backend/internal/model"

	"gorm.io/gorm"
)

type AttendanceRepository struct {
	db *gorm.DB
}

func NewAttendanceRepository(db *gorm.DB) *AttendanceRepository {
	return &AttendanceRepository{db: db}
}

func (r *AttendanceRepository) Create(attendance *model.Attendances) error {
	return r.db.Create(attendance).Error
}

func (r *AttendanceRepository) GetByID(id uint) (*model.Attendances, error) {
	var attendance model.Attendances
	err := r.db.First(&attendance, id).Error
	if err != nil {
		return nil, err
	}
	return &attendance, nil
}

func (r *AttendanceRepository) List(offset, limit int, projectID, month string) ([]model.Attendances, int64, error) {
	var attendances []model.Attendances
	var total int64

	query := r.db.Model(&model.Attendances{})

	if projectID != "" {
		query = query.Where("project_id = ?", projectID)
	}

	if month != "" {
		query = query.Where("month = ?", month)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.Offset(offset).Limit(limit).Find(&attendances).Error
	return attendances, total, err
}

func (r *AttendanceRepository) Update(attendance *model.Attendances) error {
	return r.db.Save(attendance).Error
}

func (r *AttendanceRepository) Delete(id uint) error {
	return r.db.Delete(&model.Attendances{}, id).Error
}
