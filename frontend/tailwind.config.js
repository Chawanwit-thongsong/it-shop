/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  darkMode: 'class', // เปิด dark mode ด้วย class "dark" ที่ <html> (ปุ่มสลับบน Navbar)
  theme: {
    extend: {
      // ชุดสีของร้าน: ค่าจริงอยู่ใน index.css เป็นตัวแปร CSS แยกโหมดสว่าง/มืด
      // ink = สีตัวหนังสือหลัก (สลับตามโหมด), night = ดำคงที่ (หัวเว็บ/ตัวหนังสือบนปุ่มส้ม)
      colors: {
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        plate: 'rgb(var(--plate) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        night: '#141414',
        coal: '#232323',
        accent: {
          DEFAULT: '#FF6A13',
          hover: '#F25A00',
          dark: 'rgb(var(--accent-text) / <alpha-value>)',
          soft: 'rgb(var(--accent-soft) / <alpha-value>)',
        },
      },
      fontFamily: { sans: ['"IBM Plex Sans Thai"', 'system-ui', 'sans-serif'] },
      borderRadius: { plate: '14px' },
    },
  },
  plugins: [],
};
