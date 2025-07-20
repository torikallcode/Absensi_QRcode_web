package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"qrcode_absensi_backend/database"
	"qrcode_absensi_backend/models"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Hanya method POST yang diperbolehkan", http.StatusMethodNotAllowed)
		return
	}

	var user models.User
	body, _ := io.ReadAll(r.Body)
	json.Unmarshal(body, &user)

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	user.Password = string(hashedPassword)

	result := database.DB.Create(&user)
	if result.Error != nil {
		http.Error(w, "Email sudah digunakan", http.StatusBadRequest)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Register sukses"})
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Hanya method POST yang diperbolehkan", http.StatusMethodNotAllowed)
		return
	}

	var input models.User
	body, _ := io.ReadAll(r.Body)
	json.Unmarshal(body, &input)

	var user models.User
	database.DB.Where("name = ?", input.Name).First(&user)
	if user.ID == 0 {
		http.Error(w, "User tidak ditemukan", http.StatusUnauthorized)
		return
	}

	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password))
	if err != nil {
		http.Error(w, "Password salah", http.StatusUnauthorized)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":    user.ID,
		"name":  user.Name,
		"email": user.Email,
	})
}

func ProfileHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Hanya method GET yang diperbolehkan", http.StatusMethodNotAllowed)
		return
	}

	email := r.URL.Query().Get("email")
	if email == "" {
		http.Error(w, "Parameter email diperlukan", http.StatusBadRequest)
		return
	}

	email = strings.ToLower(email)
	var user models.User
	database.DB.Where("email = ?", email).First(&user)
	if user.ID == 0 {
		http.Error(w, "User tidak ditemukan", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":    user.ID,
		"name":  user.Name,
		"email": user.Email,
	})
}
