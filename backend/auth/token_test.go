package auth

import (
	"testing"
	"time"
)

func TestIssueAndParse(t *testing.T) {
	iss := &Issuer{Secret: []byte("test-secret-ที่ยาวพอสำหรับการทดสอบ-1234"), TTL: time.Hour}
	tok, err := iss.Issue(42, "admin")
	if err != nil {
		t.Fatal(err)
	}
	id, role, err := iss.Parse(tok)
	if err != nil || id != 42 || role != "admin" {
		t.Fatalf("ได้ id=%d role=%q err=%v", id, role, err)
	}
}

func TestParseRejectsWrongSecret(t *testing.T) {
	a := &Issuer{Secret: []byte("secret-a-secret-a-secret-a-secret-a"), TTL: time.Hour}
	b := &Issuer{Secret: []byte("secret-b-secret-b-secret-b-secret-b"), TTL: time.Hour}
	tok, _ := a.Issue(1, "member")
	if _, _, err := b.Parse(tok); err == nil {
		t.Fatal("token ที่เซ็นด้วย secret อื่นต้องไม่ผ่าน")
	}
}

func TestParseRejectsExpired(t *testing.T) {
	iss := &Issuer{Secret: []byte("secret-secret-secret-secret-secret"), TTL: -time.Minute}
	tok, _ := iss.Issue(1, "member")
	if _, _, err := iss.Parse(tok); err == nil {
		t.Fatal("token หมดอายุต้องไม่ผ่าน")
	}
}

func TestPassword(t *testing.T) {
	hash, err := HashPassword("hunter2hunter2")
	if err != nil {
		t.Fatal(err)
	}
	if !CheckPassword(hash, "hunter2hunter2") {
		t.Fatal("รหัสถูกต้องต้องผ่าน")
	}
	if CheckPassword(hash, "wrong-password") {
		t.Fatal("รหัสผิดต้องไม่ผ่าน")
	}
}
