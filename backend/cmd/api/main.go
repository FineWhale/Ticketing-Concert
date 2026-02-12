package main

import (
	"fmt"
	"log"
	"time"

	"beachboys-concert-backend/config"
	"beachboys-concert-backend/internal/handlers"
	"beachboys-concert-backend/internal/middleware"
	"beachboys-concert-backend/internal/models"
	"beachboys-concert-backend/internal/repository"
	"beachboys-concert-backend/internal/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// connect db?
	db, err := connectDB(cfg)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	if err := db.AutoMigrate(&models.User{}); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	userRepo := repository.NewUserRepository(db)

	jwtExpiry, _ := time.ParseDuration(cfg.JWTExpiry)
	authService := services.NewAuthService(userRepo, cfg.JWTSecret, jwtExpiry)

	authHandler := handlers.NewAuthHandler(authService)

	router := setupRouter(cfg, authHandler)

	log.Printf("API starting at port %s", cfg.Port)
	log.Printf("Environment: %s", cfg.Environment)
	log.Printf("Frontend URL: %s", cfg.FrontendURL)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

func connectDB(cfg *config.Config) (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBPort,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	log.Println("✅ Database connected successfully")
	return db, nil
}

func setupRouter(cfg *config.Config, authHandler *handlers.AuthHandler) *gin.Engine {
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{cfg.FrontendURL},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	api := router.Group("/api")
	{
		api.GET("/health", authHandler.HealthCheck)

		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)

			protected := auth.Group("")
			protected.Use(middleware.AuthMiddleware(cfg.JWTSecret))
			{
				protected.GET("/me", authHandler.GetCurrentUser)
				// protected.POST("/logout", authHandler.Logout)
			}
		}
	}

	log.Println("Routes configured successfully")
	return router
}
