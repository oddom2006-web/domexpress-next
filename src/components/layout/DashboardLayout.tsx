'use client';
// src/components/layout/DashboardLayout.tsx
// This file defines the DashboardLayout component, which provides a consistent layout for the dashboard pages of the app. It includes a sidebar with navigation items, a topbar with the current date and theme/language toggles, and a main content area where the page content is rendered. The layout is responsive and supports mobile view with a collapsible sidebar.
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks';
import toast from 'react-hot-toast';
import styles from './dashboard.module.css';
import { ThemeToggle, LanguageToggle } from '@/components/ui/Toggles';
import { useLanguage } from '@/context/LanguageContext';
import Image from 'next/image';

export interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  notif?: boolean;
}

interface Props {
  navItems: NavItem[];
  active: string;
  onNavigate: (id: string) => void;
  pageTitle: string;
  pageSub?: string;
  children: React.ReactNode;
  topbarRight?: React.ReactNode;
}

export default function DashboardLayout({
  navItems, active, onNavigate, pageTitle, pageSub, children, topbarRight
}: Props) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { unread } = useNotifications(user?.uid ?? '');
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    router.replace('/auth');
  };

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <div className={styles.app}>
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      {/* ── SIDEBAR ── */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarLogo}>
          <div className={styles.logoIcon}>
            <Image
              src="/assets/images/logo.png"
              alt="DomExpress Logo"
              width={35}
              height={30}
            />
          </div>
          <div>
            <div className={styles.logoText}>DOM EXPRESS</div>
            <div className={styles.logoSub}>Logistics</div>
          </div>
        </div>

        <div className={styles.roleBadge}>{user?.role?.toUpperCase()}</div>

        <nav className={styles.nav}>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`${styles.navItem} ${active === item.id ? styles.navActive : ''}`}
              onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
              {item.notif && unread > 0 && (
                <span className={styles.notifBadge}>{unread}</span>
              )}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userRow}>
            <div className={styles.avatar}>{(user?.username ?? '?')[0].toUpperCase()}</div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user?.username}</div>
              <div className={styles.userEmail}>{user?.email}</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>🚪 {t('common.signOut')}</button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className={styles.main}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(v => !v)}>☰</button>
          <div>
            <div className={styles.pageTitle}>{pageTitle}</div>
            {pageSub && <div className={styles.pageSub}>{pageSub}</div>}
          </div>
          <div className={styles.topbarRight}>
            <span className={styles.topbarDate}>{dateStr}</span>
            <ThemeToggle />
            <LanguageToggle />
            {topbarRight}
          </div>
        </header>

        {/* Content */}
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
