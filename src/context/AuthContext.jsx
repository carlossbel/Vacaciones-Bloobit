import { createContext, useContext, useEffect, useState } from 'react';

/**
 * Autenticación local (solo frontend) para FO-RH-003.
 *
 * ⚠ Las credenciales están en el bundle JS y pueden leerse desde DevTools.
 * Para producción, migrar a Firebase Auth y mover la verificación al backend.
 */
const USERS = [
  { username: 'barbara',  password: '111825', nombre: 'Bárbara Pérez',   rol: 'rh',       permiso: 'write' },
  { username: 'angelica', password: '0000',   nombre: 'Angélica Luna',   rol: 'contadora',permiso: 'read'  },
  { username: 'carlos',   password: '131204', nombre: 'Carlos Beltrán',  rol: 'it',       permiso: 'write' },
];

export const ROL_LABEL = {
  rh:        'Recursos Humanos',
  contadora: 'Contadora',
  it:        'IT',
};

const STORAGE_KEY = 'kv-auth';
const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
  }, [user]);

  const login = (username, password) => {
    const u = USERS.find(
      (x) => x.username.toLowerCase() === String(username).toLowerCase().trim()
          && x.password === String(password)
    );
    if (!u) throw new Error('Usuario o contraseña incorrectos');
    const { password: _p, ...safe } = u;
    setUser(safe);
    return safe;
  };

  const logout = () => setUser(null);

  return (
    <AuthCtx.Provider value={{ user, login, logout, canWrite: user?.permiso === 'write' }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth fuera de <AuthProvider>');
  return ctx;
}
