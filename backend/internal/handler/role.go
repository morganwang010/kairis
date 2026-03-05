package handler

import (
	"net/http"
	"strconv"
	"kairis/backend/internal/model"
	"kairis/backend/internal/service"

	"github.com/gin-gonic/gin"
)

type RoleHandler struct {
	roleService *service.RoleService
}

func NewRoleHandler(roleService *service.RoleService) *RoleHandler {
	return &RoleHandler{roleService: roleService}
}

type CreateRoleRequest struct {
	Name        string   `json:"name" binding:"required"`
	Code        string   `json:"code" binding:"required"`
	Description string   `json:"description"`
	Permissions []string `json:"permissions"`
}

func (h *RoleHandler) Create(c *gin.Context) {
	var req CreateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	role := &model.Role{
		Name:        req.Name,
		Code:        req.Code,
		Description: req.Description,
	}

	if err := h.roleService.CreateRole(role); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	if len(req.Permissions) > 0 {
		h.roleService.AssignPermissions(role.ID, req.Permissions)
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": role})
}

func (h *RoleHandler) Get(c *gin.Context) {
	id := c.Param("id")
	role, err := h.roleService.GetRoleByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "Role not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": role})
}

func (h *RoleHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

	offset := (page - 1) * pageSize

	roles, total, err := h.roleService.ListRoles(offset, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "Success",
		"data": gin.H{
			"list":  roles,
			"total": total,
			"page":  page,
			"pageSize": pageSize,
		},
	})
}

func (h *RoleHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req CreateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	role, err := h.roleService.GetRoleByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "Role not found"})
		return
	}

	role.Name = req.Name
	role.Code = req.Code
	role.Description = req.Description

	if err := h.roleService.UpdateRole(role); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	if len(req.Permissions) > 0 {
		h.roleService.AssignPermissions(role.ID, req.Permissions)
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": role})
}

func (h *RoleHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.roleService.DeleteRole(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}
