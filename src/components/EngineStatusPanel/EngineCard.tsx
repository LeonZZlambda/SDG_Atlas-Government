import { useState } from 'react';
import { PulseDot } from './PulseDot';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { Tooltip } from './Tooltip';

export interface Engine {
  id: string;
  name: string;
  tagline: string;
  icon: any;
  color: string;
  accentBg: string;
  status: 'active' | 'idle' | 'computing';
  classification?: string;
  benchmark?: { label: string; color: string; icon: string };
  metrics: Array<{
    label: string;
    value: string;
    sub?: string;
    confidence?: 'high' | 'medium' | 'low';
  }>;
  formula?: Array<{ label: string; expr: string; explanation?: string }>;
  breakdowns?: Array<{
    component: string;
    value: number;
    weight: number;
    contribution: number;
    formula?: string;
    normalized?: { raw: number; normalized: number; method: string };
  }>;
  methodology?: string[];
  assumptions?: string[];
  detail: string;
  academicReferences?: Array<{ concept: string; explanation: string; references: string[] }>;
  pipeline?: string[];
  clickableBreakdown?: boolean;
}

interface EngineCardProps {
  engine: Engine;
  expanded: boolean;
  onToggle: () => void;
  drivers: { positive: string[]; negative: string[] };
}

export function EngineCard({ engine, expanded, onToggle, drivers }: EngineCardProps) {
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
            <EngineBreakdown 
              engine={engine} 
              expandedBreakdown={expandedBreakdown} 
              setExpandedBreakdown={setExpandedBreakdown} 
            />
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
            <AcademicReferences references={engine.academicReferences} />
          )}

          {/* Positive/Negative Drivers */}
          {(drivers.positive.length > 0 || drivers.negative.length > 0) && (
            <DriversDisplay drivers={drivers} />
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

          {/* Score breakdown (duplicate removed - using EngineBreakdown component) */}
          {engine.breakdowns && engine.breakdowns.length > 0 && (
            <EngineBreakdown 
              engine={engine} 
              expandedBreakdown={expandedBreakdown} 
              setExpandedBreakdown={setExpandedBreakdown} 
            />
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

// Sub-components for better organization

interface EngineBreakdownProps {
  engine: Engine;
  expandedBreakdown: number | null;
  setExpandedBreakdown: (value: number | null) => void;
}

function EngineBreakdown({ engine, expandedBreakdown, setExpandedBreakdown }: EngineBreakdownProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 6 }}>
        Decomposição do Score
      </div>
      {engine.breakdowns!.map((bd, i) => (
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
  );
}

interface AcademicReferencesProps {
  references: Array<{ concept: string; explanation: string; references: string[] }>;
}

function AcademicReferences({ references }: AcademicReferencesProps) {
  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-dark)' }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 8 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        Referências Acadêmicas
      </div>
      {references.map((ref, i) => (
        <div key={i} style={{ marginBottom: 8, padding: '8px 10px', borderRadius: 8, background: 'rgba(99,102,241,0.1)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', marginBottom: 4 }}>{ref.concept}</div>
          <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginBottom: 4, lineHeight: 1.5 }}>{ref.explanation}</div>
          <div style={{ fontSize: 8, color: 'var(--text-muted)', fontStyle: 'italic' }}>{ref.references.join('; ')}</div>
        </div>
      ))}
    </div>
  );
}

interface DriversDisplayProps {
  drivers: { positive: string[]; negative: string[] };
}

function DriversDisplay({ drivers }: DriversDisplayProps) {
  return (
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
  );
}
