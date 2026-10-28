import { useEffect, useState } from 'react';

const THEME_KEY = 'itshop.theme';

// useTheme อ่าน/สลับโหมดสี ใส่ class "dark" ที่ <html> แล้วจำไว้ใน localStorage
// (index.html ตั้งค่าเริ่มต้นไว้ก่อนแล้ว hook นี้แค่อ่านสถานะปัจจุบันต่อ)
export function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
  }, [dark]);

  return { dark, toggle: () => setDark((d) => !d) };
}
