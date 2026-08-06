'use client';
import dynamic from 'next/dynamic';
  const LocationPicker = dynamic(() => import('@/components/shared/LocationPicker'), {
    ssr: false,
    loading: () => <div style={{ height: 220, borderRadius: 10, background: 'var(--bg3)' }} />,
  });
import { useState, useMemo, useEffect } from 'react';
import { useRouter }     from 'next/navigation';
import { useAuth }       from '@/context/AuthContext';
import { useLanguage }   from '@/context/LanguageContext';
import DashboardLayout   from '@/components/layout/DashboardLayout';
import { StatCard, Card, Btn, Modal, EmptyState, StatusBadge, SearchBar, TableWrap, Field } from '@/components/ui';
import { useOrders, useBranches, useNotifications } from '@/hooks';
import * as fs           from '@/lib/firestore';
import { fmtDate, fmtDateTime, calculatePrice, stripUndefined } from '@/lib/utils';
import { downloadInvoice } from '@/lib/invoice';
import toast             from 'react-hot-toast';
import type { Order, PaymentMethod, ServiceType } from '@/types';
import styles            from './customer.module.css';
import { PaymentBadge, PaymentStatusBadge, ServiceTypeBadge, OrderDetailBody } from '@/components/shared/OrderComponents';
import {
    LayoutDashboard, Package, ClipboardList, Search, Bell,
    User as UserIcon, Loader2, Inbox, Eye, Truck, MapPin, Lock,
    Rocket, Building2, DollarSign, CreditCard, Smartphone,
    Banknote, FileText,
    CheckCircle,
    AlertTriangle,
    Clock,
    Pencil,
    Clipboard
  } from 'lucide-react';

type T = ReturnType<typeof useLanguage>['t'];

function getNav(t: T) {
  return [
    { id:'dashboard',    icon:<LayoutDashboard size={16} />, label:t('nav.dashboard')          },
    { id:'create-order', icon:<Package size={16} />, label:t('customer.nav.createOrder') },
    { id:'my-orders',    icon:<ClipboardList size={16} />, label:t('customer.nav.myOrders')    },
    { id:'track',        icon:<Search size={16} />, label:t('customer.nav.track')       },
    { id:'notifications',icon:<Bell size={16} />, label:t('nav.notifications'), notif:true },
    { id:'profile',      icon:<UserIcon size={16} />, label:t('nav.profile')              },
  ];
}

export default function CustomerDashboard() {
  const { user, logout }   = useAuth();
  const router             = useRouter();
  const { t }              = useLanguage();
  const [section, setSection] = useState('dashboard');
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  // Redirect if not customer
  useEffect(() => {
    if (user && user.role !== 'customer') {
      router.replace(user.role === 'admin' ? '/admin' : '/driver');
    }
  }, [user, router]);

  if (!user) return null;

  const NAV = getNav(t);

  const sectionTitles: Record<string, [string, string]> = {
    'dashboard':     [t('nav.dashboard'),               `${t('customer.pgSub.welcome')}, ${user.username}`],
    'create-order':  [t('customer.nav.createOrder'),     t('customer.pgSub.createOrder')],
    'my-orders':     [t('customer.nav.myOrders'),        t('customer.pgSub.myOrders')],
    'track':         [t('customer.nav.track'),           t('customer.pgSub.track')],
    'notifications': [t('nav.notifications'),            t('customer.pgSub.notifications')],
    'profile':       [t('nav.profile'),                  t('customer.pgSub.profile')],
  };
  const [title, sub] = sectionTitles[section] ?? [section, ''];

  return (
    <DashboardLayout
      navItems={NAV}
      active={section}
      onNavigate={setSection}
      pageTitle={title}
      pageSub={sub}
      topbarRight={
        <Btn size="sm" onClick={() => setSection('create-order')}>+ {t('customer.btn.newOrder')}</Btn>
      }
    >
      {/* Detail Modal */}
      <Modal open={!!detailOrder} onClose={() => setDetailOrder(null)} title={`${t('admin.modal.order')} ${detailOrder?.orderId}`}
        footer={<Btn variant="secondary" onClick={() => setDetailOrder(null)}>{t('common.close')}</Btn>}>
        {detailOrder && <OrderDetailBody order={detailOrder} />}
      </Modal>

      {section === 'dashboard'    && <DashSection    uid={user.uid} onView={setDetailOrder} onNew={() => setSection('create-order')} />}
      {section === 'create-order' && <CreateSection  uid={user.uid} username={user.username} onDone={() => setSection('my-orders')} />}
      {section === 'my-orders'    && <MyOrdersSection uid={user.uid} onView={setDetailOrder} />}
      {section === 'track'        && <TrackSection />}
      {section === 'notifications'&& <NotifsSection  uid={user.uid} />}
      {section === 'profile'      && <ProfileSection user={user} />}
    </DashboardLayout>
  );
}

/* ── DASHBOARD ── */
function DashSection({ uid, onView, onNew }: { uid:string; onView:(o:Order)=>void; onNew:()=>void }) {
  const { t } = useLanguage();
  const { orders, loading } = useOrders(o => o.customerId === uid);
  const total     = orders.length;
  const pending   = orders.filter(o => ['pending','approved'].includes(o.status)).length;
  const transit   = orders.filter(o => ['assigned','pickedup','transit','outfordelivery'].includes(o.status)).length;
  const delivered = orders.filter(o => o.status === 'delivered').length;

  return (
    <div>
      <div className={styles.statsGrid}>
        <StatCard label={t('admin.stat.totalOrders')} value={total}     icon={<Package size={20} />} color="accent" />
        <StatCard label={t('admin.stat.pending')}      value={pending}   icon={<Loader2 size={20} />} color="amber"  />
        <StatCard label={t('customer.stat.inTransit')} value={transit}   icon={<Truck size={20} />} color="blue"   />
        <StatCard label={t('admin.stat.delivered')}    value={delivered} icon={<CheckCircle size={20} />} color="green"  />
      </div>
      <Card title={<span style={{display:'inline-flex',alignItems:'center',gap:7}}><Clipboard size={16}/>{t('admin.card.recentOrders')}</span>} action={<Btn size="sm" onClick={onNew}>+ {t('customer.btn.newOrder')}</Btn>} noPad>
        <TableWrap>
          <table className={styles.table}>
            <thead><tr><th>{t('admin.th.orderId')}</th><th>{t('admin.th.tracking')}</th><th>{t('admin.th.receiver')}</th><th>{t('admin.th.branch')}</th><th>{t('common.status')}</th><th>{t('admin.th.date')}</th><th></th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={7}><EmptyState icon={<Loader2 size={28} />} text={t('common.loading')} /></td></tr>
                : orders.length ? orders.slice(0,5).map(o => (
                  <tr key={o.orderId}>
                    <td><span className={styles.orderId}>{o.orderId}</span></td>
                    <td><span className={styles.mono}>{o.trackingId}</span></td>
                    <td>{o.receiverName}</td>
                    <td>{o.branch}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td className={styles.muted}>{fmtDate(o.createdAt)}</td>
                    <td><Btn size="sm" variant="secondary" onClick={() => onView(o)}>{t('admin.btn.view')}</Btn></td>
                  </tr>
                )) : <tr><td colSpan={7}><EmptyState icon={<Inbox size={28} />} text={t('customer.empty.noOrdersYet')} /></td></tr>}
            </tbody>
          </table>
        </TableWrap>
      </Card>
    </div>
  );
}

/* ── CREATE ORDER ── */
function CreateSection({ uid, username, onDone }: { uid:string; username:string; onDone:()=>void }) {
  const { t } = useLanguage();
  const { branches } = useBranches();
  const [loading, setLoading] = useState(false);
  const [senderPin,   setSenderPin]   = useState<{ lat: number; lng: number } | null>(null);
  const [receiverPin, setReceiverPin] = useState<{ lat: number; lng: number } | null>(null);
  const [showPins,     setShowPins]   = useState(false); // collapsed by default, keeps the form uncluttered
  const [form, setForm] = useState({
    senderName:'', receiverName:'', phone:'', address:'',
    packageType:'Document', weight:'0.5', branch:'', receiverBranch:'',
  });
  const [payment, setPayment] = useState<PaymentMethod>('cod');
  const [serviceType, setServiceType] = useState<ServiceType>('direct');
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => { set('senderName', username); }, [username]);

  const fromBranch = branches.find(b => b.name === form.branch);
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
    if (!form.branch)         { toast.error('Please select a sender branch'); return; }
    if (!form.receiverBranch) { toast.error('Please select a receiver branch'); return; }
    setLoading(true);
    try {
      const { orderId, trackingId } = await fs.genOrderId();
      const order = {
        orderId, trackingId,
        
        customerId: uid, customerName: username,
        senderName: form.senderName, receiverName: form.receiverName,
        phone: form.phone, address: form.address,
        packageType: form.packageType, weight: weightNum,
        branch: form.branch, receiverBranch: form.receiverBranch,
        senderLat: senderPin?.lat, senderLng: senderPin?.lng,
        receiverLat: receiverPin?.lat, receiverLng: receiverPin?.lng,
        serviceType,
        distanceKm: distanceKm ?? undefined, price,
        assignedDriver: null, driverName: null, driverUid: null,
        status: 'pending' as const,
        paymentMethod: payment,
        paymentStatus: 'unpaid' as const,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        history: [{ status: 'pending' as const, time: new Date().toISOString(), note: 'Order created' }],
      };
      await fs.createOrder(stripUndefined(order));
      await fs.addNotification(uid, 'Order Created', `Your order ${orderId} is awaiting approval.`, 'pending');
      toast.success(`Order ${orderId} created! Tracking: ${trackingId}`);
      onDone();
    } catch (err: any) {
      toast.error('Failed: ' + err.message);
    } finally { setLoading(false); }
  }

  const SERVICE_OPTIONS: { id: ServiceType; icon: React.ReactNode; label: string; desc: string }[] = [
    { id: 'direct',       icon: <Rocket size={20} />, label: t('customer.service.direct'),       desc: t('customer.service.directDesc')       },
    { id: 'consolidated', icon: <Building2 size={20} />, label: t('customer.service.consolidated'), desc: t('customer.service.consolidatedDesc') },
  ];

  const PAYMENT_OPTIONS: { id: PaymentMethod; icon: React.ReactNode; label: string; desc: string }[] = [
    { id: 'cod',  icon: <Banknote size={22} />, label: t('customer.payment.cod'),  desc: t('customer.payment.codDesc')  },
    { id: 'qr',   icon: <Smartphone size={22} />, label: t('customer.payment.qr'),   desc: t('customer.payment.qrDesc')   },
    { id: 'card', icon: <CreditCard size={22} />, label: t('customer.payment.card'), desc: t('customer.payment.cardDesc') },
  ];

  return (
    <div className={styles.formCard}>
      <Card title={<span style={{display:'inline-flex',alignItems:'center',gap:7}}><Package size={16}/>{t('customer.card.newDeliveryOrder')}</span>}>
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          {/* Service type — decide this first, since it affects price */}
          <div className={styles.colSpan2}>
            <label className={styles.fieldLabel} style={{ display:'block', marginBottom:8 }}>{t('customer.service.title')}</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:10 }}>
              {SERVICE_OPTIONS.map(opt => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setServiceType(opt.id)}
                  style={{
                    textAlign:'left', cursor:'pointer', borderRadius:10, padding:'14px 16px',
                    border: serviceType === opt.id ? '2px solid var(--accent)' : '1px solid var(--border2)',
                    background: serviceType === opt.id ? 'var(--accent-dim)' : 'var(--bg3)',
                    transition:'all .15s',
                  }}
                >
                  <div style={{ fontSize:22, marginBottom:4 }}>{opt.icon}</div>
                  <div style={{ fontWeight:700, fontSize:14, color:'var(--text)' }}>{opt.label}</div>
                  <div style={{ fontSize:12, color:'var(--text3)', marginTop:3 }}>{opt.desc}</div>
                </button>
              ))}
            </div>
            {serviceType === 'consolidated' && (
              <p className={styles.hint} style={{ marginTop:8 }}>📌 {t('customer.service.consolidatedNote')}</p>
            )}
          </div>

          <Field label={t('customer.field.senderName')}><input className={styles.input} value={form.senderName} onChange={e=>set('senderName',e.target.value)} required /></Field>
          <Field label={t('admin.field.receiverName')}><input className={styles.input} placeholder="Recipient's name" value={form.receiverName} onChange={e=>set('receiverName',e.target.value)} required /></Field>
          <Field label={t('customer.field.receiverPhone')}><input className={styles.input} placeholder="+855 xx xxx xxxx" value={form.phone} onChange={e=>set('phone',e.target.value)} required /></Field>
          <Field label={t('customer.field.senderBranch')}>
            <select className={styles.input} value={form.branch} onChange={e=>set('branch',e.target.value)}>
              <option value="">{t('customer.field.selectBranch')}</option>
              {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
          </Field>
          <Field label={t('customer.field.receiverBranch')}>
            <select className={styles.input} value={form.receiverBranch} onChange={e=>set('receiverBranch',e.target.value)}>
              <option value="">{t('customer.field.selectBranch')}</option>
              {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
          </Field>
          <div className={styles.colSpan2}>
            <Field label={t('customer.field.deliveryAddress')}><input className={styles.input} placeholder="Full delivery address" value={form.address} onChange={e=>set('address',e.target.value)} required /></Field>
          </div>
          <Field label={t('admin.field.packageType')}>
            <select className={styles.input} value={form.packageType} onChange={e=>set('packageType',e.target.value)}>
              {['Document','Electronics','Clothing','Food','Medicine','Other'].map(ty=><option key={ty}>{ty}</option>)}
            </select>
          </Field>
          <Field label={t('customer.field.weight')}><input className={styles.input} type="number" step="0.1" min="0.1" value={form.weight} onChange={e=>set('weight',e.target.value)} required /></Field>
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
          {/* Live price estimate */}
          <div className={styles.colSpan2}>
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'14px 18px', borderRadius:10, background:'var(--accent-dim)', border:'1px solid rgba(240,165,0,.3)',
            }}>
              <div>
                <div style={{ fontSize:12, color:'var(--text2)' }}>{t('customer.price.estimated')} — {serviceType === 'direct' ? t('customer.service.direct') : t('customer.service.consolidated')}</div>
                <div style={{ fontSize:12, color:'var(--text3)', marginTop:2 }}>
                  {weightNum} kg{distanceKm != null ? ` · ${distanceKm} km` : ''}
                  {distanceKm == null && form.branch && form.receiverBranch ? ` · ${t('customer.price.distanceUnavailable')}` : ''}
                </div>
              </div>
              <div style={{ fontSize:26, fontWeight:800, color:'var(--accent)' }}>${price.toFixed(2)}</div>
            </div>
          </div>

          <div className={styles.colSpan2}>
            <label className={styles.fieldLabel} style={{ display:'block', marginBottom:8 }}>{t('customer.payment.title')}</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10 }}>
              {PAYMENT_OPTIONS.map(opt => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setPayment(opt.id)}
                  style={{
                    textAlign:'left', cursor:'pointer', borderRadius:10, padding:'12px 14px',
                    border: payment === opt.id ? '2px solid var(--accent)' : '1px solid var(--border2)',
                    background: payment === opt.id ? 'var(--accent-dim)' : 'var(--bg3)',
                    transition:'all .15s',
                  }}
                >
                  <div style={{ fontSize:20, marginBottom:4 }}>{opt.icon}</div>
                  <div style={{ fontWeight:600, fontSize:13, color:'var(--text)' }}>{opt.label}</div>
                  <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{opt.desc}</div>
                </button>
              ))}
            </div>

            {payment === 'cod' && (
              <div style={{ marginTop:12, padding:'12px 16px', borderRadius:10, background:'var(--bg3)', border:'1px solid var(--border2)', fontSize:12, color:'var(--text2)' }}>
                {t('customer.payment.codAmountPrefix')} <strong style={{ color:'var(--accent)' }}>${price.toFixed(2)}</strong> {t('customer.payment.codAmountSuffix')}
              </div>
            )}
            {payment === 'qr' && (
              <div style={{ marginTop:12, padding:16, borderRadius:10, background:'var(--bg3)', border:'1px solid var(--border2)', display:'flex', gap:16, alignItems:'center' }}>
                <img
                  src="/assets/images/payment-qr.png"
                  alt="Payment QR code"
                  style={{ width:120, height:120, borderRadius:8, background:'#fff', objectFit:'contain' }}
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div>
                  <div style={{ fontSize:13, color:'var(--text)', fontWeight:700, marginBottom:4 }}>{t('customer.payment.qrAmountPrefix')} ${price.toFixed(2)}</div>
                  <div style={{ fontSize:12, color:'var(--text2)' }}>{t('customer.payment.qrInstructions')}</div>
                </div>
              </div>
            )}
            {payment === 'card' && (
              <div style={{ marginTop:12, padding:'12px 16px', borderRadius:10, background:'var(--bg3)', border:'1px solid var(--border2)', fontSize:12, color:'var(--text2)' }}>
                <div style={{ fontSize:13, color:'var(--text)', fontWeight:700, marginBottom:4 }}>{t('customer.payment.cardAmountPrefix')} ${price.toFixed(2)}</div>
                {t('customer.payment.cardNote')}
              </div>
            )}
          </div>

          <div className={styles.colSpan2}>
            <Btn loading={loading} style={{ width:'100%' }}><Rocket size={14} /> {t('customer.btn.submitOrder')} — ${price.toFixed(2)}</Btn>
          </div>
        </form>
      </Card>
    </div>
  );
}

/* ── MY ORDERS ── */
function MyOrdersSection({ uid, onView }: { uid:string; onView:(o:Order)=>void }) {
  const { t } = useLanguage();
  const { orders, loading } = useOrders(o => o.customerId === uid);
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    if (!q) return orders;
    const lq = q.toLowerCase();
    return orders.filter(o =>
      o.orderId.toLowerCase().includes(lq) ||
      o.trackingId.toLowerCase().includes(lq) ||
      o.receiverName.toLowerCase().includes(lq)
    );
  }, [orders, q]);

  return (
    <Card title={<span style={{display:'inline-flex',alignItems:'center',gap:7}}><Clipboard size={16}/>{t('customer.nav.myOrders')}</span>} action={<SearchBar placeholder={t('admin.search.orders')} onSearch={setQ} />} noPad>
      <TableWrap>
        <table className={styles.table}>
          <thead><tr><th>{t('admin.th.orderId')}</th><th>{t('admin.th.tracking')}</th><th>{t('admin.th.receiver')}</th><th>{t('admin.th.address')}</th><th>{t('common.status')}</th><th>{t('customer.service.title')}</th><th>{t('customer.price.total')}</th><th>{t('admin.th.driver')}</th><th>{t('admin.th.date')}</th><th></th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={10}><EmptyState icon={<Clock size={20} />} text={t('common.loading')} /></td></tr>
              : filtered.length ? filtered.map(o => (
                <tr key={o.orderId}>
                  <td><span className={styles.orderId}>{o.orderId}</span></td>
                  <td><span className={styles.mono}>{o.trackingId}</span></td>
                  <td>{o.receiverName}</td>
                  <td className={styles.muted}>{o.address}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td><ServiceTypeBadge type={o.serviceType} /></td>
                  <td style={{ color:'var(--accent)', fontWeight:600 }}>{o.price != null ? `$${o.price.toFixed(2)}` : '—'}</td>
                  <td className={styles.muted}>{o.driverName ?? '—'}</td>
                  <td className={styles.muted}>{fmtDate(o.createdAt)}</td>
                  <td><Btn size="sm" variant="secondary" onClick={() => onView(o)}>{t('admin.btn.view')}</Btn></td>
                </tr>
              )) : <tr><td colSpan={10}><EmptyState icon={<AlertTriangle size={20} />} text={t('customer.empty.noOrdersFound')} /></td></tr>}
          </tbody>
        </table>
      </TableWrap>
    </Card>
  );
}

/* ── TRACK ── */
function TrackSection() {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState<Order | null | 'notfound'>('notfound');
  const [loading, setLoading] = useState(false);

  async function doTrack() {
    const raw = query.trim().toUpperCase();
    if (!raw) return;
    setLoading(true);
    try {
      let found = await fs.getOrder(raw);
      if (!found) {
        // try by trackingId
        const { getDocs, query: q2, where, collection } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        const snap = await getDocs(q2(collection(db,'orders'), where('trackingId','==',raw)));
        if (!snap.empty) found = snap.docs[0].data() as Order;
      }
      setOrder(found ?? 'notfound');
    } catch (err: any) {
      toast.error(err.message);
    } finally { setLoading(false); }
  }

  return (
    <div className={styles.trackBox}>
      <div className={styles.trackTitle}> {<Search size={20} />} {t('customer.track.title')}</div>
      <div className={styles.trackRow}>
        <input
          className={styles.trackInput}
          placeholder={t('customer.track.placeholder')}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doTrack()}
        />
        <Btn onClick={doTrack} loading={loading}><Search size={14} /> {t('customer.btn.track')}</Btn>
      </div>

      {order === 'notfound' && query && !loading && (
        <div className={styles.trackNotFound}>{<AlertTriangle size={20} />} {t('customer.track.notFoundPrefix')} <strong>{query}</strong></div>
      )}

      {order && order !== 'notfound' && (
        <div className={styles.trackResult}>
          <Card title={`${order.orderId} — ${order.trackingId}`} action={<StatusBadge status={order.status} />}>
            <div className={styles.profileGrid}>
              <div><div className={styles.profileLabel}>{t('customer.service.title')}</div><div><ServiceTypeBadge type={order.serviceType} /></div></div>
              <div><div className={styles.profileLabel}>{t('admin.th.receiver')}</div><div>{order.receiverName}</div></div>
              <div><div className={styles.profileLabel}>{t('customer.field.senderBranch')}</div><div>{order.branch}</div></div>
              <div><div className={styles.profileLabel}>{t('customer.field.receiverBranch')}</div><div>{order.receiverBranch ?? '—'}</div></div>
              <div><div className={styles.profileLabel}>{t('admin.th.driver')}</div><div>{order.driverName ?? t('customer.track.notAssigned')}</div></div>
              <div><div className={styles.profileLabel}>{t('customer.track.package')}</div><div>{order.packageType} · {order.weight} kg{order.distanceKm != null ? ` · ${order.distanceKm} km` : ''}</div></div>
              <div><div className={styles.profileLabel}>{t('customer.price.total')}</div><div style={{ color:'var(--accent)', fontWeight:700 }}>{order.price != null ? `$${order.price.toFixed(2)}` : '—'}</div></div>
              <div><div className={styles.profileLabel}>{t('customer.payment.title')}</div><div><PaymentBadge method={order.paymentMethod} /></div></div>
              <div><div className={styles.profileLabel}>{t('admin.th.payment')}</div><div><PaymentStatusBadge status={order.paymentStatus} /></div></div>
            </div>
            <div className={styles.divider} />
            <div className={styles.sectionLabel}>{t('customer.track.historyLabel')}</div>
            <div>
              {(order.history ?? []).map((h, i, arr) => (
                <div key={i} className="tl-item">
                  {i < arr.length - 1 && <div className="tl-line" />}
                  <div className="tl-dot done">✓</div>
                  <div className="tl-content">
                    <div className="tl-status"><StatusBadge status={h.status} /></div>
                    <div className="tl-time">{fmtDateTime(h.time)} — {h.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ── NOTIFICATIONS ── */
function NotifsSection({ uid }: { uid:string }) {
  const { t } = useLanguage();
  const { notifs, loading, markAllRead } = useNotifications(uid);
  useEffect(() => { markAllRead(); }, []);
  const icons: Record<string, React.ReactNode>  = { success:<CheckCircle size={20} />, info:<Bell size={20} />, pending:<Clock size={20} />, warning:<AlertTriangle size={20} /> };
  const bg:    Record<string, string>  = { success:'var(--green-dim)', info:'var(--blue-dim)', pending:'var(--accent-dim)', warning:'var(--orange-dim)' };

  return (
    <Card title={<span style={{display:'inline-flex',alignItems:'center',gap:7}}><Bell size={16}/>{t('nav.notifications')}</span>} noPad>
      {loading ? <EmptyState icon={<Clock size={20} />} text={t('common.loading')} />
        : notifs.length ? notifs.map(n => (
          <div key={n.id} className={`${styles.notifItem} ${!n.read ? styles.notifUnread : ''}`}>
            <div className={styles.notifIcon} style={{ background: bg[n.type] ?? 'var(--bg3)' }}>{icons[n.type] ?? '📣'}</div>
            <div>
              <div className={styles.notifTitle}>{n.title}</div>
              <div className={styles.notifBody}>{n.body}</div>
              <div className={styles.notifTime}>{fmtDateTime(n.time)}</div>
            </div>
          </div>
        )) : <EmptyState icon={<Bell size={20} />} text={t('customer.empty.noNotifsYet')} />}
    </Card>
  );
}

/* ── PROFILE ── */
function ProfileSection({ user }: { user: any }) {
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: user.username, phone: user.phone ?? '', address: user.address ?? '' });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  async function save() {
    try {
      await fs.updateUser(user.uid, form);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err: any) { toast.error(err.message); }
  }

  const profileFields = [
    [t('admin.field.fullName'), user.username],
    [t('admin.th.email'),       user.email],
    [t('admin.th.phone'),       user.phone||'—'],
    [t('admin.th.address'),     user.address||'—'],
  ];

  return (
    <div className={styles.formCard}>
      <Card title={<span style={{display:'inline-flex',alignItems:'center',gap:7}}><UserIcon size={16}/>{t('customer.card.myProfile')}</span>} action={<Btn size="sm" variant="secondary" onClick={() => setEditing(true)}><Pencil size={14} /> {t('common.edit')}</Btn>}>
        <div className={styles.profileHeader}>
          <div className={styles.bigAvatar}>{user.username[0].toUpperCase()}</div>
          <div>
            <div className={styles.profileName}>{user.username}</div>
            <div className={styles.profileEmail}>{user.email}</div>
            <span className="badge badge-active" style={{ marginTop:8 }}>{t('customer.profile.badge')}</span>
          </div>
        </div>
        <div className={styles.divider} />
        <div className={styles.profileGrid}>
          {profileFields.map(([l,v], i) => (
            <div key={i}><div className={styles.profileLabel}>{l}</div><div>{v}</div></div>
          ))}
        </div>
      </Card>

      <Modal open={editing} onClose={() => setEditing(false)} title={t('admin.modal.editProfile')}
        footer={<><Btn variant="secondary" onClick={() => setEditing(false)}>{t('common.cancel')}</Btn><Btn onClick={save}>{t('common.save')}</Btn></>}>
        <div className={styles.formGrid}>
          <Field label={t('admin.field.fullName')}><input className={styles.input} value={form.username} onChange={e=>set('username',e.target.value)} /></Field>
          <Field label={t('admin.th.phone')}><input className={styles.input} value={form.phone} onChange={e=>set('phone',e.target.value)} /></Field>
          <div className={styles.colSpan2}><Field label={t('admin.th.address')}><input className={styles.input} value={form.address} onChange={e=>set('address',e.target.value)} /></Field></div>
        </div>
      </Modal>
    </div>
  );
}
