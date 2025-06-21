package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"qrcode_absensi_backend/database"
	"qrcode_absensi_backend/models"
	"time"
)

type ScanRequest struct {
	QR string `json:"qr"` // pastikan frontend kirim key: "qr"
}

func ScanHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	var req ScanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.QR == "" {
		http.Error(w, "QR Code tidak valid", http.StatusBadRequest)
		return
	}

	fmt.Println("===> ScanHandler dipanggil")
	fmt.Println("QR diterima:", req.QR)

	// Cari siswa berdasarkan QR code
	var student models.Student
	result := database.DB.Where("qr_code = ?", req.QR).First(&student)
	if result.Error != nil {
		http.Error(w, "Siswa tidak ditemukan", http.StatusNotFound)
		return
	}

	fmt.Println("Siswa ditemukan:", student.Name)
	fmt.Println("Nomor WA:", student.Phone)

	// Simpan data absensi
	absen := models.Attendance{
		StudentID: student.ID,
		ScanTime:  time.Now(),
	}
	database.DB.Create(&absen)

	// Format pesan ke WhatsApp
	msg := fmt.Sprintf("✅ %s (%s) telah hadir pada %s",
		student.Name,
		student.Class,
		absen.ScanTime.Format("02 Jan 2006 15:04"))

	// Buat payload JSON
	payload := map[string]interface{}{
		"target":  student.Phone,
		"message": msg,
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		fmt.Println("Gagal marshal payload:", err)
		http.Error(w, "Payload error", http.StatusInternalServerError)
		return
	}

	fmt.Println("Payload yang dikirim ke Fonnte:", string(jsonPayload))

	// Kirim POST request ke Fonnte
	reqPost, err := http.NewRequest("POST", "https://api.fonnte.com/send", bytes.NewBuffer(jsonPayload))
	if err != nil {
		fmt.Println("Gagal membuat request:", err)
		http.Error(w, "Request gagal", http.StatusInternalServerError)
		return
	}

	reqPost.Header.Set("Authorization", os.Getenv("FONNTE_TOKEN"))
	reqPost.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(reqPost)
	if err != nil {
		fmt.Println("Gagal mengirim ke Fonnte:", err)
		http.Error(w, "Gagal kirim ke WhatsApp", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	fmt.Println("Status Fonnte:", resp.Status)

	var fonnteResp map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&fonnteResp)
	fmt.Println("Response Fonnte:", fonnteResp)

	// Cek status
	if resp.StatusCode != 200 || !fonnteResp["status"].(bool) {
		http.Error(w, "Gagal mengirim notifikasi WhatsApp", http.StatusInternalServerError)
		return
	}

	// Jika berhasil
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Absensi berhasil dan notifikasi telah dikirim",
	})
}
