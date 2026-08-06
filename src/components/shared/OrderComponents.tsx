'use client';
// src/components/shared/OrderComponents.tsx
// Order-related components shared across the customer, admin, and employee
// dashboards. Originally lived in customer/page.tsx and were imported from
// there — moved here so the import path actually reflects that they're
// shared, not customer-specific.
import dynamic from 'next/dynamic';
  const DomMap = dynamic(() => import('./DomMap'), { ssr: false });
import { useLanguage }  from '@/context/LanguageContext';
import { Btn, StatusBadge }  from '@/components/ui';
import { fmtDateTime }  from '@/lib/utils';
import type { Order }   from '@/types';
import styles from './OrderComponents.module.css';
import { downloadInvoice } from '@/lib/invoice';

const PAYMENT_ICONS: Record<string, string> = { cod: '💵', qr: '📱', card: '💳' };

export function PaymentBadge({ method }: { method?: string }) {
  const { t } = useLanguage();
  if (!method) return <span style={{ color:'var(--text3)' }}>—</span>;
  const key = method === 'cod' ? 'customer.payment.cod' : method === 'qr' ? 'customer.payment.qr' : 'customer.payment.card';
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12, fontWeight:600, color:'var(--text2)' }}>
      <span>{PAYMENT_ICONS[method] ?? '💰'}</span>{t(key as any)}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status?: string }) {
  const { t } = useLanguage();
  const paid = status === 'paid';
  return (
    <span
      className="badge"
      style={{
        background: paid ? 'var(--green-dim)' : 'var(--orange-dim)',
        color:      paid ? 'var(--green)'     : 'var(--orange)',
        border:     `1px solid ${paid ? 'var(--green)' : 'var(--orange)'}33`,
      }}
    >
      {paid ? t('admin.payment.paid') : t('admin.payment.unpaid')}
    </span>
  );
}

export function ServiceTypeBadge({ type }: { type?: string }) {
  const { t } = useLanguage();
  if (!type) return <span style={{ color:'var(--text3)' }}>—</span>;
  const direct = type === 'direct';
  return (
    <span
      className="badge"
      style={{
        background: direct ? 'var(--blue-dim)' : 'var(--purple-dim)',
        color:      direct ? 'var(--blue)'     : 'var(--purple)',
        border:     `1px solid ${direct ? 'var(--blue)' : 'var(--purple)'}33`,
      }}
    >
      {direct ? `🚀 ${t('customer.service.direct')}` : `🏢 ${t('customer.service.consolidated')}`}
    </span>
  );
}

export function OrderDetailBody({ order }: { order: Order }) {
  const { t } = useLanguage();

  const rows: [string, React.ReactNode][] = [
    [t('customer.detail.trackingId'), <span key="tid" className={styles.mono} style={{color:'var(--accent)'}}>{order.trackingId}</span>],
    [t('common.status'),              <StatusBadge key="st" status={order.status} />],
    [t('customer.service.title'),     <ServiceTypeBadge key="svc" type={order.serviceType} />],
    [t('customer.detail.sender'),     order.senderName],
    [t('admin.th.receiver'),          order.receiverName],
    [t('admin.th.phone'),             order.phone],
    [t('customer.field.senderBranch'),   order.branch],
    [t('customer.field.receiverBranch'), order.receiverBranch ?? '—'],
    [t('admin.th.address'),           order.address],
    [t('customer.track.package'),     `${order.packageType} · ${order.weight} kg${order.distanceKm != null ? ` · ${order.distanceKm} km` : ''}`],
    [t('admin.th.driver'),            order.driverName ?? t('customer.track.notAssigned')],
    [t('customer.price.total'),       <span key="price" style={{ color:'var(--accent)', fontWeight:700 }}>{order.price != null ? `$${order.price.toFixed(2)}` : '—'}</span>],
    [t('customer.payment.title'),     <PaymentBadge key="pm" method={order.paymentMethod} />],
    [t('admin.th.payment'),           <PaymentStatusBadge key="ps" status={order.paymentStatus} />],
    [t('customer.detail.created'),    fmtDateTime(order.createdAt)],
  ];

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:12 }}>
        <Btn size="sm" variant="secondary" onClick={() => downloadInvoice(order)}>🧾 {t('customer.invoice.download')}</Btn>
      </div>
      <div className={styles.profileGrid} style={{ marginBottom:16 }}>
        {rows.map(([l, v], i) => (
          <div key={i}>
            <div className={styles.profileLabel}>{l}</div>
            <div>{v}</div>
          </div>
        ))}
      </div>
      {(order.senderLat != null || order.receiverLat != null) && (
    <div style={{ margin: '16px 0' }}>
      <DomMap
        polyline
        points={[
          ...(order.senderLat != null ? [{ lat: order.senderLat, lng: order.senderLng!, label: t('customer.detail.sender'), stopNumber: 1 }] : []),
          ...(order.receiverLat != null ? [{ lat: order.receiverLat, lng: order.receiverLng!, label: order.receiverName, stopNumber: 2 }] : []),
        ]}
        height={240}
      />
    </div>
  )}
      <div className={styles.divider} />
      <div className={styles.sectionLabel}>{t('customer.track.historyLabel')}</div>
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
  );
}