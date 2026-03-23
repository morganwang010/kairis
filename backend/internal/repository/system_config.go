package repository

import (
	"kairis/backend/internal/model"

	"gorm.io/gorm"
)

type SystemConfigRepository struct {
	db *gorm.DB
}

func NewSystemConfigRepository(db *gorm.DB) *SystemConfigRepository {
	return &SystemConfigRepository{db: db}
}

func (r *SystemConfigRepository) Create(systemConfig *model.SystemConfig) error {
	return r.db.Create(systemConfig).Error
}

func (r *SystemConfigRepository) Get(id uint) (*model.SystemConfig, error) {
	var systemConfig model.SystemConfig
	if err := r.db.First(&systemConfig, id).Error; err != nil {
		return nil, err
	}
	return &systemConfig, nil
}

func (r *SystemConfigRepository) GetByName(name string) (*model.SystemConfig, error) {
	var systemConfig model.SystemConfig
	if err := r.db.Where("name = ?", name).First(&systemConfig).Error; err != nil {
		return nil, err
	}
	return &systemConfig, nil
}

func (r *SystemConfigRepository) List() ([]model.SystemConfig, error) {
	var systemConfigs []model.SystemConfig
	if err := r.db.Find(&systemConfigs).Error; err != nil {
		return nil, err
	}
	return systemConfigs, nil
}

func (r *SystemConfigRepository) Update(systemConfig *model.SystemConfig) error {
	return r.db.Save(systemConfig).Error
}

func (r *SystemConfigRepository) Delete(id uint) error {
	return r.db.Delete(&model.SystemConfig{}, id).Error
}
