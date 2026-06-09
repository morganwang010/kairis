package service

import (
	"kairis/backend/internal/model"
	"kairis/backend/internal/repository"
	"log/slog"
	"strconv"
)

type ImportAttendanceRequest struct {
	Attendances []ImportAttendanceItem `json:"attendances"`
}

type ImportAttendanceItem struct {
	EmployeeID string `json:"employee_id"`
	ProjectID  int    `json:"project_id"`
	Month      string `json:"month"`
	W          string `json:"w"`
	Ons        string `json:"ons"`
	OsOa       string `json:"os_oa"`
	Ot         string `json:"ot"`
	Ovt        string `json:"ovt"`
	Bt         string `json:"bt"`
	T          string `json:"t"`
	Tnt        string `json:"tnt"`
	Al         string `json:"al"`
	Rot        string `json:"rot"`
	Tr         string `json:"tr"`
	St         string `json:"st"`
	Ls         string `json:"ls"`
	Q          string `json:"q"`
	Wfh        string `json:"wfh"`
	Pl         string `json:"pl"`
	L          string `json:"l"`
	Sc         string `json:"sc"`
	Sc1        string `json:"sc1"`
	Co         string `json:"co"`
	Pm         string `json:"pm"`
	Na         string `json:"na"`
	Off        string `json:"off"`
}

type AttendanceService struct {
	attendanceRepo *repository.AttendanceRepository
}

func NewAttendanceService(attendanceRepo *repository.AttendanceRepository) *AttendanceService {
	return &AttendanceService{
		attendanceRepo: attendanceRepo,
	}
}

func (s *AttendanceService) CreateAttendance(attendance *model.Attendances) error {
	return s.attendanceRepo.Create(attendance)
}

func (s *AttendanceService) GetAttendanceByID(id uint) (*model.Attendances, error) {
	return s.attendanceRepo.GetByID(id)
}

func (s *AttendanceService) GetAttendanceByEmployeeIDAndMonth(employeeID, month string, projectID int) ([]model.Attendances, error) {
	return s.attendanceRepo.GetByEmployeeIDAndMonth(employeeID, month, projectID)
}

func (s *AttendanceService) ListAttendances(offset, limit int, projectID, month string, employeeID, employeeName string) ([]repository.AttendanceWithEmployee, int64, error) {
	return s.attendanceRepo.List(offset, limit, projectID, month, employeeID, employeeName)
}

func (s *AttendanceService) UpdateAttendance(attendance *model.Attendances) error {
	return s.attendanceRepo.Update(attendance)
}

func (s *AttendanceService) DeleteAttendance(id uint) error {
	return s.attendanceRepo.Delete(id)
}

func (s *AttendanceService) DeleteAttendanceByIDs(ids []uint) error {
	return s.attendanceRepo.DeleteByIDs(ids)
}

func (s *AttendanceService) ImportAttendance(req ImportAttendanceRequest) error {
	for _, attendance := range req.Attendances {
		w, _ := strconv.ParseFloat(attendance.W, 64)
		off, _ := strconv.ParseFloat(attendance.Off, 64)
		ons, _ := strconv.ParseFloat(attendance.Ons, 64)
		osOa, _ := strconv.ParseFloat(attendance.OsOa, 64)
		ot, _ := strconv.ParseFloat(attendance.Ot, 64)
		ovt, _ := strconv.ParseFloat(attendance.Ovt, 64)
		bt, _ := strconv.ParseFloat(attendance.Bt, 64)
		tnt, _ := strconv.ParseFloat(attendance.Tnt, 64)
		al, _ := strconv.ParseFloat(attendance.Al, 64)
		rot, _ := strconv.ParseFloat(attendance.Rot, 64)
		tr, _ := strconv.ParseFloat(attendance.Tr, 64)
		st, _ := strconv.ParseFloat(attendance.St, 64)
		ls, _ := strconv.ParseFloat(attendance.Ls, 64)
		q, _ := strconv.ParseFloat(attendance.Q, 64)
		wfh, _ := strconv.ParseFloat(attendance.Wfh, 64)
		pl, _ := strconv.ParseFloat(attendance.Pl, 64)
		l, _ := strconv.ParseFloat(attendance.L, 64)
		sc, _ := strconv.ParseFloat(attendance.Sc, 64)
		sc1, _ := strconv.ParseFloat(attendance.Sc1, 64)
		co, _ := strconv.ParseFloat(attendance.Co, 64)
		pm, _ := strconv.ParseFloat(attendance.Pm, 64)
		na, _ := strconv.ParseFloat(attendance.Na, 64)
		t, _ := strconv.ParseFloat(attendance.T, 64)
		
		// 根据Project_id, employee_id, month三者同时重复即认为重复
		existingAttendance, err := s.attendanceRepo.GetByEmployeeIDAndMonth(attendance.EmployeeID, attendance.Month, attendance.ProjectID)
		
		if err == nil && len(existingAttendance) > 0 {
			// 记录存在，执行更新
			slog.Info("Updating existing attendance", "employee_id", attendance.EmployeeID, "project_id", attendance.ProjectID, "month", attendance.Month)
			attendanceModel := &model.Attendances{
				ID:         existingAttendance[0].ID,
				EmployeeID: attendance.EmployeeID,
				ProjectID:  attendance.ProjectID,
				Month:      attendance.Month,
				W:          w,
				Off:        off,
				Ons:        ons,
				OsOa:       osOa,
				Ot:         ot,
				Ovt:        ovt,
				Bt:         bt,
				Tnt:        tnt,
				Al:         al,
				Rot:        rot,
				Tr:         tr,
				St:         st,
				Ls:         ls,
				Q:          q,
				Wfh:        wfh,
				Pl:         pl,
				L:          l,
				Sc:         sc,
				Sc1:        sc1,
				Co:         co,
				Pm:         pm,
				Na:         na,
				T:          t,
			}
			if err := s.attendanceRepo.Update(attendanceModel); err != nil {
				slog.Error("Failed to update attendance", "error", err, "employee_id", attendance.EmployeeID)
				return err
			}
		} else {
			// 记录不存在，创建新记录
			slog.Info("Creating new attendance", "employee_id", attendance.EmployeeID, "project_id", attendance.ProjectID, "month", attendance.Month)
			attendanceModel := &model.Attendances{
				EmployeeID: attendance.EmployeeID,
				ProjectID:  attendance.ProjectID,
				Month:      attendance.Month,
				W:          w,
				Off:        off,
				Ons:        ons,
				OsOa:       osOa,
				Ot:         ot,
				Ovt:        ovt,
				Bt:         bt,
				Tnt:        tnt,
				Al:         al,
				Rot:        rot,
				Tr:         tr,
				St:         st,
				Ls:         ls,
				Q:          q,
				Wfh:        wfh,
				Pl:         pl,
				L:          l,
				Sc:         sc,
				Co:         co,
				Pm:         pm,
				Na:         na,
				T:          t,
			}
			if err := s.attendanceRepo.Create(attendanceModel); err != nil {
				slog.Error("Failed to create attendance", "error", err, "employee_id", attendance.EmployeeID)
				return err
			}
		}
	}
	return nil
}
