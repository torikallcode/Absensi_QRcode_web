package main

import (
	"log"
	"net/http"
	"qrcode_absensi_backend/database"
	"qrcode_absensi_backend/handlers"
	"qrcode_absensi_backend/models"
)

func enableCORS(w http.ResponseWriter, r *http.Request) {
	origin := r.Header.Get("Origin")

	// Tambahkan origin yang kamu izinkan
	allowedOrigins := map[string]bool{
		"http://localhost:5173":                       true,
		"https://5325-140-213-187-100.ngrok-free.app": true, // Ganti dengan domain ngrok milikmu
	}

	if allowedOrigins[origin] {
		w.Header().Set("Access-Control-Allow-Origin", origin)
	}

	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

func main() {
	database.Connect()

	// AutoMigrate untuk membuat tabel
	database.DB.AutoMigrate(&models.Student{}, &models.Attendance{}, &models.User{})

	// Endpoint: /api/scan (POST)
	http.HandleFunc("/api/scan", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w, r)
		if r.Method == http.MethodOptions {
			return
		}
		handlers.ScanHandler(w, r)
	})

	// Endpoint: /api/students (GET)
	// Endpoint: /api/students (GET & POST)
	http.HandleFunc("/api/students", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w, r)
		if r.Method == http.MethodOptions {
			return
		}
		if r.Method == http.MethodPost {
			handlers.CreateStudent(w, r)
			return
		}
		handlers.GetAllStudents(w, r)
	})

	// Endpoint: /api/students/{id} (PUT & DELETE)
	http.HandleFunc("/api/students/", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w, r)
		if r.Method == http.MethodOptions {
			return
		}
		if r.Method == http.MethodPut {
			handlers.UpdateStudent(w, r)
			return
		}
		if r.Method == http.MethodDelete {
			handlers.DeleteStudent(w, r)
			return
		}
		http.Error(w, "Metode tidak diizinkan", http.StatusMethodNotAllowed)
	})

	http.HandleFunc("/api/attendances", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w, r)
		if r.Method == http.MethodOptions {
			return
		}
		handlers.GetAttendancesByClass(w, r)
	})

		// Endpoint: /api/register (POST)
	http.HandleFunc("/api/register", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w, r)
		if r.Method == http.MethodOptions {
			return
		}
		if r.Method == http.MethodPost {
			handlers.RegisterHandler(w, r)
			return
		}
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
	})

	// Endpoint: /api/login (POST)
	http.HandleFunc("/api/login", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w, r)
		if r.Method == http.MethodOptions {
			return
		}
		if r.Method == http.MethodPost {
			handlers.LoginHandler(w, r)
			return
		}
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
	})


	// Server jalan
	port := ":8080"
	log.Println("Server running on http://localhost" + port)
	err := http.ListenAndServe(port, nil)
	if err != nil {
		log.Fatalf("Gagal menjalankan server: %v", err)
	}
}
