package repository

import (
	"kairis/backend/internal/model"

	"gorm.io/gorm"
)

type SalaryCoefficientRepository struct {
	db *gorm.DB
}

func NewSalaryCoefficientRepository(db *gorm.DB) *SalaryCoefficientRepository {
	return &SalaryCoefficientRepository{db: db}
}

func (r *SalaryCoefficientRepository) Create(salaryCoefficient *model.SalaryCoefficient) error {
	return r.db.Create(salaryCoefficient).Error
}

func (r *SalaryCoefficientRepository) Get(id uint) (*model.SalaryCoefficient, error) {
	var salaryCoefficient model.SalaryCoefficient
	if err := r.db.First(&salaryCoefficient, id).Error; err != nil {
		return nil, err
	}
	return &salaryCoefficient, nil
}

func (r *SalaryCoefficientRepository) List() ([]model.SalaryCoefficient, error) {
	var salaryCoefficients []model.SalaryCoefficient
	if err := r.db.Find(&salaryCoefficients).Error; err != nil {
		return nil, err
	}
	return salaryCoefficients, nil
}

func (r *SalaryCoefficientRepository) Update(salaryCoefficient *model.SalaryCoefficient) error {
	return r.db.Save(salaryCoefficient).Error
}

func (r *SalaryCoefficientRepository) Delete(id uint) error {
	return r.db.Delete(&model.SalaryCoefficient{}, id).Error
}
