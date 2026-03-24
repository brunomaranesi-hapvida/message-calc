package repositories

import (
	"github.com/maranesi/message-calc/api/internal/models"
	"gorm.io/gorm"
)

type JourneyRepository struct {
	db *gorm.DB
}

func NewJourneyRepository(db *gorm.DB) *JourneyRepository {
	return &JourneyRepository{db: db}
}

func (r *JourneyRepository) FindAll() ([]models.Journey, error) {
	var journeys []models.Journey
	if err := r.db.Order("created_at DESC").Find(&journeys).Error; err != nil {
		return nil, err
	}
	return journeys, nil
}

func (r *JourneyRepository) FindByCode(code string) (*models.Journey, error) {
	var journey models.Journey
	if err := r.db.Where("code = ?", code).First(&journey).Error; err != nil {
		return nil, err
	}
	return &journey, nil
}

func (r *JourneyRepository) Create(journey *models.Journey) error {
	return r.db.Create(journey).Error
}

func (r *JourneyRepository) Update(journey *models.Journey) error {
	return r.db.Save(journey).Error
}

func (r *JourneyRepository) DeleteByCode(code string) error {
	result := r.db.Where("code = ?", code).Delete(&models.Journey{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}
