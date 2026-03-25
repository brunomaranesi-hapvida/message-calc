package handlers

import (
	"errors"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/maranesi/message-calc/api/internal/models"
	"github.com/maranesi/message-calc/api/internal/services"
	"gorm.io/gorm"
)

type ProviderHandler struct {
	providerService *services.ProviderService
}

func NewProviderHandler(providerService *services.ProviderService) *ProviderHandler {
	return &ProviderHandler{providerService: providerService}
}

type providerRequest struct {
	Name     string `json:"name"`
	IsActive *bool  `json:"is_active"`
}

func (h *ProviderHandler) List(c echo.Context) error {
	providers, err := h.providerService.List()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to list providers"})
	}
	return c.JSON(http.StatusOK, providers)
}

func (h *ProviderHandler) Create(c echo.Context) error {
	var req providerRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}
	if req.Name == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "name is required"})
	}

	provider := &models.Provider{Name: req.Name}
	if err := h.providerService.Create(provider); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to create provider"})
	}
	return c.JSON(http.StatusCreated, provider)
}

func (h *ProviderHandler) Update(c echo.Context) error {
	id := c.Param("id")
	var req providerRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}
	if req.Name == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "name is required"})
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	provider, err := h.providerService.Update(id, req.Name, isActive)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "provider not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to update provider"})
	}
	return c.JSON(http.StatusOK, provider)
}

func (h *ProviderHandler) Delete(c echo.Context) error {
	id := c.Param("id")
	if err := h.providerService.Delete(id); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "provider not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to delete provider"})
	}
	return c.NoContent(http.StatusNoContent)
}
