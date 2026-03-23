package service

import (
	"kairis/backend/internal/model"
	"kairis/backend/internal/repository"
)

type SalarySlipService struct {
	salarySlipRepo *repository.SalaryRepository
}

func NewSalarySlipService(salarySlipRepo *repository.SalaryRepository) *SalarySlipService {
	return &SalarySlipService{salarySlipRepo: salarySlipRepo}
}

func (s *SalarySlipService) Create(salarySlip *model.Salaries) error {
	return s.salarySlipRepo.Create(salarySlip)
}

func (s *SalarySlipService) ListSalarySlips(offset, limit int, month string, projectID int) ([]model.Salaries, int64, error) {
	salarySlips, total, err := s.salarySlipRepo.ListSalarySlips(offset, limit, month, projectID)
	if err != nil {
		return nil, 0, err
	}
	return salarySlips, total, nil
}

func (s *SalarySlipService) UpdateSalarySlip(salarySlip *model.Salaries) error {
	return s.salarySlipRepo.UpdateSalarySlip(salarySlip)
}

func (s *SalarySlipService) Delete(id uint) error {
	return s.salarySlipRepo.Delete(id)
}

func (s *SalarySlipService) GetByEmployeeIDAndMonth(employeeID string, month string, projectID int) (*model.Salaries, error) {
	return s.salarySlipRepo.GetByEmployeeIDAndMonth(employeeID, month, projectID)
}
