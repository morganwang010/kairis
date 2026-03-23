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

func (r *AttendanceRepository) List(offset, limit int, projectID, month string) ([]AttendanceWithEmployee, int64, error) {
	var attendances []AttendanceWithEmployee
	var total int64

	// 先查询总数
	if err := r.db.Table("attendances as a").
		Joins("LEFT JOIN employees as e ON a.employee_id = e.employee_id").
		Where("a.month = ? AND a.project_id = ?", month, projectID).
		Count(&total).Error; err != nil {
		return attendances, total, err
	}

	// 再查询分页数据
	if err := r.db.Table("attendances as a").
		Select(`a.*, e.employee_name,e.position`).
		Joins("LEFT JOIN employees as e ON a.employee_id = e.employee_id").
		Where("a.month = ? AND a.project_id = ?", month, projectID).
		Offset(offset).
		Limit(limit).
		Find(&attendances).Error; err != nil {
		return attendances, total, err
	}
	return attendances, total, nil
}

func (r *AttendanceRepository) Update(attendance *model.Attendances) error {
	return r.db.Save(attendance).Error
}

func (r *AttendanceRepository) Delete(id uint) error {
	return r.db.Delete(&model.Attendances{}, id).Error
}

func (r *AttendanceRepository) GetByEmployeeIDAndMonth(employeeID, month string, projectID int) (*model.Attendances, error) {
	var attendance model.Attendances
	err := r.db.Where("employee_id = ? AND month = ? AND project_id = ?", employeeID, month, projectID).First(&attendance).Error
	if err != nil {
		return nil, err
	}
	return &attendance, nil
}
