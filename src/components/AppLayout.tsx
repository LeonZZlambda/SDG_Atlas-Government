import { useState } from 'preact/hooks';
import { usePlatform } from '../hooks/usePlatform';
import { useTranslation } from '../i18n';

const NAV_ICONS: Record<string, preact.JSX.Element> = {
  selection: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
  shuffler: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 3 21 3 21 8"/>
      <line x1="4" y1="20" x2="21" y2="3"/>
      <polyline points="21 16 21 21 16 21"/>
      <line x1="15" y1="15" x2="21" y2="21"/>
      <line x1="4" y1="4" x2="9" y2="9"/>
    </svg>
  ),
  planner: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  calculator: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2"/>
      <line x1="8" y1="6" x2="16" y2="6"/>
      <line x1="8" y1="10" x2="10" y2="10"/>
      <line x1="14" y1="10" x2="16" y2="10"/>
      <line x1="8" y1="14" x2="10" y2="14"/>
      <line x1="14" y1="14" x2="16" y2="14"/>
      <line x1="8" y1="18" x2="16" y2="18"/>
    </svg>
  ),
  map: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
};

const IconGlobe = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const IconSun = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const IconMoon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const IconContrast = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2v20M2 12h20" opacity="0.3"/>
    <path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor"/>
  </svg>
);

const IconSparkle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
);

const IconMenu = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);


interface AppLayoutProps {
  children: preact.ComponentChildren;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { state, dispatch } = usePlatform();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'selection', label: t('nav_selection') },
    { id: 'shuffler',  label: t('nav_shuffler')  },
    { id: 'planner',   label: t('nav_planner')   },
    { id: 'calculator',label: t('nav_calculator')},
    { id: 'map',       label: t('nav_map')       },
    { id: 'dashboard', label: t('nav_dashboard') },
  ] as const;

  const handleTabChange = (tabId: typeof state.currentTab) => {
    dispatch.setTab(tabId);
    setMobileMenuOpen(false);
  };

  const changeTheme = (e: any) => {
    const nextTheme = e.target.value as typeof state.theme;
    dispatch.setTheme(nextTheme);
    dispatch.addToast(t('toast_theme_changed'), 'success');
  };

  const changeLanguage = (e: any) => {
    const nextLang = e.target.value as typeof state.language;
    dispatch.setLanguage(nextLang);
    dispatch.addToast(t('toast_lang_changed'), 'success');
  };

  return (
    <div className="app-container">
      {/* SIDEBAR - Desktop view */}
      <aside className="sidebar no-print">
        <div className="sidebar-inner">
          {/* Logo / Header */}
          <div className="sidebar-logo">
            <div className="sidebar-logo-badge">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
              </svg>
            </div>
            <div>
              <h1 className="sidebar-app-name">{t('app_title')}</h1>
              <span className="sidebar-app-sub">{t('app_subtitle')}</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="sidebar-nav">
            {navigationItems.map(item => {
              const isActive = state.currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabChange(item.id)}
                  className={`sidebar-nav-item${isActive ? ' sidebar-nav-item--active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="sidebar-nav-icon">{NAV_ICONS[item.id]}</span>
                  <span className="sidebar-nav-label">{item.label}</span>
                  {isActive && <span className="sidebar-nav-indicator" aria-hidden="true" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Configurations - Sidebar footer */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-divider" />

          <div className="sidebar-controls">
            {/* Language */}
            <div className="sidebar-control-group">
              <label htmlFor="lang-select" className="sidebar-control-label">
                <span className="sidebar-control-icon" aria-hidden="true"><IconGlobe /></span>
                {t('lang_label') || 'Language'}
              </label>
              <div className="sidebar-select-wrapper">
                <select
                  id="lang-select"
                  value={state.language}
                  onChange={changeLanguage}
                  className="clay-input"
                  aria-label="Select language"
                >
                  <option value="pt-BR">{t('lang_pt')}</option>
                  <option value="en-US">{t('lang_en')}</option>
                  <option value="es-ES">{t('lang_es')}</option>
                </select>
                <span className="sidebar-select-chevron" aria-hidden="true">▾</span>
              </div>
            </div>

            {/* Theme */}
            <div className="sidebar-control-group">
              <label htmlFor="theme-select" className="sidebar-control-label">
                <span className="sidebar-control-icon" aria-hidden="true">
                  {state.theme === 'dark' ? <IconMoon /> : state.theme === 'high-contrast' ? <IconContrast /> : <IconSun />}
                </span>
                {t('theme_label') || 'Theme'}
              </label>
              <div className="sidebar-select-wrapper">
                <select
                  id="theme-select"
                  value={state.theme}
                  onChange={changeTheme}
                  className="clay-input"
                  aria-label="Select theme"
                >
                  <option value="light">{t('theme_light')}</option>
                  <option value="dark">{t('theme_dark')}</option>
                  <option value="high-contrast">{t('theme_contrast')}</option>
                </select>
                <span className="sidebar-select-chevron" aria-hidden="true">▾</span>
              </div>
            </div>
          </div>

          {/* Reset Onboarding */}
          <button
            type="button"
            onClick={() => dispatch.resetOnboarding()}
            className="clay-button clay-button-primary"
            aria-label="Show onboarding tutorial again"
          >
            <span aria-hidden="true"><IconSparkle /></span>
            {t('show_onboarding') || 'Show Tutorial'}
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="mobile-header no-print">
        <div className="mobile-header-brand">
          <div className="mobile-header-badge">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
            </svg>
          </div>
          <span className="mobile-header-title">{t('app_title')}</span>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="clay-button mobile-menu-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <IconClose /> : <IconMenu />}
        </button>
      </header>

      {/* MOBILE MENU DROPDOWN */}
      {mobileMenuOpen && (
        <div className="mobile-menu no-print" role="dialog" aria-label="Navigation menu">
          {navigationItems.map(item => {
            const isActive = state.currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabChange(item.id)}
                className={`mobile-menu-item${isActive ? ' mobile-menu-item--active' : ''}`}
              >
                <span style={{ width: 16, height: 16, display: 'flex', alignItems: 'center' }}>{NAV_ICONS[item.id]}</span>
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="mobile-menu-controls">
            <select value={state.language} onChange={changeLanguage} className="clay-input" aria-label="Language">
              <option value="pt-BR">PT</option>
              <option value="en-US">EN</option>
              <option value="es-ES">ES</option>
            </select>
            <select value={state.theme} onChange={changeTheme} className="clay-input" aria-label="Theme">
              <option value="light">{t('theme_light')}</option>
              <option value="dark">{t('theme_dark')}</option>
              <option value="high-contrast">{t('theme_contrast')}</option>
            </select>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
