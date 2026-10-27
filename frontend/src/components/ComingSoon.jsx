// ใช้แทนหน้าที่ยังไม่ได้ทำ จะได้กดเมนูได้ครบตั้งแต่วันแรก
function ComingSoon({ title, children }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
      <p className="mt-2 text-slate-400">{children ?? 'ส่วนนี้จะทำในรอบถัดไป'}</p>
    </div>
  );
}

export default ComingSoon;
