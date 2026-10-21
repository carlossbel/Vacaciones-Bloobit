import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc, db, COL, CONFIG_DOC_ID } from '../firebase';
import { todayISO } from '../lib/format';

const DEFAULT_CONFIG = {
  corte: todayISO(),
  corteKardex: '2026-08-15',
};

export function useConfig() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, COL.config, CONFIG_DOC_ID);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setConfig({ ...DEFAULT_CONFIG, ...snap.data() });
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const updateConfig = async (partial) => {
    const ref = doc(db, COL.config, CONFIG_DOC_ID);
    await setDoc(ref, { ...config, ...partial }, { merge: true });
  };

  return { config, updateConfig, loading };
}
