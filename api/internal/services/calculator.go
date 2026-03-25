package services

import (
	"github.com/maranesi/message-calc/api/internal/models"
	"github.com/maranesi/message-calc/api/internal/repositories"
)

type CalculatorDefaults struct {
	PeopleReached        int     `json:"people_reached"`
	StartMonth           int     `json:"start_month"`
	OptInRate            float64 `json:"opt_in_rate"`
	WhatsappDeliveryRate float64 `json:"whatsapp_delivery_rate"`
	SmsDeliveryRate      float64 `json:"sms_delivery_rate"`
}

type CalculatorConfigResponse struct {
	Channels         []string                      `json:"channels"`
	Providers        []string                      `json:"providers"`
	DefaultProviders map[string]string             `json:"default_providers"`
	Prices           map[string]map[string]float64 `json:"prices"`
	Defaults         CalculatorDefaults             `json:"defaults"`
}

type CalculatorService struct {
	channelRepo  *repositories.ChannelRepository
	providerRepo *repositories.ProviderRepository
	pricingRepo  *repositories.PricingRepository
	configRepo   *repositories.DefaultConfigRepository
	calcCfgRepo  *repositories.CalculatorConfigRepository
}

func NewCalculatorService(
	channelRepo *repositories.ChannelRepository,
	providerRepo *repositories.ProviderRepository,
	pricingRepo *repositories.PricingRepository,
	configRepo *repositories.DefaultConfigRepository,
	calcCfgRepo *repositories.CalculatorConfigRepository,
) *CalculatorService {
	return &CalculatorService{
		channelRepo:  channelRepo,
		providerRepo: providerRepo,
		pricingRepo:  pricingRepo,
		configRepo:   configRepo,
		calcCfgRepo:  calcCfgRepo,
	}
}

func (s *CalculatorService) GetConfig() (*CalculatorConfigResponse, error) {
	channels, err := s.channelRepo.FindActive()
	if err != nil {
		return nil, err
	}

	providers, err := s.providerRepo.FindActive()
	if err != nil {
		return nil, err
	}

	activePrices, err := s.pricingRepo.FindActivePrices()
	if err != nil {
		return nil, err
	}

	defaults, err := s.configRepo.FindAll()
	if err != nil {
		return nil, err
	}

	calcCfg, err := s.calcCfgRepo.Get()
	if err != nil {
		calcCfg = &models.CalculatorConfig{
			DefaultPeopleReached:        100000,
			DefaultStartMonth:           1,
			DefaultOptInRate:            0.7,
			DefaultWhatsappDeliveryRate: 0.95,
			DefaultSmsDeliveryRate:      0.9,
		}
	}

	channelNames := make([]string, len(channels))
	for i, c := range channels {
		channelNames[i] = c.Name
	}

	providerNames := make([]string, len(providers))
	for i, p := range providers {
		providerNames[i] = p.Name
	}

	defaultProviders := make(map[string]string)
	for _, d := range defaults {
		defaultProviders[d.Channel.Name] = d.Provider.Name
	}

	prices := make(map[string]map[string]float64)
	seen := make(map[string]bool)
	for _, p := range activePrices {
		chName := p.Channel.Name
		prName := p.Provider.Name
		key := chName + "|" + prName
		if seen[key] {
			continue
		}
		seen[key] = true
		if prices[chName] == nil {
			prices[chName] = make(map[string]float64)
		}
		prices[chName][prName] = p.Price
	}

	return &CalculatorConfigResponse{
		Channels:         channelNames,
		Providers:        providerNames,
		DefaultProviders: defaultProviders,
		Prices:           prices,
		Defaults: CalculatorDefaults{
			PeopleReached:        calcCfg.DefaultPeopleReached,
			StartMonth:           calcCfg.DefaultStartMonth,
			OptInRate:            calcCfg.DefaultOptInRate,
			WhatsappDeliveryRate: calcCfg.DefaultWhatsappDeliveryRate,
			SmsDeliveryRate:      calcCfg.DefaultSmsDeliveryRate,
		},
	}, nil
}

func (s *CalculatorService) GetDefaults() (*models.CalculatorConfig, error) {
	return s.calcCfgRepo.Get()
}

func (s *CalculatorService) UpdateDefaults(cfg *models.CalculatorConfig) error {
	return s.calcCfgRepo.Upsert(cfg)
}
