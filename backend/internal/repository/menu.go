package repository

import (
	"kairis/backend/internal/model"

	"gorm.io/gorm"
)

type MenuRepository struct {
	db *gorm.DB
}

func NewMenuRepository(db *gorm.DB) *MenuRepository {
	return &MenuRepository{db: db}
}

func (r *MenuRepository) Create(menu *model.Menu) error {
	return r.db.Create(menu).Error
}

func (r *MenuRepository) GetByID(id string) (*model.Menu, error) {
	var menu model.Menu
	err := r.db.Preload("Permissions").First(&menu, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &menu, nil
}

func (r *MenuRepository) List(offset, limit int) ([]model.Menu, int64, error) {
	var menus []model.Menu
	var total int64

	if err := r.db.Model(&model.Menu{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := r.db.Order("sort ASC").Offset(offset).Limit(limit).Find(&menus).Error
	return menus, total, err
}

func (r *MenuRepository) Tree() ([]model.Menu, error) {
	var menus []model.Menu
	err := r.db.Where("parent_id IS NULL").Preload("Children").Preload("Children.Children").Order("sort ASC").Find(&menus).Error
	return menus, err
}

func (r *MenuRepository) Update(menu *model.Menu) error {
	return r.db.Save(menu).Error
}

func (r *MenuRepository) Delete(id string) error {
	return r.db.Delete(&model.Menu{}, "id = ?", id).Error
}
