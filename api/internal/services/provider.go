package services

import (
	"github.com/maranesi/message-calc/api/internal/models"
	"github.com/maranesi/message-calc/api/internal/repositories"
)

type ProviderService struct {
	providerRepo *repositories.ProviderRepository
}

func NewProviderService(providerRepo *repositories.ProviderRepository) *ProviderService {
	return &ProviderService{providerRepo: providerRepo}
}

func (s *ProviderService) List() ([]models.Provider, error) {
	return s.providerRepo.FindAll()
}

func (s *ProviderService) Get(id string) (*models.Provider, error) {
	return s.providerRepo.FindByID(id)
}

func (s *ProviderService) Create(provider *models.Provider) error {
	provider.IsActive = true
	return s.providerRepo.Create(provider)
}

func (s *ProviderService) Update(id string, name string, isActive bool) (*models.Provider, error) {
	provider, err := s.providerRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	provider.Name = name
	provider.IsActive = isActive
	if err := s.providerRepo.Update(provider); err != nil {
		return nil, err
	}
	return provider, nil
}

func (s *ProviderService) Delete(id string) error {
	return s.providerRepo.Delete(id)
}
