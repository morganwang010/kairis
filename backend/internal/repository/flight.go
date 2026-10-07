package repository

import (
	"kairis/backend/internal/model"

	"gorm.io/gorm"
)

type FlightRepository struct {
	db *gorm.DB
}

// FlightWithEmployee 带员工信息的航班记录
type FlightWithEmployee struct {
	model.Flights
	EmployeeName string `gorm:"column:employee_name" json:"employee_name"`
}

func NewFlightRepository(db *gorm.DB) *FlightRepository {
	return &FlightRepository{db: db}
}

func (r *FlightRepository) Create(flight *model.Flights) error {
	return r.db.Create(flight).Error
}

func (r *FlightRepository) GetByID(id uint) (*model.Flights, error) {
	var flight model.Flights
	err := r.db.First(&flight, id).Error
	if err != nil {
		return nil, err
	}
	return &flight, nil
}

func (r *FlightRepository) List(offset, limit int, projectID, month, employeeID, employeeName string) ([]FlightWithEmployee, int64, error) {
	var flights []FlightWithEmployee
	var total int64

	query := r.db.Table("flights as f").
		Joins("LEFT JOIN employees as e ON f.employee_id = e.employee_id").
		Where("f.month = ?", month)

	if projectID != "" && projectID != "0" {
		query = query.Where("f.project_id = ?", projectID)
	}
	if employeeID != "" {
		query = query.Where("f.employee_id = ?", employeeID)
	}
	if employeeName != "" {
		query = query.Where("e.employee_name LIKE ?", "%"+employeeName+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return flights, total, err
	}

	if err := query.
		Select(`f.*, e.employee_name`).
		Order("f.employee_id DESC").
		Offset(offset).
		Limit(limit).
		Find(&flights).Error; err != nil {
		return flights, total, err
	}
	return flights, total, nil
}

func (r *FlightRepository) Update(flight *model.Flights) error {
	return r.db.Save(flight).Error
}

func (r *FlightRepository) Delete(id uint) error {
	return r.db.Delete(&model.Flights{}, id).Error
}

func (r *FlightRepository) DeleteByIDs(ids []uint) error {
	if len(ids) == 0 {
		return nil
	}
	return r.db.Where("id IN ?", ids).Delete(&model.Flights{}).Error
}

// GetByEmployeeIDAndMonth 根据员工ID、月份和项目ID查询记录（用于导入时判断是否存在）
func (r *FlightRepository) GetByEmployeeIDAndMonth(employeeID, month string, projectID int) ([]model.Flights, error) {
	var flights []model.Flights
	err := r.db.Where("employee_id = ? AND month = ? AND project_id = ?", employeeID, month, projectID).Find(&flights).Error
	if err != nil {
		return nil, err
	}
	return flights, nil
}
