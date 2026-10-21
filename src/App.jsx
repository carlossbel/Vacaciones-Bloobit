import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Padron from './pages/Padron';
import Kardex from './pages/Kardex';
import Historial from './pages/Historial';
import Reportes from './pages/Reportes';
import Admin from './pages/Admin';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Padron />} />
        <Route path="/kardex" element={<Kardex />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
