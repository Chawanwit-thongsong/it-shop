package auth

import "golang.org/x/crypto/bcrypt"

// HashPassword แปลงรหัสผ่านเป็น hash แบบ bcrypt ที่ย้อนกลับไม่ได้
func HashPassword(plain string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(plain), bcrypt.DefaultCost)
	return string(b), err
}

// CheckPassword ตอบว่ารหัสที่พิมพ์มาตรงกับ hash ที่เก็บไว้ไหม
func CheckPassword(hash, plain string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(plain)) == nil
}
