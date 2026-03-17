package handler

import (
	"kairis/backend/internal/model"
	"kairis/backend/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type EmployeeHandler struct {
	employeeService *service.EmployeeService
}

func NewEmployeeHandler(employeeService *service.EmployeeService) *EmployeeHandler {
	return &EmployeeHandler{employeeService: employeeService}
}

func (h *EmployeeHandler) Create(c *gin.Context) {
	var req struct {
		EmployeeID      string  `json:"employee_id"`
		ProjectID       string  `json:"project_id"`
		Name            string  `json:"name"`
		Department      string  `json:"department"`
		Position        string  `json:"position"`
		HireDate        string  `json:"hire_date"`
		LeaveDate       string  `json:"leave_date"`
		Salary          float64 `json:"salary"`
		TaxStatus       float64 `json:"tax_status"`
		IdCard          string  `json:"id_card"`
		Npwp            string  `json:"npwp"`
		HierarchyID     string  `json:"hierarchy_id"`
		HierarchyName   string  `json:"hierarchy_name"`
		JoinDate        string  `json:"join_date"`
		ResignDate      string  `json:"resign_date"`
		Email           string  `json:"email"`
		Phone           string  `json:"phone"`
		BasicSalary     float64 `json:"basic_salary"`
		HousingAlw      float64 `json:"housing_alw"`
		PositionAlw     float64 `json:"position_alw"`
		FieldAlw        float64 `json:"field_alw"`
		FixAlw          float64 `json:"fix_alw"`
		MealAlwDay      float64 `json:"meal_alw_day"`
		TranspAlwDay    float64 `json:"transp_alw_day"`
		PulsaAlwDay     float64 `json:"pulsa_alw_day"`
		AttAlwDay       float64 `json:"att_alw_day"`
		TaxType         string  `json:"tax_type"`
		LocationName    string  `json:"location_name"`
		PulsaAlwMonth   float64 `json:"pulsa_alw_month"`
		HousingAlwTetap float64 `json:"housing_alw_tetap"`
		DeleteFlag      string  `json:"delete_flag"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	// 转换ProjectID为int类型
	projectID, ok := StringToInt(c, req.ProjectID, "project_id")
	if !ok {
		return
	}

	// 转换DeleteFlag为int类型
	deleteFlag, ok := StringToInt(c, req.DeleteFlag, "delete_flag")
	if !ok {
		return
	}

	employee := &model.Employee{
		EmployeeID:      req.EmployeeID,
		ProjectID:       projectID,
		Name:            req.Name,
		Department:      req.Department,
		Position:        req.Position,
		HireDate:        req.HireDate,
		LeaveDate:       req.LeaveDate,
		Salary:          req.Salary,
		TaxStatus:       req.TaxStatus,
		IdCard:          req.IdCard,
		Npwp:            req.Npwp,
		HierarchyID:     req.HierarchyID,
		HierarchyName:   req.HierarchyName,
		Email:           req.Email,
		Phone:           req.Phone,
		BasicSalary:     req.BasicSalary,
		HousingAlw:      req.HousingAlw,
		PositionAlw:     req.PositionAlw,
		FieldAlw:        req.FieldAlw,
		FixAlw:          req.FixAlw,
		MealAlwDay:      req.MealAlwDay,
		TranspAlwDay:    req.TranspAlwDay,
		PulsaAlwDay:     req.PulsaAlwDay,
		AttAlwDay:       req.AttAlwDay,
		TaxType:         req.TaxType,
		LocationName:    req.LocationName,
		PulsaAlwMonth:   req.PulsaAlwMonth,
		HousingAlwTetap: req.HousingAlwTetap,
		DeleteFlag:      deleteFlag,
	}

	if err := h.employeeService.Create(employee); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}

func (h *EmployeeHandler) Get(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid ID"})
		return
	}
	employee, err := h.employeeService.Get(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": employee})
}

func (h *EmployeeHandler) List(c *gin.Context) {
	employees, err := h.employeeService.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": employees})
}

func (h *EmployeeHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid ID"})
		return
	}
	var req struct {
		EmployeeID      string  `json:"employee_id"`
		ProjectID       string  `json:"project_id"`
		Name            string  `json:"name"`
		Department      string  `json:"department"`
		Position        string  `json:"position"`
		HireDate        string  `json:"hire_date"`
		LeaveDate       string  `json:"leave_date"`
		Salary          float64 `json:"salary"`
		TaxStatus       float64 `json:"tax_status"`
		IdCard          string  `json:"id_card"`
		Npwp            string  `json:"npwp"`
		HierarchyID     string  `json:"hierarchy_id"`
		HierarchyName   string  `json:"hierarchy_name"`
		JoinDate        string  `json:"join_date"`
		ResignDate      string  `json:"resign_date"`
		Email           string  `json:"email"`
		Phone           string  `json:"phone"`
		BasicSalary     float64 `json:"basic_salary"`
		HousingAlw      float64 `json:"housing_alw"`
		PositionAlw     float64 `json:"position_alw"`
		FieldAlw        float64 `json:"field_alw"`
		FixAlw          float64 `json:"fix_alw"`
		MealAlwDay      float64 `json:"meal_alw_day"`
		TranspAlwDay    float64 `json:"transp_alw_day"`
		PulsaAlwDay     float64 `json:"pulsa_alw_day"`
		AttAlwDay       float64 `json:"att_alw_day"`
		TaxType         string  `json:"tax_type"`
		LocationName    string  `json:"location_name"`
		PulsaAlwMonth   float64 `json:"pulsa_alw_month"`
		HousingAlwTetap float64 `json:"housing_alw_tetap"`
		DeleteFlag      string  `json:"delete_flag"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	// 转换ProjectID为int类型
	projectID, ok := StringToInt(c, req.ProjectID, "project_id")
	if !ok {
		return
	}
	
	// 转换DeleteFlag为int类型
	deleteFlag, ok := StringToInt(c, req.DeleteFlag, "delete_flag")
	if !ok {
		return
	}

	employee := &model.Employee{
		ID:              uint(id),
		EmployeeID:      req.EmployeeID,
		ProjectID:       projectID,
		Name:            req.Name,
		Department:      req.Department,
		Position:        req.Position,
		HireDate:        req.HireDate,
		LeaveDate:       req.LeaveDate,
		Salary:          req.Salary,
		TaxStatus:       req.TaxStatus,
		IdCard:          req.IdCard,
		Npwp:            req.Npwp,
		HierarchyID:     req.HierarchyID,
		HierarchyName:   req.HierarchyName,
		Email:           req.Email,
		Phone:           req.Phone,
		BasicSalary:     req.BasicSalary,
		HousingAlw:      req.HousingAlw,
		PositionAlw:     req.PositionAlw,
		FieldAlw:        req.FieldAlw,
		FixAlw:          req.FixAlw,
		MealAlwDay:      req.MealAlwDay,
		TranspAlwDay:    req.TranspAlwDay,
		PulsaAlwDay:     req.PulsaAlwDay,
		AttAlwDay:       req.AttAlwDay,
		TaxType:         req.TaxType,
		LocationName:    req.LocationName,
		PulsaAlwMonth:   req.PulsaAlwMonth,
		HousingAlwTetap: req.HousingAlwTetap,
		DeleteFlag:      deleteFlag,
	}

	if err := h.employeeService.Update(employee); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}

func (h *EmployeeHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid ID"})
		return
	}
	if err := h.employeeService.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}

func (h *EmployeeHandler) Import(c *gin.Context) {
	var req struct {
		Records []struct {
			EmployeeID      string  `json:"employee_id"`
			ProjectID       string  `json:"project_id"`
			Name            string  `json:"name"`
			Department      string  `json:"department"`
			Position        string  `json:"position"`
			HireDate        string  `json:"hire_date"`
			LeaveDate       string  `json:"leave_date"`
			Salary          float64 `json:"salary"`
			TaxStatus       float64 `json:"tax_status"`
			IdCard          string  `json:"id_card"`
			Npwp            string  `json:"npwp"`
			HierarchyID     string  `json:"hierarchy_id"`
			HierarchyName   string  `json:"hierarchy_name"`
			JoinDate        string  `json:"join_date"`
			ResignDate      string  `json:"resign_date"`
			Email           string  `json:"email"`
			BasicSalary     float64 `json:"basic_salary"`
			HousingAlw      float64 `json:"housing_alw"`
			PositionAlw     float64 `json:"position_alw"`
			FieldAlw        float64 `json:"field_alw"`
			FixAlw          float64 `json:"fix_alw"`
			MealAlwDay      float64 `json:"meal_alw_day"`
			TranspAlwDay    float64 `json:"transp_alw_day"`
			PulsaAlwDay     float64 `json:"pulsa_alw_day"`
			AttAlwDay       float64 `json:"att_alw_day"`
			TaxType         string  `json:"tax_type"`
			LocationName    string  `json:"location_name"`
			PulsaAlwMonth   float64 `json:"pulsa_alw_month"`
			HousingAlwTetap float64 `json:"housing_alw_tetap"`
			DeleteFlag      string  `json:"delete_flag"`
		} `json:"records"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	importReq := service.ImportEmployeeRequest{
		Employees: make([]service.ImportEmployeeItem, len(req.Records)),
	}

	for i, item := range req.Records {
		// 转换ProjectID为int类型
		projectID, ok := StringToInt(c, item.ProjectID, "project_id")
		if !ok {
			return
		}

		// 转换DeleteFlag为int类型
		deleteFlag, ok := StringToInt(c, item.DeleteFlag, "delete_flag")
		if !ok {
			return
		}

		importReq.Employees[i] = service.ImportEmployeeItem{
			EmployeeID:      item.EmployeeID,
			ProjectID:       projectID,
			Name:            item.Name,
			Department:      item.Department,
			Position:        item.Position,
			HireDate:        item.HireDate,
			LeaveDate:       item.LeaveDate,
			Salary:          item.Salary,
			TaxStatus:       item.TaxStatus,
			IdCard:          item.IdCard,
			Npwp:            item.Npwp,
			HierarchyID:     item.HierarchyID,
			HierarchyName:   item.HierarchyName,
			JoinDate:        item.JoinDate,
			ResignDate:      item.ResignDate,
			Email:           item.Email,
			BasicSalary:     item.BasicSalary,
			HousingAlw:      item.HousingAlw,
			PositionAlw:     item.PositionAlw,
			FieldAlw:        item.FieldAlw,
			FixAlw:          item.FixAlw,
			MealAlwDay:      item.MealAlwDay,
			TranspAlwDay:    item.TranspAlwDay,
			PulsaAlwDay:     item.PulsaAlwDay,
			AttAlwDay:       item.AttAlwDay,
			TaxType:         item.TaxType,
			LocationName:    item.LocationName,
			PulsaAlwMonth:   item.PulsaAlwMonth,
			HousingAlwTetap: item.HousingAlwTetap,
			DeleteFlag:      deleteFlag,
		}
	}

	if err := h.employeeService.ImportEmployee(importReq); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}
