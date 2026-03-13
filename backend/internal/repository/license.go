package repository

import (
	"kairis/backend/internal/model"
	"time"

	"gorm.io/gorm"
)

type LicenseRepository struct {
	db *gorm.DB
}

func NewLicenseRepository(db *gorm.DB) *LicenseRepository {
	return &LicenseRepository{db: db}
}

func (r *LicenseRepository) Create(license *model.License) error {
	return r.db.Create(license).Error
}

func (r *LicenseRepository) GetByID(id int) (*model.License, error) {
	var license model.License
	err := r.db.First(&license, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &license, nil
}

func (r *LicenseRepository) GetByLicenseKey(licenseKey string) (*model.License, error) {
	var license model.License
	err := r.db.First(&license, "license_key = ?", licenseKey).Error
	if err != nil {
		return nil, err
	}
	return &license, nil
}

func (r *LicenseRepository) List(offset, limit int) ([]model.License, int64, error) {
	var licenses []model.License
	var total int64

	if err := r.db.Model(&model.License{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := r.db.Offset(offset).Limit(limit).Find(&licenses).Error
	return licenses, total, err
}

func (r *LicenseRepository) Update(license *model.License) error {
	return r.db.Save(license).Error
}

func (r *LicenseRepository) Delete(id int) error {
	return r.db.Delete(&model.License{}, "id = ?", id).Error
}

func (r *LicenseRepository) CheckLicense() (*model.License, error) {
	var license model.License
	// 获取当前日期并比较是否过期
	currentDate := time.Now().Format("2006-01-02")
	err := r.db.First(&license, "expiration_date >= ?", currentDate).Error
	if err != nil {
		return nil, err
	}
	return &license, nil
}
