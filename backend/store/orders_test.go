package store

import "testing"

func TestCanMove(t *testing.T) {
	cases := []struct {
		from, to string
		want     bool
	}{
		{"pending", "paid", true},
		{"pending", "cancelled", true},
		{"paid", "shipped", true},
		{"shipped", "done", true},
		{"pending", "done", false},      // ข้ามขั้นไม่ได้
		{"shipped", "cancelled", false}, // ส่งแล้วยกเลิกไม่ได้
		{"done", "pending", false},      // จบแล้วย้อนไม่ได้
		{"cancelled", "paid", false},
	}
	for _, c := range cases {
		if got := canMove(c.from, c.to); got != c.want {
			t.Errorf("canMove(%s, %s) = %v ต้องได้ %v", c.from, c.to, got, c.want)
		}
	}
}
