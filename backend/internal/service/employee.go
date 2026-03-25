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
	EmployeeID      string  `json:"employee_id"`
	ProjectID       int     `json:"project_id"`
	EmployeeName    string  `json:"employee_name"`
	Department      string  `json:"department"`
	Position        string  `json:"position"`
	HireDate        string  `json:"hire_date"`
	LeaveDate       string  `json:"leave_date"`
	Salary          float64 `json:"salary"`
	IdCard          string  `json:"id_card"`
	Npwp            string  `json:"npwp"`
	HierarchyID     string  `json:"hierarchy_id"`
	HierarchyName   string  `json:"hierarchy_name"`
	JoinDate        string  `json:"join_date"`
	ResignDate      string  `json:"resign_date"`
	Email           string  `json:"email"`
	Phone           string  `json:"phone"`
	BasicSalary     float64 `json:"basic_salary"`
	HousingAlw      float64 `json:"housing_alw"`
	PositionAlw     float64 `json:"position_alw"`
	FieldAlw        float64 `json:"field_alw"`
	FixAlw          float64 `json:"fix_alw"`
	MealAlwDay      float64 `json:"meal_alw_day"`
	TranspAlwDay    float64 `json:"transp_alw_day"`
	PulsaAlwDay     float64 `json:"pulsa_alw_day"`
	AttAlwDay       float64 `json:"att_alw_day"`
	TaxType         string  `json:"tax_type"`
	LocationName    string  `json:"location_name"`
	PulsaAlwMonth   float64 `json:"pulsa_alw_month"`
	HousingAlwTetap float64 `json:"housing_alw_tetap"`
	DeleteFlag      int     `json:"delete_flag"`
}

func (s *EmployeeService) ImportEmployee(req ImportEmployeeRequest) error {
	for _, employee := range req.Employees {
		employeeModel := &model.Employee{
			EmployeeID:      employee.EmployeeID,
			ProjectID:       employee.ProjectID,
			EmployeeName:    employee.EmployeeName,
			Department:      employee.Department,
			Position:        employee.Position,
			HireDate:        employee.HireDate,
			LeaveDate:       employee.LeaveDate,
			Salary:          employee.Salary,
			IdCard:          employee.IdCard,
			Npwp:            employee.Npwp,
			HierarchyID:     employee.HierarchyID,
			HierarchyName:   employee.HierarchyName,
			Email:           employee.Email,
			BasicSalary:     employee.BasicSalary,
			HousingAlw:      employee.HousingAlw,
			PositionAlw:     employee.PositionAlw,
			FieldAlw:        employee.FieldAlw,
			FixAlw:          employee.FixAlw,
			MealAlwDay:      employee.MealAlwDay,
			TranspAlwDay:    employee.TranspAlwDay,
			PulsaAlwDay:     employee.PulsaAlwDay,
			AttAlwDay:       employee.AttAlwDay,
			TaxType:         employee.TaxType,
			LocationName:    employee.LocationName,
			PulsaAlwMonth:   employee.PulsaAlwMonth,
			HousingAlwTetap: employee.HousingAlwTetap,
			DeleteFlag:      employee.DeleteFlag,
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

// TotalEmployees 获取员工总数（在职员工）
func (s *EmployeeService) TotalEmployees() (int64, error) {
	return s.employeeRepo.TotalEmployees()
}
