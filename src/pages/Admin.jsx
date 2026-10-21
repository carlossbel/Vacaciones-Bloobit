import { useState } from 'react';
import { useCollection } from '../hooks/useCollection';
import { useAuth } from '../context/AuthContext';
import { deleteDoc, doc, db, COL } from '../firebase';
import { fmtDate } from '../lib/format';
import Modal from '../components/Modal';
import EmpleadoForm from '../components/EmpleadoForm';

export default function Admin() {
  const { data: empleados, loading } = useCollection('empleados', 'no');
  const { canWrite } = useAuth();
  const [editing, setEditing] = useState(null);
  const [newOpen, setNewOpen] = useState(false);

  const handleDelete = async (id, nombre) => {
    if (!confirm(`¿Dar de baja al colaborador "${nombre}"?\n\nSus registros de historial no se borran — solo deja de aparecer en el padrón.`)) return;
    await deleteDoc(doc(db, COL.empleados, id));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between mb-1 pb-1.5 border-b border-rule-strong">
        <h2 className="font-serif text-[20px]">Administración</h2>
        {canWrite && (
          <button className="btn-primary" onClick={() => setNewOpen(true)}>
            + Nuevo colaborador
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center text-ink-faint py-6">Cargando…</div>
      ) : (
        <div className="tbl-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>No.</th>
                <th>Nombre</th>
                <th>Ingreso</th>
                <th>Estatus</th>
                {canWrite && <th className="num-c">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {empleados.map((e) => (
                <tr key={e.id}>
                  <td className="num-c">{e.no}</td>
                  <td className="font-medium">{e.nombre}</td>
                  <td className="font-mono text-[12px]">{fmtDate(e.ingreso)}</td>
                  <td className={e.activo === false ? 'text-ink-faint' : 'text-ok'}>
                    {e.activo === false ? 'Baja' : 'Activo'}
                  </td>
                  {canWrite && (
                    <td className="num-c whitespace-nowrap">
                      <button className="text-accent hover:underline text-[11px] mr-2"
                              onClick={() => setEditing(e)}>Editar</button>
                      <button className="text-bad hover:underline text-[11px]"
                              onClick={() => handleDelete(e.id, e.nombre)}>Baja</button>
                    </td>
                  )}
                </tr>
              ))}
              {empleados.length === 0 && (
                <tr><td colSpan={canWrite ? 5 : 4} className="text-center text-ink-faint py-6">
                  No hay colaboradores.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar colaborador">
        <EmpleadoForm empleado={editing} onDone={() => setEditing(null)} />
      </Modal>
      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="Nuevo colaborador">
        <EmpleadoForm onDone={() => setNewOpen(false)} />
      </Modal>
    </div>
  );
}
