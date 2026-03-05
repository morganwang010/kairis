package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery

		c.Next()

		latency := time.Since(start)
		status := c.Writer.Status()
		method := c.Request.Method
		ip := c.ClientIP()

		log.Printf("[%s] %s %s %s %d %v",
			time.Now().Format("2006-01-02 15:04:05"),
			method,
			path,
			query,
			status,
			latency,
		)

		log.Printf("Client IP: %s", ip)
	}
}
