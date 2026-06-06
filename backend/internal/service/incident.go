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
	EmployeeID      string  `json:"employee_id"`
	ProjectID       int     `json:"project_id"`
	Month           string  `json:"month"`
	Thr             float64 `json:"thr"`
	Bonus           float64 `json:"bonus"`
	Compensation    float64 `json:"compensation"`
	ActingAllowance float64 `json:"acting_alw"`
	SalaryProrate   float64 `json:"salary_prorate"`
	Rapel           float64 `json:"rapel"`
	TaxAlw          float64 `json:"tax_alw"`
	TaxDed          float64 `json:"tax_ded"`
	OtherAdd        float64 `json:"other_add"`
	OtherDed        float64 `json:"other_ded"`
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

func (s *IncidentService) ListIncidents(offset, limit int, projectID, month, employeeID, employeeName string) ([]repository.IncidentWithEmployee, int64, error) {
	return s.incidentRepo.List(offset, limit, projectID, month, employeeID, employeeName)
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
			EmployeeID:      incident.EmployeeID,
			ProjectID:       incident.ProjectID,
			Month:           incident.Month,
			Thr:             incident.Thr,
			Bonus:           incident.Bonus,
			Compensation:    incident.Compensation,
			ActingAllowance: incident.ActingAllowance,
			SalaryProrate:   incident.SalaryProrate,
			Rapel:           incident.Rapel,
			TaxAlw:          incident.TaxAlw,
			TaxDed:          incident.TaxDed,
			OtherAdd:        incident.OtherAdd,
			OtherDed:        incident.OtherDed,
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
