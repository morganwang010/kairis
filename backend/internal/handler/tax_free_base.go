package handler

import (
	"kairis/backend/internal/model"
	"kairis/backend/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type TaxFreeBaseHandler struct {
	taxFreeBaseService *service.TaxFreeBaseService
}

func NewTaxFreeBaseHandler(taxFreeBaseService *service.TaxFreeBaseService) *TaxFreeBaseHandler {
	return &TaxFreeBaseHandler{taxFreeBaseService: taxFreeBaseService}
}

func (h *TaxFreeBaseHandler) Create(c *gin.Context) {
	var taxFreeBase model.TaxFreeBases
	if err := c.ShouldBindJSON(&taxFreeBase); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	if err := h.taxFreeBaseService.Create(&taxFreeBase); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": taxFreeBase})
}

func (h *TaxFreeBaseHandler) Get(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid ID"})
		return
	}

	taxFreeBase, err := h.taxFreeBaseService.Get(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": taxFreeBase})
}

func (h *TaxFreeBaseHandler) List(c *gin.Context) {
	taxFreeBases, err := h.taxFreeBaseService.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": taxFreeBases})
}

func (h *TaxFreeBaseHandler) Update(c *gin.Context) {
	var taxFreeBase model.TaxFreeBases
	if err := c.ShouldBindJSON(&taxFreeBase); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	if err := h.taxFreeBaseService.Update(&taxFreeBase); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": taxFreeBase})
}

func (h *TaxFreeBaseHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid ID"})
		return
	}

	if err := h.taxFreeBaseService.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}
