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
	database.InitDB()
    database.Migrate()

	if err := godotenv.Load(); err != nil {
        log.Println("No .env file found, relying on environment variables")
    }

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5174"},
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
