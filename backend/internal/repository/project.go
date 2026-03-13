package repository

import (
	"kairis/backend/internal/model"

	"gorm.io/gorm"
)

type ProjectRepository struct {
	db *gorm.DB
}

func NewProjectRepository(db *gorm.DB) *ProjectRepository {
	return &ProjectRepository{db: db}
}

func (r *ProjectRepository) Create(project *model.Project) error {
	return r.db.Create(project).Error
}

func (r *ProjectRepository) GetByID(id string) (*model.Project, error) {
	var project model.Project
	err := r.db.First(&project, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &project, nil
}

func (r *ProjectRepository) List(offset, limit int) ([]model.Project, int64, error) {
	var projects []model.Project
	var total int64

	if err := r.db.Model(&model.Project{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := r.db.Offset(offset).Limit(limit).Find(&projects).Error
	return projects, total, err
}

func (r *ProjectRepository) Update(project *model.Project) error {
	return r.db.Save(project).Error
}

func (r *ProjectRepository) Delete(id string) error {
	return r.db.Delete(&model.Project{}, "id = ?", id).Error
}
