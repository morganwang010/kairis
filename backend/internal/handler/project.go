package handler

import (
	"kairis/backend/internal/model"
	"kairis/backend/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ProjectHandler struct {
	projectService *service.ProjectService
}

func NewProjectHandler(projectService *service.ProjectService) *ProjectHandler {
	return &ProjectHandler{projectService: projectService}
}

type CreateProjectRequest struct {
	ProjectName string `json:"project_name" binding:"required"`
	ProjectAbbr string `json:"project_abbr" binding:"required"`
	Description string `json:"description"`
	AskesAlw    int    `json:"askes_alw"`
}

type UpdateProjectRequest struct {
	ProjectName string `json:"project_name" binding:"required"`
	ProjectAbbr string `json:"project_abbr" binding:"required"`
	Description string `json:"description"`
	AskesAlw    int    `json:"askes_alw"`
}

func (h *ProjectHandler) Create(c *gin.Context) {
	var req CreateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	project := &model.Project{
		ProjectName: req.ProjectName,
		ProjectAbbr: req.ProjectAbbr,
		Description: req.Description,
		AskesAlw:    req.AskesAlw,
	}

	if err := h.projectService.CreateProject(project); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": project})
}

func (h *ProjectHandler) Get(c *gin.Context) {
	id := c.Param("id")
	project, err := h.projectService.GetProjectByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "Project not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": project})
}

func (h *ProjectHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

	offset := (page - 1) * pageSize

	projects, total, err := h.projectService.ListProjects(offset, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "Success",
		"data": gin.H{
			"list":     projects,
			"total":    total,
			"page":     page,
			"pageSize": pageSize,
		},
	})
}

func (h *ProjectHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req UpdateProjectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	project, err := h.projectService.GetProjectByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "Project not found"})
		return
	}

	project.ProjectName = req.ProjectName
	project.ProjectAbbr = req.ProjectAbbr
	project.Description = req.Description
	project.AskesAlw = req.AskesAlw

	if err := h.projectService.UpdateProject(project); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": project})
}

func (h *ProjectHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.projectService.DeleteProject(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}
