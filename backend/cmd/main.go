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

	userService := service.NewUserService(userRepo, roleRepo)
	roleService := service.NewRoleService(roleRepo, permissionRepo)
	permissionService := service.NewPermissionService(permissionRepo)
	menuService := service.NewMenuService(menuRepo)
	projectService := service.NewProjectService(projectRepo)
	licenseService := service.NewLicenseService(licenseRepo)

	userHandler := handler.NewUserHandler(userService)
	roleHandler := handler.NewRoleHandler(roleService)
	permissionHandler := handler.NewPermissionHandler(permissionService)
	menuHandler := handler.NewMenuHandler(menuService)
	authHandler := handler.NewAuthHandler(userService)
	projectHandler := handler.NewProjectHandler(projectService)
	licenseHandler := handler.NewLicenseHandler(licenseService)

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
