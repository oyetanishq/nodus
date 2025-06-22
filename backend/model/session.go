package model

import "time"

type Session struct {
	ID          string `gorm:"primaryKey;not null" json:"id" binding:"required,len=6"`
	FeatureType string `gorm:"not null" json:"feature_type" binding:"required,oneof=video-call share-file"`
	Peer1       string `json:"peer1"`
	Peer2       string `json:"peer2"`
	CreatedAt   time.Time `grom:"autoCreateTime"`
}
