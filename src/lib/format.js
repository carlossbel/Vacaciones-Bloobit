/** Formateo de fechas y números para el UI */

export const fmtDate = (d) => {
  if (!d) return '';
  const date = d instanceof Date ? d : (typeof d?.toDate === 'function' ? d.toDate() : new Date(d + 'T00:00:00'));
  if (isNaN(date)) return '';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${date.getFullYear()}`;
};

export const fmtDateLong = (d) => {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d + 'T00:00:00');
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
};

export const fmtNum1 = (n) => {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return (Math.round(n * 10) / 10).toFixed(1);
};

export const todayISO = () => new Date().toISOString().slice(0, 10);
