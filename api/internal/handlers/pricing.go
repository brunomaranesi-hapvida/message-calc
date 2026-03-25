package handlers

import (
	"errors"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/maranesi/message-calc/api/internal/models"
	"github.com/maranesi/message-calc/api/internal/services"
	"gorm.io/gorm"
)

type PricingHandler struct {
	pricingService *services.PricingService
	configService  *services.DefaultConfigService
	calcService    *services.CalculatorService
}

func NewPricingHandler(
	pricingService *services.PricingService,
	configService *services.DefaultConfigService,
	calcService *services.CalculatorService,
) *PricingHandler {
	return &PricingHandler{
		pricingService: pricingService,
		configService:  configService,
		calcService:    calcService,
	}
}

type priceRequest struct {
	ProviderID string  `json:"provider_id"`
	ChannelID  string  `json:"channel_id"`
	Price      float64 `json:"price"`
	ValidFrom  string  `json:"valid_from"`
	ValidTo    *string `json:"valid_to"`
}

type defaultConfigRequest struct {
	ChannelID  string `json:"channel_id"`
	ProviderID string `json:"provider_id"`
}

func (h *PricingHandler) ListPrices(c echo.Context) error {
	prices, err := h.pricingService.List()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to list prices"})
	}
	return c.JSON(http.StatusOK, prices)
}

func (h *PricingHandler) CreatePrice(c echo.Context) error {
	var req priceRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}
	if req.ProviderID == "" || req.ChannelID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "provider_id and channel_id are required"})
	}

	validFrom, err := time.Parse("2006-01-02", req.ValidFrom)
	if err != nil {
		validFrom = time.Now()
	}

	price := &models.ProviderChannelPrice{
		ProviderID: req.ProviderID,
		ChannelID:  req.ChannelID,
		Price:      req.Price,
		ValidFrom:  validFrom,
	}

	if req.ValidTo != nil && *req.ValidTo != "" {
		if vt, err := time.Parse("2006-01-02", *req.ValidTo); err == nil {
			price.ValidTo = &vt
		}
	}

	if err := h.pricingService.Create(price); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to create price"})
	}
	return c.JSON(http.StatusCreated, price)
}

func (h *PricingHandler) UpdatePrice(c echo.Context) error {
	id := c.Param("id")
	var req priceRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	validFrom, err := time.Parse("2006-01-02", req.ValidFrom)
	if err != nil {
		validFrom = time.Now()
	}

	update := &models.ProviderChannelPrice{
		ProviderID: req.ProviderID,
		ChannelID:  req.ChannelID,
		Price:      req.Price,
		ValidFrom:  validFrom,
	}

	if req.ValidTo != nil && *req.ValidTo != "" {
		if vt, err := time.Parse("2006-01-02", *req.ValidTo); err == nil {
			update.ValidTo = &vt
		}
	}

	updated, err := h.pricingService.Update(id, update)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "price not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to update price"})
	}
	return c.JSON(http.StatusOK, updated)
}

// Default provider config

func (h *PricingHandler) GetDefaultConfig(c echo.Context) error {
	configs, err := h.configService.List()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to get default config"})
	}
	return c.JSON(http.StatusOK, configs)
}

func (h *PricingHandler) SetDefaultConfig(c echo.Context) error {
	var req defaultConfigRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}
	if req.ChannelID == "" || req.ProviderID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "channel_id and provider_id are required"})
	}

	if err := h.configService.Set(req.ChannelID, req.ProviderID); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to set default config"})
	}
	return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}

// Calculator config (aggregated endpoint for the frontend)

func (h *PricingHandler) GetCalculatorConfig(c echo.Context) error {
	config, err := h.calcService.GetConfig()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to get calculator config"})
	}
	return c.JSON(http.StatusOK, config)
}

// Calculator defaults (singleton)

func (h *PricingHandler) GetCalculatorDefaults(c echo.Context) error {
	cfg, err := h.calcService.GetDefaults()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to get calculator defaults"})
	}
	return c.JSON(http.StatusOK, cfg)
}

type calculatorDefaultsRequest struct {
	DefaultPeopleReached        int     `json:"default_people_reached"`
	DefaultStartMonth           int     `json:"default_start_month"`
	DefaultOptInRate            float64 `json:"default_opt_in_rate"`
	DefaultWhatsappDeliveryRate float64 `json:"default_whatsapp_delivery_rate"`
	DefaultSmsDeliveryRate      float64 `json:"default_sms_delivery_rate"`
}

func (h *PricingHandler) UpdateCalculatorDefaults(c echo.Context) error {
	var req calculatorDefaultsRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	if req.DefaultPeopleReached <= 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "default_people_reached must be > 0"})
	}
	if req.DefaultStartMonth < 1 || req.DefaultStartMonth > 12 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "default_start_month must be between 1 and 12"})
	}
	if req.DefaultOptInRate < 0 || req.DefaultOptInRate > 1 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "default_opt_in_rate must be between 0 and 1"})
	}
	if req.DefaultWhatsappDeliveryRate < 0 || req.DefaultWhatsappDeliveryRate > 1 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "default_whatsapp_delivery_rate must be between 0 and 1"})
	}
	if req.DefaultSmsDeliveryRate < 0 || req.DefaultSmsDeliveryRate > 1 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "default_sms_delivery_rate must be between 0 and 1"})
	}

	cfg := &models.CalculatorConfig{
		DefaultPeopleReached:        req.DefaultPeopleReached,
		DefaultStartMonth:           req.DefaultStartMonth,
		DefaultOptInRate:            req.DefaultOptInRate,
		DefaultWhatsappDeliveryRate: req.DefaultWhatsappDeliveryRate,
		DefaultSmsDeliveryRate:      req.DefaultSmsDeliveryRate,
	}

	if err := h.calcService.UpdateDefaults(cfg); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to update calculator defaults"})
	}
	return c.JSON(http.StatusOK, cfg)
}
