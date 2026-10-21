import { useEffect, useState } from 'react';

/**
 * Modo claro/oscuro con persistencia en localStorage y respeto por la preferencia del sistema.
 *
 * Tres estados:
 *   'system' → sigue a prefers-color-scheme (default)
 *   'light'  → forzado claro
 *   'dark'   → forzado oscuro
 */
const STORAGE_KEY = 'kv-theme';

function readStored() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch { /* localStorage no disponible */ }
  return 'system';
}

function apply(mode) {
  const root = document.documentElement;
  if (mode === 'light') root.setAttribute('data-theme', 'light');
  else if (mode === 'dark') root.setAttribute('data-theme', 'dark');
  else root.removeAttribute('data-theme');
}

export function useTheme() {
  const [mode, setMode] = useState(readStored);

  useEffect(() => {
    apply(mode);
    try { localStorage.setItem(STORAGE_KEY, mode); } catch { /* ignore */ }
  }, [mode]);

  // Si está en 'system', re-renderizar cuando el OS cambie para que el icono se actualice.
  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setMode('system'); // no-op pero refresca icono
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, [mode]);

  // Resuelve el modo efectivo (lo que el usuario está viendo)
  const isDark = mode === 'dark' ||
    (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const cycle = () => {
    setMode((m) => (m === 'light' ? 'dark' : m === 'dark' ? 'system' : 'light'));
  };

  return { mode, isDark, setMode, cycle };
}
