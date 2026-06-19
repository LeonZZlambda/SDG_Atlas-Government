import { useState } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { useTranslation } from '../i18n';
import { SDG_METADATA } from '../utils/projectGenerator';
import { buildGraphFromSDGs, calculateSBI, calculateSimulatedMetrics, calculateOriginalMetrics } from '../utils/simulation';

interface WhatIfSimulationProps {
  onClose: () => void;
}

export function WhatIfSimulation({ onClose }: WhatIfSimulationProps) {
  const { state, dispatch } = usePlatform();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'pt-BR';
  const langKey: 'pt' | 'en' | 'es' = currentLang.startsWith('en') ? 'en' : currentLang.startsWith('es') ? 'es' : 'pt';
  const [simulatedSDGs, setSimulatedSDGs] = useState<number[]>([...state.selectedOds]);
  const [simulatedBudget, setSimulatedBudget] = useState(state.inputs.budget);
  const [simulatedTeamSize, setSimulatedTeamSize] = useState(state.inputs.teamSize);
  const [simulatedDuration, setSimulatedDuration] = useState(state.inputs.duration);
  const [simulatedBeneficiaries, setSimulatedBeneficiaries] = useState(state.inputs.beneficiaries);

  const simulatedMetrics = calculateSimulatedMetrics(
    simulatedSDGs,
    simulatedBudget,
    simulatedBeneficiaries,
    simulatedDuration,
    simulatedTeamSize,
    state.inputs.riskLevel || 0.5,
    langKey
  );
  
  // Calculate original metrics for comparison
  const originalMetrics = calculateOriginalMetrics(state.selectedOds, state.inputs, langKey);

  const toggleSDG = (id: number) => {
    setSimulatedSDGs(prev => {
      if (prev.includes(id)) {
        return prev.filter(s => s !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const applySimulation = () => {
    // Dispatch actions to update the actual state
    dispatch({ type: 'SET_ODS_BULK', payload: simulatedSDGs });
    dispatch({ type: 'SET_INPUT', payload: { name: 'budget', value: simulatedBudget } });
    dispatch({ type: 'SET_INPUT', payload: { name: 'teamSize', value: simulatedTeamSize } });
    dispatch({ type: 'SET_INPUT', payload: { name: 'duration', value: simulatedDuration } });
    dispatch({ type: 'SET_INPUT', payload: { name: 'beneficiaries', value: simulatedBeneficiaries } });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'var(--bg-primary)',
        borderRadius: 16,
        maxWidth: 900,
        maxHeight: '90vh',
        width: '95%',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        overflow: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{t('whatif_title')}</h2>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0' }}>
              {t('whatif_subtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              fontSize: 20,
              padding: '4px 12px',
              borderRadius: 8,
              background: 'rgba(0,0,0,0.05)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        {/* SDG Selection */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>
            {t('whatif_sdg_selection')} ({simulatedSDGs.length} {t('whatif_selected')})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: 8 }}>
            {SDG_METADATA.map(sdg => (
              <button
                key={sdg.id}
                onClick={() => toggleSDG(sdg.id)}
                style={{
                  padding: '8px 4px',
                  borderRadius: 8,
                  background: simulatedSDGs.includes(sdg.id) ? sdg.color : 'rgba(0,0,0,0.05)',
                  color: simulatedSDGs.includes(sdg.id) ? '#fff' : 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: 10,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {sdg.id}
              </button>
            ))}
          </div>
        </div>

        {/* Parameter Controls */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>{t('whatif_project_params')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div>
              <label style={{ fontSize: 9, fontWeight: 600, marginBottom: 4, display: 'block' }}>{t('whatif_budget')}</label>
              <input
                type="number"
                value={simulatedBudget}
                onChange={(e) => setSimulatedBudget(Number((e.target as HTMLInputElement).value))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border-dark)',
                  fontSize: 10,
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 9, fontWeight: 600, marginBottom: 4, display: 'block' }}>{t('whatif_team_size')}</label>
              <input
                type="number"
                value={simulatedTeamSize}
                onChange={(e) => setSimulatedTeamSize(Number((e.target as HTMLInputElement).value))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border-dark)',
                  fontSize: 10,
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 9, fontWeight: 600, marginBottom: 4, display: 'block' }}>{t('whatif_duration')}</label>
              <input
                type="number"
                value={simulatedDuration}
                onChange={(e) => setSimulatedDuration(Number((e.target as HTMLInputElement).value))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border-dark)',
                  fontSize: 10,
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 9, fontWeight: 600, marginBottom: 4, display: 'block' }}>{t('whatif_beneficiaries')}</label>
              <input
                type="number"
                value={simulatedBeneficiaries}
                onChange={(e) => setSimulatedBeneficiaries(Number((e.target as HTMLInputElement).value))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border-dark)',
                  fontSize: 10,
                }}
              />
            </div>
          </div>
        </div>

        {/* Scenario Comparison: Impact of Adding Each SDG */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>{t('whatif_scenario_comparison')}</div>
          <div style={{
            borderRadius: 12,
            background: 'var(--bg-glass)',
            boxShadow: 'var(--clay-input-shadow)',
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.03)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700 }}>{t('whatif_scenario')}</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10, fontWeight: 700 }}>{t('whatif_impact')}</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10, fontWeight: 700 }}>{t('whatif_sustainability')}</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10, fontWeight: 700 }}>{t('whatif_change')}</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-dark)' }}>
                  <td style={{ padding: '10px 12px', fontSize: 10, fontWeight: 600 }}>{t('whatif_current')}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10, fontWeight: 700 }}>{originalMetrics.impact.toFixed(1)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10, fontWeight: 700 }}>{originalMetrics.sustainability.toFixed(1)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10, color: 'var(--text-muted)' }}>—</td>
                </tr>
                {[...Array(17)].map((_, i) => {
                  const sdgId = i + 1;
                  if (simulatedSDGs.includes(sdgId)) return null;
                  const testSDGs = [...simulatedSDGs, sdgId];
                  const testGraph = buildGraphFromSDGs(testSDGs, langKey);
                  const testSBI = calculateSBI(testGraph);
                  const testBaseImpact = 40 + testSBI * 35 + testSDGs.length * 2.5;
                  const testEfficiencyBonus = Math.min(20, (simulatedBudget / simulatedBeneficiaries) * 0.01 * 20);
                  const testRiskPenalty = (state.inputs.riskLevel || 0.5) * 10 + testGraph.edges.filter(e => e.weight < 0).length * 6;
                  const testImpact = Math.max(10, Math.min(100, testBaseImpact + testEfficiencyBonus - testRiskPenalty));
                  const testSustainability = (simulatedDuration / 24) * 35 + testSBI * 45 + Math.min(20, simulatedTeamSize / 10 * 20);
                  const impactChange = testImpact - originalMetrics.impact;
                  
                  return (
                    <tr key={sdgId} style={{ borderBottom: '1px solid var(--border-dark)' }}>
                      <td style={{ padding: '10px 12px', fontSize: 10, fontWeight: 600 }}>+ODS {sdgId}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10, fontWeight: 700 }}>{testImpact.toFixed(1)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10, fontWeight: 700 }}>{testSustainability.toFixed(1)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10 }}>
                        <span style={{ color: impactChange > 0 ? '#10b981' : impactChange < 0 ? '#ef4444' : 'var(--text-muted)' }}>
                          {impactChange > 0 ? '+' : ''}{impactChange.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  );
                }).filter(Boolean)}
              </tbody>
            </table>
          </div>
        </div>

        {/* Before/After Comparison */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>{t('whatif_before_after')}</div>
          <div style={{
            borderRadius: 12,
            background: 'var(--bg-glass)',
            boxShadow: 'var(--clay-input-shadow)',
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.03)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700 }}>{t('whatif_metric')}</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10, fontWeight: 700 }}>{t('whatif_before')}</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10, fontWeight: 700 }}>{t('whatif_after')}</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10, fontWeight: 700 }}>{t('whatif_change')}</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-dark)' }}>
                  <td style={{ padding: '10px 12px', fontSize: 10, fontWeight: 600 }}>{t('whatif_impact')}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10 }}>{originalMetrics.impact.toFixed(1)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10, fontWeight: 700 }}>{simulatedMetrics.impact.toFixed(1)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10 }}>
                    <span style={{ color: simulatedMetrics.impact > originalMetrics.impact ? '#10b981' : simulatedMetrics.impact < originalMetrics.impact ? '#ef4444' : 'var(--text-muted)' }}>
                      {simulatedMetrics.impact > originalMetrics.impact ? '+' : ''}{(simulatedMetrics.impact - originalMetrics.impact).toFixed(1)}
                    </span>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-dark)' }}>
                  <td style={{ padding: '10px 12px', fontSize: 10, fontWeight: 600 }}>{t('whatif_sustainability')}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10 }}>{originalMetrics.sustainability.toFixed(1)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10, fontWeight: 700 }}>{simulatedMetrics.sustainability.toFixed(1)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10 }}>
                    <span style={{ color: simulatedMetrics.sustainability > originalMetrics.sustainability ? '#10b981' : simulatedMetrics.sustainability < originalMetrics.sustainability ? '#ef4444' : 'var(--text-muted)' }}>
                      {simulatedMetrics.sustainability > originalMetrics.sustainability ? '+' : ''}{(simulatedMetrics.sustainability - originalMetrics.sustainability).toFixed(1)}
                    </span>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-dark)' }}>
                  <td style={{ padding: '10px 12px', fontSize: 10, fontWeight: 600 }}>SBI</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10 }}>{originalMetrics.sbi.toFixed(3)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10, fontWeight: 700 }}>{simulatedMetrics.sbi.toFixed(3)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10 }}>
                    <span style={{ color: simulatedMetrics.sbi > originalMetrics.sbi ? '#10b981' : simulatedMetrics.sbi < originalMetrics.sbi ? '#ef4444' : 'var(--text-muted)' }}>
                      {simulatedMetrics.sbi > originalMetrics.sbi ? '+' : ''}{(simulatedMetrics.sbi - originalMetrics.sbi).toFixed(3)}
                    </span>
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-dark)' }}>
                  <td style={{ padding: '10px 12px', fontSize: 10, fontWeight: 600 }}>{t('whatif_projected_reach')}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10 }}>{originalMetrics.reach.toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10, fontWeight: 700 }}>{simulatedMetrics.reach.toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10 }}>
                    <span style={{ color: simulatedMetrics.reach > originalMetrics.reach ? '#10b981' : simulatedMetrics.reach < originalMetrics.reach ? '#ef4444' : 'var(--text-muted)' }}>
                      {simulatedMetrics.reach > originalMetrics.reach ? '+' : ''}{(simulatedMetrics.reach - originalMetrics.reach).toLocaleString()}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 12px', fontSize: 10, fontWeight: 600 }}>Trade-offs</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10 }}>{originalMetrics.tradeoffs}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10, fontWeight: 700 }}>{simulatedMetrics.tradeoffs}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10 }}>
                    <span style={{ color: simulatedMetrics.tradeoffs < originalMetrics.tradeoffs ? '#10b981' : simulatedMetrics.tradeoffs > originalMetrics.tradeoffs ? '#ef4444' : 'var(--text-muted)' }}>
                      {simulatedMetrics.tradeoffs < originalMetrics.tradeoffs ? '-' : '+'}{simulatedMetrics.tradeoffs - originalMetrics.tradeoffs}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              background: 'rgba(0,0,0,0.05)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: 11,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {t('whatif_cancel')}
          </button>
          <button
            onClick={applySimulation}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              background: '#6366f1',
              color: '#fff',
              fontWeight: 600,
              fontSize: 11,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {t('whatif_apply')}
          </button>
        </div>
      </div>
    </div>
  );
}
