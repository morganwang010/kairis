package service

import (
	"kairis/backend/internal/model"
	"kairis/backend/internal/repository"
	"log/slog"
)

type ImportAttendanceRequest struct {
	Attendances []ImportAttendanceItem `json:"attendances"`
}

type ImportAttendanceItem struct {
	EmployeeID string  `json:"employee_id"`
	ProjectID  int     `json:"project_id"`
	Month      string  `json:"month"`
	Day1       string  `json:"day1"`
	Day2       string  `json:"day2"`
	Day3       string  `json:"day3"`
	Day4       string  `json:"day4"`
	Day5       string  `json:"day5"`
	Day6       string  `json:"day6"`
	Day7       string  `json:"day7"`
	Day8       string  `json:"day8"`
	Day9       string  `json:"day9"`
	Day10      string  `json:"day10"`
	Day11      string  `json:"day11"`
	Day12      string  `json:"day12"`
	Day13      string  `json:"day13"`
	Day14      string  `json:"day14"`
	Day15      string  `json:"day15"`
	Day16      string  `json:"day16"`
	Day17      string  `json:"day17"`
	Day18      string  `json:"day18"`
	Day19      string  `json:"day19"`
	Day20      string  `json:"day20"`
	Day21      string  `json:"day21"`
	Day22      string  `json:"day22"`
	Day23      string  `json:"day23"`
	Day24      string  `json:"day24"`
	Day25      string  `json:"day25"`
	Day26      string  `json:"day26"`
	Day27      string  `json:"day27"`
	Day28      string  `json:"day28"`
	Day29      string  `json:"day29"`
	Day30      string  `json:"day30"`
	Day31      string  `json:"day31"`
	Work       int     `json:"work"`
	Permission int     `json:"permission"`
	Off        int     `json:"off"`
	Absent     int     `json:"absent"`
	Sick       int     `json:"sick"`
	Standby    int     `json:"standby"`
	Ew         float64 `json:"ew"`
	Ot1        float64 `json:"ot1"`
	Ew1        float64 `json:"ew1"`
	Ew2        float64 `json:"ew2"`
	Ew3        float64 `json:"ew3"`
	Ot2        float64 `json:"ot2"`
	Ot3        float64 `json:"ot3"`
	LeaveReplc float64 `json:"leave_replc"`
	Unpresent  float64 `json:"unpresent"`
	TotalDays  int     `json:"total_days"`
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

func (s *AttendanceService) ListAttendances(offset, limit int, projectID, month string) ([]model.Attendances, int64, error) {
	return s.attendanceRepo.List(offset, limit, projectID, month)
}

func (s *AttendanceService) UpdateAttendance(attendance *model.Attendances) error {
	return s.attendanceRepo.Update(attendance)
}

func (s *AttendanceService) DeleteAttendance(id uint) error {
	return s.attendanceRepo.Delete(id)
}

func (s *AttendanceService) ImportAttendance(req ImportAttendanceRequest) error {
	slog.Info("Importing attendances", "count", len(req.Attendances))
	for _, attendance := range req.Attendances {
		slog.Info("Importing attendance", "employee_id", attendance.EmployeeID, "project_id", attendance.ProjectID, "month", attendance.Month)
		attendanceModel := &model.Attendances{
			EmployeeID: attendance.EmployeeID,
			Day1:       attendance.Day1,
			Day2:       attendance.Day2,
			Day3:       attendance.Day3,
			Day4:       attendance.Day4,
			Day5:       attendance.Day5,
			Day6:       attendance.Day6,
			Day7:       attendance.Day7,
			Day8:       attendance.Day8,
			Day9:       attendance.Day9,
			Day10:      attendance.Day10,
			Day11:      attendance.Day11,
			Day12:      attendance.Day12,
			Day13:      attendance.Day13,
			Day14:      attendance.Day14,
			Day15:      attendance.Day15,
			Day16:      attendance.Day16,
			Day17:      attendance.Day17,
			Day18:      attendance.Day18,
			Day19:      attendance.Day19,
			Day20:      attendance.Day20,
			Day21:      attendance.Day21,
			Day22:      attendance.Day22,
			Day23:      attendance.Day23,
			Day24:      attendance.Day24,
			Day25:      attendance.Day25,
			Day26:      attendance.Day26,
			Day27:      attendance.Day27,
			Day28:      attendance.Day28,
			Day29:      attendance.Day29,
			Day30:      attendance.Day30,
			Day31:      attendance.Day31,
			Work:       attendance.Work,
			ProjectID:  attendance.ProjectID,
			Permission: attendance.Permission,
			Off:        attendance.Off,
			Absent:     attendance.Absent,
			Sick:       attendance.Sick,
			Standby:    attendance.Standby,
			Ew:         attendance.Ew,
			Month:      attendance.Month,
			Ot1:        attendance.Ot1,
			Ew1:        attendance.Ew1,
			Ew2:        attendance.Ew2,
			Ew3:        attendance.Ew3,
			Ot2:        attendance.Ot2,
			Ot3:        attendance.Ot3,
			LeaveReplc: attendance.LeaveReplc,
			Unpresent:  attendance.Unpresent,
			TotalDays:  attendance.TotalDays,
		}
		if err := s.attendanceRepo.Create(attendanceModel); err != nil {
			return err
		}
	}
	return nil
}
