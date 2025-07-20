package repositories

import (
	"qrcode_absensi_backend/models"
	"time"

	"gorm.io/gorm"
)

type StudentRepository struct {
	DB *gorm.DB
}

func NewStudentRepository(db *gorm.DB) *StudentRepository {
	return &StudentRepository{DB: db}
}

func (r *StudentRepository) GetAll() ([]models.Student, error) {
	var students []models.Student
	result := r.DB.Find(&students)
	return students, result.Error
}

func (r *StudentRepository) Create(student *models.Student) error {
	result := r.DB.Create(student)
	return result.Error
}

func (r *StudentRepository) Update(student *models.Student) error {
	result := r.DB.Save(student)
	return result.Error
}

func (r *StudentRepository) Delete(id uint) error {
	result := r.DB.Delete(&models.Student{}, id)
	return result.Error
}

func (r *StudentRepository) FindByQRCode(qrCode string) (*models.Student, error) {
	var student models.Student
	result := r.DB.Where("qr_code = ?", qrCode).First(&student)
	return &student, result.Error
}

func (r *StudentRepository) RecordAttendance(studentID uint) error {
	attendance := models.Attendance{
		StudentID: studentID,
		ScanTime:  time.Now(),
	}
	result := r.DB.Create(&attendance)
	return result.Error
}

func (r *StudentRepository) GetAttendance(class string, date string) ([]models.Attendance, error) {
	var attendances []models.Attendance

	query := r.DB.Preload("Student").
		Joins("JOIN students ON students.id = attendances.student_id").
		Order("attendances.scan_time DESC")

	if class != "" {
		query = query.Where("students.class = ?", class)
	}

	if date != "" {
		query = query.Where("DATE(attendances.scan_time) = ?", date)
	}

	result := query.Find(&attendances)
	return attendances, result.Error
}
