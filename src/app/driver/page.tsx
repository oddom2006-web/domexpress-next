'use client';
import dynamic from 'next/dynamic';
const DomMap = dynamic(() => import('@/components/shared/DomMap'), {
  ssr: false,
  loading: () => <div style={{ height: 320, borderRadius: 12, background: 'var(--bg3)' }} />,
});
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { StatCard, Card, Btn, Modal, EmptyState, StatusBadge, TableWrap } from '@/components/ui';
import { useBranches } from '@/hooks';
import * as fs from '@/lib/firestore';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { fmtDate, fmtDateTime } from '@/lib/utils';
import { optimizeRoute } from '@/lib/route';
import toast from 'react-hot-toast';
import type { Order, OrderStatus } from '@/types';
import { STATUS_LABELS } from '@/types';
import styles from './driver.module.css';
import {
  LayoutDashboard, Truck, ClipboardList, User as UserIcon,
  Loader2, Inbox, Eye, Pencil, Compass, RefreshCw, XCircle,
  User
} from 'lucide-react';

type T = ReturnType<typeof useLanguage>['t'];

function getNav(t: T) {
  return [
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: t('nav.dashboard') },
    { id: 'my-deliveries', icon: <Truck size={18} />, label: t('nav.deliveries') },
    { id: 'history', icon: <ClipboardList size={18} />, label: t('driver.nav.history') },
    { id: 'profile', icon: <UserIcon size={18} />, label: t('nav.profile') },
  ];
}

export default function DriverDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [section, setSection] = useState('dashboard');
  const [updateOrder, setUpdateOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user && user.role !== 'driver') router.replace('/auth');
  }, [user, router]);

  if (!user) return null;

  const NAV = getNav(t);

  const titles: Record<string, [string, string]> = {
    'dashboard': [t('nav.dashboard'), t('driver.pgSub.dashboard')],
    'my-deliveries': [t('nav.deliveries'), t('driver.pgSub.deliveries')],
    'history': [t('driver.nav.history'), t('driver.pgSub.history')],
    'profile': [t('nav.profile'), t('driver.pgSub.profile')],
  };
  const [title, sub] = titles[section] ?? [section, ''];

  return (
    <DashboardLayout navItems={NAV} active={section} onNavigate={setSection} pageTitle={title} pageSub={sub}>

      {/* Update Status Modal */}
      <UpdateModal
        order={updateOrder}
        onClose={() => setUpdateOrder(null)}
        onDone={() => { setUpdateOrder(null); setSection(s => s); }}
        driverUid={user.uid}
      />

      {section === 'dashboard' && <DriverDash driverUid={user.uid} onUpdate={setUpdateOrder} />}
      {section === 'my-deliveries' && <DriverDeliveries driverUid={user.uid} driverBranch={user.branch ?? ''} onUpdate={setUpdateOrder} />}
      {section === 'history' && <DriverHistory driverUid={user.uid} />}
      {section === 'profile' && <DriverProfile user={user} />}
    </DashboardLayout>
  );
}

/* ── HELPERS: fetch driver orders from Firestore ── */
async function fetchDriverOrders(driverUid: string): Promise<Order[]> {
  const q = query(collection(db, 'orders'), where('assignedDriver', '==', driverUid));
  const snap = await getDocs(q);
  const list = snap.docs.map(d => d.data() as Order);
  list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return list;
}

/* ── DASHBOARD ── */
function DriverDash({ driverUid, onUpdate }: { driverUid: string; onUpdate: (o: Order) => void }) {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try { setOrders(await fetchDriverOrders(driverUid)); }
    catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [driverUid]);

  const total = orders.length;
  const completed = orders.filter(o => o.status === 'delivered').length;
  const active = orders.filter(o => !['delivered', 'failed', 'rejected'].includes(o.status)).length;
  const failed = orders.filter(o => o.status === 'failed').length;
  const activeOrders = orders.filter(o => !['delivered', 'failed', 'rejected'].includes(o.status));

  return (
    <div>
      <div className={styles.statsGrid}>
        <StatCard label={t('driver.stat.totalAssigned')} value={total} icon={<Inbox size={20} />} color="accent" />
        <StatCard label={t('driver.stat.completed')} value={completed} icon={<ClipboardList size={20} />} color="green" />
        <StatCard label={t('driver.stat.active')} value={active} icon={<Truck size={20} />} color="blue" />
        <StatCard label={t('admin.stat.failed')} value={failed} icon={<XCircle size={20} />} color="red" />
      </div>

      <Card title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Truck size={16} />{t('driver.card.activeDeliveries')}</span>} action={<Btn size="sm" variant="secondary" onClick={load}><RefreshCw size={14} /> {t('driver.btn.refresh')}</Btn>} noPad>
        <TableWrap>
          <table className={styles.table}>
            <thead>
              <tr><th>{t('admin.th.orderId')}</th><th>{t('admin.th.customer')}</th><th>{t('admin.th.receiver')}</th><th>{t('admin.th.address')}</th><th>{t('common.status')}</th><th>{t('driver.th.action')}</th></tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={6}><EmptyState icon={<Loader2 size={20} />} text={t('common.loading')} /></td></tr>
                : activeOrders.length
                  ? activeOrders.slice(0, 5).map(o => (
                    <tr key={o.orderId}>
                      <td><span className={styles.orderId}>{o.orderId}</span></td>
                      <td>{o.customerName}</td>
                      <td>{o.receiverName}</td>
                      <td className={styles.muted}>{o.address}</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td>
                        <Btn size="sm" onClick={() => onUpdate(o)}>{t('driver.btn.updateStatus')}</Btn>
                      </td>
                    </tr>
                  ))
                  : <tr><td colSpan={6}><EmptyState icon={<Truck size={20} />} text={t('driver.empty.noActiveDeliveries')} /></td></tr>
              }
            </tbody>
          </table>
        </TableWrap>
      </Card>
    </div>
  );
}

/* ── MY DELIVERIES ── */
function DriverDeliveries({ driverUid, driverBranch, onUpdate }: { driverUid: string; driverBranch: string; onUpdate: (o: Order) => void }) {
  const { t } = useLanguage();
  const { branches } = useBranches();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRoute, setShowRoute] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const all = await fetchDriverOrders(driverUid);
      setOrders(all.filter(o => !['delivered', 'failed', 'rejected'].includes(o.status)));
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [driverUid]);

  const route = useMemo(
    () => optimizeRoute(orders, branches, driverBranch),
    [orders, branches, driverBranch]
  );
  const mapPoints = useMemo(() => {
    const branchByName = new Map(branches.map(b => [b.name, b]));
    const points: { lat: number; lng: number; label: string; sub?: string; stopNumber?: number }[] = [];

    const start = branchByName.get(driverBranch);
    if (start?.lat != null && start?.lng != null) {
      points.push({ lat: start.lat, lng: start.lng, label: driverBranch, sub: 'Start', stopNumber: 0 });
    }

    const seen = new Set<string>();
    route.stops.forEach(s => {
      if (seen.has(s.clusterKey) || s.lat == null || s.lng == null) return;
      seen.add(s.clusterKey);
      points.push({
        lat: s.lat, lng: s.lng,
        label: s.clusterLabel + (s.precise ? ' 📍' : ''),
        sub: `Stop ${s.stopNumber}`,
        stopNumber: s.stopNumber,
      });
    });
    return points;
  }, [route, branches, driverBranch]);

  return (
    <>
      {showRoute && (
        <>
          <div style={{ /* existing distance summary bar styles unchanged */ }}>
            {/* ...existing content... */}
          </div>

          {route.hasCoords && (
            <div style={{ marginBottom: 16 }}>
              <DomMap points={mapPoints} polyline height={320} />
            </div>
          )}
        </>
      )}

      <Card
        title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Truck size={16} />{t('driver.card.myActiveDeliveries')}</span>}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn size="sm" variant={showRoute ? 'primary' : 'secondary'} onClick={() => setShowRoute(v => !v)}>
              <Compass size={14} /> {t('driver.btn.suggestedRoute')}
            </Btn>
            <Btn size="sm" variant="secondary" onClick={load}><RefreshCw size={14} /> {t('driver.btn.refresh')}</Btn>
          </div>
        }
        noPad
      >
        <TableWrap>
          <table className={styles.table}>
            <thead>
              <tr>
                {showRoute && <th style={{ width: 36 }}>#</th>}
                <th>{t('admin.th.orderId')}</th><th>{t('admin.th.customer')}</th><th>{t('admin.th.receiver')}</th>
                <th>{t('admin.th.phone')}</th><th>{t('admin.th.address')}</th><th>{t('admin.th.branch')}</th>
                {showRoute && <th>{t('driver.route.leg')}</th>}
                <th>{t('common.status')}</th><th>{t('driver.th.action')}</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={showRoute ? 10 : 8}><EmptyState icon={<Loader2 size={20} />} text={t('common.loading')} /></td></tr>
                : orders.length
                  ? (showRoute ? route.stops.map(s => s.order) : orders).map((o, idx) => {
                    const stop = showRoute ? route.stops[idx] : null;
                    return (
                      <tr key={o.orderId}>
                        {showRoute && <td className={styles.muted}>{stop!.stopNumber}</td>}
                        <td><span className={styles.orderId}>{o.orderId}</span></td>
                        <td>{o.customerName}</td>
                        <td>{o.receiverName}</td>
                        <td className={styles.muted}>{o.phone}</td>
                        <td className={styles.muted}>{o.address}</td>
                        <td className={styles.muted}>{o.branch}</td>
                        {showRoute && (
                          <td className={styles.muted}>
                            {stop!.legDistanceKm != null
                              ? (stop!.legDistanceKm > 0 ? `+${stop!.legDistanceKm} km` : t('driver.route.sameStop'))
                              : '—'}
                          </td>
                        )}
                        <td><StatusBadge status={o.status} /></td>
                        <td><Btn size="sm" onClick={() => onUpdate(o)}>{t('common.edit')}</Btn></td>
                      </tr>
                    );
                  })
                  : <tr><td colSpan={showRoute ? 10 : 8}><EmptyState icon={<Inbox size={20} />} text={t('driver.empty.noActiveDeliveries')} /></td></tr>
              }
            </tbody>
          </table>
        </TableWrap>
      </Card>
    </>
  );
}

/* ── UPDATE STATUS MODAL ── */
function UpdateModal({
  order, onClose, onDone, driverUid
}: {
  order: Order | null;
  onClose: () => void;
  onDone: () => void;
  driverUid: string;
}) {
  const { t } = useLanguage();
  const [status, setStatus] = useState<OrderStatus>('assigned');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order) { setStatus(order.status as OrderStatus); setNote(''); }
  }, [order]);

  if (!order) return null;

  const currentOrder = order;

  const options: OrderStatus[] = ['assigned', 'pickedup', 'transit', 'outfordelivery', 'delivered', 'failed'];

  async function save() {
    setSaving(true);
    try {
      const finalNote = note.trim() || STATUS_LABELS[status];
      await fs.updateOrderStatus(currentOrder.orderId, status, finalNote);

      // Notify customer
      const notifType = status === 'delivered' ? 'success' : status === 'failed' ? 'warning' : 'info';
      const notifTitle = `Order ${STATUS_LABELS[status]}`;
      const notifBody = status === 'delivered'
        ? `Your order ${currentOrder.orderId} has been delivered! ${STATUS_LABELS[status]}`
        : status === 'failed'
          ? `Delivery attempt for ${currentOrder.orderId} failed. ${finalNote}`
          : `Your order ${currentOrder.orderId} is now ${STATUS_LABELS[status]}. ${finalNote}`;

      if (currentOrder.customerId) {
        await fs.addNotification(currentOrder.customerId, notifTitle, notifBody, notifType);
      }

      toast.success(`${currentOrder.orderId} → ${STATUS_LABELS[status]}`);
      onDone();
    } catch (err: any) {
      toast.error('Failed: ' + err.message);
    } finally { setSaving(false); }
  }

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={`${t('driver.modal.updatePrefix')} — ${currentOrder.orderId}`}
      footer={
        <>
          <Btn variant="secondary" onClick={onClose}>{t('common.cancel')}</Btn>
          <Btn loading={saving} onClick={save}>{t('common.save')}</Btn>
        </>
      }
    >
      {/* Current status */}
      <div className={styles.updateInfo}>
        <div className={styles.infoLabel}>{t('driver.modal.currentStatus')}</div>
        <StatusBadge status={currentOrder.status} />
      </div>

      {/* Delivery info */}
      <div className={styles.updateInfo}>
        <div className={styles.infoLabel}>{t('driver.modal.deliveryInfo')}</div>
        <div className={styles.infoName}>{currentOrder.receiverName}</div>
        <div className={styles.infoSub}>{currentOrder.phone}</div>
        <div className={styles.infoSub}>{currentOrder.address}</div>
        <div className={styles.infoSub} style={{ marginTop: 4 }}>{t('admin.th.branch')}: {currentOrder.branch}</div>
      </div>

      {/* New status */}
      <div className={styles.field}>
        <label className={styles.fieldLabel}>{t('admin.th.newStatus')}</label>
        <select
          className={styles.input}
          value={status}
          onChange={e => setStatus(e.target.value as OrderStatus)}
        >
          {options.map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* Note */}
      <div className={styles.field} style={{ marginTop: 12 }}>
        <label className={styles.fieldLabel}>{t('driver.field.note')}</label>
        <input
          className={styles.input}
          placeholder={t('driver.field.notePlaceholder')}
          value={note}
          onChange={e => setNote(e.target.value)}
        />
      </div>
    </Modal>
  );
}

/* ── DELIVERY HISTORY ── */
function DriverHistory({ driverUid }: { driverUid: string }) {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'orders'),
          where('assignedDriver', '==', driverUid),
          where('status', '==', 'delivered')
        );
        const snap = await getDocs(q);
        const list = snap.docs.map(d => d.data() as Order);
        list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        setOrders(list);
      } catch (e: any) { toast.error(e.message); }
      finally { setLoading(false); }
    }
    load();
  }, [driverUid]);

  return (
    <Card
      title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Inbox size={16} />{t('driver.nav.history')}</span>}
      action={
        <span className="badge badge-delivered">{orders.length} {t('driver.history.deliveredSuffix')}</span>
      }
      noPad
    >
      <TableWrap>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t('admin.th.orderId')}</th><th>{t('admin.th.tracking')}</th><th>{t('admin.th.customer')}</th>
              <th>{t('admin.th.receiver')}</th><th>{t('admin.th.address')}</th><th>{t('admin.th.branch')}</th>
              <th>{t('driver.th.deliveredAt')}</th><th>{t('common.status')}</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={8}><EmptyState icon={<Inbox size={28} />} text={t('common.loading')} /></td></tr>
              : orders.length
                ? orders.map(o => (
                  <tr key={o.orderId}>
                    <td><span className={styles.orderId}>{o.orderId}</span></td>
                    <td><span className={styles.mono}>{o.trackingId}</span></td>
                    <td>{o.customerName}</td>
                    <td>{o.receiverName}</td>
                    <td className={styles.muted}>{o.address}</td>
                    <td className={styles.muted}>{o.branch}</td>
                    <td className={styles.muted}>{fmtDateTime(o.updatedAt)}</td>
                    <td><StatusBadge status={o.status} /></td>
                  </tr>
                ))
                : <tr><td colSpan={8}><EmptyState icon={<Inbox size={28} />} text={t('driver.empty.noCompletedYet')} /></td></tr>
            }
          </tbody>
        </table>
      </TableWrap>
    </Card>
  );
}

/* ── DRIVER PROFILE ── */
function DriverProfile({ user }: { user: any }) {
  const { t } = useLanguage();
  const { branches } = useBranches();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    username: user.username,
    phone: user.phone ?? '',
    vehicle: user.vehicle ?? 'Motorbike',
    branch: user.branch ?? '',
    address: user.address ?? '',
  });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  // driver order stats
  const [stats, setStats] = useState({ total: 0, done: 0, active: 0 });
  useEffect(() => {
    fetchDriverOrders(user.uid).then(orders => {
      setStats({
        total: orders.length,
        done: orders.filter(o => o.status === 'delivered').length,
        active: orders.filter(o => !['delivered', 'failed', 'rejected'].includes(o.status)).length,
      });
    }).catch(() => { });
  }, [user.uid]);

  async function save() {
    try {
      await fs.updateUser(user.uid, form);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err: any) { toast.error(err.message); }
  }

  const profileFields = [
    [t('admin.field.fullName'), user.username],
    [t('admin.th.email'), user.email],
    [t('admin.th.phone'), user.phone ?? '—'],
    [t('admin.th.vehicle'), user.vehicle ?? '—'],
    [t('admin.th.branch'), user.branch ?? '—'],
    [t('admin.th.address'), user.address ?? '—'],
  ];

  return (
    <div className={styles.formCard}>
      <Card
        title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><User size={16} />{t('driver.card.driverProfile')}</span>}
        action={<Btn size="sm" variant="secondary" onClick={() => setEditing(true)}><Pencil size={14} /> {t('common.edit')}</Btn>}
      >
        {/* Avatar + name */}
        <div className={styles.profileHeader}>
          <div className={styles.bigAvatar}>{user.username[0].toUpperCase()}</div>
          <div>
            <div className={styles.profileName}>{user.username}</div>
            <div className={styles.profileEmail}>{user.email}</div>
            <span className="badge badge-active" style={{ marginTop: 8, display: 'inline-flex' }}>{t('driver.profile.badge')}</span>
          </div>
        </div>

        <div className={styles.divider} />

        {/* Fields */}
        <div className={styles.profileGrid}>
          {profileFields.map(([l, v], i) => (
            <div key={i}>
              <div className={styles.profileLabel}>{l}</div>
              <div>{v}</div>
            </div>
          ))}
        </div>

        <div className={styles.divider} />

        {/* Quick stats */}
        <div className={styles.miniStats}>
          <div className={styles.miniStat}>
            <div className={styles.miniStatVal} style={{ color: 'var(--accent)' }}>{stats.total}</div>
            <div className={styles.miniStatLabel}>{t('driver.stat.totalAssigned')}</div>
          </div>
          <div className={styles.miniStat}>
            <div className={styles.miniStatVal} style={{ color: 'var(--green)' }}>{stats.done}</div>
            <div className={styles.miniStatLabel}>{t('admin.stat.delivered')}</div>
          </div>
          <div className={styles.miniStat}>
            <div className={styles.miniStatVal} style={{ color: 'var(--blue)' }}>{stats.active}</div>
            <div className={styles.miniStatLabel}>{t('driver.mini.inProgress')}</div>
          </div>
        </div>
      </Card>

      {/* Edit modal */}
      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title={t('admin.modal.editProfile')}
        footer={
          <>
            <Btn variant="secondary" onClick={() => setEditing(false)}>{t('common.cancel')}</Btn>
            <Btn onClick={save}>{t('driver.btn.saveChanges')}</Btn>
          </>
        }
      >
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>{t('admin.field.fullName')}</label>
            <input className={styles.input} value={form.username} onChange={e => set('username', e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>{t('admin.th.phone')}</label>
            <input className={styles.input} value={form.phone} onChange={e => set('phone', e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>{t('driver.field.vehicleType')}</label>
            <select className={styles.input} value={form.vehicle} onChange={e => set('vehicle', e.target.value)}>
              {['Motorbike', 'Van', 'Truck', 'Bicycle', 'Tuk Tuk'].map(v => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>{t('admin.th.branch')}</label>
            <select className={styles.input} value={form.branch} onChange={e => set('branch', e.target.value)}>
              <option value="">{t('driver.field.selectDash')}</option>
              {branches.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.field} style={{ gridColumn: 'span 2' }}>
            <label className={styles.fieldLabel}>{t('admin.th.address')}</label>
            <input className={styles.input} value={form.address} onChange={e => set('address', e.target.value)} />
          </div>
        </div>
      </Modal>
    </div>
  );
}