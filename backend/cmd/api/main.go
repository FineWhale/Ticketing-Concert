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

	"github.com/labstack/echo/v4"
	echomiddleware "github.com/labstack/echo/v4/middleware"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	if cfg.MidtransServerKey == "" {
		log.Fatal("MIDTRANS_SERVER_KEY is not set")
	}

	db, err := connectDB(cfg)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// ✅ Tambah models.Seat ke AutoMigrate
	if err := db.AutoMigrate(
		&models.User{},
		&models.Order{},
		&models.OrderItem{},
		&models.TicketStock{},
		&models.Seat{},
	); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Repositories
	userRepo := repository.NewUserRepository(db)
	orderRepo := repository.NewOrderRepository(db)
	seatRepo := repository.NewSeatRepository(db)

	// Services
	jwtExpiry, _ := time.ParseDuration(cfg.JWTExpiry)
	authService := services.NewAuthService(userRepo, cfg.JWTSecret, jwtExpiry)
	midtransService := services.NewMidtransService(cfg.MidtransServerKey)
	seatService := services.NewSeatService(seatRepo)
	orderService := services.NewOrderService(orderRepo, midtransService, seatService)

	// ✅ Seed seats on startup (hanya jika belum ada)
	if err := seatService.SeedIfEmpty(); err != nil {
		log.Println("Warning: seat seeding failed:", err)
	}

	// Handlers
	authHandler := handlers.NewAuthHandler(authService)
	orderHandler := handlers.NewOrderHandler(orderService)
	paymentHandler := handlers.NewPaymentHandler(orderService)
	adminHandler := handlers.NewAdminHandler(db)
	seatHandler := handlers.NewSeatHandler(seatService)

	e := setupRouter(cfg, authHandler, orderHandler, paymentHandler, adminHandler, seatHandler)

	log.Printf("API starting at port %s", cfg.Port)
	log.Printf("Environment: %s", cfg.Environment)
	log.Printf("Frontend URL: %s", cfg.FrontendURL)

	e.Logger.Fatal(e.Start(":" + cfg.Port))
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

func setupRouter(
	cfg *config.Config,
	authHandler *handlers.AuthHandler,
	orderHandler *handlers.OrderHandler,
	paymentHandler *handlers.PaymentHandler,
	adminHandler *handlers.AdminHandler,
	seatHandler *handlers.SeatHandler,
) *echo.Echo {
	e := echo.New()
	e.HideBanner = true

	e.Use(echomiddleware.CORSWithConfig(echomiddleware.CORSConfig{
		AllowOrigins:     []string{cfg.FrontendURL},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept"},
		AllowCredentials: true,
	}))

	e.Use(echomiddleware.Logger())
	e.Use(echomiddleware.Recover())

	api := e.Group("/api")
	api.GET("/health", authHandler.HealthCheck)

	// Auth
	auth := api.Group("/auth")
	auth.POST("/register", authHandler.Register)
	auth.POST("/login", authHandler.Login)

	protected := auth.Group("")
	protected.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	protected.GET("/me", authHandler.GetCurrentUser)

	// Orders
	orders := api.Group("/orders")
	orders.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	orders.POST("", orderHandler.CreateOrder)
	orders.GET("", orderHandler.GetUserOrders)
	orders.GET("/:orderCode", orderHandler.GetOrder)

	// Payment webhook
	api.POST("/payment/notification", paymentHandler.HandleNotification)

	// ✅ Seats (protected — perlu login)
	seats := api.Group("/seats")
	seats.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	seats.GET("", seatHandler.GetSeats)              // GET /api/seats?section=CAT2
	seats.POST("/reserve", seatHandler.ReserveSeats) // POST /api/seats/reserve
	seats.POST("/release", seatHandler.ReleaseSeats) // POST /api/seats/release

	// Admin routes
	admin := api.Group("/admin")
	admin.Use(middleware.AuthMiddleware(cfg.JWTSecret))
	admin.Use(middleware.AdminOnly())
	admin.GET("/stats", adminHandler.GetStats)
	admin.GET("/sales-chart", adminHandler.GetSalesChart)
	admin.GET("/orders", adminHandler.GetOrders)
	admin.GET("/ticket-stocks", adminHandler.GetTicketStocks)
	admin.POST("/ticket-stocks", adminHandler.UpsertTicketStock)

	log.Println("Routes configured successfully")
	return e
}
