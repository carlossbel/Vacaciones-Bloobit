import { useMemo, useState } from 'react';
import { useCollection } from '../hooks/useCollection';
import { useAuth } from '../context/AuthContext';
import { deleteDoc, doc, db, COL } from '../firebase';
import { fmtDate } from '../lib/format';
import Modal from '../components/Modal';
import VacacionForm from '../components/VacacionForm';

export default function Historial() {
  const { data: historial, loading: lh } = useCollection('historial');
  const { data: empleados } = useCollection('empleados', 'no');
  const { canWrite } = useAuth();
  const [colab, setColab] = useState('');
  const [year, setYear] = useState('');
  const [editing, setEditing] = useState(null);
  const [newOpen, setNewOpen] = useState(false);

  const years = useMemo(
    () => [...new Set(historial.map((h) => (h.inicio || '').slice(0, 4)))].filter(Boolean).sort(),
    [historial]
  );

  const rows = useMemo(() => {
    return historial
      .filter((h) => {
        const mc = !colab || h.nombre === colab;
        const my = !year  || (h.inicio || '').startsWith(year);
        return mc && my;
      })
      .sort((a, b) => (b.inicio || '').localeCompare(a.inicio || ''));
  }, [historial, colab, year]);

  const totalDias = rows.reduce((s, r) => s + (Number(r.dias) || 0), 0);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este registro? No se puede deshacer.')) return;
    await deleteDoc(doc(db, COL.historial, id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between mb-1 pb-1.5 border-b border-rule-strong">
        <h2 className="font-serif text-[20px]">Historial de vacaciones</h2>
        <span className="text-[11px] text-ink-faint">
          {rows.length} de {historial.length} registros · {totalDias} días
        </span>
      </div>

      <div className="flex gap-2 flex-wrap items-end">
        <div>
          <label className="label">Colaborador</label>
          <select
            className="select min-w-[220px]"
            value={colab}
            onChange={(e) => setColab(e.target.value)}
          >
            <option value="">— Todos —</option>
            {empleados.map((e) => (
              <option key={e.id} value={e.nombre}>{e.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Año</label>
          <select className="select" value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">Todos</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        {(colab || year) && (
          <button className="btn-ghost" onClick={() => { setColab(''); setYear(''); }}>
            Limpiar
          </button>
        )}
        {canWrite && (
          <button className="btn-primary ml-auto" onClick={() => setNewOpen(true)}>
            + Nuevo registro
          </button>
        )}
      </div>

      {lh ? (
        <div className="text-center text-ink-faint py-8">Cargando…</div>
      ) : (
        <div className="tbl-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Fecha inicial</th>
                <th>Fecha final</th>
                <th className="num-c">Días</th>
                <th>Origen</th>
                {canWrite && <th className="num-c no-print">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((h) => (
                <tr key={h.id}>
                  <td className="font-medium">{h.nombre}</td>
                  <td className="font-mono text-[12px]">{fmtDate(h.inicio)}</td>
                  <td className="font-mono text-[12px]">{fmtDate(h.fin)}</td>
                  <td className="num-c">{h.dias}</td>
                  <td>{h.notas}</td>
                  {canWrite && (
                    <td className="num-c no-print whitespace-nowrap">
                      <button className="text-accent hover:underline text-[11px] mr-2"
                              onClick={() => setEditing(h)}>Editar</button>
                      <button className="text-bad hover:underline text-[11px]"
                              onClick={() => handleDelete(h.id)}>Eliminar</button>
                    </td>
                  )}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={canWrite ? 6 : 5} className="text-center text-ink-faint py-6">
                  Sin registros con los filtros actuales.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar registro">
        <VacacionForm empleados={empleados} registro={editing} onDone={() => setEditing(null)} />
      </Modal>
      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="Nuevo registro de vacaciones">
        <VacacionForm empleados={empleados} onDone={() => setNewOpen(false)} />
      </Modal>
    </div>
  );
}
