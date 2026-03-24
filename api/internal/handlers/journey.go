package handlers

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/maranesi/message-calc/api/internal/models"
	"github.com/maranesi/message-calc/api/internal/services"
	"gorm.io/gorm"
)

type JourneyHandler struct {
	journeyService *services.JourneyService
}

func NewJourneyHandler(journeyService *services.JourneyService) *JourneyHandler {
	return &JourneyHandler{journeyService: journeyService}
}

type createJourneyRequest struct {
	Name        string          `json:"name"`
	BaseVolume  int             `json:"base_volume"`
	OptInRate   float64         `json:"opt_in_rate"`
	WADelivery  float64         `json:"wa_delivery"`
	SMSDelivery float64         `json:"sms_delivery"`
	Steps       json.RawMessage `json:"steps"`
	Category    *string         `json:"category"`
	Owner       *string         `json:"owner"`
}

type approveRequest struct {
	ApprovedBy string `json:"approved_by"`
}

func (h *JourneyHandler) List(c echo.Context) error {
	journeys, err := h.journeyService.ListJourneys()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to list journeys"})
	}
	return c.JSON(http.StatusOK, journeys)
}

func (h *JourneyHandler) Get(c echo.Context) error {
	code := c.Param("code")

	journey, err := h.journeyService.GetJourney(code)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "journey not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to get journey"})
	}

	return c.JSON(http.StatusOK, journey)
}

func (h *JourneyHandler) Create(c echo.Context) error {
	var req createJourneyRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	if req.Category == nil || *req.Category == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "category is required"})
	}
	if req.Owner == nil || *req.Owner == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "owner is required"})
	}

	steps := req.Steps
	if len(steps) == 0 {
		steps = json.RawMessage("[]")
	}

	journey := &models.Journey{
		Name:        req.Name,
		BaseVolume:  req.BaseVolume,
		OptInRate:   req.OptInRate,
		WADelivery:  req.WADelivery,
		SMSDelivery: req.SMSDelivery,
		Steps:       steps,
		Category:    req.Category,
		Owner:       req.Owner,
	}

	if err := h.journeyService.CreateJourney(journey); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to create journey"})
	}

	return c.JSON(http.StatusCreated, journey)
}

func (h *JourneyHandler) Approve(c echo.Context) error {
	code := c.Param("code")
	var req approveRequest
	if err := c.Bind(&req); err != nil || req.ApprovedBy == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "approved_by is required"})
	}

	journey, err := h.journeyService.ApproveJourney(code, req.ApprovedBy)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "journey not found"})
		}
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, journey)
}

func (h *JourneyHandler) Reject(c echo.Context) error {
	code := c.Param("code")
	var req approveRequest
	if err := c.Bind(&req); err != nil || req.ApprovedBy == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "approved_by is required"})
	}

	journey, err := h.journeyService.RejectJourney(code, req.ApprovedBy)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "journey not found"})
		}
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, journey)
}

func (h *JourneyHandler) Delete(c echo.Context) error {
	code := c.Param("code")

	if err := h.journeyService.DeleteJourney(code); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "journey not found"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to delete journey"})
	}

	return c.NoContent(http.StatusNoContent)
}
