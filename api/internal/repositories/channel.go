package repositories

import (
	"github.com/maranesi/message-calc/api/internal/models"
	"gorm.io/gorm"
)

type ChannelRepository struct {
	db *gorm.DB
}

func NewChannelRepository(db *gorm.DB) *ChannelRepository {
	return &ChannelRepository{db: db}
}

func (r *ChannelRepository) FindAll() ([]models.Channel, error) {
	var channels []models.Channel
	if err := r.db.Order("name ASC").Find(&channels).Error; err != nil {
		return nil, err
	}
	return channels, nil
}

func (r *ChannelRepository) FindActive() ([]models.Channel, error) {
	var channels []models.Channel
	if err := r.db.Where("is_active = ?", true).Order("name ASC").Find(&channels).Error; err != nil {
		return nil, err
	}
	return channels, nil
}

func (r *ChannelRepository) FindByID(id string) (*models.Channel, error) {
	var channel models.Channel
	if err := r.db.First(&channel, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &channel, nil
}

func (r *ChannelRepository) Create(channel *models.Channel) error {
	return r.db.Create(channel).Error
}

func (r *ChannelRepository) Update(channel *models.Channel) error {
	return r.db.Save(channel).Error
}

func (r *ChannelRepository) Delete(id string) error {
	result := r.db.Delete(&models.Channel{}, "id = ?", id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *ChannelRepository) Count() (int64, error) {
	var count int64
	err := r.db.Model(&models.Channel{}).Count(&count).Error
	return count, err
}
