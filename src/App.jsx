import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Padron from './pages/Padron';
import Kardex from './pages/Kardex';
import Historial from './pages/Historial';
import Reportes from './pages/Reportes';
import Admin from './pages/Admin';
import Ayuda from './pages/Ayuda';
import Login from './pages/Login';

function Gate() {
  const { user } = useAuth();
  if (!user) return <Login />;
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Padron />} />
        <Route path="/kardex" element={<Kardex />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/ayuda" element={<Ayuda />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
