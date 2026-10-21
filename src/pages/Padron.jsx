import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollection } from '../hooks/useCollection';
import { useConfig } from '../hooks/useConfig';
import { useAuth } from '../context/AuthContext';
import { resumenPadron, clasificarSaldo } from '../lib/calc';
import { fmtDate, fmtNum1 } from '../lib/format';
import Modal from '../components/Modal';
import VacacionForm from '../components/VacacionForm';

export default function Padron() {
  const { data: empleados, loading: le } = useCollection('empleados', 'no');
  const { data: historial, loading: lh } = useCollection('historial');
  const { config } = useConfig();
  const { canWrite } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  const resumen = useMemo(() => {
    const activos = empleados.filter((e) => e.activo !== false);
    return resumenPadron(activos, historial, config.corte);
  }, [empleados, historial, config.corte]);

  if (le || lh) return <Loading />;

  const KPI = ({ label, value, sub, tone = 'ink' }) => (
    <div className="border border-rule bg-paper px-4 py-3">
      <div className="text-[10px] uppercase tracking-wider text-ink-faint font-semibold">
        {label}
      </div>
      <div className={`font-serif font-semibold text-[26px] leading-none mt-1 text-${tone}`}>
        {value}
      </div>
      {sub && <div className="text-[11px] text-ink-faint mt-1 font-mono">{sub}</div>}
    </div>
  );

  return (
    <div className="space-y-6">
      <section>
        <h2 className="font-serif text-[20px] mb-1">Objeto</h2>
        <p className="text-[13px] text-ink-soft max-w-[70ch]">
          Registro individual y colectivo del saldo de vacaciones de los colaboradores
          de Bloobit México, con base en la antigüedad y la tabla LFT Art. 76. Las cifras
          se validan contra el kárdex oficial de CONTPAQi Nóminas.
        </p>
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-3 pb-1.5 border-b border-rule-strong">
          <h2 className="font-serif text-[20px]">Resumen al corte</h2>
          <span className="text-[11px] text-ink-faint font-mono">{fmtDate(config.corte)}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPI label="Colaboradores" value={resumen.total} />
          <KPI label="Con saldo positivo" value={resumen.conSaldoPositivo}
               sub={`${resumen.total - resumen.conSaldoPositivo} sin o excedidos`} />
          <KPI label="Excedidos" value={resumen.excedidos} tone="bad" />
          <KPI label="Promedio disponibles" value={fmtNum1(resumen.promedio)} sub="días por colaborador" />
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-3 pb-1.5 border-b border-rule-strong">
          <h2 className="font-serif text-[20px]">Padrón de colaboradores</h2>
          <span className="text-[11px] text-ink-faint">{resumen.total} activos</span>
        </div>
        <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
          <p className="text-[12px] text-ink-faint max-w-[55ch]">
            Haz clic en un colaborador para abrir su kardex. <strong>Tomable</strong> es
            lo que puede tomar hoy. <strong>Saldo total</strong> incluye lo que se devengará
            durante el año en curso.
          </p>
          {canWrite && (
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              + Registrar vacaciones
            </button>
          )}
        </div>
        <div className="tbl-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>No.</th>
                <th>Nombre</th>
                <th>Fecha de ingreso</th>
                <th className="num-c">Antigüedad</th>
                <th className="num-c">LFT año</th>
                <th className="num-c">Tomados año</th>
                <th className="num-c">Tomable</th>
                <th className="num-c">Saldo total</th>
              </tr>
            </thead>
            <tbody>
              {resumen.filas.map(({ empleado, calc }) => {
                const clsK = clasificarSaldo(calc.K);
                const clsT = clasificarSaldo(calc.tomable);
                return (
                  <tr key={empleado.id} className="clickable"
                      onClick={() => navigate(`/kardex?e=${encodeURIComponent(empleado.nombre)}`)}>
                    <td className="num-c">{empleado.no}</td>
                    <td className="font-medium">{empleado.nombre}</td>
                    <td className="font-mono text-[12px]">{fmtDate(empleado.ingreso)}</td>
                    <td className="num-c">{calc.F}</td>
                    <td className="num-c">{calc.G}</td>
                    <td className="num-c">{calc.I}</td>
                    <td className={`num-c font-semibold text-${clsT === 'ok' ? 'ok' : clsT === 'warn' ? 'warn' : 'bad'}`}>
                      {calc.tomable}
                    </td>
                    <td className={`num-c text-${clsK === 'ok' ? 'ok' : clsK === 'warn' ? 'warn' : 'bad'}`}>
                      {fmtNum1(calc.K)}
                    </td>
                  </tr>
                );
              })}
              {resumen.total === 0 && (
                <tr><td colSpan={8} className="text-center text-ink-faint py-4">
                  No hay colaboradores. Agrégalos en <strong>Administración</strong>.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Registrar vacaciones">
        <VacacionForm empleados={empleados} onDone={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center py-16 text-ink-faint">
      Cargando datos...
    </div>
  );
}
