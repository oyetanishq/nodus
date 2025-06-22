package router

import (
	"github.com/oyetanishq/nodus/backend/controller"
	sessionRouter "github.com/oyetanishq/nodus/backend/router/session"

	"github.com/gin-gonic/gin"
)

func SetupHomeRoutes(r *gin.Engine) {
    homeGroup := r.Group("/")

	homeGroup.GET("/", controller.Home)

	sessionRouter.SetupSessionRoutes(homeGroup)
}