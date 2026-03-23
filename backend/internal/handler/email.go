package handler

import (
	"kairis/backend/internal/service"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type EmailHandler struct {
	emailService *service.EmailService
}

func NewEmailHandler(emailService *service.EmailService) *EmailHandler {
	return &EmailHandler{emailService: emailService}
}

// SendEmailRequest 发送邮件请求结构
type SendEmailRequest struct {
	To         string `json:"to" binding:"required,email"`
	Subject    string `json:"subject" binding:"required"`
	Body       string `json:"body"`
	EmployeeID string `json:"employee_id" binding:"required"`
	Month      string `json:"month" binding:"required"`
	ProjectID  string `json:"project_id"`
}

// SendEmail 发送邮件接口
func (h *EmailHandler) SendEmail(c *gin.Context) {
	var req SendEmailRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	// 转换 project_id
	projectID := 0
	if req.ProjectID != "" {
		var err error
		projectID, err = strconv.Atoi(req.ProjectID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "project_id 格式错误"})
			return
		}
	}

	slog.Info("发送邮件请求", "to", req.To, "employee_id", req.EmployeeID, "month", req.Month, "project_id", projectID)

	// 发送邮件（Service层会自动查询薪资数据和生成PDF）
	serviceReq := service.SendEmailRequest{
		To:         req.To,
		Subject:    req.Subject,
		Body:       req.Body,
		EmployeeID: req.EmployeeID,
		Month:      req.Month,
		ProjectID:  projectID,
	}

	resp, err := h.emailService.SendEmail(serviceReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "success": resp.Success, "message": resp.Message})
}
