'use client';
import { useTheme }    from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import styles from './toggles.module.css';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      className={styles.toggleBtn}
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}

export function LanguageToggle() {
  const { lang, toggleLang } = useLanguage();
  return (
    <button
      type="button"
      className={styles.toggleBtn}
      onClick={toggleLang}
      title="Switch language"
      aria-label="Toggle language"
    >
      {lang === 'en' ? 'ខ្មែរ' : 'EN'}
    </button>
  );
}