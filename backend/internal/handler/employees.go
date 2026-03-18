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
		EmployeeName    string  `json:"employee_name"`
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
		EmployeeID:   req.EmployeeID,
		ProjectID:    projectID,
		EmployeeName: req.EmployeeName,
		Department:   req.Department,
		Position:     req.Position,
		HireDate:     req.HireDate,
		LeaveDate:    req.LeaveDate,
		// Salary:          req.Salary,
		TaxStatus:     req.TaxStatus,
		IdCard:        req.IdCard,
		Npwp:          req.Npwp,
		HierarchyID:   req.HierarchyID,
		HierarchyName: req.HierarchyName,
		Email:         req.Email,
		BasicSalary:   req.BasicSalary,
		HousingAlw:    req.HousingAlw,
		PositionAlw:   req.PositionAlw,
		FieldAlw:      req.FieldAlw,
		// FixAlw:          req.FixAlw,
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
		EmployeeName    string  `json:"employee_name"`
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
		ID:            uint(id),
		EmployeeID:    req.EmployeeID,
		ProjectID:     projectID,
		EmployeeName:  req.EmployeeName,
		Department:    req.Department,
		Position:      req.Position,
		HireDate:      req.HireDate,
		LeaveDate:     req.LeaveDate,
		Salary:        req.Salary,
		TaxStatus:     req.TaxStatus,
		IdCard:        req.IdCard,
		Npwp:          req.Npwp,
		HierarchyID:   req.HierarchyID,
		HierarchyName: req.HierarchyName,
		Email:         req.Email,
		BasicSalary:   req.BasicSalary,
		HousingAlw:    req.HousingAlw,
		PositionAlw:   req.PositionAlw,
		FieldAlw:      req.FieldAlw,
		// FixAlw:          req.FixAlw,
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
			EmployeeID    string `json:"employee_id"`
			ProjectID     string `json:"project_id"`
			Name          string `json:"employee_name"`
			Department    string `json:"department"`
			Position      string `json:"position"`
			HireDate      string `json:"hire_date"`
			LeaveDate     string `json:"leave_date"`
			Salary        string `json:"salary"`
			TaxStatus     string `json:"tax_status"`
			IdCard        string `json:"id_card"`
			Npwp          string `json:"npwp"`
			HierarchyID   string `json:"hierarchy_id"`
			HierarchyName string `json:"hierarchy_name"`
			JoinDate      string `json:"join_date"`
			ResignDate    string `json:"resign_date"`
			Email         string `json:"email"`
			BasicSalary   string `json:"basic_salary"`
			HousingAlw    string `json:"housing_alw"`
			PositionAlw   string `json:"position_alw"`
			FieldAlw      string `json:"field_alw"`
			// FixAlw          string `json:"fix_alw"`
			MealAlwDay      string `json:"meal_alw/day"`
			TranspAlwDay    string `json:"transp_alw/day"`
			PulsaAlwDay     string `json:"pulsa_alw/day"`
			AttAlwDay       string `json:"att_alw/day"`
			TaxType         string `json:"tax_type"`
			LocationName    string `json:"location_name"`
			PulsaAlwMonth   string `json:"pulsa_alw/month"`
			HousingAlwTetap string `json:"housing_alw/TJ_Tidak_Tetap"`
			DeleteFlag      string `json:"delete_flag"`
		} `json:"records"`
	}
	// slog.Info("Before binding", "req", &req)
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
		var deleteFlag int
		if item.DeleteFlag == "" {
			deleteFlag = 0
		} else {
			var ok bool
			deleteFlag, ok = StringToInt(c, item.DeleteFlag, "delete_flag")
			if !ok {
				return
			}
		}
		// 转换Salary为float64类型
		// salary, ok := StringToFloat64(c, item.Salary, "salary")
		// if !ok {
		// 	return
		// }
		basicSalary, ok := StringToFloat64(c, item.BasicSalary, "basic_salary")
		if !ok {
			return
		}
		// 转换HousingAlw为float64类型
		housingAlw, ok := StringToFloat64(c, item.HousingAlw, "housing_alw")
		if !ok {
			return
		}
		// 转换PositionAlw为float64类型
		positionAlw, ok := StringToFloat64(c, item.PositionAlw, "position_alw")
		if !ok {
			return
		}
		// 转换FieldAlw为float64类型
		fieldAlw, ok := StringToFloat64(c, item.FieldAlw, "field_alw")
		if !ok {
			return
		}
		// 转换FixAlw为float64类型
		// fixAlw, ok := StringToFloat64(c, item.FixAlw, "fix_alw")
		// if !ok {
		// 	return
		// }
		// 转换MealAlwDay为float64类型
		mealAlwDay, ok := StringToFloat64(c, item.MealAlwDay, "meal_alw_day")
		if !ok {
			return
		}
		// 转换TranspAlwDay为float64类型
		transpAlwDay, ok := StringToFloat64(c, item.TranspAlwDay, "transp_alw_day")
		if !ok {
			return
		}
		// 转换PulsaAlwDay为float64类型
		pulsaAlwDay, ok := StringToFloat64(c, item.PulsaAlwDay, "pulsa_alw/day")
		if !ok {
			return
		}
		// 转换AttAlwDay为float64类型
		attAlwDay, ok := StringToFloat64(c, item.AttAlwDay, "att_alw_day")
		if !ok {
			return
		}
		// 转换PulsaAlwMonth为float64类型
		pulsaAlwMonth, ok := StringToFloat64(c, item.PulsaAlwMonth, "pulsa_alw/month")
		if !ok {
			return
		}
		// 转换HousingAlwTetap为float64类型
		housingAlwTetap, ok := StringToFloat64(c, item.HousingAlwTetap, "housing_alw/TJ_Tidak_Tetap")
		if !ok {
			return
		}

		importReq.Employees[i] = service.ImportEmployeeItem{
			EmployeeID:   item.EmployeeID,
			ProjectID:    projectID,
			EmployeeName: item.Name,
			Department:   item.Department,
			Position:     item.Position,
			HireDate:     item.HireDate,
			LeaveDate:    item.LeaveDate,
			// Salary:          salary,
			IdCard:        item.IdCard,
			Npwp:          item.Npwp,
			HierarchyID:   item.HierarchyID,
			HierarchyName: item.HierarchyName,
			JoinDate:      item.JoinDate,
			ResignDate:    item.ResignDate,
			Email:         item.Email,
			BasicSalary:   basicSalary,
			HousingAlw:    housingAlw,
			PositionAlw:   positionAlw,
			FieldAlw:      fieldAlw,
			// FixAlw:          fixAlw,
			MealAlwDay:      mealAlwDay,
			TranspAlwDay:    transpAlwDay,
			PulsaAlwDay:     pulsaAlwDay,
			AttAlwDay:       attAlwDay,
			TaxType:         item.TaxType,
			LocationName:    item.LocationName,
			PulsaAlwMonth:   pulsaAlwMonth,
			HousingAlwTetap: housingAlwTetap,
			DeleteFlag:      deleteFlag,
		}
	}

	if err := h.employeeService.ImportEmployee(importReq); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}
