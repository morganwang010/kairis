package handler

import (
	"kairis/backend/internal/model"
	"kairis/backend/internal/service"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type SalaryHandler struct {
	salaryService *service.SalaryService
}

func NewSalaryHandler(salaryService *service.SalaryService) *SalaryHandler {
	return &SalaryHandler{salaryService: salaryService}
}

func (h *SalaryHandler) Create(c *gin.Context) {
	var req model.Salaries

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	if err := h.salaryService.Create(&req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}

func (h *SalaryHandler) Get(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid ID"})
		return
	}
	salary, err := h.salaryService.Get(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": salary})
}

func (h *SalaryHandler) List(c *gin.Context) {
	month := c.Query("month")
	projectIDStr := c.Query("project_id")
	offsetStr := c.Query("offset")
	limitStr := c.Query("limit")

	slog.Info("List salaries", "month", month, "project_id", projectIDStr)

	projectID, ok := StringToInt(c, projectIDStr, "project_id")
	if !ok {
		return
	}

	offset, limit := 0, 10
	if offsetStr != "" {
		var err error
		offset, err = strconv.Atoi(offsetStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
			return
		}
	}
	if limitStr != "" {
		var err error
		limit, err = strconv.Atoi(limitStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
			return
		}
	}

	salaries, total, err := h.salaryService.List(offset, limit, month, projectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": salaries, "total": total})
}

func (h *SalaryHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid ID"})
		return
	}

	var req model.Salaries
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	req.ID = uint(id)
	if err := h.salaryService.Update(&req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}

func (h *SalaryHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid ID"})
		return
	}
	if err := h.salaryService.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}

func (h *SalaryHandler) Import(c *gin.Context) {
	var req struct {
		ProjectID string `json:"projectId"`
		Month     string `json:"month"`
		Records   []struct {
			EmployeeID       string  `json:"employee_id"`
			TaxStatus        float64 `json:"tax_status"`
			BasicSalary      float64 `json:"basic_salary"`
			HousingAlw       float64 `json:"housing_alw"`
			PositionAlw      float64 `json:"position_alw"`
			FieldAlw         float64 `json:"field_alw"`
			FixAlw           float64 `json:"fix_alw"`
			JmstkAlw         float64 `json:"jmstk_alw"`
			PensionAlw       float64 `json:"pension_alw"`
			MealAlw          float64 `json:"meal_alw"`
			TranspAlw        float64 `json:"transp_alw"`
			TaxAlwSalary     float64 `json:"tax_alw_salary"`
			TaxAlwPhk        float64 `json:"tax_alw_phk"`
			CompPhk          float64 `json:"comp_phk"`
			AskesBpjsAlw     float64 `json:"askes_bpjs_alw"`
			MedAlw           float64 `json:"med_alw"`
			PulsaAlw         float64 `json:"pulsa_alw"`
			Others           float64 `json:"others"`
			AttAlw           float64 `json:"att_alw"`
			HousingAlwTetap  float64 `json:"housing_alw_tetap"`
			ReligiousAlw     float64 `json:"religious_alw"`
			RapelBasicSalary float64 `json:"rapel_basic_salary"`
			RapelJmstkAlw    float64 `json:"rapel_jmstk_alw"`
			IncentiveAlw     float64 `json:"incentive_alw"`
			Acting           float64 `json:"acting"`
			PerformanceAlw   float64 `json:"performance_alw"`
			TripAlw          float64 `json:"trip_alw"`
			Ot1Wages         float64 `json:"ot1_wages"`
			Ot1Hour          float64 `json:"ot1_hour"`
			Ew1Hour          float64 `json:"ew1_hour"`
			Ew1Wages         float64 `json:"ew1_wages"`
			Ew2Hour          float64 `json:"ew2_hour"`
			Ew2Wages         float64 `json:"ew2_wages"`
			Ew3Hour          float64 `json:"ew3_hour"`
			Ew3Wages         float64 `json:"ew3_wages"`
			CorrectAdd       float64 `json:"correct_add"`
			CorrectSub       float64 `json:"correct_sub"`
			LeavComp         float64 `json:"leav_comp"`
			TotalAccept      float64 `json:"total_accept"`
			JmstkFee         float64 `json:"jmstk_fee"`
			PensionDed       float64 `json:"pension_ded"`
			TaxDedSalary     float64 `json:"tax_ded_salary"`
			TaxDedPhk        float64 `json:"tax_ded_phk"`
			AskesBpjsDed     float64 `json:"askes_bpjs_ded"`
			IncentiveDed     float64 `json:"incentive_ded"`
			LoanDed          float64 `json:"loan_ded"`
			AbsentDed        float64 `json:"absent_ded"`
			AbsentDed2       float64 `json:"absent_ded2"`
			NetAccept        float64 `json:"net_accept"`
			RoundOffSalary   float64 `json:"round_off_salary"`
			TotalNetWages    float64 `json:"total_net_wages"`
			SalarySlipStatus string  `json:"salary_slip_status"`
			PulsaAlwMonth    float64 `json:"pulsa_alw_month"`
			MandahAlw        float64 `json:"mandah_alw"`
			IsCalculate      int     `json:"is_calculate"`
			DeleteFlag       int     `json:"delete_flag"`
		} `json:"records"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	// 转换ProjectID为int类型
	projectID, ok := StringToInt(c, req.ProjectID, "project_id")
	if !ok {
		return
	}

	importReq := service.ImportSalaryRequest{
		Salaries: make([]service.ImportSalaryItem, len(req.Records)),
	}

	for i, item := range req.Records {
		importReq.Salaries[i] = service.ImportSalaryItem{
			Month:            req.Month,
			ProjectID:        projectID,
			EmployeeID:       item.EmployeeID,
			TaxStatus:        item.TaxStatus,
			BasicSalary:      item.BasicSalary,
			HousingAlw:       item.HousingAlw,
			PositionAlw:      item.PositionAlw,
			FieldAlw:         item.FieldAlw,
			FixAlw:           item.FixAlw,
			JmstkAlw:         item.JmstkAlw,
			PensionAlw:       item.PensionAlw,
			MealAlw:          item.MealAlw,
			TranspAlw:        item.TranspAlw,
			TaxAlwSalary:     item.TaxAlwSalary,
			TaxAlwPhk:        item.TaxAlwPhk,
			CompPhk:          item.CompPhk,
			AskesBpjsAlw:     item.AskesBpjsAlw,
			MedAlw:           item.MedAlw,
			PulsaAlw:         item.PulsaAlw,
			Others:           item.Others,
			AttAlw:           item.AttAlw,
			HousingAlwTetap:  item.HousingAlwTetap,
			ReligiousAlw:     item.ReligiousAlw,
			RapelBasicSalary: item.RapelBasicSalary,
			RapelJmstkAlw:    item.RapelJmstkAlw,
			IncentiveAlw:     item.IncentiveAlw,
			Acting:           item.Acting,
			PerformanceAlw:   item.PerformanceAlw,
			TripAlw:          item.TripAlw,
			Ot1Wages:         item.Ot1Wages,
			Ot1Hour:          item.Ot1Hour,
			Ew1Hour:          item.Ew1Hour,
			Ew1Wages:         item.Ew1Wages,
			Ew2Hour:          item.Ew2Hour,
			Ew2Wages:         item.Ew2Wages,
			Ew3Hour:          item.Ew3Hour,
			Ew3Wages:         item.Ew3Wages,
			CorrectAdd:       item.CorrectAdd,
			CorrectSub:       item.CorrectSub,
			LeavComp:         item.LeavComp,
			TotalAccept:      item.TotalAccept,
			JmstkFee:         item.JmstkFee,
			PensionDed:       item.PensionDed,
			TaxDedSalary:     item.TaxDedSalary,
			TaxDedPhk:        item.TaxDedPhk,
			AskesBpjsDed:     item.AskesBpjsDed,
			IncentiveDed:     item.IncentiveDed,
			LoanDed:          item.LoanDed,
			AbsentDed:        item.AbsentDed,
			AbsentDed2:       item.AbsentDed2,
			NetAccept:        item.NetAccept,
			RoundOffSalary:   item.RoundOffSalary,
			TotalNetWages:    item.TotalNetWages,
			SalarySlipStatus: item.SalarySlipStatus,
			PulsaAlwMonth:    item.PulsaAlwMonth,
			MandahAlw:        item.MandahAlw,
			IsCalculate:      item.IsCalculate,
			DeleteFlag:       item.DeleteFlag,
		}
	}

	if err := h.salaryService.ImportSalary(importReq); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}

func (h *SalaryHandler) Calculate(c *gin.Context) {
	var req struct {
		Params struct {
			Month     string `json:"month"`
			ProjectID string `json:"project_id"`
		} `json:"params"`
	}
	// slog.Info("Calculate salary", "params", req)
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid request body"})
		return
	}

	month := req.Params.Month
	projectIDStr := req.Params.ProjectID
	slog.Info("Calculate salary", "month", month, "project_id", projectIDStr)

	if month == "" {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Month is required"})
		return
	}

	projectID, ok := StringToInt(c, projectIDStr, "project_id")
	if !ok {
		return
	}

	if err := h.salaryService.Calculate(month, projectID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}

// 获取薪资汇总
func (h *SalaryHandler) TotalSalary(c *gin.Context) {
	// var req struct {
	// 	Params struct {
	// 		Month     string `json:"month"`
	// 		ProjectID string `json:"project_id"`
	// 	} `json:"params"`
	// }
	// slog.Info("Total salary", "params", req)
	// if err := c.ShouldBindJSON(&req); err != nil {
	// 	c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid request body"})
	// 	return
	// }

	// month := req.Params.Month
	// projectIDStr := req.Params.ProjectID
	// slog.Info("Total salary", "month", month, "project_id", projectIDStr)

	// if month == "" {
	// 	c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Month is required"})
	// 	return
	// }

	// projectID, ok := StringToInt(c, projectIDStr, "project_id")
	// if !ok {
	// 	return
	// }
	total, err := h.salaryService.Total()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "total": total})
}
