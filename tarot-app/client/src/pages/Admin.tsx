import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Users, BookOpen, Coins, AlertTriangle, Activity, Shield, Trash2, Edit, Search, Eye, X, Save } from 'lucide-react';
import SEO from '../components/SEO';

const Admin = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [tab, setTab] = useState<'dashboard' | 'users' | 'readings' | 'points' | 'errors' | 'logs'>('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [dashboard, setDashboard] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersSearch, setUsersSearch] = useState('');
  const [readings, setReadings] = useState<any[]>([]);
  const [readingsTotal, setReadingsTotal] = useState(0);
  const [readingsPage, setReadingsPage] = useState(1);
  const [readingDetail, setReadingDetail] = useState<any>(null);
  const [pointsLogs, setPointsLogs] = useState<any[]>([]);
  const [pointsTotal, setPointsTotal] = useState(0);
  const [pointsPage, setPointsPage] = useState(1);
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const [errorTotal, setErrorTotal] = useState(0);
  const [errorPage, setErrorPage] = useState(1);
  const [requestLogs, setRequestLogs] = useState<any[]>([]);
  const [requestTotal, setRequestTotal] = useState(0);
  const [requestPage, setRequestPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [userDetailTab, setUserDetailTab] = useState<'info' | 'readings' | 'points'>('info');
  const [userReadings, setUserReadings] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState<any[]>([]);

  const token = localStorage.getItem('token');
  const locale = localStorage.getItem('i18nextLng') || 'en';

  useEffect(() => { checkAdmin(); }, []);

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
    if (!token) { setLoading(false); navigate('/login'); return; }
    try {
      const res = await fetch('/api/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { setIsAdmin(true); setDashboard(await res.json()); }
      else if (res.status === 401) { navigate('/login'); }
    } catch (err) { console.error('Admin check failed:', err); }
    setLoading(false);
  };

  const ah = () => {
    const csrfToken = localStorage.getItem('csrfToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
    };
  };

  const fetchDashboard = async () => { try { const r = await fetch('/api/admin/dashboard', { headers: ah() }); if (r.ok) setDashboard(await r.json()); } catch {} };
  const fetchUsers = async () => { try { const r = await fetch(`/api/admin/users?page=${usersPage}&limit=20&search=${usersSearch}`, { headers: ah() }); if (r.ok) { const d = await r.json(); setUsers(d.users); setUsersTotal(d.total); } } catch {} };
  const fetchReadings = async () => { try { const r = await fetch(`/api/admin/readings?page=${readingsPage}&limit=20`, { headers: ah() }); if (r.ok) { const d = await r.json(); setReadings(d.readings); setReadingsTotal(d.total); } } catch {} };
  const fetchPoints = async () => { try { const r = await fetch(`/api/admin/points-logs?page=${pointsPage}&limit=20`, { headers: ah() }); if (r.ok) { const d = await r.json(); setPointsLogs(d.logs); setPointsTotal(d.total); } } catch {} };
  const fetchErrors = async () => { try { const r = await fetch(`/api/admin/error-logs?page=${errorPage}&limit=50`, { headers: ah() }); if (r.ok) { const d = await r.json(); setErrorLogs(d.logs); setErrorTotal(d.total); } } catch {} };
  const fetchLogs = async () => { try { const r = await fetch(`/api/admin/request-logs?page=${requestPage}&limit=50`, { headers: ah() }); if (r.ok) { const d = await r.json(); setRequestLogs(d.logs); setRequestTotal(d.total); } } catch {} };

  const openUserDetail = async (user: any) => {
    setSelectedUser(user);
    setEditForm({ points: user.points, membership: user.membership, email: user.email });
    setUserDetailTab('info');
    try {
      const [rR, pR] = await Promise.all([
        fetch(`/api/admin/readings?page=1&limit=50&userId=${user._id}`, { headers: ah() }),
        fetch(`/api/admin/points-logs?page=1&limit=50&userId=${user._id}`, { headers: ah() }),
      ]);
      if (rR.ok) setUserReadings((await rR.json()).readings);
      if (pR.ok) setUserPoints((await pR.json()).logs);
    } catch {}
  };

  const updateUser = async () => {
    try {
      const res = await fetch('/api/admin/users', { method: 'PUT', headers: ah(), credentials: 'include', body: JSON.stringify({ userId: selectedUser._id, ...editForm }) });
      if (res.ok) { setSelectedUser(await res.json()); fetchUsers(); alert(t('admin.saveSuccess')); }
    } catch {}
  };

  const deleteUser = async (uid: string) => {
    if (!confirm(t('admin.confirmDeleteUser'))) return;
    try { const r = await fetch('/api/admin/users', { method: 'DELETE', headers: ah(), credentials: 'include', body: JSON.stringify({ userId: uid }) }); if (r.ok) { setSelectedUser(null); fetchUsers(); alert(t('admin.deleted')); } } catch {}
  };

  const clearErrorLogs = async () => {
    if (!confirm(t('admin.confirmClearErrors'))) return;
    try { const r = await fetch('/api/admin/error-logs', { method: 'DELETE', headers: ah(), credentials: 'include', body: JSON.stringify({ beforeDays: 30 }) }); if (r.ok) { alert(t('admin.clearedCount', { count: (await r.json()).deleted })); fetchErrors(); } } catch {}
  };

  const openReadingDetail = async (r: any) => { setReadingDetail(r); };

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white"><SEO title={t('admin.seoTitle')} description={t('admin.seoDesc')} />{t('admin.verifying')}</div>;
  if (!isAdmin) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-400 text-lg"><SEO title={t('admin.seoTitle')} description={t('admin.seoDesc')} />⚠️ {t('admin.noPermission')}</div>;

  const tabs = [
    { key: 'dashboard' as const, label: t('admin.tabDashboard'), icon: Activity },
    { key: 'users' as const, label: t('admin.tabUsers'), icon: Users },
    { key: 'readings' as const, label: t('admin.tabReadings'), icon: BookOpen },
    { key: 'points' as const, label: t('admin.tabPoints'), icon: Coins },
    { key: 'errors' as const, label: t('admin.tabErrors'), icon: AlertTriangle },
    { key: 'logs' as const, label: t('admin.tabLogs'), icon: Shield },
  ];
  const tp = (t: number, l: number) => Math.max(1, Math.ceil(t / l));
  const fd = (d: string) => new Date(d).toLocaleString(locale);
  const fs = (d: string) => new Date(d).toLocaleDateString(locale);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <SEO title={t('admin.seoTitle')} description={t('admin.seoDesc')} />
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => navigate('/profile')} className="text-gray-400 hover:text-white"><ChevronLeft className="w-5 h-5" /></button>
        <h1 className="text-lg font-bold">🔧 {t('admin.title')}</h1>
      </div>
      <div className="flex">
        <div className="hidden md:flex w-44 bg-gray-800 min-h-[calc(100vh-52px)] border-r border-gray-700 py-2 flex-col">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${tab === t.key ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 flex z-40">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 flex flex-col items-center py-2 text-xs ${tab === t.key ? 'text-indigo-400' : 'text-gray-500'}`}>
              <t.icon className="w-4 h-4 mb-0.5" />{t.label.slice(0,2)}
            </button>
          ))}
        </div>

        <div className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6">
          {/* Dashboard */}
          {tab === 'dashboard' && dashboard && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <SC label={t('admin.totalUsers')} value={dashboard.totalUsers} sub={t('admin.todayPlus', { count: dashboard.todayUsers })} c="indigo" />
                <SC label={t('admin.totalReadings')} value={dashboard.totalReadings} sub={t('admin.todayPlus', { count: dashboard.todayReadings })} c="blue" />
                <SC label={t('admin.pointsLogs')} value={dashboard.totalPointsLogs} c="green" />
                <SC label={t('admin.recentErrors')} value={dashboard.recentErrors} c="red" />
                <SC label={t('admin.paidMembers')} value={dashboard.membershipStats?.filter((s:any)=>s._id&&s._id!=='free').reduce((a:any,s:any)=>a+s.count,0)||0} c="yellow" />
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-medium mb-3">{t('admin.membershipDist')}</h3>
                <div className="flex gap-8">
                  {dashboard.membershipStats?.map((s: any) => (<div key={s._id||'free'} className="text-center"><div className="text-2xl font-bold text-indigo-400">{s.count}</div><div className="text-xs text-gray-400">{s._id||'free'}</div></div>))}
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-medium mb-3">{t('admin.readingTrend')}</h3>
                <div className="flex items-end gap-2 h-28">
                  {dashboard.dailyStats?.map((d: any) => { const mx = Math.max(...(dashboard.dailyStats?.map((x:any)=>x.count)||[1]),1); return <div key={d._id} className="flex-1 flex flex-col items-center"><div className="w-full bg-indigo-600 rounded-t" style={{height:`${(d.count/mx)*100}%`,minHeight:d.count>0?'4px':'0'}} /><div className="text-xs text-gray-500 mt-1">{d._id?.slice(5)}</div><div className="text-xs text-gray-300">{d.count}</div></div>; })}
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-medium mb-3">{t('admin.registrationTrend')}</h3>
                <div className="flex items-end gap-2 h-28">
                  {dashboard.dailyRegistrations?.map((d: any) => { const mx = Math.max(...(dashboard.dailyRegistrations?.map((x:any)=>x.count)||[1]),1); return <div key={d._id} className="flex-1 flex flex-col items-center"><div className="w-full bg-green-600 rounded-t" style={{height:`${(d.count/mx)*100}%`,minHeight:d.count>0?'4px':'0'}} /><div className="text-xs text-gray-500 mt-1">{d._id?.slice(5)}</div><div className="text-xs text-gray-300">{d.count}</div></div>; })}
                </div>
              </div>
            </div>
          )}

          {/* Users */}
          {tab === 'users' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input value={usersSearch} onChange={e=>setUsersSearch(e.target.value)} placeholder={t('admin.searchPlaceholder')} className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm" onKeyDown={e=>e.key==='Enter'&&fetchUsers()} />
                <button onClick={fetchUsers} className="px-4 py-2 bg-indigo-600 rounded text-sm flex items-center gap-1"><Search className="w-4 h-4" />{t('admin.search')}</button>
              </div>
              <div className="text-xs text-gray-500">{t('admin.totalUsersCount', { total: usersTotal })}</div>
              <div className="hidden md:block">
                <table className="w-full text-sm">
                  <thead><tr className="text-gray-400 border-b border-gray-700 text-xs">
                    <th className="text-left py-2 px-2">{t('admin.username')}</th><th className="text-left py-2 px-2">{t('admin.email')}</th><th className="text-left py-2 px-2">{t('admin.points')}</th><th className="text-left py-2 px-2">{t('admin.membership')}</th><th className="text-left py-2 px-2">{t('admin.checkIn')}</th><th className="text-left py-2 px-2">{t('admin.registeredAt')}</th><th className="text-left py-2 px-2">{t('admin.actions')}</th>
                  </tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="py-2 px-2 font-medium">{u.username}</td>
                        <td className="py-2 px-2 text-gray-400 text-xs">{u.email}</td>
                        <td className="py-2 px-2 text-yellow-300">{u.points}</td>
                        <td className="py-2 px-2"><span className={`px-2 py-0.5 rounded text-xs ${u.membership==='yearly'?'bg-yellow-600/20 text-yellow-300':u.membership==='monthly'?'bg-blue-600/20 text-blue-300':'bg-gray-600/20 text-gray-400'}`}>{u.membership}</span></td>
                        <td className="py-2 px-2 text-xs">{u.checkInStreak}{t('points.days')}/{u.totalCheckIns}{t('points.totalCheckins')}</td>
                        <td className="py-2 px-2 text-gray-500 text-xs">{fs(u.createdAt)}</td>
                        <td className="py-2 px-2 flex gap-1">
                          <button onClick={()=>openUserDetail(u)} className="p-1 hover:bg-gray-700 rounded" title={t('admin.view')}><Eye className="w-4 h-4 text-blue-400" /></button>
                          <button onClick={()=>deleteUser(u._id)} className="p-1 hover:bg-gray-700 rounded" title={t('admin.delete')}><Trash2 className="w-4 h-4 text-red-400" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden space-y-2">
                {users.map(u => (
                  <div key={u._id} className="bg-gray-800 rounded-lg p-3 cursor-pointer" onClick={()=>openUserDetail(u)}>
                    <div className="flex justify-between items-center"><span className="font-medium">{u.username}</span><span className={`px-2 py-0.5 rounded text-xs ${u.membership==='yearly'?'bg-yellow-600/20 text-yellow-300':u.membership==='monthly'?'bg-blue-600/20 text-blue-300':'bg-gray-600/20 text-gray-400'}`}>{u.membership}</span></div>
                    <div className="text-xs text-gray-400 mt-1">{u.email}</div>
                    <div className="flex gap-4 mt-1 text-xs"><span className="text-yellow-300">{t('admin.pointsUnit', { points: u.points })}</span><span>{t('admin.checkInDays', { days: u.checkInStreak })}</span></div>
                  </div>
                ))}
              </div>
              <Pagination page={usersPage} total={tp(usersTotal,20)} setPage={setUsersPage} t={t} />
            </div>
          )}

          {/* Readings */}
          {tab === 'readings' && (
            <div className="space-y-4">
              <div className="text-xs text-gray-500">{t('admin.totalReadingsCount', { total: readingsTotal })}</div>
              <div className="space-y-2">
                {readings.map(r => (
                  <div key={r._id} className="bg-gray-800 rounded-lg p-3 cursor-pointer hover:bg-gray-750" onClick={()=>openReadingDetail(r)}>
                    <div className="flex justify-between items-start">
                      <div><div className="font-medium text-sm">{r.spreadName||r.spreadType||t('admin.reading')}</div><div className="text-xs text-gray-400 mt-0.5">{r.readerStyle||t('admin.default')}</div></div>
                      <div className="text-right"><div className="text-xs text-gray-500">{fd(r.createdAt)}</div><div className="text-xs text-gray-600 mt-0.5">{t('admin.userIdPrefix')} {r.userId?.toString().slice(-8)}</div></div>
                    </div>
                    {r.cards&&<div className="flex gap-1 mt-2 flex-wrap">{(Array.isArray(r.cards)?r.cards:[]).slice(0,5).map((c:any,i:number)=><span key={i} className="px-1.5 py-0.5 bg-indigo-600/20 text-indigo-300 rounded text-xs">{typeof c==='string'?c:c.name||`Card${i+1}`}</span>)}{r.cards?.length>5&&<span className="text-xs text-gray-500">+{r.cards.length-5}</span>}</div>}
                  </div>
                ))}
              </div>
              <Pagination page={readingsPage} total={tp(readingsTotal,20)} setPage={setReadingsPage} t={t} />
            </div>
          )}

          {/* Points */}
          {tab === 'points' && (
            <div className="space-y-4">
              <div className="text-xs text-gray-500">{t('admin.totalPointsCount', { total: pointsTotal })}</div>
              <div className="space-y-1.5">
                {pointsLogs.map(p => (
                  <div key={p._id} className="flex justify-between items-center bg-gray-800 rounded px-3 py-2">
                    <div className="flex items-center gap-2"><span className="px-1.5 py-0.5 rounded text-xs bg-gray-700">{p.type}</span><span className="text-xs text-gray-300 max-w-[200px] truncate">{p.description}</span></div>
                    <div className="flex items-center gap-3"><span className={`text-sm font-medium ${p.amount>0?'text-green-400':'text-red-400'}`}>{p.amount>0?'+':''}{p.amount}</span><span className="text-xs text-gray-500">{fs(p.createdAt)}</span></div>
                  </div>
                ))}
              </div>
              <Pagination page={pointsPage} total={tp(pointsTotal,20)} setPage={setPointsPage} t={t} />
            </div>
          )}

          {/* Errors */}
          {tab === 'errors' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500">{t('admin.totalErrors', { total: errorTotal })}</div>
                <button onClick={clearErrorLogs} className="px-3 py-1 bg-red-600/20 text-red-300 rounded text-xs hover:bg-red-600/30 flex items-center gap-1"><Trash2 className="w-3 h-3" />{t('admin.clearOldErrors')}</button>
              </div>
              <div className="space-y-2">
                {errorLogs.map(e => (
                  <div key={e._id} className="bg-gray-800 rounded-lg p-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2 min-w-0"><span className="px-1.5 py-0.5 rounded text-xs bg-red-600/20 text-red-300 shrink-0">{e.type}</span><span className="text-sm truncate">{e.message}</span></div>
                      <span className="text-xs text-gray-500 shrink-0">{fd(e.createdAt)}</span>
                    </div>
                    {e.path&&<div className="text-xs text-gray-500 mt-1">{e.method} {e.path}</div>}
                    {e.stack&&<pre className="text-xs text-gray-600 mt-2 max-h-32 overflow-auto whitespace-pre-wrap">{e.stack}</pre>}
                  </div>
                ))}
              </div>
              <Pagination page={errorPage} total={tp(errorTotal,50)} setPage={setErrorPage} t={t} />
            </div>
          )}

          {/* Logs */}
          {tab === 'logs' && (
            <div className="space-y-4">
              <div className="text-xs text-gray-500">{t('admin.totalRequests', { total: requestTotal })}</div>
              <div className="space-y-1">
                {requestLogs.map(l => (
                  <div key={l._id} className="flex items-center gap-2 bg-gray-800 rounded px-3 py-1.5 text-xs">
                    <span className="px-1 py-0.5 rounded bg-blue-600/20 text-blue-300 font-mono w-8 text-center">{l.method}</span>
                    <span className="flex-1 truncate text-gray-300">{l.path}</span>
                    <span className={l.statusCode>=400?'text-red-400':'text-green-400'}>{l.statusCode}</span>
                    <span className="text-gray-500 w-12 text-right">{l.duration}ms</span>
                    <span className="text-gray-600 hidden lg:inline">{l.ip?.slice(-15)}</span>
                    <span className="text-gray-600">{fs(l.createdAt)}</span>
                  </div>
                ))}
              </div>
              <Pagination page={requestPage} total={tp(requestTotal,50)} setPage={setRequestPage} t={t} />
            </div>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 overflow-y-auto py-8" onClick={()=>setSelectedUser(null)}>
          <div className="bg-gray-800 rounded-lg w-full max-w-2xl mx-4" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <h3 className="font-bold">👤 {selectedUser.username}</h3>
              <button onClick={()=>setSelectedUser(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex border-b border-gray-700">
              {(['info','readings','points'] as const).map(ta=>{
                const label = ta==='info'?t('admin.basicInfo'):ta==='readings'?t('admin.userReadings'):t('admin.userPoints');
                return (
                  <button key={ta} onClick={()=>setUserDetailTab(ta)} className={`px-4 py-2 text-sm ${userDetailTab===ta?'text-indigo-400 border-b-2 border-indigo-400':'text-gray-400'}`}>{label}</button>
                );
              })}
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {userDetailTab==='info'&&(
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">{t('admin.userId')}:</span><div className="font-mono text-xs text-gray-400 mt-0.5">{selectedUser._id}</div></div>
                    <div><span className="text-gray-500">{t('admin.email')}:</span><div className="mt-0.5">{selectedUser.email}</div></div>
                    <div><span className="text-gray-500">{t('admin.registeredAt')}:</span><div className="mt-0.5">{fd(selectedUser.createdAt)}</div></div>
                    <div><span className="text-gray-500">{t('admin.streak')}:</span><div className="mt-0.5">{selectedUser.checkInStreak}{t('points.days')} / {t('points.totalCheckins')}{selectedUser.totalCheckIns}</div></div>
                    <div><span className="text-gray-500">{t('admin.membershipExpiry')}:</span><div className="mt-0.5">{selectedUser.membershipExpiry?fd(selectedUser.membershipExpiry):t('common.noData')}</div></div>
                    <div><span className="text-gray-500">{t('admin.inviteCode')}:</span><div className="mt-0.5 font-mono text-xs">{selectedUser.inviteCode||t('common.noData')}</div></div>
                    {selectedUser.achievements?.length>0&&<div className="col-span-2"><span className="text-gray-500">{t('admin.achievements')}:</span><div className="flex flex-wrap gap-1 mt-1">{selectedUser.achievements.map((a:string)=><span key={a} className="px-1.5 py-0.5 bg-purple-600/20 text-purple-300 rounded text-xs">{a}</span>)}</div></div>}
                  </div>
                  <div className="border-t border-gray-700 pt-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-1"><Edit className="w-4 h-4" />{t('admin.edit')}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-xs text-gray-500">{t('admin.points')}</label><input type="number" value={editForm.points} onChange={e=>setEditForm({...editForm,points:Number(e.target.value)})} className="w-full px-3 py-2 bg-gray-700 rounded mt-1 text-sm" /></div>
                      <div><label className="text-xs text-gray-500">{t('admin.membership')}</label><select value={editForm.membership} onChange={e=>setEditForm({...editForm,membership:e.target.value})} className="w-full px-3 py-2 bg-gray-700 rounded mt-1 text-sm"><option value="free">free</option><option value="monthly">monthly</option><option value="yearly">yearly</option></select></div>
                      <div className="col-span-2"><label className="text-xs text-gray-500">{t('admin.email')}</label><input type="email" value={editForm.email} onChange={e=>setEditForm({...editForm,email:e.target.value})} className="w-full px-3 py-2 bg-gray-700 rounded mt-1 text-sm" /></div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button onClick={updateUser} className="px-4 py-2 bg-indigo-600 rounded text-sm flex items-center gap-1 hover:bg-indigo-500"><Save className="w-4 h-4" />{t('admin.saveChanges')}</button>
                      <button onClick={()=>deleteUser(selectedUser._id)} className="px-4 py-2 bg-red-600/20 text-red-300 rounded text-sm flex items-center gap-1 hover:bg-red-600/30"><Trash2 className="w-4 h-4" />{t('admin.deleteUser')}</button>
                    </div>
                  </div>
                </div>
              )}
              {userDetailTab==='readings'&&(
                <div className="space-y-2">
                  {userReadings.length===0&&<div className="text-sm text-gray-500">{t('admin.noReadings')}</div>}
                  {userReadings.map(r=>(<div key={r._id} className="bg-gray-700/50 rounded p-2 text-sm"><div className="flex justify-between"><span>{r.spreadName||r.spreadType}</span><span className="text-xs text-gray-400">{fs(r.createdAt)}</span></div>{r.cards&&<div className="flex gap-1 mt-1 flex-wrap">{(Array.isArray(r.cards)?r.cards:[]).slice(0,5).map((c:any,i:number)=><span key={i} className="px-1 py-0.5 bg-indigo-600/20 text-indigo-300 rounded text-xs">{typeof c==='string'?c:c.name||`Card${i+1}`}</span>)}{r.cards?.length>5&&<span className="text-xs text-gray-500">+{r.cards.length-5}</span>}</div>}</div>))}
                </div>
              )}
              {userDetailTab==='points'&&(
                <div className="space-y-1.5">
                  {userPoints.length===0&&<div className="text-sm text-gray-500">{t('admin.noPoints')}</div>}
                  {userPoints.map(p=>(<div key={p._id} className="flex justify-between items-center bg-gray-700/50 rounded px-2 py-1.5 text-xs"><div className="flex items-center gap-2"><span className="px-1 py-0.5 bg-gray-600 rounded">{p.type}</span><span className="text-gray-300">{p.description}</span></div><div className="flex items-center gap-2"><span className={p.amount>0?'text-green-400':'text-red-400'}>{p.amount>0?'+':''}{p.amount}</span><span className="text-gray-500">{fs(p.createdAt)}</span></div></div>))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reading Detail Modal */}
      {readingDetail && (
        <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 overflow-y-auto py-8" onClick={()=>setReadingDetail(null)}>
          <div className="bg-gray-800 rounded-lg w-full max-w-lg mx-4" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <h3 className="font-bold">🔮 {t('admin.readingDetail')}</h3>
              <button onClick={()=>setReadingDetail(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-3 text-sm max-h-[60vh] overflow-y-auto">
              <div><span className="text-gray-500">{t('admin.spreadLabel')}</span> {readingDetail.spreadName||readingDetail.spreadType}</div>
              <div><span className="text-gray-500">{t('admin.readerLabel')}</span> {readingDetail.readerStyle||t('admin.default')}</div>
              <div><span className="text-gray-500">{t('admin.timeLabel')}</span> {fd(readingDetail.createdAt)}</div>
              {readingDetail.cards&&<div><span className="text-gray-500">{t('admin.cardsLabel')}</span><div className="flex flex-wrap gap-1 mt-1">{(Array.isArray(readingDetail.cards)?readingDetail.cards:[]).map((c:any,i:number)=><span key={i} className="px-2 py-0.5 bg-indigo-600/20 text-indigo-300 rounded text-xs">{typeof c==='string'?c:c.name||`Card${i+1}`}</span>)}</div></div>}
              {readingDetail.question&&<div><span className="text-gray-500">{t('admin.questionLabel')}</span><div className="text-gray-300 mt-1">{readingDetail.question}</div></div>}
              {readingDetail.interpretation&&<div><span className="text-gray-500">{t('admin.interpretationLabel')}</span><div className="text-gray-300 mt-1 whitespace-pre-wrap text-xs">{readingDetail.interpretation}</div></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SC = ({ label, value, sub, c }: { label: string; value: number; sub?: string; c?: string }) => {
  const colors: Record<string,string> = { indigo:'text-indigo-400', blue:'text-blue-400', green:'text-green-400', red:'text-red-400', yellow:'text-yellow-400' };
  return (<div className="bg-gray-800 rounded-lg p-3"><div className="text-xs text-gray-500">{label}</div><div className={`text-xl font-bold mt-1 ${colors[c||'indigo']}`}>{value.toLocaleString()}</div>{sub&&<div className="text-xs text-green-400 mt-0.5">{sub}</div>}</div>);
};

const Pagination = ({ page, total, setPage, t }: { page: number; total: number; setPage: (p: number) => void; t: (key: string) => string }) => (
  <div className="flex items-center justify-center gap-3 mt-4">
    <button onClick={()=>setPage(Math.max(1,page-1))} disabled={page<=1} className="px-3 py-1.5 bg-gray-700 rounded text-sm disabled:opacity-30 hover:bg-gray-600">{t('admin.prevPage')}</button>
    <span className="text-sm text-gray-400">{page} / {total}</span>
    <button onClick={()=>setPage(page+1)} disabled={page>=total} className="px-3 py-1.5 bg-gray-700 rounded text-sm disabled:opacity-30 hover:bg-gray-600">{t('admin.nextPage')}</button>
  </div>
);

export default Admin;
