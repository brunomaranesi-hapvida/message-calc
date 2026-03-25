package repositories

import (
	"time"

	"github.com/maranesi/message-calc/api/internal/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type PricingRepository struct {
	db *gorm.DB
}

func NewPricingRepository(db *gorm.DB) *PricingRepository {
	return &PricingRepository{db: db}
}

func (r *PricingRepository) FindAll() ([]models.ProviderChannelPrice, error) {
	var prices []models.ProviderChannelPrice
	if err := r.db.Preload("Provider").Preload("Channel").
		Order("created_at DESC").Find(&prices).Error; err != nil {
		return nil, err
	}
	return prices, nil
}

func (r *PricingRepository) FindByID(id string) (*models.ProviderChannelPrice, error) {
	var price models.ProviderChannelPrice
	if err := r.db.Preload("Provider").Preload("Channel").
		First(&price, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &price, nil
}

func (r *PricingRepository) FindActivePrices() ([]models.ProviderChannelPrice, error) {
	var prices []models.ProviderChannelPrice
	today := time.Now().Format("2006-01-02")
	if err := r.db.Preload("Provider").Preload("Channel").
		Where("valid_from <= ? AND (valid_to IS NULL OR valid_to >= ?)", today, today).
		Order("valid_from DESC").
		Find(&prices).Error; err != nil {
		return nil, err
	}
	return prices, nil
}

func (r *PricingRepository) Create(price *models.ProviderChannelPrice) error {
	return r.db.Create(price).Error
}

func (r *PricingRepository) Update(price *models.ProviderChannelPrice) error {
	return r.db.Save(price).Error
}

// DefaultProviderConfig

type DefaultConfigRepository struct {
	db *gorm.DB
}

func NewDefaultConfigRepository(db *gorm.DB) *DefaultConfigRepository {
	return &DefaultConfigRepository{db: db}
}

func (r *DefaultConfigRepository) FindAll() ([]models.DefaultProviderConfig, error) {
	var configs []models.DefaultProviderConfig
	if err := r.db.Preload("Channel").Preload("Provider").Find(&configs).Error; err != nil {
		return nil, err
	}
	return configs, nil
}

func (r *DefaultConfigRepository) Upsert(config *models.DefaultProviderConfig) error {
	return r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "channel_id"}},
		DoUpdates: clause.AssignmentColumns([]string{"provider_id", "updated_at"}),
	}).Create(config).Error
}
