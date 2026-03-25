package handlers

import (
	"errors"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/maranesi/message-calc/api/internal/models"
	"github.com/maranesi/message-calc/api/internal/services"
	"gorm.io/gorm"
)

type ChannelHandler struct {
	channelService *services.ChannelService
}

func NewChannelHandler(channelService *services.ChannelService) *ChannelHandler {
	return &ChannelHandler{channelService: channelService}
}

type channelRequest struct {
	Name     string `json:"name"`
	Code     string `json:"code"`
	IsActive *bool  `json:"is_active"`
}

func (h *ChannelHandler) List(c echo.Context) error {
	channels, err := h.channelService.List()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to list channels"})
	}
	return c.JSON(http.StatusOK, channels)
}

func (h *ChannelHandler) Create(c echo.Context) error {
	var req channelRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}
	if req.Name == "" || req.Code == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "name and code are required"})
	}

	channel := &models.Channel{Name: req.Name, Code: req.Code}
	if err := h.channelService.Create(channel); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to create channel"})
	}
	return c.JSON(http.StatusCreated, channel)
}

func (h *ChannelHandler) Update(c echo.Context) error {
	id := c.Param("id")
	var req channelRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}
	if req.Name == "" || req.Code == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "name and code are required"})
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	channel, err := h.channelService.Update(id, req.Name, req.Code, isActive)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "channel not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to update channel"})
	}
	return c.JSON(http.StatusOK, channel)
}

func (h *ChannelHandler) Delete(c echo.Context) error {
	id := c.Param("id")
	if err := h.channelService.Delete(id); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "channel not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to delete channel"})
	}
	return c.NoContent(http.StatusNoContent)
}
