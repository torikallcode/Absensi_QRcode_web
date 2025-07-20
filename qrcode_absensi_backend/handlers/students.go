package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"qrcode_absensi_backend/database"
	"qrcode_absensi_backend/models"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
)

func GetAllStudents(w http.ResponseWriter, r *http.Request) {
	var students []models.Student
	database.DB.Find(&students)

	// fmt.Println("Data dari database:", students)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(students)
	fmt.Println("Data dari database:", students)
}

func CreateStudent(w http.ResponseWriter, r *http.Request) {
	var student models.Student
	if err := json.NewDecoder(r.Body).Decode(&student); err != nil {
		http.Error(w, "Data tidak valid", http.StatusBadRequest)
		return
	}
	database.DB.Create(&student)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(student)
}

// PUT /api/students/{id}
func UpdateStudent(w http.ResponseWriter, r *http.Request) {
	id := extractID(r.URL.Path)
	if id == 0 {
		http.Error(w, "ID tidak valid", http.StatusBadRequest)
		return
	}

	var student models.Student
	if err := database.DB.First(&student, id).Error; err != nil {
		http.Error(w, "Siswa tidak ditemukan", http.StatusNotFound)
		return
	}

	var updatedData models.Student
	if err := json.NewDecoder(r.Body).Decode(&updatedData); err != nil {
		http.Error(w, "Data tidak valid", http.StatusBadRequest)
		return
	}

	student.Name = updatedData.Name
	student.NIS = updatedData.NIS
	student.Class = updatedData.Class
	student.Phone = updatedData.Phone
	student.QRCode = updatedData.QRCode

	database.DB.Save(&student)
	json.NewEncoder(w).Encode(student)
}

// DELETE /api/students/{id}
// func DeleteStudent(w http.ResponseWriter, r *http.Request) {
// 	id := extractID(r.URL.Path)
// 	if id == 0 {
// 		http.Error(w, "ID tidak valid", http.StatusBadRequest)
// 		return
// 	}
// 	database.DB.Delete(&models.Student{}, id)
// 	w.WriteHeader(http.StatusNoContent)
// }

// Helper untuk ambil ID dari path URL
func extractID(path string) int {
	parts := strings.Split(path, "/")
	if len(parts) < 3 {
		return 0
	}
	id, err := strconv.Atoi(parts[len(parts)-1])
	if err != nil {
		return 0
	}
	return id
}

func DeleteStudent(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Ambil ID dari URL
	params := mux.Vars(r)
	idStr := params["id"]
	studentID, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "ID tidak valid", http.StatusBadRequest)
		return
	}

	// Cek apakah ada absensi terkait
	var count int64
	err = database.DB.Model(&models.Attendance{}).Where("student_id = ?", studentID).Count(&count).Error
	if err != nil {
		http.Error(w, "Gagal memeriksa absensi siswa", http.StatusInternalServerError)
		return
	}

	if count > 0 {
		http.Error(w, "Tidak bisa menghapus. Siswa masih memiliki data absensi.", http.StatusBadRequest)
		return
	}

	// Hapus siswa
	err = database.DB.Delete(&models.Student{}, studentID).Error
	if err != nil {
		http.Error(w, "Gagal menghapus siswa", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Siswa berhasil dihapus",
	})
}
