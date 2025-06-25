// handlers/attendance.go
package handlers

import (
	"encoding/json"
	"net/http"
	"qrcode_absensi_backend/database"
	"qrcode_absensi_backend/models"
	"time"
)

func GetAttendancesByClass(w http.ResponseWriter, r *http.Request) {
	class := r.URL.Query().Get("class")
	date := r.URL.Query().Get("date") // Format: YYYY-MM-DD

	var attendances []models.Attendance
	query := database.DB.Preload("Student").Order("scan_time DESC")

	if class != "" {
		query = query.Joins("JOIN students ON students.id = attendances.student_id").Where("students.class = ?", class)
	}

	if date != "" {
		start, _ := time.Parse("2006-01-02", date)
		end := start.Add(24 * time.Hour)
		query = query.Where("scan_time >= ? AND scan_time < ?", start, end)
	}

	if err := query.Find(&attendances).Error; err != nil {
		http.Error(w, "Gagal mengambil data", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(attendances)
}
