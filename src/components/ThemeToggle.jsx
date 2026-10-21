import { useTheme } from '../hooks/useTheme';

/** Botón que cicla light → dark → system → light. */
export default function ThemeToggle() {
  const { mode, isDark, cycle } = useTheme();

  const label =
    mode === 'light' ? 'Modo claro'
    : mode === 'dark' ? 'Modo oscuro'
    : 'Automático (sistema)';
  const next =
    mode === 'light' ? 'Cambiar a oscuro'
    : mode === 'dark' ? 'Cambiar a automático'
    : 'Cambiar a claro';

  return (
    <button
      type="button"
      className="btn-icon no-print"
      onClick={cycle}
      title={`${label}. ${next}.`}
      aria-label={next}
    >
      {mode === 'system' ? <IconAuto /> : isDark ? <IconMoon /> : <IconSun />}
    </button>
  );
}

function IconSun() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
function IconMoon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
function IconAuto() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3 a9 9 0 0 0 0 18 z" fill="currentColor" />
    </svg>
  );
}
