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
	var salaryCoefficient model.SalaryCoefficient
	if err := c.ShouldBindJSON(&salaryCoefficient); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
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
