import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollection } from '../hooks/useCollection';
import { useConfig } from '../hooks/useConfig';
import { resumenPadron, clasificarSaldo } from '../lib/calc';
import { fmtDate, fmtNum1 } from '../lib/format';
import Modal from '../components/Modal';
import VacacionForm from '../components/VacacionForm';

export default function Padron() {
  const { data: empleados, loading: le } = useCollection('empleados', 'no');
  const { data: historial, loading: lh } = useCollection('historial');
  const { config } = useConfig();
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
        <div className="sec-hd">
          <span className="sec-num">1.</span>
          <span className="sec-title">Objeto</span>
        </div>
        <p className="text-[13px] text-ink-soft max-w-[70ch]">
          Registro individual y colectivo del saldo de vacaciones de los colaboradores
          de Bloobit México, con base en la antigüedad y la tabla LFT Art. 76
          (pre-reforma hasta 2022, reforma DOF 27-12-2022 en adelante). Fórmula
          cotejada contra el reporte oficial de CONTPAQi.
        </p>
      </section>

      <section>
        <div className="sec-hd">
          <span className="sec-num">2.</span>
          <span className="sec-title">Resumen al corte</span>
          <span className="sec-note font-mono">{fmtDate(config.corte)}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPI label="Colaboradores" value={resumen.total} />
          <KPI label="Con saldo positivo" value={resumen.conSaldoPositivo}
               sub={`${resumen.total - resumen.conSaldoPositivo} sin o excedidos`} />
          <KPI label="Excedidos (K < 0)" value={resumen.excedidos} tone="bad" />
          <KPI label="Promedio disp." value={fmtNum1(resumen.promedio)} sub="días por colaborador" />
        </div>
      </section>

      <section>
        <div className="sec-hd">
          <span className="sec-num">3.</span>
          <span className="sec-title">Padrón de colaboradores</span>
          <span className="sec-note">{resumen.total} activos</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[12px] text-ink-faint max-w-[55ch]">
            <strong>Tomable</strong> = días ya cerrados por aniversarios (D − E), lo que puede tomar hoy.&nbsp;
            <strong>Saldo (K)</strong> = Saldo total CONTPAQi (D + H − E), incluye lo que se devengará este año.
          </p>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + Registrar vacaciones
          </button>
        </div>
        <div className="tbl-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>No.</th>
                <th>Nombre</th>
                <th>Fecha de ingreso</th>
                <th className="num-c">Antig.</th>
                <th className="num-c">LFT año</th>
                <th className="num-c">Devengado</th>
                <th className="num-c">Tomados año</th>
                <th className="num-c" title="D − E · Lo que puede tomar HOY sin pedir prestado del año en curso">Tomable</th>
                <th className="num-c" title="D + H − E · Saldo total CONTPAQi (incluye prorrateo)">Saldo (K)</th>
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
                    <td className="num">{fmtNum1(calc.H)}</td>
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
                <tr><td colSpan={9} className="text-center text-ink-faint py-4">
                  No hay colaboradores. Ve a <strong>Administración</strong> para sembrar los datos.
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
