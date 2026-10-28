// พื้นหลังลายอุปกรณ์ไอที (public/img/bg.jpg) ทับด้วยชั้นสีดำโปร่งแสง
// alpha ยิ่งมาก ยิ่งทึบ ตัวหนังสือยิ่งอ่านง่าย (รูปลายเยอะ แนะนำ 0.75 ขึ้นไป)
// ใส่ alphaBottom ถ้าอยากให้ด้านล่างเข้มกว่าด้านบน (ไว้รองข้อความที่อยู่ด้านล่าง)
export function patternBg(alpha, alphaBottom = alpha) {
  const top = `rgba(20, 20, 20, ${alpha})`;
  const bottom = `rgba(20, 20, 20, ${alphaBottom})`;
  return {
    backgroundImage: `linear-gradient(${top}, ${bottom}), url('/img/bg.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };
}
