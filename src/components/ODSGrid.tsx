import { usePlatform } from '../context/PlatformContext';
import { useTranslation } from '../i18n';
import { SDG_METADATA } from '../utils/projectGenerator';
import { ODSCard } from './ODSCard';
import { motion } from 'framer-motion';
import { generateSDGMetadata, generateSystemicInsights } from '../utils/sdgMetadata';
import { getIcon } from './ODSIcons';

export function ODSGrid() {
  const { state, dispatch } = usePlatform();
  const { t } = useTranslation();
  const langKey = state.language.split('-')[0] as 'pt' | 'en' | 'es';
  
  // Generate systemic insights for selected SDGs
  const systemicInsights = generateSystemicInsights(state.selectedOds);

  const toggleSelect = (id: number) => {
    dispatch({ type: 'TOGGLE_ODS', payload: id });
  };

  const selectAll = () => {
    const allIds = Array.from({ length: 17 }, (_, i) => i + 1);
    dispatch({ type: 'SET_ODS_BULK', payload: allIds });
    dispatch({ type: 'ADD_TOAST', payload: { message: t('selection_all_btn'), type: 'info' } });
  };

  const clearSelection = () => {
    dispatch({ type: 'SET_ODS_BULK', payload: [] });
    dispatch({ type: 'ADD_TOAST', payload: { message: t('toast_selection_cleared'), type: 'info' } });
  };

  const randomizeSelection = () => {
    // Select between 3 and 7 random SDGs
    const randomCount = Math.floor(Math.random() * 5) + 3;
    const shuffled = Array.from({ length: 17 }, (_, i) => i + 1)
      .sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, randomCount);
    dispatch({ type: 'SET_ODS_BULK', payload: selected });
    dispatch({
      type: 'ADD_TOAST',
      payload: { message: `${t('selection_random_btn')}: ${selected.length} ODS`, type: 'success' }
    });
  };

  const handleNext = () => {
    if (state.selectedOds.length === 0) {
      dispatch({ type: 'ADD_TOAST', payload: { message: t('selection_count_warning'), type: 'warning' } });
    } else {
      dispatch({ type: 'SET_TAB', payload: 'shuffler' });
    }
  };

  return (
    <section>
      <div className="page-header">
        <h2>{t('selection_title')}</h2>
        <p>{t('selection_subtitle')}</p>
      </div>

      {/* Control Buttons Panel */}
      <div className="clay-card" style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
        padding: '12px 20px',
        opacity: 0.85
      }}>
        {/* Statistics count indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            background: 'var(--accent-color)',
            color: '#fff',
            padding: '4px 12px',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: 'clamp(12px, 1.4vw, 14px)',
            boxShadow: 'inset -1px -1px 3px rgba(0,0,0,0.1)'
          }}>
            {state.selectedOds.length}
          </span>
          <span style={{ fontSize: 'clamp(12px, 1.4vw, 14px)', fontWeight: 600, color: 'var(--text-secondary)' }}>
            ODS Selecionados (Max 17)
          </span>
        </div>

        {/* Buttons list */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button type="button" onClick={selectAll} className="clay-button" style={{ fontSize: 'clamp(10px, 1.1vw, 12px)', padding: '6px 12px', opacity: 0.8 }}>
            {t('selection_all_btn')}
          </button>
          <button type="button" onClick={clearSelection} className="clay-button" style={{ fontSize: 'clamp(10px, 1.1vw, 12px)', padding: '6px 12px', opacity: 0.8 }}>
            {t('selection_clear_btn')}
          </button>
          <button type="button" onClick={randomizeSelection} className="clay-button" style={{ fontSize: 'clamp(10px, 1.1vw, 12px)', padding: '6px 12px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '14px', height: '14px' }}>
              {getIcon('search', '', 'currentColor')}
            </div>
            {t('selection_random_btn')}
          </button>
        </div>
      </div>

      {/* Governance Friction Warnings */}
      {state.selectedOds.length > 0 && (
        <div className="clay-card" style={{
          marginBottom: '24px',
          padding: '16px 20px',
          background: state.selectedOds.length > 8 ? 'rgba(239, 68, 68, 0.08)' : 
                     state.selectedOds.length > 5 ? 'rgba(245, 158, 11, 0.08)' : 
                     'rgba(99, 102, 241, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ width: '18px', height: '18px' }}>
              {getIcon(state.selectedOds.length > 8 ? 'warning' : state.selectedOds.length > 5 ? 'lightning' : 'info', '', state.selectedOds.length > 8 ? '#ef4444' : state.selectedOds.length > 5 ? '#f59e0b' : '#6366f1')}
            </div>
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: state.selectedOds.length > 8 ? '#ef4444' : state.selectedOds.length > 5 ? '#f59e0b' : '#6366f1' }}>
                {state.selectedOds.length > 8 ? 'Complexidade Operacional Elevada Detectada' : 
                 state.selectedOds.length > 5 ? 'Complexidade Operacional Moderada' : 
                 'Análise de Complexidade'}
              </h4>
              {state.selectedOds.length > 8 && (
                <ul style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 0 16px', lineHeight: 1.6 }}>
                  <li>Coordenação interinstitucional necessária para múltiplos ODS</li>
                  <li>Escopo amplo pode reduzir viabilidade de implementação</li>
                  <li>Requer alocação significativa de recursos e capacitação técnica</li>
                </ul>
              )}
              {state.selectedOds.length > 5 && state.selectedOds.length <= 8 && (
                <ul style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 0 16px', lineHeight: 1.6 }}>
                  <li>Coordenação moderada entre instituições recomendada</li>
                  <li>Planejamento detalhado para integração de ODS</li>
                </ul>
              )}
              {state.selectedOds.length <= 5 && (
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0', lineHeight: 1.6 }}>
                  Escalo manejável com potencial para implementação focada.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Live Systemic Insights Panel - Primary Analysis Zone */}
      {state.selectedOds.length > 0 && systemicInsights.length > 0 && (
        <div className="clay-card" style={{
          marginBottom: '32px',
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)',
          boxShadow: 'var(--clay-card-shadow), 0 4px 12px rgba(99, 102, 241, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '20px', height: '20px' }}>
              {getIcon('chart', '', '#6366f1')}
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#6366f1', letterSpacing: '-0.5px' }}>
              Análise Sistêmica Detectada
            </h3>
          </div>
          {systemicInsights.map((insight, index) => (
            <div key={index} style={{ 
              marginBottom: index < systemicInsights.length - 1 ? '16px' : '0',
              paddingBottom: index < systemicInsights.length - 1 ? '16px' : '0',
              boxShadow: index < systemicInsights.length - 1 ? 'inset 0 -1px 0 var(--border-dark)' : 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{ 
                  fontSize: '11px', 
                  padding: '4px 10px', 
                  borderRadius: '8px',
                  background: insight.severity === 'high' ? '#ef4444' : insight.severity === 'medium' ? '#f59e0b' : '#10b981',
                  color: '#fff',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(0,0,0,0.2), inset 1px 1px 2px rgba(255,255,255,0.2)'
                }}>
                  {insight.severity}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {insight.title}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '6px 0 0 0', lineHeight: 1.5 }}>
                {insight.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Grid displays SDGs */}
      <motion.div layout className="ods-grid">
        {SDG_METADATA.map(ods => (
          <ODSCard
            key={ods.id}
            id={ods.id}
            name={ods.name[langKey]}
            shortDesc={ods.shortDescription[langKey]}
            color={ods.color}
            isSelected={state.selectedOds.includes(ods.id)}
            onToggle={() => toggleSelect(ods.id)}
            analyticalMetadata={generateSDGMetadata(ods.id)}
          />
        ))}
      </motion.div>

      {/* Proceed Navigation Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        {state.selectedOds.length > 0 && (
          <button
            type="button"
            onClick={() => dispatch({ type: 'SET_TAB', payload: 'planner' })}
            className="clay-button"
            style={{ padding: '12px 24px', fontSize: '14px' }}
          >
            {t('selection_next_planner')} →
          </button>
        )}
        
        <button
          type="button"
          onClick={handleNext}
          className="clay-button clay-button-primary"
          style={{ padding: '12px 28px', fontSize: '14px' }}
        >
          {t('selection_next_shuffler')} →
        </button>
      </div>

      <style>{`
        @media (max-width: 400px) {
          section > div[style*="justify-content: flex-end"] {
            flex-direction: column;
            align-items: stretch;
          }
          section > div[style*="justify-content: flex-end"] button {
            width: 100%;
            padding: 10px 16px !important;
            font-size: 13px !important;
          }
        }
      `}</style>
    </section>
  );
}
