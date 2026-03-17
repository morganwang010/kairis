package service

import (
	"kairis/backend/internal/model"
	"kairis/backend/internal/repository"
)

type EmployeeService struct {
	employeeRepo *repository.EmployeeRepository
}

func NewEmployeeService(employeeRepo *repository.EmployeeRepository) *EmployeeService {
	return &EmployeeService{employeeRepo: employeeRepo}
}

func (s *EmployeeService) Create(employee *model.Employee) error {
	return s.employeeRepo.Create(employee)
}

func (s *EmployeeService) Get(id uint) (*model.Employee, error) {
	return s.employeeRepo.Get(id)
}

func (s *EmployeeService) List() ([]model.Employee, error) {
	return s.employeeRepo.List()
}

func (s *EmployeeService) Update(employee *model.Employee) error {
	return s.employeeRepo.Update(employee)
}

func (s *EmployeeService) Delete(id uint) error {
	return s.employeeRepo.Delete(id)
}

type ImportEmployeeRequest struct {
	Employees []ImportEmployeeItem `json:"employees"`
}

type ImportEmployeeItem struct {
	EmployeeID string `json:"employee_id"`
	FullName   string `json:"full_name"`
	Position   string `json:"position"`
	Department string `json:"department"`
	Email      string `json:"email"`
	Phone      string `json:"phone"`
	JoinDate   string `json:"join_date"`
	Status     string `json:"status"`
}

func (s *EmployeeService) ImportEmployee(req ImportEmployeeRequest) error {
	for _, employee := range req.Employees {
		employeeModel := &model.Employee{
			EmployeeID: employee.EmployeeID,
			FullName:   employee.FullName,
			Position:   employee.Position,
			Department: employee.Department,
			Email:      employee.Email,
			Phone:      employee.Phone,
			JoinDate:   employee.JoinDate,
			Status:     employee.Status,
		}

		existingEmployee, err := s.employeeRepo.GetByEmployeeID(employee.EmployeeID)
		if err == nil && existingEmployee != nil {
			employeeModel.ID = existingEmployee.ID
			if err := s.employeeRepo.Update(employeeModel); err != nil {
				return err
			}
		} else {
			if err := s.employeeRepo.Create(employeeModel); err != nil {
				return err
			}
		}
	}
	return nil
}
