/**
 * FO-RH-003 Control de Vacaciones — fórmulas de cálculo
 *
 * CORREGIDO v2 (2026-10-21) tras cotejar contra kárdex oficiales de CONTPAQi.
 *
 * Conforme a:
 *   - Ley Federal del Trabajo, Art. 76 (reforma DOF 27-12-2022)
 *   - Art. 79 (gozar en forma continua al menos 12 días)
 *   - Art. 80 (prima vacacional mínima 25%)
 *   - Art. 81 (prescripción: 1 año para exigir, 6 meses adicionales)
 *
 * FÓRMULA CENTRAL (K = SALDO):
 *   K = D + H − E
 *   donde:
 *     D = baseline L (días LFT de aniversarios cumplidos hasta corte_kárdex)
 *       + Σ LFT[y] de aniversarios cumplidos entre corte_kárdex y hoy
 *     H = G × (días transcurridos del año en curso / 365)
 *     E = baseline M (tomados pre-registro) + Σ días del historial del empleado
 *
 *   Esta fórmula replica el cálculo CONTPAQi: saldo acumulado histórico.
 */

// ───────────────────────────────────────────────────────────────────────────
//  TABLA LFT
// ───────────────────────────────────────────────────────────────────────────

/** LFT reformada 2022 (vigente para aniversarios cumplidos ≥ 2023-01-01). */
export const LFT_POST_REFORMA = {
  1: 12, 2: 14, 3: 16, 4: 18, 5: 20,
  6: 22, 7: 22, 8: 22, 9: 22, 10: 22,
  11: 24, 12: 24, 13: 24, 14: 24, 15: 24,
  16: 26, 17: 26, 18: 26, 19: 26, 20: 26,
  21: 28, 22: 28, 23: 28, 24: 28, 25: 28,
  26: 30, 27: 30, 28: 30, 29: 30, 30: 30,
};

/** LFT previa a la reforma (vigente para aniversarios cumplidos < 2023-01-01). */
export const LFT_PRE_REFORMA = {
  1: 6, 2: 8, 3: 10, 4: 12, 5: 14,
  6: 14, 7: 14, 8: 14, 9: 14,
  10: 16, 11: 16, 12: 16, 13: 16, 14: 16,
  15: 18, 16: 18, 17: 18, 18: 18, 19: 18,
  20: 20, 21: 20, 22: 20, 23: 20, 24: 20,
  25: 22, 26: 22, 27: 22, 28: 22, 29: 22, 30: 22,
};

export const FECHA_REFORMA_LFT = '2023-01-01';
export const PRIMA_VACACIONAL_MIN = 0.25;
export const DIAS_AÑO = 365;

/** Fecha de corte del kárdex histórico — baselines L y M calculados a esta fecha. */
export const CORTE_KARDEX = '2026-08-15';

/**
 * Devuelve los días LFT correspondientes al año de servicio N cumplido en la
 * fecha fechaAniv. Aplica pre o post reforma según corresponda.
 */
export function diasLFT(indiceAño, fechaAniv) {
  const fecha = parseDate(fechaAniv);
  const tabla = fecha && fecha < parseDate(FECHA_REFORMA_LFT)
    ? LFT_PRE_REFORMA
    : LFT_POST_REFORMA;
  return tabla[indiceAño] ?? (indiceAño >= 30 ? 30 : 12);
}

// ───────────────────────────────────────────────────────────────────────────
//  UTILIDADES DE FECHA
// ───────────────────────────────────────────────────────────────────────────

export const parseDate = (s) => {
  if (!s) return null;
  if (s instanceof Date) return s;
  if (typeof s === 'object' && s.toDate) return s.toDate();
  if (typeof s === 'string') return new Date(s + 'T00:00:00');
  return null;
};

export const toISODate = (d) => {
  if (!d) return '';
  const date = parseDate(d);
  return date ? date.toISOString().slice(0, 10) : '';
};

export function datedifYears(start, end) {
  const s = parseDate(start);
  const e = parseDate(end);
  if (!s || !e) return 0;
  let y = e.getFullYear() - s.getFullYear();
  const sm = s.getMonth(), sd = s.getDate();
  const em = e.getMonth(), ed = e.getDate();
  if (em < sm || (em === sm && ed < sd)) y--;
  return Math.max(0, y);
}

export function addMonths(d, m) {
  const r = new Date(parseDate(d));
  r.setMonth(r.getMonth() + m);
  return r;
}

export function daysBetween(a, b) {
  return Math.floor((parseDate(b) - parseDate(a)) / 86400000);
}

/** Cuenta días hábiles (lun-vie) entre dos fechas inclusive. */
export function diasHabiles(inicio, fin) {
  const a = parseDate(inicio);
  const b = parseDate(fin);
  if (!a || !b || b < a) return 0;
  let n = 0;
  const cur = new Date(a);
  while (cur <= b) {
    const d = cur.getDay();
    if (d !== 0 && d !== 6) n++;
    cur.setDate(cur.getDate() + 1);
  }
  return n;
}

// ───────────────────────────────────────────────────────────────────────────
//  CÁLCULO PRINCIPAL
// ───────────────────────────────────────────────────────────────────────────

/**
 * Calcula el saldo de vacaciones acumulado de un empleado al día de corte.
 * Replica la lógica CONTPAQi.
 *
 * @returns {Object}
 *   F              - Antigüedad (años cumplidos)
 *   G              - Días LFT del año aniversario EN CURSO (año F+1)
 *   D              - Días LFT acumulados por aniversarios cumplidos (+ baseline L)
 *   E              - Días tomados en toda la historia (+ baseline M)
 *   H              - Días devengados prorrateados del año en curso
 *   I              - Días tomados DURANTE el año aniversario en curso
 *   K              - SALDO disponible = D + H − E  ← fórmula CONTPAQi
 *   anivStart/End  - límites del año aniversario en curso
 *   histAnio       - registros del año aniversario actual
 *   histEmp        - todos los registros del empleado
 *   primaVacacional - G × 25% (base para prima; multiplicar por salario diario)
 *   excedido       - true si K < 0
 */
export function calcularVacaciones(empleado, corte, historial = [], corteKardex = CORTE_KARDEX) {
  const corteDate = parseDate(corte);
  const ingreso = parseDate(empleado.ingreso);
  if (!ingreso) {
    return { F:0, G:0, D:0, E:0, H:0, I:0, K:0 };
  }

  // F — Antigüedad al corte
  const F = datedifYears(ingreso, corteDate);

  // G — LFT del año aniversario en curso (el que apenas corre, F+1)
  //    (usa tabla POST reforma porque es un aniversario futuro, siempre > 2023)
  const anivStart = addMonths(ingreso, F * 12);
  const anivEnd   = addMonths(anivStart, 12);
  const G = diasLFT(F + 1, anivEnd);   // año N+1 que se cumple al final del aniversario

  // D — Total generados en su totalidad
  //    = baseline L + años aniversario cumplidos entre corte_kardex y hoy
  const corteKardexDate = parseDate(corteKardex);
  const Fatcorte = datedifYears(ingreso, corteKardexDate);
  let extraDias = 0;
  for (let y = Fatcorte + 1; y <= F; y++) {
    const fechaAniv = addMonths(ingreso, y * 12);
    extraDias += diasLFT(y, fechaAniv);
  }
  const D = (Number(empleado.L) || 0) + extraDias;

  // E — Total tomados = baseline M + suma de historial del empleado
  const histEmp = historial.filter((h) => h.nombre === empleado.nombre);
  const sumHist = histEmp.reduce((s, h) => s + (Number(h.dias) || 0), 0);
  const E = (Number(empleado.M) || 0) + sumHist;

  // H — Prorrateado del año en curso
  const diasTranscurridos = daysBetween(anivStart, corteDate);
  const H = (G * diasTranscurridos) / DIAS_AÑO;

  // I — Tomados DURANTE el año aniversario actual (informativo)
  const histAnio = histEmp
    .filter((h) => {
      const d = parseDate(h.inicio);
      return d && d >= anivStart && d <= corteDate;
    })
    .sort((a, b) => parseDate(a.inicio) - parseDate(b.inicio));
  const I = histAnio.reduce((s, h) => s + (Number(h.dias) || 0), 0);

  // K — SALDO disponible (fórmula CONTPAQi, incluye prorrateo del año en curso)
  const K = D + H - E;

  // TOMABLE — solo los días ya cerrados por aniversarios cumplidos (D − E).
  // Representa lo que el colaborador PUEDE tomar HOY sin "pedir prestado"
  // del año en curso que aún no termina de devengarse.
  const tomable = D - E;

  // Prima vacacional (base — multiplicar por salario diario para pesos)
  const primaVacacional = G * PRIMA_VACACIONAL_MIN;

  return {
    F,
    G,
    D,
    E,
    H,
    I,
    K,
    tomable,
    anivStart,
    anivEnd,
    diasTranscurridos,
    histAnio,
    histEmp,
    primaVacacional,
    excedido: K < 0,
    sinTomable: tomable <= 0,
  };
}

/** Clasificación visual del saldo. */
export function clasificarSaldo(K) {
  if (K < 0) return 'bad';
  if (K <= 3) return 'warn';
  return 'ok';
}

/** Resumen de todo el padrón al día de corte. */
export function resumenPadron(empleados, historial, corte) {
  const filas = empleados.map((e) => ({
    empleado: e,
    calc: calcularVacaciones(e, corte, historial),
  }));
  const total = filas.length;
  const conSaldoPositivo = filas.filter((f) => f.calc.K > 0).length;
  const excedidos = filas.filter((f) => f.calc.excedido).length;
  const promedio = total > 0 ? filas.reduce((s, f) => s + f.calc.K, 0) / total : 0;
  const sumaSaldos = filas.reduce((s, f) => s + f.calc.K, 0);
  return { filas, total, conSaldoPositivo, excedidos, promedio, sumaSaldos };
}

// ───────────────────────────────────────────────────────────────────────────
//  REPORTES
// ───────────────────────────────────────────────────────────────────────────

/**
 * Registros tomados en un rango de fechas (inclusive).
 */
export function registrosEnRango(historial, desde, hasta) {
  const d = parseDate(desde);
  const h = parseDate(hasta);
  return historial
    .filter((r) => {
      const f = parseDate(r.inicio);
      return f && f >= d && f <= h;
    })
    .sort((a, b) => parseDate(a.inicio) - parseDate(b.inicio));
}

/**
 * Agrupa un conjunto de registros por empleado, devolviendo total de días.
 */
export function totalesPorEmpleado(registros) {
  const map = new Map();
  for (const r of registros) {
    const prev = map.get(r.nombre) || { nombre: r.nombre, dias: 0, registros: 0 };
    prev.dias += Number(r.dias) || 0;
    prev.registros += 1;
    map.set(r.nombre, prev);
  }
  return [...map.values()].sort((a, b) => b.dias - a.dias);
}

/**
 * Agrupa por mes dentro de un rango dado.
 */
export function totalesPorMes(registros) {
  const map = new Map();
  for (const r of registros) {
    const key = (r.inicio || '').slice(0, 7); // YYYY-MM
    const prev = map.get(key) || { mes: key, dias: 0, registros: 0 };
    prev.dias += Number(r.dias) || 0;
    prev.registros += 1;
    map.set(key, prev);
  }
  return [...map.values()].sort((a, b) => a.mes.localeCompare(b.mes));
}

/**
 * Exporta cualquier arreglo de objetos a texto CSV (RFC 4180).
 */
export function toCSV(rows, headers) {
  const esc = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const cols = headers || (rows[0] ? Object.keys(rows[0]) : []);
  const head = cols.join(',');
  const body = rows.map((r) => cols.map((c) => esc(r[c])).join(',')).join('\n');
  return head + '\n' + body;
}
