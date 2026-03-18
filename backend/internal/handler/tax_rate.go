package handler

import (
	"kairis/backend/internal/model"
	"kairis/backend/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type TaxRateHandler struct {
	taxRateService *service.TaxRateService
}

func NewTaxRateHandler(taxRateService *service.TaxRateService) *TaxRateHandler {
	return &TaxRateHandler{taxRateService: taxRateService}
}

func (h *TaxRateHandler) Create(c *gin.Context) {
	var req struct {
		SalaryMin float64 `json:"salary_min"`
		SalaryMax float64 `json:"salary_max"`
		TaxRate   float64 `json:"tax_rate"`
		Grade     string  `json:"grade"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	taxRate := &model.TaxRates{
		SalaryMin: req.SalaryMin,
		SalaryMax: req.SalaryMax,
		TaxRate:   req.TaxRate,
		Grade:     req.Grade,
	}

	if err := h.taxRateService.Create(taxRate); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}

func (h *TaxRateHandler) Get(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid ID"})
		return
	}
	taxRate, err := h.taxRateService.Get(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": taxRate})
}

func (h *TaxRateHandler) List(c *gin.Context) {
	taxRates, err := h.taxRateService.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": taxRates})
}

func (h *TaxRateHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid ID"})
		return
	}
	var req struct {
		SalaryMin float64 `json:"salary_min"`
		SalaryMax float64 `json:"salary_max"`
		TaxRate   float64 `json:"tax_rate"`
		Grade     string  `json:"grade"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	taxRate := &model.TaxRates{
		ID:        uint(id),
		SalaryMin: req.SalaryMin,
		SalaryMax: req.SalaryMax,
		TaxRate:   req.TaxRate,
		Grade:     req.Grade,
	}

	if err := h.taxRateService.Update(taxRate); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}

func (h *TaxRateHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid ID"})
		return
	}
	if err := h.taxRateService.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}

func (h *TaxRateHandler) GetByGrade(c *gin.Context) {
	grade := c.Query("grade")
	if grade == "" {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Grade is required"})
		return
	}
	taxRates, err := h.taxRateService.GetByGrade(grade)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": taxRates})
}
