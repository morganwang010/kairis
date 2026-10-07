package handler

import (
	"kairis/backend/internal/model"
	"kairis/backend/internal/service"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type FlightHandler struct {
	flightService *service.FlightService
}

func NewFlightHandler(flightService *service.FlightService) *FlightHandler {
	return &FlightHandler{flightService: flightService}
}

type CreateFlightRequest struct {
	EmployeeID         string `json:"employee_id" binding:"required"`
	ProjectID          int    `json:"project_id"`
	Month              string `json:"month" binding:"required"`
	FlightNum          string `json:"flight_num"`
	DepartDestination  string `json:"depart_destination"`
	JakartaChina       string `json:"jakarta_china"`
	ChinaJakarta       string `json:"china_jakarta"`
	JakartaSite        string `json:"jakarta_site"`
	SiteJakarta        string `json:"site_jakarta"`
	ReturnDestination  string `json:"return_destination"`
	ReturnJakarta      string `json:"return_jakarta"`
	ReturnChinaJakarta string `json:"return_china_jakarta"`
	ReturnJakartaSite  string `json:"return_jakarta_site"`
	ReturnSiteJakarta  string `json:"return_site_jakarta"`
	Category           int    `json:"category"`
}

type UpdateFlightRequest struct {
	EmployeeID         string `json:"employee_id"`
	ProjectID          int    `json:"project_id"`
	Month              string `json:"month"`
	FlightNum          string `json:"flight_num"`
	DepartDestination  string `json:"depart_destination"`
	JakartaChina       string `json:"jakarta_china"`
	ChinaJakarta       string `json:"china_jakarta"`
	JakartaSite        string `json:"jakarta_site"`
	SiteJakarta        string `json:"site_jakarta"`
	ReturnDestination  string `json:"return_destination"`
	ReturnJakarta      string `json:"return_jakarta"`
	ReturnChinaJakarta string `json:"return_china_jakarta"`
	ReturnJakartaSite  string `json:"return_jakarta_site"`
	ReturnSiteJakarta  string `json:"return_site_jakarta"`
	Category           int    `json:"category"`
}

func (h *FlightHandler) Create(c *gin.Context) {
	var req CreateFlightRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	flight := &model.Flights{
		EmployeeID:         req.EmployeeID,
		ProjectID:          req.ProjectID,
		Month:              req.Month,
		FlightNum:          req.FlightNum,
		DepartDestination:  req.DepartDestination,
		JakartaChina:       req.JakartaChina,
		ChinaJakarta:       req.ChinaJakarta,
		JakartaSite:        req.JakartaSite,
		SiteJakarta:        req.SiteJakarta,
		ReturnDestination:  req.ReturnDestination,
		ReturnJakarta:      req.ReturnJakarta,
		ReturnChinaJakarta: req.ReturnChinaJakarta,
		ReturnJakartaSite:  req.ReturnJakartaSite,
		ReturnSiteJakarta:  req.ReturnSiteJakarta,
		Category:           req.Category,
	}

	if err := h.flightService.CreateFlight(flight); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": flight})
}

func (h *FlightHandler) Get(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid flight ID"})
		return
	}

	flight, err := h.flightService.GetFlightByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "Flight not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": flight})
}

func (h *FlightHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "50"))
	projectID := c.Query("project_id")
	month := c.Query("month")
	employeeID := c.Query("employee_id")
	employeeName := c.Query("employee_name")

	offset := (page - 1) * pageSize

	flights, total, err := h.flightService.ListFlights(offset, pageSize, projectID, month, employeeID, employeeName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":     200,
		"message":  "Success",
		"total":    total,
		"data":     flights,
		"page":     page,
		"pageSize": pageSize,
	})
}

func (h *FlightHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid flight ID"})
		return
	}

	var req UpdateFlightRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	flight, err := h.flightService.GetFlightByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "Flight not found"})
		return
	}

	if req.EmployeeID != "" {
		flight.EmployeeID = req.EmployeeID
	}
	if req.Month != "" {
		flight.Month = req.Month
	}
	// Update all string fields from request (empty string means clear)
	flight.ProjectID = req.ProjectID
	flight.FlightNum = req.FlightNum
	flight.DepartDestination = req.DepartDestination
	flight.JakartaChina = req.JakartaChina
	flight.ChinaJakarta = req.ChinaJakarta
	flight.JakartaSite = req.JakartaSite
	flight.SiteJakarta = req.SiteJakarta
	flight.ReturnDestination = req.ReturnDestination
	flight.ReturnJakarta = req.ReturnJakarta
	flight.ReturnChinaJakarta = req.ReturnChinaJakarta
	flight.ReturnJakartaSite = req.ReturnJakartaSite
	flight.ReturnSiteJakarta = req.ReturnSiteJakarta
	flight.Category = req.Category

	if err := h.flightService.UpdateFlight(flight); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": flight})
}

func (h *FlightHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid flight ID"})
		return
	}

	if err := h.flightService.DeleteFlight(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}

func (h *FlightHandler) DeleteByIDs(c *gin.Context) {
	var req struct {
		IDs []uint `json:"ids"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	if len(req.IDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "IDs cannot be empty"})
		return
	}

	if err := h.flightService.DeleteFlightByIDs(req.IDs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}

func (h *FlightHandler) Import(c *gin.Context) {
	type rawItem struct {
		FlightNo   string `json:"flight_no"`
		FlightType string `json:"flight_type"`
		DepartTime string `json:"depart_time"`
		ArriveTime string `json:"arrive_time"`
		FlightInfo string `json:"flight_info"`
		TripStatus string `json:"trip_status"`
	}
	var req struct {
		Flights []struct {
			EmployeeID         string    `json:"employee_id"`
			ProjectID          int       `json:"project_id"`
			Month              string    `json:"month"`
			FlightNum          string    `json:"flight_num"`
			DepartDestination  string    `json:"depart_destination"`
			JakartaChina       string    `json:"jakarta_china"`
			ChinaJakarta       string    `json:"china_jakarta"`
			JakartaSite        string    `json:"jakarta_site"`
			SiteJakarta        string    `json:"site_jakarta"`
			ReturnDestination  string    `json:"return_destination"`
			ReturnJakarta      string    `json:"return_jakarta"`
			ReturnChinaJakarta string    `json:"return_china_jakarta"`
			ReturnJakartaSite  string    `json:"return_jakarta_site"`
			ReturnSiteJakarta  string    `json:"return_site_jakarta"`
			Category           int       `json:"category"`
			FlightRaws         []rawItem `json:"flight_raws"`
		} `json:"flights"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		slog.Error("Failed to bind JSON", "error", err)
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	importReq := service.ImportFlightRequest{
		Flights: make([]service.ImportFlightItem, len(req.Flights)),
	}

	for i, item := range req.Flights {
		raws := make([]service.ImportFlightRaw, 0, len(item.FlightRaws))
		for _, r := range item.FlightRaws {
			raws = append(raws, service.ImportFlightRaw{
				FlightNo:   r.FlightNo,
				FlightType: r.FlightType,
				DepartTime: r.DepartTime,
				ArriveTime: r.ArriveTime,
				FlightInfo: r.FlightInfo,
				TripStatus: r.TripStatus,
			})
		}

		importReq.Flights[i] = service.ImportFlightItem{
			EmployeeID:         item.EmployeeID,
			ProjectID:          item.ProjectID,
			Month:              item.Month,
			FlightNum:          item.FlightNum,
			DepartDestination:  item.DepartDestination,
			JakartaChina:       item.JakartaChina,
			ChinaJakarta:       item.ChinaJakarta,
			JakartaSite:        item.JakartaSite,
			SiteJakarta:        item.SiteJakarta,
			ReturnDestination:  item.ReturnDestination,
			ReturnJakarta:      item.ReturnJakarta,
			ReturnChinaJakarta: item.ReturnChinaJakarta,
			ReturnJakartaSite:  item.ReturnJakartaSite,
			ReturnSiteJakarta:  item.ReturnSiteJakarta,
			Category:           item.Category,
			FlightRaws:         raws,
		}
	}

	if err := h.flightService.ImportFlight(importReq); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}

func (h *FlightHandler) Calculate(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid flight ID"})
		return
	}

	result, err := h.flightService.CalculateFlight(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "Success",
		"data":    result,
	})
}

func (h *FlightHandler) CalculateBatch(c *gin.Context) {
	var req struct {
		EmployeeID string `json:"employee_id"`
		Month      string `json:"month"`
		ProjectID  int    `json:"project_id"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	if req.EmployeeID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "employee_id is required"})
		return
	}
	if req.Month == "" {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "month is required"})
		return
	}

	results, err := h.flightService.CalculateFlightBatch(req.EmployeeID, req.Month, req.ProjectID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "Success",
		"data":    results,
	})
}

func (h *FlightHandler) CalculateTripClosure(c *gin.Context) {
	var req struct {
		EmployeeID string `json:"employee_id"`
		Month      string `json:"month"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	empID, err := strconv.ParseUint(req.EmployeeID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid employee_id"})
		return
	}

	if err := h.flightService.CalculateTripClosure(empID, req.Month); err != nil {
		slog.Error("Failed to calculate trip closure", "error", err, "employee_id", req.EmployeeID)
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "Success",
	})
}
