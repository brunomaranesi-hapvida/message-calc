package database

import (
	"github.com/maranesi/message-calc/api/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Init(databaseURL string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	if err := db.AutoMigrate(
		&models.User{},
		&models.Journey{},
		&models.Channel{},
		&models.Provider{},
		&models.ProviderChannelPrice{},
		&models.DefaultProviderConfig{},
		&models.CalculatorConfig{},
	); err != nil {
		return nil, err
	}

	return db, nil
}
