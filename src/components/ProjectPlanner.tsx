import { useState, useEffect } from 'preact/hooks';
import { usePlatform } from '../context/PlatformContext';
import { useTranslation } from '../i18n';
import { getIcon } from './ODSIcons';
import { exportProjectAsJSON, exportProjectAsCSV, exportProjectAsDOCX } from '../utils/projectExport';

export function ProjectPlanner() {
  const { state, dispatch } = usePlatform();
  const { t } = useTranslation();

  const project = state.currentProject;

  const [projectName, setProjectName] = useState('');
  const [projectSummary, setProjectSummary] = useState('');
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  // Reset local form values when currentProject updates
  useEffect(() => {
    if (project) {
      setProjectName(project.suggestedName);
      setProjectSummary(project.summary);
      
      // Initialize checklist items as unchecked
      const initial: Record<string, boolean> = {};
      project.objectives.forEach((_: string, i: number) => {
        initial[`obj-${i}`] = false;
      });
      setChecklist(initial);
    }
  }, [project]);

  if (!project) {
    return (
      <div className="clay-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
        <div style={{ width: 'clamp(48px, 8vw, 72px)', height: 'clamp(48px, 8vw, 72px)', margin: '0 auto 16px' }}>
          {getIcon('document', '', 'var(--text-muted)')}
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

  const handleSave = () => {
    dispatch({
      type: 'SAVE_PROJECT',
      payload: { name: projectName, summary: projectSummary }
    });
    dispatch({ type: 'ADD_TOAST', payload: { message: t('toast_project_saved'), type: 'success' } });
  };

  const handleCheck = (key: string) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // EXPORT ENGINES
  const exportJSON = () => {
    const data = {
      name: projectName,
      summary: projectSummary,
      odsIds: state.selectedOds,
      inputs: state.inputs,
      analysis: project,
      exportedAt: new Date().toISOString()
    };
    exportProjectAsJSON(data, dispatch, t);
  };

  const exportCSV = () => {
    exportProjectAsCSV(projectName, projectSummary, state.selectedOds, state.inputs, project, dispatch, t);
  };

  // Structured Word Report Export via Docx Library
  const exportDOCX = async () => {
    await exportProjectAsDOCX(projectName, projectSummary, project, dispatch, t);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section>
      <div className="page-header">
        <h2>{t('planner_title')}</h2>
        <p>{t('planner_subtitle')}</p>
      </div>

      <div className="grid-2col">
        
        {/* EDITABLE PLAN DETAILS */}
        <div className="clay-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="proj-name-field" style={{ fontSize: 'clamp(11px, 1.2vw, 13px)', fontWeight: 800, color: 'var(--text-secondary)' }}>
              {t('planner_suggested_name')}
            </label>
            <input
              id="proj-name-field"
              type="text"
              value={projectName}
              onChange={(e: any) => {
                setProjectName(e.target.value);
                dispatch({ type: 'UPDATE_PROJECT_FIELD', payload: { field: 'name', value: e.target.value } });
              }}
              className="clay-input"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="proj-summary-field" style={{ fontSize: 'clamp(11px, 1.2vw, 13px)', fontWeight: 800, color: 'var(--text-secondary)' }}>
              {t('planner_project_summary')}
            </label>
            <textarea
              id="proj-summary-field"
              rows={4}
              value={projectSummary}
              onChange={(e: any) => {
                setProjectSummary(e.target.value);
                dispatch({ type: 'UPDATE_PROJECT_FIELD', payload: { field: 'summary', value: e.target.value } });
              }}
              className="clay-input"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ paddingTop: '16px', marginTop: '16px', boxShadow: 'inset 0 1px 0 var(--border-dark)' }}>
            <h3 style={{ fontSize: 'clamp(1rem, 1.8vw, 1.125rem)', marginBottom: '12px' }}>
              {t('planner_objectives')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {project.objectives.map((obj: string, i: number) => {
                const key = `obj-${i}`;
                const checked = !!checklist[key];
                return (
                  <div
                    key={key}
                    onClick={() => handleCheck(key)}
                    className={`clay-check-item${checked ? ' clay-check-item--checked' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="clay-checkbox"
                    />
                    <span style={{
                      fontSize: 'clamp(11px, 1.2vw, 13px)',
                      textDecoration: checked ? 'line-through' : 'none',
                      color: checked ? 'var(--text-muted)' : 'var(--text-primary)'
                    }}>
                      {obj}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Save Local Button */}
          <button
            type="button"
            onClick={handleSave}
            className="clay-button clay-button-primary"
            style={{ width: '100%', marginTop: '10px' }}
          >
            💾 {t('planner_save_btn')}
          </button>
        </div>

        {/* EXPORTS & METRICS SUMMARY PANEL */}
        <div className="planner-side-panel">
          
          {/* Resource Indicators Summary */}
          <div className="clay-card">
            <h3 style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1rem)', fontWeight: 800, marginBottom: '16px' }}>
              {t('planner_operational_metrics')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: t('planner_kpis_recommended'),              value: `${project.indicators.length}` },
                { label: t('planner_cost_per_beneficiary'),         value: `$${project.costPerBeneficiary} USD` },
                { label: t('planner_impact_index'),               value: `${project.overallImpactScore}/100` },
                { label: t('planner_sustainability'),                value: `${project.sustainabilityIndex}/100` },
                { label: t('planner_alignment_ods'),                 value: `${project.alignmentScore}/100` },
                { label: t('planner_estimated_reach'),                value: project.reachEstimated.toLocaleString() },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', gap: '12px', boxShadow: 'inset 0 -1px 0 var(--border-dark)' }}>
                  <span style={{ fontSize: 'clamp(11px, 1.2vw, 13px)', color: 'var(--text-secondary)', flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: 'clamp(11px, 1.2vw, 13px)', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'right' }}>{value}</span>
                </div>
              ))}
              <div style={{ paddingTop: '4px' }}>
                <span style={{ fontSize: 'clamp(10px, 1.1vw, 11px)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>{t('planner_target_audience')}</span>
                <span style={{ fontSize: 'clamp(11px, 1.2vw, 12px)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{project.targetAudience}</span>
              </div>
            </div>
          </div>

          {/* Export Center */}
          <div className="clay-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: 'clamp(1rem, 1.8vw, 1.125rem)', marginBottom: '8px' }}>{t('planner_export_center')}</h3>
            
            <button type="button" onClick={exportDOCX} className="clay-button" style={{ justifyContent: 'flex-start', gap: '10px', width: '100%', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '16px', height: '16px' }}>{getIcon('document', '', 'currentColor')}</div>
              {t('export_docx')}
            </button>
            
            <button type="button" onClick={handlePrint} className="clay-button" style={{ justifyContent: 'flex-start', gap: '10px', width: '100%', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '16px', height: '16px' }}>{getIcon('printer', '', 'currentColor')}</div>
              {t('export_pdf')}
            </button>
            
            <button type="button" onClick={exportCSV} className="clay-button" style={{ justifyContent: 'flex-start', gap: '10px', width: '100%', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '16px', height: '16px' }}>{getIcon('chart', '', 'currentColor')}</div>
              {t('export_csv')}
            </button>
            
            <button type="button" onClick={exportJSON} className="clay-button" style={{ justifyContent: 'flex-start', gap: '10px', width: '100%', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '16px', height: '16px' }}>{getIcon('archive', '', 'currentColor')}</div>
              {t('export_json')}
            </button>
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
export default ProjectPlanner;
