import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCollection } from '../hooks/useCollection';
import { useConfig } from '../hooks/useConfig';
import { calcularVacaciones, clasificarSaldo } from '../lib/calc';
import { fmtDate, fmtDateLong, fmtNum1 } from '../lib/format';

export default function Kardex() {
  const { data: empleados } = useCollection('empleados', 'no');
  const { data: historial } = useCollection('historial');
  const { config } = useConfig();
  const [params, setParams] = useSearchParams();
  const [nombre, setNombre] = useState('');

  useEffect(() => {
    const inUrl = params.get('e');
    if (inUrl && empleados.some((e) => e.nombre === inUrl)) {
      setNombre(inUrl);
    } else if (empleados.length && !nombre) {
      setNombre(empleados[0].nombre);
    }
  }, [empleados, params, nombre]);

  const emp = empleados.find((e) => e.nombre === nombre);
  const calc = useMemo(
    () => emp ? calcularVacaciones(emp, config.corte, historial) : null,
    [emp, historial, config.corte]
  );

  const handleChange = (n) => {
    setNombre(n);
    setParams({ e: n });
  };

  return (
    <div className="space-y-5">
      <h2 className="font-serif text-[22px]">Kardex Individual</h2>

      <div className="no-print bg-paper border border-rule px-4 py-3 flex items-center gap-3 flex-wrap">
        <label className="label mb-0" htmlFor="emp-sel">Colaborador</label>
        <select
          id="emp-sel"
          className="select min-w-[220px]"
          value={nombre}
          onChange={(e) => handleChange(e.target.value)}
        >
          {empleados.map((e) => (
            <option key={e.id} value={e.nombre}>{e.nombre}</option>
          ))}
        </select>
        <button
          className="btn-primary ml-auto"
          onClick={() => { try { window.print(); } catch(e) {} }}
        >
          Imprimir / Guardar PDF
        </button>
        <span className="text-[11px] text-ink-faint">Ctrl+P / ⌘+P</span>
      </div>

      {!emp && (
        <div className="text-center text-ink-faint py-12">
          Selecciona un colaborador.
        </div>
      )}

      {emp && calc && (
        <KardexDocument empleado={emp} calc={calc} corte={config.corte} />
      )}
    </div>
  );
}

function KardexDocument({ empleado, calc, corte }) {
  const clsT = clasificarSaldo(calc.tomable);
  const toneT = clsT === 'ok' ? 'text-ok' : clsT === 'warn' ? 'text-warn' : 'text-bad';
  const emision = new Date();

  return (
    <article className="kardex-doc bg-paper border border-rule-strong">
      {/* Encabezado */}
      <header className="px-6 py-4 border-b-2 border-rule-strong text-center">
        <div className="font-serif font-semibold text-[18px] text-accent tracking-wide">
          Bloobit México, S.A. de C.V.
        </div>
        <h3 className="font-serif font-semibold text-[22px] mt-2 mb-0.5">
          Kárdex de Vacaciones
        </h3>
        <p className="text-[11.5px] text-ink-faint tracking-wide">
          Ley Federal del Trabajo · Art. 76
        </p>
      </header>

      {/* Datos del colaborador */}
      <section className="px-6 py-4 border-b border-rule">
        <div className="grid md:grid-cols-2 gap-x-6">
          <KV k="Nombre"           v={empleado.nombre} wide />
          <KV k="No. empleado"     v={empleado.no} />
          <KV k="Fecha de ingreso" v={fmtDateLong(empleado.ingreso)} wide />
          <KV k="Antigüedad"       v={`${calc.F} año${calc.F === 1 ? '' : 's'}`} />
          <KV k="Fecha de corte"   v={fmtDate(corte)} />
          <KV k="Fecha de emisión" v={fmtDate(emision)} />
        </div>
      </section>

      {/* Saldos (sin fórmulas) */}
      <section className="grid grid-cols-2 border-b border-rule">
        <div className="p-4 border-r border-rule text-center">
          <div className="text-[11px] uppercase tracking-wider text-ink-faint">
            Saldo disponible (puede tomar hoy)
          </div>
          <div className={`font-serif font-semibold text-[42px] leading-none mt-2 ${toneT}`}>
            {calc.tomable}
          </div>
          <div className="text-[11px] text-ink-faint mt-1">día(s)</div>
        </div>
        <div className="p-4 text-center">
          <div className="text-[11px] uppercase tracking-wider text-ink-faint">
            Saldo total del año aniversario
          </div>
          <div className="font-serif font-semibold text-[42px] leading-none mt-2 text-ink">
            {fmtNum1(calc.K)}
          </div>
          <div className="text-[11px] text-ink-faint mt-1">día(s)</div>
        </div>
      </section>

      {/* Registros del año aniversario en curso */}
      <section className="px-6 py-4 border-b border-rule">
        <h4 className="font-serif font-semibold text-[15px] mb-2">
          Vacaciones del año aniversario en curso
        </h4>
        {calc.histAnio.length === 0 ? (
          <p className="text-[12px] text-ink-faint italic">
            Sin registros capturados en el año aniversario actual.
          </p>
        ) : (
          <TablaRegistros rows={calc.histAnio} total={calc.I} totalLabel="Total del año" />
        )}
      </section>

      {/* Historial completo (todos los años) */}
      <section className="px-6 py-4 border-b border-rule">
        <h4 className="font-serif font-semibold text-[15px] mb-2 flex items-baseline justify-between">
          <span>Historial completo de vacaciones</span>
          <span className="text-[11px] text-ink-faint font-sans font-normal">
            {calc.histEmp.length} registro{calc.histEmp.length === 1 ? '' : 's'}
          </span>
        </h4>
        {calc.histEmp.length === 0 ? (
          <p className="text-[12px] text-ink-faint italic">
            Sin registros capturados.
          </p>
        ) : (
          <TablaRegistros
            rows={[...calc.histEmp].sort(
              (a, b) => (a.inicio || '').localeCompare(b.inicio || '')
            )}
            total={calc.histEmp.reduce((s, h) => s + (Number(h.dias) || 0), 0)}
            totalLabel="Total histórico"
            withNotas
          />
        )}
      </section>

      {/* Firmas */}
      <section className="px-6 pt-10 pb-5">
        <div className="grid grid-cols-2 gap-10">
          {[
            { rol: 'Colaborador', nombre: empleado.nombre },
            { rol: 'Recursos Humanos', nombre: 'Bloobit México' },
          ].map((f, i) => (
            <div key={i} className="text-center">
              <div className="border-t border-ink mx-6 mb-1 mt-10"></div>
              <div className="font-serif font-semibold text-[11.5px] uppercase tracking-wider">{f.rol}</div>
              <div className="text-[11px] text-ink-faint mt-0.5">{f.nombre}</div>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}

function KV({ k, v, wide = false }) {
  return (
    <div className={`flex justify-between py-1 border-b border-rule-soft gap-3 ${wide ? '' : ''}`}>
      <span className="text-[11px] uppercase tracking-wider text-ink-faint font-semibold">{k}</span>
      <span className="font-mono text-[12.5px] text-right">{v}</span>
    </div>
  );
}

function TablaRegistros({ rows, total, totalLabel, withNotas = false }) {
  const th =
    'text-left py-1.5 px-2 border-b border-rule-strong text-[10.5px] uppercase tracking-wider text-ink-faint font-semibold bg-paper-head';
  const td = 'py-1 px-2 border-b border-rule-soft font-mono';
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr>
            <th className={`${th} w-10`}>#</th>
            <th className={th}>Fecha inicial</th>
            <th className={th}>Fecha final</th>
            <th className={`${th} text-right w-16`}>Días</th>
            {withNotas && <th className={th}>Origen</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((h, i) => (
            <tr key={h.id ?? i}>
              <td className={`${td} text-center`}>{i + 1}</td>
              <td className={td}>{fmtDate(h.inicio)}</td>
              <td className={td}>{fmtDate(h.fin)}</td>
              <td className={`${td} text-right`}>{h.dias}</td>
              {withNotas && <td className={`${td} font-sans`}>{h.notas}</td>}
            </tr>
          ))}
          <tr>
            <td
              colSpan={withNotas ? 3 : 3}
              className="py-1.5 px-2 text-right font-semibold bg-paper-head font-sans"
              style={{ borderTop: '1.5px solid var(--c-rule-strong)' }}
            >
              {totalLabel}
            </td>
            <td
              className="py-1.5 px-2 font-mono text-right font-semibold bg-paper-head"
              style={{ borderTop: '1.5px solid var(--c-rule-strong)' }}
            >
              {total}
            </td>
            {withNotas && (
              <td
                className="bg-paper-head"
                style={{ borderTop: '1.5px solid var(--c-rule-strong)' }}
              />
            )}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
