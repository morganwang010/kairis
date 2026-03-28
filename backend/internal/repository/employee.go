package repository

import (
	"kairis/backend/internal/model"

	"gorm.io/gorm"
)

type EmployeeRepository struct {
	db *gorm.DB
}

func NewEmployeeRepository(db *gorm.DB) *EmployeeRepository {
	return &EmployeeRepository{db: db}
}

func (r *EmployeeRepository) Create(employee *model.Employee) error {
	return r.db.Create(employee).Error
}

func (r *EmployeeRepository) Get(id uint) (*model.Employee, error) {
	var employee model.Employee
	if err := r.db.First(&employee, id).Error; err != nil {
		return nil, err
	}
	return &employee, nil
}

func (r *EmployeeRepository) List() ([]model.Employee, error) {
	var employees []model.Employee
	if err := r.db.Find(&employees).Error; err != nil {
		return nil, err
	}
	return employees, nil
}

func (r *EmployeeRepository) Update(employee *model.Employee) error {
	return r.db.Save(employee).Error
}

func (r *EmployeeRepository) Delete(id uint) error {
	return r.db.Delete(&model.Employee{}, id).Error
}

func (r *EmployeeRepository) GetByEmployeeID(employeeID string) ([]model.Employee, error) {
	var employees []model.Employee
	if err := r.db.Where("employee_id = ?", employeeID).Find(&employees).Error; err != nil {
		return nil, err
	}
	return employees, nil
}

// GetByEmployeeName 根据员工姓名查询
func (r *EmployeeRepository) GetByEmployeeName(employeeName string) ([]model.Employee, error) {
	var employees []model.Employee
	if err := r.db.Where("employee_name like ?", "%"+employeeName+"%").Find(&employees).Error; err != nil {
		return nil, err
	}
	return employees, nil
}

// GetByLocationName 根据地点名称查询
func (r *EmployeeRepository) GetByLocationName(locationName string) ([]model.Employee, error) {
	var employees []model.Employee
	if err := r.db.Where("location_name like ?", "%"+locationName+"%").Find(&employees).Error; err != nil {
		return nil, err
	}
	return employees, nil
}

// TotalEmployees 获取员工总数（在职员工）
func (r *EmployeeRepository) TotalEmployees() (int64, error) {
	var count int64
	// if err := r.db.Model(&model.Employee{}).Where("status = ?", "active").Count(&count).Error; err != nil {
	if err := r.db.Model(&model.Employee{}).Count(&count).Error; err != nil {

		return 0, err

	}
	return count, nil
}
