package repository

import (
	"kairis/backend/internal/model"

	"gorm.io/gorm"
)

type FlightRawRepository struct {
	db *gorm.DB
}

func NewFlightRawRepository(db *gorm.DB) *FlightRawRepository {
	return &FlightRawRepository{db: db}
}

func (r *FlightRawRepository) Create(raw *model.FlightRaw) error {
	return r.db.Create(raw).Error
}

func (r *FlightRawRepository) CreateBatch(raws []model.FlightRaw) error {
	return r.db.Create(&raws).Error
}

func (r *FlightRawRepository) List(employeeID uint64, importMonth string) ([]model.FlightRaw, error) {
	var raws []model.FlightRaw
	query := r.db.Model(&model.FlightRaw{})
	if employeeID != 0 {
		query = query.Where("employee_id = ?", employeeID)
	}
	if importMonth != "" {
		query = query.Where("import_month = ?", importMonth)
	}
	if err := query.Order("depart_time ASC").Find(&raws).Error; err != nil {
		return nil, err
	}
	return raws, nil
}

func (r *FlightRawRepository) DeleteByEmployeeIDAndMonth(employeeID uint64, importMonth string) error {
	return r.db.Where("employee_id = ? AND import_month = ?", employeeID, importMonth).Delete(&model.FlightRaw{}).Error
}

func (r *FlightRawRepository) UpdateTripStatus(id uint, status string) error {
	return r.db.Model(&model.FlightRaw{}).Where("id = ?", id).Update("trip_status", status).Error
}
