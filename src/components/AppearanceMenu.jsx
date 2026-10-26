import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useAccent } from '../hooks/useAccent';

/**
 * Popover con dos secciones:
 *   • Modo:  claro / oscuro / automático
 *   • Color: 6 paletas de acento
 */
export default function AppearanceMenu() {
  const { mode, isDark, setMode } = useTheme();
  const { accent, setAccent, accents } = useAccent();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const activeAccent = accents.find((a) => a.id === accent);
  const triggerColor = isDark ? activeAccent?.swatchDark : activeAccent?.swatchLight;

  return (
    <div className="relative no-print" ref={ref}>
      <button
        type="button"
        className="btn-icon"
        onClick={() => setOpen((v) => !v)}
        title="Apariencia (tema y color)"
        aria-label="Apariencia"
        aria-expanded={open}
      >
        <span
          className="block w-4 h-4 rounded-full border border-ink/20"
          style={{ background: triggerColor }}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-30 bg-paper border border-rule shadow-lg w-64"
          role="menu"
        >
          <div className="px-3 py-2 border-b border-rule-soft">
            <div className="text-[10px] uppercase tracking-wider text-ink-faint font-semibold mb-1.5">
              Modo
            </div>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'light',  label: 'Claro'   },
                { id: 'dark',   label: 'Oscuro'  },
                { id: 'system', label: 'Auto'    },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={[
                    'px-2 py-1.5 text-[12px] border transition-colors',
                    mode === m.id
                      ? 'bg-accent text-white border-accent'
                      : 'bg-paper text-ink-soft border-rule hover:bg-paper-head',
                  ].join(' ')}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-3 py-2">
            <div className="text-[10px] uppercase tracking-wider text-ink-faint font-semibold mb-1.5">
              Color
            </div>
            <div className="grid grid-cols-3 gap-2">
              {accents.map((a) => {
                const selected = a.id === accent;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAccent(a.id)}
                    className={[
                      'flex flex-col items-center gap-1 px-1.5 py-1.5 border transition-colors',
                      selected
                        ? 'border-ink'
                        : 'border-transparent hover:border-rule-soft',
                    ].join(' ')}
                    title={a.nombre}
                    aria-pressed={selected}
                  >
                    <span
                      className="w-6 h-6 rounded-full border border-ink/20"
                      style={{
                        background: isDark ? a.swatchDark : a.swatchLight,
                      }}
                    />
                    <span className="text-[10.5px] text-ink-soft">{a.nombre}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
