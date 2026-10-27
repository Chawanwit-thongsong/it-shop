/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // ชุดสีของร้าน: ขาว/เทาเย็นแบบเคาน์เตอร์ร้านไอที + น้ำเงินโคบอลต์สำหรับปุ่มและลิงก์
      colors: {
        ink: '#15181C',
        muted: '#626A73',
        line: '#E3E5E1',
        plate: '#F2F3EF',
        accent: { DEFAULT: '#2447C2', dark: '#1B3699', soft: '#EAEFFC' },
      },
      fontFamily: { sans: ['"IBM Plex Sans Thai"', 'system-ui', 'sans-serif'] },
      borderRadius: { plate: '14px' },
    },
  },
  plugins: [],
};
