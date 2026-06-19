/**
 * Export Formats Configuration
 * Defines file formats, MIME types, and export options
 */

export const EXPORT_FORMATS = {
  JSON: {
    extension: '.json',
    mimeType: 'application/json',
    label: 'JSON'
  },
  CSV: {
    extension: '.csv',
    mimeType: 'text/csv;charset=utf-8;',
    label: 'CSV',
    bom: '\uFEFF'
  },
  DOCX: {
    extension: '.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    label: 'DOCX'
  },
  PDF: {
    extension: '.pdf',
    mimeType: 'application/pdf',
    label: 'PDF'
  }
} as const;
