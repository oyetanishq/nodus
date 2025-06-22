package database

import (
	"log"

	"github.com/oyetanishq/nodus/backend/model"
)

func Migrate() {
    err := DB.AutoMigrate(&model.Session{})
    if err != nil {
        log.Fatalf("Migration failed: %v", err)
    }
}