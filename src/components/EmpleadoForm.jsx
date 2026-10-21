import { useEffect, useState } from 'react';
import { collection, addDoc, updateDoc, doc, serverTimestamp, db, COL } from '../firebase';

export default function EmpleadoForm({ empleado, onDone }) {
  const isEdit = Boolean(empleado?.id);
  const [form, setForm] = useState({
    no: '',
    nombre: '',
    ingreso: '',
    L: 0,
    M: 0,
    activo: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (empleado) {
      setForm({
        no: empleado.no ?? '',
        nombre: empleado.nombre ?? '',
        ingreso: empleado.ingreso ?? '',
        L: empleado.L ?? 0,
        M: empleado.M ?? 0,
        activo: empleado.activo !== false,
      });
    }
  }, [empleado]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        no: Number(form.no),
        nombre: form.nombre.trim(),
        ingreso: form.ingreso,
        L: Number(form.L) || 0,
        M: Number(form.M) || 0,
        activo: form.activo,
        updatedAt: serverTimestamp(),
      };
      if (isEdit) {
        await updateDoc(doc(db, COL.empleados, empleado.id), payload);
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, COL.empleados), payload);
      }
      onDone?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">No.</label>
          <input
            type="number" min="1" required
            className="input w-full"
            value={form.no}
            onChange={(e) => set('no', e.target.value)}
          />
        </div>
        <div>
          <label className="label">Fecha de ingreso</label>
          <input
            type="date" required
            className="input w-full font-mono"
            value={form.ingreso}
            onChange={(e) => set('ingreso', e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="label">Nombre completo</label>
        <input
          type="text" required
          className="input w-full"
          value={form.nombre}
          onChange={(e) => set('nombre', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">L — Baseline generados</label>
          <input
            type="number" min="0" step="1"
            className="input w-full font-mono"
            value={form.L}
            onChange={(e) => set('L', e.target.value)}
          />
          <p className="text-[10.5px] text-ink-faint mt-1">
            Días LFT acumulados antes del corte del kárdex (2026-08-15).
          </p>
        </div>
        <div>
          <label className="label">M — Baseline tomados</label>
          <input
            type="number" min="0" step="1"
            className="input w-full font-mono"
            value={form.M}
            onChange={(e) => set('M', e.target.value)}
          />
          <p className="text-[10.5px] text-ink-faint mt-1">
            Días tomados que no están en el historial digital.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="activo" type="checkbox"
          checked={form.activo}
          onChange={(e) => set('activo', e.target.checked)}
        />
        <label htmlFor="activo" className="text-sm">Colaborador activo</label>
      </div>
      {error && (
        <div className="text-bad text-xs border border-bad p-2" style={{background:'color-mix(in srgb, var(--c-bad) 10%, var(--c-paper))'}}>{error}</div>
      )}
      <div className="flex gap-2 justify-end pt-2 border-t border-rule-soft">
        <button type="button" className="btn-ghost" onClick={() => onDone?.()}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Agregar')}
        </button>
      </div>
    </form>
  );
}
