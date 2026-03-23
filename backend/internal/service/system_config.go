package service

import (
	"kairis/backend/internal/model"
	"kairis/backend/internal/repository"
)

type SystemConfigService struct {
	systemConfigRepo *repository.SystemConfigRepository
}

func NewSystemConfigService(systemConfigRepo *repository.SystemConfigRepository) *SystemConfigService {
	return &SystemConfigService{systemConfigRepo: systemConfigRepo}
}

func (s *SystemConfigService) Create(systemConfig *model.SystemConfig) error {
	return s.systemConfigRepo.Create(systemConfig)
}

func (s *SystemConfigService) Get(id uint) (*model.SystemConfig, error) {
	return s.systemConfigRepo.Get(id)
}

func (s *SystemConfigService) GetByName(name string) (*model.SystemConfig, error) {
	return s.systemConfigRepo.GetByName(name)
}

func (s *SystemConfigService) List() ([]model.SystemConfig, error) {
	return s.systemConfigRepo.List()
}

func (s *SystemConfigService) Update(systemConfig *model.SystemConfig) error {
	return s.systemConfigRepo.Update(systemConfig)
}

func (s *SystemConfigService) Delete(id uint) error {
	return s.systemConfigRepo.Delete(id)
}
