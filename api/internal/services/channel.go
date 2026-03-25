package services

import (
	"github.com/maranesi/message-calc/api/internal/models"
	"github.com/maranesi/message-calc/api/internal/repositories"
)

type ChannelService struct {
	channelRepo *repositories.ChannelRepository
}

func NewChannelService(channelRepo *repositories.ChannelRepository) *ChannelService {
	return &ChannelService{channelRepo: channelRepo}
}

func (s *ChannelService) List() ([]models.Channel, error) {
	return s.channelRepo.FindAll()
}

func (s *ChannelService) Get(id string) (*models.Channel, error) {
	return s.channelRepo.FindByID(id)
}

func (s *ChannelService) Create(channel *models.Channel) error {
	channel.IsActive = true
	return s.channelRepo.Create(channel)
}

func (s *ChannelService) Update(id string, name, code string, isActive bool) (*models.Channel, error) {
	channel, err := s.channelRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	channel.Name = name
	channel.Code = code
	channel.IsActive = isActive
	if err := s.channelRepo.Update(channel); err != nil {
		return nil, err
	}
	return channel, nil
}

func (s *ChannelService) Delete(id string) error {
	return s.channelRepo.Delete(id)
}
