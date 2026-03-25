package repositories

import (
	"github.com/maranesi/message-calc/api/internal/models"
	"gorm.io/gorm"
)

type CalculatorConfigRepository struct {
	db *gorm.DB
}

func NewCalculatorConfigRepository(db *gorm.DB) *CalculatorConfigRepository {
	return &CalculatorConfigRepository{db: db}
}

func (r *CalculatorConfigRepository) Get() (*models.CalculatorConfig, error) {
	var cfg models.CalculatorConfig
	if err := r.db.First(&cfg).Error; err != nil {
		return nil, err
	}
	return &cfg, nil
}

func (r *CalculatorConfigRepository) Upsert(cfg *models.CalculatorConfig) error {
	var existing models.CalculatorConfig
	err := r.db.First(&existing).Error
	if err == gorm.ErrRecordNotFound {
		return r.db.Create(cfg).Error
	}
	if err != nil {
		return err
	}
	cfg.ID = existing.ID
	return r.db.Save(cfg).Error
}
