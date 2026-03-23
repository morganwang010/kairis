package main

import (
	"kairis/backend/internal/config"
	"kairis/backend/internal/handler"
	"kairis/backend/internal/middleware"
	"kairis/backend/internal/repository"
	"kairis/backend/internal/service"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	r := gin.Default()

	r.Use(middleware.CORS())
	r.Use(middleware.Logger())

	db, err := config.InitDB(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	userRepo := repository.NewUserRepository(db)
	roleRepo := repository.NewRoleRepository(db)
	permissionRepo := repository.NewPermissionRepository(db)
	menuRepo := repository.NewMenuRepository(db)
	projectRepo := repository.NewProjectRepository(db)
	licenseRepo := repository.NewLicenseRepository(db)
	attendanceRepo := repository.NewAttendanceRepository(db)
	incidentRepo := repository.NewIncidentRepository(db)
	employeeRepo := repository.NewEmployeeRepository(db)
	salaryRepo := repository.NewSalaryRepository(db)
	taxRateRepo := repository.NewTaxRateRepository(db)
	taxFreeBaseRepo := repository.NewTaxFreeBaseRepository(db)
	salaryCoefficientRepo := repository.NewSalaryCoefficientRepository(db)
	systemConfigRepo := repository.NewSystemConfigRepository(db)
	salarySlipRepo := repository.NewSalaryRepository(db)
	emailRepo := repository.NewEmailRepository(db)

	userService := service.NewUserService(userRepo, roleRepo)
	roleService := service.NewRoleService(roleRepo, permissionRepo)
	permissionService := service.NewPermissionService(permissionRepo)
	menuService := service.NewMenuService(menuRepo)
	projectService := service.NewProjectService(projectRepo)
	licenseService := service.NewLicenseService(licenseRepo)
	attendanceService := service.NewAttendanceService(attendanceRepo)
	incidentService := service.NewIncidentService(incidentRepo)
	employeeService := service.NewEmployeeService(employeeRepo)
	salaryService := service.NewSalaryService(salaryRepo)
	taxRateService := service.NewTaxRateService(taxRateRepo)
	taxFreeBaseService := service.NewTaxFreeBaseService(taxFreeBaseRepo)
	salaryCoefficientService := service.NewSalaryCoefficientService(salaryCoefficientRepo)
	systemConfigService := service.NewSystemConfigService(systemConfigRepo)
	salarySlipService := service.NewSalarySlipService(salarySlipRepo)
	emailService := service.NewEmailService(emailRepo)

	userHandler := handler.NewUserHandler(userService)
	roleHandler := handler.NewRoleHandler(roleService)
	permissionHandler := handler.NewPermissionHandler(permissionService)
	menuHandler := handler.NewMenuHandler(menuService)
	authHandler := handler.NewAuthHandler(userService)
	projectHandler := handler.NewProjectHandler(projectService)
	licenseHandler := handler.NewLicenseHandler(licenseService)
	attendanceHandler := handler.NewAttendanceHandler(attendanceService)
	incidentHandler := handler.NewIncidentHandler(incidentService)
	employeeHandler := handler.NewEmployeeHandler(employeeService)
	salaryHandler := handler.NewSalaryHandler(salaryService)
	taxRateHandler := handler.NewTaxRateHandler(taxRateService)
	taxFreeBaseHandler := handler.NewTaxFreeBaseHandler(taxFreeBaseService)
	salaryCoefficientHandler := handler.NewSalaryCoefficientHandler(salaryCoefficientService)
	systemConfigHandler := handler.NewSystemConfigHandler(systemConfigService)
	salarySlipHandler := handler.NewSalarySlipHandler(salarySlipService)
	emailHandler := handler.NewEmailHandler(emailService)

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/login", authHandler.Login)
		}

		users := api.Group("/users")
		users.Use(middleware.Auth())
		{
			users.GET("", userHandler.List)
			users.GET("/:id", userHandler.Get)
			users.POST("", userHandler.Create)
			users.PUT("/:id", userHandler.Update)
			users.DELETE("/:id", userHandler.Delete)
		}

		roles := api.Group("/roles")
		roles.Use(middleware.Auth())
		{
			roles.GET("", roleHandler.List)
			roles.GET("/:id", roleHandler.Get)
			roles.POST("", roleHandler.Create)
			roles.PUT("/:id", roleHandler.Update)
			roles.DELETE("/:id", roleHandler.Delete)
		}

		permissions := api.Group("/permissions")
		permissions.Use(middleware.Auth())
		{
			permissions.GET("", permissionHandler.List)
			permissions.GET("/:id", permissionHandler.Get)
			permissions.POST("", permissionHandler.Create)
			permissions.PUT("/:id", permissionHandler.Update)
			permissions.DELETE("/:id", permissionHandler.Delete)
		}

		menus := api.Group("/menus")
		menus.Use(middleware.Auth())
		{
			menus.GET("", menuHandler.List)
			menus.GET("/:id", menuHandler.Get)
			menus.POST("", menuHandler.Create)
			menus.PUT("/:id", menuHandler.Update)
			menus.DELETE("/:id", menuHandler.Delete)
			menus.GET("/tree", menuHandler.Tree)
		}
		projects := api.Group("/projects")
		projects.Use(middleware.Auth())
		{
			projects.GET("", projectHandler.List)
			projects.GET("/:id", projectHandler.Get)
			projects.POST("", projectHandler.Create)
			projects.PUT("/:id", projectHandler.Update)
			projects.DELETE("/:id", projectHandler.Delete)
		}
		licenses := api.Group("/licenses")
		licenses.Use(middleware.Auth())
		{
			licenses.GET("", licenseHandler.List)
			licenses.GET("/:id", licenseHandler.Get)
			licenses.POST("", licenseHandler.Create)
			licenses.PUT("/:id", licenseHandler.Update)
			licenses.DELETE("/:id", licenseHandler.Delete)
			licenses.GET("/check", licenseHandler.Check)
			licenses.POST("/activate", licenseHandler.Activate)
			licenses.POST("/deactivate", licenseHandler.Deactivate)
		}

		attendances := api.Group("/attendances")
		attendances.Use(middleware.Auth())
		{
			attendances.GET("", attendanceHandler.List)
			attendances.GET("/:id", attendanceHandler.Get)
			attendances.POST("", attendanceHandler.Create)
			attendances.PUT("/:id", attendanceHandler.Update)
			attendances.DELETE("/:id", attendanceHandler.Delete)
			attendances.POST("/import", attendanceHandler.Import)
		}

		incidents := api.Group("/incidents")
		incidents.Use(middleware.Auth())
		{
			incidents.GET("", incidentHandler.List)
			incidents.GET("/:id", incidentHandler.Get)
			incidents.POST("", incidentHandler.Create)
			incidents.PUT("/:id", incidentHandler.Update)
			incidents.DELETE("/:id", incidentHandler.Delete)
			incidents.POST("/import", incidentHandler.Import)
		}

		employees := api.Group("/employees")
		employees.Use(middleware.Auth())
		{
			employees.GET("", employeeHandler.List)
			employees.GET("/:id", employeeHandler.Get)
			employees.POST("", employeeHandler.Create)
			employees.PUT("/:id", employeeHandler.Update)
			employees.DELETE("/:id", employeeHandler.Delete)
			employees.POST("/import", employeeHandler.Import)
		}

		salaries := api.Group("/salaries")
		salaries.Use(middleware.Auth())
		{
			salaries.GET("", salaryHandler.List)
			salaries.GET("/:id", salaryHandler.Get)
			salaries.POST("", salaryHandler.Create)
			salaries.PUT("/:id", salaryHandler.Update)
			salaries.DELETE("/:id", salaryHandler.Delete)
			salaries.POST("/import", salaryHandler.Import)
			salaries.POST("/calculate", salaryHandler.Calculate)
		}

		salarySlips := api.Group("/salary-slips")
		salarySlips.Use(middleware.Auth())
		{
			salarySlips.GET("", salaryHandler.List)
			// salarySlips.GET("/:id", salarySlipHandler.Get)
			salarySlips.POST("", salarySlipHandler.Create)
			salarySlips.PUT("/:id", salarySlipHandler.Update)
			salarySlips.DELETE("/:id", salarySlipHandler.Delete)
		}

		email := api.Group("/email")
		email.Use(middleware.Auth())
		{
			email.POST("/send", emailHandler.SendEmail)
		}

		taxRates := api.Group("/tax-rates")
		taxRates.Use(middleware.Auth())
		{
			taxRates.GET("", taxRateHandler.List)
			taxRates.GET("/:id", taxRateHandler.Get)
			taxRates.GET("/grade", taxRateHandler.GetByGrade)
			taxRates.POST("", taxRateHandler.Create)
			taxRates.PUT("/:id", taxRateHandler.Update)
			taxRates.DELETE("/:id", taxRateHandler.Delete)
		}

		taxFreeBases := api.Group("/tax-free-bases")
		taxFreeBases.Use(middleware.Auth())
		{
			taxFreeBases.GET("", taxFreeBaseHandler.List)
			taxFreeBases.GET("/:id", taxFreeBaseHandler.Get)
			taxFreeBases.POST("", taxFreeBaseHandler.Create)
			taxFreeBases.PUT("/:id", taxFreeBaseHandler.Update)
			taxFreeBases.DELETE("/:id", taxFreeBaseHandler.Delete)
		}

		salaryCoefficients := api.Group("/salary-coefficients")
		salaryCoefficients.Use(middleware.Auth())
		{
			salaryCoefficients.GET("", salaryCoefficientHandler.List)
			salaryCoefficients.GET("/:id", salaryCoefficientHandler.Get)
			salaryCoefficients.POST("", salaryCoefficientHandler.Create)
			salaryCoefficients.PUT("/:id", salaryCoefficientHandler.Update)
			salaryCoefficients.DELETE("/:id", salaryCoefficientHandler.Delete)
		}

		systemConfigs := api.Group("/system-configs")
		systemConfigs.Use(middleware.Auth())
		{
			systemConfigs.GET("", systemConfigHandler.List)
			systemConfigs.GET("/:id", systemConfigHandler.Get)
			systemConfigs.GET("/name/:name", systemConfigHandler.GetByName)
			systemConfigs.POST("", systemConfigHandler.Create)
			systemConfigs.PUT("/:id", systemConfigHandler.Update)
			systemConfigs.DELETE("/:id", systemConfigHandler.Delete)
		}

		// 公开的许可证接口
		// licensePublic := api.Group("/license")
		// {
		// 	licensePublic.POST("/activate", licenseHandler.Activate)
		// 	licensePublic.POST("/deactivate", licenseHandler.Deactivate)
		// 	licensePublic.GET("/all", licenseHandler.List)
		// }
	}

	log.Printf("Server starting on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
