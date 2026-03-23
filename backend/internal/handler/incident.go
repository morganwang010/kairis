package handler

import (
	"kairis/backend/internal/model"
	"kairis/backend/internal/service"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type IncidentHandler struct {
	incidentService *service.IncidentService
}

func NewIncidentHandler(incidentService *service.IncidentService) *IncidentHandler {
	return &IncidentHandler{incidentService: incidentService}
}

type CreateIncidentRequest struct {
	EmployeeID       string `json:"employee_id" binding:"required"`
	ProjectID        string `json:"project_id" binding:"required"`
	Month            string `json:"month" binding:"required"`
	LeaveComp        string `json:"leave_comp"`
	MedAlw           string `json:"med_alw"`
	Others           string `json:"others"`
	ReligiousAlw     string `json:"religious_alw"`
	RapelBasicSalary string `json:"rapel_basic_salary"`
	RapelJmstkAlw    string `json:"rapel_jmstk_alw"`
	IncentiveAlw     string `json:"incentive_alw"`
	Acting           string `json:"acting"`
	PerformanceAlw   string `json:"performance_alw"`
	TripAlw          string `json:"trip_alw"`
	Ot2Wages         string `json:"ot2_wages"`
	Ot3Wages         string `json:"ot3_wages"`
	CompPhk          string `json:"comp_phk"`
	TaxAlwPhk        string `json:"tax_alw_phk"`
	AbsentDed        string `json:"absent_ded"`
	AbsentDed2       string `json:"absent_ded2"`
	CorrectAdd       string `json:"correct_add"`
	CorrectSub       string `json:"correct_sub"`
	IncentiveDed     string `json:"incentive_ded"`
	LoanDed          string `json:"loan_ded"`
	TaxDedPhk        string `json:"tax_ded_phk"`
	MandahAlw        string `json:"mandah_alw"`
}

type UpdateIncidentRequest struct {
	LeaveComp        string `json:"leave_comp"`
	MedAlw           string `json:"med_alw"`
	Others           string `json:"others"`
	ReligiousAlw     string `json:"religious_alw"`
	RapelBasicSalary string `json:"rapel_basic_salary"`
	RapelJmstkAlw    string `json:"rapel_jmstk_alw"`
	IncentiveAlw     string `json:"incentive_alw"`
	Acting           string `json:"acting"`
	PerformanceAlw   string `json:"performance_alw"`
	TripAlw          string `json:"trip_alw"`
	Ot2Wages         string `json:"ot2_wages"`
	Ot3Wages         string `json:"ot3_wages"`
	CompPhk          string `json:"comp_phk"`
	TaxAlwPhk        string `json:"tax_alw_phk"`
	AbsentDed        string `json:"absent_ded"`
	AbsentDed2       string `json:"absent_ded2"`
	CorrectAdd       string `json:"correct_add"`
	CorrectSub       string `json:"correct_sub"`
	IncentiveDed     string `json:"incentive_ded"`
	LoanDed          string `json:"loan_ded"`
	TaxDedPhk        string `json:"tax_ded_phk"`
	MandahAlw        string `json:"mandah_alw"`
}

func (h *IncidentHandler) Create(c *gin.Context) {
	var req CreateIncidentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	// 将字符串转换为相应类型
	projectID, ok := StringToInt(c, req.ProjectID, "project_id")
	if !ok {
		return
	}

	// 创建 incident 实例
	incident := &model.Incidents{
		EmployeeID: req.EmployeeID,
		ProjectID:  projectID,
		Month:      req.Month,
	}

	// 转换数值字段
	if req.LeaveComp != "" {
		if val, ok := StringToFloat64(c, req.LeaveComp, "leave_comp"); ok {
			incident.LeaveComp = val
		} else {
			return
		}
	}
	if req.MedAlw != "" {
		if val, ok := StringToFloat64(c, req.MedAlw, "med_alw"); ok {
			incident.MedAlw = val
		} else {
			return
		}
	}
	if req.Others != "" {
		if val, ok := StringToFloat64(c, req.Others, "others"); ok {
			incident.Others = val
		} else {
			return
		}
	}
	if req.ReligiousAlw != "" {
		if val, ok := StringToFloat64(c, req.ReligiousAlw, "religious_alw"); ok {
			incident.ReligiousAlw = val
		} else {
			return
		}
	}
	if req.RapelBasicSalary != "" {
		if val, ok := StringToFloat64(c, req.RapelBasicSalary, "rapel_basic_salary"); ok {
			incident.RapelBasicSalary = val
		} else {
			return
		}
	}
	if req.RapelJmstkAlw != "" {
		if val, ok := StringToFloat64(c, req.RapelJmstkAlw, "rapel_jmstk_alw"); ok {
			incident.RapelJmstkAlw = val
		} else {
			return
		}
	}
	if req.IncentiveAlw != "" {
		if val, ok := StringToFloat64(c, req.IncentiveAlw, "incentive_alw"); ok {
			incident.IncentiveAlw = val
		} else {
			return
		}
	}
	if req.Acting != "" {
		if val, ok := StringToFloat64(c, req.Acting, "acting"); ok {
			incident.Acting = val
		} else {
			return
		}
	}
	if req.PerformanceAlw != "" {
		if val, ok := StringToFloat64(c, req.PerformanceAlw, "performance_alw"); ok {
			incident.PerformanceAlw = val
		} else {
			return
		}
	}
	if req.TripAlw != "" {
		if val, ok := StringToFloat64(c, req.TripAlw, "trip_alw"); ok {
			incident.TripAlw = val
		} else {
			return
		}
	}
	if req.Ot2Wages != "" {
		if val, ok := StringToFloat64(c, req.Ot2Wages, "ot2_wages"); ok {
			incident.Ot2Wages = val
		} else {
			return
		}
	}
	if req.Ot3Wages != "" {
		if val, ok := StringToFloat64(c, req.Ot3Wages, "ot3_wages"); ok {
			incident.Ot3Wages = val
		} else {
			return
		}
	}
	if req.CompPhk != "" {
		if val, ok := StringToFloat64(c, req.CompPhk, "comp_phk"); ok {
			incident.CompPhk = val
		} else {
			return
		}
	}
	if req.TaxAlwPhk != "" {
		if val, ok := StringToFloat64(c, req.TaxAlwPhk, "tax_alw_phk"); ok {
			incident.TaxAlwPhk = val
		} else {
			return
		}
	}
	if req.AbsentDed != "" {
		if val, ok := StringToFloat64(c, req.AbsentDed, "absent_ded"); ok {
			incident.AbsentDed = val
		} else {
			return
		}
	}
	if req.AbsentDed2 != "" {
		if val, ok := StringToFloat64(c, req.AbsentDed2, "absent_ded2"); ok {
			incident.AbsentDed2 = val
		} else {
			return
		}
	}
	if req.CorrectAdd != "" {
		if val, ok := StringToFloat64(c, req.CorrectAdd, "correct_add"); ok {
			incident.CorrectAdd = val
		} else {
			return
		}
	}
	if req.CorrectSub != "" {
		if val, ok := StringToFloat64(c, req.CorrectSub, "correct_sub"); ok {
			incident.CorrectSub = val
		} else {
			return
		}
	}
	if req.IncentiveDed != "" {
		if val, ok := StringToFloat64(c, req.IncentiveDed, "incentive_ded"); ok {
			incident.IncentiveDed = val
		} else {
			return
		}
	}
	if req.LoanDed != "" {
		if val, ok := StringToFloat64(c, req.LoanDed, "loan_ded"); ok {
			incident.LoanDed = val
		} else {
			return
		}
	}
	if req.TaxDedPhk != "" {
		if val, ok := StringToFloat64(c, req.TaxDedPhk, "tax_ded_phk"); ok {
			incident.TaxDedPhk = val
		} else {
			return
		}
	}
	if req.MandahAlw != "" {
		if val, ok := StringToFloat64(c, req.MandahAlw, "mandah_alw"); ok {
			incident.MandahAlw = val
		} else {
			return
		}
	}

	if err := h.incidentService.CreateIncident(incident); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": incident})
}

func (h *IncidentHandler) Get(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid incident ID"})
		return
	}

	incident, err := h.incidentService.GetIncidentByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "Incident not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": incident})
}

func (h *IncidentHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	projectID := c.Query("projectId")
	month := c.Query("month")

	offset := (page - 1) * pageSize

	incidents, total, err := h.incidentService.ListIncidents(offset, pageSize, projectID, month)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "Success",
		"data": gin.H{
			"list":     incidents,
			"total":    total,
			"page":     page,
			"pageSize": pageSize,
		},
	})
}

func (h *IncidentHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid incident ID"})
		return
	}

	var req UpdateIncidentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		slog.Error("更新偶发事件记录请求参数错误", "id", id, "error", err.Error())
		return
	}

	incident, err := h.incidentService.GetIncidentByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "Incident not found"})
		return
	}

	// 将字符串转换为 float64
	if req.LeaveComp != "" {
		if val, ok := StringToFloat64(c, req.LeaveComp, "leave_comp"); ok {
			incident.LeaveComp = val
		} else {
			return
		}
	}
	if req.MedAlw != "" {
		if val, ok := StringToFloat64(c, req.MedAlw, "med_alw"); ok {
			incident.MedAlw = val
		} else {
			return
		}
	}
	if req.Others != "" {
		if val, ok := StringToFloat64(c, req.Others, "others"); ok {
			incident.Others = val
		} else {
			return
		}
	}
	if req.ReligiousAlw != "" {
		if val, ok := StringToFloat64(c, req.ReligiousAlw, "religious_alw"); ok {
			incident.ReligiousAlw = val
		} else {
			return
		}
	}
	if req.RapelBasicSalary != "" {
		if val, ok := StringToFloat64(c, req.RapelBasicSalary, "rapel_basic_salary"); ok {
			incident.RapelBasicSalary = val
		} else {
			return
		}
	}
	if req.RapelJmstkAlw != "" {
		if val, ok := StringToFloat64(c, req.RapelJmstkAlw, "rapel_jmstk_alw"); ok {
			incident.RapelJmstkAlw = val
		} else {
			return
		}
	}
	if req.IncentiveAlw != "" {
		if val, ok := StringToFloat64(c, req.IncentiveAlw, "incentive_alw"); ok {
			incident.IncentiveAlw = val
		} else {
			return
		}
	}
	if req.Acting != "" {
		if val, ok := StringToFloat64(c, req.Acting, "acting"); ok {
			incident.Acting = val
		} else {
			return
		}
	}
	if req.PerformanceAlw != "" {
		if val, ok := StringToFloat64(c, req.PerformanceAlw, "performance_alw"); ok {
			incident.PerformanceAlw = val
		} else {
			return
		}
	}
	if req.TripAlw != "" {
		if val, ok := StringToFloat64(c, req.TripAlw, "trip_alw"); ok {
			incident.TripAlw = val
		} else {
			return
		}
	}
	if req.Ot2Wages != "" {
		if val, ok := StringToFloat64(c, req.Ot2Wages, "ot2_wages"); ok {
			incident.Ot2Wages = val
		} else {
			return
		}
	}
	if req.Ot3Wages != "" {
		if val, ok := StringToFloat64(c, req.Ot3Wages, "ot3_wages"); ok {
			incident.Ot3Wages = val
		} else {
			return
		}
	}
	if req.CompPhk != "" {
		if val, ok := StringToFloat64(c, req.CompPhk, "comp_phk"); ok {
			incident.CompPhk = val
		} else {
			return
		}
	}
	if req.TaxAlwPhk != "" {
		if val, ok := StringToFloat64(c, req.TaxAlwPhk, "tax_alw_phk"); ok {
			incident.TaxAlwPhk = val
		} else {
			return
		}
	}
	if req.AbsentDed != "" {
		if val, ok := StringToFloat64(c, req.AbsentDed, "absent_ded"); ok {
			incident.AbsentDed = val
		} else {
			return
		}
	}
	if req.AbsentDed2 != "" {
		if val, ok := StringToFloat64(c, req.AbsentDed2, "absent_ded2"); ok {
			incident.AbsentDed2 = val
		} else {
			return
		}
	}
	if req.CorrectAdd != "" {
		if val, ok := StringToFloat64(c, req.CorrectAdd, "correct_add"); ok {
			incident.CorrectAdd = val
		} else {
			return
		}
	}
	if req.CorrectSub != "" {
		if val, ok := StringToFloat64(c, req.CorrectSub, "correct_sub"); ok {
			incident.CorrectSub = val
		} else {
			return
		}
	}
	if req.IncentiveDed != "" {
		if val, ok := StringToFloat64(c, req.IncentiveDed, "incentive_ded"); ok {
			incident.IncentiveDed = val
		} else {
			return
		}
	}
	if req.LoanDed != "" {
		if val, ok := StringToFloat64(c, req.LoanDed, "loan_ded"); ok {
			incident.LoanDed = val
		} else {
			return
		}
	}
	if req.TaxDedPhk != "" {
		if val, ok := StringToFloat64(c, req.TaxDedPhk, "tax_ded_phk"); ok {
			incident.TaxDedPhk = val
		} else {
			return
		}
	}
	if req.MandahAlw != "" {
		if val, ok := StringToFloat64(c, req.MandahAlw, "mandah_alw"); ok {
			incident.MandahAlw = val
		} else {
			return
		}
	}

	if err := h.incidentService.UpdateIncident(incident); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": incident})
}

func (h *IncidentHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid incident ID"})
		return
	}

	if err := h.incidentService.DeleteIncident(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}

func (h *IncidentHandler) Import(c *gin.Context) {
	var req struct {
		Records []struct {
			EmployeeID       string `json:"employee_id"`
			ProjectID        string `json:"project_id"`
			Month            string `json:"month"`
			LeaveComp        string `json:"leave_comp"`
			MedAlw           string `json:"med_alw"`
			Others           string `json:"others"`
			ReligiousAlw     string `json:"religious_alw"`
			RapelBasicSalary string `json:"rapel_basic_salary"`
			RapelJmstkAlw    string `json:"rapel_jmstk_alw"`
			IncentiveAlw     string `json:"incentive_alw"`
			Acting           string `json:"acting"`
			PerformanceAlw   string `json:"performance_alw"`
			TripAlw          string `json:"trip_alw"`
			Ot2Wages         string `json:"ot2_wages"`
			Ot3Wages         string `json:"ot3_wages"`
			CompPhk          string `json:"comp_phk"`
			TaxAlwPhk        string `json:"tax_alw_phk"`
			AbsentDed        string `json:"absent_ded"`
			AbsentDed2       string `json:"absent_ded2"`
			CorrectAdd       string `json:"correct_add"`
			CorrectSub       string `json:"correct_sub"`
			IncentiveDed     string `json:"incentive_ded"`
			LoanDed          string `json:"loan_ded"`
			TaxDedPhk        string `json:"tax_ded_phk"`
			MandahAlw        string `json:"mandah_alw"`
		} `json:"records"`
	}
	slog.Info("Before binding", "req", &req)
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	importReq := service.ImportIncidentRequest{
		Incidents: make([]service.ImportIncidentItem, len(req.Records)),
	}

	for i, item := range req.Records {
		// 转换ProjectID为int类型
		projectID, ok := StringToInt(c, item.ProjectID, "project_id")
		if !ok {
			return
		}

		// 转换所有字段为float64类型
		leaveComp, ok := StringToFloat64(c, item.LeaveComp, "leave_comp")
		if !ok {
			return
		}
		medAlw, ok := StringToFloat64(c, item.MedAlw, "med_alw")
		if !ok {
			return
		}
		// 其他字段的转换...
		others, ok := StringToFloat64(c, item.Others, "others")
		if !ok {
			return
		}
		religiousAlw, ok := StringToFloat64(c, item.ReligiousAlw, "religious_alw")
		if !ok {
			return
		}
		rapelBasicSalary, ok := StringToFloat64(c, item.RapelBasicSalary, "rapel_basic_salary")
		if !ok {
			return
		}
		rapelJmstkAlw, ok := StringToFloat64(c, item.RapelJmstkAlw, "rapel_jmstk_alw")
		if !ok {
			return
		}
		incentiveAlw, ok := StringToFloat64(c, item.IncentiveAlw, "incentive_alw")
		if !ok {
			return
		}
		acting, ok := StringToFloat64(c, item.Acting, "acting")
		if !ok {
			return
		}
		performanceAlw, ok := StringToFloat64(c, item.PerformanceAlw, "performance_alw")
		if !ok {
			return
		}
		tripAlw, ok := StringToFloat64(c, item.TripAlw, "trip_alw")
		if !ok {
			return
		}
		ot2Wages, ok := StringToFloat64(c, item.Ot2Wages, "ot2_wages")
		if !ok {
			return
		}
		ot3Wages, ok := StringToFloat64(c, item.Ot3Wages, "ot3_wages")
		if !ok {
			return
		}
		compPhk, ok := StringToFloat64(c, item.CompPhk, "comp_phk")
		if !ok {
			return
		}
		taxAlwPhk, ok := StringToFloat64(c, item.TaxAlwPhk, "tax_alw_phk")
		if !ok {
			return
		}
		absentDed, ok := StringToFloat64(c, item.AbsentDed, "absent_ded")
		if !ok {
			return
		}
		absentDed2, ok := StringToFloat64(c, item.AbsentDed2, "absent_ded2")
		if !ok {
			return
		}
		correctAdd, ok := StringToFloat64(c, item.CorrectAdd, "correct_add")
		if !ok {
			return
		}
		correctSub, ok := StringToFloat64(c, item.CorrectSub, "correct_sub")
		if !ok {
			return
		}
		incentiveDed, ok := StringToFloat64(c, item.IncentiveDed, "incentive_ded")
		if !ok {
			return
		}
		loanDed, ok := StringToFloat64(c, item.LoanDed, "loan_ded")
		if !ok {
			return
		}
		taxDedPhk, ok := StringToFloat64(c, item.TaxDedPhk, "tax_ded_phk")
		if !ok {
			return
		}
		mandahAlw, ok := StringToFloat64(c, item.MandahAlw, "mandah_alw")
		if !ok {
			return
		}

		importReq.Incidents[i] = service.ImportIncidentItem{
			EmployeeID:       item.EmployeeID,
			ProjectID:        projectID,
			Month:            item.Month,
			LeaveComp:        leaveComp,
			MedAlw:           medAlw,
			Others:           others,
			ReligiousAlw:     religiousAlw,
			RapelBasicSalary: rapelBasicSalary,
			RapelJmstkAlw:    rapelJmstkAlw,
			IncentiveAlw:     incentiveAlw,
			Acting:           acting,
			PerformanceAlw:   performanceAlw,
			TripAlw:          tripAlw,
			Ot2Wages:         ot2Wages,
			Ot3Wages:         ot3Wages,
			CompPhk:          compPhk,
			TaxAlwPhk:        taxAlwPhk,
			AbsentDed:        absentDed,
			AbsentDed2:       absentDed2,
			CorrectAdd:       correctAdd,
			CorrectSub:       correctSub,
			IncentiveDed:     incentiveDed,
			LoanDed:          loanDed,
			TaxDedPhk:        taxDedPhk,
			MandahAlw:        mandahAlw,
		}
	}

	if err := h.incidentService.ImportIncident(importReq); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}
