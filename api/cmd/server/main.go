package main

import (
	"log"
	"os"

	"github.com/labstack/echo/v4"
	"github.com/maranesi/message-calc/api/internal/handlers"
	"github.com/maranesi/message-calc/api/internal/middleware"
	"github.com/maranesi/message-calc/api/internal/repositories"
	"github.com/maranesi/message-calc/api/internal/services"
	"github.com/maranesi/message-calc/api/pkg/database"
)

func main() {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET is required")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	db, err := database.Init(databaseURL)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	userRepo := repositories.NewUserRepository(db)
	journeyRepo := repositories.NewJourneyRepository(db)

	authService := services.NewAuthService(userRepo, jwtSecret)
	journeyService := services.NewJourneyService(journeyRepo)

	authHandler := handlers.NewAuthHandler(authService)
	journeyHandler := handlers.NewJourneyHandler(journeyService)

	e := echo.New()

	e.Use(middleware.CORS())

	e.POST("/auth/login", authHandler.Login)

	e.GET("/journeys", journeyHandler.List)
	e.POST("/journeys", journeyHandler.Create)
	e.GET("/journeys/:code", journeyHandler.Get)
	e.POST("/journeys/:code/approve", journeyHandler.Approve, middleware.JWTAuth(jwtSecret))
	e.POST("/journeys/:code/reject", journeyHandler.Reject, middleware.JWTAuth(jwtSecret))
	e.DELETE("/journeys/:code", journeyHandler.Delete, middleware.JWTAuth(jwtSecret))

	log.Printf("server starting on port %s", port)
	if err := e.Start(":" + port); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
