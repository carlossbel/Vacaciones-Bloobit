import { useEffect, useState } from 'react';
import { collection, addDoc, updateDoc, doc, serverTimestamp, db, COL } from '../firebase';

/** Cuenta días hábiles (L–V) entre dos fechas inclusive, excluyendo sábado/domingo. */
function diasHabilesEntre(inicio, fin) {
  if (!inicio || !fin) return 0;
  const a = new Date(inicio + 'T00:00:00');
  const b = new Date(fin + 'T00:00:00');
  if (b < a) return 0;
  let n = 0;
  const cur = new Date(a);
  while (cur <= b) {
    const d = cur.getDay();
    if (d !== 0 && d !== 6) n++;
    cur.setDate(cur.getDate() + 1);
  }
  return n;
}

export default function VacacionForm({ empleados, registro, onDone }) {
  const isEdit = Boolean(registro?.id);
  const [form, setForm] = useState({
    nombre: '',
    inicio: '',
    fin: '',
    dias: '',
    notas: 'RH',
  });
  const [autoDias, setAutoDias] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (registro) {
      setForm({
        nombre: registro.nombre ?? '',
        inicio: registro.inicio ?? '',
        fin: registro.fin ?? '',
        dias: registro.dias ?? '',
        notas: registro.notas ?? 'RH',
      });
      setAutoDias(false);
    }
  }, [registro]);

  useEffect(() => {
    if (autoDias && form.inicio && form.fin) {
      const h = diasHabilesEntre(form.inicio, form.fin);
      setForm((f) => ({ ...f, dias: h }));
    }
  }, [form.inicio, form.fin, autoDias]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        nombre: form.nombre,
        inicio: form.inicio,
        fin: form.fin,
        dias: Number(form.dias),
        notas: form.notas,
        updatedAt: serverTimestamp(),
      };
      if (isEdit) {
        await updateDoc(doc(db, COL.historial, registro.id), payload);
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, COL.historial), payload);
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
      <div>
        <label className="label">Colaborador</label>
        <select
          required
          className="select w-full"
          value={form.nombre}
          onChange={(e) => set('nombre', e.target.value)}
        >
          <option value="">— selecciona —</option>
          {empleados.map((e) => (
            <option key={e.id} value={e.nombre}>{e.nombre}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Fecha inicial</label>
          <input
            type="date" required
            className="input w-full font-mono"
            value={form.inicio}
            onChange={(e) => set('inicio', e.target.value)}
          />
        </div>
        <div>
          <label className="label">Fecha final</label>
          <input
            type="date" required
            className="input w-full font-mono"
            value={form.fin}
            onChange={(e) => set('fin', e.target.value)}
          />
        </div>
      </div>
      <div>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="label">Días (laborables)</label>
            <input
              type="number" min="0" step="0.5" required
              className="input w-full font-mono"
              value={form.dias}
              onChange={(e) => { set('dias', e.target.value); setAutoDias(false); }}
            />
          </div>
          <label className="flex items-center gap-1.5 text-xs text-ink-soft pb-2">
            <input
              type="checkbox"
              checked={autoDias}
              onChange={(e) => setAutoDias(e.target.checked)}
            />
            Calcular L–V
          </label>
        </div>
      </div>
      <div>
        <label className="label">Origen / notas</label>
        <input
          type="text"
          className="input w-full"
          value={form.notas}
          onChange={(e) => set('notas', e.target.value)}
          placeholder="RH, Histórico (CONTPAQi), etc."
        />
      </div>
      {error && (
        <div className="text-bad text-xs border border-bad p-2" style={{background:'color-mix(in srgb, var(--c-bad) 10%, var(--c-paper))'}}>{error}</div>
      )}
      <div className="flex gap-2 justify-end pt-2 border-t border-rule-soft">
        <button type="button" className="btn-ghost" onClick={() => onDone?.()}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Registrar')}
        </button>
      </div>
    </form>
  );
}
