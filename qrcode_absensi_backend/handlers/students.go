package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"qrcode_absensi_backend/database"
	"qrcode_absensi_backend/models"
)

func GetAllStudents(w http.ResponseWriter, r *http.Request) {
	var students []models.Student
	database.DB.Find(&students)

	// fmt.Println("Data dari database:", students)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(students)
	fmt.Println("Data dari database:", students)
}
