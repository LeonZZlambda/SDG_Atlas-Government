import { useState, useEffect } from 'preact/hooks';
import { usePlatform } from '../context/PlatformContext';
import { useTranslation } from '../i18n';
import { getIcon } from './ODSIcons';
import { Logger } from '../utils/logger';

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
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_project_plan.json`;
    a.click();
    URL.revokeObjectURL(url);
    dispatch({ type: 'ADD_TOAST', payload: { message: 'JSON exportado com sucesso!', type: 'success' } });
  };

  const exportCSV = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel compatibility
    csvContent += 'Campo,Detalhe\n';
    csvContent += `Projeto,"${projectName.replace(/"/g, '""')}"\n`;
    csvContent += `Resumo,"${projectSummary.replace(/"/g, '""')}"\n`;
    csvContent += `ODS Alinhados,"${state.selectedOds.join(', ')}"\n`;
    csvContent += `Orçamento Alocado (USD),"${state.inputs.budget}"\n`;
    csvContent += `Público Beneficiado,"${state.inputs.beneficiaries}"\n`;
    csvContent += `Duração (Meses),"${state.inputs.duration}"\n`;
    csvContent += `Equipe de Execução,"${state.inputs.teamSize}"\n`;
    csvContent += `Índice de Impacto,"${project.overallImpactScore}"\n`;
    csvContent += `Escala de Sustentabilidade,"${project.sustainabilityIndex}"\n`;
    csvContent += `Alinhamento ODS,"${project.alignmentScore}"\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_project_metrics.csv`;
    a.click();
    URL.revokeObjectURL(url);
    dispatch({ type: 'ADD_TOAST', payload: { message: 'CSV exportado com sucesso!', type: 'success' } });
  };

  // Structured Word Report Export via Docx Library
  const exportDOCX = async () => {
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, AlignmentType, WidthType, BorderStyle } = await import('docx');
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Heading Title
            new Paragraph({
              text: projectName,
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: t('export_docx_title'),
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: '' }), // spacer

            // Section 1: Executive Summary
            new Paragraph({
              text: '1. Resumo Executivo',
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              text: projectSummary,
            }),
            new Paragraph({ text: '' }), // spacer

            // Section 2: Metrics Table
            new Paragraph({
              text: t('export_docx_metrics_title'),
              heading: HeadingLevel.HEADING_1,
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: 'D3D3D3' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: 'D3D3D3' },
                left: { style: BorderStyle.SINGLE, size: 1, color: 'D3D3D3' },
                right: { style: BorderStyle.SINGLE, size: 1, color: 'D3D3D3' },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: t('export_docx_metric_param'), style: 'strong' })] }),
                    new TableCell({ children: [new Paragraph({ text: t('export_docx_metric_value'), style: 'strong' })] })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: t('export_csv_budget') })] }),
                    new TableCell({ children: [new Paragraph({ text: `$${state.inputs.budget}` })] })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: t('export_csv_beneficiaries') })] }),
                    new TableCell({ children: [new Paragraph({ text: `${state.inputs.beneficiaries}` })] })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: t('export_docx_operational_duration') })] }),
                    new TableCell({ children: [new Paragraph({ text: `${state.inputs.duration} ${t('export_docx_months')}` })] })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: t('export_docx_team_size') })] }),
                    new TableCell({ children: [new Paragraph({ text: `${state.inputs.teamSize} ${t('export_docx_collaborators')}` })] })
                  ]
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: t('export_docx_impact_index') })] }),
                    new TableCell({ children: [new Paragraph({ text: `${project.overallImpactScore}/100` })] })
                  ]
                }),
              ]
            }),
            new Paragraph({ text: '' }), // spacer

            // Section 3: Objectives Checklist
            new Paragraph({
              text: t('export_docx_initiatives'),
              heading: HeadingLevel.HEADING_1,
            }),
            ...project.objectives.map((obj: string, i: number) => (
              new Paragraph({
                children: [
                  new TextRun({ text: `• [${t('export_docx_initiative')} ${i + 1}]: `, bold: true }),
                  new TextRun({ text: obj })
                ]
              })
            )),
            new Paragraph({ text: '' }), // spacer

            // Section 4: Risks & Recommended Partners
            new Paragraph({
              text: '4. Riscos, Mitigações e Redes de Parcerias',
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `${t('export_docx_partners')}: `, bold: true }),
                new TextRun({ text: project.partners })
              ]
            }),
            new Paragraph({ text: '' }), // spacer
            ...project.risks.map((risk: string, i: number) => (
              new Paragraph({
                children: [
                  new TextRun({ text: `Risco ODS ${i + 1}: `, bold: true }),
                  new TextRun({ text: risk })
                ]
              })
            ))
          ]
        }]
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_plan.docx`;
      a.click();
      URL.revokeObjectURL(url);
      dispatch({ type: 'ADD_TOAST', payload: { message: 'DOCX exportado com sucesso!', type: 'success' } });
    } catch (e) {
      Logger.error('Failed generating docx:', e);
      dispatch({ type: 'ADD_TOAST', payload: { message: 'Erro ao gerar DOCX', type: 'error' } });
    }
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
