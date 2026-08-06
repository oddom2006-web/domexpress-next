'use client';
// src/app/employee/page.tsx
import dynamic from 'next/dynamic';
  const LocationPicker = dynamic(() => import('@/components/shared/LocationPicker'), {
    ssr: false,
    loading: () => <div style={{ height: 220, borderRadius: 10, background: 'var(--bg3)' }} />,
  });
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { StatCard, Card, Btn, Modal, EmptyState, StatusBadge, SearchBar, TableWrap, Field } from '@/components/ui';
import { useOrders, useBranches, useUsersByRole } from '@/hooks';
import * as fs from '@/lib/firestore';
import { fmtDate, fmtDateTime, calculatePrice, stripUndefined } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { Order, PaymentMethod, ServiceType, User } from '@/types';
import { STATUS_LABELS } from '@/types';
import { PaymentBadge, PaymentStatusBadge, ServiceTypeBadge, OrderDetailBody } from '@/components/shared/OrderComponents';
import styles from '../driver/driver.module.css'; // shares the same class vocabulary as driver/admin/customer
import {
  LayoutDashboard, Inbox as InboxIn, Tag, Search, Package,
  User as UserIcon, Loader2, Eye, RefreshCw, CheckCircle,
  Smartphone,
  CreditCard,
  DollarSign,
  Rocket,
  Building2,
  Inbox,
  Clock,
  XCircle,
  Pencil,
} from 'lucide-react';

type T = ReturnType<typeof useLanguage>['t'];

function getNav(t: T) {
  return [
    { id: 'dashboard', icon: <LayoutDashboard size={16} />, label: t('nav.dashboard') },
    { id: 'incoming', icon: <InboxIn size={16} />, label: t('employee.nav.incoming') },
    { id: 'pickup', icon: <Tag size={16} />, label: t('employee.nav.pickup') },
    { id: 'lookup', icon: <Search size={16} />, label: t('employee.nav.lookup') },
    { id: 'create', icon: <Package size={16} />, label: t('employee.nav.create') },
    { id: 'profile', icon: <UserIcon size={16} />, label: t('nav.profile') },
  ];
}

function daysWaiting(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [section, setSection] = useState('dashboard');
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user && user.role !== 'employee') router.replace('/auth');
  }, [user, router]);

  if (!user) return null;
  const myBranch = user.branch ?? '';

  const NAV = getNav(t);
  const titles: Record<string, [string, string]> = {
    dashboard: [t('nav.dashboard'), `${myBranch} — ${t('employee.pgSub.dashboard')}`],
    incoming: [t('employee.nav.incoming'), t('employee.pgSub.incoming')],
    pickup: [t('employee.nav.pickup'), t('employee.pgSub.pickup')],
    lookup: [t('employee.nav.lookup'), t('employee.pgSub.lookup')],
    create: [t('employee.nav.create'), t('employee.pgSub.create')],
    profile: [t('nav.profile'), t('employee.pgSub.profile')],
  };
  const [title, sub] = titles[section] ?? [section, ''];

  return (
    <DashboardLayout navItems={NAV} active={section} onNavigate={setSection} pageTitle={title} pageSub={sub}>
      <Modal open={!!detailOrder} onClose={() => setDetailOrder(null)} title={`${t('admin.modal.order')} ${detailOrder?.orderId}`}
        footer={<Btn variant="secondary" onClick={() => setDetailOrder(null)}>{t('common.close')}</Btn>}>
        {detailOrder && <OrderDetailBody order={detailOrder} />}
      </Modal>

      {section === 'dashboard' && <EmployeeDash myBranch={myBranch} onView={setDetailOrder} />}
      {section === 'incoming' && <EmployeeIncoming myBranch={myBranch} onView={setDetailOrder} />}
      {section === 'pickup' && <EmployeePickup myBranch={myBranch} onView={setDetailOrder} />}
      {section === 'lookup' && <EmployeeLookup myBranch={myBranch} onView={setDetailOrder} />}
      {section === 'create' && <EmployeeCreate myBranch={myBranch} employeeUid={user.uid} />}
      {section === 'profile' && <EmployeeProfile user={user} />}
    </DashboardLayout>
  );
}

/* ── DASHBOARD ── */
function EmployeeDash({ myBranch, onView }: { myBranch: string; onView: (o: Order) => void }) {
  const { t } = useLanguage();
  const { orders, loading } = useOrders();

  const incoming = orders.filter(o => o.receiverBranch === myBranch && ['assigned', 'pickedup', 'transit', 'outfordelivery'].includes(o.status));
  const ready = orders.filter(o => o.receiverBranch === myBranch && o.status === 'arrived');
  const today = new Date().toISOString().slice(0, 10);
  const handedOverToday = orders.filter(o => o.receiverBranch === myBranch && o.status === 'delivered' && o.updatedAt.slice(0, 10) === today).length;
  const createdToday = orders.filter(o => o.createdByRole === 'employee' && o.branch === myBranch && o.createdAt.slice(0, 10) === today).length;

  return (
    <div>
      <div className={styles.statsGrid}>
        <StatCard label={t('employee.stat.incoming')} value={incoming.length} icon={<Inbox size={20} />} color="blue" />
        <StatCard label={t('employee.stat.readyPickup')} value={ready.length} icon={<Tag size={20} />} color="amber" />
        <StatCard label={t('employee.stat.handedToday')} value={handedOverToday} icon={<CheckCircle size={20} />} color="green" />
        <StatCard label={t('employee.stat.createdToday')} value={createdToday} icon={<Package size={20} />} color="accent" />
      </div>

      <Card title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Package size={20} />{t('employee.card.readyPickup')}</span>} noPad>
        <TableWrap>
          <table className={styles.table}>
            <thead><tr><th>{t('admin.th.orderId')}</th><th>{t('admin.th.receiver')}</th><th>{t('admin.field.locationTag')}</th><th>{t('admin.th.waiting')}</th><th></th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={5}><EmptyState icon={<Clock size={20} />} text={t('common.loading')} /></td></tr>
                : ready.length ? ready.slice(0, 6).map(o => (
                  <tr key={o.orderId}>
                    <td><span className={styles.orderId}>{o.orderId}</span></td>
                    <td>{o.receiverName}</td>
                    <td className={styles.muted}>{o.locationTag ?? '—'}</td>
                    <td className={styles.muted}>{daysWaiting(o.updatedAt)}d</td>
                    <td><Btn size="sm" variant="secondary" onClick={() => onView(o)}>{t('admin.btn.view')}</Btn></td>
                  </tr>
                )) : <tr><td colSpan={5}><EmptyState icon={<Inbox size={20} />} text={t('employee.empty.noneReady')} /></td></tr>}
            </tbody>
          </table>
        </TableWrap>
      </Card>
    </div>
  );
}

/* ── INCOMING SHIPMENTS ── */
function EmployeeIncoming({ myBranch, onView }: { myBranch: string; onView: (o: Order) => void }) {
  const { t } = useLanguage();
  const { orders, loading, reload } = useOrders();
  const [arriving, setArriving] = useState<Order | null>(null);
  const [locationTag, setLocationTag] = useState('');
  const [saving, setSaving] = useState(false);

  const incoming = orders.filter(o => o.receiverBranch === myBranch && ['assigned', 'pickedup', 'transit', 'outfordelivery'].includes(o.status));

  function openArrive(o: Order) { setArriving(o); setLocationTag(''); }

  async function confirmArrive() {
    if (!arriving) return;
    setSaving(true);
    try {
      await fs.updateOrderStatus(arriving.orderId, 'arrived', locationTag ? `Arrived — ${locationTag}` : 'Arrived at branch');
      if (locationTag) await fs.updateOrder(arriving.orderId, { locationTag });
      if (arriving.customerId) {
        await fs.addNotification(arriving.customerId, 'Ready for Pickup', `Your order ${arriving.orderId} has arrived at ${myBranch} and is ready for pickup!`, 'success');
      }
      toast.success(`${arriving.orderId} marked arrived`);
      setArriving(null); reload();
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  }

  return (
    <>
      <Modal open={!!arriving} onClose={() => setArriving(null)} title={`${t('employee.modal.markArrived')} — ${arriving?.orderId}`}
        footer={<><Btn variant="secondary" onClick={() => setArriving(null)}>{t('common.cancel')}</Btn><Btn onClick={confirmArrive} loading={saving}>{t('employee.btn.confirmArrived')}</Btn></>}>
        <p className={styles.hint}>{t('employee.hint.markArrived')}</p>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>{t('admin.field.locationTag')}</label>
          <input className={styles.input} placeholder={t('admin.field.locationTagPlaceholder')} value={locationTag} onChange={e => setLocationTag(e.target.value)} autoFocus />
        </div>
      </Modal>

      <Card title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Inbox size={20} />{t('employee.card.incoming')}</span>} noPad>
        <TableWrap>
          <table className={styles.table}>
            <thead><tr><th>{t('admin.th.orderId')}</th><th>{t('admin.th.tracking')}</th><th>{t('admin.th.receiver')}</th><th>{t('admin.th.phone')}</th><th>{t('common.status')}</th><th></th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6}><EmptyState icon={<Clock size={20} />} text={t('common.loading')} /></td></tr>
                : incoming.length ? incoming.map(o => (
                  <tr key={o.orderId}>
                    <td><span className={styles.orderId}>{o.orderId}</span></td>
                    <td><span className={styles.mono}>{o.trackingId}</span></td>
                    <td>{o.receiverName}</td>
                    <td className={styles.muted}>{o.phone}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td><Btn size="sm" onClick={() => openArrive(o)}>{t('employee.btn.markArrived')}</Btn></td>
                  </tr>
                )) : <tr><td colSpan={6}><EmptyState icon={<Inbox size={20} />} text={t('employee.empty.noneIncoming')} /></td></tr>}
            </tbody>
          </table>
        </TableWrap>
      </Card>
    </>
  );
}

/* ── READY FOR PICKUP ── */
function EmployeePickup({ myBranch, onView }: { myBranch: string; onView: (o: Order) => void }) {
  const { t } = useLanguage();
  const { orders, loading, reload } = useOrders();
  const [handover, setHandover] = useState<Order | null>(null);
  const [note, setNote] = useState('');
  const [markPaid, setMarkPaid] = useState(false);
  const [saving, setSaving] = useState(false);

  const ready = orders.filter(o => o.receiverBranch === myBranch && o.status === 'arrived');

  function openHandover(o: Order) { setHandover(o); setNote(''); setMarkPaid(o.paymentStatus === 'paid'); }

  async function confirmHandover() {
    if (!handover) return;
    setSaving(true);
    try {
      await fs.updateOrderStatus(handover.orderId, 'delivered', note.trim() || 'Picked up at branch by customer');
      if (markPaid && handover.paymentStatus !== 'paid') await fs.updateOrder(handover.orderId, { paymentStatus: 'paid' });
      if (handover.customerId) await fs.addNotification(handover.customerId, 'Order Delivered', `Your order ${handover.orderId} has been picked up. Thank you!`, 'success');
      toast.success(`${handover.orderId} handed over`);
      setHandover(null); reload();
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  }

  return (
    <>
      <Modal open={!!handover} onClose={() => setHandover(null)} title={`${t('employee.modal.handover')} — ${handover?.orderId}`}
        footer={<><Btn variant="secondary" onClick={() => setHandover(null)}>{t('common.cancel')}</Btn><Btn onClick={confirmHandover} loading={saving}>{t('employee.btn.confirmHandover')}</Btn></>}>
        <div className={styles.updateInfo}>
          <div className={styles.infoLabel}>{t('admin.th.receiver')}</div>
          <div className={styles.infoName}>{handover?.receiverName}</div>
          <div className={styles.infoSub}>{handover?.phone}</div>
          {handover?.locationTag && <div className={styles.infoSub} style={{ marginTop: 4 }}>📍 {handover.locationTag}</div>}
        </div>
        {handover?.paymentMethod === 'cod' && handover.paymentStatus !== 'paid' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 13, color: 'var(--text2)', cursor: 'pointer' }}>
            <input type="checkbox" checked={markPaid} onChange={e => setMarkPaid(e.target.checked)} />
            {t('employee.field.collectedCod')} {handover.price != null ? `$${handover.price.toFixed(2)}` : ''}
          </label>
        )}
        <div className={styles.field} style={{ marginTop: 12 }}>
          <label className={styles.fieldLabel}>{t('driver.field.note')}</label>
          <input className={styles.input} placeholder={t('employee.field.handoverNotePlaceholder')} value={note} onChange={e => setNote(e.target.value)} />
        </div>
      </Modal>

      <Card title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Package size={20} />{t('employee.card.readyPickup')}</span>} noPad>
        <TableWrap>
          <table className={styles.table}>
            <thead><tr><th>{t('admin.th.orderId')}</th><th>{t('admin.th.receiver')}</th><th>{t('admin.th.phone')}</th><th>{t('admin.field.locationTag')}</th><th>{t('admin.th.waiting')}</th><th>{t('admin.th.payment')}</th><th></th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={7}><EmptyState icon={<Clock size={20} />} text={t('common.loading')} /></td></tr>
                : ready.length ? ready
                  .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt))
                  .map(o => {
                    const days = daysWaiting(o.updatedAt);
                    return (
                      <tr key={o.orderId}>
                        <td><span className={styles.orderId}>{o.orderId}</span></td>
                        <td>{o.receiverName}</td>
                        <td className={styles.muted}>{o.phone}</td>
                        <td className={styles.muted}>{o.locationTag ?? '—'}</td>
                        <td><span style={{ color: days >= 2 ? 'var(--red)' : 'var(--text3)', fontWeight: days >= 2 ? 700 : 400 }}>{days <= 0 ? t('admin.th.today') : `${days}d`}</span></td>
                        <td><PaymentStatusBadge status={o.paymentStatus} /></td>
                        <td><Btn size="sm" onClick={() => openHandover(o)}>{t('employee.btn.handOver')}</Btn></td>
                      </tr>
                    );
                  })
                  : <tr><td colSpan={7}><EmptyState icon={<Inbox size={20} />} text={t('employee.empty.noneReady')} /></td></tr>}
            </tbody>
          </table>
        </TableWrap>
      </Card>
    </>
  );
}

/* ── FRONT-DESK LOOKUP ── */
function EmployeeLookup({ myBranch, onView }: { myBranch: string; onView: (o: Order) => void }) {
  const { t } = useLanguage();
  const { orders, loading } = useOrders();
  const [q, setQ] = useState('');

  const branchOrders = orders.filter(o => o.branch === myBranch || o.receiverBranch === myBranch);
  const results = useMemo(() => {
    if (!q.trim()) return [];
    const lq = q.trim().toLowerCase();
    return branchOrders.filter(o =>
      o.orderId.toLowerCase().includes(lq) ||
      o.trackingId.toLowerCase().includes(lq) ||
      o.receiverName.toLowerCase().includes(lq) ||
      o.phone.toLowerCase().includes(lq) ||
      (o.customerName ?? '').toLowerCase().includes(lq)
    );
  }, [branchOrders, q]);

  return (
    <Card title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Search size={20} />{t('employee.card.lookup')}</span>}>
      <input
        className={styles.input}
        placeholder={t('employee.lookup.placeholder')}
        value={q}
        onChange={e => setQ(e.target.value)}
        style={{ marginBottom: 16 }}
        autoFocus
      />
      {loading ? <EmptyState icon={<Clock size={20} />} text={t('common.loading')} />
        : !q.trim() ? <EmptyState icon={<Search size={20} />} text={t('employee.lookup.prompt')} />
          : results.length ? (
            <TableWrap>
              <table className={styles.table}>
                <thead><tr><th>{t('admin.th.orderId')}</th><th>{t('admin.th.receiver')}</th><th>{t('admin.th.phone')}</th><th>{t('common.status')}</th><th>{t('admin.field.locationTag')}</th><th></th></tr></thead>
                <tbody>
                  {results.map(o => (
                    <tr key={o.orderId}>
                      <td><span className={styles.orderId}>{o.orderId}</span></td>
                      <td>{o.receiverName}</td>
                      <td className={styles.muted}>{o.phone}</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td className={styles.muted}>{o.locationTag ?? '—'}</td>
                      <td><Btn size="sm" variant="secondary" onClick={() => onView(o)}>{t('admin.btn.view')}</Btn></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          ) : <EmptyState icon={<XCircle size={20} />} text={t('employee.lookup.noResults')} />}
    </Card>
  );
}

/* ── CREATE WALK-IN ORDER ── */
function EmployeeCreate({ myBranch, employeeUid }: { myBranch: string; employeeUid: string }) {
  const { t } = useLanguage();
  const { branches } = useBranches();
  const { users: customers } = useUsersByRole('customer');
  const [loading, setLoading] = useState(false);

  const [customerMode, setCustomerMode] = useState<'search' | 'guest'>('search');
  const [customerQuery, setCustomerQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [senderPin,   setSenderPin]   = useState<{ lat: number; lng: number } | null>(null);
  const [receiverPin, setReceiverPin] = useState<{ lat: number; lng: number } | null>(null);
  const [showPins,     setShowPins]   = useState(false); // collapsed by default, keeps the form uncluttered

  const [form, setForm] = useState({
    guestName: '', guestPhone: '',
    receiverName: '', phone: '', address: '', receiverBranch: '',
    packageType: 'Document', weight: '0.5',
    
  });
  const [serviceType, setServiceType] = useState<ServiceType>('consolidated');
  const [payment, setPayment] = useState<PaymentMethod>('cod');
  const [collectedNow, setCollectedNow] = useState(true);
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const custMatches = useMemo(() => {
    if (!customerQuery.trim()) return [];
    const lq = customerQuery.trim().toLowerCase();
    return customers.filter(c => c.username.toLowerCase().includes(lq) || (c.phone ?? '').includes(lq)).slice(0, 6);
  }, [customers, customerQuery]);

  const fromBranch = branches.find(b => b.name === myBranch);
  const toBranch   = branches.find(b => b.name === form.receiverBranch);
  const weightNum  = parseFloat(form.weight) || 0;
  // Pin, when set, is more precise than the branch — prefer it for pricing
  const fromPoint = senderPin   ?? fromBranch;
  const toPoint   = receiverPin ?? toBranch;
  const { price, distanceKm } = useMemo(
    () => calculatePrice(weightNum, fromPoint, toPoint, serviceType),
    [weightNum, fromPoint, toPoint, serviceType]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.receiverBranch) { toast.error('Please select a receiver branch'); return; }
    if (customerMode === 'search' && !selectedCustomer) { toast.error('Select a customer, or switch to guest entry'); return; }
    if (customerMode === 'guest' && !form.guestName.trim()) { toast.error('Enter the customer\'s name'); return; }
    setLoading(true);
    try {
      const { orderId, trackingId } = await fs.genOrderId();
      const order = {
        orderId, trackingId,
        customerId: customerMode === 'search' ? selectedCustomer!.uid : null,
        customerName: customerMode === 'search' ? selectedCustomer!.username : form.guestName,
        customerPhone: customerMode === 'guest' ? form.guestPhone : undefined,
        senderName: customerMode === 'search' ? selectedCustomer!.username : form.guestName,
        receiverName: form.receiverName, phone: form.phone, address: form.address,
        packageType: form.packageType, weight: weightNum,
        branch: myBranch, receiverBranch: form.receiverBranch,
        senderLat: senderPin?.lat, senderLng: senderPin?.lng,
        receiverLat: receiverPin?.lat, receiverLng: receiverPin?.lng,
        serviceType,
        distanceKm: distanceKm ?? undefined, price,
        assignedDriver: null, driverName: null, driverUid: null,
        status: 'pending' as const,
        paymentMethod: payment,
        paymentStatus: (payment === 'cod' && collectedNow) ? 'paid' as const : 'unpaid' as const,
        createdByRole: 'employee' as const,
        createdByUid: employeeUid,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        history: [{ status: 'pending' as const, time: new Date().toISOString(), note: `Created at counter — ${myBranch}` }],
      };
      await fs.createOrder(stripUndefined(order));
      if (order.customerId) await fs.addNotification(order.customerId, 'Order Created', `An order was created for you at ${myBranch}. Tracking: ${trackingId}`, 'pending');
      toast.success(`Order ${orderId} created! Tracking: ${trackingId}`);
      setForm({ guestName: '', guestPhone: '', receiverName: '', phone: '', address: '', receiverBranch: '', packageType: 'Document', weight: '0.5' });
      setSelectedCustomer(null); setCustomerQuery(''); setCollectedNow(true);
    } catch (err: any) {
      toast.error('Failed: ' + err.message);
    } finally { setLoading(false); }
  }

  const SERVICE_OPTIONS: { id: ServiceType; icon: React.ReactNode; label: string }[] = [
    { id: 'consolidated', icon: <Building2 size={20} />, label: t('customer.service.consolidated') },
    { id: 'direct', icon: <Rocket size={20} />, label: t('customer.service.direct') },
  ];
  const PAYMENT_OPTIONS: { id: PaymentMethod; icon: React.ReactNode; label: string }[] = [
    { id: 'cod', icon: <DollarSign size={20} />, label: t('customer.payment.cod') },
    { id: 'qr', icon: <Smartphone size={20} />, label: t('customer.payment.qr') },
    { id: 'card', icon: <CreditCard size={20    } />, label: t('customer.payment.card') },
  ];

  return (
    <div className={styles.formCard}>
      <Card title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><Package size={20} />{t('employee.card.createOrder')}</span>} noPad>
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          {/* Customer */}
          <div className={styles.colSpan2}>
            <label className={styles.fieldLabel} style={{ display: 'block', marginBottom: 8 }}>{t('employee.field.customer')}</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <button type="button" onClick={() => { setCustomerMode('search'); }} style={{
                cursor: 'pointer', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                border: customerMode === 'search' ? '2px solid var(--accent)' : '1px solid var(--border2)',
                background: customerMode === 'search' ? 'var(--accent-dim)' : 'var(--bg3)', color: 'var(--text)',
              }}>{t('employee.field.searchExisting')}</button>
              <button type="button" onClick={() => { setCustomerMode('guest'); setSelectedCustomer(null); }} style={{
                cursor: 'pointer', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                border: customerMode === 'guest' ? '2px solid var(--accent)' : '1px solid var(--border2)',
                background: customerMode === 'guest' ? 'var(--accent-dim)' : 'var(--bg3)', color: 'var(--text)',
              }}>{t('employee.field.guestEntry')}</button>
            </div>

            {customerMode === 'search' ? (
              selectedCustomer ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 8, background: 'var(--accent-dim)', border: '1px solid rgba(240,165,0,.3)' }}>
                  <div><strong>{selectedCustomer.username}</strong> <span className={styles.muted}>· {selectedCustomer.phone ?? selectedCustomer.email}</span></div>
                  <Btn size="sm" variant="ghost" type="button" onClick={() => setSelectedCustomer(null)}>{t('common.cancel')}</Btn>
                </div>
              ) : (
                <>
                  <input className={styles.input} placeholder={t('employee.field.searchPlaceholder')} value={customerQuery} onChange={e => setCustomerQuery(e.target.value)} />
                  {custMatches.length > 0 && (
                    <div style={{ marginTop: 6, border: '1px solid var(--border2)', borderRadius: 8, overflow: 'hidden' }}>
                      {custMatches.map(c => (
                        <div key={c.uid} onClick={() => { setSelectedCustomer(c); setCustomerQuery(''); }}
                          style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid var(--border)' }}>
                          <strong>{c.username}</strong> <span className={styles.muted}>· {c.phone ?? c.email}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )
            ) : (
              <div className={styles.formGrid}>
                <Field label={t('employee.field.guestName')}><input className={styles.input} value={form.guestName} onChange={e => set('guestName', e.target.value)} /></Field>
                <Field label={t('employee.field.guestPhone')}><input className={styles.input} placeholder="+855 xx xxx xxxx" value={form.guestPhone} onChange={e => set('guestPhone', e.target.value)} /></Field>
              </div>
            )}
          </div>

          {/* Service type */}
          <div className={styles.colSpan2}>
            <label className={styles.fieldLabel} style={{ display: 'block', marginBottom: 8 }}>{t('customer.service.title')}</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {SERVICE_OPTIONS.map(opt => (
                <button type="button" key={opt.id} onClick={() => setServiceType(opt.id)} style={{
                  textAlign: 'left', cursor: 'pointer', borderRadius: 10, padding: '10px 14px',
                  border: serviceType === opt.id ? '2px solid var(--accent)' : '1px solid var(--border2)',
                  background: serviceType === opt.id ? 'var(--accent-dim)' : 'var(--bg3)',
                }}>
                  <span style={{ marginRight: 6 }}>{opt.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Field label={t('admin.field.receiverName')}><input className={styles.input} value={form.receiverName} onChange={e => set('receiverName', e.target.value)} required /></Field>
          <Field label={t('customer.field.receiverPhone')}><input className={styles.input} placeholder="+855 xx xxx xxxx" value={form.phone} onChange={e => set('phone', e.target.value)} required /></Field>
          <Field label={t('customer.field.senderBranch')}><input className={styles.input} value={myBranch} disabled /></Field>
          <Field label={t('customer.field.receiverBranch')}>
            <select className={styles.input} value={form.receiverBranch} onChange={e => set('receiverBranch', e.target.value)}>
              <option value="">{t('customer.field.selectBranch')}</option>
              {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
          </Field>
          <div className={styles.colSpan2}>
            <Field label={t('customer.field.deliveryAddress')}><input className={styles.input} value={form.address} onChange={e => set('address', e.target.value)} required /></Field>
          </div>
          <Field label={t('admin.field.packageType')}>
            <select className={styles.input} value={form.packageType} onChange={e => set('packageType', e.target.value)}>
              {['Document', 'Electronics', 'Clothing', 'Food', 'Medicine', 'Other'].map(ty => <option key={ty}>{ty}</option>)}
            </select>
          </Field>
          <Field label={t('customer.field.weight')}><input className={styles.input} type="number" step="0.1" min="0.1" value={form.weight} onChange={e => set('weight', e.target.value)} required /></Field>
          <div className={styles.colSpan2}>
    <button
      type="button"
      onClick={() => setShowPins(v => !v)}
      style={{
        fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none',
        cursor: 'pointer', padding: 0, marginBottom: showPins ? 10 : 0,
      }}
    >
      📍 {showPins ? t('customer.location.hidePins') : t('customer.location.togglePin')}
    </button>

    {showPins && (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label className={styles.fieldLabel} style={{ display: 'block', marginBottom: 6 }}>
            {t('customer.location.senderPin')}
          </label>
          <LocationPicker
            lat={senderPin?.lat} lng={senderPin?.lng}
            defaultCenter={fromBranch?.lat != null ? [fromBranch.lat, fromBranch.lng!] : undefined}
            onChange={(lat, lng) => setSenderPin({ lat, lng })}
            useMyLocationLabel={t('customer.location.useMyLocation')}
          />
        </div>
        <div>
          <label className={styles.fieldLabel} style={{ display: 'block', marginBottom: 6 }}>
            {t('customer.location.receiverPin')}
          </label>
          <LocationPicker
            lat={receiverPin?.lat} lng={receiverPin?.lng}
            defaultCenter={toBranch?.lat != null ? [toBranch.lat, toBranch.lng!] : undefined}
            onChange={(lat, lng) => setReceiverPin({ lat, lng })}
            useMyLocationLabel={t('customer.location.useMyLocation')}
          />
        </div>
      </div>
    )}
  </div>
          <div className={styles.colSpan2}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: 10, background: 'var(--accent-dim)', border: '1px solid rgba(240,165,0,.3)' }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{t('customer.price.total')}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{weightNum} kg{distanceKm != null ? ` · ${distanceKm} km` : ''}</div>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent)' }}>${price.toFixed(2)}</div>
            </div>
          </div>

          <div className={styles.colSpan2}>
            <label className={styles.fieldLabel} style={{ display: 'block', marginBottom: 8 }}>{t('customer.payment.title')}</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {PAYMENT_OPTIONS.map(opt => (
                <button type="button" key={opt.id} onClick={() => setPayment(opt.id)} style={{
                  textAlign: 'left', cursor: 'pointer', borderRadius: 10, padding: '10px 14px',
                  border: payment === opt.id ? '2px solid var(--accent)' : '1px solid var(--border2)',
                  background: payment === opt.id ? 'var(--accent-dim)' : 'var(--bg3)',
                }}>
                  <span style={{ marginRight: 6 }}>{opt.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{opt.label}</span>
                </button>
              ))}
            </div>
            {payment === 'cod' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 13, color: 'var(--text2)', cursor: 'pointer' }}>
                <input type="checkbox" checked={collectedNow} onChange={e => setCollectedNow(e.target.checked)} />
                {t('employee.field.collectedNow')}
              </label>
            )}
          </div>

          <div className={styles.colSpan2}>
            <Btn loading={loading} style={{ width: '100%' }}><Package size={16} /> {t('employee.btn.createOrder')} — ${price.toFixed(2)}</Btn>
          </div>
        </form>
      </Card>
    </div>
  );
}

/* ── PROFILE ── */
function EmployeeProfile({ user }: { user: User }) {
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: user.username, phone: user.phone ?? '' });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  async function save() {
    try { await fs.updateUser(user.uid, form); toast.success('Profile updated!'); setEditing(false); }
    catch (err: any) { toast.error(err.message); }
  }

  const profileFields = [
    [t('admin.field.fullName'), user.username],
    [t('admin.th.email'), user.email],
    [t('admin.th.phone'), user.phone ?? '—'],
    [t('admin.th.branch'), user.branch ?? '—'],
  ];

  return (
    <div className={styles.formCard}>
      <Card title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><UserIcon size={16} />{t('employee.card.profile')}</span>} action={<Btn size="sm" variant="secondary" onClick={() => setEditing(true)}><Pencil size={15} /> {t('common.edit')}</Btn>}>
        <div className={styles.profileHeader}>
          <div className={styles.bigAvatar}>{user.username[0].toUpperCase()}</div>
          <div>
            <div className={styles.profileName}>{user.username}</div>
            <div className={styles.profileEmail}>{user.email}</div>
            <span className="badge badge-active" style={{ marginTop: 8, display: 'inline-flex' }}>{t('employee.profile.badge')}</span>
          </div>
        </div>
        <div className={styles.divider} />
        <div className={styles.profileGrid}>
          {profileFields.map(([l, v], i) => (
            <div key={i}><div className={styles.profileLabel}>{l}</div><div>{v}</div></div>
          ))}
        </div>
      </Card>

      <Modal open={editing} onClose={() => setEditing(false)} title={t('admin.modal.editProfile')}
        footer={<><Btn variant="secondary" onClick={() => setEditing(false)}>{t('common.cancel')}</Btn><Btn onClick={save}>{t('common.save')}</Btn></>}>
        <div className={styles.formGrid}>
          <Field label={t('admin.field.fullName')}><input className={styles.input} value={form.username} onChange={e => set('username', e.target.value)} /></Field>
          <Field label={t('admin.th.phone')}><input className={styles.input} value={form.phone} onChange={e => set('phone', e.target.value)} /></Field>
        </div>
      </Modal>
    </div>
  );
}