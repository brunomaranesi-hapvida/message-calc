package models

import "time"

type CalculatorConfig struct {
	ID                          string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	DefaultPeopleReached        int       `gorm:"default:100000" json:"default_people_reached"`
	DefaultStartMonth           int       `gorm:"default:1" json:"default_start_month"`
	DefaultOptInRate            float64   `gorm:"type:decimal(5,4);default:0.7" json:"default_opt_in_rate"`
	DefaultWhatsappDeliveryRate float64   `gorm:"type:decimal(5,4);default:0.95" json:"default_whatsapp_delivery_rate"`
	DefaultSmsDeliveryRate      float64   `gorm:"type:decimal(5,4);default:0.9" json:"default_sms_delivery_rate"`
	CreatedAt                   time.Time `json:"created_at"`
	UpdatedAt                   time.Time `json:"updated_at"`
}
