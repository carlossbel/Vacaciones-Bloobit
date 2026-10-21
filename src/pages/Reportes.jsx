import { useMemo, useState } from 'react';
import { useCollection } from '../hooks/useCollection';
import { useConfig } from '../hooks/useConfig';
import {
  calcularVacaciones,
  registrosEnRango,
  totalesPorEmpleado,
  totalesPorMes,
  resumenPadron,
  toCSV,
} from '../lib/calc';
import { fmtDate, fmtNum1, todayISO } from '../lib/format';

const copyCSV = async (rows, headers, filename) => {
  const csv = toCSV(rows, headers);
  try {
    await navigator.clipboard.writeText(csv);
    alert(`CSV de "${filename}" copiado al portapapeles.`);
  } catch {
    // Fallback: abrir en una ventana con el texto
    const win = window.open('', '_blank');
    win.document.body.innerText = csv;
  }
};

export default function Reportes() {
  const { data: empleados } = useCollection('empleados', 'no');
  const { data: historial } = useCollection('historial');
  const { config } = useConfig();

  const [tipo, setTipo] = useState('saldos');
  const [desde, setDesde] = useState(() => {
    const y = new Date().getFullYear();
    return `${y}-01-01`;
  });
  const [hasta, setHasta] = useState(todayISO());

  const activos = empleados.filter((e) => e.activo !== false);

  // --- Datos de cada reporte ---
  const resumen = useMemo(
    () => resumenPadron(activos, historial, config.corte),
    [activos, historial, config.corte]
  );

  const registros = useMemo(
    () => registrosEnRango(historial, desde, hasta),
    [historial, desde, hasta]
  );

  const porEmp = useMemo(() => totalesPorEmpleado(registros), [registros]);
  const porMes = useMemo(() => totalesPorMes(registros),      [registros]);

  const prima = useMemo(() => {
    return activos.map((e) => {
      const c = calcularVacaciones(e, config.corte, historial);
      return {
        nombre: e.nombre,
        no: e.no,
        G: c.G,
        prima_dias: c.primaVacacional,
        pct: 0.25,
      };
    });
  }, [activos, historial, config.corte]);

  return (
    <div className="space-y-5">
      <div className="sec-hd">
        <span className="sec-num">7.</span>
        <span className="sec-title">Reportes</span>
      </div>

      {/* Selector de reporte */}
      <div className="flex gap-2 flex-wrap items-end bg-paper border border-rule p-4">
        <div>
          <label className="label">Reporte</label>
          <select
            className="select min-w-[220px]"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="saldos">Saldos al día de corte</option>
            <option value="rango">Vacaciones por rango de fechas</option>
            <option value="porEmpleado">Totales por colaborador</option>
            <option value="porMes">Totales por mes</option>
            <option value="prima">Prima vacacional (base)</option>
          </select>
        </div>
        {(tipo === 'rango' || tipo === 'porEmpleado' || tipo === 'porMes') && (
          <>
            <div>
              <label className="label">Desde</label>
              <input type="date" className="input font-mono" value={desde}
                     onChange={(e) => setDesde(e.target.value)} />
            </div>
            <div>
              <label className="label">Hasta</label>
              <input type="date" className="input font-mono" value={hasta}
                     onChange={(e) => setHasta(e.target.value)} />
            </div>
          </>
        )}
        <button className="btn-primary ml-auto"
                onClick={() => { try { window.print(); } catch(e){} }}>
          Imprimir / PDF
        </button>
      </div>

      {/* Reportes */}
      {tipo === 'saldos' && (
        <ReporteSaldos resumen={resumen} corte={config.corte} />
      )}
      {tipo === 'rango' && (
        <ReporteRango registros={registros} desde={desde} hasta={hasta} />
      )}
      {tipo === 'porEmpleado' && (
        <ReportePorEmp data={porEmp} desde={desde} hasta={hasta} />
      )}
      {tipo === 'porMes' && (
        <ReportePorMes data={porMes} desde={desde} hasta={hasta} />
      )}
      {tipo === 'prima' && (
        <ReportePrima data={prima} />
      )}
    </div>
  );
}

// ───────── Sub-reportes ─────────

function ReporteSaldos({ resumen, corte }) {
  const rows = resumen.filas.map(({ empleado, calc }) => ({
    no: empleado.no,
    nombre: empleado.nombre,
    ingreso: empleado.ingreso,
    antigüedad: calc.F,
    lft_año: calc.G,
    generados: calc.D,
    tomados: calc.E,
    devengado: Math.round(calc.H * 100) / 100,
    saldo: Math.round(calc.K * 100) / 100,
  }));
  return (
    <section>
      <HeaderReporte
        title={`Saldos al ${fmtDate(corte)}`}
        subtitle={`${resumen.total} colaboradores · ${resumen.excedidos} excedidos · promedio ${fmtNum1(resumen.promedio)} días`}
        onCSV={() => copyCSV(rows, Object.keys(rows[0] || {}), 'saldos')}
      />
      <div className="tbl-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>No.</th><th>Nombre</th><th>Ingreso</th>
              <th className="num-c">Antig.</th>
              <th className="num-c">LFT año</th>
              <th className="num-c">Generados (D)</th>
              <th className="num-c">Tomados (E)</th>
              <th className="num-c">Devengado (H)</th>
              <th className="num-c">Saldo (K)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.no}>
                <td className="num-c">{r.no}</td>
                <td className="font-medium">{r.nombre}</td>
                <td className="font-mono text-[12px]">{fmtDate(r.ingreso)}</td>
                <td className="num-c">{r.antigüedad}</td>
                <td className="num-c">{r.lft_año}</td>
                <td className="num-c">{r.generados}</td>
                <td className="num-c">{r.tomados}</td>
                <td className="num">{fmtNum1(r.devengado)}</td>
                <td className={`num font-semibold ${r.saldo < 0 ? 'text-bad' : 'text-ok'}`}>
                  {fmtNum1(r.saldo)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ReporteRango({ registros, desde, hasta }) {
  const total = registros.reduce((s, r) => s + (r.dias || 0), 0);
  const rows = registros.map((r) => ({
    nombre: r.nombre, inicio: r.inicio, fin: r.fin, dias: r.dias, origen: r.notas,
  }));
  return (
    <section>
      <HeaderReporte
        title={`Vacaciones entre ${fmtDate(desde)} y ${fmtDate(hasta)}`}
        subtitle={`${registros.length} registros · ${total} días totales`}
        onCSV={() => copyCSV(rows, ['nombre','inicio','fin','dias','origen'], 'rango')}
      />
      <div className="tbl-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Colaborador</th><th>Inicio</th><th>Fin</th>
              <th className="num-c">Días</th><th>Origen</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((r, i) => (
              <tr key={i}>
                <td className="font-medium">{r.nombre}</td>
                <td className="font-mono text-[12px]">{fmtDate(r.inicio)}</td>
                <td className="font-mono text-[12px]">{fmtDate(r.fin)}</td>
                <td className="num-c">{r.dias}</td>
                <td>{r.notas}</td>
              </tr>
            ))}
            {registros.length === 0 && (
              <tr><td colSpan={5} className="text-center text-ink-faint py-4">Sin registros en el rango.</td></tr>
            )}
          </tbody>
          {registros.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={3} className="text-right font-semibold bg-paper-head" style={{borderTop:'1.5px solid var(--c-rule-strong)'}}>Total</td>
                <td className="num-c font-semibold bg-paper-head" style={{borderTop:'1.5px solid var(--c-rule-strong)'}}>{total}</td>
                <td className="bg-paper-head" style={{borderTop:'1.5px solid var(--c-rule-strong)'}}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </section>
  );
}

function ReportePorEmp({ data, desde, hasta }) {
  const totalDias = data.reduce((s, r) => s + r.dias, 0);
  return (
    <section>
      <HeaderReporte
        title={`Totales por colaborador — ${fmtDate(desde)} a ${fmtDate(hasta)}`}
        subtitle={`${data.length} colaboradores con registros · ${totalDias} días totales`}
        onCSV={() => copyCSV(data, ['nombre','dias','registros'], 'por_empleado')}
      />
      <div className="tbl-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th className="num-c">Días</th>
              <th className="num-c">Registros</th>
              <th>Distribución</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => {
              const pct = totalDias > 0 ? (r.dias / totalDias) * 100 : 0;
              return (
                <tr key={r.nombre}>
                  <td className="font-medium">{r.nombre}</td>
                  <td className="num-c">{r.dias}</td>
                  <td className="num-c">{r.registros}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="h-2 bg-accent" style={{ width: `${Math.min(pct, 100)}%` }} />
                      <span className="text-[11px] text-ink-faint font-mono">{pct.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
            {data.length === 0 && (
              <tr><td colSpan={4} className="text-center text-ink-faint py-4">Sin datos.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ReportePorMes({ data, desde, hasta }) {
  const maxDias = Math.max(...data.map((r) => r.dias), 1);
  return (
    <section>
      <HeaderReporte
        title={`Totales por mes — ${fmtDate(desde)} a ${fmtDate(hasta)}`}
        subtitle={`${data.length} meses con registros`}
        onCSV={() => copyCSV(data, ['mes','dias','registros'], 'por_mes')}
      />
      <div className="tbl-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Mes</th>
              <th className="num-c">Días</th>
              <th className="num-c">Registros</th>
              <th>Volumen</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.mes}>
                <td className="font-mono">{r.mes}</td>
                <td className="num-c">{r.dias}</td>
                <td className="num-c">{r.registros}</td>
                <td>
                  <div className="h-2 bg-accent" style={{ width: `${(r.dias / maxDias) * 100}%` }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ReportePrima({ data }) {
  const rows = data.map((r) => ({
    no: r.no, nombre: r.nombre, lft_año: r.G, pct: r.pct, prima_dias: r.prima_dias,
  }));
  return (
    <section>
      <HeaderReporte
        title={`Prima vacacional base (Art. 80 LFT)`}
        subtitle={`25% × días LFT del año aniversario en curso. Multiplica por el salario diario para pesos.`}
        onCSV={() => copyCSV(rows, ['no','nombre','lft_año','pct','prima_dias'], 'prima_vacacional')}
      />
      <div className="tbl-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>No.</th><th>Colaborador</th>
              <th className="num-c">LFT año</th>
              <th className="num-c">%</th>
              <th className="num-c">Prima (días)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.no}>
                <td className="num-c">{r.no}</td>
                <td className="font-medium">{r.nombre}</td>
                <td className="num-c">{r.lft_año}</td>
                <td className="num-c">{(r.pct * 100).toFixed(0)}%</td>
                <td className="num">{fmtNum1(r.prima_dias)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function HeaderReporte({ title, subtitle, onCSV }) {
  return (
    <div className="flex items-end justify-between mb-2 flex-wrap gap-2">
      <div>
        <h3 className="font-serif font-semibold text-[16px] m-0">{title}</h3>
        {subtitle && <p className="text-[12px] text-ink-faint">{subtitle}</p>}
      </div>
      <button className="btn-ghost no-print" onClick={onCSV}>Copiar CSV</button>
    </div>
  );
}
