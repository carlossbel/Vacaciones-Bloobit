import { useState } from 'react';
import { useCollection } from '../hooks/useCollection';
import { useConfig } from '../hooks/useConfig';
import {
  collection, addDoc, deleteDoc, doc, getDocs, writeBatch,
  serverTimestamp, db, COL,
} from '../firebase';
import { EMPLEADOS_SEED, HISTORIAL_SEED } from '../lib/seedData';
import { fmtDate } from '../lib/format';
import Modal from '../components/Modal';
import EmpleadoForm from '../components/EmpleadoForm';

export default function Admin() {
  const { data: empleados, loading: le } = useCollection('empleados', 'no');
  const { data: historial } = useCollection('historial');
  const { config, updateConfig } = useConfig();
  const [editing, setEditing] = useState(null);
  const [newOpen, setNewOpen] = useState(false);
  const [seedState, setSeedState] = useState({ running: false, msg: '' });

  const handleDeleteEmp = async (id, nombre) => {
    if (!confirm(`¿Eliminar al colaborador "${nombre}"? Sus registros de historial NO se borran automáticamente.`)) return;
    await deleteDoc(doc(db, COL.empleados, id));
  };

  const handleSeed = async () => {
    if (!confirm('Sembrar los datos iniciales (10 colaboradores + 146 registros de CONTPAQi). Si ya existen con los mismos datos, se omiten para evitar duplicados.')) return;
    setSeedState({ running: true, msg: 'Leyendo datos existentes…' });
    try {
      // 1) Empleados
      const empSnap = await getDocs(collection(db, COL.empleados));
      const existentes = new Set(empSnap.docs.map((d) => d.data().nombre));
      let empAgregados = 0;
      for (const e of EMPLEADOS_SEED) {
        if (!existentes.has(e.nombre)) {
          await addDoc(collection(db, COL.empleados), {
            ...e,
            activo: true,
            createdAt: serverTimestamp(),
          });
          empAgregados++;
        }
      }

      // 2) Historial — como no hay unique key natural, se usa (nombre+inicio+fin+dias) como huella
      setSeedState({ running: true, msg: 'Sembrando historial…' });
      const histSnap = await getDocs(collection(db, COL.historial));
      const huellas = new Set(histSnap.docs.map((d) => {
        const h = d.data();
        return `${h.nombre}|${h.inicio}|${h.fin}|${h.dias}`;
      }));

      // Firestore batch size 500 max
      let batch = writeBatch(db);
      let batchCount = 0;
      let histAgregados = 0;
      for (const h of HISTORIAL_SEED) {
        const key = `${h.nombre}|${h.inicio}|${h.fin}|${h.dias}`;
        if (huellas.has(key)) continue;
        const ref = doc(collection(db, COL.historial));
        batch.set(ref, { ...h, createdAt: serverTimestamp() });
        histAgregados++;
        batchCount++;
        if (batchCount >= 400) {
          await batch.commit();
          batch = writeBatch(db);
          batchCount = 0;
        }
      }
      if (batchCount > 0) await batch.commit();

      setSeedState({
        running: false,
        msg: `✓ Sembrado completo: ${empAgregados} colaboradores y ${histAgregados} registros agregados.`,
      });
    } catch (err) {
      setSeedState({ running: false, msg: '✗ Error: ' + err.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="sec-hd">
        <span className="sec-num">7.</span>
        <span className="sec-title">Administración</span>
      </div>

      {/* Configuración */}
      <section>
        <h3 className="font-serif font-semibold text-[15px] mb-2">Configuración global</h3>
        <div className="bg-paper border border-rule p-4 grid md:grid-cols-2 gap-4 max-w-[640px]">
          <div>
            <label className="label">Fecha de corte (todos los cálculos)</label>
            <input type="date" className="input w-full font-mono"
                   value={config.corte}
                   onChange={(e) => updateConfig({ corte: e.target.value })} />
            <p className="text-[11px] text-ink-faint mt-1">
              Afecta el padrón completo y el kardex de todos los colaboradores.
            </p>
          </div>
          <div>
            <label className="label">Corte del kárdex histórico (baselines L / M)</label>
            <input type="date" className="input w-full font-mono"
                   value={config.corteKardex}
                   onChange={(e) => updateConfig({ corteKardex: e.target.value })} />
            <p className="text-[11px] text-ink-faint mt-1">
              Fecha hasta la cual los baselines L y M consideran días devengados / tomados.
            </p>
          </div>
        </div>
      </section>

      {/* Seed */}
      <section>
        <h3 className="font-serif font-semibold text-[15px] mb-2">Sembrar datos iniciales</h3>
        <div className="bg-paper border border-rule p-4">
          <p className="text-[13px] text-ink-soft mb-3 max-w-[70ch]">
            Carga los 10 colaboradores y 146 registros de vacaciones oficiales
            (de los kardex CONTPAQi al 2026-10-20). Si ya existen entradas con
            los mismos datos, se omiten para evitar duplicados.
          </p>
          <button className="btn-primary" onClick={handleSeed} disabled={seedState.running}>
            {seedState.running ? 'Sembrando…' : 'Sembrar datos'}
          </button>
          {seedState.msg && (
            <p className={`text-[12px] mt-2 ${seedState.msg.startsWith('✗') ? 'text-bad' : 'text-ok'}`}>
              {seedState.msg}
            </p>
          )}
          <p className="text-[11px] text-ink-faint mt-3">
            Actualmente hay <strong>{empleados.length}</strong> colaboradores y{' '}
            <strong>{historial.length}</strong> registros en Firestore.
          </p>
        </div>
      </section>

      {/* Empleados */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-serif font-semibold text-[15px]">Colaboradores</h3>
          <button className="btn-primary" onClick={() => setNewOpen(true)}>+ Nuevo colaborador</button>
        </div>
        {le ? (
          <div className="text-center text-ink-faint py-6">Cargando…</div>
        ) : (
          <div className="tbl-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Nombre</th>
                  <th>Ingreso</th>
                  <th className="num-c">L</th>
                  <th className="num-c">M</th>
                  <th>Estatus</th>
                  <th className="num-c">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {empleados.map((e) => (
                  <tr key={e.id}>
                    <td className="num-c">{e.no}</td>
                    <td className="font-medium">{e.nombre}</td>
                    <td className="font-mono text-[12px]">{fmtDate(e.ingreso)}</td>
                    <td className="num-c">{e.L}</td>
                    <td className="num-c">{e.M}</td>
                    <td className={e.activo === false ? 'text-ink-faint' : 'text-ok'}>
                      {e.activo === false ? 'Baja' : 'Activo'}
                    </td>
                    <td className="num-c whitespace-nowrap">
                      <button className="text-accent hover:underline text-[11px] mr-2"
                              onClick={() => setEditing(e)}>Editar</button>
                      <button className="text-bad hover:underline text-[11px]"
                              onClick={() => handleDeleteEmp(e.id, e.nombre)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
                {empleados.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-ink-faint py-6">
                    No hay colaboradores. Usa el botón de arriba o siembra los datos iniciales.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar colaborador">
        <EmpleadoForm empleado={editing} onDone={() => setEditing(null)} />
      </Modal>
      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="Nuevo colaborador">
        <EmpleadoForm onDone={() => setNewOpen(false)} />
      </Modal>
    </div>
  );
}
