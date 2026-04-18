import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Users, BookOpen, Coins, AlertTriangle, Activity, Shield, Trash2, Edit, Search } from 'lucide-react';

const Admin = () => {
    const navigate = useNavigate();
  const [tab, setTab] = useState<'dashboard' | 'users' | 'readings' | 'points' | 'errors' | 'logs'>('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dashboard
  const [dashboard, setDashboard] = useState<any>(null);
  // Users
  const [users, setUsers] = useState<any[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersSearch, setUsersSearch] = useState('');
  // Readings
  const [readings, setReadings] = useState<any[]>([]);
  const [readingsTotal, setReadingsTotal] = useState(0);
  const [readingsPage, setReadingsPage] = useState(1);
  // Points
  const [pointsLogs, setPointsLogs] = useState<any[]>([]);
  const [pointsTotal, setPointsTotal] = useState(0);
  const [pointsPage, setPointsPage] = useState(1);
  // Errors
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const [errorTotal, setErrorTotal] = useState(0);
  const [errorPage, setErrorPage] = useState(1);
  // Request logs
  const [requestLogs, setRequestLogs] = useState<any[]>([]);
  const [requestTotal, setRequestTotal] = useState(0);
  const [requestPage, setRequestPage] = useState(1);

  // Edit user
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});

  const token = localStorage.getItem('token');

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    if (tab === 'dashboard') fetchDashboard();
    if (tab === 'users') fetchUsers();
    if (tab === 'readings') fetchReadings();
    if (tab === 'points') fetchPoints();
    if (tab === 'errors') fetchErrors();
    if (tab === 'logs') fetchLogs();
  }, [tab, isAdmin, usersPage, readingsPage, pointsPage, errorPage, requestPage]);

  const checkAdmin = async () => {
    try {
      const res = await fetch('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        setIsAdmin(true);
        const data = await res.json();
        setDashboard(data);
      }
    } catch {}
    setLoading(false);
  };

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setDashboard(await res.json());
    } catch {}
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/admin/users?page=${usersPage}&limit=20&search=${usersSearch}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setUsers(data.users); setUsersTotal(data.total); }
    } catch {}
  };

  const fetchReadings = async () => {
    try {
      const res = await fetch(`/api/admin/readings?page=${readingsPage}&limit=20`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setReadings(data.readings); setReadingsTotal(data.total); }
    } catch {}
  };

  const fetchPoints = async () => {
    try {
      const res = await fetch(`/api/admin/points-logs?page=${pointsPage}&limit=20`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setPointsLogs(data.logs); setPointsTotal(data.total); }
    } catch {}
  };

  const fetchErrors = async () => {
    try {
      const res = await fetch(`/api/admin/error-logs?page=${errorPage}&limit=50`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setErrorLogs(data.logs); setErrorTotal(data.total); }
    } catch {}
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`/api/admin/request-logs?page=${requestPage}&limit=50`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setRequestLogs(data.logs); setRequestTotal(data.total); }
    } catch {}
  };

  const updateUser = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: editingUser._id, ...editForm }),
      });
      if (res.ok) { setEditingUser(null); fetchUsers(); }
    } catch {}
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('确定要删除此用户吗？所有相关数据将被清除。')) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) fetchUsers();
    } catch {}
  };

  const clearErrorLogs = async () => {
    if (!confirm('清理30天前的错误日志？')) return;
    try {
      const res = await fetch('/api/admin/error-logs', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ beforeDays: 30 }),
      });
      if (res.ok) { const data = await res.json(); alert(`已清理 ${data.deleted} 条`); fetchErrors(); }
    } catch {}
  };

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  if (!isAdmin) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-400">无管理员权限</div>;

  const tabs = [
    { key: 'dashboard', label: '仪表盘', icon: Activity },
    { key: 'users', label: '用户管理', icon: Users },
    { key: 'readings', label: '占卜记录', icon: BookOpen },
    { key: 'points', label: '积分记录', icon: Coins },
    { key: 'errors', label: '错误日志', icon: AlertTriangle },
    { key: 'logs', label: '访问日志', icon: Shield },
  ] as const;

  const totalPages = (total: number, limit: number) => Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/profile')} className="text-gray-400 hover:text-white"><ChevronLeft className="w-5 h-5" /></button>
        <h1 className="text-xl font-bold">🔧 管理后台</h1>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-48 bg-gray-800 min-h-[calc(100vh-60px)] border-r border-gray-700 py-4">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${tab === t.key ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto max-h-[calc(100vh-60px)]">
          {/* Dashboard */}
          {tab === 'dashboard' && dashboard && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="总用户" value={dashboard.totalUsers} sub={`今日 +${dashboard.todayUsers}`} />
                <StatCard label="总占卜" value={dashboard.totalReadings} sub={`今日 +${dashboard.todayReadings}`} />
                <StatCard label="近7天错误" value={dashboard.recentErrors} />
                <StatCard label="积分记录" value={dashboard.totalPointsLogs} />
              </div>

              {/* 会员分布 */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-medium mb-3">会员分布</h3>
                <div className="flex gap-6">
                  {dashboard.membershipStats?.map((s: any) => (
                    <div key={s._id} className="text-center">
                      <div className="text-2xl font-bold text-indigo-400">{s.count}</div>
                      <div className="text-xs text-gray-400">{s._id || 'free'}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 7天趋势 */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-medium mb-3">近7天占卜趋势</h3>
                <div className="flex items-end gap-2 h-32">
                  {dashboard.dailyStats?.map((d: any) => (
                    <div key={d._id} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-indigo-600 rounded-t" style={{ height: `${Math.min(d.count * 5, 120)}px` }} />
                      <div className="text-xs text-gray-500 mt-1">{d._id?.slice(5)}</div>
                      <div className="text-xs text-gray-400">{d.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users */}
          {tab === 'users' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input value={usersSearch} onChange={e => setUsersSearch(e.target.value)} placeholder="搜索用户名/邮箱..."
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm" onKeyDown={e => e.key === 'Enter' && fetchUsers()} />
                <button onClick={fetchUsers} className="px-4 py-2 bg-indigo-600 rounded text-sm flex items-center gap-1"><Search className="w-4 h-4" />搜索</button>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="text-gray-400 border-b border-gray-700">
                  <th className="text-left py-2 px-2">用户名</th><th className="text-left py-2 px-2">邮箱</th>
                  <th className="text-left py-2 px-2">积分</th><th className="text-left py-2 px-2">会员</th>
                  <th className="text-left py-2 px-2">角色</th><th className="text-left py-2 px-2">注册时间</th>
                  <th className="text-left py-2 px-2">操作</th>
                </tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-2 px-2">{u.username}</td>
                      <td className="py-2 px-2 text-gray-400">{u.email}</td>
                      <td className="py-2 px-2">{u.points}</td>
                      <td className="py-2 px-2"><span className={`px-2 py-0.5 rounded text-xs ${u.membership === 'yearly' ? 'bg-yellow-600/20 text-yellow-300' : u.membership === 'monthly' ? 'bg-blue-600/20 text-blue-300' : 'bg-gray-600/20 text-gray-400'}`}>{u.membership}</span></td>
                      <td className="py-2 px-2">{u.role === 'admin' ? <span className="text-red-400">admin</span> : 'user'}</td>
                      <td className="py-2 px-2 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 px-2 flex gap-1">
                        <button onClick={() => { setEditingUser(u); setEditForm({ points: u.points, membership: u.membership, role: u.role }); }} className="p-1 hover:bg-gray-700 rounded"><Edit className="w-4 h-4 text-blue-400" /></button>
                        <button onClick={() => deleteUser(u._id)} className="p-1 hover:bg-gray-700 rounded"><Trash2 className="w-4 h-4 text-red-400" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination page={usersPage} total={totalPages(usersTotal, 20)} setPage={setUsersPage} />
            </div>
          )}

          {/* Readings */}
          {tab === 'readings' && (
            <div className="space-y-4">
              <div className="text-sm text-gray-400">共 {readingsTotal} 条记录</div>
              <table className="w-full text-sm">
                <thead><tr className="text-gray-400 border-b border-gray-700">
                  <th className="text-left py-2 px-2">用户ID</th><th className="text-left py-2 px-2">牌阵</th>
                  <th className="text-left py-2 px-2">塔罗师</th><th className="text-left py-2 px-2">时间</th>
                </tr></thead>
                <tbody>
                  {readings.map(r => (
                    <tr key={r._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-2 px-2 text-xs text-gray-400">{r.userId?.toString().slice(-6) || '匿名'}</td>
                      <td className="py-2 px-2">{r.spreadName || r.spreadType}</td>
                      <td className="py-2 px-2">{r.readerStyle}</td>
                      <td className="py-2 px-2 text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination page={readingsPage} total={totalPages(readingsTotal, 20)} setPage={setReadingsPage} />
            </div>
          )}

          {/* Points */}
          {tab === 'points' && (
            <div className="space-y-4">
              <div className="text-sm text-gray-400">共 {pointsTotal} 条记录</div>
              <table className="w-full text-sm">
                <thead><tr className="text-gray-400 border-b border-gray-700">
                  <th className="text-left py-2 px-2">用户ID</th><th className="text-left py-2 px-2">类型</th>
                  <th className="text-left py-2 px-2">数量</th><th className="text-left py-2 px-2">描述</th>
                  <th className="text-left py-2 px-2">时间</th>
                </tr></thead>
                <tbody>
                  {pointsLogs.map(p => (
                    <tr key={p._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-2 px-2 text-xs text-gray-400">{p.userId?.toString().slice(-6)}</td>
                      <td className="py-2 px-2"><span className="px-2 py-0.5 rounded text-xs bg-gray-700">{p.type}</span></td>
                      <td className={`py-2 px-2 ${p.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>{p.amount > 0 ? '+' : ''}{p.amount}</td>
                      <td className="py-2 px-2 text-gray-400 text-xs max-w-xs truncate">{p.description}</td>
                      <td className="py-2 px-2 text-xs text-gray-400">{new Date(p.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination page={pointsPage} total={totalPages(pointsTotal, 20)} setPage={setPointsPage} />
            </div>
          )}

          {/* Errors */}
          {tab === 'errors' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">共 {errorTotal} 条错误</div>
                <button onClick={clearErrorLogs} className="px-3 py-1 bg-red-600/20 text-red-300 rounded text-sm hover:bg-red-600/30 flex items-center gap-1"><Trash2 className="w-3 h-3" />清理30天前</button>
              </div>
              <div className="space-y-2">
                {errorLogs.map(e => (
                  <div key={e._id} className="bg-gray-800 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-xs bg-red-600/20 text-red-300">{e.type}</span>
                        <span className="text-sm">{e.message}</span>
                      </div>
                      <span className="text-xs text-gray-500">{new Date(e.createdAt).toLocaleString()}</span>
                    </div>
                    {e.path && <div className="text-xs text-gray-500 mt-1">{e.method} {e.path}</div>}
                    {e.stack && <pre className="text-xs text-gray-600 mt-1 max-h-24 overflow-auto">{e.stack}</pre>}
                  </div>
                ))}
              </div>
              <Pagination page={errorPage} total={totalPages(errorTotal, 50)} setPage={setErrorPage} />
            </div>
          )}

          {/* Request Logs */}
          {tab === 'logs' && (
            <div className="space-y-4">
              <div className="text-sm text-gray-400">共 {requestTotal} 条记录</div>
              <table className="w-full text-sm">
                <thead><tr className="text-gray-400 border-b border-gray-700">
                  <th className="text-left py-2 px-2">方法</th><th className="text-left py-2 px-2">路径</th>
                  <th className="text-left py-2 px-2">状态</th><th className="text-left py-2 px-2">耗时</th>
                  <th className="text-left py-2 px-2">IP</th><th className="text-left py-2 px-2">时间</th>
                </tr></thead>
                <tbody>
                  {requestLogs.map(l => (
                    <tr key={l._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-2 px-2"><span className="px-1.5 py-0.5 rounded text-xs bg-blue-600/20 text-blue-300">{l.method}</span></td>
                      <td className="py-2 px-2 text-xs">{l.path}</td>
                      <td className={`py-2 px-2 ${(l.statusCode >= 400) ? 'text-red-400' : 'text-green-400'}`}>{l.statusCode}</td>
                      <td className="py-2 px-2 text-xs text-gray-400">{l.duration}ms</td>
                      <td className="py-2 px-2 text-xs text-gray-500">{l.ip?.slice(-12)}</td>
                      <td className="py-2 px-2 text-xs text-gray-400">{new Date(l.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination page={requestPage} total={totalPages(requestTotal, 50)} setPage={setRequestPage} />
            </div>
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setEditingUser(null)}>
          <div className="bg-gray-800 rounded-lg p-6 w-96" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-4">编辑用户: {editingUser.username}</h3>
            <div className="space-y-3">
              <div><label className="text-sm text-gray-400">积分</label>
                <input type="number" value={editForm.points} onChange={e => setEditForm({...editForm, points: Number(e.target.value)})}
                  className="w-full px-3 py-2 bg-gray-700 rounded mt-1" /></div>
              <div><label className="text-sm text-gray-400">会员</label>
                <select value={editForm.membership} onChange={e => setEditForm({...editForm, membership: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 rounded mt-1">
                  <option value="free">free</option><option value="monthly">monthly</option><option value="yearly">yearly</option>
                </select></div>
              <div><label className="text-sm text-gray-400">角色</label>
                <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 rounded mt-1">
                  <option value="user">user</option><option value="admin">admin</option>
                </select></div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={updateUser} className="flex-1 py-2 bg-indigo-600 rounded hover:bg-indigo-500">保存</button>
              <button onClick={() => setEditingUser(null)} className="flex-1 py-2 bg-gray-700 rounded hover:bg-gray-600">取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, sub }: { label: string; value: number; sub?: string }) => (
  <div className="bg-gray-800 rounded-lg p-4">
    <div className="text-sm text-gray-400">{label}</div>
    <div className="text-2xl font-bold mt-1">{value.toLocaleString()}</div>
    {sub && <div className="text-xs text-green-400 mt-1">{sub}</div>}
  </div>
);

const Pagination = ({ page, total, setPage }: { page: number; total: number; setPage: (p: number) => void }) => (
  <div className="flex items-center justify-center gap-2 mt-4">
    <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
      className="px-3 py-1 bg-gray-700 rounded text-sm disabled:opacity-30">上一页</button>
    <span className="text-sm text-gray-400">{page} / {total || 1}</span>
    <button onClick={() => setPage(page + 1)} disabled={page >= total}
      className="px-3 py-1 bg-gray-700 rounded text-sm disabled:opacity-30">下一页</button>
  </div>
);

export default Admin;
