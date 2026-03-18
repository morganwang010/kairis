package repository

import (
	"kairis/backend/internal/model"

	"gorm.io/gorm"
)

type TaxRateRepository struct {
	db *gorm.DB
}

func NewTaxRateRepository(db *gorm.DB) *TaxRateRepository {
	return &TaxRateRepository{db: db}
}

func (r *TaxRateRepository) Create(taxRate *model.TaxRates) error {
	return r.db.Create(taxRate).Error
}

func (r *TaxRateRepository) Get(id uint) (*model.TaxRates, error) {
	var taxRate model.TaxRates
	if err := r.db.First(&taxRate, id).Error; err != nil {
		return nil, err
	}
	return &taxRate, nil
}

func (r *TaxRateRepository) List() ([]model.TaxRates, error) {
	var taxRates []model.TaxRates
	if err := r.db.Find(&taxRates).Error; err != nil {
		return nil, err
	}
	return taxRates, nil
}

func (r *TaxRateRepository) Update(taxRate *model.TaxRates) error {
	return r.db.Save(taxRate).Error
}

func (r *TaxRateRepository) Delete(id uint) error {
	return r.db.Delete(&model.TaxRates{}, id).Error
}

func (r *TaxRateRepository) GetByGrade(grade string) ([]model.TaxRates, error) {
	var taxRates []model.TaxRates
	// 使用更精确的LIKE模式来匹配，确保能区分K/3和TK/3
	// 匹配模式：grade在开头、中间或结尾，并且前后都有逗号边界
	if err := r.db.Where("grade LIKE ? OR grade LIKE ? OR grade LIKE ? OR grade = ?",
		grade+",%",      // 匹配 "grade,xxx" (grade在开头)
		"%,"+grade+",%", // 匹配 "xxx,grade,yyy" (grade在中间)
		"%,"+grade,      // 匹配 "xxx,grade" (grade在结尾)
		grade).Find(&taxRates).Error; err != nil {
		return nil, err
	}
	return taxRates, nil
}
