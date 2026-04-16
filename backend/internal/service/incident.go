package service

import (
	"kairis/backend/internal/model"
	"kairis/backend/internal/repository"
	"log/slog"
)

type ImportIncidentRequest struct {
	Incidents []ImportIncidentItem `json:"incidents"`
}

type ImportIncidentItem struct {
	EmployeeID       string  `json:"employee_id"`
	ProjectID        int     `json:"project_id"`
	Month            string  `json:"month"`
	LeaveComp        float64 `json:"leave_comp"`
	MedAlw           float64 `json:"med_alw"`
	Others           float64 `json:"others"`
	ReligiousAlw     float64 `json:"religious_alw"`
	RapelBasicSalary float64 `json:"rapel_basic_salary"`
	RapelJmstkAlw    float64 `json:"rapel_jmstk_alw"`
	IncentiveAlw     float64 `json:"incentive_alw"`
	Acting           float64 `json:"acting"`
	PerformanceAlw   float64 `json:"performance_alw"`
	TripAlw          float64 `json:"trip_alw"`
	Ot2Wages         float64 `json:"ot2_wages"`
	Ot3Wages         float64 `json:"ot3_wages"`
	CompPhk          float64 `json:"comp_phk"`
	TaxAlwPhk        float64 `json:"tax_alw_phk"`
	AbsentDed        float64 `json:"absent_ded"`
	AbsentDed2       float64 `json:"absent_ded2"`
	CorrectAdd       float64 `json:"correct_add"`
	CorrectSub       float64 `json:"correct_sub"`
	IncentiveDed     float64 `json:"incentive_ded"`
	LoanDed          float64 `json:"loan_ded"`
	TaxDedPhk        float64 `json:"tax_ded_phk"`
	MandahAlw        float64 `json:"mandah_alw"`
	MealAlwAdd       float64 `json:"meal_alw_add"`
	TranspAlwAdd     float64 `json:"transp_alw_add"`
	EwDrv            float64 `json:"ew_drv"`
	OtDrv            float64 `json:"ot_drv"`
}

type IncidentService struct {
	incidentRepo *repository.IncidentRepository
}

func NewIncidentService(incidentRepo *repository.IncidentRepository) *IncidentService {
	return &IncidentService{
		incidentRepo: incidentRepo,
	}
}

func (s *IncidentService) CreateIncident(incident *model.Incidents) error {
	return s.incidentRepo.Create(incident)
}

func (s *IncidentService) GetIncidentByID(id uint) (*model.Incidents, error) {
	return s.incidentRepo.GetByID(id)
}

func (s *IncidentService) ListIncidents(offset, limit int, projectID, month string) ([]repository.IncidentWithEmployee, int64, error) {
	return s.incidentRepo.List(offset, limit, projectID, month)
}

func (s *IncidentService) UpdateIncident(incident *model.Incidents) error {
	return s.incidentRepo.Update(incident)
}

func (s *IncidentService) DeleteIncident(id uint) error {
	return s.incidentRepo.Delete(id)
}

func (s *IncidentService) DeleteIncidentByIDs(ids []uint) error {
	return s.incidentRepo.DeleteByIDs(ids)
}

func (s *IncidentService) ImportIncident(req ImportIncidentRequest) error {
	for _, incident := range req.Incidents {
		incidentModel := &model.Incidents{
			EmployeeID:       incident.EmployeeID,
			ProjectID:        incident.ProjectID,
			Month:            incident.Month,
			LeaveComp:        incident.LeaveComp,
			MedAlw:           incident.MedAlw,
			Others:           incident.Others,
			ReligiousAlw:     incident.ReligiousAlw,
			RapelBasicSalary: incident.RapelBasicSalary,
			RapelJmstkAlw:    incident.RapelJmstkAlw,
			IncentiveAlw:     incident.IncentiveAlw,
			Acting:           incident.Acting,
			PerformanceAlw:   incident.PerformanceAlw,
			TripAlw:          incident.TripAlw,
			Ot2Wages:         incident.Ot2Wages,
			Ot3Wages:         incident.Ot3Wages,
			CompPhk:          incident.CompPhk,
			TaxAlwPhk:        incident.TaxAlwPhk,
			AbsentDed:        incident.AbsentDed,
			AbsentDed2:       incident.AbsentDed2,
			CorrectAdd:       incident.CorrectAdd,
			CorrectSub:       incident.CorrectSub,
			IncentiveDed:     incident.IncentiveDed,
			LoanDed:          incident.LoanDed,
			TaxDedPhk:        incident.TaxDedPhk,
			MandahAlw:        incident.MandahAlw,
			MealAlwAdd:       incident.MealAlwAdd,
			TranspAlwAdd:     incident.TranspAlwAdd,
			EwDrv:            incident.EwDrv,
			OtDrv:            incident.OtDrv,
		}
		existingIncident, err := s.incidentRepo.GetByEmployeeIDAndMonth(incident.EmployeeID, incident.Month, incident.ProjectID)
		if err == nil && existingIncident != nil {
			// 记录存在，执行更新
			slog.Info("Updating existing incident", "employee_id", incident.EmployeeID, "project_id", incident.ProjectID, "month", incident.Month)
			incidentModel.ID = existingIncident.ID
			if err := s.incidentRepo.Update(incidentModel); err != nil {
				slog.Error("Failed to update incident", "error", err, "employee_id", incident.EmployeeID)
				return err
			}
		} else {
			// 记录不存在，创建新记录
			slog.Info("Creating new incident", "employee_id", incident.EmployeeID, "project_id", incident.ProjectID, "month", incident.Month)

			if err := s.incidentRepo.Create(incidentModel); err != nil {
				slog.Error("Failed to create incident", "error", err, "employee_id", incident.EmployeeID)
				return err
			}
		}
		// if err := s.incidentRepo.Create(incidentModel); err != nil {
		// 	return err
		// }
	}
	return nil
}
