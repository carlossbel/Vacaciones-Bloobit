import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useConfig } from '../hooks/useConfig';
import { fmtDate } from '../lib/format';

export default function Layout() {
  const { config, updateConfig } = useConfig();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Barra superior (no imprime) */}
        <header className="no-print bg-paper border-b border-rule px-4 md:px-6 py-3 flex items-center gap-4 flex-wrap">
          <div className="min-w-0">
            <h1 className="font-serif text-[17px] leading-tight text-ink m-0">
              Control de Vacaciones
            </h1>
            <p className="text-[11px] text-ink-faint tracking-wide mt-0.5">
              LFT Art. 76 · Bloobit México
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
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
