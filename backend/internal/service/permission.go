package service

import (
	"kairis/backend/internal/model"
	"kairis/backend/internal/repository"
)

type PermissionService struct {
	permissionRepo *repository.PermissionRepository
}

func NewPermissionService(permissionRepo *repository.PermissionRepository) *PermissionService {
	return &PermissionService{
		permissionRepo: permissionRepo,
	}
}

func (s *PermissionService) CreatePermission(permission *model.Permission) error {
	return s.permissionRepo.Create(permission)
}

func (s *PermissionService) GetPermissionByID(id string) (*model.Permission, error) {
	return s.permissionRepo.GetByID(id)
}

func (s *PermissionService) ListPermissions(offset, limit int) ([]model.Permission, int64, error) {
	return s.permissionRepo.List(offset, limit)
}

func (s *PermissionService) UpdatePermission(permission *model.Permission) error {
	return s.permissionRepo.Update(permission)
}

func (s *PermissionService) DeletePermission(id string) error {
	return s.permissionRepo.Delete(id)
}
