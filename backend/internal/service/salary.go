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

func (s *SalaryService) List(offset, limit int, month string, projectID int) ([]repository.AttendanceWithEmployeeAndIncident, int64, error) {
	return s.salaryRepo.List(offset, limit, month, projectID)
}

func (s *SalaryService) Update(salary *model.Salaries) error {
	return s.salaryRepo.Update(salary)
}

func (s *SalaryService) Delete(id uint) error {
	return s.salaryRepo.Delete(id)
}

type ImportSalaryRequest struct {
	Salaries []ImportSalaryItem `json:"salaries"`
}

type ImportSalaryItem struct {
	Month            string  `json:"month"`
	ProjectID        int     `json:"project_id"`
	EmployeeID       string  `json:"employee_id"`
	TaxStatus        float64 `json:"tax_status"`
	BasicSalary      float64 `json:"basic_salary"`
	HousingAlw       float64 `json:"housing_alw"`
	PositionAlw      float64 `json:"position_alw"`
	FieldAlw         float64 `json:"field_alw"`
	FixAlw           float64 `json:"fix_alw"`
	JmstkAlw         float64 `json:"jmstk_alw"`
	PensionAlw       float64 `json:"pension_alw"`
	MealAlw          float64 `json:"meal_alw"`
	TranspAlw        float64 `json:"transp_alw"`
	TaxAlwSalary     float64 `json:"tax_alw_salary"`
	TaxAlwPhk        float64 `json:"tax_alw_phk"`
	CompPhk          float64 `json:"comp_phk"`
	AskesBpjsAlw     float64 `json:"askes_bpjs_alw"`
	MedAlw           float64 `json:"med_alw"`
	PulsaAlw         float64 `json:"pulsa_alw"`
	Others           float64 `json:"others"`
	AttAlw           float64 `json:"att_alw"`
	HousingAlwTetap  float64 `json:"housing_alw_tetap"`
	ReligiousAlw     float64 `json:"religious_alw"`
	RapelBasicSalary float64 `json:"rapel_basic_salary"`
	RapelJmstkAlw    float64 `json:"rapel_jmstk_alw"`
	IncentiveAlw     float64 `json:"incentive_alw"`
	Acting           float64 `json:"acting"`
	PerformanceAlw   float64 `json:"performance_alw"`
	TripAlw          float64 `json:"trip_alw"`
	Ot1Wages         float64 `json:"ot1_wages"`
	Ot1Hour          float64 `json:"ot1_hour"`
	Ew1Hour          float64 `json:"ew1_hour"`
	Ew1Wages         float64 `json:"ew1_wages"`
	Ew2Hour          float64 `json:"ew2_hour"`
	Ew2Wages         float64 `json:"ew2_wages"`
	Ew3Hour          float64 `json:"ew3_hour"`
	Ew3Wages         float64 `json:"ew3_wages"`
	CorrectAdd       float64 `json:"correct_add"`
	CorrectSub       float64 `json:"correct_sub"`
	LeavComp         float64 `json:"leav_comp"`
	TotalAccept      float64 `json:"total_accept"`
	JmstkFee         float64 `json:"jmstk_fee"`
	PensionDed       float64 `json:"pension_ded"`
	TaxDedSalary     float64 `json:"tax_ded_salary"`
	TaxDedPhk        float64 `json:"tax_ded_phk"`
	AskesBpjsDed     float64 `json:"askes_bpjs_ded"`
	IncentiveDed     float64 `json:"incentive_ded"`
	LoanDed          float64 `json:"loan_ded"`
	AbsentDed        float64 `json:"absent_ded"`
	AbsentDed2       float64 `json:"absent_ded2"`
	NetAccept        float64 `json:"net_accept"`
	RoundOffSalary   float64 `json:"round_off_salary"`
	TotalNetWages    float64 `json:"total_net_wages"`
	SalarySlipStatus string  `json:"salary_slip_status"`
	PulsaAlwMonth    float64 `json:"pulsa_alw_month"`
	MandahAlw        float64 `json:"mandah_alw"`
	IsCalculate      int     `json:"is_calculate"`
	DeleteFlag       int     `json:"delete_flag"`
}

func (s *SalaryService) ImportSalary(req ImportSalaryRequest) error {
	for _, salary := range req.Salaries {
		salaryModel := &model.Salaries{
			Month:            salary.Month,
			ProjectID:        salary.ProjectID,
			EmployeeID:       salary.EmployeeID,
			TaxStatus:        salary.TaxStatus,
			BasicSalary:      salary.BasicSalary,
			HousingAlw:       salary.HousingAlw,
			PositionAlw:      salary.PositionAlw,
			FieldAlw:         salary.FieldAlw,
			FixAlw:           salary.FixAlw,
			JmstkAlw:         salary.JmstkAlw,
			PensionAlw:       salary.PensionAlw,
			MealAlw:          salary.MealAlw,
			TranspAlw:        salary.TranspAlw,
			TaxAlwSalary:     salary.TaxAlwSalary,
			TaxAlwPhk:        salary.TaxAlwPhk,
			CompPhk:          salary.CompPhk,
			AskesBpjsAlw:     salary.AskesBpjsAlw,
			MedAlw:           salary.MedAlw,
			PulsaAlw:         salary.PulsaAlw,
			Others:           salary.Others,
			AttAlw:           salary.AttAlw,
			HousingAlwTetap:  salary.HousingAlwTetap,
			ReligiousAlw:     salary.ReligiousAlw,
			RapelBasicSalary: salary.RapelBasicSalary,
			RapelJmstkAlw:    salary.RapelJmstkAlw,
			IncentiveAlw:     salary.IncentiveAlw,
			Acting:           salary.Acting,
			PerformanceAlw:   salary.PerformanceAlw,
			TripAlw:          salary.TripAlw,
			Ot1Wages:         salary.Ot1Wages,
			Ot1Hour:          salary.Ot1Hour,
			Ew1Hour:          salary.Ew1Hour,
			Ew1Wages:         salary.Ew1Wages,
			Ew2Hour:          salary.Ew2Hour,
			Ew2Wages:         salary.Ew2Wages,
			Ew3Hour:          salary.Ew3Hour,
			Ew3Wages:         salary.Ew3Wages,
			CorrectAdd:       salary.CorrectAdd,
			CorrectSub:       salary.CorrectSub,
			LeavComp:         salary.LeavComp,
			TotalAccept:      salary.TotalAccept,
			JmstkFee:         salary.JmstkFee,
			PensionDed:       salary.PensionDed,
			TaxDedSalary:     salary.TaxDedSalary,
			TaxDedPhk:        salary.TaxDedPhk,
			AskesBpjsDed:     salary.AskesBpjsDed,
			IncentiveDed:     salary.IncentiveDed,
			LoanDed:          salary.LoanDed,
			AbsentDed:        salary.AbsentDed,
			AbsentDed2:       salary.AbsentDed2,
			NetAccept:        salary.NetAccept,
			RoundOffSalary:   salary.RoundOffSalary,
			TotalNetWages:    salary.TotalNetWages,
			SalarySlipStatus: salary.SalarySlipStatus,
			PulsaAlwMonth:    salary.PulsaAlwMonth,
			MandahAlw:        salary.MandahAlw,
			IsCalculate:      salary.IsCalculate,
			DeleteFlag:       salary.DeleteFlag,
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
