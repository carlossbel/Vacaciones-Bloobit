import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy as fsOrderBy, db } from '../firebase';

/**
 * Suscripción en vivo a una colección Firestore.
 * @param {string} path Nombre de la colección
 * @param {string} orderField Campo opcional por el que ordenar
 */
export function useCollection(path, orderField = null, dir = 'asc') {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const base = collection(db, path);
    const q = orderField ? query(base, fsOrderBy(orderField, dir)) : base;
    const unsub = onSnapshot(
      q,
      (snap) => {
        setData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error('Firestore error:', err);
        setError(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [path, orderField, dir]);

  return { data, loading, error };
}
