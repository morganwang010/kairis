package service

import (
	"kairis/backend/internal/model"
	"kairis/backend/internal/repository"
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
		}
		if err := s.incidentRepo.Create(incidentModel); err != nil {
			return err
		}
	}
	return nil
}
