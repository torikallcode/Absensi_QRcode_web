package models

import "time"

type Attendance struct {
	ID        uint      `gorm:"primaryKey"`
	StudentID uint
	Student   Student   `gorm:"foreignKey:StudentID"`
	ScanTime  time.Time `gorm:"column:scan_time"`
}
