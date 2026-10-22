import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    setErr(null);
    try { login(u, p); }
    catch (ex) { setErr(ex.message); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-paper-dim">
      <div className="w-full max-w-sm bg-paper border border-rule">
        <div className="px-6 py-5 border-b-2 border-rule-strong text-center">
          <div className="font-serif font-semibold text-[22px] text-accent tracking-wide">Bloobit</div>
          <div className="text-[11px] uppercase tracking-widest text-ink-faint mt-1">
            Control de Vacaciones
          </div>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="label" htmlFor="u">Usuario</label>
            <select
              id="u"
              autoFocus
              required
              className="select w-full"
              value={u}
              onChange={(e) => setU(e.target.value)}
            >
              <option value="">— selecciona —</option>
              <option value="barbara">Bárbara Pérez · Recursos Humanos</option>
              <option value="angelica">Angélica Luna · Contadora</option>
              <option value="carlos">Carlos Beltrán · IT</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="p">Contraseña</label>
            <input
              id="p"
              type="password"
              autoComplete="current-password"
              required
              className="input w-full font-mono"
              value={p}
              onChange={(e) => setP(e.target.value)}
            />
          </div>

          {err && (
            <div
              className="text-bad text-xs border border-bad p-2"
              style={{ background: 'color-mix(in srgb, var(--c-bad) 10%, var(--c-paper))' }}
            >
              {err}
            </div>
          )}

          <button type="submit" className="btn-primary w-full justify-center">
            Entrar
          </button>
        </form>

        <div className="px-6 pb-5 text-[10.5px] text-ink-faint text-center">
          Bloobit México, S.A. de C.V. · Recursos Humanos
        </div>
      </div>
    </div>
  );
}
