import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ThemeToggle from './ThemeToggle';
import { useConfig } from '../hooks/useConfig';
import { useAuth, ROL_LABEL } from '../context/AuthContext';
import { fmtDate } from '../lib/format';

export default function Layout() {
  const { config, updateConfig } = useConfig();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="no-print bg-paper border-b border-rule px-4 md:px-6 py-3 flex items-center gap-4 flex-wrap">
          <div className="min-w-0">
            <h1 className="font-serif text-[17px] leading-tight text-ink m-0">
              Control de Vacaciones
            </h1>
            <p className="text-[11px] text-ink-faint tracking-wide mt-0.5">
              LFT Art. 76 · Bloobit México
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3 flex-wrap">
            <label htmlFor="corte" className="label mb-0">Día de corte</label>
            <input
              id="corte"
              type="date"
              className="input font-mono"
              value={config.corte}
              onChange={(e) => updateConfig({ corte: e.target.value })}
            />
            <span className="text-[11px] text-ink-faint hidden md:inline">
              {fmtDate(config.corte)}
            </span>
            <ThemeToggle />
            {user && (
              <div className="flex items-center gap-2 md:hidden">
                <span className="text-[11px] text-ink-soft">
                  {user.nombre.split(' ')[0]}
                </span>
                <button
                  onClick={logout}
                  className="btn-icon"
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 bg-paper-dim">
          <div className="max-w-doc mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
