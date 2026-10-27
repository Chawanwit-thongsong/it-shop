import { useCallback, useEffect, useState } from 'react';

// useApi เรียก API ตอนเปิดหน้า แล้วคืนสถานะครบ 3 แบบที่ทุกหน้าต้องมี: loading / error / data
// loader ต้องห่อด้วย useCallback ในหน้าที่เรียก ไม่งั้นจะยิงซ้ำทุกครั้งที่ render
export function useApi(loader) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [round, setRound] = useState(0); // เพิ่มเลขเพื่อสั่งโหลดใหม่ (ปุ่ม "ลองใหม่")

  useEffect(() => {
    let alive = true; // กันกรณีออกจากหน้าไปแล้วผลเพิ่งกลับมา
    setLoading(true);
    setError(null);
    loader()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [loader, round]);

  const reload = useCallback(() => setRound((n) => n + 1), []);
  return { data, loading, error, reload, setData };
}
