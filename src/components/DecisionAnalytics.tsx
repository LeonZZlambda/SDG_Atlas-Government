import type { Initiative, InitiativeScores, KPIDashboard, SystemicRiskReport, TradeoffAnalysis, CivicInsightReport } from '../types/initiative';
import { ScoreBreakdown } from './ScoreBreakdown';
import { ScoreExplanation } from './ScoreExplanation';

interface DecisionAnalyticsProps {
  initiative: Initiative;
  scores: InitiativeScores;
  kpiDashboard: KPIDashboard;
  systemicRiskReport: SystemicRiskReport;
  tradeoffAnalysis: TradeoffAnalysis;
  civicInsights: CivicInsightReport;
}

export function DecisionAnalytics({
  initiative,
  scores,
  kpiDashboard,
  systemicRiskReport,
  tradeoffAnalysis,
  civicInsights
}: DecisionAnalyticsProps) {
  return (
    <div className="decision-analytics-container">
      {/* Decision Header */}
      <div className="decision-header">
        <h2 style={{ fontSize: 'clamp(1.25rem, 2vw, 1.5rem)', marginBottom: '8px' }}>
          Decision Analytics: {initiative.name}
        </h2>
        <p style={{ fontSize: 'clamp(0.9rem, 1.2vw, 0.95rem)', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Data-driven insights for informed decision-making
        </p>
      </div>

      {/* Overall Decision Score */}
      <div className="clay-card decision-score-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
            Overall Decision Score
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              fontSize: 'clamp(28px, 5vw, 36px)', 
              fontWeight: 800, 
              color: scores.overall >= 70 ? '#10b981' : scores.overall >= 50 ? '#f59e0b' : '#ef4444',
              fontFamily: 'var(--font-heading)'
            }}>
              {scores.overall.toFixed(1)}
            </span>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/100</span>
          </div>
        </div>
        
        <div style={{ 
          width: '100%', 
          height: '12px', 
          borderRadius: '6px', 
          background: 'var(--bg-tertiary)', 
          overflow: 'hidden',
          marginBottom: '16px'
        }}>
          <div style={{
            width: `${scores.overall}%`,
            height: '100%',
            background: scores.overall >= 70 ? 'linear-gradient(90deg, #10b981, #059669)' : scores.overall >= 50 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #ef4444, #dc2626)',
            borderRadius: '6px',
            transition: 'width 0.3s ease'
          }} />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ 
            fontSize: '12px', 
            padding: '4px 12px', 
            borderRadius: '12px',
            background: scores.impact >= 70 ? 'rgba(16, 185, 129, 0.1)' : scores.impact >= 50 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: scores.impact >= 70 ? '#10b981' : scores.impact >= 50 ? '#f59e0b' : '#ef4444',
            fontWeight: 600
          }}>
            Impact: {scores.impact.toFixed(1)}
          </span>
          <span style={{ 
            fontSize: '12px', 
            padding: '4px 12px', 
            borderRadius: '12px',
            background: scores.sustainability >= 70 ? 'rgba(16, 185, 129, 0.1)' : scores.sustainability >= 50 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: scores.sustainability >= 70 ? '#10b981' : scores.sustainability >= 50 ? '#f59e0b' : '#ef4444',
            fontWeight: 600
          }}>
            Sustainability: {scores.sustainability.toFixed(1)}
          </span>
          <span style={{ 
            fontSize: '12px', 
            padding: '4px 12px', 
            borderRadius: '12px',
            background: scores.feasibility >= 70 ? 'rgba(16, 185, 129, 0.1)' : scores.feasibility >= 50 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: scores.feasibility >= 70 ? '#10b981' : scores.feasibility >= 50 ? '#f59e0b' : '#ef4444',
            fontWeight: 600
          }}>
            Feasibility: {scores.feasibility.toFixed(1)}
          </span>
          <span style={{ 
            fontSize: '12px', 
            padding: '4px 12px', 
            borderRadius: '12px',
            background: scores.sdgAlignment >= 70 ? 'rgba(16, 185, 129, 0.1)' : scores.sdgAlignment >= 50 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: scores.sdgAlignment >= 70 ? '#10b981' : scores.sdgAlignment >= 50 ? '#f59e0b' : '#ef4444',
            fontWeight: 600
          }}>
            SDG Alignment: {scores.sdgAlignment.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Decision Recommendations */}
      <div className="clay-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', paddingBottom: '12px', boxShadow: 'inset 0 -1px 0 var(--border-dark)' }}>
          Decision Recommendation
        </h3>
        <div style={{ 
          padding: '16px', 
          borderRadius: '12px', 
          background: civicInsights.overallRecommendation.includes('CRITICAL') ? 'rgba(239, 68, 68, 0.08)' : 
                     civicInsights.overallRecommendation.includes('CAUTION') ? 'rgba(245, 158, 11, 0.08)' : 
                     civicInsights.overallRecommendation.includes('PROCEED') ? 'rgba(16, 185, 129, 0.08)' : 
                     'rgba(99, 102, 241, 0.08)',
          marginBottom: '16px'
        }}>
          <p style={{ fontSize: '14px', fontWeight: 600, margin: 0, marginBottom: '8px' }}>
            {civicInsights.overallRecommendation}
          </p>
        </div>
        
        {civicInsights.keyOpportunities.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#10b981', marginBottom: '8px' }}>
              Key Opportunities
            </h4>
            {civicInsights.keyOpportunities.map((insight, index) => (
              <div key={index} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                padding: '10px',
                borderRadius: '8px',
                background: 'var(--bg-glass)',
                fontSize: 'clamp(9px, 1vw, 10px)',
                lineHeight: 1.3,
                marginBottom: '8px'
              }}>
                <p style={{ fontSize: '12px', margin: 0, fontWeight: 600 }}>{insight.title}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>{insight.description}</p>
              </div>
            ))}
          </div>
        )}
        
        {civicInsights.keyRisks.length > 0 && (
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#ef4444', marginBottom: '8px' }}>
              Key Risks
            </h4>
            {civicInsights.keyRisks.map((insight, index) => (
              <div key={index} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                padding: '10px',
                borderRadius: '8px',
                background: 'var(--bg-glass)',
                fontSize: 'clamp(9px, 1vw, 10px)',
                lineHeight: 1.3,
                marginBottom: '8px'
              }}>
                <p style={{ fontSize: '12px', margin: 0, fontWeight: 600 }}>{insight.title}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>{insight.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analytics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        {/* Score Breakdown */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Score Breakdown</h3>
          <ScoreBreakdown breakdown={scores.breakdowns.impact} compact />
          <ScoreBreakdown breakdown={scores.breakdowns.sustainability} compact />
          <ScoreBreakdown breakdown={scores.breakdowns.feasibility} compact />
          <ScoreBreakdown breakdown={scores.breakdowns.sdgAlignment} compact />
        </div>

        {/* KPI Dashboard */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>KPI Dashboard</h3>
          <div className="clay-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Overall Health</span>
              <span style={{ 
                fontSize: '20px', 
                fontWeight: 800,
                color: kpiDashboard.overallHealth >= 70 ? '#10b981' : kpiDashboard.overallHealth >= 50 ? '#f59e0b' : '#ef4444'
              }}>
                {kpiDashboard.overallHealth.toFixed(1)}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: kpiDashboard.trend === 'improving' ? '#10b981' : kpiDashboard.trend === 'declining' ? '#ef4444' : '#818cf8' }} />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {kpiDashboard.trend} trend
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {kpiDashboard.kpis.slice(0, 6).map((kpi, index) => (
                <div 
                  key={index} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '8px 0', 
                    boxShadow: 'inset 0 -1px 0 var(--border-dark)',
                    position: 'relative',
                    cursor: 'help'
                  }}
                  title={`${kpi.name}: ${kpi.description}. Calculation: ${kpi.calculation}. Target: ${kpi.target || 'N/A'}. Current: ${kpi.value.toFixed(1)} ${kpi.unit}.`}
                >
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 600, margin: 0 }}>{kpi.name}</p>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>{kpi.category}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>{kpi.value.toFixed(1)}</p>
                    <p style={{ fontSize: '10px', color: kpi.trend === 'up' ? '#10b981' : kpi.trend === 'down' ? '#ef4444' : '#818cf8', margin: '2px 0 0 0', textTransform: 'capitalize' }}>
                      {kpi.trend}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Analysis */}
      <div className="clay-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', paddingBottom: '12px', boxShadow: 'inset 0 -1px 0 var(--border-dark)' }}>
          Risk Analysis
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            padding: '10px',
            borderRadius: '8px',
            background: 'var(--bg-glass)',
            fontSize: 'clamp(9px, 1vw, 10px)',
            lineHeight: 1.3
          }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 8px 0' }}>Systemic Risk Score</p>
            <p style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: systemicRiskReport.overallSystemicRiskScore >= 70 ? '#ef4444' : systemicRiskReport.overallSystemicRiskScore >= 40 ? '#f59e0b' : '#10b981' }}>
              {systemicRiskReport.overallSystemicRiskScore.toFixed(1)}
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            padding: '10px',
            borderRadius: '8px',
            background: 'var(--bg-glass)',
            fontSize: 'clamp(9px, 1vw, 10px)',
            lineHeight: 1.3
          }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 8px 0' }}>Tradeoff Score</p>
            <p style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: tradeoffAnalysis.overallTradeoffScore < -30 ? '#ef4444' : tradeoffAnalysis.overallTradeoffScore > 30 ? '#10b981' : '#818cf8' }}>
              {tradeoffAnalysis.overallTradeoffScore.toFixed(1)}
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            padding: '10px',
            borderRadius: '8px',
            background: 'var(--bg-glass)',
            fontSize: 'clamp(9px, 1vw, 10px)',
            lineHeight: 1.3
          }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 8px 0' }}>Critical Risks</p>
            <p style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>
              {systemicRiskReport.risks.filter(r => r.severity === 'critical').length}
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            padding: '10px',
            borderRadius: '8px',
            background: 'var(--bg-glass)',
            fontSize: 'clamp(9px, 1vw, 10px)',
            lineHeight: 1.3
          }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 8px 0' }}>Cascading Risks</p>
            <p style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>
              {systemicRiskReport.cascadingRisks.length}
            </p>
          </div>
        </div>

        {systemicRiskReport.risks.length > 0 && (
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>Detected Risks</h4>
            {systemicRiskReport.risks.slice(0, 5).map((risk, index) => (
              <div key={index} style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                padding: '10px',
                borderRadius: '8px',
                background: 'var(--bg-glass)',
                fontSize: 'clamp(9px, 1vw, 10px)',
                lineHeight: 1.3,
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>{risk.type}</span>
                  <span style={{ 
                    fontSize: '10px', 
                    padding: '2px 8px', 
                    borderRadius: '8px',
                    background: risk.severity === 'critical' ? '#ef4444' : 
                               risk.severity === 'high' ? '#f59e0b' : 
                               '#818cf8',
                    color: '#fff',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(0,0,0,0.2), inset 1px 1px 2px rgba(255,255,255,0.2)'
                  }}>
                    {risk.severity}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{risk.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Score Explanation */}
      <ScoreExplanation scores={scores} showOverall={false} />
    </div>
  );
}
