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
	EmployeeID      string  `json:"employee_id" binding:"required"`
	ProjectID       string  `json:"project_id" binding:"required"`
	Month           string  `json:"month" binding:"required"`
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

type UpdateIncidentRequest struct {
	LeaveComp       float64 `json:"leave_comp"`
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
		EmployeeID:      req.EmployeeID,
		ProjectID:       projectID,
		Month:           req.Month,
		Thr:             req.Thr,
		Bonus:           req.Bonus,
		Compensation:    req.Compensation,
		ActingAllowance: req.ActingAllowance,
		SalaryProrate:   req.SalaryProrate,
		Rapel:           req.Rapel,
		TaxAlw:          req.TaxAlw,
		TaxDed:          req.TaxDed,
		OtherAdd:        req.OtherAdd,
		OtherDed:        req.OtherDed,
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
	page, _ := strconv.Atoi(c.DefaultQuery("currentPage", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	projectID := c.Query("projectId")
	month := c.Query("month")
	employeeID := c.Query("employeeID")
	employeeName := c.Query("employeeName")

	offset := (page - 1) * pageSize

	incidents, total, err := h.incidentService.ListIncidents(offset, pageSize, projectID, month, employeeID, employeeName)
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
	//将updateIncidentRequest的值赋值给incident
	// if req.LeaveComp > 0 {
	// 	incident.LeaveComp = req.LeaveComp
	// }
	// if req.MedAlw > 0 {
	// 	incident.MedAlw = req.MedAlw
	// }
	// if req.Others > 0 {
	// 	incident.Others = req.Others
	// }
	// if req.ReligiousAlw > 0 {
	// 	incident.ReligiousAlw = req.ReligiousAlw
	// }
	// if req.RapelBasicSalary > 0 {
	// 	incident.RapelBasicSalary = req.RapelBasicSalary
	// }
	// if req.RapelJmstkAlw > 0 {
	// 	incident.RapelJmstkAlw = req.RapelJmstkAlw
	// }
	// if req.IncentiveAlw > 0 {
	// 	incident.IncentiveAlw = req.IncentiveAlw
	// }
	// if req.IncentiveDed > 0 {
	// 	incident.IncentiveDed = req.IncentiveDed
	// }

	// if req.LoanDed > 0 {
	// 	incident.LoanDed = req.LoanDed

	// }
	// if req.TaxDedPhk > 0 {
	// 	incident.TaxDedPhk = req.TaxDedPhk
	// }

	// if req.MandahAlw > 0 {
	// 	incident.MandahAlw = req.MandahAlw
	// }
	// if req.CorrectSub > 0 {
	// 	incident.CorrectSub = req.CorrectSub
	// }
	// if req.CorrectAdd > 0 {
	// 	incident.CorrectAdd = req.CorrectAdd
	// }
	// if req.OtAdd > 0 {
	// 	incident.OtAdd = req.OtAdd
	// }
	// if req.EwAdd > 0 {
	// 	incident.EwAdd = req.EwAdd
	// }
	// if req.EwDrv > 0 {
	// 	incident.EwDrv = req.EwDrv
	// }
	// if req.OtDrv > 0 {
	// 	incident.OtDrv = req.OtDrv
	// }
	// if req.MealAlwAdd > 0 {
	// 	incident.MealAlwAdd = req.MealAlwAdd
	// }
	// if req.TranspAlwAdd > 0 {
	// 	incident.TranspAlwAdd = req.TranspAlwAdd
	// }

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

func (h *IncidentHandler) DeleteByIDs(c *gin.Context) {
	var req struct {
		IDs []uint `json:"ids"`
	}

	slog.Info("批量删除事件记录", "ids", req.IDs)

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	if len(req.IDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "IDs cannot be empty"})
		return
	}

	if err := h.incidentService.DeleteIncidentByIDs(req.IDs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}

func (h *IncidentHandler) Import(c *gin.Context) {
	var req struct {
		Records []struct {
			EmployeeID      string `json:"employee_id"`
			ProjectID       string `json:"project_id"`
			Month           string `json:"month"`
			Thr             string `json:"thr"`
			Bonus           string `json:"bonus"`
			Compensation    string `json:"compensation"`
			ActingAllowance string `json:"acting_alw"`
			SalaryProrate   string `json:"salary_prorate"`
			Rapel           string `json:"rapel"`
			TaxAlw          string `json:"tax_alw"`
			TaxDed          string `json:"tax_ded"`
			OtherAdd        string `json:"other_add"`
			OtherDed        string `json:"other_ded"`
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
		thr, ok := StringToFloat64(c, item.Thr, "thr")
		if !ok {
			return
		}
		bonus, ok := StringToFloat64(c, item.Bonus, "bonus")
		if !ok {
			return
		}
		compensation, ok := StringToFloat64(c, item.Compensation, "compensation")
		if !ok {
			return
		}
		actingAllowance, ok := StringToFloat64(c, item.ActingAllowance, "acting_alw")
		if !ok {
			return
		}
		salaryProrate, ok := StringToFloat64(c, item.SalaryProrate, "salary_prorate")
		if !ok {
			return
		}
		rapel, ok := StringToFloat64(c, item.Rapel, "rapel")
		if !ok {
			return
		}
		taxAlw, ok := StringToFloat64(c, item.TaxAlw, "tax_alw")
		if !ok {
			return
		}
		taxDed, ok := StringToFloat64(c, item.TaxDed, "tax_ded")
		if !ok {
			return
		}
		otherAdd, ok := StringToFloat64(c, item.OtherAdd, "other_add")
		if !ok {
			return
		}
		otherDed, ok := StringToFloat64(c, item.OtherDed, "other_ded")
		if !ok {
			return
		}

		importReq.Incidents[i] = service.ImportIncidentItem{
			EmployeeID:      item.EmployeeID,
			ProjectID:       projectID,
			Month:           item.Month,
			Thr:             thr,
			Bonus:           bonus,
			Compensation:    compensation,
			ActingAllowance: actingAllowance,
			SalaryProrate:   salaryProrate,
			Rapel:           rapel,
			TaxAlw:          taxAlw,
			TaxDed:          taxDed,
			OtherAdd:        otherAdd,
			OtherDed:        otherDed,
		}
	}

	if err := h.incidentService.ImportIncident(importReq); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}
