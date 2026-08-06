'use client';
// src/app/auth/page.tsx
import { useState }    from 'react';
import { useRouter }   from 'next/navigation';
import { useAuth }     from '@/context/AuthContext';
import toast           from 'react-hot-toast';
import styles          from './auth.module.css';
import Image           from 'next/image';
import { ThemeToggle, LanguageToggle } from '@/components/ui/Toggles';
import { useLanguage } from '@/context/LanguageContext'; 

type Tab = 'login' | 'register';

export default function AuthPage() {
  const { login, register, user, resetPassword, loginWithGoogle } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [tab,        setTab]        = useState<Tab>('login');
  const [loading,    setLoading]    = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent,  setResetSent]  = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Already logged in → redirect
  if (user) {
    const map: Record<string, string> = { admin:'/admin', driver:'/driver', customer:'/customer', employee:'/employee' };
    router.replace(map[user.role] ?? '/auth');
    return null;
  }

  /* ── LOGIN ── */
  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd    = new FormData(e.currentTarget);
    const email = fd.get('email') as string;
    const pw    = fd.get('password') as string;
    setLoading(true);
    try {
      await login(email, pw);
      toast.success('Welcome back!');
      // redirect handled by useAuth onAuthStateChanged + root page
    } catch (err: any) {
      let msg = err.message ?? 'Login failed';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential')
        msg = 'Invalid email or password.';
      if (err.code === 'auth/too-many-requests')
        msg = 'Too many attempts. Try again later.';
      toast.error(msg);
    } finally { setLoading(false); }
  }

  /* ── REGISTER ── */
  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd  = new FormData(e.currentTarget);
    const name  = fd.get('name')     as string;
    const email = fd.get('email')    as string;
    const phone = fd.get('phone')    as string;
    const pw    = fd.get('password') as string;
    if (!name)         { toast.error('Please enter your name.'); return; }
    if (pw.length < 6) { toast.error('Password needs 6+ characters.'); return; }
    setLoading(true);
    try {
      await register(name, email, phone, pw);
      toast.success('Account created!');
    } catch (err: any) {
      let msg = err.message ?? 'Registration failed';
      if (err.code === 'auth/email-already-in-use') msg = 'Email already registered.';
      if (err.code === 'auth/invalid-email')        msg = 'Invalid email address.';
      toast.error(msg);
    } finally { setLoading(false); }
  }

  /* ── FORGOT PASSWORD ── */
  async function handleForgotPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd    = new FormData(e.currentTarget);
    const email = fd.get('email') as string;
    setLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err: any) {
      // Firebase intentionally doesn't reveal whether an email is registered,
      // but invalid-format emails still throw — surface that one specifically.
      let msg = 'Something went wrong. Please try again.';
      if (err.code === 'auth/invalid-email') msg = 'Please enter a valid email address.';
      toast.error(msg);
    } finally { setLoading(false); }
  }

  function backToLogin() {
    setForgotMode(false);
    setResetSent(false);
  }

  /* ── GOOGLE SIGN-IN ── */
  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Welcome!');
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error(err.message ?? 'Google sign-in failed');
      }
    } finally { setGoogleLoading(false); }
  }

  return (
    <div className={styles.page}>
      {/* background glows */}
      <div className={styles.glow1} />
      <div className={styles.glow2} />

      <div className={styles.card}>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '16px 24px' }}>
          <ThemeToggle />
          <LanguageToggle />
        </div>

        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Image
              src="/assets/images/logo.png"
              alt="DomExpress Logo"
              width={35}
              height={30}
            />
          </div>

          <div>
            <div className={styles.logoName}>DOM EXPRESS</div>
            <div className={styles.logoSub}>{t('auth.platform')}</div>
          </div>
        </div>

        {/* Tabs — hidden while in Forgot Password mode */}
        {!forgotMode && (
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${tab==='login'    ? styles.tabActive : ''}`} onClick={() => setTab('login')}>{t('auth.login')}</button>
            <button className={`${styles.tab} ${tab==='register' ? styles.tabActive : ''}`} onClick={() => setTab('register')}>{t('auth.register')}</button>
          </div>
        )}

        {/* FORGOT PASSWORD */}
        {forgotMode && (
          <div className={styles.form}>
            {!resetSent ? (
              <form onSubmit={handleForgotPassword}>
                <p className={styles.hint} style={{ marginBottom: 16 }}>{t('auth.forgot.instructions')}</p>
                <div className={styles.field}>
                  <label>{t('auth.email')}</label>
                  <input name="email" type="email" placeholder={t('auth.emailPlaceholder')} required />
                </div>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? t('auth.forgot.sending') : t('auth.forgot.sendLink')}
                </button>
                <button type="button" className={styles.tab} style={{ marginTop: 12, width: '100%' }} onClick={backToLogin}>
                  ← {t('auth.forgot.backToLogin')}
                </button>
              </form>
            ) : (
              <div>
                <p className={styles.hint}>✅ {t('auth.forgot.sentMessage')}</p>
                <button type="button" className={styles.submitBtn} style={{ marginTop: 16 }} onClick={backToLogin}>
                  ← {t('auth.forgot.backToLogin')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* LOGIN */}
        {!forgotMode && tab === 'login' && (
          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.field}>
              <label>{t('auth.email')}</label>
              <input name="email" type="email" placeholder="you@example.com" required />
            </div>
            <div className={styles.field}>
              <label>{t('auth.password')}</label>
              <input name="password" type="password" placeholder="••••••••" required />
            </div>
            <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 8 }}>
              <button type="button" onClick={() => setForgotMode(true)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, color:'var(--accent)' }}>
                {t('auth.forgot.link')}
              </button>
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? t('auth.loginBtnLoading') : t('auth.loginBtn')}
            </button>

            <div style={{ display:'flex', alignItems:'center', gap:10, margin:'16px 0' }}>
              <div style={{ flex:1, height:1, background:'var(--border2)' }} />
              <span style={{ fontSize:12, color:'var(--text3)' }}>{t('auth.orContinueWith')}</span>
              <div style={{ flex:1, height:1, background:'var(--border2)' }} />
            </div>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              style={{
                width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                padding:'11px 16px', borderRadius:10, border:'1px solid var(--border2)',
                background:'var(--bg3)', color:'var(--text)', fontSize:14, fontWeight:600, cursor:'pointer',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.4 29.4 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.6 18.9 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5c-7.7 0-14.4 4.4-17.7 10.2z"/>
                <path fill="#4CAF50" d="M24 43.5c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.2-7.2 2.2-5.4 0-9.9-3.1-11.3-7.5l-6.5 5C9.5 39 16.2 43.5 24 43.5z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2 3.8-3.7 5.1l6.2 5.2C41.4 35.4 43.5 30.1 43.5 24c0-1.2-.1-2.4-.4-3.5z"/>
              </svg>
              {googleLoading ? t('auth.forgot.sending') : t('auth.google')}
            </button>

            {/* Demo accounts */}
            <div className={styles.demoBox}>
              <div className={styles.demoTitle}>Demo Accounts</div>
              {[
                { role:'Admin',    email:'admin@domexpress.com',  pw:'sok123'  },
                { role:'Driver1',   email:'driver@domexpress.com', pw:'dara123' },
                { role:'Driver2',   email:'driver1@domexpress.com', pw:'nang123' },
                { role:'Customer1', email:'dina123@gmail.com',     pw:'dina123'   },
                { role:'Customer2', email:'fall@gmail.com',     pw:'fall123'   },
              ].map(d => (
                <div key={d.role} className={styles.demoRow}>
                  <span className={`${styles.demoRole} ${styles['demoRole'+d.role]}`}>{d.role}</span>
                  <span className={styles.demoCreds}>{d.email}</span>
                  <button
                    type="button"
                    className={styles.demoFill}
                    onClick={() => {
                      const f = document.querySelector<HTMLInputElement>('input[name=email]');
                      const p = document.querySelector<HTMLInputElement>('input[name=password]');
                      if (f) f.value = d.email;
                      if (p) p.value = d.pw;
                    }}
                  >Fill</button>
                </div>
              ))}
            </div> 
          </form>
        )}

        {/* REGISTER */}
        {!forgotMode && tab === 'register' && (
          <form onSubmit={handleRegister} className={styles.form}>
            <div className={styles.field}>
              <label>{t('auth.name')}</label>
              <input name="name" type="text" placeholder={t('auth.fullNamePlaceholder')} required />
            </div>
            <div className={styles.field}>
              <label>{t('auth.email')}</label>
              <input name="email" type="email" placeholder={t('auth.emailPlaceholder')} required />
            </div>
            <div className={styles.field}>
              <label>{t('auth.phone')}</label>
              <input name="phone" type="text" placeholder={t('auth.phonePlaceholder')} />
            </div>
            <div className={styles.field}>
              <label>{t('auth.password')}</label>
              <input name="password" type="password" placeholder={t('auth.passwordPlaceholder')} required />
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? t('auth.registerBtnLoading') : t('auth.registerBtn')}
            </button>
            <p className={styles.hint}>{t('auth.welcome')}</p>

            <div style={{ display:'flex', alignItems:'center', gap:10, margin:'16px 0' }}>
              <div style={{ flex:1, height:1, background:'var(--border2)' }} />
              <span style={{ fontSize:12, color:'var(--text3)' }}>{t('auth.orContinueWith')}</span>
              <div style={{ flex:1, height:1, background:'var(--border2)' }} />
            </div>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              style={{
                width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:10,
                padding:'11px 16px', borderRadius:10, border:'1px solid var(--border2)',
                background:'var(--bg3)', color:'var(--text)', fontSize:14, fontWeight:600, cursor:'pointer',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.4 29.4 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.6 18.9 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5c-7.7 0-14.4 4.4-17.7 10.2z"/>
                <path fill="#4CAF50" d="M24 43.5c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.2-7.2 2.2-5.4 0-9.9-3.1-11.3-7.5l-6.5 5C9.5 39 16.2 43.5 24 43.5z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2 3.8-3.7 5.1l6.2 5.2C41.4 35.4 43.5 30.1 43.5 24c0-1.2-.1-2.4-.4-3.5z"/>
              </svg>
              {googleLoading ? t('auth.forgot.sending') : t('auth.google')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}