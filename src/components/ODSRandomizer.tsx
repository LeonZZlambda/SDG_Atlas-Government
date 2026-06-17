import { useState, useRef } from 'preact/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlatform } from '../context/PlatformContext';
import { useTranslation } from '../i18n';
import { SDG_METADATA } from '../utils/projectGenerator';
import { getSDGIcon } from './ODSIcons';
import confetti from 'canvas-confetti';

export function ODSRandomizer() {
  const { state, dispatch } = usePlatform();
  const { t } = useTranslation();
  const langKey = state.language.split('-')[0] as 'pt' | 'en' | 'es';

  const [drawCount, setDrawCount] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [flashOdsId, setFlashOdsId] = useState<number | null>(null);
  const [drawnIds, setDrawnIds] = useState<number[]>([]);
  
  const shuffleTimerRef = useRef<number | null>(null);

  const startShuffle = () => {
    if (isDrawing) return;

    setIsDrawing(true);
    setDrawnIds([]);
    let counter = 0;
    let speed = 60; // initial tick speed (ms)
    
    const runFlash = () => {
      // Pick a random SDG to flash
      const randomId = Math.floor(Math.random() * 17) + 1;
      setFlashOdsId(randomId);
      counter++;

      if (counter < 25) {
        shuffleTimerRef.current = window.setTimeout(runFlash, speed);
      } else if (counter < 35) {
        // Decelerate (roulette effect)
        speed += 40;
        shuffleTimerRef.current = window.setTimeout(runFlash, speed);
      } else {
        // Settlement: perform the actual draw
        const shuffled = Array.from({ length: 17 }, (_, i) => i + 1)
          .sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, drawCount).sort((a, b) => a - b);
        
        setDrawnIds(selected);
        setFlashOdsId(null);
        setIsDrawing(false);

        // Update global selection with the drawn SDGs
        dispatch({ type: 'SET_ODS_BULK', payload: selected });

        // Trigger confetti celebration!
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: selected.map(id => SDG_METADATA.find(o => o.id === id)?.color || '#4f46e5')
        });

        dispatch({ type: 'ADD_TOAST', payload: { message: t('shuffler_success_msg'), type: 'success' } });
      }
    };

    runFlash();
  };

  const handleProceed = () => {
    if (drawnIds.length > 0) {
      dispatch({ type: 'SET_TAB', payload: 'planner' });
    } else {
      // Fallback in case they came in without drawing
      dispatch({ type: 'SET_TAB', payload: 'planner' });
    }
  };

  return (
    <section>
      <div className="page-header">
        <h2>{t('shuffler_title')}</h2>
        <p>{t('shuffler_subtitle')}</p>
      </div>

      <div className="grid-equal-2col shuffler-grid">
        {/* Draw parameters form */}
        <div className="clay-card shuffler-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Cenário de Políticas</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="draw-count-select" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {t('shuffler_draw_count')} <span style={{ color: 'var(--accent-color)', fontWeight: 800 }}>{drawCount}</span>
            </label>
            <input
              id="draw-count-select"
              type="range"
              min={1}
              max={8}
              value={drawCount}
              onChange={(e: any) => setDrawCount(parseInt(e.target.value))}
              disabled={isDrawing}
              className="clay-range"
            />
          </div>

          <button
            type="button"
            onClick={startShuffle}
            disabled={isDrawing}
            className="clay-button clay-button-primary"
            style={{ width: '100%', marginTop: '10px' }}
          >
            {isDrawing ? t('shuffler_drawing_active') : drawnIds.length > 0 ? t('shuffler_reshuffle_btn') : t('shuffler_start_btn')}
          </button>
        </div>

        {/* Animation & Results Display */}
        <div className="clay-card shuffler-card shuffler-result-card">
          <AnimatePresence mode="wait">
            {/* 1. Shuffling screen */}
            {isDrawing && flashOdsId && (
              <motion.div
                key="shuffling"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.1, 1], opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ repeat: Infinity, duration: 0.3 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <div style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '28px',
                  background: SDG_METADATA.find(o => o.id === flashOdsId)?.color || 'var(--accent-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '44px',
                  color: '#fff',
                  boxShadow: '0 12px 20px rgba(0,0,0,0.15)'
                }}>
                  {getSDGIcon(flashOdsId, '', '#ffffff')}
                </div>
                <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)' }}>
                  ODS {flashOdsId}: {SDG_METADATA.find(o => o.id === flashOdsId)?.name[langKey]}
                </span>
              </motion.div>
            )}

            {/* 2. Completed results view */}
            {!isDrawing && drawnIds.length > 0 && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ width: '100%', textAlign: 'center' }}
              >
                <h4 style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Resultados do Sorteio
                </h4>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                  justifyContent: 'center',
                  marginBottom: '28px'
                }}>
                  {drawnIds.map(id => {
                    const ods = SDG_METADATA.find(o => o.id === id)!;
                    return (
                      <motion.div
                        key={id}
                        initial={{ scale: 0.8, rotate: -3 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 100 }}
                        className="clay-card"
                        style={{
                          background: ods.color,
                          color: '#ffffff',
                          padding: '12px var(--space-md)',
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                      >
                        <div style={{ width: '24px', height: '24px', flexShrink: 0 }}>
                          {getSDGIcon(id, '', '#ffffff')}
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '13px' }}>
                          ODS {id}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleProceed}
                  className="clay-button clay-button-primary"
                  style={{ padding: '10px 24px' }}
                >
                  {t('selection_next_planner')} →
                </button>
              </motion.div>
            )}

            {/* 3. Empty initial state */}
            {!isDrawing && drawnIds.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ textAlign: 'center', color: 'var(--text-muted)' }}
              >
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>🎲</span>
                <p style={{ fontSize: '14px', maxWidth: '300px', margin: '0 auto' }}>
                  {t('randomizer_instruction')}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>


    </section>
  );
}
export default ODSRandomizer;
