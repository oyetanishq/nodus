package database

import (
	"log"
	"path/filepath"

	"os"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	dir, _ := os.Getwd()
	dbPath := filepath.Join(dir, "test.db")
	
    db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
    if err != nil {
        log.Fatalf("Failed to connect to database: %v", err)
    }
    DB = db
}