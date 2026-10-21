# FO-RH-003 Control de Vacaciones

Sistema web para el control de vacaciones de Bloobit México, conforme a la Ley Federal del Trabajo (Art. 76, reforma 2022). Stack: **React + Vite + Firebase (Firestore)** con Tailwind CSS.

## Qué incluye

- Padrón de colaboradores con días LFT, devengados y disponibles al día de corte.
- Kardex individual imprimible (PDF vía navegador).
- Historial completo filtrable.
- Alta/baja/edición de colaboradores y de registros de vacaciones.
- Persistencia en Firestore (acceso multi-usuario).
- Botón de "sembrar datos" para poblar la BD con los 11 colaboradores y 138 registros iniciales (el estado actual de Bloobit al 2026-10-19).

## Fórmulas de cálculo

Todas documentadas en `src/lib/calc.js`. Resumen:

| Campo | Fórmula | Descripción |
|---|---|---|
| F | `DATEDIF(ingreso, corte, "Y")` | Antigüedad en años cumplidos |
| G | `LFT[F+1]` | Días LFT del año aniversario en curso |
| D | `L + Σ LFT[y]` para `y > F@corte_kardex, y ≤ F` | Días generados en su totalidad |
| E | `M + Σ historial.dias` | Días tomados en su totalidad |
| H | `G × (días_transcurridos / 365)` | Devengado prorrateado al corte |
| I | `Σ historial.dias` cuyo `inicio ∈ [aniv_actual, corte]` | Tomados en el año aniversario |
| **K** | **`G − I`** | **Disponibles a tomar** |

`L` y `M` son baselines del kárdex histórico al 2026-08-15 (ajustables por empleado).

## Puesta en marcha

### 1. Requisitos

- Node.js 20+ y npm.
- Cuenta de Firebase con un proyecto creado y Firestore habilitado en **modo de producción**.

### 2. Instalar

```bash
npm install
```

### 3. Configurar Firebase

En [Firebase Console](https://console.firebase.google.com):
1. Crea un proyecto (p. ej. `bloobit-vacaciones`).
2. Habilita Firestore Database.
3. En *Project settings → Your apps → Web*, registra una app y copia el `firebaseConfig`.
4. Copia `.env.example` como `.env` y pega los valores:

```bash
cp .env.example .env
```

5. Edita `.env` con tus credenciales.

### 4. Reglas de Firestore

Durante desarrollo puedes usar `firestore.rules` incluido (abierto). Para producción, protege con Firebase Auth (hay un TODO en el archivo).

```bash
# Opcional, si usas Firebase CLI:
firebase deploy --only firestore:rules
```

### 5. Correr en local

```bash
npm run dev
```

Abre `http://localhost:5173`.

### 6. Sembrar datos iniciales (una sola vez)

En la app, ve a **Administración → Sembrar datos** y haz clic en el botón. Esto crea los 11 colaboradores y 138 registros de vacaciones en Firestore.

> ⚠️ Si ya hay datos en Firestore, el seed los conservará y solo agregará los faltantes.

### 7. Deployar

**Vercel / Netlify / Firebase Hosting:** build con `npm run build` y sube la carpeta `dist/`. Configura las variables de entorno `VITE_FIREBASE_*` en el panel del hosting.

```bash
npm run build
npm run preview   # para probar el build local
```

## Estructura del proyecto

```
src/
├── main.jsx                 Entry
├── App.jsx                  Rutas + Layout
├── index.css                Tailwind + estilos de impresión
├── firebase.js              Firebase init + helpers
├── lib/
│   ├── calc.js              Todas las fórmulas de vacaciones (documentadas)
│   ├── format.js            Utilidades de fecha
│   └── seedData.js          Datos iniciales (11 empleados, 138 registros)
├── hooks/
│   ├── useCollection.js     Suscripción a una colección Firestore
│   └── useConfig.js         Configuración global (fecha de corte, etc.)
├── components/
│   ├── Layout.jsx           Shell con sidebar
│   ├── Sidebar.jsx
│   ├── Modal.jsx
│   ├── EmpleadoForm.jsx     Alta/edición de colaborador
│   └── VacacionForm.jsx     Alta/edición de registro de vacaciones
└── pages/
    ├── Padron.jsx           Tabla principal
    ├── Kardex.jsx           Vista individual imprimible
    ├── Historial.jsx        Todos los registros
    └── Admin.jsx            Empleados + seed + configuración
```

## Imprimir kardex

Entra a *Kardex Individual*, selecciona el colaborador y usa **Ctrl + P** (o `⌘ + P` en Mac). El CSS de impresión oculta la navegación y deja solo el documento.

## Licencia

Uso interno de Bloobit México, S.A. de C.V.
