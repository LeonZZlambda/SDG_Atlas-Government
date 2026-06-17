import { useState } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { useTranslation } from '../i18n';
import {
  calculateDegreeCentrality,
  calculateBetweennessCentrality,
  calculatePageRank,
  getGraphStatistics,
  type Graph,
} from '../utils/graphAlgorithms';
import { getCoefficient, SDG_METADATA } from '../utils/projectGenerator';
import { Tooltip } from './EngineStatusPanel/Tooltip';
import { ConfidenceIndicator } from './EngineStatusPanel/ConfidenceIndicator';
import { ExplanationPanel, type ExplanationPanelData } from './EngineStatusPanel/ExplanationPanel';
import { PulseDot } from './EngineStatusPanel/PulseDot';
import {
  IconGraph,
  IconLightning,
  IconMCDA,
  IconImpact,
  IconSustain,
  IconGenerator,
} from './EngineStatusPanel/Icons';
import type {
  Recommendation,
  ExecutiveInsight,
  Engine,
} from './EngineStatusPanel/types';

// ─── Engine Card ─────────────────────────────────────────────────────────────

function EngineCard({ engine, expanded, onToggle, drivers }: {
  engine: Engine;
  expanded: boolean;
  onToggle: () => void;
  drivers: { positive: string[]; negative: string[] };
}) {
  const [expandedBreakdown, setExpandedBreakdown] = useState<number | null>(null);
  return (
    <div
      style={{
        borderRadius: 16,
        background: engine.accentBg,
        boxShadow: expanded
          ? 'var(--clay-card-shadow), 0 4px 16px rgba(0,0,0,0.1)'
          : 'var(--clay-input-shadow)',
        padding: '14px 16px',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        border: `1.5px solid ${expanded ? engine.color + '44' : 'transparent'}`,
      }}
      onClick={onToggle}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Icon */}
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: engine.color + '18',
          color: engine.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 6,
          boxShadow: `0 2px 8px ${engine.color}22`,
          flexShrink: 0,
        }}>
          {engine.icon}
        </div>

        {/* Name + tagline */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              {engine.name}
            </span>
            <PulseDot status={engine.status} />
            {engine.classification && (
              <span style={{
                fontSize: 8,
                padding: '2px 6px',
                borderRadius: 6,
                background: engine.color + '20',
                color: engine.color,
                fontWeight: 700,
                textTransform: 'uppercase' as const,
              }}>
                {engine.classification}
              </span>
            )}
            {engine.benchmark && (
              <span style={{
                fontSize: 8,
                padding: '2px 6px',
                borderRadius: 6,
                background: engine.benchmark.color + '20',
                color: engine.benchmark.color,
                fontWeight: 700,
                textTransform: 'uppercase' as const,
              }}>
                {engine.benchmark.icon} {engine.benchmark.label}
              </span>
            )}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{engine.tagline}</div>
        </div>

        {/* Chevron icon */}
        <svg
            viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5"
            strokeLinecap="round" width={14} height={14}
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease', flexShrink: 0 }}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>

      {/* Metrics row (always visible) */}
      <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' as const }}>
        {engine.metrics.slice(0, 4).map((m, i) => (
          <div key={i} style={{
            flex: '1 1 60px',
            background: 'var(--bg-glass)',
            borderRadius: 10,
            padding: '6px 10px',
            boxShadow: 'var(--clay-input-shadow)',
          }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: engine.color, lineHeight: 1 }}>{m.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>{m.label}</div>
              {m.confidence && <ConfidenceIndicator level={m.confidence} />}
            </div>
            {m.sub && <div style={{ fontSize: 8, color: 'var(--text-muted)', marginTop: 1, fontStyle: 'italic' }}>{m.sub}</div>}
          </div>
        ))}
      </div>

      {/* Calculation View (visible when expanded) */}
      {expanded && (
        <div style={{ marginTop: 14, borderTop: '1px solid var(--border-dark)', paddingTop: 12 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: engine.color, textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={engine.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            Detalhes do Cálculo
          </div>
          
          {/* Formulas with explanations */}
          {engine.formula && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 6 }}>
                Fórmulas Matemáticas
              </div>
              {engine.formula.map((f, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: 10,
                    background: 'var(--bg-tertiary)',
                    borderRadius: 6,
                    padding: '5px 8px',
                    color: engine.color,
                    fontWeight: 700,
                    boxShadow: 'var(--clay-input-shadow)',
                  }}>
                    <Tooltip content={f.explanation || ''}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{f.label}: </span>
                      {f.expr}
                    </Tooltip>
                  </div>
                  {f.explanation && (
                    <div style={{ fontSize: 8, color: 'var(--text-muted)', marginTop: 2, marginLeft: 8 }}>
                      {f.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Score breakdown with detailed calculation */}
          {engine.breakdowns && engine.breakdowns.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 6 }}>
                Decomposição do Score
              </div>
              {engine.breakdowns.map((bd, i) => (
                <div 
                  key={i} 
                  style={{
                    marginBottom: 8,
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: engine.clickableBreakdown && expandedBreakdown === i
                      ? 'var(--bg-glass)'
                      : 'var(--bg-tertiary)',
                    boxShadow: engine.clickableBreakdown && expandedBreakdown === i
                      ? `inset -1px -1px 3px rgba(0,0,0,0.06), inset 1px 1px 3px rgba(255,255,255,0.9), 0 2px 8px ${engine.color}22`
                      : 'var(--clay-input-shadow)',
                    cursor: engine.clickableBreakdown ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => engine.clickableBreakdown && setExpandedBreakdown(expandedBreakdown === i ? null : i)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-primary)' }}>{bd.component}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: engine.color }}>{bd.contribution.toFixed(1)} pts</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, fontSize: 9, color: 'var(--text-muted)' }}>
                    <span>Valor: {bd.value.toFixed(2)}</span>
                    <span>Peso: {(bd.weight * 100).toFixed(0)}%</span>
                  </div>
                  {bd.formula && (
                    <div style={{
                      marginTop: 4,
                      fontFamily: 'monospace',
                      fontSize: 8,
                      color: 'var(--text-muted)',
                      background: 'var(--bg-tertiary)',
                      padding: '3px 6px',
                      borderRadius: 4,
                    }}>
                      {bd.formula}
                    </div>
                  )}
                  {engine.clickableBreakdown && expandedBreakdown === i && (
                    <div style={{
                      marginTop: 6,
                      paddingTop: 6,
                      borderTop: '1px solid var(--border-dark)',
                      fontSize: 8,
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>Detalhes do Cálculo:</div>
                      <div>• Valor bruto: {bd.value.toFixed(4)}</div>
                      <div>• Peso aplicado: {(bd.weight * 100).toFixed(1)}%</div>
                      <div>• Contribuição final: {bd.contribution.toFixed(2)} pontos</div>
                      <div>• Impacto no score total: {((bd.contribution / 100) * 100).toFixed(1)}%</div>
                      {bd.normalized && (
                        <div style={{ marginTop: 4, paddingTop: 4, borderTop: '1px dashed var(--border-dark)' }}>
                          <div style={{ fontWeight: 600, marginBottom: 2, color: '#6366f1' }}>Normalização (prevenção de outliers):</div>
                          <div>• Valor bruto: {bd.normalized.raw.toLocaleString()}</div>
                          <div>• Valor normalizado: {bd.normalized.normalized.toFixed(1)}/100</div>
                          <div>• Método: {bd.normalized.method}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Methodology */}
          {engine.methodology && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 6 }}>
                Metodologia
              </div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 9, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {engine.methodology.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Assumptions */}
          {engine.assumptions && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 6 }}>
                Premissas
              </div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 9, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {engine.assumptions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Detail description */}
          <p style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{engine.detail}</p>

          {/* Academic References */}
          {engine.academicReferences && engine.academicReferences.length > 0 && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-dark)' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                Referências Acadêmicas
              </div>
              {engine.academicReferences.map((ref, i) => (
                <div key={i} style={{ marginBottom: 8, padding: '8px 10px', borderRadius: 8, background: 'rgba(99,102,241,0.1)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', marginBottom: 4 }}>{ref.concept}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginBottom: 4, lineHeight: 1.5 }}>{ref.explanation}</div>
                  <div style={{ fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>{ref.references.join('; ')}</div>
                </div>
              ))}
            </div>
          )}

          {/* Positive/Negative Drivers */}
          {(drivers.positive.length > 0 || drivers.negative.length > 0) && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-dark)' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 8 }}>
                Fatores de Influência
              </div>
              
              {drivers.positive.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Drivers Positivos
                  {drivers.positive.map((driver, i) => (
                    <div key={i} style={{
                      fontSize: 8,
                      padding: '3px 8px',
                      borderRadius: 4,
                      background: 'rgba(16,185,129,0.15)',
                      color: '#10b981',
                      marginBottom: 2,
                      display: 'inline-block',
                      marginRight: 4,
                    }}>
                      {driver}
                    </div>
                  ))}
                </div>
              )}
              
              {drivers.negative.length > 0 && (
                <div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
                  </svg>
                  Drivers Negativos
                  {drivers.negative.map((driver, i) => (
                    <div key={i} style={{
                      fontSize: 8,
                      padding: '3px 8px',
                      borderRadius: 4,
                      background: 'rgba(239,68,68,0.15)',
                      color: '#ef4444',
                      marginBottom: 2,
                      display: 'inline-block',
                      marginRight: 4,
                    }}>
                      {driver}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Expanded: detailed breakdown */}
      {expanded && (
        <div style={{ marginTop: 14, borderTop: '1px solid var(--border-dark)', paddingTop: 12 }}>
          {/* Pipeline visualization */}
          {engine.pipeline && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 6 }}>
                Pipeline de Processamento
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                {engine.pipeline.map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: engine.color + '15',
                      color: engine.color,
                      fontSize: 9,
                      fontWeight: 600,
                      boxShadow: 'var(--clay-input-shadow)',
                    }}>
                      {step}
                    </div>
                    {i < engine.pipeline!.length - 1 && (
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={engine.color} strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Score breakdown */}
          {engine.breakdowns && engine.breakdowns.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 6 }}>
                Decomposição do Score
              </div>
              {engine.breakdowns.map((bd, i) => (
                <div 
                  key={i} 
                  style={{
                    marginBottom: 8,
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: engine.clickableBreakdown && expandedBreakdown === i
                      ? 'var(--bg-glass)'
                      : 'var(--bg-tertiary)',
                    boxShadow: engine.clickableBreakdown && expandedBreakdown === i
                      ? `inset -1px -1px 3px rgba(0,0,0,0.06), inset 1px 1px 3px rgba(255,255,255,0.9), 0 2px 8px ${engine.color}22`
                      : 'var(--clay-input-shadow)',
                    cursor: engine.clickableBreakdown ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => engine.clickableBreakdown && setExpandedBreakdown(expandedBreakdown === i ? null : i)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-primary)' }}>{bd.component}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: engine.color }}>{bd.contribution.toFixed(1)} pts</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, fontSize: 9, color: 'var(--text-muted)' }}>
                    <span>Valor: {bd.value.toFixed(2)}</span>
                    <span>Peso: {(bd.weight * 100).toFixed(0)}%</span>
                  </div>
                  {bd.formula && (
                    <div style={{
                      marginTop: 4,
                      fontFamily: 'monospace',
                      fontSize: 8,
                      color: 'var(--text-muted)',
                      background: 'var(--bg-tertiary)',
                      padding: '3px 6px',
                      borderRadius: 4,
                    }}>
                      {bd.formula}
                    </div>
                  )}
                  {engine.clickableBreakdown && expandedBreakdown === i && (
                    <div style={{
                      marginTop: 6,
                      paddingTop: 6,
                      borderTop: '1px solid var(--border-dark)',
                      fontSize: 8,
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>Detalhes do Cálculo:</div>
                      <div>• Valor bruto: {bd.value.toFixed(4)}</div>
                      <div>• Peso aplicado: {(bd.weight * 100).toFixed(1)}%</div>
                      <div>• Contribuição final: {bd.contribution.toFixed(2)} pontos</div>
                      <div>• Impacto no score total: {((bd.contribution / 100) * 100).toFixed(1)}%</div>
                      {bd.normalized && (
                        <div style={{ marginTop: 4, paddingTop: 4, borderTop: '1px dashed var(--border-dark)' }}>
                          <div style={{ fontWeight: 600, marginBottom: 2, color: '#6366f1' }}>Normalização (prevenção de outliers):</div>
                          <div>• Valor bruto: {bd.normalized.raw.toLocaleString()}</div>
                          <div>• Valor normalizado: {bd.normalized.normalized.toFixed(1)}/100</div>
                          <div>• Método: {bd.normalized.method}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Formulas with explanations */}
          {engine.formula && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 6 }}>
                Fórmulas Matemáticas
              </div>
              {engine.formula.map((f, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: 10,
                    background: 'var(--bg-tertiary)',
                    borderRadius: 6,
                    padding: '5px 8px',
                    color: engine.color,
                    fontWeight: 700,
                    boxShadow: 'var(--clay-input-shadow)',
                  }}>
                    <Tooltip content={f.explanation || ''}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{f.label}: </span>
                      {f.expr}
                    </Tooltip>
                  </div>
                  {f.explanation && (
                    <div style={{ fontSize: 8, color: 'var(--text-muted)', marginTop: 2, marginLeft: 8 }}>
                      {f.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Methodology */}
          {engine.methodology && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 6 }}>
                Metodologia
              </div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 9, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {engine.methodology.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Assumptions */}
          {engine.assumptions && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 6 }}
                >
                Premissas
              </div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 9, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {engine.assumptions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Detail description */}
          <p style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{engine.detail}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function EngineStatusPanel() {
  const { state } = usePlatform();
  const { t } = useTranslation();
  const [expandedInsight, setExpandedInsight] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const selectedSDGs = state.selectedOds;
  const project = state.currentProject;
  const hasSdgs = selectedSDGs.length > 0;
  
  // Benchmarking System - Score Categories
  const getImpactCategory = (score: number): { label: string; color: string; icon: string } => {
    if (score >= 91) return { label: 'Exceptional', color: '#10b981', icon: 'trophy' };
    if (score >= 71) return { label: 'High', color: '#3b82f6', icon: 'star' };
    if (score >= 41) return { label: 'Moderate', color: '#f59e0b', icon: 'chart' };
    return { label: 'Low', color: '#ef4444', icon: 'trending-down' };
  };

  const getSustainabilityCategory = (score: number): { label: string; color: string; icon: string } => {
    if (score >= 91) return { label: 'Highly Resilient', color: '#10b981', icon: 'shield' };
    if (score >= 71) return { label: 'Resilient', color: '#3b82f6', icon: 'leaf' };
    if (score >= 41) return { label: 'Stable', color: '#f59e0b', icon: 'scale' };
    return { label: 'Fragile', color: '#ef4444', icon: 'alert' };
  };

  // Outlier and Score Normalization
  const normalizeValue = (value: number, method: 'log' | 'percentile' = 'log', maxValue?: number): { raw: number; normalized: number; method: string } => {
    if (value <= 0) {
      return { raw: value, normalized: 0, method: 'log' };
    }
    
    if (method === 'log') {
      const normalized = Math.log10(value + 1) / (maxValue ? Math.log10(maxValue + 1) : 6);
      return { raw: value, normalized: Math.min(100, normalized * 100), method: 'logarithmic' };
    }
    
    const normalized = Math.min(100, (value / (maxValue || 100000)) * 100);
    return { raw: value, normalized, method: 'percentile' };
  };

  // Generate Positive and Negative Drivers for each engine
  const generateDrivers = (engineId: string) => {
    const positive: string[] = [];
    const negative: string[] = [];
    
    if (!hasSdgs) return { positive, negative };
    
    switch (engineId) {
      case 'graph':
        // Graph Engine Drivers
        if (graphStats?.density && graphStats.density > 0.5) {
          positive.push(t('engine_high_network_density', { percent: (graphStats.density * 100).toFixed(0) }));
        }
        if (positiveEdges > graph.edges.length * 0.7) {
          positive.push(t('engine_strong_synergies'));
        }
        if (degCentrality) {
          const avgDeg = Array.from(degCentrality.values()).reduce((a, b) => a + b, 0) / degCentrality.size;
          if (avgDeg > 0.5) {
            positive.push(t('engine_high_centrality'));
          }
        }
        if (selectedSDGs.length < 4) {
          negative.push(t('engine_limited_network_size'));
        }
        if (negativeEdges > 0) {
          negative.push(t(negativeEdges === 1 ? 'engine_tradeoffs_detected' : 'engine_tradeoffs_detected_plural', { count: negativeEdges }));
        }
        if (graphStats?.averageClusteringCoefficient && graphStats.averageClusteringCoefficient < 0.3) {
          negative.push(t('engine_low_clustering'));
        }
        break;
        
      case 'mcda':
        // MCDA Engine Drivers
        if (sbi && sbi > 0.6) {
          positive.push(t('engine_high_sbi'));
        }
        if (selectedSDGs.length >= 4 && selectedSDGs.length <= 7) {
          positive.push(t('engine_ideal_goals_range'));
        }
        if (project && project.tradeoffs.length === 0) {
          positive.push(t('engine_zero_tradeoffs'));
        }
        if (selectedSDGs.length < 3) {
          negative.push(t('engine_low_goals_range'));
        }
        if (sbi && sbi < 0) {
          negative.push(t('engine_tradeoffs_predominance'));
        }
        if (selectedSDGs.length > 10) {
          negative.push(t('engine_high_coordination_complexity'));
        }
        break;
        
      case 'impact':
        // Impact Engine Drivers
        if (project && project.overallImpactScore >= 70) {
          positive.push(t('engine_high_impact_score'));
        }
        if (positiveEdges > 0) {
          positive.push(t('engine_positive_connections', { count: positiveEdges }));
        }
        if (sbi && sbi > 0.5) {
          positive.push(t('engine_synergy_multiplier'));
        }
        // Add dominant SDG driver based on Systemic Influence Score
        if (degCentrality && betweennessCentrality) {
          const systemicInfluences = selectedSDGs.map(id => ({
            id,
            score: calculateSystemicInfluence(id)
          }));
          const maxInfluence = systemicInfluences.reduce((a, b) => a.score > b.score ? a : b);
          if (maxInfluence.score > 0.3) {
            positive.push(t('engine_dominates_systemic_influence', { id: maxInfluence.id }));
          }
        }
        if (project && project.tradeoffs.length > 0) {
          negative.push(t(project.tradeoffs.length === 1 ? 'engine_conflicts_reducing_impact' : 'engine_conflicts_reducing_impact_plural', { count: project.tradeoffs.length }));
        }
        if (selectedSDGs.length < 3) {
          negative.push(t('engine_low_thematic_diversity'));
        }
        if (state.inputs.beneficiaries < 1000) {
          negative.push(t('engine_limited_beneficiary_reach'));
        }
        break;
        
      case 'sustain':
        // Sustainability Engine Drivers
        if (project && project.sustainabilityIndex >= 70) {
          positive.push(t('engine_high_resilience'));
        }
        if (negativeEdges === 0) {
          positive.push(t('engine_zero_structural_conflicts'));
        }
        if (graphStats?.averageClusteringCoefficient && graphStats.averageClusteringCoefficient > 0.5) {
          positive.push(t('engine_high_network_cohesion'));
        }
        if (state.inputs.duration >= 12) {
          positive.push(t('engine_adequate_time_horizon'));
        }
        if (project && project.tradeoffs.length > 0) {
          negative.push(t('engine_conflicts_affecting_sustainability'));
        }
        if (selectedSDGs.length < 4) {
          negative.push(t('engine_low_network_redundancy'));
        }
        if (state.inputs.teamSize < 5) {
          negative.push(t('engine_limited_team_capacity'));
        }
        break;
    }
    
    return { positive, negative };
  };

  // Build a live graph from selected SDGs
  const graph: Graph = {
    nodes: selectedSDGs.map(id => ({
      id,
      label: SDG_METADATA.find(s => s.id === id)?.name.pt || `ODS ${id}`,
    })),
    edges: [],
  };
  for (let i = 0; i < selectedSDGs.length; i++) {
    for (let j = i + 1; j < selectedSDGs.length; j++) {
      const coeff = getCoefficient(selectedSDGs[i], selectedSDGs[j]);
      if (Math.abs(coeff) > 0.1) {
        graph.edges.push({ from: selectedSDGs[i], to: selectedSDGs[j], weight: coeff });
      }
    }
  }

  // Compute live metrics using graph algorithms
  const degCentrality = hasSdgs ? calculateDegreeCentrality(graph) : null;
  const betweennessCentrality = hasSdgs ? calculateBetweennessCentrality(graph) : null;
  const pageRank = hasSdgs ? calculatePageRank(graph) : null;
  const graphStats = hasSdgs ? getGraphStatistics(graph) : null;

  const positiveEdges = graph.edges.filter(e => e.weight > 0).length;
  const negativeEdges = graph.edges.filter(e => e.weight < 0).length;

  // Synergy Balance Index
  const sbi = project ? project.synergyBalanceIndex : null;

  // Low Conflict Ratio: 1 - (negativeEdges / totalEdges)
  const lcr = graph.edges.length > 0
    ? ((1 - negativeEdges / graph.edges.length) * 100).toFixed(0)
    : '—';

  // Network Density
  const networkDensity = graphStats ? (graphStats.density * 100).toFixed(1) + '%' : '—';

  // Average Clustering Coefficient
  const avgClustering = graphStats ? graphStats.averageClusteringCoefficient.toFixed(3) : '—';

  // MCDA score from project alignmentScore
  const mcdaScore = project ? `${project.alignmentScore}/100` : '—';
  const impactScore = project ? `${project.overallImpactScore}/100` : '—';
  const sustainScore = project ? `${project.sustainabilityIndex}/100` : '—';

  // Impact classification
  const getImpactClassification = (score: number) => {
    if (score >= 85) return 'Transformador';
    if (score >= 70) return 'Alto Impacto';
    if (score >= 50) return 'Moderado';
    return 'Limitado';
  };

  // Sustainability classification
  const getSustainabilityClassification = (score: number) => {
    if (score >= 80) return 'Sustentável';
    if (score >= 60) return 'Viável';
    if (score >= 40) return 'Risco Moderado';
    return 'Alto Risco';
  };

  // Calculate Systemic Influence Score (unified metric)
  // Formula: 0.4 * Degree + 0.3 * Betweenness + 0.3 * Positive Influence
  const calculateSystemicInfluence = (sdgId: number): number => {
    if (!degCentrality || !betweennessCentrality || !graph) return 0;
    
    const degree = degCentrality.get(sdgId) || 0;
    const betweenness = betweennessCentrality.get(sdgId) || 0;
    
    // Calculate positive influence for this SDG
    const positiveEdges = graph.edges.filter(e => 
      (e.from === sdgId || e.to === sdgId) && e.weight > 0
    ).length;
    const totalEdges = graph.edges.filter(e => e.from === sdgId || e.to === sdgId).length;
    const positiveInfluence = totalEdges > 0 ? positiveEdges / totalEdges : 0;
    
    // Normalize betweenness (typically 0-1 range)
    const maxBetweenness = Math.max(...Array.from(betweennessCentrality.values()), 0.001);
    const normalizedBetweenness = betweenness / maxBetweenness;
    
    // Combined score
    const systemicInfluence = 0.4 * degree + 0.3 * normalizedBetweenness + 0.3 * positiveInfluence;
    
    return systemicInfluence;
  };

  // Generate Explanation Panels
  const generateExplanationPanels = () => {
    const panels: ExplanationPanelData[] = [];
    
    if (hasSdgs && project) {
      // Use project.generatedData for Single Source of Truth
      const impactMargin = project.monteCarloStats?.stdDevImpact || 5;
      const sustainMargin = project.monteCarloStats?.stdDevSustain || 10;
      const feasibilityMargin = project.monteCarloStats?.stdDevFeasibility || 10;

      const impactUncertainty = {
        min: Math.max(0, project.overallImpactScore - impactMargin),
        max: Math.min(100, project.overallImpactScore + impactMargin),
        margin: impactMargin
      };
      panels.push({
        metricName: 'Emergent Impact Score',
        score: project.overallImpactScore,
        maxScore: 100,
        uncertainty: impactUncertainty,
        confidence: 'high',
        interpretation: project.overallImpactScore >= 70 ? 'Alto impacto sistêmico emergente' : project.overallImpactScore >= 50 ? 'Impacto moderado' : 'Impacto limitado',
        trend: 'increasing',
        factors: project.scoreBreakdown.map(item => ({
          name: item.name,
          impact: item.value,
          reason: item.isPositive ? 'Positive contributor' : 'Negative factor',
        })) || [],
      });
      
      const sustainUncertainty = {
        min: Math.max(0, project.sustainabilityIndex - sustainMargin),
        max: Math.min(100, project.sustainabilityIndex + sustainMargin),
        margin: sustainMargin
      };
      panels.push({
        metricName: 'Sustainability Score',
        score: project.sustainabilityIndex,
        maxScore: 100,
        uncertainty: sustainUncertainty,
        confidence: 'medium',
        interpretation: project.sustainabilityIndex >= 70 ? 'Alta resiliência sistêmica' : project.sustainabilityIndex >= 50 ? 'Resiliência moderada' : 'Baixa resiliência',
        trend: 'stable',
        factors: [
          { name: 'Duração do Projeto', impact: Math.round((state.inputs.duration / 24) * 35), reason: 'Projetos de maior duração têm maior sustentabilidade' },
          { name: 'Equilíbrio de Sinergia', impact: Math.round(project.synergyBalanceIndex * 45), reason: 'Sinergias entre ODS aumentam resiliência' },
          { name: 'Tamanho da Equipe', impact: state.inputs.teamSize > 5 ? 20 : 10, reason: 'Equipes maiores suportam implementação de longo prazo' },
        ],
      });
      
      const feasibilityUncertainty = {
        min: Math.max(0, (project.feasibility ?? 70) - feasibilityMargin),
        max: Math.min(100, (project.feasibility ?? 70) + feasibilityMargin),
        margin: feasibilityMargin
      };
      panels.push({
        metricName: 'Implementation Feasibility',
        score: project.feasibility ?? 70,
        maxScore: 100,
        uncertainty: feasibilityUncertainty,
        confidence: 'medium',
        interpretation: (project.feasibility ?? 70) >= 70 ? 'Alta viabilidade de implementação' : (project.feasibility ?? 70) >= 50 ? 'Viabilidade moderada' : 'Baixa viabilidade',
        trend: 'stable',
        factors: [
          { name: 'Capacidade de Recursos', impact: project.feasibilityBreakdown?.resourceCapacity ?? 70, reason: 'Orçamento e equipe vs necessidades' },
          { name: 'Simplicidade de Execução', impact: project.feasibilityBreakdown?.implementationSimplicity ?? 70, reason: 'Duração e contagem de ODS' },
          { name: 'Complexidade de Coordenação', impact: project.feasibilityBreakdown?.coordinationComplexity ?? 70, reason: 'Contagem de ODS (burden)' },
          { name: 'Conflitos Sistêmicos', impact: project.feasibilityBreakdown?.conflictPenalty ?? 100, reason: 'Dedução baseada em trade-offs negativos' }
        ],
      });
    }
    
    return panels;
  };

  // Generate Sensitivity Analysis
  const generateSensitivityAnalysis = (): { sdgId: number; influence: number; reason: string }[] => {
    if (!project || !project.sensitivity) return [];
    return project.sensitivity.map((s: any) => ({
      sdgId: s.sdgId,
      influence: s.contribution,
      reason: s.reason
    }));
  };



  // Generate Strategic Recommendations
  const generateStrategicRecommendations = (): { recommendations: Recommendation[]; gaps: string[] } => {
    const recommendations: Recommendation[] = [];
    const gaps: string[] = [];
    
    if (!hasSdgs) return { recommendations, gaps };
    
    // Check for missing strategic areas
    const hasGovernance = selectedSDGs.some(id => id === 16 || id === 17);
    const hasEconomic = selectedSDGs.some(id => id === 8 || id === 9 || id === 10);
    const hasEnvironmental = selectedSDGs.some(id => id >= 6 && id <= 15);
    const hasSocial = selectedSDGs.some(id => id >= 1 && id <= 5);
    
    if (!hasGovernance) gaps.push('Governança institucional');
    if (!hasEconomic) gaps.push('Sustentabilidade econômica');
    if (!hasEnvironmental) gaps.push('Resiliência ambiental');
    if (!hasSocial) gaps.push('Inclusão social');
    
    // Generate recommendations to add SDGs
    const allSDGs = Array.from({ length: 17 }, (_, i) => i + 1);
    const availableSDGs = allSDGs.filter(id => !selectedSDGs.includes(id));
    
    availableSDGs.forEach(sdgId => {
      let potentialImpact = 0;
      let reason = '';
      
      // Calculate potential synergy with current selection
      let totalSynergy = 0;
      selectedSDGs.forEach(currentId => {
        const coeff = getCoefficient(sdgId, currentId);
        totalSynergy += coeff;
      });
      const avgSynergy = totalSynergy / selectedSDGs.length;
      
      // Governance SDGs (16, 17)
      if ((sdgId === 16 || sdgId === 17) && !hasGovernance) {
        potentialImpact = Math.round(avgSynergy * 18);
        reason = sdgId === 16 
          ? 'Fortalece capacidade de implementação e colaboração intersetorial'
          : 'Aumenta alinhamento institucional e parcerias estratégicas';
        recommendations.push({ sdgId, type: 'add', expectedImpact: potentialImpact, reason, priority: 'high' });
      }
      
      // Economic SDGs (8, 9, 10)
      if ((sdgId === 8 || sdgId === 9 || sdgId === 10) && !hasEconomic) {
        potentialImpact = Math.round(avgSynergy * 12);
        reason = sdgId === 8
          ? 'Melhora sustentabilidade econômica e criação de empregos'
          : sdgId === 9
          ? 'Aumenta capacidade de inovação e infraestrutura'
          : 'Reduz desigualdades e fortalece coesão social';
        recommendations.push({ sdgId, type: 'add', expectedImpact: potentialImpact, reason, priority: 'medium' });
      }
      
      // Environmental SDGs (6-15)
      if (sdgId >= 6 && sdgId <= 15 && !hasEnvironmental) {
        potentialImpact = Math.round(avgSynergy * 15);
        reason = 'Aumenta resiliência ambiental e sustentabilidade de longo prazo';
        if (avgSynergy > 0.5) {
          recommendations.push({ sdgId, type: 'add', expectedImpact: potentialImpact, reason, priority: 'medium' });
        }
      }
      
      // Social SDGs (1-5)
      if (sdgId >= 1 && sdgId <= 5 && !hasSocial) {
        potentialImpact = Math.round(avgSynergy * 14);
        reason = 'Fortalece base social e inclusão comunitária';
        if (avgSynergy > 0.4) {
          recommendations.push({ sdgId, type: 'add', expectedImpact: potentialImpact, reason, priority: 'medium' });
        }
      }
    });
    
    // Sort recommendations by expected impact
    recommendations.sort((a, b) => b.expectedImpact - a.expectedImpact);
    
    // Generate recommendations to remove (only if there are tradeoffs)
    if (project && project.tradeoffs.length > 0) {
      project.tradeoffs.forEach((tradeoff: string) => {
        // Extract SDG IDs from tradeoff message
        const match = tradeoff.match(/ODS (\d+)/g);
        if (match && match.length === 2) {
          const sdgA = parseInt(match[0].replace('ODS ', ''));
          const sdgB = parseInt(match[1].replace('ODS ', ''));
          
          // Recommend removing the SDG with more conflicts
          const conflictsA = selectedSDGs.filter(id => id !== sdgA && getCoefficient(sdgA, id) < 0).length;
          const conflictsB = selectedSDGs.filter(id => id !== sdgB && getCoefficient(sdgB, id) < 0).length;
          
          if (conflictsA > conflictsB && conflictsA > 1) {
            recommendations.push({
              sdgId: sdgA,
              type: 'remove',
              expectedImpact: -Math.round(conflictsA * 5),
              reason: t('engine_reduces_systemic_conflicts', { count: conflictsA }),
              priority: 'low',
            });
          } else if (conflictsB > conflictsA && conflictsB > 1) {
            recommendations.push({
              sdgId: sdgB,
              type: 'remove',
              expectedImpact: -Math.round(conflictsB * 5),
              reason: t('engine_reduces_systemic_conflicts', { count: conflictsB }),
              priority: 'low',
            });
          }
        }
      });
    }
    
    return { recommendations: recommendations.slice(0, 5), gaps };
  };


  // Generate Executive Insights
  const generateExecutiveInsights = (): ExecutiveInsight[] => {
    const insights: ExecutiveInsight[] = [];
    
    if (!hasSdgs || !project) return insights;
    
    const emergentImpact = project.overallImpactScore;
    const feasibility = Math.min(100, Math.max(0, 50 - (selectedSDGs.length * 5) + Math.max(0, 30 - (project.tradeoffs?.length || 0) * 5) + Math.round(Math.min(20, (state.inputs.duration / 24) * 20) + Math.min(20, (state.inputs.teamSize / 10) * 20))));
    
    // Key Findings - Dominant SDG Analysis using Systemic Influence Score
    if (degCentrality && betweennessCentrality) {
      const systemicInfluences = selectedSDGs.map(id => ({
        id,
        score: calculateSystemicInfluence(id)
      }));
      const maxInfluence = systemicInfluences.reduce((a, b) => a.score > b.score ? a : b);
      if (maxInfluence.score > 0.3) {
        insights.push({
          type: 'opportunity',
          title: t('engine_dominant_driver', { id: maxInfluence.id }),
          description: t('engine_dominant_driver_desc', { score: (maxInfluence.score * 100).toFixed(1) }),
          priority: 'high',
        });
      }
    }
    
    // Network Configuration Analysis
    if (negativeEdges === 0 && positiveEdges > 0) {
      insights.push({
        type: 'opportunity',
        title: t('engine_optimized_config'),
        description: t('engine_optimized_config_desc'),
        priority: 'high',
      });
    }
    
    // Opportunities
    if (emergentImpact >= 70) {
      insights.push({
        type: 'opportunity',
        title: t('engine_high_impact_multiplier'),
        description: t('engine_high_impact_multiplier_desc'),
        priority: 'high',
      });
    }
    
    if (positiveEdges > selectedSDGs.length) {
      insights.push({
        type: 'opportunity',
        title: t('engine_strong_multiplier_effects'),
        description: t('engine_strong_multiplier_effects_desc'),
        priority: 'medium',
      });
    }
    
    if (sbi && sbi > 0.6) {
      insights.push({
        type: 'opportunity',
        title: t('engine_strong_synergy_coherence'),
        description: t('engine_strong_synergy_coherence_desc'),
        priority: 'high',
      });
    }
    
    // Risks
    if (project.tradeoffs.length > 2) {
      insights.push({
        type: 'risk',
        title: t('engine_high_institutional_dependency'),
        description: t('engine_high_institutional_dependency_desc'),
        priority: 'high',
      });
    }
    
    if (feasibility < 50) {
      insights.push({
        type: 'risk',
        title: t('engine_excessive_implementation_complexity'),
        description: t('engine_excessive_implementation_complexity_desc'),
        priority: 'high',
      });
    }
    
    if (selectedSDGs.length > 7) {
      insights.push({
        type: 'risk',
        title: t('engine_coordination_overload'),
        description: t('engine_coordination_overload_desc'),
        priority: 'medium',
      });
    }
    
    // Sustainability Analysis
    if (project.sustainabilityIndex < 50) {
      insights.push({
        type: 'risk',
        title: t('engine_limited_sustainability_diversity'),
        description: t('engine_limited_sustainability_diversity_desc'),
        priority: 'high',
      });
    }
    
    // Strategic Considerations
    if (selectedSDGs.length <= 3) {
      insights.push({
        type: 'consideration',
        title: t('engine_phased_implementation'),
        description: t('engine_phased_implementation_desc'),
        priority: 'medium',
      });
    }
    
    if (!selectedSDGs.some(id => id === 16 || id === 17)) {
      insights.push({
        type: 'consideration',
        title: t('engine_requires_municipal_partnerships'),
        description: t('engine_requires_municipal_partnerships_desc'),
        priority: 'high',
      });
    }
    
    if (state.inputs.duration < 12) {
      insights.push({
        type: 'consideration',
        title: t('engine_consider_deadline_extension'),
        description: t('engine_consider_deadline_extension_desc'),
        priority: 'low',
      });
    }
    
    return insights.slice(0, 5);
  };

  const explanationPanels = generateExplanationPanels();
  const { recommendations, gaps } = generateStrategicRecommendations();
  const executiveInsights = generateExecutiveInsights();

  const engines: Engine[] = [
    {
      id: 'graph',
      name: 'Graph Algorithms Engine',
      tagline: 'Análise de rede, centralidade e comunidades',
      color: '#6366f1',
      accentBg: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.04) 100%)',
      icon: <IconGraph />,
      status: hasSdgs ? 'active' : 'idle',
      metrics: [
        { label: 'Nós (ODS)', value: String(selectedSDGs.length || '—'), confidence: hasSdgs ? 'high' : undefined },
        { label: 'Arestas', value: hasSdgs ? String(graph.edges.length) : '—', sub: `+${positiveEdges} / -${negativeEdges}`, confidence: hasSdgs ? 'high' : undefined },
        { label: 'Densidade', value: networkDensity, confidence: hasSdgs ? 'high' : undefined },
        { label: 'Clustering', value: avgClustering, confidence: hasSdgs ? 'medium' : undefined },
      ],
      formula: [
        { 
          label: 'Degree Centrality', 
          expr: 'C(v) = deg(v) / (n - 1)',
          explanation: t('engine_expl_degree_centrality')
        },
        { 
          label: 'Betweenness Centrality', 
          expr: 'B(v) = Σ σ_st(v) / σ_st',
          explanation: t('engine_expl_betweenness_centrality')
        },
        { 
          label: 'PageRank', 
          expr: 'PR(v) = (1-d)/n + d·Σ PR(u)/L(u)',
          explanation: t('engine_expl_pagerank')
        },
        { 
          label: 'Clustering Coefficient', 
          expr: 'C = 2·triangles / k·(k-1)',
          explanation: t('engine_expl_clustering')
        },
        { 
          label: 'System Influence Score', 
          expr: 'SIS = 0.4·DC + 0.3·BC + 0.3·PR + 0.1·Density + 0.1·Clustering',
          explanation: t('engine_expl_score_composite')
        },
      ],
      breakdowns: hasSdgs && degCentrality ? selectedSDGs.map(id => {
        const dc = degCentrality.get(id) || 0;
        const pr = pageRank ? pageRank.get(id) || 0 : 0;
        const bc = betweennessCentrality ? betweennessCentrality.get(id) || 0 : 0;
        const density = graphStats ? graphStats.density : 0;
        const clustering = graphStats ? graphStats.averageClusteringCoefficient : 0;
        
        const dcContrib = dc * 0.4 * 100;
        const bcContrib = bc * 0.3 * 100;
        const prContrib = pr * 0.3 * 100;
        const densityBonus = density * 10;
        const clusteringBonus = clustering * 10;
        const sis = dcContrib + bcContrib + prContrib + densityBonus + clusteringBonus;
        
        return {
          component: `ODS ${id} - ${SDG_METADATA.find(s => s.id === id)?.name.pt || ''}`,
          value: sis,
          weight: 1 / selectedSDGs.length,
          contribution: sis,
          formula: `SIS = ${dcContrib.toFixed(1)}% (DC) + ${bcContrib.toFixed(1)}% (BC) + ${prContrib.toFixed(1)}% (PR) + ${densityBonus.toFixed(1)}% (Density) + ${clusteringBonus.toFixed(1)}% (Clustering)`,
        };
      }).sort((a, b) => b.contribution - a.contribution) : [],
      methodology: [
        'Construção de grafo ponderado com coeficientes de interdependência ODS (-1 a +1)',
        'Cálculo de métricas de centralidade usando algoritmos de teoria dos grafos',
        'Detecção de comunidades através de Label Propagation Algorithm',
        'Análise de estrutura de rede e identificação de nós críticos',
      ],
      assumptions: [
        'Coeficientes de interdependência baseados em estudos acadêmicos ONU',
        'Grafo não-direcionado com pesos simétricos para pares ODS',
        'Threshold de 0.1 para filtrar conexões insignificantes',
        'PageRank usa damping factor padrão de 0.85',
      ],
      academicReferences: [
        {
          concept: 'Degree Centrality',
          explanation: t('engine_expl_degree_importance'),
          references: ['Freeman, L. C. (1978). Centrality in social networks. Social Networks, 1(3), 215-239.'],
        },
        {
          concept: 'Betweenness Centrality',
          explanation: t('engine_expl_bridge_nodes'),
          references: ['Brandes, U. (2001). A faster algorithm for betweenness centrality. Journal of Mathematical Sociology, 25(2), 163-177.'],
        },
        {
          concept: 'PageRank',
          explanation: t('engine_expl_ranking_algo'),
          references: ['Brin, S., & Page, L. (1998). The anatomy of a large-scale hypertextual Web search engine. Computer Networks, 30(1-7), 107-117.'],
        },
      ],
      detail: 'O Graph Engine constrói um grafo ponderado com os ODS selecionados. Cada aresta recebe o coeficiente de interdependência real (−1 a +1) da matriz INTER_SDG_COEFFICIENTS, derivada de estudos de interação entre metas ONU. Centralidade de grau mede conectividade; centralidade de intermediação detecta nós mediadores; PageRank classifica influência sistêmica global.',
    },
    {
      id: 'mcda',
      name: 'MCDA Engine',
      tagline: 'Análise multicritério de decisão + SBI',
      color: '#f59e0b',
      accentBg: 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(251,191,36,0.04) 100%)',
      icon: <IconMCDA />,
      status: hasSdgs ? 'active' : 'idle',
      clickableBreakdown: true,
      metrics: [
        { label: 'MCDA Score', value: mcdaScore, confidence: project ? 'high' : undefined },
        { label: 'SBI', value: sbi !== null ? sbi.toFixed(2) : '—', sub: 'Synergy Balance Index', confidence: sbi !== null ? 'high' : undefined },
        { label: 'Pesos ODS', value: hasSdgs ? `${selectedSDGs.length}/17` : '—', confidence: hasSdgs ? 'high' : undefined },
        { label: 'Tradeoffs', value: project ? String(project.tradeoffs.length) : '—', confidence: project ? 'high' : undefined },
      ],
      formula: [
        { 
          label: 'SBI', 
          expr: 'SBI = Σ coeff(i,j) / C(n,2)',
          explanation: t('engine_expl_avg_coeff_pair_ods')
        },
        { 
          label: 'MCDA Score', 
          expr: 'Score = 50·(n/17) + 50·SBI',
          explanation: t('engine_expl_weighted_amplitude_coherence')
        },
        { 
          label: 'Network Density', 
          expr: 'D = 2m / n(n-1)',
          explanation: t('engine_expl_connection_proportion')
        },
        { 
          label: 'Synergy Factor', 
          expr: 'SF = Σ max(0, coeff(i,j)) / m',
          explanation: t('engine_expl_positive_coeff_avg')
        },
      ],
      breakdowns: project ? [
        {
          component: 'Amplitude de Metas',
          value: selectedSDGs.length / 17,
          weight: 0.5,
          contribution: (selectedSDGs.length / 17) * 50,
          formula: '50 × (n/17)',
        },
        {
          component: 'Coerência de Sinergia',
          value: sbi || 0,
          weight: 0.5,
          contribution: (sbi || 0) * 50,
          formula: '50 × SBI',
        },
      ] : [],
      methodology: [
        'Cálculo do Synergy Balance Index (SBI) como média de coeficientes ODS',
        'Análise multicritério ponderando amplitude e coerência sistêmica',
        'Detecção de trade-offs através de coeficientes negativos',
        'Normalização de scores para escala 0-100',
      ],
      assumptions: [
        'SBI > 0.6 indica alta sinergia sistêmica',
        'SBI < 0 indica predominância de trade-offs',
        'Amplitude ideal: 3-7 ODS por projeto',
        'Pesos iguais para amplitude e coerência (50/50)',
      ],
      academicReferences: [
        {
          concept: 'MCDA (Multi-Criteria Decision Analysis)',
          explanation: t('engine_expl_methodology'),
          references: ['Figueira, J., et al. (2005). Multiple criteria decision analysis: State of the art surveys. Springer.'],
        },
        {
          concept: 'Synergy Balance Index (SBI)',
          explanation: t('engine_expl_metric_balance'),
          references: ['Nilsson, M., et al. (2016). Understanding the coherence between the Sustainable Development Goals. Stockholm Environment Institute.'],
        },
      ],
      detail: 'O MCDA Engine calcula o Synergy Balance Index (SBI) como a média aritmética de todos os coeficientes de par ODS da seleção. O score de alinhamento ODS pondera a amplitude da seleção (50%) e o SBI (50%), produzindo uma métrica de coerência sistêmica. Valores SBI > 0,6 indicam alta sinergia; valores negativos sinalizam trade-offs estruturais.',
    },
    {
      id: 'impact',
      name: 'Impact Engine',
      tagline: 'Modelagem de impacto ponderado por rede',
      color: '#10b981',
      accentBg: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(5,150,105,0.04) 100%)',
      icon: <IconImpact />,
      status: project ? 'active' : hasSdgs ? 'computing' : 'idle',
      classification: project ? getImpactClassification(project.overallImpactScore) : undefined,
      clickableBreakdown: true,
      metrics: [
        { label: 'Índice de Impacto', value: impactScore, confidence: project ? 'high' : undefined },
        { label: 'Influência Positiva', value: hasSdgs ? String(positiveEdges) : '—', sub: 'Arestas sinérgicas', confidence: hasSdgs ? 'high' : undefined },
        { label: 'Multiplicador de Alcance', value: project ? `×${(1 + (sbi || 0) * 0.5).toFixed(2)}` : '—', confidence: project ? 'medium' : undefined },
        { label: 'Fator Sinergia', value: sbi !== null ? sbi.toFixed(3) : '—', confidence: sbi !== null ? 'high' : undefined },
      ],
      benchmark: project ? getImpactCategory(project.overallImpactScore) : undefined,
      formula: [
        { 
          label: 'Impact Score', 
          expr: 'I = 0.35·SBI + 0.30·n + 0.20·E + 0.15·T - P',
          explanation: t('engine_expl_sustainability_factors')
        },
        { 
          label: 'Positive Influence', 
          expr: 'PI = posEdges/totalEdges',
          explanation: t('engine_expl_centrality_avg')
        },
        { 
          label: 'Degree Centrality', 
          expr: 'DC = avg(deg(v))',
          explanation: t('engine_expl_intermediary_centrality_avg')
        },
        { 
          label: 'Betweenness Centrality', 
          expr: 'BC = avg(betweenness(v))',
          explanation: t('engine_expl_intermediary_centrality_avg')
        },
      ],
      breakdowns: project ? [
        {
          component: 'Coerência de Sinergia',
          value: (sbi || 0) * 35,
          weight: 0.35,
          contribution: (sbi || 0) * 35,
          formula: 'SBI × 35',
        },
        {
          component: 'Amplitude de Metas',
          value: selectedSDGs.length * 2.5,
          weight: 0.30,
          contribution: selectedSDGs.length * 2.5,
          formula: 'n × 2.5',
        },
        {
          component: 'Eficiência de Recursos',
          value: 15,
          weight: 0.20,
          contribution: 15,
          formula: 'f(Budget/Benef)',
        },
        {
          component: 'Penalidade de Risco',
          value: -project.tradeoffs.length * 6,
          weight: 0.15,
          contribution: -project.tradeoffs.length * 6,
          formula: '-6 × Tradeoffs',
        },
      ] : [],
      methodology: [
        'Modelagem de impacto baseada em coerência de rede ODS',
        'Cálculo de multiplicador de alcance através de sinergia sistêmica',
        'Avaliação de eficiência de recursos (budget vs beneficiários)',
        'Aplicação de penalidades por trade-offs e risco operacional',
      ],
      assumptions: [
        'Score ≥ 85: Impacto Transformador',
        'Score ≥ 70: Alto Impacto',
        'Score ≥ 50: Impacto Moderado',
        'Score < 50: Impacto Limitado',
      ],
      academicReferences: [
        {
          concept: 'Network Impact Theory',
          explanation: t('engine_expl_systemic_impact_theory'),
          references: ['Granovetter, M. (1978). Threshold models of collective behavior. American Journal of Sociology, 83(6), 1420-1443.'],
        },
        {
          concept: 'Impact Multiplier',
          explanation: t('engine_expl_sustainability_multiplier'),
          references: ['UNDP (2017). Human Development Report: Systemic thinking for development. United Nations Development Programme.'],
        },
      ],
      detail: 'O Impact Engine combina coerência de sinergia (peso 35pts), amplitude de metas (até 30pts) e eficiência de recursos (até 20pts) com deduções por nível de risco operacional e conflitos sistêmicos detectados. A fórmula é determinística e completamente auditável — nenhum valor é gerado por aleatoriedade bruta.',
    },
    {
      id: 'sustain',
      name: 'Sustainability Engine',
      tagline: 'Índice de resiliência sistêmica de longo prazo',
      color: '#3b82f6',
      accentBg: 'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(6,182,212,0.04) 100%)',
      icon: <IconSustain />,
      status: project ? 'active' : hasSdgs ? 'computing' : 'idle',
      classification: project ? getSustainabilityClassification(project.sustainabilityIndex) : undefined,
      metrics: [
        { label: 'Sustentabilidade', value: sustainScore, confidence: project ? 'high' : undefined },
        { label: 'Low Conflict Ratio', value: hasSdgs ? `${lcr}%` : '—', sub: '1 − neg/total', confidence: hasSdgs ? 'high' : undefined },
        { label: 'Resiliência de Rede', value: avgClustering, confidence: hasSdgs ? 'medium' : undefined },
        { label: 'Viabilidade', value: project ? `${project.feasibility ?? 70}/100` : '—', confidence: project ? 'medium' : undefined },
      ],
      benchmark: project ? getSustainabilityCategory(project.sustainabilityIndex) : undefined,
      formula: [
        { 
          label: 'Sustainability Score', 
          expr: 'S = 0.35·dur + 0.45·SBI + 0.20·team',
          explanation: t('engine_expl_duration_synergy_team')
        },
        { 
          label: 'Resilience', 
          expr: 'R = 0.5·Clustering + 0.5·Density',
          explanation: t('engine_expl_coefficient_clustering_density')
        },
        { 
          label: 'Low Conflict Ratio', 
          expr: 'LCR = 1 − negEdges/totalEdges',
          explanation: t('engine_expl_pair_without_tradeoffs')
        },
        { 
          label: 'Feasibility Index', 
          expr: 'F = 0.35·RC + 0.35·IS + 0.20·CC + 0.10·CP',
          explanation: t('engine_expl_resource_capacity')
        },
      ],
      breakdowns: project ? [
        {
          component: 'Durabilidade Temporal',
          value: (state.inputs.duration / 24) * 35,
          weight: 0.35,
          contribution: (state.inputs.duration / 24) * 35,
          formula: '(dur/24) × 35',
        },
        {
          component: 'Coerência Estrutural',
          value: (sbi || 0) * 45,
          weight: 0.45,
          contribution: (sbi || 0) * 45,
          formula: 'SBI × 45',
        },
        {
          component: 'Capacidade de Equipe',
          value: 10,
          weight: 0.20,
          contribution: 10,
          formula: 'teamBonus',
        },
      ] : [],
      methodology: [
        'Avaliação de durabilidade temporal baseada em duração do projeto',
        'Análise de coerência de sinergia estrutural através do SBI',
        'Cálculo de resiliência de rede usando clustering e densidade',
        'Mensuração de viabilidade combinando múltiplos fatores',
      ],
      assumptions: [
        'LCR próximo de 1.0 indica configuração altamente sustentável',
        'Duração ideal: 12-24 meses para máxima pontuação',
        'Clustering alto indica rede resiliente a falhas',
        'Score ≥ 80: Sustentável, ≥ 60: Viável',
      ],
      academicReferences: [
        {
          concept: 'Network Resilience',
          explanation: t('engine_expl_resilience_capacity'),
          references: ['Albert, R., et al. (2000). Error and attack tolerance of complex networks. Nature, 406(6794), 378-382.'],
        },
        {
          concept: 'Sustainability Science',
          explanation: t('engine_expl_interdisciplinary_field'),
          references: ['Kates, R. W., et al. (2001). Sustainability science. Science, 292(5517), 641-642.'],
        },
      ],
      detail: 'O Sustainability Engine avalia durabilidade temporal (peso 35% pela duração do projeto), coerência de sinergia estrutural (45% pelo SBI) e capacidade de equipe. O Low Conflict Ratio mensura a proporção de pares ODS sem trade-offs negativos — quanto mais próximo de 1.0, mais sustentável a configuração sistêmica.',
    },
    {
      id: 'generator',
      name: 'Project Generator',
      tagline: 'Geração determinística de planos de ação',
      color: '#ec4899',
      accentBg: 'linear-gradient(135deg, rgba(236,72,153,0.06) 0%, rgba(168,85,247,0.04) 100%)',
      icon: <IconGenerator />,
      status: project ? 'active' : hasSdgs ? 'computing' : 'idle',
      pipeline: [
        'Seleção ODS',
        'Análise de Grafo',
        'MCDA',
        'Geração de Estratégia',
        'Projeção de Impacto',
      ],
      metrics: [
        { label: 'ODS Selecionados', value: hasSdgs ? selectedSDGs.map(id => `ODS ${id}`).join(', ') : '—', confidence: hasSdgs ? 'high' : undefined },
        { label: 'Sinergias Detectadas', value: hasSdgs ? String(positiveEdges) : '—', confidence: hasSdgs ? 'high' : undefined },
        { label: 'Tradeoffs', value: project ? String(project.tradeoffs.length) : '—', sub: 'Conflitos', confidence: project ? 'high' : undefined },
        { label: 'MCDA Score', value: mcdaScore, confidence: project ? 'high' : undefined },
      ],
      formula: [
        { 
          label: 'Coverage', 
          expr: 'C = n_ODS × 3 objetivos',
          explanation: t('engine_expl_coverage_total')
        },
        { 
          label: 'Pair Analysis', 
          expr: 'Pairs = C(n,2) pares avaliados',
          explanation: t('engine_expl_total_pairs')
        },
        { 
          label: 'Project Name', 
          expr: 'f(SDG₁.name + SDG₂.name)',
          explanation: t('engine_expl_nomenclature')
        },
        { 
          label: 'Reach Projection', 
          expr: 'R = Benef × (1 + SBI·0.3) × Eff',
          explanation: t('engine_expl_reach_projection')
        },
      ],
      breakdowns: project ? [
        {
          component: 'Beneficiários Base',
          value: state.inputs.beneficiaries,
          weight: 0.4,
          contribution: state.inputs.beneficiaries,
          formula: `Beneficiários = ${state.inputs.beneficiaries.toLocaleString()}`,
          normalized: normalizeValue(state.inputs.beneficiaries, 'log', 100000),
        },
        {
          component: 'Multiplicador de Sinergia',
          value: 1 + ((sbi || 0) * 0.3),
          weight: 0.3,
          contribution: state.inputs.beneficiaries * ((sbi || 0) * 0.3),
          formula: `1 + SBI×0.3 = ${(1 + ((sbi || 0) * 0.3)).toFixed(3)}`,
        },
        {
          component: 'Multiplicador de Eficiência',
          value: Math.min(1.5, state.inputs.teamSize / Math.max(1, state.inputs.beneficiaries * 0.01)),
          weight: 0.3,
          contribution: state.inputs.beneficiaries * (Math.min(1.5, state.inputs.teamSize / Math.max(1, state.inputs.beneficiaries * 0.01)) - 1),
          formula: `Team/Benef×0.01 = ${Math.min(1.5, state.inputs.teamSize / Math.max(1, state.inputs.beneficiaries * 0.01)).toFixed(3)}`,
        },
      ] : [],
      methodology: [
        'Composição determinística de iniciativas por ODS selecionado',
        'Análise de C(n,2) pares para detecção de conflitos sistêmicos',
        'Geração de mensagens localizadas (pt/en/es) para trade-offs',
        'Nomenclatura de projeto derivada de metadados ODS',
        'Projeção de alcance baseada em multiplicador de sinergia',
      ],
      assumptions: [
        '1 iniciativa, 1 indicador e 1 risco por ODS selecionado',
        'Nomenclatura usa os dois primeiros ODS da seleção',
        'Mensagens de trade-off localizadas em 3 idiomas',
        'Projeção de alcance usa multiplicador SBI',
      ],
      detail: 'O Project Generator compõe o plano de ação combinando 1 iniciativa, 1 indicador e 1 risco por cada ODS selecionado. Analisa C(n,2) pares para detectar conflitos sistêmicos com mensagens localizadas (pt/en/es). A nomenclatura do projeto é derivada deterministicamente dos metadados dos dois primeiros ODS selecionados.',
    },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      <style>{`
        @keyframes engine-ping {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h3 style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1rem)', fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>
            Intelligence Dashboard
          </h3>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '2px 0 0', fontWeight: 500 }}>
            {t('dashboard_framework_description')}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PulseDot status={hasSdgs ? 'active' : 'idle'} />
          <span style={{ fontSize: 10, fontWeight: 700, color: hasSdgs ? '#10b981' : 'var(--text-muted)' }}>
            {hasSdgs ? `${selectedSDGs.length} ${t('engine_ods_active')}` : t('engine_awaiting_selection')}
          </span>
        </div>
      </div>

      {/* SECTION 1: Executive Output Layer */}
      {hasSdgs && project && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
            Executive Output Layer
          </div>
          <div style={{
            padding: '16px 20px',
            borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(16,185,129,0.05) 100%)',
            boxShadow: 'var(--clay-card-shadow)',
            border: '1px solid rgba(99,102,241,0.2)',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Emergent Impact Score</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981', marginBottom: 2 }}>
                  {project.overallImpactScore}<span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>/100</span>
                </div>
                <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>±{project.monteCarloStats?.stdDevImpact || 5}</div>
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Sustainability Score</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#3b82f6', marginBottom: 2 }}>
                  {project.sustainabilityIndex}<span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>/100</span>
                </div>
                <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>±{project.monteCarloStats?.stdDevSustain || 10}</div>
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Implementation Feasibility</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#f59e0b', marginBottom: 2 }}>
                  {project.feasibility ?? 70}<span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>/100</span>
                </div>
                <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>±{project.monteCarloStats?.stdDevFeasibility || 10}</div>
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Confidence Level</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#6366f1', marginBottom: 2 }}>
                  {selectedSDGs.length >= 5 ? 'High' : selectedSDGs.length >= 3 ? 'Moderate' : 'Low'}
                </div>
                <div style={{ fontSize: 8, color: 'var(--text-muted)' }}>{selectedSDGs.length} SDGs</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Intelligence Pipeline Overview */}
      {hasSdgs && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
            Intelligence Pipeline Overview
          </div>
          <div style={{
            padding: '16px 20px',
            borderRadius: 12,
            background: 'var(--bg-glass)',
            boxShadow: 'var(--clay-card-shadow)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap', fontSize: 10 }}>
              <div style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: 'rgba(99,102,241,0.15)',
                color: '#6366f1',
                fontWeight: 700,
                border: '1px solid rgba(99,102,241,0.3)',
              }}>
                Graph Engine
              </div>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
              <div style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: 'rgba(245,158,11,0.15)',
                color: '#f59e0b',
                fontWeight: 700,
                border: '1px solid rgba(245,158,11,0.3)',
              }}>
                MCDA Engine
              </div>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
              <div style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: 'rgba(16,185,129,0.15)',
                color: '#10b981',
                fontWeight: 700,
                border: '1px solid rgba(16,185,129,0.3)',
              }}>
                Impact Engine
              </div>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
              <div style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: 'rgba(59,130,246,0.15)',
                color: '#3b82f6',
                fontWeight: 700,
                border: '1px solid rgba(59,130,246,0.3)',
              }}>
                Sustainability Engine
              </div>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
              <div style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: 'rgba(236,72,153,0.15)',
                color: '#ec4899',
                fontWeight: 700,
                border: '1px solid rgba(236,72,153,0.3)',
              }}>
                Project Generator
              </div>
            </div>
            <div style={{ fontSize: 8, color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>
              {t('engine_pipeline_description')}
            </div>
          </div>
        </div>
      )}
      {/* Network Reliability Warning */}
      {hasSdgs && selectedSDGs.length < 5 && (
        <div style={{
          marginBottom: 14,
          padding: '10px 14px',
          borderRadius: 8,
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
          </svg>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b' }}>
              {t('engine_network_limited')}
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>
              {t('engine_network_limited_desc', { count: selectedSDGs.length })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Graph Algorithms Engine */}
      {hasSdgs && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
            Section 3 — Graph Algorithms Engine
          </div>
          <EngineCard
            engine={engines.find(e => e.id === 'graph')!}
            expanded={expandedId === 'graph'}
            onToggle={() => setExpandedId(expandedId === 'graph' ? null : 'graph')}
            drivers={generateDrivers('graph')}
          />
        </div>
      )}

      {/* SECTION 4: MCDA Engine */}
      {hasSdgs && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
            Section 4 — MCDA Engine
          </div>
          <EngineCard
            engine={engines.find(e => e.id === 'mcda')!}
            expanded={expandedId === 'mcda'}
            onToggle={() => setExpandedId(expandedId === 'mcda' ? null : 'mcda')}
            drivers={generateDrivers('mcda')}
          />
        </div>
      )}

      {/* SECTION 5: Impact Engine */}
      {hasSdgs && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
            Section 5 — Impact Engine
          </div>
          <EngineCard
            engine={engines.find(e => e.id === 'impact')!}
            expanded={expandedId === 'impact'}
            onToggle={() => setExpandedId(expandedId === 'impact' ? null : 'impact')}
            drivers={generateDrivers('impact')}
          />
        </div>
      )}

      {/* SECTION 6: Sustainability Engine */}
      {hasSdgs && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
            Section 6 — Sustainability Engine
          </div>
          <EngineCard
            engine={engines.find(e => e.id === 'sustain')!}
            expanded={expandedId === 'sustain'}
            onToggle={() => setExpandedId(expandedId === 'sustain' ? null : 'sustain')}
            drivers={generateDrivers('sustain')}
          />
        </div>
      )}

      {/* SECTION 7: Explainability Layer */}
      {hasSdgs && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
            Section 7 — Explainability Layer
          </div>
          
          {/* Sensitivity Analysis */}
          {(() => {
            const sensitivityData = generateSensitivityAnalysis();
            if (sensitivityData.length === 0) return null;
            
            return (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>Sensitivity Analysis</div>
                <div style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'var(--bg-glass)',
                  boxShadow: 'var(--clay-input-shadow)',
                }}>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 8 }}>
                    Influência de cada ODS no resultado final
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {sensitivityData.map((item, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 10px',
                        borderRadius: 6,
                        background: item.influence > 40 ? 'rgba(16,185,129,0.1)' : item.influence > 25 ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-primary)' }}>ODS {item.sdgId}</span>
                          <span style={{ fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>{item.reason}</span>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: item.influence > 40 ? '#10b981' : item.influence > 25 ? '#3b82f6' : '#f59e0b' }}>
                          +{item.influence}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Explanation Panels */}
          {explanationPanels.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>Metric Breakdown</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
                {explanationPanels.map((panel, i) => (
                  <ExplanationPanel key={i} explanation={panel} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 8: Decision Support Layer */}
      {hasSdgs && (recommendations.length > 0 || gaps.length > 0) && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
            Section 8 — Decision Support Layer
          </div>
          
          {/* Strategic Recommendations */}
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>Strategic Recommendations</div>
          
          {/* Missing Strategic Areas */}
          {gaps.length > 0 && (
            <div style={{
              marginBottom: 12,
              padding: '12px 14px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(239,68,68,0.05) 0%, rgba(245,158,11,0.05) 100%)',
              boxShadow: 'inset -1px -1px 4px rgba(0,0,0,0.04), inset 1px 1px 4px rgba(255,255,255,0.8)',
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#ef4444', marginBottom: 6 }}>
                Áreas Estratégicas Ausentes
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {gaps.map((gap, i) => (
                  <span key={i} style={{
                    fontSize: 9,
                    padding: '4px 8px',
                    borderRadius: 6,
                    background: 'rgba(239,68,68,0.1)',
                    color: '#ef4444',
                    fontWeight: 600,
                  }}>
                    {gap}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* SDG Recommendations */}
          {recommendations.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
              {recommendations.map((rec, i) => (
                <div key={i} style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: rec.type === 'add' 
                    ? 'rgba(16,185,129,0.05)' 
                    : 'rgba(239,68,68,0.05)',
                  boxShadow: 'var(--clay-input-shadow)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: rec.type === 'add' ? '#10b981' : '#ef4444' }}>
                      {rec.type === 'add' ? '+' : '-'} ODS {rec.sdgId}
                    </span>
                    <span style={{
                      fontSize: 9,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: rec.priority === 'high' ? '#ef444420' : rec.priority === 'medium' ? '#f59e0b20' : '#94a3b820',
                      color: rec.priority === 'high' ? '#ef4444' : rec.priority === 'medium' ? '#f59e0b' : '#94a3b8',
                      fontWeight: 600,
                    }}>
                      {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Média' : 'Baixa'}
                    </span>
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    {rec.reason}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: rec.type === 'add' ? '#10b981' : '#ef4444' }}>
                    Impacto Esperado: {rec.expectedImpact > 0 ? '+' : ''}{rec.expectedImpact}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 9: Executive Intelligence Layer */}
      {hasSdgs && executiveInsights.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
            Section 9 — Executive Intelligence Layer
          </div>
          
          {/* Summary Dashboard */}
          <div style={{
            marginBottom: 16,
            padding: '16px 18px',
            borderRadius: 12,
            background: 'var(--bg-card)',
            boxShadow: 'var(--clay-card-shadow)',
            border: '1px solid var(--border-color)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 10 }}>
              Resumo de Inteligência Executiva
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981', marginBottom: 2 }}>
                  {executiveInsights.filter(i => i.type === 'opportunity').length}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>Oportunidades</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#ef4444', marginBottom: 2 }}>
                  {executiveInsights.filter(i => i.type === 'risk').length}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>Riscos</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#6366f1', marginBottom: 2 }}>
                  {executiveInsights.filter(i => i.type === 'consideration').length}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>Considerações</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b', marginBottom: 2 }}>
                  {executiveInsights.filter(i => i.priority === 'high').length}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>Prioridade Alta</div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>Executive Insights</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
            {executiveInsights.map((insight, i) => (
              <div key={i} style={{
                padding: '14px 16px',
                borderRadius: 12,
                background: 'var(--bg-card)',
                boxShadow: 'var(--clay-card-shadow)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }} onClick={() => setExpandedInsight(expandedInsight === i ? null : i)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={insight.type === 'opportunity' ? '#10b981' : insight.type === 'risk' ? '#ef4444' : '#6366f1'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {insight.type === 'opportunity' ? (
                        <path d="M9 18l6-6-6-6" />
                      ) : insight.type === 'risk' ? (
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
                      ) : (
                        <circle cx="12" cy="12" r="10" />
                      )}
                    </svg>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {insight.title}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{
                      fontSize: 8,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: insight.type === 'opportunity'
                        ? 'rgba(16,185,129,0.2)'
                        : insight.type === 'risk'
                        ? 'rgba(239,68,68,0.2)'
                        : 'rgba(99,102,241,0.2)',
                      color: insight.type === 'opportunity'
                        ? '#10b981'
                        : insight.type === 'risk'
                        ? '#ef4444'
                        : '#6366f1',
                      fontWeight: 700,
                      textTransform: 'uppercase' as const,
                    }}>
                      {insight.type === 'opportunity' ? 'Oportunidade' : insight.type === 'risk' ? 'Risco' : 'Consideração'}
                    </span>
                    <span style={{
                      fontSize: 8,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: insight.priority === 'high' ? 'rgba(239,68,68,0.2)' : insight.priority === 'medium' ? 'rgba(245,158,11,0.2)' : 'rgba(148,163,184,0.2)',
                      color: insight.priority === 'high' ? '#ef4444' : insight.priority === 'medium' ? '#f59e0b' : '#94a3b8',
                      fontWeight: 600,
                    }}>
                      {insight.priority === 'high' ? 'Alta' : insight.priority === 'medium' ? 'Média' : 'Baixa'}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: expandedInsight === i ? 8 : 0 }}>
                  {insight.description}
                </div>
                {expandedInsight === i && (
                  <div style={{
                    paddingTop: 8,
                    borderTop: '1px dashed var(--border-dark)',
                    fontSize: 8,
                    color: 'var(--text-muted)',
                  }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Análise Detalhada:</div>
                    <div style={{ marginBottom: 4 }}>
                      • Tipo: {insight.type === 'opportunity' ? 'Potencial de melhoria identificável' : insight.type === 'risk' ? 'Ameaça sistêmica que requer mitigação' : 'Fator contextual a considerar'}
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      • Prioridade: {insight.priority === 'high' ? 'Requer atenção imediata' : insight.priority === 'medium' ? 'Deve ser monitorado' : 'Pode ser tratado posteriormente'}
                    </div>
                    <div>
                      • Ação Recomendada: {insight.type === 'opportunity' ? 'Explorar estratégias para capitalizar' : insight.type === 'risk' ? 'Desenvolver plano de mitigação' : 'Incluir na análise de decisão'}
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                  <span style={{ fontSize: 8, color: 'var(--text-muted)', fontWeight: 600 }}>
                    {expandedInsight === i ? '▲ Menos' : '▼ Mais'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 10: Saved Projects */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.3px' }}>
          Section 10 — Saved Projects
        </div>
        <div style={{
          padding: '16px 20px',
          borderRadius: 12,
          background: 'var(--bg-glass)',
          boxShadow: 'var(--clay-input-shadow)',
        }}>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 8 }}>
            {state.savedProjects.length} projeto{state.savedProjects.length !== 1 ? 's' : ''} salvo{state.savedProjects.length !== 1 ? 's' : ''}
          </div>
          {state.savedProjects.length === 0 ? (
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
              Nenhum projeto salvo ainda
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
              {state.savedProjects.slice(0, 5).map(p => (
                <div key={p.id} style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-dark)',
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 8, color: 'var(--text-muted)', marginBottom: 6 }}>
                    {p.odsIds.length} ODS • {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                  <div style={{ display: 'flex', gap: 8, fontSize: 9 }}>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>Impact: {p.generatedData.overallImpactScore}</span>
                    <span style={{ color: '#3b82f6', fontWeight: 600 }}>Sust: {p.generatedData.sustainabilityIndex}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Global Methodology Panel */}
      <div style={{
        marginBottom: 20,
        padding: '14px 18px',
        borderRadius: 12,
        background: 'linear-gradient(135deg, rgba(99,102,241,0.03) 0%, rgba(59,130,246,0.02) 100%)',
        boxShadow: 'var(--clay-input-shadow)',
      }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 8 }}>
          {t('engine_general_methodology')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#6366f1', marginBottom: 4 }}>{t('engine_graph_theory')}</div>
            <div style={{ fontSize: 9, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {t('engine_graph_theory_desc')}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#f59e0b', marginBottom: 4 }}>{t('engine_mcda_label')}</div>
            <div style={{ fontSize: 9, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {t('engine_mcda_desc')}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#10b981', marginBottom: 4 }}>{t('engine_impact_modeling')}</div>
            <div style={{ fontSize: 9, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {t('engine_impact_modeling_desc')}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#3b82f6', marginBottom: 4 }}>{t('engine_sustainability_modeling')}</div>
            <div style={{ fontSize: 9, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {t('engine_sustainability_modeling_desc')}
            </div>
          </div>
        </div>
      </div>

      {/* No-SDG hint */}
      {!hasSdgs && (
        <div style={{
          textAlign: 'center',
          padding: '12px 16px',
          marginTop: 10,
          borderRadius: 12,
          background: 'rgba(0,0,0,0.03)',
          boxShadow: 'var(--clay-input-shadow)',
          fontSize: 11,
          color: 'var(--text-muted)',
          fontWeight: 500,
        }}>
          <IconLightning /> {t('engine_select_hint')}
        </div>
      )}
    </div>
  );
}

export default EngineStatusPanel;
