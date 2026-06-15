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
	On         float64 `json:"ons"`
	Os         float64 `json:"os"`
	Oa         float64 `json:"oa"`
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
			Os         string `json:"os"`
			Oa         string `json:"oa"`
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
		slog.Info("ons", "ons", item.Ons, "os_oa", item.OsOa, "t", item.T)
		importReq.Attendances[i] = service.ImportAttendanceItem{
			EmployeeID: item.EmployeeID,
			ProjectID:  projectID,
			Month:      item.Month,
			Off:        item.Off,
			W:          item.W,
			Ons:        item.Ons,
			Os:         item.Os,
			Oa:         item.Oa,
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
