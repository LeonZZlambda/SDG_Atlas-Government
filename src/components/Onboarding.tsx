import { useState } from 'preact/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlatform } from '../context/PlatformContext';
import { useTranslation } from '../i18n';
import { getIcon } from './ODSIcons';

export function Onboarding() {
  const { state, dispatch } = usePlatform();
  const { t } = useTranslation();
  const [step, setStep] = useState(0);

  if (state.onboardingCompleted) return null;

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      dispatch({ type: 'COMPLETE_ONBOARDING' });
      dispatch({ type: 'ADD_TOAST', payload: { message: t('toast_theme_changed'), type: 'success' } }); // dummy helper
    }
  };

  const handleSkip = () => {
    dispatch({ type: 'COMPLETE_ONBOARDING' });
  };

  const slides = [
    {
      title: t('onboarding_step1_title'),
      desc: t('onboarding_step1_desc'),
      icon: 'chart',
      color: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
    },
    {
      title: t('onboarding_step2_title'),
      desc: t('onboarding_step2_desc'),
      icon: 'sliders',
      color: 'linear-gradient(135deg, #10b981 0%, #047857 100%)'
    },
    {
      title: t('onboarding_step3_title'),
      desc: t('onboarding_step3_desc'),
      icon: 'settings',
      color: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
    }
  ];

  const currentSlide = slides[step];

  return (
    <div className="onboarding-backdrop">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="clay-card"
        style={{
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          padding: '40px var(--space-xl)',
          position: 'relative',
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.92)'
        }}
      >
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            {t('app_title')}
          </span>
          <button
            type="button"
            onClick={handleSkip}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-color)',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {t('onboarding_skip')}
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <div style={{
              width: '96px',
              height: '96px',
              borderRadius: '32px',
              background: currentSlide.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), inset -4px -4px 8px rgba(0,0,0,0.2), inset 4px 4px 8px rgba(255,255,255,0.3)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ width: '48px', height: '48px' }}>
                {getIcon(currentSlide.icon, '', '#fff')}
              </div>
            </div>

            <h2 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>
              {currentSlide.title}
            </h2>
            <p style={{ fontSize: 'clamp(0.9rem, 1.2vw, 0.95rem)', color: 'var(--text-secondary)', marginBottom: '32px' }}>
              {currentSlide.desc}
            </p>
          </motion.div>
        </AnimatePresence>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Progress Dots */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {slides.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === step ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: i === step ? 'var(--accent-color)' : 'var(--bg-tertiary)',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="clay-button clay-button-primary"
            style={{
              padding: '12px 24px',
              fontSize: 'clamp(0.9rem, 1.2vw, 0.95rem)',
              boxShadow: 'var(--clay-button-shadow)'
            }}
          >
            {step === 2 ? t('onboarding_btn_start') : t('onboarding_btn_next')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
