package service

import (
	"kairis/backend/internal/model"
	"kairis/backend/internal/repository"
	"log/slog"

	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	userRepo *repository.UserRepository
	roleRepo *repository.RoleRepository
}

func NewUserService(userRepo *repository.UserRepository, roleRepo *repository.RoleRepository) *UserService {
	return &UserService{
		userRepo: userRepo,
		roleRepo: roleRepo,
	}
}

func (s *UserService) CreateUser(user *model.User) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user.Password = string(hashedPassword)
	return s.userRepo.Create(user)
}

func (s *UserService) GetUserByID(id string) (*model.User, error) {
	return s.userRepo.GetByID(id)
}

func (s *UserService) GetUserByUsername(username string) (*model.User, error) {
	return s.userRepo.GetByUsername(username)
}

func (s *UserService) ListUsers(offset, limit int) ([]model.User, int64, error) {
	return s.userRepo.List(offset, limit)
}

func (s *UserService) UpdateUser(user *model.User) error {
	return s.userRepo.Update(user)
}

func (s *UserService) DeleteUser(id string) error {
	return s.userRepo.Delete(id)
}

func (s *UserService) ValidatePassword(user *model.User, password string) bool {
	slog.Info("ValidatePassword", "user.Password", user.Password, "password", password)
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	return err == nil
}

func (s *UserService) GetUserPermissions(userID string) ([]string, error) {
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, err
	}

	permissions := make(map[string]bool)
	for _, role := range user.Roles {
		for _, perm := range role.Permissions {
			permissions[perm.Code] = true
		}
	}

	result := make([]string, 0, len(permissions))
	for perm := range permissions {
		result = append(result, perm)
	}

	return result, nil
}
