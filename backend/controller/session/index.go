package session

import (
	"net/http"
	"strings"
	"unicode/utf8"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/oyetanishq/nodus/backend/database"
	"github.com/oyetanishq/nodus/backend/model"
)

func Home (c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{ "message": "GET /session", })
}

func CreateUniqueSession(c *gin.Context) {
	type input struct {
		FeatureType string `json:"feature_type" binding:"required,oneof=video-call share-file"`
	}
	var sessionInput input
	if err := c.ShouldBindJSON(&sessionInput); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{ "error": err.Error() })
		return
	}

	var session model.Session = model.Session{
		ID: uuid.New().String()[:6],
		FeatureType: sessionInput.FeatureType,
	}

	if err := database.DB.Create(&session).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{ "error": "Failed to create unique session" })
		return
	}

	c.JSON(http.StatusCreated, session)
}

func GetAll(c *gin.Context) {
	var sessions []model.Session

	if err := database.DB.Find(&sessions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{ "error": "Failed to retrieve sessions" })
		return
	}

	c.JSON(http.StatusOK, sessions)
}

func GetById(c *gin.Context) {
	id := strings.ToLower(c.Param("id"))
	var session model.Session

	if utf8.RuneCountInString(id) != 6 {
		c.JSON(http.StatusBadRequest, gin.H{ "error": "Invalid session id format" })
		return
	}

	if err := database.DB.Where("id = ?", id).First(&session).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{ "error": "Session not found" })
		return
	}

	c.JSON(http.StatusOK, session)
}

func UpdateById(c*gin.Context) {
	id := strings.ToLower(c.Param("id"))
	var existingSession model.Session

	if err := database.DB.Where("id = ?", id).First(&existingSession).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{ "error": "Session not found" })
		return
	}

	type input struct {
		Peer1 string `json:"peer1"`
		Peer2 string `json:"peer2"`
	}
	var session input
	if err := c.ShouldBindJSON(&session); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{ "error": err.Error() })
		return
	}

	if err := database.DB.Model(&existingSession).Updates(session).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{ "error": "Failed to update session" })
		return
	}

	c.JSON(http.StatusOK, existingSession)
}
