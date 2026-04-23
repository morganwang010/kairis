package handler

import (
	"kairis/backend/internal/model"
	"kairis/backend/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type SalaryCoefficientHandler struct {
	salaryCoefficientService *service.SalaryCoefficientService
}

func NewSalaryCoefficientHandler(salaryCoefficientService *service.SalaryCoefficientService) *SalaryCoefficientHandler {
	return &SalaryCoefficientHandler{salaryCoefficientService: salaryCoefficientService}
}

func (h *SalaryCoefficientHandler) Create(c *gin.Context) {
	var salaryCoefficient model.SalaryCoefficient
	if err := c.ShouldBindJSON(&salaryCoefficient); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	if err := h.salaryCoefficientService.Create(&salaryCoefficient); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": salaryCoefficient})
}

func (h *SalaryCoefficientHandler) Get(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid ID"})
		return
	}

	salaryCoefficient, err := h.salaryCoefficientService.Get(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": salaryCoefficient})
}

func (h *SalaryCoefficientHandler) List(c *gin.Context) {
	salaryCoefficients, err := h.salaryCoefficientService.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": salaryCoefficients})
}

func (h *SalaryCoefficientHandler) Update(c *gin.Context) {
	// 先创建临时结构体接收字符串类型的参数
	type tempSalaryCoefficient struct {
		ID          uint   `json:"id"`
		CJmstkAlw   string `json:"c_jmstk_alw"`
		CPensionAlw string `json:"c_pension_alw"`
		CAskesAlw   string `json:"c_askes_alw"`
		COtHour1    string `json:"c_ot_hour1"`
		COtWages1   string `json:"c_ot_wages1"`
		CEwHour1    string `json:"c_ew_hour1"`
		CEwWages1   string `json:"c_ew_wages1"`
		CEwHour2    string `json:"c_ew_hour2"`
		CEwWages2   string `json:"c_ew_wages2"`
		CEwHour3    string `json:"c_ew_hour3"`
		CEwWages3   string `json:"c_ew_wages3"`
		CJmstkFee   string `json:"c_jmstk_fee"`
		CPensionDed string `json:"c_pension_ded"`
		CAskesDed   string `json:"c_askes_ded"`
		JmstkMax    string `json:"jmstk_max"`
		PensionMax  string `json:"pension_max"`
		AskesMax    string `json:"askes_max"`
		AskesMin    string `json:"askes_min"`
		IsDelete    int    `json:"is_delete"`
	}
	var temp tempSalaryCoefficient
	if err := c.ShouldBindJSON(&temp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	// 转换为 float64 类型
	var salaryCoefficient model.SalaryCoefficient
	salaryCoefficient.ID = temp.ID
	salaryCoefficient.IsDelete = temp.IsDelete

	// 转换各个 float 字段
	if temp.CJmstkAlw != "" {
		if val, err := strconv.ParseFloat(temp.CJmstkAlw, 64); err == nil {
			salaryCoefficient.CJmstkAlw = val
		}
	}
	if temp.CPensionAlw != "" {
		if val, err := strconv.ParseFloat(temp.CPensionAlw, 64); err == nil {
			salaryCoefficient.CPensionAlw = val
		}
	}
	if temp.CAskesAlw != "" {
		if val, err := strconv.ParseFloat(temp.CAskesAlw, 64); err == nil {
			salaryCoefficient.CAskesAlw = val
		}
	}
	if temp.COtHour1 != "" {
		if val, err := strconv.ParseFloat(temp.COtHour1, 64); err == nil {
			salaryCoefficient.COtHour1 = val
		}
	}
	if temp.COtWages1 != "" {
		if val, err := strconv.ParseFloat(temp.COtWages1, 64); err == nil {
			salaryCoefficient.COtWages1 = val
		}
	}
	if temp.CEwHour1 != "" {
		if val, err := strconv.ParseFloat(temp.CEwHour1, 64); err == nil {
			salaryCoefficient.CEwHour1 = val
		}
	}
	if temp.CEwWages1 != "" {
		if val, err := strconv.ParseFloat(temp.CEwWages1, 64); err == nil {
			salaryCoefficient.CEwWages1 = val
		}
	}
	if temp.CEwHour2 != "" {
		if val, err := strconv.ParseFloat(temp.CEwHour2, 64); err == nil {
			salaryCoefficient.CEwHour2 = val
		}
	}
	if temp.CEwWages2 != "" {
		if val, err := strconv.ParseFloat(temp.CEwWages2, 64); err == nil {
			salaryCoefficient.CEwWages2 = val
		}
	}
	if temp.CEwHour3 != "" {
		if val, err := strconv.ParseFloat(temp.CEwHour3, 64); err == nil {
			salaryCoefficient.CEwHour3 = val
		}
	}
	if temp.CEwWages3 != "" {
		if val, err := strconv.ParseFloat(temp.CEwWages3, 64); err == nil {
			salaryCoefficient.CEwWages3 = val
		}
	}
	if temp.CJmstkFee != "" {
		if val, err := strconv.ParseFloat(temp.CJmstkFee, 64); err == nil {
			salaryCoefficient.CJmstkFee = val
		}
	}
	if temp.CPensionDed != "" {
		if val, err := strconv.ParseFloat(temp.CPensionDed, 64); err == nil {
			salaryCoefficient.CPensionDed = val
		}
	}
	if temp.CAskesDed != "" {
		if val, err := strconv.ParseFloat(temp.CAskesDed, 64); err == nil {
			salaryCoefficient.CAskesDed = val
		}
	}
	if temp.JmstkMax != "" {
		if val, err := strconv.ParseFloat(temp.JmstkMax, 64); err == nil {
			salaryCoefficient.JmstkMax = val
		}
	}
	if temp.PensionMax != "" {
		if val, err := strconv.ParseFloat(temp.PensionMax, 64); err == nil {
			salaryCoefficient.PensionMax = val
		}
	}
	if temp.AskesMax != "" {
		if val, err := strconv.ParseFloat(temp.AskesMax, 64); err == nil {
			salaryCoefficient.AskesMax = val
		}
	}
	if temp.AskesMin != "" {
		if val, err := strconv.ParseFloat(temp.AskesMin, 64); err == nil {
			salaryCoefficient.AskesMin = val
		}
	}

	if err := h.salaryCoefficientService.Update(&salaryCoefficient); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": salaryCoefficient})
}

func (h *SalaryCoefficientHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid ID"})
		return
	}

	if err := h.salaryCoefficientService.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}
