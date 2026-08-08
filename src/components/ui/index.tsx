'use client';
// src/components/ui/index.tsx
// All reusable UI primitives
//this file exports a set of reusable UI components that can be used throughout the app. It includes components for status badges, stat cards, spinners, empty states, modals, form fields, buttons, search bars, cards, table wrappers, and a confirm dialog hook. Each component is designed to be flexible and customizable, allowing developers to easily integrate them into different parts of the application while maintaining a consistent look and feel.

import React, { useState, useEffect, useRef } from 'react';
import { STATUS_LABELS, type OrderStatus } from '@/types';
import styles from './ui.module.css';
import { Inbox } from 'lucide-react';

/* ── STATUS BADGE ── */
export function StatusBadge({ status }: { status: OrderStatus | string }) {
  return (
    <span className={`badge badge-${status}`}>
      ● {STATUS_LABELS[status as OrderStatus] ?? status}
    </span>
  );
}

/* ── STAT CARD ── */
interface StatCardProps {
    label:    string;
    value:    string | number;
    icon:     React.ReactNode;
    color?:   'accent' | 'green' | 'red' | 'blue' | 'purple' | 'amber';
}
export function StatCard({ label, value, icon, color = 'accent' }: StatCardProps) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statLabel}>{label}</div>
      <div className={`${styles.statValue} ${styles['color_' + color]}`}>{value}</div>
    </div>
  );
}

/* ── SPINNER ── */
export function Spinner({ size = 32 }: { size?: number }) {
  return (
    <div className={styles.spinner} style={{ width: size, height: size }} />
  );
}

/* ── EMPTY STATE ── */
export function EmptyState({ icon = <Inbox size={28} />, text = 'No data found' }: { icon?: React.ReactNode; text?: string }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{icon}</div>
      <div className={styles.emptyText}>{text}</div>
    </div>
  );
}

/* ── MODAL ── */
interface ModalProps {
  open:     boolean;
  onClose:  () => void;
  title:    string;
  children: React.ReactNode;
  footer?:  React.ReactNode;
  width?:   number;
}
export function Modal({ open, onClose, title, children, footer, width = 560 }: ModalProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal} style={{ maxWidth: width }}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>{title}</div>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        <div className={styles.modalBody}>{children}</div>
        {footer && <div className={styles.modalFooter}>{footer}</div>}
      </div>
    </div>
  );
}

/* ── FORM FIELD ── */
interface FieldProps {
  label:       string;
  name?:       string;
  type?:       string;
  value?:      string | number;
  onChange?:   (v: string) => void;
  placeholder?: string;
  required?:   boolean;
  children?:   React.ReactNode; // for select
}
export function Field({ label, name, type = 'text', value, onChange, placeholder, required, children }: FieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      {children
        ? React.cloneElement(children as React.ReactElement, { className: styles.fieldInput, name })
        : (
          <input
            className={styles.fieldInput}
            name={name} type={type}
            value={value ?? ''} placeholder={placeholder}
            required={required}
            onChange={e => onChange?.(e.target.value)}
          />
        )}
    </div>
  );
}

/* ── BUTTON ── */
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?:    'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}
export function Btn({ variant='primary', size='md', loading=false, children, className='', ...rest }: BtnProps) {
  return (
    <button
      className={`${styles.btn} ${styles['btn_'+variant]} ${styles['btn_'+size]} ${className}`}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? <Spinner size={14} /> : null}
      {children}
    </button>
  );
}

/* ── SEARCH BAR ── */
export function SearchBar({ placeholder='Search…', onSearch }: { placeholder?: string; onSearch: (q: string) => void }) {
  return (
    <input
      className={styles.searchBar}
      placeholder={placeholder}
      onChange={e => onSearch(e.target.value)}
    />
  );
}

/* ── CARD ── */
interface CardProps {
  title?:    React.ReactNode;
  action?:   React.ReactNode;
  children:  React.ReactNode;
  noPad?:    boolean;
}
export function Card({ title, action, children, noPad }: CardProps) {
  return (
    <div className={styles.card}>
      {(title || action) && (
        <div className={styles.cardHeader}>
          {title && <div className={styles.cardTitle}>{title}</div>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPad ? '' : styles.cardBody}>{children}</div>
    </div>
  );
}

/* ── TABLE WRAPPER ── */
export function TableWrap({ children }: { children: React.ReactNode }) {
  return <div className={styles.tableWrap}>{children}</div>;
}

/* ── CONFIRM DIALOG ── */
export function useConfirm() {
  const [state, setState] = useState<{ msg: string; resolve: (v: boolean) => void } | null>(null);

  const confirm = (msg: string) => new Promise<boolean>((resolve) => setState({ msg, resolve }));

  const Dialog = () => state ? (
    <div className={styles.overlay} style={{ zIndex: 600 }}>
      <div className={styles.modal} style={{ maxWidth: 380 }}>
        <div className={styles.modalBody} style={{ textAlign:'center', padding:'28px 24px' }}>
          <div style={{ fontSize:40, marginBottom:16 }}>⚠️</div>
          <p style={{ fontSize:15, color:'var(--text2)', lineHeight:1.6 }}>{state.msg}</p>
        </div>
        <div className={styles.modalFooter}>
          <Btn variant="secondary" onClick={() => { state.resolve(false); setState(null); }}>Cancel</Btn>
          <Btn variant="danger"    onClick={() => { state.resolve(true);  setState(null); }}>Confirm</Btn>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, Dialog };
}
