package handler

import (
	"bytes"
	"io"
	"kairis/backend/internal/model"
	"kairis/backend/internal/service"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type AttendanceHandler struct {
	attendanceService *service.AttendanceService
}

func NewAttendanceHandler(attendanceService *service.AttendanceService) *AttendanceHandler {
	return &AttendanceHandler{attendanceService: attendanceService}
}

type CreateAttendanceRequest struct {
	EmployeeID string  `json:"employee_id" binding:"required"`
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
	ProjectID  int     `json:"project_id"`
	Permission int     `json:"permission"`
	Off        int     `json:"off"`
	Absent     int     `json:"absent"`
	Sick       int     `json:"sick"`
	Standby    int     `json:"standby"`
	Ew         float64 `json:"ew"`
	Month      string  `json:"month" binding:"required"`
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

type UpdateAttendanceRequest struct {
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
	Month      string  `json:"month"`
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

func (h *AttendanceHandler) Create(c *gin.Context) {
	var req CreateAttendanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	attendance := &model.Attendances{
		EmployeeID: req.EmployeeID,
		Day1:       req.Day1,
		Day2:       req.Day2,
		Day3:       req.Day3,
		Day4:       req.Day4,
		Day5:       req.Day5,
		Day6:       req.Day6,
		Day7:       req.Day7,
		Day8:       req.Day8,
		Day9:       req.Day9,
		Day10:      req.Day10,
		Day11:      req.Day11,
		Day12:      req.Day12,
		Day13:      req.Day13,
		Day14:      req.Day14,
		Day15:      req.Day15,
		Day16:      req.Day16,
		Day17:      req.Day17,
		Day18:      req.Day18,
		Day19:      req.Day19,
		Day20:      req.Day20,
		Day21:      req.Day21,
		Day22:      req.Day22,
		Day23:      req.Day23,
		Day24:      req.Day24,
		Day25:      req.Day25,
		Day26:      req.Day26,
		Day27:      req.Day27,
		Day28:      req.Day28,
		Day29:      req.Day29,
		Day30:      req.Day30,
		Day31:      req.Day31,
		Work:       req.Work,
		ProjectID:  req.ProjectID,
		Permission: req.Permission,
		Off:        req.Off,
		Absent:     req.Absent,
		Sick:       req.Sick,
		Standby:    req.Standby,
		Ew:         req.Ew,
		Month:      req.Month,
		Ot1:        req.Ot1,
		Ew1:        req.Ew1,
		Ew2:        req.Ew2,
		Ew3:        req.Ew3,
		Ot2:        req.Ot2,
		Ot3:        req.Ot3,
		LeaveReplc: req.LeaveReplc,
		Unpresent:  req.Unpresent,
		TotalDays:  req.TotalDays,
	}

	if err := h.attendanceService.CreateAttendance(attendance); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": attendance})
}

func (h *AttendanceHandler) Get(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid attendance ID"})
		return
	}

	attendance, err := h.attendanceService.GetAttendanceByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "Attendance not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": attendance})
}

func (h *AttendanceHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	projectID := c.Query("project_id")
	month := c.Query("month")

	offset := (page - 1) * pageSize

	attendances, total, err := h.attendanceService.ListAttendances(offset, pageSize, projectID, month)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":     200,
		"message":  "Success",
		"total":    total,
		"data":     attendances,
		"page":     page,
		"pageSize": pageSize,
		// "data": gin.H{
		// 	"list":     attendances,
		// 	"page":     page,
		// 	"pageSize": pageSize,
		// },
	})
}

func (h *AttendanceHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid attendance ID"})
		return
	}
	slog.Info("更新考勤记录请求", "id", id)
	var req UpdateAttendanceRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		slog.Error("更新考勤记录请求参数错误", "id", id, "error", err.Error())
		return
	}

	attendance, err := h.attendanceService.GetAttendanceByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "Attendance not found"})
		return
	}

	attendance.Day1 = req.Day1
	attendance.Day2 = req.Day2
	attendance.Day3 = req.Day3
	attendance.Day4 = req.Day4
	attendance.Day5 = req.Day5
	attendance.Day6 = req.Day6
	attendance.Day7 = req.Day7
	attendance.Day8 = req.Day8
	attendance.Day9 = req.Day9
	attendance.Day10 = req.Day10
	attendance.Day11 = req.Day11
	attendance.Day12 = req.Day12
	attendance.Day13 = req.Day13
	attendance.Day14 = req.Day14
	attendance.Day15 = req.Day15
	attendance.Day16 = req.Day16
	attendance.Day17 = req.Day17
	attendance.Day18 = req.Day18
	attendance.Day19 = req.Day19
	attendance.Day20 = req.Day20
	attendance.Day21 = req.Day21
	attendance.Day22 = req.Day22
	attendance.Day23 = req.Day23
	attendance.Day24 = req.Day24
	attendance.Day25 = req.Day25
	attendance.Day26 = req.Day26
	attendance.Day27 = req.Day27
	attendance.Day28 = req.Day28
	attendance.Day29 = req.Day29
	attendance.Day30 = req.Day30
	attendance.Day31 = req.Day31
	attendance.Work = req.Work
	attendance.Permission = req.Permission
	attendance.Off = req.Off
	attendance.Absent = req.Absent
	attendance.Sick = req.Sick
	attendance.Standby = req.Standby
	attendance.Ew = req.Ew
	attendance.Month = req.Month
	attendance.Ot1 = req.Ot1
	attendance.Ew1 = req.Ew1
	attendance.Ew2 = req.Ew2
	attendance.Ew3 = req.Ew3
	attendance.Ot2 = req.Ot2
	attendance.Ot3 = req.Ot3
	attendance.LeaveReplc = req.LeaveReplc
	attendance.Unpresent = req.Unpresent
	attendance.TotalDays = req.TotalDays

	if err := h.attendanceService.UpdateAttendance(attendance); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": attendance})
}

func (h *AttendanceHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid attendance ID"})
		return
	}

	if err := h.attendanceService.DeleteAttendance(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}

func (h *AttendanceHandler) Import(c *gin.Context) {
	// 读取请求体
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		slog.Error("Failed to read request body", "error", err)
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Failed to read request body"})
		return
	}

	// 记录请求体内容
	slog.Info("Received request body", "body", string(body))

	// 重置请求体，以便后续的ShouldBindJSON可以读取
	c.Request.Body = io.NopCloser(bytes.NewBuffer(body))

	var req struct {
		Records []struct {
			EmployeeID string `json:"employee_id"`
			ProjectID  string `json:"project_id"`
			Month      string `json:"month"`
			Day1       string `json:"day1"`
			Day2       string `json:"day2"`
			Day3       string `json:"day3"`
			Day4       string `json:"day4"`
			Day5       string `json:"day5"`
			Day6       string `json:"day6"`
			Day7       string `json:"day7"`
			Day8       string `json:"day8"`
			Day9       string `json:"day9"`
			Day10      string `json:"day10"`
			Day11      string `json:"day11"`
			Day12      string `json:"day12"`
			Day13      string `json:"day13"`
			Day14      string `json:"day14"`
			Day15      string `json:"day15"`
			Day16      string `json:"day16"`
			Day17      string `json:"day17"`
			Day18      string `json:"day18"`
			Day19      string `json:"day19"`
			Day20      string `json:"day20"`
			Day21      string `json:"day21"`
			Day22      string `json:"day22"`
			Day23      string `json:"day23"`
			Day24      string `json:"day24"`
			Day25      string `json:"day25"`
			Day26      string `json:"day26"`
			Day27      string `json:"day27"`
			Day28      string `json:"day28"`
			Day29      string `json:"day29"`
			Day30      string `json:"day30"`
			Day31      string `json:"day31"`
			Work       string `json:"work"`
			Permission string `json:"permission"`
			Off        string `json:"off"`
			Absent     string `json:"absent"`
			Sick       string `json:"sick"`
			Standby    string `json:"standby"`
			Ew         string `json:"ew"`
			Ot1        string `json:"ot1"`
			Ew1        string `json:"ew1"`
			Ew2        string `json:"ew2"`
			Ew3        string `json:"ew3"`
			Ot2        string `json:"ot2"`
			Ot3        string `json:"ot3"`
			LeaveReplc string `json:"leave_replc"`
			Unpresent  string `json:"unpresent"`
			TotalDays  string `json:"total_days"`
		} `json:"records"`
	}

	slog.Info("Before binding", "req", &req)
	if err := c.ShouldBindJSON(&req); err != nil {
		slog.Error("Failed to bind JSON", "error", err)
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}
	slog.Info("After binding", "count", len(req.Records), "req", &req)
	importReq := service.ImportAttendanceRequest{
		Attendances: make([]service.ImportAttendanceItem, len(req.Records)),
	}

	for i, item := range req.Records {
		// 转换ProjectID为int类型
		projectID, ok := StringToInt(c, item.ProjectID, "project_id")
		if !ok {
			return
		}

		// 转换整数类型字段
		work, ok := StringToInt(c, item.Work, "work")
		if !ok {
			return
		}

		permission, ok := StringToInt(c, item.Permission, "permission")
		if !ok {
			return
		}

		off, ok := StringToInt(c, item.Off, "off")
		if !ok {
			return
		}

		absent, ok := StringToInt(c, item.Absent, "absent")
		if !ok {
			return
		}

		sick, ok := StringToInt(c, item.Sick, "sick")
		if !ok {
			return
		}

		standby, ok := StringToInt(c, item.Standby, "standby")
		if !ok {
			return
		}

		// totalDays, ok := StringToInt(c, item.TotalDays, "total_days")
		// if !ok {
		// 	return
		// }

		// 转换浮点数类型字段
		ew, ok := StringToFloat64(c, item.Ew, "ew")
		if !ok {
			return
		}

		ot1, ok := StringToFloat64(c, item.Ot1, "ot1")
		if !ok {
			return
		}

		ew1, ok := StringToFloat64(c, item.Ew1, "ew1")
		if !ok {
			return
		}

		ew2, ok := StringToFloat64(c, item.Ew2, "ew2")
		if !ok {
			return
		}

		ew3, ok := StringToFloat64(c, item.Ew3, "ew3")
		if !ok {
			return
		}

		ot2, ok := StringToFloat64(c, item.Ot2, "ot2")
		if !ok {
			return
		}

		ot3, ok := StringToFloat64(c, item.Ot3, "ot3")
		if !ok {
			return
		}

		leaveReplc, ok := StringToFloat64(c, item.LeaveReplc, "leave_replc")
		if !ok {
			return
		}

		unpresent, ok := StringToFloat64(c, item.Unpresent, "unpresent")
		if !ok {
			return
		}

		importReq.Attendances[i] = service.ImportAttendanceItem{
			EmployeeID: item.EmployeeID,
			ProjectID:  projectID,
			Month:      item.Month,
			Day1:       item.Day1,
			Day2:       item.Day2,
			Day3:       item.Day3,
			Day4:       item.Day4,
			Day5:       item.Day5,
			Day6:       item.Day6,
			Day7:       item.Day7,
			Day8:       item.Day8,
			Day9:       item.Day9,
			Day10:      item.Day10,
			Day11:      item.Day11,
			Day12:      item.Day12,
			Day13:      item.Day13,
			Day14:      item.Day14,
			Day15:      item.Day15,
			Day16:      item.Day16,
			Day17:      item.Day17,
			Day18:      item.Day18,
			Day19:      item.Day19,
			Day20:      item.Day20,
			Day21:      item.Day21,
			Day22:      item.Day22,
			Day23:      item.Day23,
			Day24:      item.Day24,
			Day25:      item.Day25,
			Day26:      item.Day26,
			Day27:      item.Day27,
			Day28:      item.Day28,
			Day29:      item.Day29,
			Day30:      item.Day30,
			Day31:      item.Day31,
			Work:       work,
			Permission: permission,
			Off:        off,
			Absent:     absent,
			Sick:       sick,
			Standby:    standby,
			Ew:         ew,
			Ot1:        ot1,
			Ew1:        ew1,
			Ew2:        ew2,
			Ew3:        ew3,
			Ot2:        ot2,
			Ot3:        ot3,
			LeaveReplc: leaveReplc,
			Unpresent:  unpresent,
			// TotalDays:  item.TotalDays,
		}
	}

	if err := h.attendanceService.ImportAttendance(importReq); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}
