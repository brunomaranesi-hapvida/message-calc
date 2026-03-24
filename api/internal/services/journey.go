package services

import (
	"crypto/rand"
	"errors"
	"time"

	"github.com/maranesi/message-calc/api/internal/models"
	"github.com/maranesi/message-calc/api/internal/repositories"
	"github.com/oklog/ulid/v2"
)

type JourneyService struct {
	journeyRepo *repositories.JourneyRepository
}

func NewJourneyService(journeyRepo *repositories.JourneyRepository) *JourneyService {
	return &JourneyService{journeyRepo: journeyRepo}
}

func (s *JourneyService) ListJourneys() ([]models.Journey, error) {
	return s.journeyRepo.FindAll()
}

func (s *JourneyService) GetJourney(code string) (*models.Journey, error) {
	return s.journeyRepo.FindByCode(code)
}

func (s *JourneyService) CreateJourney(journey *models.Journey) error {
	journey.Code = ulid.MustNew(ulid.Timestamp(time.Now()), rand.Reader).String()
	journey.Status = "pending"
	journey.ApprovedBy = nil
	journey.ApprovedAt = nil
	return s.journeyRepo.Create(journey)
}

func (s *JourneyService) ApproveJourney(code string, approvedBy string) (*models.Journey, error) {
	journey, err := s.journeyRepo.FindByCode(code)
	if err != nil {
		return nil, err
	}
	if journey.Status != "pending" {
		return nil, errors.New("only pending journeys can be approved")
	}
	now := time.Now()
	journey.Status = "approved"
	journey.ApprovedBy = &approvedBy
	journey.ApprovedAt = &now
	if err := s.journeyRepo.Update(journey); err != nil {
		return nil, err
	}
	return journey, nil
}

func (s *JourneyService) RejectJourney(code string, rejectedBy string) (*models.Journey, error) {
	journey, err := s.journeyRepo.FindByCode(code)
	if err != nil {
		return nil, err
	}
	if journey.Status != "pending" {
		return nil, errors.New("only pending journeys can be rejected")
	}
	journey.Status = "rejected"
	journey.ApprovedBy = &rejectedBy
	if err := s.journeyRepo.Update(journey); err != nil {
		return nil, err
	}
	return journey, nil
}

func (s *JourneyService) DeleteJourney(code string) error {
	return s.journeyRepo.DeleteByCode(code)
}
