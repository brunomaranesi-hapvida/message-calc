package models

import (
	"encoding/json"
	"time"
)

type Journey struct {
	ID          uint             `gorm:"primaryKey" json:"id"`
	Code        string           `gorm:"uniqueIndex;not null" json:"code"`
	Name        string           `json:"name"`
	BaseVolume  int              `json:"base_volume"`
	OptInRate   float64          `json:"opt_in_rate"`
	WADelivery  float64          `json:"wa_delivery"`
	SMSDelivery float64          `json:"sms_delivery"`
	Steps       json.RawMessage  `gorm:"type:jsonb;default:'[]'" json:"steps"`
	Category    *string          `json:"category"`
	Owner       *string          `json:"owner"`
	Status      string           `gorm:"default:pending" json:"status"`
	ApprovedBy  *string          `json:"approved_by"`
	ApprovedAt  *time.Time       `json:"approved_at"`
	CreatedAt   time.Time        `json:"created_at"`
	UpdatedAt   time.Time        `json:"updated_at"`
}
