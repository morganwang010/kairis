package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"log/slog"
)

// StringToInt converts a string to an integer, returns an error if conversion fails
func StringToInt(c *gin.Context, value string, fieldName string) (int, bool) {
	intValue, err := strconv.Atoi(value)
	if err != nil {
		slog.Error("Failed to convert string to int", "error", err, "field", fieldName, "value", value)
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid " + fieldName + " format"})
		return 0, false
	}
	return intValue, true
}

// StringToFloat64 converts a string to a float64, returns an error if conversion fails
func StringToFloat64(c *gin.Context, value string, fieldName string) (float64, bool) {
	floatValue, err := strconv.ParseFloat(value, 64)
	if err != nil {
		slog.Error("Failed to convert string to float64", "error", err, "field", fieldName, "value", value)
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid " + fieldName + " format"})
		return 0, false
	}
	return floatValue, true
}
