import { usePlatform } from '../context/PlatformContext';
import { useTranslation } from '../i18n';
import { getIcon } from './ODSIcons';
import { motion } from 'framer-motion';
import { generateEmergentInsights } from '../utils/emergentBehavior';
import { generateInfrastructureDependencies } from '../utils/infrastructureDependencies';

export function ImpactCalculator() {
  const { state, dispatch } = usePlatform();
  const { t } = useTranslation();

  const project = state.currentProject;
  
  // Generate emergent insights based on current inputs
  const emergentInsights = generateEmergentInsights(state.inputs);
  
  // Generate infrastructure dependencies
  const infrastructureDependencies = generateInfrastructureDependencies(state.inputs, state.selectedOds);

  if (!project) {
    return (
      <div className="clay-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
        <div style={{ width: 'clamp(48px, 8vw, 72px)', height: 'clamp(48px, 8vw, 72px)', margin: '0 auto 16px' }}>
          {getIcon('sliders', '', 'var(--text-muted)')}
        </div>
        <p>{t('planner_no_ods_selected')}</p>
        <button
          type="button"
          onClick={() => dispatch({ type: 'SET_TAB', payload: 'selection' })}
          className="clay-button clay-button-primary"
          style={{ marginTop: '16px' }}
        >
          {t('selection_manual')}
        </button>
      </div>
    );
  }

  const handleSliderChange = (name: 'budget' | 'beneficiaries' | 'duration' | 'teamSize' | 'riskLevel', value: number) => {
    dispatch({
      type: 'SET_INPUT',
      payload: { name, value }
    });
  };

  return (
    <section>
      <div className="page-header">
        <h2>{t('calculator_title')}</h2>
        <p>{t('calculator_subtitle')}</p>
      </div>

      <div className="grid-calc-2col">
        
          {/* LEFT PANEL: SIMULATION SLIDERS - Secondary Controls */}
        <div className="clay-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', opacity: 0.9 }}>
          <h3 style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1rem)', paddingBottom: '8px', marginBottom: '16px', boxShadow: 'inset 0 -1px 0 var(--border-dark)', color: 'var(--text-secondary)' }}>
            {t('calculator_scenario_params')}
          </h3>

          {/* Slider 1: Beneficiaries */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(10px, 1.1vw, 11px)', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <label htmlFor="input-beneficiaries">{t('calculator_input_beneficiaries')}</label>
              <span style={{ color: 'var(--accent-color)' }}>{state.inputs.beneficiaries}</span>
            </div>
            <input
              id="input-beneficiaries"
              type="range"
              min={50}
              max={5000}
              step={50}
              value={state.inputs.beneficiaries}
              onChange={(e: any) => handleSliderChange('beneficiaries', parseInt(e.target.value))}
              className="clay-range"
              style={{ opacity: 0.85 }}
            />
          </div>

          {/* Slider 2: Budget */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(10px, 1.1vw, 11px)', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <label htmlFor="input-budget">{t('calculator_input_budget')}</label>
              <span style={{ color: 'var(--accent-color)' }}>${state.inputs.budget.toLocaleString()}</span>
            </div>
            <input
              id="input-budget"
              type="range"
              min={1000}
              max={100000}
              step={1000}
              value={state.inputs.budget}
              onChange={(e: any) => handleSliderChange('budget', parseInt(e.target.value))}
              className="clay-range"
              style={{ opacity: 0.85 }}
            />
          </div>

          {/* Slider 3: Duration */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(10px, 1.1vw, 11px)', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <label htmlFor="input-duration">{t('calculator_input_duration')}</label>
              <span style={{ color: 'var(--accent-color)' }}>{state.inputs.duration} {t('unit_months')}</span>
            </div>
            <input
              id="input-duration"
              type="range"
              min={3}
              max={36}
              step={1}
              value={state.inputs.duration}
              onChange={(e: any) => handleSliderChange('duration', parseInt(e.target.value))}
              className="clay-range"
              style={{ opacity: 0.85 }}
            />
          </div>

          {/* Slider 4: Team size */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(10px, 1.1vw, 11px)', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <label htmlFor="input-teamsize">{t('calculator_input_team')}</label>
              <span style={{ color: 'var(--accent-color)' }}>{state.inputs.teamSize} {t('unit_collaborators')}</span>
            </div>
            <input
              id="input-teamsize"
              type="range"
              min={1}
              max={25}
              step={1}
              value={state.inputs.teamSize}
              onChange={(e: any) => handleSliderChange('teamSize', parseInt(e.target.value))}
              className="clay-range"
              style={{ opacity: 0.85 }}
            />
          </div>

          {/* Dropdown 5: Risk Level */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label htmlFor="input-risk" style={{ fontSize: 'clamp(10px, 1.1vw, 11px)', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {t('calculator_input_risk')}
            </label>
            <select
              id="input-risk"
              value={state.inputs.riskLevel}
              onChange={(e: any) => handleSliderChange('riskLevel', parseFloat(e.target.value))}
              className="clay-input"
              style={{ opacity: 0.85 }}
            >
              <option value={0.15}>{t('calculator_risk_low')}</option>
              <option value={0.45}>{t('calculator_risk_medium')}</option>
              <option value={0.75}>{t('calculator_risk_high')}</option>
            </select>
          </div>
        </div>

        {/* RIGHT PANEL: ANIMATED INDICATORS & EXPLANATIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Emergent Behavior Insights - Primary Analysis Zone */}
          {emergentInsights.length > 0 && (
            <div className="clay-card" style={{
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)',
              boxShadow: 'var(--clay-card-shadow), 0 4px 12px rgba(239, 68, 68, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '20px', height: '20px' }}>
                  {getIcon('warning', '', '#ef4444')}
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#ef4444', letterSpacing: '-0.5px' }}>
                  {t('calculator_emergent_behavior')}
                </h3>
              </div>
              {emergentInsights.map((insight, index) => (
                <div key={index} style={{ 
                  marginBottom: index < emergentInsights.length - 1 ? '16px' : '0',
                  paddingBottom: index < emergentInsights.length - 1 ? '16px' : '0',
                  boxShadow: index < emergentInsights.length - 1 ? 'inset 0 -1px 0 var(--border-dark)' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ 
                      fontSize: '10px', 
                      padding: '4px 10px', 
                      borderRadius: '8px',
                      background: insight.severity === 'critical' ? '#ef4444' : 
                                 insight.severity === 'high' ? '#f97316' : 
                                 insight.severity === 'medium' ? '#f59e0b' : '#6366f1',
                      color: '#fff',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(0,0,0,0.2), inset 1px 1px 2px rgba(255,255,255,0.2)'
                    }}>
                      {insight.severity}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {insight.title}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '6px 0 0 0', lineHeight: 1.5 }}>
                    {insight.description}
                  </p>
                  {insight.recommendation && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <div style={{ width: '12px', height: '12px', flexShrink: 0, marginTop: 1 }}>
                        {getIcon('lightbulb', '', '#10b981')}
                      </div>
                      <p style={{ fontSize: '10px', color: '#10b981', margin: '4px 0 0 0', fontStyle: 'italic' }}>
                        {insight.recommendation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Infrastructure Dependencies - Primary Analysis Zone */}
          {infrastructureDependencies.length > 0 && (
            <div className="clay-card" style={{
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(251, 191, 36, 0.08) 100%)',
              boxShadow: 'var(--clay-card-shadow), 0 4px 12px rgba(245, 158, 11, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '20px', height: '20px' }}>
                  {getIcon('wrench', '', '#f59e0b')}
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#f59e0b', letterSpacing: '-0.5px' }}>
                  {t('calculator_critical_dependencies')}
                </h3>
              </div>
              {infrastructureDependencies.slice(0, 4).map((dep, index) => (
                <div key={index} style={{ 
                  marginBottom: index < Math.min(4, infrastructureDependencies.length) - 1 ? '16px' : '0',
                  paddingBottom: index < Math.min(4, infrastructureDependencies.length) - 1 ? '16px' : '0',
                  boxShadow: index < Math.min(4, infrastructureDependencies.length) - 1 ? 'inset 0 -1px 0 var(--border-dark)' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ 
                      fontSize: '10px', 
                      padding: '4px 10px', 
                      borderRadius: '8px',
                      background: dep.severity === 'critical' ? '#ef4444' : 
                                 dep.severity === 'high' ? '#f97316' : 
                                 dep.severity === 'medium' ? '#f59e0b' : '#6366f1',
                      color: '#fff',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(0,0,0,0.2), inset 1px 1px 2px rgba(255,255,255,0.2)'
                    }}>
                      {dep.severity}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {dep.description}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '6px 0 0 0', lineHeight: 1.5 }}>
                    {dep.rationale}
                  </p>
                  {dep.mitigation && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <div style={{ width: '12px', height: '12px', flexShrink: 0, marginTop: 1 }}>
                        {getIcon('lightbulb', '', '#10b981')}
                      </div>
                      <p style={{ fontSize: '10px', color: '#10b981', margin: '4px 0 0 0', fontStyle: 'italic' }}>
                        {dep.mitigation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              {infrastructureDependencies.length > 4 && (
                <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: '8px 0 0 0', fontStyle: 'italic' }}>
                  +{infrastructureDependencies.length - 4} {t('calculator_additional_dependencies')}
                </p>
              )}
            </div>
          )}
          
          {/* Main Gauges Card */}
          <div className="clay-card" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '20px', alignItems: 'center' }}>
            {/* 1. Main radial impact gauge */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ position: 'relative', width: 'clamp(100px, 12vw, 120px)', height: 'clamp(100px, 12vw, 120px)' }}>
                <svg width="100%" height="100%" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                  <defs>
                    <filter id="circleShadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2"/>
                    </filter>
                  </defs>
                  <circle cx="60" cy="60" r={50} fill="transparent" stroke="var(--bg-tertiary)" strokeWidth="10" />
                  <motion.circle
                    cx="60"
                    cy="60"
                    r={50}
                    fill="transparent"
                    stroke="var(--accent-color)"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 50}
                    animate={{ strokeDashoffset: 2 * Math.PI * 50 - (project.overallImpactScore / 100) * 2 * Math.PI * 50 }}
                    transition={{ duration: 0.4 }}
                    strokeLinecap="round"
                    filter="url(#circleShadow)"
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 800 }}>{project.overallImpactScore}</span>
                  <span style={{ fontSize: 'clamp(9px, 1.1vw, 10px)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('calculator_systemic_index')}</span>
                </div>
              </div>
              <h4 style={{ fontSize: 'clamp(11px, 1.3vw, 13px)', marginTop: '12px', fontWeight: 700 }}>
                {t('calculator_score_impact')}
              </h4>
            </div>

            {/* 2. Secondary scales */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Reach bar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(10px, 1.2vw, 12px)', fontWeight: 700 }}>
                  <span>{t('calculator_score_reach')}</span>
                  <span>~{project.reachEstimated}</span>
                </div>
                <div style={{ width: '100%', height: '8px', borderRadius: '8px', background: 'var(--bg-tertiary)', overflow: 'hidden', boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.1), inset 2px 2px 4px rgba(255,255,255,0.1)' }}>
                  <motion.div
                    style={{ height: '100%', background: 'linear-gradient(90deg, #3b82f6, #06b6d4)', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (project.reachEstimated / 5500) * 100)}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              {/* Sustainability scale */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(10px, 1.2vw, 12px)', fontWeight: 700 }}>
                  <span>{t('calculator_feasibility_index')}</span>
                  <span>{project.sustainabilityIndex}/100</span>
                </div>
                <div style={{ width: '100%', height: '8px', borderRadius: '8px', background: 'var(--bg-tertiary)', overflow: 'hidden', boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.1), inset 2px 2px 4px rgba(255,255,255,0.1)' }}>
                  <motion.div
                    style={{ height: '100%', background: 'linear-gradient(90deg, #10b981, #10b981)', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${project.sustainabilityIndex}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              {/* SDG Alignment scale */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(10px, 1.2vw, 12px)', fontWeight: 700 }}>
                  <span>{t('calculator_alignment_mcda')}</span>
                  <span>{project.alignmentScore}/100</span>
                </div>
                <div style={{ width: '100%', height: '8px', borderRadius: '8px', background: 'var(--bg-tertiary)', overflow: 'hidden', boxShadow: 'inset -2px -2px 4px rgba(0,0,0,0.1), inset 2px 2px 4px rgba(255,255,255,0.1)' }}>
                  <motion.div
                    style={{ height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #ec4899)', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${project.alignmentScore}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Explainability Breakdown Card */}
          <div className="clay-card">
            <h3 style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1rem)', marginBottom: '14px', paddingBottom: '6px', boxShadow: 'inset 0 -1px 0 var(--border-dark)' }}>
              {t('calculator_explain_title')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {project.scoreBreakdown.map((item: any, i: number) => {
                if (item.value === 0) return null;
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'clamp(11px, 1.2vw, 13px)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                    <span style={{ fontWeight: 700, color: item.isPositive ? '#10b981' : '#ef4444' }}>
                      {item.value > 0 ? `+${item.value}` : item.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tradeoffs List Warnings with Severity Classification */}
          <div className="clay-card" style={{
            background: project.tradeoffs.length > 0 ? 'rgba(239,68,68,0.04)' : 'rgba(16,185,129,0.04)',
            boxShadow: project.tradeoffs.length > 0 ? 'var(--clay-input-shadow)' : 'var(--clay-input-shadow)'
          }}>
            <h3 style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1rem)', marginBottom: '14px', color: project.tradeoffs.length > 0 ? '#ef4444' : '#10b981', paddingBottom: '8px', boxShadow: 'inset 0 -1px 0 var(--border-dark)' }}>
              {t('calculator_tradeoffs_title')}
            </h3>
            {project.tradeoffs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {project.tradeoffs.map((tradeoff: string, i: number) => {
                  // Extract SDG pairs from tradeoff string
                  const sdgMatch = tradeoff.match(/ODS (\d+) × ODS (\d+)/);
                  const severity = i === 0 ? t('calculator_high_risk') : i === 1 ? t('calculator_medium_risk') : t('calculator_moderate_risk');
                  
                  // Split on ". Recomendado:" / ". Recommended:" / ". Recomendado:"
                  const splitRx = /\. (Recomendado|Recommended|Recomendado):/;
                  const parts = tradeoff.split(splitRx);
                  const title = parts[0];
                  const rec   = parts.length >= 3 ? parts[2].trim() : null;
                  
                  return (
                    <div key={i} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      padding: '10px',
                      borderRadius: '8px',
                      background: 'var(--bg-glass)',
                      fontSize: 'clamp(9px, 1vw, 10px)',
                      lineHeight: 1.3
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flex: 1 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                          </svg>
                          <span style={{ fontSize: 'clamp(10px, 1.2vw, 12px)', fontWeight: 700, color: '#ef4444', lineHeight: 1.4 }}>{title}</span>
                        </div>
                        {sdgMatch && (
                          <span style={{ 
                            fontSize: '9px', 
                            padding: '3px 8px', 
                            borderRadius: '4px',
                            background: severity === t('calculator_high_risk') ? '#ef4444' : severity === t('calculator_medium_risk') ? '#f59e0b' : '#6366f1',
                            color: '#fff',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            flexShrink: 0
                          }}>
                            {severity}
                          </span>
                        )}
                      </div>
                      {rec && (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', paddingLeft: '22px' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                            <polyline points="9 11 12 14 22 4"/>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                          </svg>
                          <span style={{ fontSize: 'clamp(10px, 1.1vw, 11px)', color: '#10b981', fontWeight: 600, lineHeight: 1.4 }}>
                            <strong>{t('label_recommended')}:</strong> {rec}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <p style={{ fontSize: 'clamp(10px, 1.2vw, 12px)', color: '#10b981', margin: 0, fontWeight: 600 }}>
                  {t('calculator_no_tradeoffs')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          section > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
export default ImpactCalculator;
