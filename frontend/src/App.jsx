import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import RequireRole from './components/RequireRole';
import ComingSoon from './components/ComingSoon';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import AdminLayout from './pages/admin/AdminLayout';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';

function App() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Guest: ใครก็เข้าได้ */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Member: ต้อง login */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><ComingSoon title="ตะกร้าสินค้า" /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><ComingSoon title="ออเดอร์ของฉัน" /></ProtectedRoute>} />

            {/* Admin: ครอบทั้งกิ่งด้วย RequireRole ครั้งเดียว หน้าลูกทุกหน้าได้รับการป้องกัน */}
            <Route path="/admin" element={<RequireRole role="admin"><AdminLayout /></RequireRole>}>
              <Route index element={<ComingSoon title="Dashboard" />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<AdminProductForm />} />
              <Route path="products/:id" element={<AdminProductForm />} />
              <Route path="orders" element={<ComingSoon title="จัดการออเดอร์" />} />
              <Route path="members" element={<ComingSoon title="จัดการสมาชิก" />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
          IT Shop · โปรเจกต์วิชา Client-Server Web · ข้อมูลสินค้าตัวอย่างจาก DummyJSON
        </footer>
      </div>
    </AuthProvider>
  );
}

export default App;
