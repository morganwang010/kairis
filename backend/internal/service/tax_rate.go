package service

import (
	"kairis/backend/internal/model"
	"kairis/backend/internal/repository"
)

type TaxRateService struct {
	taxRateRepo *repository.TaxRateRepository
}

func NewTaxRateService(taxRateRepo *repository.TaxRateRepository) *TaxRateService {
	return &TaxRateService{taxRateRepo: taxRateRepo}
}

func (s *TaxRateService) Create(taxRate *model.TaxRates) error {
	return s.taxRateRepo.Create(taxRate)
}

func (s *TaxRateService) Get(id uint) (*model.TaxRates, error) {
	return s.taxRateRepo.Get(id)
}

func (s *TaxRateService) List() ([]model.TaxRates, error) {
	return s.taxRateRepo.List()
}

func (s *TaxRateService) Update(taxRate *model.TaxRates) error {
	return s.taxRateRepo.Update(taxRate)
}

func (s *TaxRateService) Delete(id uint) error {
	return s.taxRateRepo.Delete(id)
}

func (s *TaxRateService) GetByGrade(grade string) ([]model.TaxRates, error) {
	return s.taxRateRepo.GetByGrade(grade)
}
