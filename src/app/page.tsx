'use client';
import Image from "next/image";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ThemeToggle, LanguageToggle } from '@/components/ui/Toggles';
import { useLanguage } from '@/context/LanguageContext';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { Truck, Lock,MapPin,} from 'lucide-react';

const BOOK_FORM = 'https://forms.gle/V8r7aFGMhThujFmJ8';

type T = ReturnType<typeof useLanguage>['t'];

function getNavLinks(t: T) {
  return [
    { href: '#home', label: t('homepage.nav.home') },
    { href: '#about', label: t('homepage.nav.about') },
    { href: '#services', label: t('homepage.nav.services') },
    { href: '#estimation', label: t('homepage.nav.features') },
    { href: '#owner', label: t('homepage.nav.story') },
    { href: '#contact', label: t('homepage.nav.contact') },
  ];
}

function getServices(t: T) {
  return [
    { num: '01', icon: '/assets/images/service-icon1.png', fallback: '🚛', title: t('homepage.services.s1Title'), desc: t('homepage.services.s1Desc') },
    { num: '02', icon: '/assets/images/service-icon2.png', fallback: '📦', title: t('homepage.services.s2Title'), desc: t('homepage.services.s2Desc') },
    { num: '03', icon: '/assets/images/service-icon3.png', fallback: '🏎️', title: t('homepage.services.s3Title'), desc: t('homepage.services.s3Desc') },
    { num: '04', icon: '/assets/images/service-icon4.png', fallback: '⚙️', title: t('homepage.services.s4Title'), desc: t('homepage.services.s4Desc') },
    { num: '05', icon: '/assets/images/service-icon5.png', fallback: '🏠', title: t('homepage.services.s5Title'), desc: t('homepage.services.s5Desc') },
    { num: '06', icon: '/assets/images/service-icon6.png', fallback: '🚌', title: t('homepage.services.s6Title'), desc: t('homepage.services.s6Desc') },
  ];
}

function getFeatures(t: T) {
  return [
    { id: 'f1', num: `01 — ${t('homepage.features.f1Num')}`, icon: '/assets/images/feature-icon-1.png', title: t('homepage.features.f1Title'), desc: t('homepage.features.f1Desc'), href: '#contact' },
    { id: 'f2', num: `02 — ${t('homepage.features.f2Num')}`, icon: '/assets/images/feature-icon-2.png', title: t('homepage.features.f2Title'), desc: t('homepage.features.f2Desc'), href: '#contact' },
    { id: 'f3', num: `03 — ${t('homepage.features.f3Num')}`, icon: '/assets/images/feature-icon-3.png', title: t('homepage.features.f3Title'), desc: t('homepage.features.f3Desc'), href: '/auth' },
  ];
}

function getGallery(t: T) {
  return [
    { id: 'g1', src: '/assets/images/owner.jpg', alt: 'Our CEO', tag: t('homepage.gallery.ceo'), name: 'Mr. MEAS OUDOM' },
    { id: 'g2', src: '/assets/images/branch.png', alt: 'Branch inauguration', tag: t('homepage.gallery.dept'), name: t('homepage.gallery.g2Name') },
    { id: 'g3', src: '/assets/images/TukTuk.png', alt: 'TukTuk inauguration', tag: t('homepage.gallery.dept'), name: t('homepage.gallery.g3Name') },
    { id: 'g4', src: '/assets/images/car.png', alt: 'Car inauguration', tag: t('homepage.gallery.dept'), name: t('homepage.gallery.g4Name') },
    { id: 'g5', src: '/assets/images/Warehouse.png', alt: 'Warehouse inventory', tag: t('homepage.gallery.dept'), name: t('homepage.gallery.g5Name') },
    { id: 'g6', src: '/assets/images/Truck.png', alt: 'Truck inauguration', tag: t('homepage.gallery.dept'), name: t('homepage.gallery.g6Name') },
  ];
}

function getCheckItems(t: T) {
  return [
    t('homepage.about.check1'),
    t('homepage.about.check2'),
    t('homepage.about.check3'),
    t('homepage.about.check4'),
    t('homepage.about.check5'),
  ];
}

const BRANCHES = [
  'Phnom Penh Branch',
  'Siem Reap Branch',
  'Battambang Branch',
  'Sihanoukville Branch',
  'Kampot Branch',
];

function ServiceIcon({ src, fallback }: { src: string; fallback: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;
  return <img src={src} alt="" onError={() => setFailed(true)} />;
}

// Animates the numeric part of a stat (e.g. "25+" -> counts 0..25, keeps the "+")
// when it scrolls into view. Values with no leading number (e.g. "24/7") just
// render statically — there's nothing meaningful to count up to.
function CountUpStat({ value }: { value: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState('0');
  const startedRef = useRef(false);

  useEffect(() => {
    const match = value.match(/^(\d+)(.*)$/);
    if (!match) { setDisplay(value); return; }
    const [, numStr, suffix] = match;
    const target = parseInt(numStr, 10);
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !startedRef.current) {
        startedRef.current = true;
        const duration = 900;
        const startTime = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(eased * target) + suffix);
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  return <div ref={ref} className="hero-stat-num">{display}</div>;
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [backTop, setBackTop] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const { t } = useLanguage();
  const pageRef = useRef<HTMLDivElement>(null);

  const NAV_LINKS = getNavLinks(t);
  const SERVICES = getServices(t);
  const FEATURES = getFeatures(t);
  const GALLERY = getGallery(t);
  const CHECK_ITEMS = getCheckItems(t);

  // Brief branded entrance splash — purely cosmetic, capped short so it never
  // feels like it's slowing the page down.
  useEffect(() => {
    const timer = setTimeout(() => setSplashDone(true), 700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      setBackTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    root.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [splashDone]);

  function closeMobileNav() { setMenuOpen(false); }


  function handleContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setFormSent(true);
      form.reset();
      setTimeout(() => setFormSent(false), 3000);
    }, 900);
  }

  if (!splashDone) return <LoadingScreen />;

  return (
    <div className="home-page reveal-page" ref={pageRef}>

      {/* HEADER */}
      <header className={`header ${scrolled ? 'scrolled' : ''}`} id="header">
        <div className="header-inner">
          <Link href="/home" className="nav-brand">
            <div className="brand-icon">
              <Image
                src="/assets/images/logo.png"
                alt="DomExpress Logo"
                width={35}
                height={30}
              />
            </div>
            <div>
              <div className="brand-name">DOM <span>EXPRESS</span></div>
              <div className="brand-sub">{t('homepage.platform')}</div>
            </div>
          </Link>

          <nav className="desktop-nav">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} className="nav-link">{l.label}</a>
            ))}
          </nav>

          <div className="header-actions">
            <div className="header-phone">
              <span className="header-phone-label">{t('homepage.callUs')}</span>
              <a href="tel:+85587327406" className="header-phone-num">087 327 406</a>
            </div>
            <Link href="/auth" className="btn btn-primary">{t('homepage.signIn')}</Link>
            <ThemeToggle />
            <LanguageToggle />
          </div>

          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            aria-label="Open menu"
            onClick={() => setMenuOpen(v => !v)}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* MOBILE NAV */}
      <nav className={`mobile-nav ${menuOpen ? 'open' : ''}`}>
        {NAV_LINKS.map(l => (
          <a key={l.href} href={l.href} className="mobile-nav-link" onClick={closeMobileNav}>{l.label}</a>
        ))}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <ThemeToggle />
          <LanguageToggle />
        </div>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link href="/auth" className="btn btn-primary btn-full" onClick={closeMobileNav}>{t('homepage.signIn')}</Link>
          <a href={BOOK_FORM} target="_blank" rel="noreferrer" className="btn btn-outline btn-full">{t('homepage.hero.bookDelivery')}</a>
        </div>
      </nav>

      <main>

        {/* HERO */}
        <section className="hero" id="home">
          <div
            className="hero-bg-img"
            style={{ backgroundImage: "url('/assets/images/homepage.png')" }}
          />
          <div className="hero-overlay" />

          <div className="hero-inner container">
            <div className="hero-content">
              <div className="hero-eyebrow">
                <span className="hero-dot" />
                {t('homepage.hero.badge')}
              </div>

              <h1 className="hero-title">
                {t('homepage.hero.title1')}<br />
                <span className="hero-title-accent">{t('homepage.hero.title2')}</span>
              </h1>

              <p className="hero-desc">
                {t('homepage.hero.desc')}<br />
                <span className="hero-khmer">{t('homepage.hero.tagline')}</span>
              </p>

              <div className="hero-cta">
                <Link href="/auth" className="btn btn-primary btn-lg">{t('homepage.hero.joinUs')}</Link>
                <a href={BOOK_FORM} target="_blank" rel="noreferrer" className="btn btn-outline btn-lg">{t('homepage.hero.bookDelivery')}</a>
              </div>

              <div className="hero-stats">
                <div className="hero-stat">
                  <CountUpStat value="25+" />
                  <div className="hero-stat-lbl">{t('homepage.hero.branches')}</div>
                </div>
                <div className="hero-stat-divider" />
                <div className="hero-stat">
                  <div className="hero-stat-num">24/7</div>
                  <div className="hero-stat-lbl">{t('homepage.hero.support')}</div>
                </div>
                <div className="hero-stat-divider" />
                <div className="hero-stat">
                  <CountUpStat value="100%" />
                  <div className="hero-stat-lbl">{t('homepage.hero.onTime')}</div>
                </div>
              </div>
            </div>

            <div className="hero-pills">
              {[
                { icon: <MapPin size={20} />, title: t('homepage.hero.pill1Title'), sub: t('homepage.hero.pill1Sub') },
                { icon: <Truck size={20} />, title: t('homepage.hero.pill2Title'), sub: t('homepage.hero.pill2Sub') },
                { icon: <Lock size={20} />, title: t('homepage.hero.pill3Title'), sub: t('homepage.hero.pill3Sub') },
              ].map(p => (
                <div key={p.title} className="hero-pill">
                  <span className="hero-pill-icon">{p.icon}</span>
                  <div>
                    <div className="hero-pill-title">{p.title}</div>
                    <div className="hero-pill-sub">{p.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="section" id="about">
          <div className="container about-grid">
            <div className="about-img-wrap reveal">
              <img
                src="/assets/images/about-banner.jpg"
                alt="DOM EXPRESS operations"
                className="about-img"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="about-badge">
                <div className="about-badge-num">10+</div>
                <div className="about-badge-lbl">{t('homepage.about.yearsExp')}</div>
              </div>
            </div>

            <div className="about-body reveal">
              <div className="section-label">{t('homepage.about.label')}</div>
              <h2 className="section-title">{t('homepage.about.title')}</h2>
              <p className="section-text">
                {t('homepage.about.text')} <em>{t('homepage.about.quote')}</em>
              </p>

              <ul className="check-list">
                {CHECK_ITEMS.map((item, i) => (
                  <li key={i}>
                    <span className="check-icon">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <a href="#services" className="btn btn-primary">{t('homepage.about.explore')}</a>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="section section-dark" id="services">
          <div className="container">
            <div className="section-label text-center" style={{ justifyContent: 'center' }}>{t('homepage.services.label')}</div>
            <h2 className="section-title text-center">{t('homepage.services.title')}</h2>
            <p className="section-text text-center" style={{ margin: '0 auto 56px' }}>
              {t('homepage.services.text')}
            </p>

            <div className="services-grid">
              {SERVICES.map(s => (
                <div key={s.num} className="service-card reveal" data-num={s.num}>
                  <div className="svc-icon">
                    <ServiceIcon src={s.icon} fallback={s.fallback} />
                  </div>
                  <h3 className="svc-title">{s.title}</h3>
                  <p className="svc-text">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="section" id="estimation">
          <div className="container">
            <div className="features-top">
              <div>
                <div className="section-label">{t('homepage.features.label')}</div>
                <h2 className="section-title">{t('homepage.features.title')}</h2>
                <p className="section-text">
                  {t('homepage.features.text')}
                </p>
              </div>
              <a href="#contact" className="btn btn-outline" style={{ whiteSpace: 'nowrap', alignSelf: 'flex-end' }}>
                {t('homepage.features.getQuote')}
              </a>
            </div>

            <div className="features-grid">
              {FEATURES.map(f => (
                <div key={f.id} className="feature-card reveal">
                  <div className="feature-num">{f.num}</div>
                  <img src={f.icon} alt="" className="feature-img" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <h3 className="feature-title">{f.title}</h3>
                  <p className="feature-text">{f.desc}</p>
                  {f.href.startsWith('/')
                    ? <Link href={f.href} className="feature-arrow">→</Link>
                    : <a href={f.href} className="feature-arrow">→</a>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* OWNER / GALLERY */}
        <section className="section section-dark" id="owner">
          <div className="container">
            <div className="section-label">{t('homepage.owner.label')}</div>
            <h2 className="section-title">
              MR. MEAS OUDOM <span style={{ color: 'var(--accent)' }}>(ITEA3)</span>
            </h2>
            <p className="section-text" style={{ maxWidth: 760, marginBottom: 48 }}>
              {t('homepage.owner.text')}
            </p>

            <div className="gallery-grid">
              {GALLERY.map(g => (
                <div key={g.id} className="gallery-item reveal">
                  <img
                    src={g.src}
                    alt={g.alt}
                    onError={e => { (e.target as HTMLImageElement).style.background = 'var(--bg3)'; (e.target as HTMLImageElement).removeAttribute('src'); }}
                  />
                  <div className="gallery-caption">
                    <div className="gallery-tag">{g.tag}</div>
                    <div className="gallery-name">{g.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA BAND */}
        <div className="cta-band">
          <div className="container cta-inner">
            <div>
              <h2 className="cta-title">{t('homepage.cta.title')}</h2>
              <p className="cta-sub">{t('homepage.cta.sub')}</p>
            </div>
            <div className="cta-actions">
              <a href={BOOK_FORM} target="_blank" rel="noreferrer" className="btn-cta-dark">{t('homepage.cta.bookNow')}</a>
              <a href="tel:+85587327406" className="btn-cta-ghost">📞 087 327 406</a>
            </div>
          </div>
        </div>

        {/* CONTACT */}
        <section className="section" id="contact">
          <div className="container">
            <div className="section-label">{t('homepage.contact.label')}</div>
            <h2 className="section-title">{t('homepage.contact.title')}</h2>

            <div className="contact-grid">
              <div className="contact-info">
                <div className="contact-item reveal">
                  <div className="contact-item-icon">📍</div>
                  <div>
                    <div className="contact-item-label">{t('homepage.contact.address')}</div>
                    <div className="contact-item-val">
                      {t('homepage.contact.addressVal')}
                    </div>
                  </div>
                </div>
                <div className="contact-item reveal">
                  <div className="contact-item-icon">📞</div>
                  <div>
                    <div className="contact-item-label">{t('homepage.contact.phone')}</div>
                    <div className="contact-item-val">
                      <a href="tel:+85587327406">+855 87 327 406</a><br />
                      <a href="tel:+85587616990">+855 87 616 990</a>
                    </div>
                  </div>
                </div>
                <div className="contact-item reveal">
                  <div className="contact-item-icon">✉️</div>
                  <div>
                    <div className="contact-item-label">{t('homepage.contact.email')}</div>
                    <div className="contact-item-val">
                      <a href="mailto:oddom2022@gmail.com">oddom2022@gmail.com</a>
                    </div>
                  </div>
                </div>

                <div className="social-section reveal">
                  <div className="contact-item-label" style={{ marginBottom: 14 }}>{t('homepage.contact.followUs')}</div>
                  <div className="social-row">
                    <a href="https://www.facebook.com/share/1PS8aCXgcc/?mibextid=wwXIfr" target="_blank" rel="noreferrer" className="social-btn" title="Facebook">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                    </a>
                    <a href="https://www.instagram.com/oddom2022" target="_blank" rel="noreferrer" className="social-btn" title="Instagram">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                        <rect x="2" y="2" width="20" height="20" rx="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
                    </a>
                    <a href="https://youtube.com/@kh_empire_era" target="_blank" rel="noreferrer" className="social-btn" title="YouTube">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-2C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
                      </svg>
                    </a>
                    <a href="https://t.me/" target="_blank" rel="noreferrer" className="social-btn" title="Telegram">
                      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                        <path d="M21.8 2.2a1 1 0 0 0-1-.2L2.4 9.4a1 1 0 0 0 .1 1.9l4.6 1.4 1.7 5.4a1 1 0 0 0 1.7.4l2.6-2.6 4.8 3.5a1 1 0 0 0 1.6-.6l3-15.5a1 1 0 0 0-.7-1.1zM9.6 14.8l-.9 3-1-3.2 8.4-7.7-6.5 7.9z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              <div className="contact-form-card reveal">
                <h3 className="contact-form-title">{t('homepage.contact.formTitle')}</h3>
                <form onSubmit={handleContact}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">{t('homepage.contact.yourName')}</label>
                      <input
                        name="name"
                        type="text"
                        className="form-control"
                        placeholder="Sok Dara"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('homepage.contact.phoneLabel')}</label>
                      <input
                        name="phone"
                        type="text"
                        className="form-control"
                        placeholder="+855 xx xxx xxxx"
                        required
                      />
                    </div>
                    <div className="form-group col-2">
                      <label className="form-label">{t('homepage.contact.emailLabel')}</label>
                      <input
                        name="email"
                        type="email"
                        className="form-control"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                    <div className="form-group col-2">
                      <label className="form-label">{t('homepage.contact.messageLabel')}</label>
                      <textarea
                        name="message"
                        className="form-control"
                        placeholder={t('homepage.contact.messagePlaceholder')}
                        required
                        rows={4}
                      />
                    </div>
                    <div className="form-group col-2">
                      <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={sending || formSent}>
                        {formSent ? t('homepage.contact.sent') : sending ? t('homepage.contact.sending') : t('homepage.contact.send')}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="footer-logo-icon">
                  <Image
                    src="/assets/images/logo.png"
                    alt="DomExpress Logo"
                    width={35}
                    height={30}
                  />
                </div>
                <div>
                  <div className="footer-name">DOM <span>EXPRESS</span></div>
                  <div className="footer-tagline">{t('homepage.footer.tagline')}</div>
                </div>
              </div>
              <p className="footer-desc">
                {t('homepage.footer.desc')}
              </p>
              <div className="footer-social">
                <a href="https://www.facebook.com/share/1PS8aCXgcc/?mibextid=wwXIfr" target="_blank" rel="noreferrer" className="footer-social-link" title="Facebook">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                </a>
                <a href="https://www.instagram.com/oddom2022" target="_blank" rel="noreferrer" className="footer-social-link" title="Instagram">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a href="https://youtube.com/@kh_empire_era" target="_blank" rel="noreferrer" className="footer-social-link" title="YouTube">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-2C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="footer-links">
              <div className="footer-links-title">{t('homepage.footer.quickLinks')}</div>
              <a href="#about" className="footer-link">{t('homepage.footer.aboutUs')}</a>
              <a href="#services" className="footer-link">{t('homepage.footer.servicesLink')}</a>
              <a href="#owner" className="footer-link">{t('homepage.footer.ourStory')}</a>
              <a href={BOOK_FORM} target="_blank" rel="noreferrer" className="footer-link">{t('homepage.footer.contactUs')}</a>
            </div>

            <div className="footer-links">
              <div className="footer-links-title">{t('homepage.footer.platform')}</div>
              <Link href="/auth" className="footer-link">{t('homepage.footer.trackShipment')}</Link>
              <Link href="/auth" className="footer-link">{t('homepage.footer.customerPortal')}</Link>
              <Link href="/auth" className="footer-link">{t('homepage.footer.driverPortal')}</Link>
              <a href="#" className="footer-link">{t('homepage.footer.privacyPolicy')}</a>
              <a href="#" className="footer-link">{t('homepage.footer.terms')}</a>
            </div>

            <div className="footer-links">
              <div className="footer-links-title">{t('homepage.footer.ourBranches')}</div>
              {BRANCHES.map(b => (
                <span key={b} className="footer-branch">📍 {b}</span>
              ))}
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copy">{t('homepage.footer.copyright')} <a href="#">@DOM</a></p>
            <p className="footer-copy">+855 87 327 406 · +855 87 616 990 · oddom2022@gmail.com</p>
          </div>
        </div>
      </footer>

      <a href="#home" className={`back-top ${backTop ? 'visible' : ''}`} aria-label="Back to top">↑</a>
    </div>
  );
}