package handler

import (
	"kairis/backend/internal/model"
	"kairis/backend/internal/service"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type SalarySlipHandler struct {
	salarySlipService *service.SalarySlipService
}

func NewSalarySlipHandler(salarySlipService *service.SalarySlipService) *SalarySlipHandler {
	return &SalarySlipHandler{salarySlipService: salarySlipService}
}

func (h *SalarySlipHandler) Create(c *gin.Context) {
	var req model.Salaries

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	if err := h.salarySlipService.Create(&req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": req})
}

// func (h *SalarySlipHandler) GetSalarySlip(c *gin.Context) {
// 	idStr := c.Param("id")
// 	id, err := strconv.ParseUint(idStr, 10, 32)
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid ID"})
// 		return
// 	}
// 	salarySlip, err := h.salarySlipService.GetSalarySlip(uint(id))
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{"code": 200, "data": salarySlip})
// }

func (h *SalarySlipHandler) List(c *gin.Context) {
	month := c.Query("month")
	projectIDStr := c.Query("project_id")
	offsetStr := c.Query("offset")
	limitStr := c.Query("limit")

	slog.Info("List salary slips", "month", month, "project_id", projectIDStr)

	projectID := 0
	if projectIDStr != "" {
		var ok bool
		projectID, ok = StringToInt(c, projectIDStr, "project_id")
		if !ok {
			return
		}
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

	salarySlips, total, err := h.salarySlipService.ListSalarySlips(offset, limit, month, projectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": salarySlips, "total": total})
}

func (h *SalarySlipHandler) Update(c *gin.Context) {
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

	if err := h.salarySlipService.UpdateSalarySlip(&req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": req})
}

func (h *SalarySlipHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid ID"})
		return
	}

	if err := h.salarySlipService.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}
