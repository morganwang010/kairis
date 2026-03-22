package service

import (
	"kairis/backend/internal/model"
	"kairis/backend/internal/repository"
)

type SalaryCoefficientService struct {
	salaryCoefficientRepo *repository.SalaryCoefficientRepository
}

func NewSalaryCoefficientService(salaryCoefficientRepo *repository.SalaryCoefficientRepository) *SalaryCoefficientService {
	return &SalaryCoefficientService{salaryCoefficientRepo: salaryCoefficientRepo}
}

func (s *SalaryCoefficientService) Create(salaryCoefficient *model.SalaryCoefficient) error {
	return s.salaryCoefficientRepo.Create(salaryCoefficient)
}

func (s *SalaryCoefficientService) Get(id uint) (*model.SalaryCoefficient, error) {
	return s.salaryCoefficientRepo.Get(id)
}

func (s *SalaryCoefficientService) List() ([]model.SalaryCoefficient, error) {
	return s.salaryCoefficientRepo.List()
}

func (s *SalaryCoefficientService) Update(salaryCoefficient *model.SalaryCoefficient) error {
	return s.salaryCoefficientRepo.Update(salaryCoefficient)
}

func (s *SalaryCoefficientService) Delete(id uint) error {
	return s.salaryCoefficientRepo.Delete(id)
}
