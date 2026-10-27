import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../api/backend';

// เก็บสถานะ login ไว้กลางแอป Navbar, Cart, หน้า Admin ต้องรู้เหมือนกันหมดว่าใคร login อยู่
const AuthContext = createContext(null);

export const TOKEN_KEY = 'itshop.token';
export const MEMBER_KEY = 'itshop.member';

export function AuthProvider({ children }) {
  // อ่านค่าเดิมจาก localStorage จะได้ไม่หลุด login ตอน refresh
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [member, setMember] = useState(() => JSON.parse(localStorage.getItem(MEMBER_KEY) || 'null'));

  function saveMember(m) {
    setMember(m);
    localStorage.setItem(MEMBER_KEY, JSON.stringify(m));
  }

  async function login(email, password) {
    const data = await api.login(email, password); // ผิดจะ throw ให้หน้า Login แสดง error
    setToken(data.token);
    localStorage.setItem(TOKEN_KEY, data.token);
    saveMember(data.member);
  }

  async function register(email, password, displayName) {
    await api.register(email, password, displayName);
    await login(email, password); // สมัครเสร็จ login ให้เลย
  }

  function logout() {
    setToken(null);
    setMember(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(MEMBER_KEY);
  }

  // backend.js ส่งสัญญาณมาเมื่อ server ตอบ 401 (token หมดอายุ) -> logout อัตโนมัติ
  useEffect(() => {
    window.addEventListener('auth:expired', logout);
    return () => window.removeEventListener('auth:expired', logout);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- logout ใช้แค่ setState/localStorage ผูกครั้งเดียวพอ
  }, []);

  // isAdmin ใช้แค่โชว์/ซ่อนเมนู การป้องกันจริงอยู่ที่ Go (แก้ localStorage ก็ยิง /api/admin ไม่ผ่าน)
  const isAdmin = member?.role === 'admin';
  const value = { token, member, isLoggedIn: Boolean(token), isAdmin, login, register, logout, saveMember };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
