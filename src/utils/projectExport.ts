/**
 * Project Export Utilities
 * Handles exporting project data to various formats (JSON, CSV, DOCX)
 */

import { EXPORT_FORMATS } from '../constants/exportFormats';

export interface ProjectExportData {
  name: string;
  summary: string;
  odsIds: number[];
  inputs: any;
  analysis: any;
  exportedAt: string;
}

/**
 * Export project data as JSON
 * @param data - Project data to export
 * @param dispatch - Dispatch function for toast notifications
 * @param t - Translation function
 */
export function exportProjectAsJSON(data: ProjectExportData, dispatch: any, t: (key: string) => string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: EXPORT_FORMATS.JSON.mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.name.toLowerCase().replace(/\s+/g, '_')}_project_plan.json`;
  a.click();
  URL.revokeObjectURL(url);
  dispatch({ type: 'ADD_TOAST', payload: { message: t('toast_export_json_success'), type: 'success' } });
}

/**
 * Export project data as CSV
 * @param projectName - Project name
 * @param projectSummary - Project summary
 * @param selectedOds - Selected ODS IDs
 * @param inputs - Project inputs
 * @param project - Project analysis data
 * @param dispatch - Dispatch function for toast notifications
 * @param t - Translation function
 */
export function exportProjectAsCSV(
  projectName: string,
  projectSummary: string,
  selectedOds: number[],
  inputs: any,
  project: any,
  dispatch: any,
  t: (key: string) => string
) {
  let csvContent = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  csvContent += 'Campo,Detalhe\n';
  csvContent += `Projeto,"${projectName.replace(/"/g, '""')}"\n`;
  csvContent += `Resumo,"${projectSummary.replace(/"/g, '""')}"\n`;
  csvContent += `ODS Alinhados,"${selectedOds.join(', ')}"\n`;
  csvContent += `Orçamento Alocado (USD),"${inputs.budget}"\n`;
  csvContent += `Público Beneficiado,"${inputs.beneficiaries}"\n`;
  csvContent += `Duração (Meses),"${inputs.duration}"\n`;
  csvContent += `Equipe de Execução,"${inputs.teamSize}"\n`;
  csvContent += `Índice de Impacto,"${project.overallImpactScore}"\n`;
  csvContent += `Escala de Sustentabilidade,"${project.sustainabilityIndex}"\n`;
  csvContent += `Alinhamento ODS,"${project.alignmentScore}"\n`;

  const blob = new Blob([csvContent], { type: EXPORT_FORMATS.CSV.mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_project_metrics.csv`;
  a.click();
  URL.revokeObjectURL(url);
  dispatch({ type: 'ADD_TOAST', payload: { message: t('toast_export_csv_success'), type: 'success' } });
}

/**
 * Export project data as DOCX
 * @param projectName - Project name
 * @param projectSummary - Project summary
 * @param project - Project analysis data
 * @param dispatch - Dispatch function for toast notifications
 * @param t - Translation function
 */
export async function exportProjectAsDOCX(
  projectName: string,
  projectSummary: string,
  project: any,
  dispatch: any,
  t: (key: string) => string
) {
  try {
    const { Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell, AlignmentType, WidthType, BorderStyle } = await import('docx');
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
                  new TableCell({ children: [new Paragraph({ text: 'Métrica' })], width: { size: 50, type: WidthType.PERCENTAGE } }),
                  new TableCell({ children: [new Paragraph({ text: 'Valor' })], width: { size: 50, type: WidthType.PERCENTAGE } }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Índice de Impacto' })] }),
                  new TableCell({ children: [new Paragraph({ text: String(project.overallImpactScore) })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Escala de Sustentabilidade' })] }),
                  new TableCell({ children: [new Paragraph({ text: String(project.sustainabilityIndex) })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: 'Alinhamento ODS' })] }),
                  new TableCell({ children: [new Paragraph({ text: String(project.alignmentScore) })] }),
                ],
              }),
            ],
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.toLowerCase().replace(/\s+/g, '_')}_project_report.docx`;
    a.click();
    URL.revokeObjectURL(url);
    dispatch({ type: 'ADD_TOAST', payload: { message: t('toast_export_docx_success'), type: 'success' } });
  } catch (error) {
    console.error('DOCX export error:', error);
    dispatch({ type: 'ADD_TOAST', payload: { message: t('toast_export_error'), type: 'error' } });
  }
}
