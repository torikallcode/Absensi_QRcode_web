package models

type Student struct {
	ID     uint   `gorm:"primaryKey" json:"id"`
	Name   string `json:"name"`
	NIS    string `gorm:"type:varchar(100);unique" json:"nis"`
	Class  string `json:"class"`
	Phone  string `json:"phone"`
	QRCode string `gorm:"column:qr_code;type:varchar(100)" json:"qr_code"`
}
