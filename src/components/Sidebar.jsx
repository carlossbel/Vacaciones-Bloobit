import { NavLink } from 'react-router-dom';

const NAV = [
  { to: '/',          label: 'Padrón',            num: '3' },
  { to: '/kardex',    label: 'Kardex Individual', num: '4' },
  { to: '/historial', label: 'Historial',         num: '5' },
  { to: '/reportes',  label: 'Reportes',          num: '6' },
  { to: '/admin',     label: 'Administración',    num: '7' },
];

export default function Sidebar() {
  return (
    <aside className="no-print bg-paper border-r border-rule w-full md:w-60 flex-shrink-0 flex md:flex-col flex-row">
      <div className="hidden md:block p-5 border-b border-rule">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-accent text-white font-serif font-bold text-xl flex items-center justify-center">
            B
          </div>
          <div className="leading-tight">
            <div className="font-serif font-semibold text-[15px]">Bloobit</div>
            <div className="text-[10px] uppercase tracking-wider text-ink-faint">
              Recursos Humanos
            </div>
          </div>
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
                'flex items-center gap-3 px-4 py-3 text-[13px] border-b md:border-l-2 border-rule-soft md:border-l-transparent whitespace-nowrap',
                isActive
                  ? 'bg-accent-tint md:border-l-accent text-ink font-semibold'
                  : 'text-ink-soft hover:bg-paper-head',
              ].join(' ')
            }
          >
            <span className="font-serif text-accent text-[13px] w-4">{item.num}.</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="hidden md:block mt-auto p-4 border-t border-rule text-[10px] text-ink-faint tracking-wider">
        FO-RH-003 · v1.0
      </div>
    </aside>
  );
}
