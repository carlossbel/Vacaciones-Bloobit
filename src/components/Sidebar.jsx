import { NavLink } from 'react-router-dom';
import { useAuth, ROL_LABEL } from '../context/AuthContext';

const NAV = [
  { to: '/',          label: 'Padrón' },
  { to: '/kardex',    label: 'Kardex Individual' },
  { to: '/historial', label: 'Historial' },
  { to: '/reportes',  label: 'Reportes' },
  { to: '/admin',     label: 'Administración' },
  { to: '/ayuda',     label: 'Ayuda' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="no-print bg-paper border-r border-rule w-full md:w-60 flex-shrink-0 flex md:flex-col flex-row">
      <div className="hidden md:block p-5 border-b border-rule">
        <div className="font-serif font-semibold text-[18px] text-accent tracking-wide">
          Bloobit
        </div>
        <div className="text-[10px] uppercase tracking-wider text-ink-faint mt-1">
          Control de Vacaciones
        </div>
      </div>

      <nav className="flex md:flex-col flex-row flex-1 overflow-x-auto">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              [
                'px-4 py-3 text-[13px] border-b md:border-l-2 border-rule-soft md:border-l-transparent whitespace-nowrap',
                isActive
                  ? 'bg-accent-tint md:border-l-accent text-ink font-semibold'
                  : 'text-ink-soft hover:bg-paper-head',
              ].join(' ')
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="hidden md:block mt-auto border-t border-rule">
          <div className="p-4 text-[11px]">
            <div className="text-ink font-medium">{user.nombre}</div>
            <div className="text-ink-faint">{ROL_LABEL[user.rol]}</div>
            {user.permiso === 'read' && (
              <div className="text-warn text-[10px] mt-1 uppercase tracking-wider">Solo lectura</div>
            )}
          </div>
          <button
            onClick={logout}
            className="w-full text-left px-4 py-3 text-[12px] text-ink-soft hover:bg-paper-head border-t border-rule-soft flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Cerrar sesión
          </button>
        </div>
      )}
    </aside>
  );
}
