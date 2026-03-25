package services

import (
	"github.com/maranesi/message-calc/api/internal/models"
	"github.com/maranesi/message-calc/api/internal/repositories"
)

type PricingService struct {
	pricingRepo *repositories.PricingRepository
}

func NewPricingService(pricingRepo *repositories.PricingRepository) *PricingService {
	return &PricingService{pricingRepo: pricingRepo}
}

func (s *PricingService) List() ([]models.ProviderChannelPrice, error) {
	return s.pricingRepo.FindAll()
}

func (s *PricingService) Get(id string) (*models.ProviderChannelPrice, error) {
	return s.pricingRepo.FindByID(id)
}

func (s *PricingService) Create(price *models.ProviderChannelPrice) error {
	return s.pricingRepo.Create(price)
}

func (s *PricingService) Update(id string, price *models.ProviderChannelPrice) (*models.ProviderChannelPrice, error) {
	existing, err := s.pricingRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	existing.ProviderID = price.ProviderID
	existing.ChannelID = price.ChannelID
	existing.Price = price.Price
	existing.ValidFrom = price.ValidFrom
	existing.ValidTo = price.ValidTo
	if err := s.pricingRepo.Update(existing); err != nil {
		return nil, err
	}
	return existing, nil
}

func (s *PricingService) GetActivePrices() ([]models.ProviderChannelPrice, error) {
	return s.pricingRepo.FindActivePrices()
}

// DefaultConfigService

type DefaultConfigService struct {
	configRepo *repositories.DefaultConfigRepository
}

func NewDefaultConfigService(configRepo *repositories.DefaultConfigRepository) *DefaultConfigService {
	return &DefaultConfigService{configRepo: configRepo}
}

func (s *DefaultConfigService) List() ([]models.DefaultProviderConfig, error) {
	return s.configRepo.FindAll()
}

func (s *DefaultConfigService) Set(channelID, providerID string) error {
	config := &models.DefaultProviderConfig{
		ChannelID:  channelID,
		ProviderID: providerID,
	}
	return s.configRepo.Upsert(config)
}
