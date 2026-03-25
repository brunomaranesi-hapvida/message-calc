package repositories

import (
	"github.com/maranesi/message-calc/api/internal/models"
	"gorm.io/gorm"
)

type ProviderRepository struct {
	db *gorm.DB
}

func NewProviderRepository(db *gorm.DB) *ProviderRepository {
	return &ProviderRepository{db: db}
}

func (r *ProviderRepository) FindAll() ([]models.Provider, error) {
	var providers []models.Provider
	if err := r.db.Order("name ASC").Find(&providers).Error; err != nil {
		return nil, err
	}
	return providers, nil
}

func (r *ProviderRepository) FindActive() ([]models.Provider, error) {
	var providers []models.Provider
	if err := r.db.Where("is_active = ?", true).Order("name ASC").Find(&providers).Error; err != nil {
		return nil, err
	}
	return providers, nil
}

func (r *ProviderRepository) FindByID(id string) (*models.Provider, error) {
	var provider models.Provider
	if err := r.db.First(&provider, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &provider, nil
}

func (r *ProviderRepository) Create(provider *models.Provider) error {
	return r.db.Create(provider).Error
}

func (r *ProviderRepository) Update(provider *models.Provider) error {
	return r.db.Save(provider).Error
}

func (r *ProviderRepository) Delete(id string) error {
	result := r.db.Delete(&models.Provider{}, "id = ?", id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return nil
}

func (r *ProviderRepository) Count() (int64, error) {
	var count int64
	err := r.db.Model(&models.Provider{}).Count(&count).Error
	return count, err
}
