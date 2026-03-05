package repository

import (
	"kairis/backend/internal/model"

	"gorm.io/gorm"
)

type PermissionRepository struct {
	db *gorm.DB
}

func NewPermissionRepository(db *gorm.DB) *PermissionRepository {
	return &PermissionRepository{db: db}
}

func (r *PermissionRepository) Create(permission *model.Permission) error {
	return r.db.Create(permission).Error
}

func (r *PermissionRepository) GetByID(id string) (*model.Permission, error) {
	var permission model.Permission
	err := r.db.First(&permission, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &permission, nil
}

func (r *PermissionRepository) List(offset, limit int) ([]model.Permission, int64, error) {
	var permissions []model.Permission
	var total int64

	if err := r.db.Model(&model.Permission{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := r.db.Offset(offset).Limit(limit).Find(&permissions).Error
	return permissions, total, err
}

func (r *PermissionRepository) Update(permission *model.Permission) error {
	return r.db.Save(permission).Error
}

func (r *PermissionRepository) Delete(id string) error {
	return r.db.Delete(&model.Permission{}, "id = ?", id).Error
}
