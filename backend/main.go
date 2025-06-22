package main

import (
	"log"

	"github.com/oyetanishq/nodus/backend/database"
	"github.com/oyetanishq/nodus/backend/router"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load("../.env"); err != nil {
        log.Println("No .env file found, relying on environment variables")
    }

	database.InitDB()
    database.Migrate()

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

    router.SetupHomeRoutes(r)

    if err := r.Run("localhost:3000"); err != nil {
        log.Fatalf("Failed to run server: %v", err)
    }
}
