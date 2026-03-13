package service

import (
	"kairis/backend/internal/model"
	"kairis/backend/internal/repository"
)

type ProjectService struct {
	projectRepo *repository.ProjectRepository
}

func NewProjectService(projectRepo *repository.ProjectRepository) *ProjectService {
	return &ProjectService{
		projectRepo: projectRepo,
	}
}

func (s *ProjectService) CreateProject(project *model.Project) error {
	return s.projectRepo.Create(project)
}

func (s *ProjectService) GetProjectByID(id string) (*model.Project, error) {
	return s.projectRepo.GetByID(id)
}

func (s *ProjectService) ListProjects(offset, limit int) ([]model.Project, int64, error) {
	return s.projectRepo.List(offset, limit)
}

func (s *ProjectService) UpdateProject(project *model.Project) error {
	return s.projectRepo.Update(project)
}

func (s *ProjectService) DeleteProject(id string) error {
	return s.projectRepo.Delete(id)
}
