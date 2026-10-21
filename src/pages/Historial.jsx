import { useMemo, useState } from 'react';
import { useCollection } from '../hooks/useCollection';
import { deleteDoc, doc, db, COL } from '../firebase';
import { fmtDate } from '../lib/format';
import Modal from '../components/Modal';
import VacacionForm from '../components/VacacionForm';

export default function Historial() {
  const { data: historial, loading: lh } = useCollection('historial');
  const { data: empleados } = useCollection('empleados', 'no');
  const [q, setQ] = useState('');
  const [year, setYear] = useState('');
  const [editing, setEditing] = useState(null);
  const [newOpen, setNewOpen] = useState(false);

  const years = useMemo(
    () => [...new Set(historial.map((h) => (h.inicio || '').slice(0, 4)))].filter(Boolean).sort(),
    [historial]
  );
  const rows = useMemo(() => {
    const qN = q.trim().toLowerCase();
    return historial
      .filter((h) => {
        const mq = !qN
          || (h.nombre || '').toLowerCase().includes(qN)
          || (h.notas  || '').toLowerCase().includes(qN);
        const my = !year || (h.inicio || '').startsWith(year);
        return mq && my;
      })
      .sort((a, b) => (b.inicio || '').localeCompare(a.inicio || ''));
  }, [historial, q, year]);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este registro? No se puede deshacer.')) return;
    await deleteDoc(doc(db, COL.historial, id));
  };

  return (
    <div className="space-y-4">
      <div className="sec-hd">
        <span className="sec-num">5.</span>
        <span className="sec-title">Historial de vacaciones</span>
        <span className="sec-note">{rows.length} de {historial.length} registros</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        <input
          type="search"
          className="input flex-1 min-w-[200px]"
          placeholder="Buscar por nombre u origen…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="select" value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">Todos los años</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <button className="btn-primary ml-auto" onClick={() => setNewOpen(true)}>
          + Nuevo registro
        </button>
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
                <th className="num-c no-print">Acciones</th>
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
                  <td className="num-c no-print whitespace-nowrap">
                    <button className="text-accent hover:underline text-[11px] mr-2"
                            onClick={() => setEditing(h)}>Editar</button>
                    <button className="text-bad hover:underline text-[11px]"
                            onClick={() => handleDelete(h.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="text-center text-ink-faint py-6">
                  No hay registros.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar registro">
        <VacacionForm
          empleados={empleados}
          registro={editing}
          onDone={() => setEditing(null)}
        />
      </Modal>
      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="Nuevo registro de vacaciones">
        <VacacionForm empleados={empleados} onDone={() => setNewOpen(false)} />
      </Modal>
    </div>
  );
}
