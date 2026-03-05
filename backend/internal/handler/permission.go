package handler

import (
	"net/http"
	"strconv"
	"kairis/backend/internal/model"
	"kairis/backend/internal/service"

	"github.com/gin-gonic/gin"
)

type PermissionHandler struct {
	permissionService *service.PermissionService
}

func NewPermissionHandler(permissionService *service.PermissionService) *PermissionHandler {
	return &PermissionHandler{permissionService: permissionService}
}

type CreatePermissionRequest struct {
	Name       string `json:"name" binding:"required"`
	Code       string `json:"code" binding:"required"`
	Type       string `json:"type" binding:"required,oneof=menu button"`
	ResourceID string `json:"resource_id"`
}

func (h *PermissionHandler) Create(c *gin.Context) {
	var req CreatePermissionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	permission := &model.Permission{
		Name:       req.Name,
		Code:       req.Code,
		Type:       req.Type,
		ResourceID: req.ResourceID,
	}

	if err := h.permissionService.CreatePermission(permission); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": permission})
}

func (h *PermissionHandler) Get(c *gin.Context) {
	id := c.Param("id")
	permission, err := h.permissionService.GetPermissionByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "Permission not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": permission})
}

func (h *PermissionHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

	offset := (page - 1) * pageSize

	permissions, total, err := h.permissionService.ListPermissions(offset, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "Success",
		"data": gin.H{
			"list":  permissions,
			"total": total,
			"page":  page,
			"pageSize": pageSize,
		},
	})
}

func (h *PermissionHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req CreatePermissionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	permission, err := h.permissionService.GetPermissionByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "Permission not found"})
		return
	}

	permission.Name = req.Name
	permission.Code = req.Code
	permission.Type = req.Type
	permission.ResourceID = req.ResourceID

	if err := h.permissionService.UpdatePermission(permission); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": permission})
}

func (h *PermissionHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.permissionService.DeletePermission(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}
