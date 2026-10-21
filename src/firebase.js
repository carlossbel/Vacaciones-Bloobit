import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';

/**
 * Config de Firebase.
 *
 * Las credenciales se toman de variables de entorno (.env) para no
 * acoplar el código al proyecto. Si ninguna variable VITE_FIREBASE_* está
 * presente, se usan los defaults del proyecto Bloobit (vacaciones-bloobit).
 *
 * NOTA: Las apiKey de Firebase para apps web NO son secretas por diseño —
 * la seguridad vive en las reglas de Firestore. Aun así es buena práctica
 * mantenerlas en .env por si se cambia de proyecto.
 */
const DEFAULT_CONFIG = {
  apiKey: "AIzaSyBZ0m_makM1NGST56g2_u3Ml-bGExhNC0c",
  authDomain: "vacaciones-bloobit.firebaseapp.com",
  projectId: "vacaciones-bloobit",
  storageBucket: "vacaciones-bloobit.firebasestorage.app",
  messagingSenderId: "541107070963",
  appId: "1:541107070963:web:cee9912491323dc4e29486",
  measurementId: "G-YPT1XNNMMS",
};

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || DEFAULT_CONFIG.apiKey,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || DEFAULT_CONFIG.authDomain,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || DEFAULT_CONFIG.projectId,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || DEFAULT_CONFIG.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID|| DEFAULT_CONFIG.messagingSenderId,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || DEFAULT_CONFIG.appId,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export {
  collection, doc, addDoc, updateDoc, deleteDoc, setDoc,
  getDoc, getDocs, onSnapshot, query, orderBy, writeBatch, serverTimestamp,
};

export const COL = {
  empleados: 'empleados',
  historial: 'historial',
  config: 'config',
};
export const CONFIG_DOC_ID = 'global';
