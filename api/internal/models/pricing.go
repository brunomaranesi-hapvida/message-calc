package models

import "time"

type ProviderChannelPrice struct {
	ID         string     `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	ProviderID string     `gorm:"type:uuid;not null" json:"provider_id"`
	ChannelID  string     `gorm:"type:uuid;not null" json:"channel_id"`
	Price      float64    `gorm:"type:decimal(10,6);not null" json:"price"`
	ValidFrom  time.Time  `gorm:"type:date;not null;default:CURRENT_DATE" json:"valid_from"`
	ValidTo    *time.Time `gorm:"type:date" json:"valid_to"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`

	Provider Provider `gorm:"foreignKey:ProviderID" json:"provider,omitempty"`
	Channel  Channel  `gorm:"foreignKey:ChannelID" json:"channel,omitempty"`
}

type DefaultProviderConfig struct {
	ID         string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	ChannelID  string    `gorm:"type:uuid;uniqueIndex;not null" json:"channel_id"`
	ProviderID string    `gorm:"type:uuid;not null" json:"provider_id"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`

	Channel  Channel  `gorm:"foreignKey:ChannelID" json:"channel,omitempty"`
	Provider Provider `gorm:"foreignKey:ProviderID" json:"provider,omitempty"`
}
