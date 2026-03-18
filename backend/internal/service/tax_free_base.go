package service

import (
	"kairis/backend/internal/model"
	"kairis/backend/internal/repository"
)

type TaxFreeBaseService struct {
	taxFreeBaseRepo *repository.TaxFreeBaseRepository
}

func NewTaxFreeBaseService(taxFreeBaseRepo *repository.TaxFreeBaseRepository) *TaxFreeBaseService {
	return &TaxFreeBaseService{taxFreeBaseRepo: taxFreeBaseRepo}
}

func (s *TaxFreeBaseService) Create(taxFreeBase *model.TaxFreeBases) error {
	return s.taxFreeBaseRepo.Create(taxFreeBase)
}

func (s *TaxFreeBaseService) Get(id uint) (*model.TaxFreeBases, error) {
	return s.taxFreeBaseRepo.Get(id)
}

func (s *TaxFreeBaseService) List() ([]model.TaxFreeBases, error) {
	return s.taxFreeBaseRepo.List()
}

func (s *TaxFreeBaseService) Update(taxFreeBase *model.TaxFreeBases) error {
	return s.taxFreeBaseRepo.Update(taxFreeBase)
}

func (s *TaxFreeBaseService) Delete(id uint) error {
	return s.taxFreeBaseRepo.Delete(id)
}
