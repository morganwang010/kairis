package service

import (
	"fmt"
	"kairis/backend/internal/model"
	"kairis/backend/internal/repository"
	"log/slog"
	"time"

	"gorm.io/gorm"
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

func (s *EmployeeService) List(offset, pageSize int, projectID uint) ([]model.Employee, int64, error) {
	return s.employeeRepo.List(offset, pageSize, projectID)
}

func (s *EmployeeService) Update(employee *model.Employee) error {
	return s.employeeRepo.Update(employee)
}

func (s *EmployeeService) Delete(id uint) error {
	return s.employeeRepo.Delete(id)
}

// GetByEmployeeID 根据员工ID查询
func (s *EmployeeService) GetByEmployeeID(employeeID string, projectID uint) ([]model.Employee, error) {
	return s.employeeRepo.GetByEmployeeID(employeeID, projectID)
}

// GetByEmployeeName 根据员工姓名查询
func (s *EmployeeService) GetByEmployeeName(employeeName string) ([]model.Employee, error) {
	return s.employeeRepo.GetByEmployeeName(employeeName)
}

// GetByLocationName 根据地点名称查询
func (s *EmployeeService) GetByLocationName(locationName string) ([]model.Employee, error) {
	return s.employeeRepo.GetByLocationName(locationName)
}

type ImportEmployeeRequest struct {
	Employees []ImportEmployeeItem `json:"employees"`
}

type ImportEmployeeItem struct {
	EmployeeID               string  `json:"employee_id"`
	ProjectID                int     `json:"project_id"`
	EmployeeName             string  `json:"employee_name"`
	Department               string  `json:"department"`
	Position                 string  `json:"position"`
	Salary                   float64 `json:"salary"`
	IdCard                   string  `json:"idcard_number"`
	Npwp                     string  `json:"npwp"`
	HierarchyID              string  `json:"hierarchy_id"`
	HierarchyName            string  `json:"hierarchy_name"`
	JoinDate                 string  `json:"join_date"`
	ResignDate               string  `json:"resign"`
	Email                    string  `json:"email"`
	Phone                    string  `json:"phone"`
	BasicSalary              float64 `json:"basic_salary"`
	HousingAlw               float64 `json:"housing_alw"`
	PositionAlw              float64 `json:"position_alw"`
	FieldAlw                 float64 `json:"field_alw"`
	FixAlw                   float64 `json:"fix_alw"`
	MealAlwDay               float64 `json:"meal_alw_day"`
	TranspAlwDay             float64 `json:"transp_alw_day"`
	MealAlwMonth             float64 `json:"meal_alw_month"`
	TranspAlwMonth           float64 `json:"transp_alw_month"`
	PulsaAlwDay              float64 `json:"pulsa_alw_day"`
	AttAlwDay                float64 `json:"att_alw_day"`
	TaxType                  string  `json:"tax_status"`
	LocationName             string  `json:"location_name"`
	PulsaAlwMonth            float64 `json:"pulsa_alw_month"`
	HousingAlwTetap          float64 `json:"housing_alw_tetap"`
	DeleteFlag               int     `json:"delete_flag"`
	OtDrv                    float64 `json:"ot_drv"`
	IdStatus                 string  `json:"id_status"`
	OtStatus                 string  `json:"ot_status"`
	BPJSHealthTambahanStatus string  `json:"bpjs_health_tambahan_status"` // INTEGER default 0
	DateOfBirth              string  `json:"date_of_birth"`
	PostFunctionAlwMonth     float64 `json:"post_function_alw_month"`
	PhoneAlwMonth            float64 `json:"phone_alw_month"`
	InternetAlwMonth         float64 `json:"internet_alw_month"`
	IncentiveMonth           float64 `json:"incentive_month"`
	OperationalAlwMonth      float64 `json:"operational_alw_month"`
	HousingAlwMonth          float64 `json:"housing_alw_month"`
	SeniorityAlwMonth        float64 `json:"seniority_alw_month"`
	TransportAlwMonth        float64 `json:"transport_alw_month"`
	FieldAlwMonth            float64 `json:"field_alw_month"`
	AccommodationAlwMonth    float64 `json:"accommodation_alw_month"`
	WorkDay                  float64 `json:"work_day"`
	OnDay                    float64 `json:"on_day"`
	BTDay                    float64 `json:"bt_day"`
	OADay                    float64 `json:"oa_day"`
	TravellDay               float64 `json:"travell_day"`
	TnTDay                   float64 `json:"tnt_day"`
	STDay                    float64 `json:"st_day"`
	TRDay                    float64 `json:"tr_day"`
}

func DMYToYMD(dmy string) string {
	t, _ := time.Parse("02/01/2006", dmy)
	return t.Format("2006-01-02")
}

// parseDateFlexibly 智能解析日期，支持多种格式
func parseDateFlexibly(dateStr string) (time.Time, error) {
	if dateStr == "" {
		return time.Time{}, nil
	}

	// 尝试多种日期格式
	formats := []string{
		"2006-01-02", // YYYY-MM-DD
		"02/01/2006", // DD/MM/YYYY
		"2006/01/02", // YYYY/MM/DD
		"01-02-2006", // MM-DD-YYYY
		"02-01-2006", // DD-MM-YYYY
	}

	for _, format := range formats {
		t, err := time.Parse(format, dateStr)
		if err == nil {
			return t, nil
		}
	}

	return time.Time{}, fmt.Errorf("unable to parse date: %s", dateStr)
}

func (s *EmployeeService) ImportEmployee(req ImportEmployeeRequest) error {
	for _, employee := range req.Employees {
		// 解析日期字符串为 time.Time 类型
		var joinDate, resignDate time.Time
		var err error
		// slog.Info("JoinDate222", "join_date", employee.JoinDate)
		if employee.JoinDate != "" {
			slog.Info("JoinDate", "join_date", employee.JoinDate)
			joinDate, err = parseDateFlexibly(employee.JoinDate)
			if err != nil {
				return fmt.Errorf("invalid join_date format: %v", err)
			}
		}
		slog.Info("JoinDate", "join_date", joinDate)
		slog.Info("ResignDate", "resign", employee.ResignDate)

		if employee.ResignDate != "" {
			resignDate, err = parseDateFlexibly(employee.ResignDate)
			if err != nil {
				return fmt.Errorf("invalid resign_date format: %v", err)
			}
		}
		// slog.Info("Import employee", "id_status", employee.IdStatus)

		employeeModel := &model.Employee{
			EmployeeID:   employee.EmployeeID,
			ProjectID:    employee.ProjectID,
			EmployeeName: employee.EmployeeName,
			JoinDate:     joinDate,
			ResignDate:   resignDate,
			Email:        employee.Email,
			BasicSalary:  employee.BasicSalary,
			Position:     employee.Position,

			TaxType:                  employee.TaxType,
			BPJSHealthTambahanStatus: employee.BPJSHealthTambahanStatus,
			DateOfBirth:              employee.DateOfBirth,
			PostFunctionAlwMonth:     employee.PostFunctionAlwMonth,
			PhoneAlwMonth:            employee.PhoneAlwMonth,
			InternetAlwMonth:         employee.InternetAlwMonth,
			IncentiveMonth:           employee.IncentiveMonth,
			OperationalAlwMonth:      employee.OperationalAlwMonth,
			HousingAlwMonth:          employee.HousingAlwMonth,
			SeniorityAlwMonth:        employee.SeniorityAlwMonth,
			TransportAlwMonth:        employee.TransportAlwMonth,
			FieldAlwMonth:            employee.FieldAlwMonth,
			AccommodationAlwMonth:    employee.AccommodationAlwMonth,
			WorkDay:                  employee.WorkDay,
			OnDay:                    employee.OnDay,
			BTDay:                    employee.BTDay,
			OADay:                    employee.OADay,
			TravellDay:               employee.TravellDay,
			TnTDay:                   employee.TnTDay,
			STDay:                    employee.STDay,
			TRDay:                    employee.TRDay,
		}

		existingEmployees, err := s.employeeRepo.GetByEmployeeID(employee.EmployeeID, uint(employee.ProjectID))
		if err != nil && err != gorm.ErrRecordNotFound {
			return err
		}

		if len(existingEmployees) > 0 {
			employeeModel.ID = existingEmployees[0].ID
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
