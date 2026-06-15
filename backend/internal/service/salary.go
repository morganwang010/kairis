package service

import (
	"kairis/backend/internal/model"
	"kairis/backend/internal/repository"
)

type SalaryService struct {
	salaryRepo *repository.SalaryRepository
}

func NewSalaryService(salaryRepo *repository.SalaryRepository) *SalaryService {
	return &SalaryService{salaryRepo: salaryRepo}
}

func (s *SalaryService) Create(salary *model.Salaries) error {
	return s.salaryRepo.Create(salary)
}

func (s *SalaryService) Get(id uint) (*model.Salaries, error) {
	return s.salaryRepo.Get(id)
}

func (s *SalaryService) List(offset, limit int, month string, projectID int, employeeID, employeeName string) ([]repository.AttendanceWithEmployeeAndIncident, int64, error) {
	return s.salaryRepo.List(offset, limit, month, projectID, employeeID, employeeName)
}

func (s *SalaryService) Update(salary *model.Salaries) error {
	return s.salaryRepo.Update(salary)
}

func (s *SalaryService) Delete(id uint) error {
	return s.salaryRepo.Delete(id)
}

func (s *SalaryService) DeleteSalaryByIDs(ids []uint) error {
	return s.salaryRepo.DeleteByIDs(ids)
}

type ImportSalaryRequest struct {
	Salaries []ImportSalaryItem `json:"salaries"`
}

type ImportSalaryItem struct {
	Month              string  `json:"month"`
	ProjectID          int     `json:"project_id"`
	EmployeeID         string  `json:"employee_id"`
	TaxStatus          float64 `json:"tax_status"`
	BasicSalary        float64 `json:"basic_salary"`
	HousingAlw         float64 `json:"housing_alw"`
	PositionAlw        float64 `json:"position_alw"`
	FieldAlw           float64 `json:"field_alw"`
	FixAlw             float64 `json:"fix_alw"`
	JmstkAlw           float64 `json:"jmstk_alw"`
	PensionAlw         float64 `json:"pension_alw"`
	MealAlw            float64 `json:"meal_alw"`
	TranspAlw          float64 `json:"transp_alw"`
	TaxAlwSalary       float64 `json:"tax_alw_salary"`
	TaxAlwPhk          float64 `json:"tax_alw_phk"`
	CompPhk            float64 `json:"comp_phk"`
	AskesBpjsAlw       float64 `json:"askes_bpjs_alw"`
	MedAlw             float64 `json:"med_alw"`
	PulsaAlw           float64 `json:"pulsa_alw"`
	Others             float64 `json:"others"`
	AttAlw             float64 `json:"att_alw"`
	HousingAlwTetap    float64 `json:"housing_alw_tetap"`
	ReligiousAlw       float64 `json:"religious_alw"`
	RapelBasicSalary   float64 `json:"rapel_basic_salary"`
	RapelJmstkAlw      float64 `json:"rapel_jmstk_alw"`
	IncentiveAlw       float64 `json:"incentive_alw"`
	Acting             float64 `json:"acting"`
	PerformanceAlw     float64 `json:"performance_alw"`
	TripAlw            float64 `json:"trip_alw"`
	Ot1Wages           float64 `json:"ot1_wages"`
	Ot1Hour            float64 `json:"ot1_hour"`
	Ew1Hour            float64 `json:"ew1_hour"`
	Ew1Wages           float64 `json:"ew1_wages"`
	Ew2Hour            float64 `json:"ew2_hour"`
	Ew2Wages           float64 `json:"ew2_wages"`
	Ew3Hour            float64 `json:"ew3_hour"`
	Ew3Wages           float64 `json:"ew3_wages"`
	CorrectAdd         float64 `json:"correct_add"`
	CorrectSub         float64 `json:"correct_sub"`
	LeavComp           float64 `json:"leav_comp"`
	TotalAccept        float64 `json:"total_accept"`
	JmstkFee           float64 `json:"jmstk_fee"`
	PensionDed         float64 `json:"pension_ded"`
	TaxDedSalary       float64 `json:"tax_ded_salary"`
	TaxDedPhk          float64 `json:"tax_ded_phk"`
	AskesBpjsDed       float64 `json:"askes_bpjs_ded"`
	IncentiveDed       float64 `json:"incentive_ded"`
	LoanDed            float64 `json:"loan_ded"`
	AbsentDed          float64 `json:"absent_ded"`
	AbsentDed2         float64 `json:"absent_ded2"`
	NetAccept          float64 `json:"net_accept"`
	RoundOffSalary     float64 `json:"round_off_salary"`
	TotalNetWages      float64 `json:"total_net_wages"`
	SalarySlipStatus   string  `json:"salary_slip_status"`
	PulsaAlwMonth      float64 `json:"pulsa_alw_month"`
	IsCalculate        int     `json:"is_calculate"`
	DeleteFlag         int     `json:"delete_flag"`
	Age                float64 `json:"age"`
	TotalFixedAlw      float64 `json:"total_fixed_alw"`
	WorkAlw            float64 `json:"work_alw"`
	OnAlw              float64 `json:"on_alw"`
	OSAlw              float64 `json:"os_alw"`
	OaAlw              float64 `json:"oa_alw"`
	OtAlw              float64 `json:"ot_alw"`
	OvtAlw             float64 `json:"ovt_alw"`
	BtAlw              float64 `json:"bt_alw"`
	TAlw               float64 `json:"t_alw"`
	TntAlw             float64 `json:"tnt_alw"`
	AlAlw              float64 `json:"al_alw"`
	RotAlw             float64 `json:"rot_alw"`
	TrAlw              float64 `json:"tr_alw"`
	StAlw              float64 `json:"st_alw"`
	LsAlw              float64 `json:"ls_alw"`
	TotalNonFixedAlw   float64 `json:"total_non_fixed_alw"`
	QDed               float64 `json:"q_ded"`
	PlDed              float64 `json:"pl_ded"`
	LateDed            float64 `json:"late_ded"`
	ScDed              float64 `json:"sc_ded"`
	Sc1Ded             float64 `json:"sc1_ded"`
	CoDed              float64 `json:"co_ded"`
	PmDed              float64 `json:"pm_ded"`
	NaDed              float64 `json:"na_ded"`
	SalaryDed          float64 `json:"salary_ded"`
	JkkAlw             float64 `json:"jkk_alw"`
	JkmAlw             float64 `json:"jkm_alw"`
	JhtAlw             float64 `json:"jht_alw"`
	JpAlw              float64 `json:"jp_alw"`
	BpjsManpowerAlw    float64 `json:"bpjs_manpower_alw"`
	BpjsHealthAlw      float64 `json:"bpjs_health_alw"`
	GrossSalary        float64 `json:"gross_salary"`
	JhtDed             float64 `json:"jht_ded"`
	JpDed              float64 `json:"jp_ded"`
	BpjsWorkDed        float64 `json:"bpjs_work_ded"`
	BpjsHealthDed      float64 `json:"bpjs_health_ded"`
	BpjsHealthTambahan float64 `json:"bpjs_health_tambahan"`
	TotalDeduction     float64 `json:"total_deduction"`
	FinalStaffReceive  float64 `json:"final_staff_receive"`
}

func (s *SalaryService) ImportSalary(req ImportSalaryRequest) error {
	for _, salary := range req.Salaries {
		salaryModel := &model.Salaries{
			Month:              salary.Month,
			ProjectID:          salary.ProjectID,
			EmployeeID:         salary.EmployeeID,
			TaxStatus:          salary.TaxStatus,
			BasicSalary:        salary.BasicSalary,
			SalarySlipStatus:   salary.SalarySlipStatus,
			PulsaAlwMonth:      salary.PulsaAlwMonth,
			IsCalculate:        salary.IsCalculate,
			DeleteFlag:         salary.DeleteFlag,
			Age:                salary.Age,
			TotalFixedAlw:      salary.TotalFixedAlw,
			WorkAlw:            salary.WorkAlw,
			OnAlw:              salary.OnAlw,
			OSAlw:              salary.OSAlw,
			OaAlw:              salary.OaAlw,
			OtAlw:              salary.OtAlw,
			OvtAlw:             salary.OvtAlw,
			BtAlw:              salary.BtAlw,
			TAlw:               salary.TAlw,
			TntAlw:             salary.TntAlw,
			AlAlw:              salary.AlAlw,
			RotAlw:             salary.RotAlw,
			TrAlw:              salary.TrAlw,
			StAlw:              salary.StAlw,
			LsAlw:              salary.LsAlw,
			TotalNonFixedAlw:   salary.TotalNonFixedAlw,
			QDed:               salary.QDed,
			PlDed:              salary.PlDed,
			LateDed:            salary.LateDed,
			ScDed:              salary.ScDed,
			Sc1Ded:             salary.Sc1Ded,
			CoDed:              salary.CoDed,
			PmDed:              salary.PmDed,
			NaDed:              salary.NaDed,
			SalaryDed:          salary.SalaryDed,
			JkkAlw:             salary.JkkAlw,
			JkmAlw:             salary.JkmAlw,
			JhtAlw:             salary.JhtAlw,
			JpAlw:              salary.JpAlw,
			BpjsManpowerAlw:    salary.BpjsManpowerAlw,
			BpjsHealthAlw:      salary.BpjsHealthAlw,
			GrossSalary:        salary.GrossSalary,
			JhtDed:             salary.JhtDed,
			JpDed:              salary.JpDed,
			BpjsWorkDed:        salary.BpjsWorkDed,
			BpjsHealthDed:      salary.BpjsHealthDed,
			BpjsHealthTambahan: salary.BpjsHealthTambahan,
			TotalDeduction:     salary.TotalDeduction,
			FinalStaffReceive:  salary.FinalStaffReceive,
		}

		if err := s.salaryRepo.Create(salaryModel); err != nil {
			return err
		}
	}
	return nil
}

func (s *SalaryService) Calculate(month string, projectID int) error {
	// 这里实现薪资计算逻辑
	// 参考salary.rs中的calculate_monthly_salary方法
	return s.salaryRepo.Calculate(month, projectID)
}

// Total 获取薪资汇总
func (s *SalaryService) Total() (float64, error) {
	return s.salaryRepo.Total()
}
