import { useCallback, useState } from 'react';
import * as api from '../../api/backend';
import { useAuth } from '../../auth/AuthContext';
import { useApi } from '../../hooks/useApi';
import { ConfirmBox, Empty, ErrorBox, Loading, btnGhost } from '../../components/States';
import { dateTime } from '../../utils/format';

function AdminMembers() {
  const { token, member: me } = useAuth();
  const list = useApi(useCallback(() => api.getAdminMembers(token), [token]));
  const [target, setTarget] = useState(null); // { member, role }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function confirmRole() {
    setBusy(true);
    setError('');
    try {
      const updated = await api.setMemberRole(target.member.id, target.role, token);
      list.setData(list.data.map((m) => (m.id === updated.id ? updated : m)));
      setTarget(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">จัดการสมาชิก</h1>
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="mt-6">
        {list.loading ? (
          <Loading />
        ) : list.error ? (
          <ErrorBox error={list.error} onRetry={list.reload} />
        ) : list.data.length === 0 ? (
          <Empty title="ยังไม่มีสมาชิก" />
        ) : (
          <div className="overflow-x-auto rounded-plate border border-line bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="bg-plate text-xs font-medium text-muted">
                <tr>
                  <th className="p-3">ชื่อ</th>
                  <th className="p-3">อีเมล</th>
                  <th className="p-3">สมัครเมื่อ</th>
                  <th className="p-3">บทบาท</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {list.data.map((m) => {
                  const nextRole = m.role === 'admin' ? 'member' : 'admin';
                  return (
                    <tr key={m.id} className="border-t border-line transition-colors hover:bg-plate/60">
                      <td className="p-3 font-medium">{m.displayName}</td>
                      <td className="p-3 text-muted">{m.email}</td>
                      <td className="p-3 text-muted">{dateTime(m.createdAt)}</td>
                      <td className="p-3">
                        <span className={`rounded px-2 py-0.5 text-xs ${m.role === 'admin' ? 'bg-accent-soft text-accent-dark' : 'bg-plate text-muted'}`}>
                          {m.role}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {m.id === me?.id ? (
                          <span className="text-xs text-muted">(คุณ)</span>
                        ) : (
                          <button onClick={() => setTarget({ member: m, role: nextRole })} className={btnGhost}>
                            {nextRole === 'admin' ? 'ตั้งเป็น admin' : 'ลดเป็น member'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmBox open={Boolean(target)} title="เปลี่ยนบทบาท?" busy={busy}
                  onConfirm={confirmRole} onCancel={() => setTarget(null)}>
        {target?.member.displayName} จะเป็น <b>{target?.role}</b> (มีผลหลังเจ้าตัว login ใหม่)
      </ConfirmBox>
    </div>
  );
}

export default AdminMembers;
