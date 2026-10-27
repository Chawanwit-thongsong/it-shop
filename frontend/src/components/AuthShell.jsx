// โครงหน้า Login / Register: ฝั่งซ้ายแผงดำบอกว่าสมัครแล้วได้อะไร ฝั่งขวาเป็นฟอร์ม
function AuthShell({ title, children, footer }) {
  return (
    <div className="mx-auto grid max-w-5xl gap-0 px-4 py-12 md:grid-cols-2 md:py-16">
      <aside className="hidden flex-col justify-between rounded-l-plate bg-ink p-10 text-white md:flex">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-sm font-bold text-ink">IT</span>
        <div>
          <p className="text-2xl font-semibold leading-snug">
            สั่งซื้อและติดตามออเดอร์ <span className="whitespace-nowrap">ได้ในที่เดียว</span>
          </p>
          <ul className="mt-6 space-y-2 text-sm text-white/70">
            <li>เก็บสินค้าไว้ในตะกร้า สั่งเมื่อพร้อม</li>
            <li>ดูสถานะตั้งแต่รอชำระจนจัดส่งสำเร็จ</li>
            <li>ยกเลิกเองได้ระหว่างรอชำระเงิน</li>
          </ul>
        </div>
      </aside>
      <section className="rounded-plate border border-line bg-white p-8 md:rounded-l-none md:p-10">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {children}
        <p className="mt-8 text-sm text-muted">{footer}</p>
      </section>
    </div>
  );
}

export default AuthShell;
