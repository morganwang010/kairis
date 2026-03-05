package service

import (
	"kairis/backend/internal/model"
	"kairis/backend/internal/repository"
)

type RoleService struct {
	roleRepo       *repository.RoleRepository
	permissionRepo *repository.PermissionRepository
}

func NewRoleService(roleRepo *repository.RoleRepository, permissionRepo *repository.PermissionRepository) *RoleService {
	return &RoleService{
		roleRepo:       roleRepo,
		permissionRepo: permissionRepo,
	}
}

func (s *RoleService) CreateRole(role *model.Role) error {
	return s.roleRepo.Create(role)
}

func (s *RoleService) GetRoleByID(id string) (*model.Role, error) {
	return s.roleRepo.GetByID(id)
}

func (s *RoleService) ListRoles(offset, limit int) ([]model.Role, int64, error) {
	return s.roleRepo.List(offset, limit)
}

func (s *RoleService) UpdateRole(role *model.Role) error {
	return s.roleRepo.Update(role)
}

func (s *RoleService) DeleteRole(id string) error {
	return s.roleRepo.Delete(id)
}

func (s *RoleService) AssignPermissions(roleID string, permissionIDs []string) error {
	role, err := s.roleRepo.GetByID(roleID)
	if err != nil {
		return err
	}

	var permissions []model.Permission
	for _, permID := range permissionIDs {
		perm, err := s.permissionRepo.GetByID(permID)
		if err != nil {
			continue
		}
		permissions = append(permissions, *perm)
	}

	role.Permissions = permissions
	return s.roleRepo.Update(role)
}
