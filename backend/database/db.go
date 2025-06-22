package database

import (
	"log"

	// "fmt"
	// "os"

	// "gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	// host := os.Getenv("DB_HOST")
    // user := os.Getenv("DB_USERNAME")
    // password := os.Getenv("DB_PASSWORD")
    // dbname := os.Getenv("DB_DBNAME")
    // port := os.Getenv("DB_PORT")
    // sslmode := os.Getenv("DB_SSLMODE")

    // if host == "" || user == "" || password == "" || dbname == "" || port == "" || sslmode == "" {
    //     fmt.Println("One or more environment variables are missing.")
    //     return
    // }

    // dsn := fmt.Sprintf(
    //     "host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
    //     host, user, password, dbname, port, sslmode,
    // )

    db, err := gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
    if err != nil {
        log.Fatalf("Failed to connect to database: %v", err)
    }
    DB = db
}