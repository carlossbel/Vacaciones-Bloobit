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
  const calc = useMemo(() => emp ? calcularVacaciones(emp, config.corte, historial) : null, [emp, historial, config.corte]);

  const handleChange = (n) => {
    setNombre(n);
    setParams({ e: n });
  };

  return (
    <div className="space-y-5">
      <div className="sec-hd">
        <span className="sec-num">4.</span>
        <span className="sec-title">Kardex Individual</span>
        <span className="sec-note">Imprimible / Exportable a PDF</span>
      </div>

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
          onClick={() => { try { window.print(); } catch(e){} }}
        >
          Imprimir / Guardar PDF
        </button>
        <span className="text-[11px] text-ink-faint">Ctrl+P / ⌘+P</span>
      </div>

      {!emp && (
        <div className="text-center text-ink-faint py-12">
          Selecciona un colaborador o agrégalos en Administración.
        </div>
      )}

      {emp && calc && (
        <KardexDocument empleado={emp} calc={calc} corte={config.corte} />
      )}
    </div>
  );
}

function KardexDocument({ empleado, calc, corte }) {
  const kC = clasificarSaldo(calc.K);
  const emision = new Date();
  const colorK = kC === 'ok' ? 'text-ok' : kC === 'warn' ? 'text-warn' : 'text-bad';

  const Row = ({ label, value }) => (
    <div className="grid grid-cols-[160px_1fr] border-b border-rule-soft">
      <div className="bg-paper-head px-3 py-1.5 text-[10.5px] uppercase tracking-wider text-ink-faint font-semibold border-r border-rule-soft flex items-center">
        {label}
      </div>
      <div className="px-3 py-1.5 font-mono text-[13px]">{value}</div>
    </div>
  );

  return (
    <div className="kardex-doc bg-paper border border-rule-strong max-w-doc mx-auto">
      {/* Letterhead */}
      <header className="grid grid-cols-[1.6fr_1fr] border-b-2 border-rule-strong">
        <div className="p-4 flex items-center gap-3 border-r border-rule">
          <div className="w-11 h-11 bg-accent text-white font-serif font-bold text-xl flex items-center justify-center">B</div>
          <div className="leading-tight">
            <strong className="font-serif font-semibold text-[16px]">Bloobit México, S.A. de C.V.</strong>
            <div className="text-[10.5px] uppercase tracking-wider text-ink-faint">
              Dirección de Recursos Humanos
            </div>
          </div>
        </div>
        <div className="grid grid-cols-[auto_1fr]">
          <KV k="Código"   v="FO-RH-003" />
          <KV k="Versión"  v="1.0" />
          <KV k="Corte"    v={fmtDate(corte)} />
          <KV k="Emisión"  v={fmtDate(emision)} last />
        </div>
      </header>

      {/* Title */}
      <div className="p-4 text-center border-b border-rule">
        <h2 className="font-serif font-semibold text-[22px] m-0 tracking-wide">
          Kardex de Vacaciones
        </h2>
        <p className="text-[11.5px] text-ink-faint tracking-wide mt-1">
          Registro individual conforme a Ley Federal del Trabajo, Art. 76 (DOF 27-12-2022)
        </p>
      </div>

      {/* Collaborator header */}
      <div className="flex justify-between bg-paper-head border-b border-rule px-4 py-3 flex-wrap gap-3">
        <div>
          <div className="font-serif font-semibold text-[17px] leading-none">{empleado.nombre}</div>
          <div className="text-[11px] text-ink-faint mt-1">
            No. empleado {empleado.no} · Fecha de ingreso {fmtDateLong(empleado.ingreso)}
          </div>
        </div>
        <div className="text-right font-mono text-[11.5px] text-ink-soft leading-tight">
          <div>Documento emitido el</div>
          <div className="font-semibold">{fmtDate(emision)}</div>
        </div>
      </div>

      {/* Data grid */}
      <div className="grid md:grid-cols-2">
        <div>
          <Row label="Antigüedad" value={`${calc.F} año${calc.F===1?'':'s'} cumplido${calc.F===1?'':'s'}`} />
          <Row label="Año aniversario" value={`${calc.F + 1}°`} />
          <Row label="Inicio aniversario" value={fmtDate(calc.anivStart)} />
        </div>
        <div className="md:border-l border-rule-soft">
          <Row label="Fin aniversario" value={fmtDate(calc.anivEnd)} />
          <Row label="Días LFT del año" value={`${calc.G} días`} />
          <Row label="Días transcurridos" value={`${calc.diasTranscurridos} / 365`} />
        </div>
      </div>

      {/* Saldos */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-y border-rule">
        <Saldo label="LFT año (G)"  value={calc.G}            sub="Techo del año" />
        <Saldo label="Devengado (H)" value={fmtNum1(calc.H)}  sub="Prorrateado" borderL />
        <Saldo label="Tomados (I)"  value={calc.I}            sub="En el aniversario" borderL />
        <Saldo label="Saldo (K)" value={fmtNum1(calc.K)}      sub="D + H − E" borderL cls={colorK} />
      </div>

      {/* Vacaciones del año */}
      <section className="p-4 border-b border-rule">
        <h4 className="font-serif font-semibold text-[15px] mb-2">
          Vacaciones del año aniversario en curso
        </h4>
        {calc.histAnio.length === 0 ? (
          <p className="text-[12px] text-ink-faint italic">Sin registros capturados en el año aniversario actual.</p>
        ) : (
          <div className="tbl-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th className="num-c">#</th>
                  <th>Fecha inicial</th>
                  <th>Fecha final</th>
                  <th className="num-c">Días</th>
                  <th>Origen</th>
                </tr>
              </thead>
              <tbody>
                {calc.histAnio.map((h, i) => (
                  <tr key={i}>
                    <td className="num-c">{i + 1}</td>
                    <td className="font-mono text-[12px]">{fmtDate(h.inicio)}</td>
                    <td className="font-mono text-[12px]">{fmtDate(h.fin)}</td>
                    <td className="num-c">{h.dias}</td>
                    <td>{h.notas}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="text-right font-semibold bg-paper-head" style={{borderTop:'1.5px solid var(--c-rule-strong)'}}>
                    Total tomados en el aniversario
                  </td>
                  <td className="num-c font-semibold bg-paper-head" style={{borderTop:'1.5px solid var(--c-rule-strong)'}}>{calc.I}</td>
                  <td className="bg-paper-head" style={{borderTop:'1.5px solid var(--c-rule-strong)'}}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      {/* Histórico acumulado */}
      <section className="p-4 border-b border-rule">
        <h4 className="font-serif font-semibold text-[15px] mb-2">
          Histórico acumulado
        </h4>
        <div className="grid md:grid-cols-2">
          <div>
            <Row label="Días generados (D)" value={calc.D} />
            <Row label="Días tomados (E)" value={calc.E} />
          </div>
          <div className="md:border-l border-rule-soft">
            <Row label="Registros en historial" value={calc.histEmp.length} />
            <Row label="Baseline kárdex (L / M)" value={`L=${empleado.L}  /  M=${empleado.M}`} />
          </div>
        </div>
      </section>

      {/* Firmas */}
      <section className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { rol: 'Colaborador', nombre: empleado.nombre },
          { rol: 'Recursos Humanos', nombre: 'Bloobit México' },
          { rol: 'Dirección General', nombre: 'Bloobit México' },
        ].map((f, i) => (
          <div key={i} className="text-center">
            <div className="border-t border-ink mx-2 mb-1 pt-1" style={{marginTop:'3rem'}}></div>
            <div className="font-serif font-semibold text-[11.5px] uppercase tracking-wider">{f.rol}</div>
            <div className="text-[11px] text-ink-faint mt-0.5">{f.nombre}</div>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="px-4 py-2 border-t-2 border-rule-strong bg-paper-head text-[10px] uppercase tracking-wider text-ink-faint flex justify-between flex-wrap gap-2">
        <span>FO-RH-003 · Control de Vacaciones · v1.0</span>
        <span>Bloobit México, S.A. de C.V.</span>
        <span>Página 1 de 1</span>
      </footer>
    </div>
  );
}

function KV({ k, v, last }) {
  return (
    <>
      <div className={`bg-paper-head px-3 py-1.5 text-[10.5px] uppercase tracking-wider text-ink-faint font-semibold border-r border-rule ${last ? '' : 'border-b border-rule'}`}>{k}</div>
      <div className={`px-3 py-1.5 font-mono text-[12px] ${last ? '' : 'border-b border-rule'}`}>{v}</div>
    </>
  );
}

function Saldo({ label, value, sub, borderL = false, cls = '' }) {
  return (
    <div className={`px-4 py-3 text-center ${borderL ? 'border-l border-rule-soft' : ''}`}>
      <div className="text-[10.5px] uppercase tracking-wider text-ink-faint">{label}</div>
      <div className={`font-serif font-semibold text-[26px] leading-none mt-1 ${cls}`}>{value}</div>
      <div className="text-[10.5px] text-ink-faint font-mono mt-1">{sub}</div>
    </div>
  );
}
