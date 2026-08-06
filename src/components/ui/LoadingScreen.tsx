'use client';
// src/components/ui/LoadingScreen.tsx
import styles from './LoadingScreen.module.css';

export default function LoadingScreen({ message }: { message?: string }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.logoWrap}>
        <img src="/assets/images/logo.png" alt="" className={styles.logo} />
      </div>
      <div className={styles.brand}>DOM <span>EXPRESS</span></div>
      <div className={styles.spinner} />
      {message && <div className={styles.message}>{message}</div>}
    </div>
  );
}