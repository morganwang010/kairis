package handler

import (
	"kairis/backend/internal/service"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type AuthHandler struct {
	userService *service.UserService
}

func NewAuthHandler(userService *service.UserService) *AuthHandler {
	return &AuthHandler{userService: userService}
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string      `json:"token"`
	User  interface{} `json:"user"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	// println("goes here!")
	slog.Info("goes here22!")
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	user, err := h.userService.GetUserByUsername(req.Username)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "Invalid username or password"})
		return
	}
	slog.Info("goes here23!")
	slog.Info("password", "password", req.Password)

	if !h.userService.ValidatePassword(user, req.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "Invalid username or password"})
		return
	}
	// println("goes here!")
	// logs.Println(user)
	slog.Info("goes here24!")

	token, err := h.generateToken(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "Failed to generate token"})
		return
	}

	permissions, _ := h.userService.GetUserPermissions(user.ID)

	// 简化roles数据结构，只返回角色名称列表
	roleNames := make([]string, 0, len(user.Roles))
	for _, role := range user.Roles {
		roleNames = append(roleNames, role.Name)
	}

	userData := gin.H{
		"id":          user.ID,
		"username":    user.Username,
		"email":       user.Email,
		"avatar":      user.Avatar,
		"roles":       roleNames,
		"permissions": permissions,
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "Login successful",
		"data": LoginResponse{
			Token: token,
			User:  userData,
		},
	})
}

func (h *AuthHandler) generateToken(userID string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString([]byte("your-secret-key"))
}
