package handler

import (
	"net/http"
	"strconv"
	"kairis/backend/internal/model"
	"kairis/backend/internal/service"

	"github.com/gin-gonic/gin"
)

type MenuHandler struct {
	menuService *service.MenuService
}

func NewMenuHandler(menuService *service.MenuService) *MenuHandler {
	return &MenuHandler{menuService: menuService}
}

type CreateMenuRequest struct {
	Title      string   `json:"title" binding:"required"`
	Path       string   `json:"path" binding:"required"`
	Icon       string   `json:"icon"`
	Component  string   `json:"component"`
	Redirect   string   `json:"redirect"`
	ParentID   *string  `json:"parent_id"`
	Sort       int      `json:"sort"`
	Hidden     bool     `json:"hidden"`
	Permissions []string `json:"permissions"`
}

func (h *MenuHandler) Create(c *gin.Context) {
	var req CreateMenuRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	menu := &model.Menu{
		Title:     req.Title,
		Path:      req.Path,
		Icon:      req.Icon,
		Component: req.Component,
		Redirect:  req.Redirect,
		ParentID:  req.ParentID,
		Sort:      req.Sort,
		Hidden:    req.Hidden,
	}

	if err := h.menuService.CreateMenu(menu); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	if len(req.Permissions) > 0 {
		h.menuService.AssignPermissions(menu.ID, req.Permissions)
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": menu})
}

func (h *MenuHandler) Get(c *gin.Context) {
	id := c.Param("id")
	menu, err := h.menuService.GetMenuByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "Menu not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": menu})
}

func (h *MenuHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

	offset := (page - 1) * pageSize

	menus, total, err := h.menuService.ListMenus(offset, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "Success",
		"data": gin.H{
			"list":  menus,
			"total": total,
			"page":  page,
			"pageSize": pageSize,
		},
	})
}

func (h *MenuHandler) Tree(c *gin.Context) {
	menus, err := h.menuService.GetMenuTree()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": menus})
}

func (h *MenuHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req CreateMenuRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	menu, err := h.menuService.GetMenuByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "Menu not found"})
		return
	}

	menu.Title = req.Title
	menu.Path = req.Path
	menu.Icon = req.Icon
	menu.Component = req.Component
	menu.Redirect = req.Redirect
	menu.ParentID = req.ParentID
	menu.Sort = req.Sort
	menu.Hidden = req.Hidden

	if err := h.menuService.UpdateMenu(menu); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	if len(req.Permissions) > 0 {
		h.menuService.AssignPermissions(menu.ID, req.Permissions)
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": menu})
}

func (h *MenuHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.menuService.DeleteMenu(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}
