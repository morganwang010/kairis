package repository

import (
	"kairis/backend/internal/model"

	"gorm.io/gorm"
)

type SalaryRepository struct {
	db *gorm.DB
}

func NewSalaryRepository(db *gorm.DB) *SalaryRepository {
	return &SalaryRepository{db: db}
}

func (r *SalaryRepository) Create(salary *model.Salaries) error {
	return r.db.Create(salary).Error
}

func (r *SalaryRepository) Get(id uint) (*model.Salaries, error) {
	var salary model.Salaries
	if err := r.db.First(&salary, id).Error; err != nil {
		return nil, err
	}
	return &salary, nil
}

func (r *SalaryRepository) List() ([]model.Salaries, error) {
	var salaries []model.Salaries
	if err := r.db.Find(&salaries).Error; err != nil {
		return nil, err
	}
	return salaries, nil
}

func (r *SalaryRepository) Update(salary *model.Salaries) error {
	return r.db.Save(salary).Error
}

func (r *SalaryRepository) Delete(id uint) error {
	return r.db.Delete(&model.Salaries{}, id).Error
}
