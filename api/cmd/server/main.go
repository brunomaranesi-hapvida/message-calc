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

	// Repositories
	userRepo := repositories.NewUserRepository(db)
	journeyRepo := repositories.NewJourneyRepository(db)
	channelRepo := repositories.NewChannelRepository(db)
	providerRepo := repositories.NewProviderRepository(db)
	pricingRepo := repositories.NewPricingRepository(db)
	defaultConfigRepo := repositories.NewDefaultConfigRepository(db)
	calcCfgRepo := repositories.NewCalculatorConfigRepository(db)

	// Services
	authService := services.NewAuthService(userRepo, jwtSecret)
	journeyService := services.NewJourneyService(journeyRepo)
	channelService := services.NewChannelService(channelRepo)
	providerService := services.NewProviderService(providerRepo)
	pricingService := services.NewPricingService(pricingRepo)
	defaultConfigService := services.NewDefaultConfigService(defaultConfigRepo)
	calculatorService := services.NewCalculatorService(channelRepo, providerRepo, pricingRepo, defaultConfigRepo, calcCfgRepo)

	// Handlers
	authHandler := handlers.NewAuthHandler(authService)
	journeyHandler := handlers.NewJourneyHandler(journeyService)
	channelHandler := handlers.NewChannelHandler(channelService)
	providerHandler := handlers.NewProviderHandler(providerService)
	pricingHandler := handlers.NewPricingHandler(pricingService, defaultConfigService, calculatorService)

	// Seed initial data
	database.SeedDefaults(db)

	e := echo.New()

	e.Use(middleware.CORS())

	// Auth
	e.POST("/auth/login", authHandler.Login)

	// Journeys
	e.GET("/journeys", journeyHandler.List)
	e.POST("/journeys", journeyHandler.Create)
	e.GET("/journeys/:code", journeyHandler.Get)
	e.POST("/journeys/:code/approve", journeyHandler.Approve, middleware.JWTAuth(jwtSecret))
	e.POST("/journeys/:code/reject", journeyHandler.Reject, middleware.JWTAuth(jwtSecret))
	e.DELETE("/journeys/:code", journeyHandler.Delete, middleware.JWTAuth(jwtSecret))

	// Channels
	e.GET("/channels", channelHandler.List)
	e.POST("/channels", channelHandler.Create)
	e.PUT("/channels/:id", channelHandler.Update)
	e.DELETE("/channels/:id", channelHandler.Delete)

	// Providers
	e.GET("/providers", providerHandler.List)
	e.POST("/providers", providerHandler.Create)
	e.PUT("/providers/:id", providerHandler.Update)
	e.DELETE("/providers/:id", providerHandler.Delete)

	// Pricing
	e.GET("/provider-channel-prices", pricingHandler.ListPrices)
	e.POST("/provider-channel-prices", pricingHandler.CreatePrice)
	e.PUT("/provider-channel-prices/:id", pricingHandler.UpdatePrice)

	// Default provider config
	e.GET("/default-provider-config", pricingHandler.GetDefaultConfig)
	e.PUT("/default-provider-config", pricingHandler.SetDefaultConfig)

	// Calculator defaults (singleton settings)
	e.GET("/calculator-defaults", pricingHandler.GetCalculatorDefaults)
	e.PUT("/calculator-defaults", pricingHandler.UpdateCalculatorDefaults)

	// Calculator config (aggregated endpoint for the frontend)
	e.GET("/calculator-config", pricingHandler.GetCalculatorConfig)

	log.Printf("server starting on port %s", port)
	if err := e.Start(":" + port); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
