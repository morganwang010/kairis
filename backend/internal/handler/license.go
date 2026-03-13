package handler

import (
	"kairis/backend/internal/model"
	"kairis/backend/internal/service"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type LicenseHandler struct {
	licenseService *service.LicenseService
}

func NewLicenseHandler(licenseService *service.LicenseService) *LicenseHandler {
	return &LicenseHandler{licenseService: licenseService}
}

type CreateLicenseRequest struct {
	LicenseKey    string `json:"license_key" binding:"required"`
	Status        string `json:"status"`
	CompanyName   string `json:"company_name"`
	EmployeeCount int    `json:"employee_count"`
}

type UpdateLicenseRequest struct {
	Status        string `json:"status"`
	CompanyName   string `json:"company_name"`
	EmployeeCount int    `json:"employee_count"`
}

type ActivateLicenseRequest struct {
	LicenseKey  string `json:"license_key" binding:"required"`
	CompanyName string `json:"company_name"`
}

type DeactivateLicenseRequest struct {
	LicenseKey string `json:"license_key" binding:"required"`
}

type CheckLicenseRequest struct {
	LicenseKey    string `json:"license_key" binding:"required"`
	CompanyName   string `json:"company_name"`
	EmployeeCount int    `json:"employee_count"`
}

type LicenseResponse struct {
	ID            int    `json:"id"`
	LicenseKey    string `json:"license_key"`
	Status        string `json:"status"`
	CompanyName   string `json:"company_name"`
	EmployeeCount int    `json:"employee_count"`
}

func (h *LicenseHandler) Create(c *gin.Context) {
	var req CreateLicenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	license := &model.License{
		LicenseKey:    req.LicenseKey,
		Status:        req.Status,
		CompanyName:   req.CompanyName,
		EmployeeCount: req.EmployeeCount,
	}

	if err := h.licenseService.CreateLicense(license); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": license})
}

func (h *LicenseHandler) Get(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid license ID"})
		return
	}

	license, err := h.licenseService.GetLicenseByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "License not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": license})
}

func (h *LicenseHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

	offset := (page - 1) * pageSize

	licenses, total, err := h.licenseService.ListLicenses(offset, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "Success",
		"data": gin.H{
			"list":     licenses,
			"total":    total,
			"page":     page,
			"pageSize": pageSize,
		},
	})
}

func (h *LicenseHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid license ID"})
		return
	}

	var req UpdateLicenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	license, err := h.licenseService.GetLicenseByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "License not found"})
		return
	}

	license.Status = req.Status
	license.CompanyName = req.CompanyName
	license.EmployeeCount = req.EmployeeCount

	if err := h.licenseService.UpdateLicense(license); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": license})
}

func (h *LicenseHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid license ID"})
		return
	}

	if err := h.licenseService.DeleteLicense(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}

func (h *LicenseHandler) Activate(c *gin.Context) {
	var req ActivateLicenseRequest
	slog.Info("55555Activating license  for company  ")

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	slog.Info("3333Activating license %s for company %s", req.LicenseKey, req.CompanyName)

	license, err := h.licenseService.ActivateLicense(req.LicenseKey, req.CompanyName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "License activated successfully", "data": license})
}

func (h *LicenseHandler) Deactivate(c *gin.Context) {
	var req DeactivateLicenseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	if err := h.licenseService.DeactivateLicense(req.LicenseKey); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "License deactivated successfully"})
}

// check license的逻辑比较简单，获取有该license key的记录，判断是有效期是否过期即可
func (h *LicenseHandler) Check(c *gin.Context) {
	// var req CheckLicenseRequest
	// if err := c.ShouldBindJSON(&req); err != nil {
	// 	c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
	// 	return
	// }

	license, err := h.licenseService.CheckLicense()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": license})
}
