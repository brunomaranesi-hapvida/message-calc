package database

import (
	"log"
	"time"

	"github.com/maranesi/message-calc/api/internal/models"
	"gorm.io/gorm"
)

type seedPrice struct {
	providerName string
	channelCode  string
	price        float64
}

func SeedDefaults(db *gorm.DB) {
	var channelCount int64
	db.Model(&models.Channel{}).Count(&channelCount)
	if channelCount > 0 {
		return
	}

	log.Println("seeding default channels, providers, prices, and config...")

	channels := []models.Channel{
		{Name: "SMS", Code: "SMS", IsActive: true},
		{Name: "RCS", Code: "RCS", IsActive: true},
		{Name: "HSM - Marketing", Code: "HSM_MARKETING", IsActive: true},
		{Name: "HSM - Utility", Code: "HSM_UTILITY", IsActive: true},
		{Name: "Email", Code: "EMAIL", IsActive: true},
		{Name: "Push Notification", Code: "PUSH_NOTIFICATION", IsActive: true},
	}
	db.Create(&channels)

	providers := []models.Provider{
		{Name: "Zenvia", IsActive: true},
		{Name: "Twilio", IsActive: true},
		{Name: "Gupshup", IsActive: true},
		{Name: "Health ID", IsActive: true},
		{Name: "Sapios", IsActive: true},
		{Name: "Docusign", IsActive: true},
		{Name: "ASC", IsActive: true},
		{Name: "Salesforce", IsActive: true},
		{Name: "Interaxa", IsActive: true},
		{Name: "Bemobi", IsActive: true},
	}
	db.Create(&providers)

	channelMap := make(map[string]string)
	for _, c := range channels {
		channelMap[c.Code] = c.ID
	}
	providerMap := make(map[string]string)
	for _, p := range providers {
		providerMap[p.Name] = p.ID
	}

	seedPrices := []seedPrice{
		{"Zenvia", "SMS", 0.065}, {"Twilio", "SMS", 0.07}, {"Gupshup", "SMS", 0.06}, {"Health ID", "SMS", 0.055}, {"Sapios", "SMS", 0.058}, {"Docusign", "SMS", 0.08}, {"ASC", "SMS", 0.062}, {"Salesforce", "SMS", 0.075}, {"Interaxa", "SMS", 0.068}, {"Bemobi", "SMS", 0.059},
		{"Zenvia", "RCS", 0.08}, {"Twilio", "RCS", 0.09}, {"Gupshup", "RCS", 0.075}, {"Health ID", "RCS", 0.07}, {"Sapios", "RCS", 0.072}, {"Docusign", "RCS", 0.095}, {"ASC", "RCS", 0.078}, {"Salesforce", "RCS", 0.088}, {"Interaxa", "RCS", 0.082}, {"Bemobi", "RCS", 0.074},
		{"Zenvia", "HSM_MARKETING", 0.052}, {"Twilio", "HSM_MARKETING", 0.055}, {"Gupshup", "HSM_MARKETING", 0.048}, {"Health ID", "HSM_MARKETING", 0.045}, {"Sapios", "HSM_MARKETING", 0.047}, {"Docusign", "HSM_MARKETING", 0.06}, {"ASC", "HSM_MARKETING", 0.05}, {"Salesforce", "HSM_MARKETING", 0.058}, {"Interaxa", "HSM_MARKETING", 0.053}, {"Bemobi", "HSM_MARKETING", 0.046},
		{"Zenvia", "HSM_UTILITY", 0.035}, {"Twilio", "HSM_UTILITY", 0.038}, {"Gupshup", "HSM_UTILITY", 0.032}, {"Health ID", "HSM_UTILITY", 0.03}, {"Sapios", "HSM_UTILITY", 0.031}, {"Docusign", "HSM_UTILITY", 0.042}, {"ASC", "HSM_UTILITY", 0.034}, {"Salesforce", "HSM_UTILITY", 0.04}, {"Interaxa", "HSM_UTILITY", 0.036}, {"Bemobi", "HSM_UTILITY", 0.029},
		{"Zenvia", "EMAIL", 0.005}, {"Twilio", "EMAIL", 0.006}, {"Gupshup", "EMAIL", 0.0045}, {"Health ID", "EMAIL", 0.004}, {"Sapios", "EMAIL", 0.0042}, {"Docusign", "EMAIL", 0.007}, {"ASC", "EMAIL", 0.0048}, {"Salesforce", "EMAIL", 0.0055}, {"Interaxa", "EMAIL", 0.005}, {"Bemobi", "EMAIL", 0.0038},
		{"Zenvia", "PUSH_NOTIFICATION", 0.002}, {"Twilio", "PUSH_NOTIFICATION", 0.0025}, {"Gupshup", "PUSH_NOTIFICATION", 0.0018}, {"Health ID", "PUSH_NOTIFICATION", 0.0015}, {"Sapios", "PUSH_NOTIFICATION", 0.0016}, {"Docusign", "PUSH_NOTIFICATION", 0.003}, {"ASC", "PUSH_NOTIFICATION", 0.0019}, {"Salesforce", "PUSH_NOTIFICATION", 0.0022}, {"Interaxa", "PUSH_NOTIFICATION", 0.002}, {"Bemobi", "PUSH_NOTIFICATION", 0.0014},
	}

	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
	var prices []models.ProviderChannelPrice
	for _, sp := range seedPrices {
		prices = append(prices, models.ProviderChannelPrice{
			ProviderID: providerMap[sp.providerName],
			ChannelID:  channelMap[sp.channelCode],
			Price:      sp.price,
			ValidFrom:  today,
		})
	}
	db.Create(&prices)

	zenviaID := providerMap["Zenvia"]
	var configs []models.DefaultProviderConfig
	for _, c := range channels {
		configs = append(configs, models.DefaultProviderConfig{
			ChannelID:  c.ID,
			ProviderID: zenviaID,
		})
	}
	db.Create(&configs)

	var calcCfgCount int64
	db.Model(&models.CalculatorConfig{}).Count(&calcCfgCount)
	if calcCfgCount == 0 {
		db.Create(&models.CalculatorConfig{
			DefaultPeopleReached:        100000,
			DefaultStartMonth:           1,
			DefaultOptInRate:            0.7,
			DefaultWhatsappDeliveryRate: 0.95,
			DefaultSmsDeliveryRate:      0.9,
		})
	}

	log.Println("seed complete")
}
