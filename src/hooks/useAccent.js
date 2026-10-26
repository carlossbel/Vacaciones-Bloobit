import { useEffect, useState } from 'react';

/**
 * Paleta de acento (color principal del app) con persistencia en localStorage.
 * Las paletas disponibles están definidas en src/index.css bajo
 * :root[data-accent="..."] (y su versión dark).
 */
export const ACCENTS = [
  { id: 'navy',     nombre: 'Marino',    swatchLight: '#1b3a5c', swatchDark: '#7bb0e8' },
  { id: 'emerald',  nombre: 'Esmeralda', swatchLight: '#0f6c4b', swatchDark: '#5bc48a' },
  { id: 'burgundy', nombre: 'Granate',   swatchLight: '#8b1e3f', swatchDark: '#e07090' },
  { id: 'violet',   nombre: 'Violeta',   swatchLight: '#513688', swatchDark: '#a088e0' },
  { id: 'amber',    nombre: 'Ámbar',     swatchLight: '#a0620b', swatchDark: '#e2a94e' },
  { id: 'graphite', nombre: 'Grafito',   swatchLight: '#2c3340', swatchDark: '#c8ced6' },
];

const DEFAULT = 'navy';
const STORAGE_KEY = 'kv-accent';

function readStored() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (ACCENTS.some((a) => a.id === v)) return v;
  } catch { /* ignore */ }
  return DEFAULT;
}

function apply(id) {
  document.documentElement.setAttribute('data-accent', id);
}

export function useAccent() {
  const [accent, setAccent] = useState(readStored);

  useEffect(() => {
    apply(accent);
    try { localStorage.setItem(STORAGE_KEY, accent); } catch { /* ignore */ }
  }, [accent]);

  return { accent, setAccent, accents: ACCENTS };
}
