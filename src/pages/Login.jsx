import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [showP, setShowP] = useState(false);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const passInput = useRef(null);

  // Al elegir usuario, salta directo al campo de contraseña.
  useEffect(() => {
    if (u) passInput.current?.focus();
  }, [u]);

  const submit = (e) => {
    e.preventDefault();
    if (busy) return;
    setErr(null);
    setBusy(true);
    try { login(u, p); }
    catch (ex) { setErr(ex.message); setBusy(false); setP(''); }
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
              onChange={(e) => { setU(e.target.value); setErr(null); }}
            >
              <option value="">— selecciona —</option>
              <option value="barbara">Bárbara Pérez · Recursos Humanos</option>
              <option value="angelica">Angélica Luna · Contadora</option>
              <option value="carlos">Carlos Beltrán · IT</option>
            </select>
          </div>

          <div>
            <label className="label" htmlFor="p">Contraseña</label>
            <div className="relative">
              <input
                id="p"
                ref={passInput}
                type={showP ? 'text' : 'password'}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="current-password"
                required
                className="input w-full font-mono pr-10 tracking-widest"
                value={p}
                onChange={(e) => { setP(e.target.value); setErr(null); }}
              />
              <button
                type="button"
                onClick={() => setShowP((v) => !v)}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-ink-faint hover:text-ink p-1"
                aria-label={showP ? 'Ocultar' : 'Mostrar'}
                tabIndex={-1}
              >
                {showP ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.78 19.78 0 0 1 4.22-5.11"/>
                    <path d="M22.54 12.88A19.56 19.56 0 0 0 23 12s-4-8-11-8a10.94 10.94 0 0 0-3.17.46"/>
                    <path d="M9.9 4.24 14.1 19.76"/>
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {err && (
            <div
              className="text-bad text-xs border border-bad p-2"
              style={{ background: 'color-mix(in srgb, var(--c-bad) 10%, var(--c-paper))' }}
            >
              {err}
            </div>
          )}

          <button type="submit" className="btn-primary w-full justify-center" disabled={busy || !u || !p}>
            {busy ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <div className="px-6 pb-5 text-[10.5px] text-ink-faint text-center">
          Bloobit México, S.A. de C.V. · Recursos Humanos
        </div>
      </div>
    </div>
  );
}
