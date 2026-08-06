'use client';
import dynamic from 'next/dynamic';
const DomMap = dynamic(() => import('@/components/shared/DomMap'), {
  ssr: false,
  loading: () => <div style={{ height: 320, borderRadius: 12, background: 'var(--bg3)' }} />,
});
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { StatCard, Card, Btn, Modal, EmptyState, StatusBadge, SearchBar, TableWrap, useConfirm } from '@/components/ui';
import { useOrders, useBranches, useUsersByRole } from '@/hooks';
import * as fs from '@/lib/firestore';
import { fmtDate, fmtDateTime } from '@/lib/utils';
import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import toast from 'react-hot-toast';
import type { Order, User, Branch, OrderStatus } from '@/types';
import { STATUS_LABELS } from '@/types';
import styles from './admin.module.css';
import { OrderDetailBody, PaymentBadge, PaymentStatusBadge, ServiceTypeBadge } from '@/components/shared/OrderComponents';
import { format } from 'date-fns';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  AreaChart, Area,
} from 'recharts';
import {
  LayoutDashboard, Package, Bike, Briefcase, Users, MapPin, Building2,
  Warehouse, Map as MapIcon, TrendingUp, User as UserIcon, Clock,
  CheckCircle2, DollarSign, XCircle, Undo2, Check, X, Pencil, Loader2,
  Inbox, ClipboardList, Eye, PieChart as PieChartIcon, Percent, AlertTriangle,
} from 'lucide-react';



type T = ReturnType<typeof useLanguage>['t'];

// Vivid, theme-agnostic colors — kept consistent with the badge palette in globals.css
const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  approved: '#3b82f6',
  assigned: '#a855f7',
  pickedup: '#fbbf24',
  transit: '#f97316',
  arrived: '#14b8a6',
  outfordelivery: '#60a5fa',
  delivered: '#22c55e',
  failed: '#ef4444',
  rejected: '#dc2626',
};

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      {label && <div style={{ color: 'var(--text3)', marginBottom: 4 }}>{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color ?? p.fill, fontWeight: 600 }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
}

// Small helper so "<icon> Label" combos (used constantly in Card titles) stay
// one-liners instead of repeating the same inline-flex wrapper everywhere.
function IconText({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>{icon}{children}</span>;
}

function LoadingIcon() {
  return <Loader2 size={26} style={{ animation: 'spin 1s linear infinite' }} />;
}

function getNav(t: T) {
  return [
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: t('admin.nav.dashboard') },
    { id: 'orders', icon: <Package size={18} />, label: t('admin.nav.orders') },
    { id: 'drivers', icon: <Bike size={18} />, label: t('admin.nav.drivers') },
    { id: 'employees', icon: <Briefcase size={18} />, label: t('admin.nav.employees') },
    { id: 'customers', icon: <Users size={18} />, label: t('admin.nav.customers') },
    { id: 'assign', icon: <MapPin size={18} />, label: t('admin.nav.assign') },
    { id: 'branches', icon: <Building2 size={18} />, label: t('admin.nav.branches') },
    { id: 'inventory', icon: <Warehouse size={18} />, label: t('admin.nav.inventory') },
    { id: 'tracking', icon: <MapIcon size={18} />, label: t('admin.nav.tracking') },
    { id: 'reports', icon: <TrendingUp size={18} />, label: t('admin.nav.reports') },
    { id: 'profile', icon: <UserIcon size={18} />, label: t('admin.nav.profile') },
  ];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [section, setSection] = useState('dashboard');
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user && user.role !== 'admin') router.replace('/auth');
  }, [user, router]);

  if (!user) return null;

  const NAV = getNav(t);

  const titles: Record<string, [string, string]> = {
    dashboard: [t('admin.nav.dashboard'), t('admin.pgSub.dashboard')],
    orders: [t('admin.nav.orders'), t('admin.pgSub.orders')],
    drivers: [t('admin.nav.drivers'), t('admin.pgSub.drivers')],
    customers: [t('admin.nav.customers'), t('admin.pgSub.customers')],
    employees: [t('admin.nav.employees'), t('admin.pgSub.employees')],
    assign: [t('admin.nav.assign'), t('admin.pgSub.assign')],
    branches: [t('admin.pgTitle.branches'), t('admin.pgSub.branches')],
    inventory: [t('admin.nav.inventory'), t('admin.pgSub.inventory')],
    tracking: [t('admin.pgTitle.tracking'), t('admin.pgSub.tracking')],
    reports: [t('admin.nav.reports'), t('admin.pgSub.reports')],
    profile: [t('admin.nav.profile'), t('admin.pgSub.profile')],
  };
  const [title, sub] = titles[section] ?? [section, ''];

  return (
    <DashboardLayout navItems={NAV} active={section} onNavigate={setSection} pageTitle={title} pageSub={sub}>
      <Modal open={!!detailOrder} onClose={() => setDetailOrder(null)} title={`${t('admin.modal.order')} ${detailOrder?.orderId}`}
        footer={<Btn variant="secondary" onClick={() => setDetailOrder(null)}>{t('common.close')}</Btn>}>
        {detailOrder && <OrderDetailBody order={detailOrder} />}
      </Modal>

      {section === 'dashboard' && <AdminDash onView={setDetailOrder} />}
      {section === 'orders' && <AdminOrders onView={setDetailOrder} />}
      {section === 'drivers' && <AdminDrivers />}
      {section === 'customers' && <AdminCustomers />}
      {section === 'employees' && <AdminEmployees />}
      {section === 'assign' && <AdminAssign />}
      {section === 'branches' && <AdminBranches />}
      {section === 'inventory' && <AdminInventory onView={setDetailOrder} />}
      {section === 'tracking' && <AdminTracking />}
      {section === 'reports' && <AdminReports />}
      {section === 'profile' && <AdminProfile user={user} />}
    </DashboardLayout>
  );
}

/* ── DASHBOARD ── */
function AdminDash({ onView }: { onView: (o: Order) => void }) {
  const { t } = useLanguage();
  const { orders, loading, reload } = useOrders();
  const { users: drivers } = useUsersByRole('driver');
  const { users: customers } = useUsersByRole('customer');

  const delivered = orders.filter(o => o.status === 'delivered').length;
  const pending = orders.filter(o => o.status === 'pending').length;
  const revenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.price ?? 0), 0).toFixed(2);

  async function quickApprove(o: Order) {
    try {
      await fs.updateOrderStatus(o.orderId, 'approved', 'Approved by admin');
      if (o.customerId) await fs.addNotification(o.customerId, 'Order Approved', `Your order ${o.orderId} has been approved!`, 'success');
      toast.success(`Order ${o.orderId} approved`);
      reload();
    } catch (err: any) { toast.error(err.message); }
  }

  return (
    <div>
      <div className={styles.statsGrid}>
        <StatCard label={t('admin.stat.customers')} value={customers.length} icon={<Users size={20} />} color="blue" />
        <StatCard label={t('admin.stat.drivers')} value={drivers.length} icon={<Bike size={20} />} color="purple" />
        <StatCard label={t('admin.stat.totalOrders')} value={orders.length} icon={<Package size={20} />} color="accent" />
        <StatCard label={t('admin.stat.pending')} value={pending} icon={<Clock size={20} />} color="amber" />
        <StatCard label={t('admin.stat.delivered')} value={delivered} icon={<CheckCircle2 size={20} />} color="green" />
        <StatCard label={t('admin.stat.revenue')} value={`$${revenue}`} icon={<DollarSign size={20} />} color="accent" />
      </div>

      <div className={styles.twoCol}>
        <Card title={<IconText icon={<Package size={16} />}>{t('admin.card.recentOrders')}</IconText>} noPad>
          <TableWrap>
            <table className={styles.table}>
              <thead><tr><th>{t('admin.th.id')}</th><th>{t('admin.th.customer')}</th><th>{t('common.status')}</th><th>{t('admin.th.date')}</th><th></th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={5}><EmptyState icon={<LoadingIcon />} text={t('common.loading')} /></td></tr>
                  : orders.slice(0, 6).map(o => (
                    <tr key={o.orderId}>
                      <td><span className={styles.orderId}>{o.orderId}</span></td>
                      <td>{o.customerName}</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td className={styles.muted}>{fmtDate(o.createdAt)}</td>
                      <td>
                        {o.status === 'pending'
                          ? <Btn size="sm" variant="success" onClick={() => quickApprove(o)}><Check size={14} /> {t('common.approve')}</Btn>
                          : <Btn size="sm" variant="secondary" onClick={() => onView(o)}><Eye size={14} /> {t('admin.btn.view')}</Btn>}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </TableWrap>
        </Card>

        <Card title={<IconText icon={<Bike size={16} />}>{t('admin.stat.drivers')}</IconText>} noPad>
          <TableWrap>
            <table className={styles.table}>
              <thead><tr><th>{t('admin.th.name')}</th><th>{t('admin.th.vehicle')}</th><th>{t('admin.th.branch')}</th><th>{t('common.status')}</th></tr></thead>
              <tbody>
                {drivers.length ? drivers.map(d => (
                  <tr key={d.uid}>
                    <td>{d.username}</td>
                    <td className={styles.muted}>{d.vehicle ?? '—'}</td>
                    <td className={styles.muted}>{d.branch ?? '—'}</td>
                    <td><span className={`badge badge-${d.status === 'inactive' ? 'inactive' : 'active'}`}>{d.status ?? 'active'}</span></td>
                  </tr>
                )) : <tr><td colSpan={4}><EmptyState icon={<Bike size={28} />} text={t('admin.empty.noDrivers')} /></td></tr>}
              </tbody>
            </table>
          </TableWrap>
        </Card>
      </div>
    </div>
  );
}

/* ── ORDER MANAGEMENT ── */
function AdminOrders({ onView }: { onView: (o: Order) => void }) {
  const { t } = useLanguage();
  const { orders, loading, reload } = useOrders();
  const { branches } = useBranches();
  const [q, setQ] = useState('');
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editForm, setEditForm] = useState({ receiverName: '', phone: '', address: '', branch: '', packageType: '' });

  const filtered = useMemo(() => {
    if (!q) return orders;
    const lq = q.toLowerCase();
    return orders.filter(o =>
      o.orderId.toLowerCase().includes(lq) ||
      (o.customerName ?? '').toLowerCase().includes(lq) ||
      (o.receiverName ?? '').toLowerCase().includes(lq)
    );
  }, [orders, q]);

  function openEdit(o: Order) {
    setEditOrder(o);
    setEditForm({ receiverName: o.receiverName, phone: o.phone, address: o.address, branch: o.branch, packageType: o.packageType });
  }

  async function saveEdit() {
    if (!editOrder) return;
    try {
      await fs.updateOrder(editOrder.orderId, editForm);
      toast.success('Order updated'); setEditOrder(null); reload();
    } catch (err: any) { toast.error(err.message); }
  }

  async function approve(o: Order) {
    try {
      await fs.updateOrderStatus(o.orderId, 'approved', 'Approved by admin');
      if (o.customerId) await fs.addNotification(o.customerId, 'Order Approved', `Order ${o.orderId} approved!`, 'success');
      toast.success(`Order ${o.orderId} approved`); reload();
    } catch (err: any) { toast.error(err.message); }
  }

  async function reject(o: Order) {
    try {
      await fs.updateOrderStatus(o.orderId, 'rejected', 'Rejected by admin');
      if (o.customerId) await fs.addNotification(o.customerId, 'Order Rejected', `Order ${o.orderId} was rejected.`, 'warning');
      toast.error(`Order ${o.orderId} rejected`); reload();
    } catch (err: any) { toast.error(err.message); }
  }

  async function togglePayment(o: Order) {
    const next = o.paymentStatus === 'paid' ? 'unpaid' : 'paid';
    try {
      await fs.updateOrder(o.orderId, { paymentStatus: next });
      toast.success(next === 'paid' ? `${o.orderId} marked paid` : `${o.orderId} marked unpaid`);
      reload();
    } catch (err: any) { toast.error(err.message); }
  }

  return (
    <>
      <Modal open={!!editOrder} onClose={() => setEditOrder(null)} title={`${t('admin.modal.editOrder')} ${editOrder?.orderId}`}
        footer={<><Btn variant="secondary" onClick={() => setEditOrder(null)}>{t('common.cancel')}</Btn><Btn onClick={saveEdit}>{t('common.save')}</Btn></>}>
        <div className={styles.formGrid}>
          {([[t('admin.field.receiverName'), 'receiverName'], [t('admin.th.phone'), 'phone']] as const).map(([l, k]) => (
            <div className={styles.field} key={k}>
              <label className={styles.fieldLabel}>{l}</label>
              <input className={styles.input} value={(editForm as any)[k]} onChange={e => setEditForm(p => ({ ...p, [k]: e.target.value }))} />
            </div>
          ))}
          <div className={styles.field} style={{ gridColumn: 'span 2' }}>
            <label className={styles.fieldLabel}>{t('admin.th.address')}</label>
            <input className={styles.input} value={editForm.address} onChange={e => setEditForm(p => ({ ...p, address: e.target.value }))} />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>{t('admin.th.branch')}</label>
            <select className={styles.input} value={editForm.branch} onChange={e => setEditForm(p => ({ ...p, branch: e.target.value }))}>
              {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>{t('admin.field.packageType')}</label>
            <select className={styles.input} value={editForm.packageType} onChange={e => setEditForm(p => ({ ...p, packageType: e.target.value }))}>
              {['Document', 'Electronics', 'Clothing', 'Food', 'Medicine', 'Other'].map(ty => <option key={ty}>{ty}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      <Card title={<IconText icon={<Package size={16} />}>{t('admin.card.allOrders')}</IconText>} action={<SearchBar placeholder={t('admin.search.orders')} onSearch={setQ} />} noPad>
        <TableWrap>
          <table className={styles.table}>
            <thead><tr><th>{t('admin.th.orderId')}</th><th>{t('admin.th.customer')}</th><th>{t('admin.th.receiver')}</th><th>{t('admin.th.branch')}</th><th>{t('common.status')}</th><th>{t('customer.service.title')}</th><th>{t('customer.price.total')}</th><th>{t('admin.th.payment')}</th><th>{t('admin.th.driver')}</th><th>{t('admin.th.date')}</th><th>{t('common.actions')}</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={11}><EmptyState icon={<LoadingIcon />} text={t('common.loading')} /></td></tr>
                : filtered.length ? filtered.map(o => (
                  <tr key={o.orderId}>
                    <td><span className={styles.orderId}>{o.orderId}</span></td>
                    <td>{o.customerName}</td>
                    <td>{o.receiverName}</td>
                    <td className={styles.muted}>{o.branch}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td><ServiceTypeBadge type={o.serviceType} /></td>
                    <td style={{ color: 'var(--accent)', fontWeight: 600 }}>{o.price != null ? `$${o.price.toFixed(2)}` : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                        <PaymentBadge method={o.paymentMethod} />
                        <button
                          onClick={() => togglePayment(o)}
                          style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                          title={t('admin.payment.togglePaid')}
                        >
                          <PaymentStatusBadge status={o.paymentStatus} />
                        </button>
                      </div>
                    </td>
                    <td className={styles.muted}>{o.driverName ?? '—'}</td>
                    <td className={styles.muted}>{fmtDate(o.createdAt)}</td>
                    <td>
                      <div className={styles.actionsRow}>
                        {o.status === 'pending' && <>
                          <Btn size="sm" variant="success" onClick={() => approve(o)}><Check size={14} /></Btn>
                          <Btn size="sm" variant="danger" onClick={() => reject(o)}><X size={14} /></Btn>
                        </>}
                        <Btn size="sm" variant="secondary" onClick={() => onView(o)}><Eye size={14} /></Btn>
                        <Btn size="sm" variant="ghost" onClick={() => openEdit(o)}><Pencil size={14} /></Btn>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan={11}><EmptyState icon={<Inbox size={28} />} text={t('admin.empty.noOrders')} /></td></tr>}
            </tbody>
          </table>
        </TableWrap>
      </Card>
    </>
  );
}

/* ── DRIVER MANAGEMENT ── */
function AdminDrivers() {
  const { t } = useLanguage();
  const { users: drivers, loading, reload } = useUsersByRole('driver');
  const { branches } = useBranches();
  const { confirm, Dialog } = useConfirm();
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editDriver, setEditDriver] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', vehicle: 'Motorbike', branch: '', password: '' });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  function openAdd() { setForm({ name: '', email: '', phone: '', vehicle: 'Motorbike', branch: '', password: '' }); setModal('add'); }
  function openEdit(d: User) { setEditDriver(d); setForm({ name: d.username, email: d.email, phone: d.phone ?? '', vehicle: d.vehicle ?? 'Motorbike', branch: d.branch ?? '', password: '' }); setModal('edit'); }

  async function saveAdd() {
    if (!form.name || !form.email) { toast.error('Name and email required'); return; }
    if (form.password.length < 6) { toast.error('Password needs 6+ characters'); return; }
    setSaving(true);
    try {
      // Use secondary app to avoid signing out admin
      const secondaryApp = initializeApp({ apiKey: 'AIzaSyCQr8utoyrPkOqdSa_Gr-Xq_1Jrw1I1xVg', authDomain: 'dom-express-a84da.firebaseapp.com', projectId: 'dom-express-a84da', storageBucket: 'dom-express-a84da.firebasestorage.app', messagingSenderId: '659512197286', appId: '1:659512197286:web:5b1ae352597349a8743467' }, 'driver_creation_' + Date.now());
      const secondaryAuth = getAuth(secondaryApp);
      const cred = await createUserWithEmailAndPassword(secondaryAuth, form.email, form.password);
      const uid = cred.user.uid;
      await secondaryAuth.signOut();
      await deleteApp(secondaryApp);

      await fs.setUser({ uid, username: form.name, email: form.email, phone: form.phone, vehicle: form.vehicle, branch: form.branch, role: 'driver', status: 'active', address: '', createdAt: new Date().toISOString() });
      toast.success('Driver added!'); setModal(null); reload();
    } catch (err: any) {
      let msg = err.message;
      if (err.code === 'auth/email-already-in-use') msg = 'Email already registered.';
      toast.error(msg);
    } finally { setSaving(false); }
  }

  async function saveEdit() {
    if (!editDriver) return;
    setSaving(true);
    try {
      await fs.updateUser(editDriver.uid, { username: form.name, phone: form.phone, vehicle: form.vehicle, branch: form.branch });
      toast.success('Driver updated'); setModal(null); reload();
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  }

  async function toggleStatus(d: User) {
    const next = d.status === 'inactive' ? 'active' : 'inactive';
    try { await fs.updateUser(d.uid, { status: next }); toast.success(`Driver ${next}`); reload(); }
    catch (err: any) { toast.error(err.message); }
  }

  return (
    <>
      <Dialog />
      <Modal open={modal === 'add'} onClose={() => setModal(null)} title={t('admin.modal.addDriver')}
        footer={<><Btn variant="secondary" onClick={() => setModal(null)}>{t('common.cancel')}</Btn><Btn onClick={saveAdd} loading={saving}>{t('admin.modal.addDriver')}</Btn></>}>
        <div className={styles.formGrid}>
          {([[t('admin.field.fullName'), 'name', 'text'], [t('admin.th.email'), 'email', 'email'], [t('admin.th.phone'), 'phone', 'text'], [t('admin.field.password'), 'password', 'password']] as const).map(([l, k, ty]) => (
            <div className={styles.field} key={k}>
              <label className={styles.fieldLabel}>{l}</label>
              <input className={styles.input} type={ty} value={(form as any)[k]} onChange={e => set(k, e.target.value)} />
            </div>
          ))}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>{t('admin.th.vehicle')}</label>
            <select className={styles.input} value={form.vehicle} onChange={e => set('vehicle', e.target.value)}>
              {['Motorbike', 'Van', 'Truck', 'Bicycle', 'Tuk Tuk'].map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>{t('admin.th.branch')}</label>
            <select className={styles.input} value={form.branch} onChange={e => set('branch', e.target.value)}>
              <option value="">{t('admin.field.select')}</option>
              {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
          </div>
        </div>
      </Modal>
      <Modal open={modal === 'edit'} onClose={() => setModal(null)} title={t('admin.modal.editDriver')}
        footer={<><Btn variant="secondary" onClick={() => setModal(null)}>{t('common.cancel')}</Btn><Btn onClick={saveEdit} loading={saving}>{t('common.save')}</Btn></>}>
        <div className={styles.formGrid}>
          {([[t('admin.field.fullName'), 'name', 'text'], [t('admin.th.phone'), 'phone', 'text']] as const).map(([l, k, ty]) => (
            <div className={styles.field} key={k}>
              <label className={styles.fieldLabel}>{l}</label>
              <input className={styles.input} type={ty} value={(form as any)[k]} onChange={e => set(k, e.target.value)} />
            </div>
          ))}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>{t('admin.th.vehicle')}</label>
            <select className={styles.input} value={form.vehicle} onChange={e => set('vehicle', e.target.value)}>
              {['Motorbike', 'Van', 'Truck', 'Bicycle', 'Tuk Tuk'].map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>{t('admin.th.branch')}</label>
            <select className={styles.input} value={form.branch} onChange={e => set('branch', e.target.value)}>
              <option value="">{t('admin.field.select')}</option>
              {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      <Card title={<IconText icon={<Bike size={16} />}>{t('admin.nav.drivers')}</IconText>} action={<Btn size="sm" onClick={openAdd}>+ {t('admin.nav.drivers')}</Btn>} noPad>
        <TableWrap>
          <table className={styles.table}>
            <thead><tr><th>{t('admin.th.name')}</th><th>{t('admin.th.email')}</th><th>{t('admin.th.phone')}</th><th>{t('admin.th.vehicle')}</th><th>{t('admin.th.branch')}</th><th>{t('common.status')}</th><th>{t('common.actions')}</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={7}><EmptyState icon={<LoadingIcon />} text={t('common.loading')} /></td></tr>
                : drivers.length ? drivers.map(d => (
                  <tr key={d.uid}>
                    <td>{d.username}</td>
                    <td className={styles.muted}>{d.email}</td>
                    <td className={styles.muted}>{d.phone ?? '—'}</td>
                    <td>{d.vehicle ?? '—'}</td>
                    <td className={styles.muted}>{d.branch ?? '—'}</td>
                    <td><span className={`badge badge-${d.status === 'inactive' ? 'inactive' : 'active'}`}>{d.status ?? 'active'}</span></td>
                    <td>
                      <div className={styles.actionsRow}>
                        <Btn size="sm" variant="secondary" onClick={() => openEdit(d)}><Pencil size={14} /></Btn>
                        <Btn size="sm" variant="ghost" onClick={() => toggleStatus(d)}>{d.status === 'inactive' ? t('admin.btn.activate') : t('admin.btn.deactivate')}</Btn>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan={7}><EmptyState icon={<Bike size={28} />} text={t('admin.empty.noDriversYet')} /></td></tr>}
            </tbody>
          </table>
        </TableWrap>
      </Card>
    </>
  );
}

/* ── EMPLOYEE MANAGEMENT (branch staff) ── */
function AdminEmployees() {
  const { t } = useLanguage();
  const { users: employees, loading, reload } = useUsersByRole('employee');
  const { branches } = useBranches();
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editEmployee, setEditEmployee] = useState<User | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', branch: '', password: '' });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  function openAdd() { setForm({ name: '', email: '', phone: '', branch: '', password: '' }); setModal('add'); }
  function openEdit(e: User) { setEditEmployee(e); setForm({ name: e.username, email: e.email, phone: e.phone ?? '', branch: e.branch ?? '', password: '' }); setModal('edit'); }

  async function saveAdd() {
    if (!form.name || !form.email) { toast.error('Name and email required'); return; }
    if (!form.branch) { toast.error('Select a branch'); return; }
    if (form.password.length < 6) { toast.error('Password needs 6+ characters'); return; }
    setSaving(true);
    try {
      const secondaryApp = initializeApp({ apiKey: 'AIzaSyCQr8utoyrPkOqdSa_Gr-Xq_1Jrw1I1xVg', authDomain: 'dom-express-a84da.firebaseapp.com', projectId: 'dom-express-a84da', storageBucket: 'dom-express-a84da.firebasestorage.app', messagingSenderId: '659512197286', appId: '1:659512197286:web:5b1ae352597349a8743467' }, 'employee_creation_' + Date.now());
      const secondaryAuth = getAuth(secondaryApp);
      const cred = await createUserWithEmailAndPassword(secondaryAuth, form.email, form.password);
      const uid = cred.user.uid;
      await secondaryAuth.signOut();
      await deleteApp(secondaryApp);

      await fs.setUser({ uid, username: form.name, email: form.email, phone: form.phone, branch: form.branch, role: 'employee', status: 'active', address: '', createdAt: new Date().toISOString() });
      toast.success('Employee added!'); setModal(null); reload();
    } catch (err: any) {
      let msg = err.message;
      if (err.code === 'auth/email-already-in-use') msg = 'Email already registered.';
      toast.error(msg);
    } finally { setSaving(false); }
  }

  async function saveEdit() {
    if (!editEmployee) return;
    setSaving(true);
    try {
      await fs.updateUser(editEmployee.uid, { username: form.name, phone: form.phone, branch: form.branch });
      toast.success('Employee updated'); setModal(null); reload();
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  }

  async function toggleStatus(e: User) {
    const next = e.status === 'inactive' ? 'active' : 'inactive';
    try { await fs.updateUser(e.uid, { status: next }); toast.success(`Employee ${next}`); reload(); }
    catch (err: any) { toast.error(err.message); }
  }

  return (
    <>
      <Modal open={modal === 'add'} onClose={() => setModal(null)} title={t('admin.modal.addEmployee')}
        footer={<><Btn variant="secondary" onClick={() => setModal(null)}>{t('common.cancel')}</Btn><Btn onClick={saveAdd} loading={saving}>{t('admin.modal.addEmployee')}</Btn></>}>
        <div className={styles.formGrid}>
          {([[t('admin.field.fullName'), 'name', 'text'], [t('admin.th.email'), 'email', 'email'], [t('admin.th.phone'), 'phone', 'text'], [t('admin.field.password'), 'password', 'password']] as const).map(([l, k, ty]) => (
            <div className={styles.field} key={k}>
              <label className={styles.fieldLabel}>{l}</label>
              <input className={styles.input} type={ty} value={(form as any)[k]} onChange={e => set(k, e.target.value)} />
            </div>
          ))}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>{t('admin.th.branch')}</label>
            <select className={styles.input} value={form.branch} onChange={e => set('branch', e.target.value)}>
              <option value="">{t('admin.field.select')}</option>
              {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
          </div>
        </div>
      </Modal>
      <Modal open={modal === 'edit'} onClose={() => setModal(null)} title={t('admin.modal.editEmployee')}
        footer={<><Btn variant="secondary" onClick={() => setModal(null)}>{t('common.cancel')}</Btn><Btn onClick={saveEdit} loading={saving}>{t('common.save')}</Btn></>}>
        <div className={styles.formGrid}>
          {([[t('admin.field.fullName'), 'name', 'text'], [t('admin.th.phone'), 'phone', 'text']] as const).map(([l, k, ty]) => (
            <div className={styles.field} key={k}>
              <label className={styles.fieldLabel}>{l}</label>
              <input className={styles.input} type={ty} value={(form as any)[k]} onChange={e => set(k, e.target.value)} />
            </div>
          ))}
          <div className={styles.field}>
            <label className={styles.fieldLabel}>{t('admin.th.branch')}</label>
            <select className={styles.input} value={form.branch} onChange={e => set('branch', e.target.value)}>
              <option value="">{t('admin.field.select')}</option>
              {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      <Card title={<IconText icon={<Briefcase size={16} />}>{t('admin.nav.employees')}</IconText>} action={<Btn size="sm" onClick={openAdd}>+ {t('admin.nav.employees')}</Btn>} noPad>
        <TableWrap>
          <table className={styles.table}>
            <thead><tr><th>{t('admin.th.name')}</th><th>{t('admin.th.email')}</th><th>{t('admin.th.phone')}</th><th>{t('admin.th.branch')}</th><th>{t('common.status')}</th><th>{t('common.actions')}</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6}><EmptyState icon={<LoadingIcon />} text={t('common.loading')} /></td></tr>
                : employees.length ? employees.map(e => (
                  <tr key={e.uid}>
                    <td>{e.username}</td>
                    <td className={styles.muted}>{e.email}</td>
                    <td className={styles.muted}>{e.phone ?? '—'}</td>
                    <td className={styles.muted}>{e.branch ?? '—'}</td>
                    <td><span className={`badge badge-${e.status === 'inactive' ? 'inactive' : 'active'}`}>{e.status ?? 'active'}</span></td>
                    <td>
                      <div className={styles.actionsRow}>
                        <Btn size="sm" variant="secondary" onClick={() => openEdit(e)}><Pencil size={14} /></Btn>
                        <Btn size="sm" variant="ghost" onClick={() => toggleStatus(e)}>{e.status === 'inactive' ? t('admin.btn.activate') : t('admin.btn.deactivate')}</Btn>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan={6}><EmptyState icon={<Briefcase size={28} />} text={t('admin.empty.noEmployeesYet')} /></td></tr>}
            </tbody>
          </table>
        </TableWrap>
      </Card>
    </>
  );
}

/* ── CUSTOMERS ── */
function AdminCustomers() {
  const { t } = useLanguage();
  const { users: customers, loading } = useUsersByRole('customer');
  const { orders } = useOrders();
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    if (!q) return customers;
    const lq = q.toLowerCase();
    return customers.filter(c => c.username.toLowerCase().includes(lq) || c.email.toLowerCase().includes(lq));
  }, [customers, q]);

  return (
    <Card title={<IconText icon={<Users size={16} />}>{t('admin.card.customerManagement')}</IconText>} action={<SearchBar placeholder={t('admin.search.customers')} onSearch={setQ} />} noPad>
      <TableWrap>
        <table className={styles.table}>
          <thead><tr><th>{t('admin.th.name')}</th><th>{t('admin.th.email')}</th><th>{t('admin.th.phone')}</th><th>{t('admin.th.address')}</th><th>{t('admin.th.orders')}</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5}><EmptyState icon={<LoadingIcon />} text={t('common.loading')} /></td></tr>
              : filtered.length ? filtered.map(c => (
                <tr key={c.uid}>
                  <td>{c.username}</td>
                  <td className={styles.muted}>{c.email}</td>
                  <td className={styles.muted}>{c.phone ?? '—'}</td>
                  <td className={styles.muted}>{c.address ?? '—'}</td>
                  <td><span className="badge badge-approved">{orders.filter(o => o.customerId === c.uid).length}</span></td>
                </tr>
              )) : <tr><td colSpan={5}><EmptyState icon={<Users size={28} />} text={t('admin.empty.noCustomersYet')} /></td></tr>}
          </tbody>
        </table>
      </TableWrap>
    </Card>
  );
}

/* ── ASSIGN DELIVERY ── */
function AdminAssign() {
  const { t } = useLanguage();
  const { orders, reload } = useOrders();
  const { users: drivers } = useUsersByRole('driver');
  const { branches } = useBranches();
  const [branchFilter, setBranchFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState<'' | 'direct' | 'consolidated'>('');
  const [selOrders, setSelOrders] = useState<string[]>([]);
  const [selDriver, setSelDriver] = useState('');
  const [assigning, setAssigning] = useState(false);

  const approved = orders
    .filter(o => o.status === 'approved')
    .filter(o => !branchFilter || o.branch === branchFilter)
    .filter(o => !serviceFilter || o.serviceType === serviceFilter);
  const active = drivers.filter(d => d.status !== 'inactive');
  const assigned = orders.filter(o => o.assignedDriver);

  function toggleOrder(id: string) {
    setSelOrders(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }
  function toggleSelectAll() {
    setSelOrders(prev => prev.length === approved.length ? [] : approved.map(o => o.orderId));
  }

  async function doAssign() {
    if (!selOrders.length || !selDriver) { toast.error('Select at least one order and a driver'); return; }
    const driver = drivers.find(d => d.uid === selDriver);
    if (!driver) { toast.error('Driver not found'); return; }
    setAssigning(true);
    let ok = 0, fail = 0;
    for (const orderId of selOrders) {
      const order = orders.find(o => o.orderId === orderId);
      if (!order) { fail++; continue; }
      try {
        await fs.updateOrder(orderId, { assignedDriver: selDriver, driverName: driver.username, driverUid: selDriver });
        await fs.updateOrderStatus(orderId, 'assigned', `Assigned to ${driver.username}`);
        if (order.customerId) await fs.addNotification(order.customerId, 'Driver Assigned', `${driver.username} assigned to ${orderId}`, 'info');
        await fs.addNotification(selDriver, 'New Delivery', `Order ${orderId} assigned to you`, 'info');
        ok++;
      } catch { fail++; }
    }
    setAssigning(false);
    if (ok) toast.success(`Assigned ${ok} order${ok > 1 ? 's' : ''} → ${driver.username}`);
    if (fail) toast.error(`${fail} order${fail > 1 ? 's' : ''} failed to assign`);
    setSelOrders([]); setSelDriver(''); reload();
  }

  return (
    <div className={styles.stack}>
      <Card title={<IconText icon={<MapPin size={16} />}>{t('admin.card.assignDriverToOrder')}</IconText>}>
        <p className={styles.hint}>{t('admin.hint.prefix')} <strong style={{ color: 'var(--blue)' }}>{t('admin.hint.approvedWord')}</strong> {t('admin.hint.suffix')} {t('admin.hint.bulkSuffix')}</p>

        <div className={styles.assignRow}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>{t('admin.th.branch')}</label>
            <select className={styles.input} value={branchFilter} onChange={e => { setBranchFilter(e.target.value); setSelOrders([]); }}>
              <option value="">{t('admin.field.allBranches')}</option>
              {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>{t('customer.service.title')}</label>
            <select className={styles.input} value={serviceFilter} onChange={e => { setServiceFilter(e.target.value as any); setSelOrders([]); }}>
              <option value="">{t('admin.field.allServiceTypes')}</option>
              <option value="consolidated">🏢 {t('customer.service.consolidated')}</option>
              <option value="direct">🚀 {t('customer.service.direct')}</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>{t('admin.field.selectDriver')}</label>
            <select className={styles.input} value={selDriver} onChange={e => setSelDriver(e.target.value)}>
              <option value="">{t('admin.field.chooseDriver')}</option>
              {active.map(d => <option key={d.uid} value={d.uid}>{d.username} — {d.vehicle} ({d.branch ?? 'Any'})</option>)}
            </select>
          </div>
        </div>

        <TableWrap>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 32 }}>
                  <input type="checkbox" checked={approved.length > 0 && selOrders.length === approved.length} onChange={toggleSelectAll} />
                </th>
                <th>{t('admin.th.orderId')}</th><th>{t('admin.th.receiver')}</th><th>{t('admin.th.branch')}</th><th>{t('customer.service.title')}</th><th>{t('admin.th.address')}</th>
              </tr>
            </thead>
            <tbody>
              {approved.length ? approved.map(o => (
                <tr key={o.orderId} onClick={() => toggleOrder(o.orderId)} style={{ cursor: 'pointer' }}>
                  <td onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selOrders.includes(o.orderId)} onChange={() => toggleOrder(o.orderId)} />
                  </td>
                  <td><span className={styles.orderId}>{o.orderId}</span></td>
                  <td>{o.receiverName}</td>
                  <td className={styles.muted}>{o.branch}</td>
                  <td><ServiceTypeBadge type={o.serviceType} /></td>
                  <td className={styles.muted}>{o.address}</td>
                </tr>
              )) : <tr><td colSpan={6}><EmptyState icon={<MapPin size={28} />} text={t('admin.empty.noApprovedOrders')} /></td></tr>}
            </tbody>
          </table>
        </TableWrap>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
          <Btn onClick={doAssign} loading={assigning} disabled={!selOrders.length || !selDriver}>
            <MapPin size={14} /> {selOrders.length > 1
              ? `${t('admin.btn.assignDriver')} (${selOrders.length} ${t('admin.th.orders').toLowerCase()})`
              : t('admin.btn.assignDriver')}
          </Btn>
          {selOrders.length > 0 && <span className={styles.muted}>{selOrders.length} {t('admin.field.selected')}</span>}
        </div>
      </Card>

      <Card title={<IconText icon={<ClipboardList size={16} />}>{t('admin.card.assignedOrders')}</IconText>} noPad>
        <TableWrap>
          <table className={styles.table}>
            <thead><tr><th>{t('admin.th.orderId')}</th><th>{t('admin.th.customer')}</th><th>{t('admin.th.receiver')}</th><th>{t('admin.th.driver')}</th><th>{t('common.status')}</th><th>{t('admin.th.updated')}</th></tr></thead>
            <tbody>
              {assigned.length ? assigned.map(o => (
                <tr key={o.orderId}>
                  <td><span className={styles.orderId}>{o.orderId}</span></td>
                  <td>{o.customerName}</td>
                  <td>{o.receiverName}</td>
                  <td>{o.driverName ?? '—'}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td className={styles.muted}>{fmtDate(o.updatedAt)}</td>
                </tr>
              )) : <tr><td colSpan={6}><EmptyState icon={<MapPin size={28} />} text={t('admin.empty.noAssignedYet')} /></td></tr>}
            </tbody>
          </table>
        </TableWrap>
      </Card>
    </div>
  );
}

/* ── BRANCHES ── */
function AdminBranches() {
  const { t } = useLanguage();
  const { branches, loading, reload } = useBranches();
  const branchPoints = useMemo(
    () => branches
      .filter(b => b.lat != null && b.lng != null)
      .map(b => ({ lat: b.lat!, lng: b.lng!, label: b.name })),
    [branches]
  );
  const { orders } = useOrders();
  const { confirm, Dialog } = useConfirm();
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editBranch, setEditBranch] = useState<Branch | null>(null);
  const [name, setName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [saving, setSaving] = useState(false);

  async function saveAdd() {
    if (!name.trim()) { toast.error('Enter branch name'); return; }
    setSaving(true);
    try {
      await fs.addBranch(name.trim(), lat ? parseFloat(lat) : undefined, lng ? parseFloat(lng) : undefined);
      toast.success(`Branch "${name}" added!`); setModal(null); setName(''); setLat(''); setLng(''); reload();
    }
    catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  }

  async function saveEdit() {
    if (!editBranch || !name.trim()) return;
    setSaving(true);
    try {
      await fs.updateBranch(editBranch.id, name.trim(), lat ? parseFloat(lat) : undefined, lng ? parseFloat(lng) : undefined);
      toast.success('Branch updated'); setModal(null); reload();
    }
    catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(b: Branch) {
    const ok = await confirm(`Delete "${b.name}"? This cannot be undone.`);
    if (!ok) return;
    try { await fs.deleteBranch(b.id); toast.success('Branch deleted'); reload(); }
    catch (err: any) { toast.error(err.message); }
  }

  return (
    <>
      <Dialog />
      <Modal open={modal === 'add'} onClose={() => setModal(null)} title={t('admin.modal.addBranch')}
        footer={<><Btn variant="secondary" onClick={() => setModal(null)}>{t('common.cancel')}</Btn><Btn onClick={saveAdd} loading={saving}>{t('admin.modal.addBranch')}</Btn></>}>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>{t('admin.field.branchName')}</label>
          <input className={styles.input} placeholder="e.g. Phnom Penh Branch" value={name} onChange={e => setName(e.target.value)} autoFocus />
        </div>
        <div className={styles.formGrid} style={{ marginTop: 12 }}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>{t('admin.field.latitude')}</label>
            <input className={styles.input} type="number" step="any" placeholder="11.5564" value={lat} onChange={e => setLat(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>{t('admin.field.longitude')}</label>
            <input className={styles.input} type="number" step="any" placeholder="104.9282" value={lng} onChange={e => setLng(e.target.value)} />
          </div>
        </div>
        <p className={styles.hint} style={{ marginTop: 8 }}>{t('admin.hint.coordsOptional')}</p>
      </Modal>

      <Modal open={modal === 'edit'} onClose={() => setModal(null)} title={t('admin.modal.editBranch')}
        footer={<><Btn variant="secondary" onClick={() => setModal(null)}>{t('common.cancel')}</Btn><Btn onClick={saveEdit} loading={saving}>{t('common.save')}</Btn></>}>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>{t('admin.field.branchName')}</label>
          <input className={styles.input} value={name} onChange={e => setName(e.target.value)} autoFocus />
        </div>
        <div className={styles.formGrid} style={{ marginTop: 12 }}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>{t('admin.field.latitude')}</label>
            <input className={styles.input} type="number" step="any" placeholder="11.5564" value={lat} onChange={e => setLat(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>{t('admin.field.longitude')}</label>
            <input className={styles.input} type="number" step="any" placeholder="104.9282" value={lng} onChange={e => setLng(e.target.value)} />
          </div>
        </div>
        <p className={styles.hint} style={{ marginTop: 8 }}>{t('admin.hint.coordsOptional')}</p>
      </Modal>
      {branchPoints.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <DomMap 
            // This forces a clean remount when points are added/removed
            key={`admin-branches-map-${branchPoints.length}`} 
            points={branchPoints} 
            height={280} 
          />
        </div>
      )}
      <Card title={<IconText icon={<Building2 size={16} />}>{t('admin.pgTitle.branches')}</IconText>} action={<Btn size="sm" onClick={() => { setName(''); setLat(''); setLng(''); setModal('add'); }}>+ {t('admin.nav.branches')}</Btn>} noPad>
        {loading ? <EmptyState icon={<LoadingIcon />} text={t('common.loading')} />
          : branches.length ? branches.map(b => (
            <div key={b.id} className={styles.branchRow}>
              <div className={styles.branchLeft}>
                <span className={styles.branchIcon}><Building2 size={20} /></span>
                <div>
                  <div className={styles.branchName}>{b.name}</div>
                  <div className={styles.muted}>
                    {orders.filter(o => o.branch === b.name).length} {t('admin.th.orders').toLowerCase()}
                    {' · '}
                    {b.lat != null && b.lng != null
                      ? <span style={{ color: 'var(--green)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {t('admin.field.coordsSet')}</span>
                      : <span style={{ color: 'var(--red)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={12} /> {t('admin.field.coordsMissing')}</span>}
                  </div>
                </div>
              </div>
              <div className={styles.actionsRow}>
                <Btn size="sm" variant="secondary" onClick={() => { setEditBranch(b); setName(b.name); setLat(b.lat?.toString() ?? ''); setLng(b.lng?.toString() ?? ''); setModal('edit'); }}><Pencil size={14} /></Btn>
                <Btn size="sm" variant="danger" onClick={() => handleDelete(b)}>{t('common.delete')}</Btn>
              </div>
            </div>
          )) : <EmptyState icon={<Building2 size={28} />} text={t('admin.empty.noBranchesYet')} />}
      </Card>
    </>
  );
}

/* ── WAREHOUSE INVENTORY ── */
// "In warehouse" = physically sitting at a branch right now: dropped off and awaiting
// dispatch (pending/approved), arrived at the destination branch awaiting customer
// pickup (arrived), or returned after a failed delivery attempt (failed).
// Orders that are assigned/pickedup/transit/outfordelivery are out with a driver, and
// delivered/rejected orders are no longer physically present — both are excluded.
const WAREHOUSE_STATUSES = ['pending', 'approved', 'arrived', 'failed'] as const;

function daysWaiting(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

function AdminInventory({ onView }: { onView: (o: Order) => void }) {
  const { t } = useLanguage();
  const { orders, loading } = useOrders();
  const { branches } = useBranches();
  const [branchFilter, setBranchFilter] = useState('');

  // Where an order is physically sitting right now: origin branch for pending/approved
  // (dropped off, awaiting dispatch); the destination branch for arrived/failed (arrived
  // orders are, by definition, at the receiver branch; failed delivery attempts happen
  // near the receiver, so the package is assumed to sit there until retried).
  function warehouseLocation(o: Order): string {
    if (o.status === 'arrived' || o.status === 'failed') return o.receiverBranch ?? o.branch;
    return o.branch;
  }

  const inWarehouse = orders.filter(o => WAREHOUSE_STATUSES.includes(o.status as any));
  const pending = inWarehouse.filter(o => o.status === 'pending').length;
  const approved = inWarehouse.filter(o => o.status === 'approved').length;
  const returned = inWarehouse.filter(o => o.status === 'failed').length;

  const byBranch = branches.map(b => ({
    branch: b,
    orders: inWarehouse.filter(o => warehouseLocation(o) === b.name),
  }));

  const visible = branchFilter
    ? inWarehouse.filter(o => warehouseLocation(o) === branchFilter)
    : inWarehouse;

  return (
    <div>
      <div className={styles.statsGrid}>
        <StatCard label={t('admin.stat.inWarehouse')} value={inWarehouse.length} icon={<Warehouse size={20} />} color="accent" />
        <StatCard label={t('admin.stat.pending')} value={pending} icon={<Clock size={20} />} color="amber" />
        <StatCard label={t('admin.stat.readyToDispatch')} value={approved} icon={<CheckCircle2 size={20} />} color="blue" />
        <StatCard label={t('admin.stat.returned')} value={returned} icon={<Undo2 size={20} />} color="red" />
      </div>

      <div style={{ marginBottom: 16 }}>
        <Card title={<IconText icon={<Building2 size={16} />}>{t('admin.card.byBranch')}</IconText>}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <button
              onClick={() => setBranchFilter('')}
              style={{
                cursor: 'pointer', borderRadius: 10, padding: '10px 14px', minWidth: 120, textAlign: 'left',
                border: branchFilter === '' ? '2px solid var(--accent)' : '1px solid var(--border2)',
                background: branchFilter === '' ? 'var(--accent-dim)' : 'var(--bg3)',
              }}
            >
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>{t('admin.field.allBranches')}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{inWarehouse.length}</div>
            </button>
            {byBranch.map(({ branch, orders: bo }) => (
              <button
                key={branch.id}
                onClick={() => setBranchFilter(branch.name)}
                style={{
                  cursor: 'pointer', borderRadius: 10, padding: '10px 14px', minWidth: 120, textAlign: 'left',
                  border: branchFilter === branch.name ? '2px solid var(--accent)' : '1px solid var(--border2)',
                  background: branchFilter === branch.name ? 'var(--accent-dim)' : 'var(--bg3)',
                }}
              >
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{branch.name}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{bo.length}</div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Card title={<IconText icon={<Package size={16} />}>{branchFilter || t('admin.field.allBranches')}</IconText>} noPad>
        <TableWrap>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('admin.th.orderId')}</th><th>{t('admin.th.receiver')}</th><th>{t('admin.th.branch')}</th>
                <th>{t('common.status')}</th><th>{t('admin.th.waiting')}</th><th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6}><EmptyState icon={<LoadingIcon />} text={t('common.loading')} /></td></tr>
                : visible.length ? visible
                  .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))
                  .map(o => {
                    const days = daysWaiting(o.updatedAt);
                    const stale = days >= 2;
                    return (
                      <tr key={o.orderId}>
                        <td><span className={styles.orderId}>{o.orderId}</span></td>
                        <td>{o.receiverName}</td>
                        <td className={styles.muted}>{o.branch}</td>
                        <td><StatusBadge status={o.status} /></td>
                        <td>
                          <span style={{ color: stale ? 'var(--red)' : 'var(--text3)', fontWeight: stale ? 700 : 400 }}>
                            {days <= 0 ? t('admin.th.today') : `${days}d`}
                          </span>
                        </td>
                        <td><Btn size="sm" variant="secondary" onClick={() => onView(o)}><Eye size={14} /></Btn></td>
                      </tr>
                    );
                  })
                  : <tr><td colSpan={6}><EmptyState icon={<Inbox size={28} />} text={t('admin.empty.warehouseEmpty')} /></td></tr>}
            </tbody>
          </table>
        </TableWrap>
      </Card>
    </div>
  );
}

/* ── TRACKING MANAGEMENT ── */
function AdminTracking() {
  const { t } = useLanguage();
  const { orders, loading, reload } = useOrders(o => !['delivered', 'rejected', 'failed'].includes(o.status));
  const [statuses, setStatuses] = useState<Record<string, string>>({});

  async function update(o: Order) {
    const newStatus = (statuses[o.orderId] ?? o.status) as OrderStatus;
    try {
      await fs.updateOrderStatus(o.orderId, newStatus, 'Updated by admin');
      if (o.customerId) await fs.addNotification(o.customerId, `Order ${STATUS_LABELS[newStatus]}`, `Your order ${o.orderId} is now ${STATUS_LABELS[newStatus]}`, 'info');
      toast.success(`${o.orderId} → ${STATUS_LABELS[newStatus]}`);
      reload();
    } catch (err: any) { toast.error(err.message); }
  }

  return (
    <Card title={<IconText icon={<MapIcon size={16} />}>{t('admin.card.updateTracking')}</IconText>} noPad>
      <TableWrap>
        <table className={styles.table}>
          <thead><tr><th>{t('admin.th.orderId')}</th><th>{t('admin.th.tracking')}</th><th>{t('admin.th.customer')}</th><th>{t('admin.th.receiver')}</th><th>{t('admin.th.current')}</th><th>{t('admin.th.newStatus')}</th><th></th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7}><EmptyState icon={<LoadingIcon />} text={t('common.loading')} /></td></tr>
              : orders.length ? orders.map(o => (
                <tr key={o.orderId}>
                  <td><span className={styles.orderId}>{o.orderId}</span></td>
                  <td className={styles.mono}>{o.trackingId}</td>
                  <td>{o.customerName}</td>
                  <td>{o.receiverName}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td>
                    <select className={styles.selectNative}
                      value={statuses[o.orderId] ?? o.status}
                      onChange={e => setStatuses(p => ({ ...p, [o.orderId]: e.target.value }))}>
                      {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </td>
                  <td><Btn size="sm" onClick={() => update(o)}>{t('common.save')}</Btn></td>
                </tr>
              )) : <tr><td colSpan={7}><EmptyState icon={<MapIcon size={28} />} text={t('admin.empty.noActiveOrders')} /></td></tr>}
          </tbody>
        </table>
      </TableWrap>
    </Card>
  );
}

/* ── REPORTS ── */
function AdminReports() {
  const { t } = useLanguage();
  const { orders } = useOrders();
  const { branches } = useBranches();
  const delivered = orders.filter(o => o.status === 'delivered').length;
  const failed = orders.filter(o => o.status === 'failed').length;
  const rate = orders.length ? ((delivered / orders.length) * 100).toFixed(1) : '0';
  const revenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.price ?? 0), 0).toFixed(2);

  // Status breakdown, shaped for the donut chart (zero-count statuses are dropped so the legend stays clean)
  const statusData = Object.entries(STATUS_LABELS)
    .map(([s, l]) => ({ key: s, name: l, value: orders.filter(o => o.status === s).length }))
    .filter(d => d.value > 0);

  // Orders per branch, shaped for the bar chart
  const branchData = branches.map(b => {
    const bo = orders.filter(o => o.branch === b.name);
    return { name: b.name, total: bo.length, delivered: bo.filter(o => o.status === 'delivered').length };
  });

  // Orders created per day, last 14 days, shaped for the trend chart
  const trendData = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return { key: d.toISOString().slice(0, 10), label: format(d, 'MMM d'), count: 0 };
    });
    const byDay = Object.fromEntries(days.map(d => [d.key, d]));
    orders.forEach(o => {
      const key = o.createdAt.slice(0, 10);
      if (byDay[key]) byDay[key].count++;
    });
    return days;
  }, [orders]);

  return (
    <div>
      <div className={styles.statsGrid}>
        <StatCard label={t('admin.stat.totalOrders')} value={orders.length} icon={<Package size={20} />} color="accent" />
        <StatCard label={t('admin.stat.delivered')} value={delivered} icon={<CheckCircle2 size={20} />} color="green" />
        <StatCard label={t('admin.stat.failed')} value={failed} icon={<XCircle size={20} />} color="red" />
        <StatCard label={t('admin.stat.successRate')} value={`${rate}%`} icon={<Percent size={20} />} color="blue" />
        <StatCard label={t('admin.stat.revenue')} value={`$${revenue}`} icon={<DollarSign size={20} />} color="accent" />
      </div>

      <div style={{ marginBottom: 16 }}>
        <Card title={<IconText icon={<TrendingUp size={16} />}>{t('admin.card.ordersTrend')}</IconText>}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" stroke="var(--text3)" fontSize={11} tickLine={false} axisLine={false} interval={1} />
              <YAxis stroke="var(--text3)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} width={28} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="count" name={t('admin.chart.orders')} stroke="var(--accent)" strokeWidth={2} fill="url(#trendFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className={styles.twoCol}>
        <Card title={<IconText icon={<PieChartIcon size={16} />}>{t('admin.card.statusBreakdown')}</IconText>}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={3}>
                {statusData.map(d => <Cell key={d.key} fill={STATUS_COLORS[d.key]} stroke="var(--bg2)" strokeWidth={2} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend
                layout="vertical" verticalAlign="middle" align="right"
                iconType="circle" iconSize={8}
                formatter={(value: string) => <span style={{ color: 'var(--text2)', fontSize: 12 }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title={<IconText icon={<Building2 size={16} />}>{t('admin.card.byBranch')}</IconText>}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={branchData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text3)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text3)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} width={28} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--bg3)' }} />
              <Legend formatter={(value: string) => <span style={{ color: 'var(--text2)', fontSize: 12 }}>{value}</span>} />
              <Bar dataKey="total" name={t('admin.th.total')} fill="var(--accent)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="delivered" name={t('admin.stat.delivered')} fill="var(--green)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

/* ── PROFILE ── */
function AdminProfile({ user }: { user: User }) {
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: user.username, phone: user.phone ?? '', address: user.address ?? '' });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  async function save() {
    try { await fs.updateUser(user.uid, form); toast.success('Profile updated!'); setEditing(false); }
    catch (err: any) { toast.error(err.message); }
  }

  return (
    <div className={styles.formCard}>
      <Card title={<IconText icon={<UserIcon size={16} />}>{t('admin.card.adminProfile')}</IconText>} action={<Btn size="sm" variant="secondary" onClick={() => setEditing(true)}><Pencil size={14} /> {t('common.edit')}</Btn>}>
        <div className={styles.profileHeader}>
          <div className={styles.bigAvatar}>{user.username[0].toUpperCase()}</div>
          <div>
            <div className={styles.profileName}>{user.username}</div>
            <div className={styles.profileEmail}>{user.email}</div>
            <span className="badge" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(240,165,0,.3)', marginTop: 8 }}>{t('admin.profile.badge')}</span>
          </div>
        </div>
        <div className={styles.divider} />
        <div className={styles.profileGrid}>
          {([[t('admin.field.fullName'), user.username], [t('admin.th.email'), user.email], [t('admin.th.phone'), user.phone ?? '—'], [t('admin.th.address'), user.address ?? '—']] as const).map(([l, v], i) => (
            <div key={i}><div className={styles.profileLabel}>{l}</div><div>{v}</div></div>
          ))}
        </div>
      </Card>

      <Modal open={editing} onClose={() => setEditing(false)} title={t('admin.modal.editProfile')}
        footer={<><Btn variant="secondary" onClick={() => setEditing(false)}>{t('common.cancel')}</Btn><Btn onClick={save}>{t('common.save')}</Btn></>}>
        <div className={styles.formGrid}>
          <div className={styles.field}><label className={styles.fieldLabel}>{t('admin.field.fullName')}</label><input className={styles.input} value={form.username} onChange={e => set('username', e.target.value)} /></div>
          <div className={styles.field}><label className={styles.fieldLabel}>{t('admin.th.phone')}</label><input className={styles.input} value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
          <div className={styles.field} style={{ gridColumn: 'span 2' }}><label className={styles.fieldLabel}>{t('admin.th.address')}</label><input className={styles.input} value={form.address} onChange={e => set('address', e.target.value)} /></div>
        </div>
      </Modal>
    </div>
  );
}