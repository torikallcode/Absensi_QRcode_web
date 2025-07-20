// handlers/attendance.go
package handlers

import (
	"encoding/json"
	"net/http"
	"qrcode_absensi_backend/database"
	"qrcode_absensi_backend/models"
	"time"
)

// handlers/attendance.go
func GetAttendancesByClass(w http.ResponseWriter, r *http.Request) {
	class := r.URL.Query().Get("class")
	dateStr := r.URL.Query().Get("date") // format: yyyy-mm-dd

	var results []models.Attendance

	query := database.DB.Model(&models.Attendance{}).Joins("JOIN students ON students.id = attendances.student_id")

	// Filter berdasarkan kelas (optional)
	if class != "" {
		query = query.Where("students.class = ?", class)
	}

	// Filter berdasarkan tanggal (optional)
	if dateStr != "" {
		date, err := time.Parse("2006-01-02", dateStr)
		if err == nil {
			start := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.Local)
			end := start.Add(24 * time.Hour)
			query = query.Where("scan_time >= ? AND scan_time < ?", start, end)
		}
	}

	// Subquery: Ambil hanya absensi pertama per siswa per hari
	sub := query.
		Select("MIN(attendances.id)").
		Group("DATE(scan_time), student_id")

	// Query utama
	database.DB.Preload("Student").
		Where("attendances.id IN (?)", sub).
		Order("scan_time asc").
		Find(&results)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}
