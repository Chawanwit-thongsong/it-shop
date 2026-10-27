/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // ชุดสีของร้าน: ดำ (ink) เป็นโครงหลัก + ส้มเป็นสีปุ่มหลักและจุดเน้น
      colors: {
        ink: '#141414',
        coal: '#232323',
        muted: '#6B6B6B',
        line: '#E6E4E1',
        plate: '#F4F3F1',
        accent: { DEFAULT: '#FF6A13', dark: '#B84A0B', soft: '#FFF0E6', hover: '#F25A00' },
      },
      fontFamily: { sans: ['"IBM Plex Sans Thai"', 'system-ui', 'sans-serif'] },
      borderRadius: { plate: '14px' },
    },
  },
  plugins: [],
};
