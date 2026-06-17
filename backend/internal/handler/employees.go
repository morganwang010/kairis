package handler

import (
	"kairis/backend/internal/model"
	"kairis/backend/internal/service"
	"log/slog"
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
		EmployeeID               string  `json:"employee_id"`
		ProjectID                string  `json:"project_id"`
		EmployeeName             string  `json:"employee_name"`
		Department               string  `json:"department"`
		Position                 string  `json:"position"`
		Salary                   float64 `json:"salary"`
		TaxStatus                float64 `json:"tax_status"`
		IdCard                   string  `json:"id_card"`
		Npwp                     string  `json:"npwp"`
		HierarchyID              string  `json:"hierarchy_id"`
		HierarchyName            string  `json:"hierarchy_name"`
		JoinDate                 string  `json:"join_date"`
		ResignDate               string  `json:"resign_date"`
		Email                    string  `json:"email"`
		Phone                    string  `json:"phone"`
		BasicSalary              float64 `json:"basic_salary"`
		HousingAlw               float64 `json:"housing_alw"`
		PositionAlw              float64 `json:"position_alw"`
		FieldAlw                 float64 `json:"field_alw"`
		FixAlw                   float64 `json:"fix_alw"`
		MealAlwDay               float64 `json:"meal_alw_day"`
		TranspAlwDay             float64 `json:"transp_alw_day"`
		PulsaAlwDay              float64 `json:"pulsa_alw_day"`
		AttAlwDay                float64 `json:"att_alw_day"`
		TaxType                  string  `json:"tax_type"`
		LocationName             string  `json:"location_name"`
		PulsaAlwMonth            float64 `json:"pulsa_alw_month"`
		HousingAlwTetap          float64 `json:"housing_alw_tetap"`
		DeleteFlag               string  `json:"delete_flag"`
		BPJSHealthTambahanStatus string  `json:"bpjs_health_tambahan_status"` // INTEGER default 0
		DateOfBirth              string  `json:"date_of_birth"`
		PostFunctionAlwMonth     float64 `json:"post_function_alw_month"`
		PhoneAlwMonth            float64 `json:"phone_alw_month"`
		InternetAlwMonth         float64 `json:"internet_alw_month"`
		IncentiveMonth           float64 `json:"incentive_month"`
		OperationalAlwMonth      float64 `json:"operational_alw_month"`
		HousingAlwMonth          float64 `json:"housing_alw_month"`
		SeniorityAlwMonth        float64 `json:"seniority_alw_month"`
		TransportAlwMonth        float64 `json:"transport_alw_month"`
		FieldAlwMonth            float64 `json:"field_alw_month"`
		AccommodationAlwMonth    float64 `json:"accommodation_alw_month"`
		WorkDay                  float64 `json:"work_day"`
		OnDay                    float64 `json:"on_day"`
		OSDay                    float64 `json:"os_day"`
		BTDay                    float64 `json:"bt_day"`
		OADay                    float64 `json:"oa_day"`
		TravellDay               float64 `json:"travell_day"`
		TnTDay                   float64 `json:"tnt_day"`
		STDay                    float64 `json:"st_day"`
		TRDay                    float64 `json:"tr_day"`
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
		// Salary:          req.Salary,
		TaxStatus:                req.TaxStatus,
		IdCard:                   req.IdCard,
		Npwp:                     req.Npwp,
		HierarchyID:              req.HierarchyID,
		HierarchyName:            req.HierarchyName,
		Email:                    req.Email,
		BasicSalary:              req.BasicSalary,
		TaxType:                  req.TaxType,
		DeleteFlag:               deleteFlag,
		BPJSHealthTambahanStatus: req.BPJSHealthTambahanStatus,
		DateOfBirth:              req.DateOfBirth,
		PostFunctionAlwMonth:     req.PostFunctionAlwMonth,
		PhoneAlwMonth:            req.PhoneAlwMonth,
		InternetAlwMonth:         req.InternetAlwMonth,
		IncentiveMonth:           req.IncentiveMonth,
		OperationalAlwMonth:      req.OperationalAlwMonth,
		HousingAlwMonth:          req.HousingAlwMonth,
		SeniorityAlwMonth:        req.SeniorityAlwMonth,
		TransportAlwMonth:        req.TransportAlwMonth,
		FieldAlwMonth:            req.FieldAlwMonth,
		AccommodationAlwMonth:    req.AccommodationAlwMonth,
		WorkDay:                  req.WorkDay,
		OnDay:                    req.OnDay,
		OSDay:                    req.OSDay,
		BTDay:                    req.BTDay,
		OADay:                    req.OADay,
		TravellDay:               req.TravellDay,
		TnTDay:                   req.TnTDay,
		STDay:                    req.STDay,
		TRDay:                    req.TRDay,
	}

	if err := h.employeeService.Create(employee); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}

func (h *EmployeeHandler) Get(c *gin.Context) {
	// 获取ProjectID
	projectID, ok := StringToInt(c, c.Query("project_id"), "project_id")
	if !ok {
		return
	}
	// 获取三个查询参数
	employeeID := c.Query("employee_id")
	employeeName := c.Query("employee_name")
	locationName := c.Query("location_name")
	page, _ := strconv.Atoi(c.DefaultQuery("currentPage", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	offset := (page - 1) * pageSize
	slog.Info("111Get employee by employee_id", "employee_id", employeeID)
	var employee *model.Employee
	var employees []model.Employee
	var err error

	// 检查哪个参数不为空，然后使用该参数进行查询
	// slog.Info("Get employee by query params", "employee_id", employeeID, "employee_name", employeeName, "location_name", locationName)
	if employeeID != "" {
		// 如果 employee_id 不为空，使用它进行查询
		// slog.Info("Get employee by employee_id", "employee_id", employeeID)
		employees, err = h.employeeService.GetByEmployeeID(employeeID, uint(projectID))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"code": 200, "data": employees})
		return
	} else if employeeName != "" {
		// 如果 employee_name 不为空，使用它进行查询
		employees, err = h.employeeService.GetByEmployeeName(employeeName)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"code": 200, "data": employee})
		return
	} else if locationName != "" {
		// 如果 location_name 不为空，使用它进行查询
		employees, err = h.employeeService.GetByLocationName(locationName)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"code": 200, "data": employee})
		return
	} else {
		// 如果所有参数都为空，查询所有员工
		employees, count, _ := h.employeeService.List(offset, pageSize, uint(projectID))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"code": 200, "data": employees, "total": count})
		return
	}
}

func (h *EmployeeHandler) List(c *gin.Context) {
	// 获取ProjectID
	projectID, ok := StringToInt(c, c.Query("project_id"), "project_id")
	if !ok {
		return
	}
	// offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	page, _ := strconv.Atoi(c.DefaultQuery("currentPage", "1"))
	offset := (page - 1) * pageSize
	employeeID := c.Query("employee_id")
	employeeName := c.Query("employee_name")
	locationName := c.Query("location_name")
	// slog.Info("666Get employee by project_id", "project_id", projectID)
	var employee *model.Employee
	var employees []model.Employee
	var err error
	if employeeID != "" {
		// 如果 employee_id 不为空，使用它进行查询
		// slog.Info("Get employee by employee_id", "employee_id", employeeID)
		employees, err = h.employeeService.GetByEmployeeID(employeeID, uint(projectID))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"code": 200, "data": employees})
		return
	} else if employeeName != "" {
		// 如果 employee_name 不为空，使用它进行查询
		employees, err = h.employeeService.GetByEmployeeName(employeeName)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"code": 200, "data": employees})
		return
	} else if locationName != "" {
		// 如果 location_name 不为空，使用它进行查询
		employees, err = h.employeeService.GetByLocationName(locationName)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"code": 200, "data": employee})
		return
	} else {
		// 如果所有参数都为空，查询所有员工
		employees, total, err := h.employeeService.List(offset, pageSize, uint(projectID))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"code": 200, "data": employees, "total": total})
		return
	}
	// c.JSON(http.StatusOK, gin.H{"code": 200, "data": employees})
}

func (h *EmployeeHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "Invalid ID"})
		return
	}
	var req struct {
		EmployeeID               string  `json:"employee_id"`
		ProjectID                string  `json:"project_id"`
		EmployeeName             string  `json:"employee_name"`
		Department               string  `json:"department"`
		Position                 string  `json:"position"`
		Salary                   float64 `json:"salary"`
		TaxStatus                float64 `json:"tax_status"`
		IdCard                   string  `json:"id_card"`
		Npwp                     string  `json:"npwp"`
		HierarchyID              string  `json:"hierarchy_id"`
		HierarchyName            string  `json:"hierarchy_name"`
		JoinDate                 string  `json:"join_date"`
		ResignDate               string  `json:"resign_date"`
		Email                    string  `json:"email"`
		Phone                    string  `json:"phone"`
		BasicSalary              float64 `json:"basic_salary"`
		HousingAlw               float64 `json:"housing_alw"`
		PositionAlw              float64 `json:"position_alw"`
		FieldAlw                 float64 `json:"field_alw"`
		FixAlw                   float64 `json:"fix_alw"`
		MealAlwDay               float64 `json:"meal_alw_day"`
		TranspAlwDay             float64 `json:"transp_alw_day"`
		PulsaAlwDay              float64 `json:"pulsa_alw_day"`
		AttAlwDay                float64 `json:"att_alw_day"`
		TaxType                  string  `json:"tax_type"`
		LocationName             string  `json:"location_name"`
		PulsaAlwMonth            float64 `json:"pulsa_alw_month"`
		HousingAlwTetap          float64 `json:"housing_alw_tetap"`
		DeleteFlag               string  `json:"delete_flag"`
		BPJSHealthTambahanStatus string  `json:"bpjs_health_tambahan_status"` // INTEGER default 0
		DateOfBirth              string  `json:"date_of_birth"`
		PostFunctionAlwMonth     float64 `json:"post_function_alw_month"`
		PhoneAlwMonth            float64 `json:"phone_alw_month"`
		InternetAlwMonth         float64 `json:"internet_alw_month"`
		IncentiveMonth           float64 `json:"incentive_month"`
		OperationalAlwMonth      float64 `json:"operational_alw_month"`
		HousingAlwMonth          float64 `json:"housing_alw_month"`
		SeniorityAlwMonth        float64 `json:"seniority_alw_month"`
		TransportAlwMonth        float64 `json:"transport_alw_month"`
		FieldAlwMonth            float64 `json:"field_alw_month"`
		AccommodationAlwMonth    float64 `json:"accommodation_alw_month"`
		WorkDay                  float64 `json:"work_day"`
		OnDay                    float64 `json:"on_day"`
		OSDay                    float64 `json:"os_day"`
		BTDay                    float64 `json:"bt_day"`
		OADay                    float64 `json:"oa_day"`
		TravellDay               float64 `json:"travell_day"`
		TnTDay                   float64 `json:"tnt_day"`
		STDay                    float64 `json:"st_day"`
		TRDay                    float64 `json:"tr_day"`
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
		ID:                       uint(id),
		EmployeeID:               req.EmployeeID,
		ProjectID:                projectID,
		EmployeeName:             req.EmployeeName,
		Department:               req.Department,
		Position:                 req.Position,
		Salary:                   req.Salary,
		TaxStatus:                req.TaxStatus,
		IdCard:                   req.IdCard,
		Npwp:                     req.Npwp,
		HierarchyID:              req.HierarchyID,
		HierarchyName:            req.HierarchyName,
		Email:                    req.Email,
		BasicSalary:              req.BasicSalary,
		TaxType:                  req.TaxType,
		DeleteFlag:               deleteFlag,
		BPJSHealthTambahanStatus: req.BPJSHealthTambahanStatus,
		DateOfBirth:              req.DateOfBirth,
		PostFunctionAlwMonth:     req.PostFunctionAlwMonth,
		PhoneAlwMonth:            req.PhoneAlwMonth,
		InternetAlwMonth:         req.InternetAlwMonth,
		IncentiveMonth:           req.IncentiveMonth,
		OperationalAlwMonth:      req.OperationalAlwMonth,
		HousingAlwMonth:          req.HousingAlwMonth,
		SeniorityAlwMonth:        req.SeniorityAlwMonth,
		TransportAlwMonth:        req.TransportAlwMonth,
		FieldAlwMonth:            req.FieldAlwMonth,
		AccommodationAlwMonth:    req.AccommodationAlwMonth,
		WorkDay:                  req.WorkDay,
		OnDay:                    req.OnDay,
		OSDay:                    req.OSDay,
		BTDay:                    req.BTDay,
		OADay:                    req.OADay,
		TravellDay:               req.TravellDay,
		TnTDay:                   req.TnTDay,
		STDay:                    req.STDay,
		TRDay:                    req.TRDay,
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
			EmployeeID               string `json:"employee_id"`
			ProjectID                string `json:"project_id"`
			Name                     string `json:"employee_name"`
			Department               string `json:"department"`
			Position                 string `json:"position"`
			Salary                   string `json:"salary"`
			IdCard                   string `json:"idcard_number"`
			Npwp                     string `json:"npwp"`
			HierarchyID              string `json:"hierarchy_id"`
			HierarchyName            string `json:"hierarchy_name"`
			JoinDate                 string `json:"join_date"`
			ResignDate               string `json:"resign"`
			Email                    string `json:"email"`
			BasicSalary              string `json:"basic_salary/month"`
			MealAlwMonth             string `json:"meal_alw/month"`
			TranspAlwMonth           string `json:"transp_alw/month"`
			TaxType                  string `json:"tax_status"`
			LocationName             string `json:"location_name"`
			DeleteFlag               string `json:"delete_flag"`
			IdStatus                 string `json:"id_status"`
			OtStatus                 string `json:"ot_status"`
			BPJSHealthTambahanStatus string `json:"bpjs_health_tambahan_status"` // INTEGER default 0
			DateOfBirth              string `json:"date_of_birth"`
			PostFunctionAlwMonth     string `json:"post_function_alw/month"`
			PhoneAlwMonth            string `json:"phone_alw/month"`
			InternetAlwMonth         string `json:"internet_alw/month"`
			IncentiveMonth           string `json:"incentive/month"`
			OperationalAlwMonth      string `json:"operational_alw/month"`
			HousingAlwMonth          string `json:"housing_alw/month"`
			SeniorityAlwMonth        string `json:"seniority_alw/month"`
			TransportAlwMonth        string `json:"transport_alw/month"`
			FieldAlwMonth            string `json:"field_alw/month"`
			AccommodationAlwMonth    string `json:"accommodation_alw/month"`
			WorkDay                  string `json:"work/day"`
			OSDay                    string `json:"os/day"`
			OnDay                    string `json:"on/day"`
			BTDay                    string `json:"bt/day"`
			OADay                    string `json:"oa/day"`
			TravellDay               string `json:"travell/day"`
			TnTDay                   string `json:"tnt/day"`
			STDay                    string `json:"st/day"`
			TRDay                    string `json:"tr/day"`
		} `json:"records"`
	}
	// slog.Info("Before binding", "req", &req)
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}
	// slog.Info("meal_alw_month11", "meal_alw_month", req.Records[0].MealAlwMonth)
	importReq := service.ImportEmployeeRequest{
		Employees: make([]service.ImportEmployeeItem, len(req.Records)),
	}

	for i, item := range req.Records {
		// 转换ProjectID为int类型
		projectID, ok := StringToInt(c, item.ProjectID, "project_id")
		if !ok {
			return
		}
		slog.Info("ot_status", "ot_stauts", item.OtStatus)
		slog.Info("id_status", "id_status", item.IdStatus)

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
		basicSalary, ok := StringToFloat64(c, item.BasicSalary, "basic_salary/month")
		if !ok {
			return
		}
		// 转换HousingAlw为float64类型
		housingAlw, ok := StringToFloat64(c, item.HousingAlwMonth, "housing_alw/month")
		if !ok {
			return
		}
		// 转换PositionAlw为float64类型
		// 转换FieldAlw为float64类型
		postFunctionAlwMonth, ok := StringToFloat64(c, item.PostFunctionAlwMonth, "post_function_alw/month")
		if !ok {
			return
		}
		phoneAlwMonth, ok := StringToFloat64(c, item.PhoneAlwMonth, "phone_alw/month")
		if !ok {
			return
		}
		internetAlwMonth, ok := StringToFloat64(c, item.InternetAlwMonth, "internet_alw/month")
		if !ok {
			return
		}
		incentiveMonth, ok := StringToFloat64(c, item.IncentiveMonth, "incentive/month")
		if !ok {
			return
		}
		operationalAlwMonth, ok := StringToFloat64(c, item.OperationalAlwMonth, "operational_alw/month")
		if !ok {
			return
		}
		seniorityAlwMonth, ok := StringToFloat64(c, item.SeniorityAlwMonth, "seniority_alw/month")
		if !ok {
			return
		}
		transportAlwMonth, ok := StringToFloat64(c, item.TransportAlwMonth, "transport_alw/month")
		if !ok {
			return
		}
		fieldAlwMonth, ok := StringToFloat64(c, item.FieldAlwMonth, "field_alw/month")
		if !ok {
			return
		}
		accommodationAlwMonth, ok := StringToFloat64(c, item.AccommodationAlwMonth, "accommodation_alw/month")
		if !ok {
			return
		}
		slog.Info("accommodation_alw_month", "accommodation_alw_month", accommodationAlwMonth)
		workDay, ok := StringToFloat64(c, item.WorkDay, "work/day")
		if !ok {
			return
		}
		onDay, ok := StringToFloat64(c, item.OnDay, "on/day")
		if !ok {
			return
		}
		btDay, ok := StringToFloat64(c, item.BTDay, "bt/day")
		if !ok {
			return
		}
		osDay, ok := StringToFloat64(c, item.OSDay, "os/day")
		if !ok {
			return
		}
		oADay, ok := StringToFloat64(c, item.OADay, "oa/day")
		if !ok {
			return
		}
		travellDay, ok := StringToFloat64(c, item.TravellDay, "travell/day")
		if !ok {
			return
		}
		tnTDay, ok := StringToFloat64(c, item.TnTDay, "tnt/day")
		if !ok {
			return
		}
		stDay, ok := StringToFloat64(c, item.STDay, "st/day")
		if !ok {
			return
		}
		trDay, ok := StringToFloat64(c, item.TRDay, "tr/day")
		if !ok {
			return
		}

		housingAlwMonth, ok := StringToFloat64(c, item.HousingAlwMonth, "housing_alw/month")
		if !ok {
			return
		}
		slog.Info("housing_alw_month", "housing_alw_month", housingAlwMonth)
		// 转换PulsaAlwDay为float64类型

		importReq.Employees[i] = service.ImportEmployeeItem{
			EmployeeID:               item.EmployeeID,
			ProjectID:                projectID,
			EmployeeName:             item.Name,
			Department:               item.Department,
			Position:                 item.Position,
			IdCard:                   item.IdCard,
			Npwp:                     item.Npwp,
			HierarchyID:              item.HierarchyID,
			HierarchyName:            item.HierarchyName,
			JoinDate:                 item.JoinDate,
			ResignDate:               item.ResignDate,
			Email:                    item.Email,
			BasicSalary:              basicSalary,
			HousingAlw:               housingAlw,
			TaxType:                  item.TaxType,
			LocationName:             item.LocationName,
			DeleteFlag:               deleteFlag,
			BPJSHealthTambahanStatus: item.BPJSHealthTambahanStatus,
			DateOfBirth:              item.DateOfBirth,
			PostFunctionAlwMonth:     postFunctionAlwMonth,
			PhoneAlwMonth:            phoneAlwMonth,
			InternetAlwMonth:         internetAlwMonth,
			IncentiveMonth:           incentiveMonth,
			OperationalAlwMonth:      operationalAlwMonth,
			HousingAlwMonth:          housingAlwMonth,
			SeniorityAlwMonth:        seniorityAlwMonth,
			TransportAlwMonth:        transportAlwMonth,
			FieldAlwMonth:            fieldAlwMonth,
			AccommodationAlwMonth:    accommodationAlwMonth,
			WorkDay:                  workDay,
			OnDay:                    onDay,
			BTDay:                    btDay,
			OSDay:                    osDay,
			OADay:                    oADay,
			TravellDay:               travellDay,
			TnTDay:                   tnTDay,
			STDay:                    stDay,
			TRDay:                    trDay,
		}
	}

	if err := h.employeeService.ImportEmployee(importReq); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success"})
}

// TotalEmployees 获取员工总数（在职员工）
func (h *EmployeeHandler) TotalEmployees(c *gin.Context) {
	total, err := h.employeeService.TotalEmployees()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "Success", "data": gin.H{"total": total}})
}
