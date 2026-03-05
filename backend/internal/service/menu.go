package service

import (
	"kairis/backend/internal/model"
	"kairis/backend/internal/repository"
)

type MenuService struct {
	menuRepo *repository.MenuRepository
}

func NewMenuService(menuRepo *repository.MenuRepository) *MenuService {
	return &MenuService{
		menuRepo: menuRepo,
	}
}

func (s *MenuService) CreateMenu(menu *model.Menu) error {
	return s.menuRepo.Create(menu)
}

func (s *MenuService) GetMenuByID(id string) (*model.Menu, error) {
	return s.menuRepo.GetByID(id)
}

func (s *MenuService) ListMenus(offset, limit int) ([]model.Menu, int64, error) {
	return s.menuRepo.List(offset, limit)
}

func (s *MenuService) GetMenuTree() ([]model.Menu, error) {
	return s.menuRepo.Tree()
}

func (s *MenuService) UpdateMenu(menu *model.Menu) error {
	return s.menuRepo.Update(menu)
}

func (s *MenuService) DeleteMenu(id string) error {
	return s.menuRepo.Delete(id)
}

func (s *MenuService) AssignPermissions(menuID string, permissionIDs []string) error {
	menu, err := s.menuRepo.GetByID(menuID)
	if err != nil {
		return err
	}

	var permissions []model.Permission
	for _, permID := range permissionIDs {
		perm, err := s.menuRepo.GetByID(permID)
		if err != nil {
			continue
		}
		permissions = append(permissions, perm.Permissions...)
	}

	menu.Permissions = permissions
	return s.menuRepo.Update(menu)
}
