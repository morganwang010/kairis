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
	W          float64 `json:"w"`
	On         float64 `json:"on"`
	OsOa       float64 `json:"os_oa"`
	Ot         float64 `json:"ot"`
	Ovt        float64 `json:"ovt"`
	Bt         float64 `json:"bt"`
	T          float64 `json:"t"`
	Tnt        float64 `json:"tnt"`
	Al         float64 `json:"al"`
	Rot        float64 `json:"rot"`
	Tr         float64 `json:"tr"`
	St         float64 `json:"st"`
	Ls         float64 `json:"ls"`
	Q          float64 `json:"q"`
	Wfh        float64 `json:"wfh"`
	Pl         float64 `json:"pl"`
	L          float64 `json:"l"`
	Sc         float64 `json:"sc"`
	Sc1        float64 `json:"sc1"`
	Co         float64 `json:"co"`
	Pm         float64 `json:"pm"`
	Na         float64 `json:"na"`
}

func (h *AttendanceHandler) Create(c *gin.Context) {
	var req CreateAttendanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	attendance := &model.Attendances{
		EmployeeID: req.EmployeeID,
		Work:       req.Work,
		ProjectID:  req.ProjectID,
		Permission: req.Permission,
		Off:        float64(req.Off),
		Month:      req.Month,
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
	employeeID := c.Query("employee_id")
	employeeName := c.Query("employee_name")

	offset := (page - 1) * pageSize

	attendances, total, err := h.attendanceService.ListAttendances(offset, pageSize, projectID, month, employeeID, employeeName)
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

	attendance.Work = req.Work
	attendance.Permission = req.Permission
	attendance.Off = float64(req.Off)
	attendance.Month = req.Month

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

// 传入一个id的数组，进行批量删除
func (h *AttendanceHandler) DeleteByIDs(c *gin.Context) {
	var req struct {
		IDs []uint `json:"ids"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	if len(req.IDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "IDs cannot be empty"})
		return
	}

	slog.Info("批量删除考勤记录", "ids", req.IDs)

	if err := h.attendanceService.DeleteAttendanceByIDs(req.IDs); err != nil {
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
	// slog.Info("Received request body", "body", string(body))

	// 重置请求体，以便后续的ShouldBindJSON可以读取
	c.Request.Body = io.NopCloser(bytes.NewBuffer(body))

	var req struct {
		Records []struct {
			EmployeeID string `json:"employee_id"`
			ProjectID  string `json:"project_id"`
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
		} `json:"records"`
	}

	// slog.Info("Before binding", "req", &req)
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
		// slog.Info("projectID", "projectID", item.ProjectID)
		// 转换整数类型字段
		// work, ok := StringToInt(c, item.Work, "work"P
		// if !ok {
		// 	return
		// }

		// permission, ok := StringToInt(c, item.Permission, "permission")
		// if !ok {
		// 	return
		// }

		// off, ok := StringToInt(c, item.Off, "off")
		// if !ok {
		// 	return
		// }

		// absent, ok := StringToInt(c, item.Absent, "absent")
		// if !ok {
		// 	return
		// }

		// sick, ok := StringToInt(c, item.Sick, "sick")
		// if !ok {
		// 	return
		// }

		// standby, ok := StringToInt(c, item.Standby, "standby")
		// if !ok {
		// 	return
		// }

		// // totalDays, ok := StringToInt(c, item.TotalDays, "total_days")
		// // if !ok {
		// // 	return
		// // }

		// // 转换浮点数类型字段
		// w, ok := StringToFloat64(c, item.W, "w")
		// if !ok {
		// 	return
		// }
		// onDay, ok := StringToFloat64(c, item.On, "on")
		// if !ok {
		// 	return
		// }
		// osOa, ok := StringToFloat64(c, item.OsOa, "os_oa")
		// if !ok {
		// 	return
		// }
		// ot, ok := StringToFloat64(c, item.Ot, "ot")
		// if !ok {
		// 	return
		// }
		// ovt, ok := StringToFloat64(c, item.Ovt, "ovt")
		// if !ok {
		// 	return
		// }
		// bt, ok := StringToFloat64(c, item.Bt, "bt")
		// if !ok {
		// 	return
		// }
		// t, ok := StringToFloat64(c, item.T, "t")
		// if !ok {
		// 	return
		// }
		// tnt, ok := StringToFloat64(c, item.Tnt, "tnt")
		// if !ok {
		// 	return
		// }
		// al, ok := StringToFloat64(c, item.Al, "al")
		// if !ok {
		// 	return
		// }
		// rot, ok := StringToFloat64(c, item.Rot, "rot")
		// if !ok {
		// 	return
		// }
		// tr, ok := StringToFloat64(c, item.Tr, "tr")
		// if !ok {
		// 	return
		// }
		// st, ok := StringToFloat64(c, item.St, "st")
		// if !ok {
		// 	return
		// }
		// ls, ok := StringToFloat64(c, item.Ls, "ls")
		// if !ok {
		// 	return
		// }
		// q, ok := StringToFloat64(c, item.Q, "q")
		// if !ok {
		// 	return
		// }
		// wfh, ok := StringToFloat64(c, item.Wfh, "wfh")
		// if !ok {
		// 	return
		// }
		// pl, ok := StringToFloat64(c, item.Pl, "pl")
		// if !ok {
		// 	return
		// }
		// l, ok := StringToFloat64(c, item.L, "l")
		// if !ok {
		// 	return
		// }
		// sc, ok := StringToFloat64(c, item.Sc, "sc")
		// if !ok {
		// 	return
		// }
		// sc1, ok := StringToFloat64(c, item.Sc1, "sc1")
		// if !ok {
		// 	return
		// }
		// co, ok := StringToFloat64(c, item.Co, "co")
		// if !ok {
		// 	return
		// }
		// pm, ok := StringToFloat64(c, item.Pm, "pm")
		// if !ok {
		// 	return
		// }
		// na, ok := StringToFloat64(c, item.Na, "na")
		// if !ok {
		// 	return
		// }
		slog.Info("ons", "ons", item.Ons, "os_oa", item.OsOa, "t", item.T)
		importReq.Attendances[i] = service.ImportAttendanceItem{
			EmployeeID: item.EmployeeID,
			ProjectID:  projectID,
			Month:      item.Month,
			Off:        item.Off,
			W:          item.W,
			Ons:        item.Ons,
			OsOa:       item.OsOa,
			Ot:         item.Ot,
			Ovt:        item.Ovt,
			Bt:         item.Bt,
			T:          item.T,
			Tnt:        item.Tnt,
			Al:         item.Al,
			Rot:        item.Rot,
			Tr:         item.Tr,
			St:         item.St,
			Ls:         item.Ls,
			Q:          item.Q,
			Wfh:        item.Wfh,
			Pl:         item.Pl,
			L:          item.L,
			Sc:         item.Sc,
			Sc1:        item.Sc1,
			Co:         item.Co,
			Pm:         item.Pm,
			Na:         item.Na,
		}
	}

	if err := h.attendanceService.ImportAttendance(importReq); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}
