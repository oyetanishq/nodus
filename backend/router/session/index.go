package session

import (
	sessionController "github.com/oyetanishq/nodus/backend/controller/session"

	"github.com/gin-gonic/gin"
)

func SetupSessionRoutes(r *gin.RouterGroup) {
	sessionGroup := r.Group("session")
	{
		sessionGroup.GET("/", sessionController.Home)
		sessionGroup.GET("/all", sessionController.GetAll)
		sessionGroup.GET("/:id", sessionController.GetById)
		sessionGroup.POST("/unique", sessionController.CreateUniqueSession)
		sessionGroup.PUT("/:id", sessionController.UpdateById)
	}
}