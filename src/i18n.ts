import i18next from 'i18next';
import { useState, useEffect } from 'preact/hooks';

// Load initial language from localStorage or browser settings
const savedLanguage = localStorage.getItem('sdg_platform_lang') || 'pt-BR';

const resources = {
  'pt-BR': {
    translation: {
      app_title: 'Plataforma Cívica ODS',
      app_subtitle: 'Inteligência de Decisão e Impacto',
      nav_selection: '1. Selecionar ODS',
      nav_shuffler: '2. Explorador Estratégico',
      nav_planner: '3. Planejador',
      nav_calculator: '4. Simulador & Impacto',
      nav_map: '5. Mapa Radial',
      nav_dashboard: '6. Dashboard',
      
      theme_light: 'Modo Claro',
      theme_dark: 'Modo Escuro',
      theme_contrast: 'Alto Contraste',
      lang_pt: 'Português',
      lang_en: 'English',
      lang_es: 'Español',

      onboarding_title: 'Bem-vindo à Inteligência Cívica ODS',
      onboarding_subtitle: 'Sua plataforma para desenhar, simular e otimizar projetos alinhados às Metas Globais da ONU.',
      onboarding_step1_title: '1. Selecione as Metas',
      onboarding_step1_desc: 'Escolha manualmente quais ODS (Objetivos de Desenvolvimento Sustentável) o seu projeto abordará (entre 1 e 17).',
      onboarding_step2_title: '2. Simule Cenários',
      onboarding_step2_desc: 'Insira recursos como orçamento, público-alvo beneficiado, tamanho de equipe e duração para simular a sustentabilidade e resiliência.',
      onboarding_step3_title: '3. Analise Sinergias',
      onboarding_step3_desc: 'Entenda como os ODS se reforçam e onde existem conflitos de recursos ou emissões através do nosso motor de tradeoff.',
      onboarding_btn_next: 'Próximo',
      onboarding_btn_start: 'Começar Planejamento',
      onboarding_skip: 'Pular Tutorial',

      selection_title: 'Selecione os ODS do seu Projeto',
      selection_subtitle: 'Selecione entre 1 e 17 ODS para estruturar seu modelo de inteligência cívica.',
      selection_manual: 'Seleção Manual',
      selection_random_btn: 'Exploração Estratégica',
      selection_clear_btn: 'Limpar Seleção',
      selection_all_btn: 'Selecionar Todos',
      selection_next_shuffler: 'Ir para Explorador',
      selection_next_planner: 'Prosseguir para Planejamento',
      selection_count_warning: 'Selecione pelo menos 1 ODS para prosseguir.',

      shuffler_title: 'Explorador Estratégico de ODS',
      shuffler_subtitle: 'Realize uma exploração dinâmica para gerar cenários estratégicos estruturados de planejamento cívico.',
      shuffler_draw_count: 'Quantidade de ODS a Sortear:',
      shuffler_start_btn: 'Iniciar Sorteio Dinâmico',
      shuffler_reshuffle_btn: 'Realizar Novo Sorteio',
      shuffler_drawing_active: 'Embaralhando ODS...',
      shuffler_success_msg: 'ODS Sorteados com Sucesso! Prossiga para o planejador para criar sua iniciativa.',

      planner_title: 'Planejador Cívico de Projeto',
      planner_subtitle: 'Crie e edite o seu plano de ação sustentável alinhado com as metas da ONU.',
      planner_suggested_name: 'Nome Sugerido do Projeto:',
      planner_project_summary: 'Resumo Executivo da Iniciativa:',
      planner_objectives: 'Metas e Iniciativas Operacionais',
      planner_target_audience: 'Público-alvo Beneficiado:',
      planner_timeline: 'Cronograma Estimado do Ciclo de Vida:',
      planner_indicators: 'Indicadores Chave de Impacto (KPIs)',
      planner_resources: 'Recursos Necessários e Logística:',
      planner_risks: 'Riscos Identificados e Mitigação',
      planner_partners: 'Parceiros Estratégicos Recomendados:',
      planner_save_btn: 'Salvar Projeto no Histórico',
      planner_saved_success: 'Projeto salvo com sucesso no seu histórico local!',
      planner_no_ods_selected: 'Por favor, selecione pelo menos 1 ODS para que o planejador possa gerar os dados.',

      calculator_title: 'Simulador de Impacto & Tradeoffs',
      calculator_subtitle: 'Simule o comportamento do projeto com diferentes parâmetros de recursos e cenários de risco.',
      calculator_input_beneficiaries: 'Beneficiários Estimados:',
      calculator_input_budget: 'Orçamento Alocado (USD):',
      calculator_input_duration: 'Duração do Projeto (Meses):',
      calculator_input_team: 'Tamanho da Equipe:',
      calculator_input_risk: 'Cenário de Instabilidade/Risco Externo:',
      calculator_risk_low: 'Baixo (Estável)',
      calculator_risk_medium: 'Médio (Incerto)',
      calculator_risk_high: 'Alto (Crise Climática/Política)',
      
      calculator_score_impact: 'Índice de Impacto Social',
      calculator_score_reach: 'Alcance Estimado',
      calculator_score_sustainability: 'Escala de Sustentabilidade',
      calculator_score_alignment: 'Alinhamento ODS',
      calculator_explain_title: 'Decomposição do Score (Explicabilidade)',
      calculator_tradeoffs_title: 'Análise de Tradeoffs & Sinergias (Sistemas)',
      calculator_no_tradeoffs: 'Nenhum conflito severo identificado. Sinergia excelente entre os objetivos ecológicos e sociais.',

      map_title: 'Mapa de Sinergias ODS (Rede Radial)',
      map_subtitle: 'Visualização radial interativa mostrando a conexão sistêmica e os coeficientes de reforço recíproco entre os ODS do projeto.',
      map_explanation: 'As linhas conectando os ODS ativos representam o grau de sinergia. Linhas azuis cheias indicam sinergia alta (+); linhas tracejadas ou avermelhadas indicam tradeoffs (-) que necessitam de mitigação de recursos adicionais.',

      dashboard_title: 'Dashboard de Inteligência Cívica',
      dashboard_subtitle: 'Métricas agregadas, histórico de projetos simulados e distribuição estatística.',
      dashboard_stat_projects: 'Projetos Criados',
      dashboard_stat_beneficiaries: 'Total de Beneficiários',
      dashboard_stat_impact: 'Média de Impacto',
      dashboard_stat_sustainability: 'Média de Sustentabilidade',
      dashboard_frequency_chart: 'Frequência de ODS Escolhidos',
      dashboard_history_title: 'Histórico de Projetos Desenvolvidos',
      dashboard_export_btn: 'Exportar Dados do Painel',
      dashboard_no_projects: 'Nenhum projeto salvo no histórico local ainda. Desenvolva um plano e clique em Salvar.',
      
      export_docx: 'Exportar DOCX (Relatório Word)',
      export_pdf: 'Exportar PDF (Imprimir)',
      export_csv: 'Exportar CSV',
      export_json: 'Exportar JSON',
      
      toast_project_saved: 'Projeto adicionado ao histórico local!',
      toast_theme_changed: 'Tema atualizado com sucesso!',
      toast_lang_changed: 'Idioma atualizado com sucesso!',
      toast_selection_cleared: 'Seleção limpa.',
      toast_project_deleted: 'Projeto removido do histórico.'
    }
  },
  'en-US': {
    translation: {
      app_title: 'SDG Civic Platform',
      app_subtitle: 'Decision Intelligence & Impact Modeling',
      nav_selection: '1. Select SDGs',
      nav_shuffler: '2. Shuffler',
      nav_planner: '3. Planner',
      nav_calculator: '4. Simulator & Impact',
      nav_map: '5. Radial Map',
      nav_dashboard: '6. Dashboard',
      
      theme_light: 'Light Mode',
      theme_dark: 'Dark Mode',
      theme_contrast: 'High Contrast',
      lang_pt: 'Português',
      lang_en: 'English',
      lang_es: 'Español',

      onboarding_title: 'Welcome to SDG Civic Intelligence',
      onboarding_subtitle: 'Your workspace to design, simulate, and optimize projects aligned with the UN Global Goals.',
      onboarding_step1_title: '1. Select Targets',
      onboarding_step1_desc: 'Manually choose which SDGs (Sustainable Development Goals) your project will address (between 1 and 17).',
      onboarding_step2_title: '2. Simulate Scenarios',
      onboarding_step2_desc: 'Input resources like budget, beneficiaries, team size, and duration to model sustainability and resilience.',
      onboarding_step3_title: '3. Analyze Synergies',
      onboarding_step3_desc: 'Understand how SDGs reinforce each other and where resource or emission conflicts exist via our tradeoff engine.',
      onboarding_btn_next: 'Next',
      onboarding_btn_start: 'Start Planning',
      onboarding_skip: 'Skip Tutorial',

      selection_title: 'Select SDGs for Your Project',
      selection_subtitle: 'Select between 1 and 17 SDGs to structure your civic intelligence model.',
      selection_manual: 'Manual Selection',
      selection_random_btn: 'Quick Random Draw',
      selection_clear_btn: 'Clear Selection',
      selection_all_btn: 'Select All',
      selection_next_shuffler: 'Go to Shuffler',
      selection_next_planner: 'Proceed to Planning',
      selection_count_warning: 'Please select at least 1 SDG to proceed.',

      shuffler_title: 'Smart SDG Lottery & Shuffler',
      shuffler_subtitle: 'Perform a dynamic drawing to generate structured, random civic planning scenarios.',
      shuffler_draw_count: 'Number of SDGs to draw:',
      shuffler_start_btn: 'Start Shuffler',
      shuffler_reshuffle_btn: 'Draw Again',
      shuffler_drawing_active: 'Shuffling SDGs...',
      shuffler_success_msg: 'SDGs Drawn Successfully! Proceed to the planner to shape your initiative.',

      planner_title: 'Civic Project Planner',
      planner_subtitle: 'Create and edit your sustainable action plan aligned with UN goals.',
      planner_suggested_name: 'Suggested Project Name:',
      planner_project_summary: 'Executive Summary:',
      planner_objectives: 'Goals and Operational Initiatives',
      planner_target_audience: 'Target Beneficiaries:',
      planner_timeline: 'Estimated Life Cycle Timeline:',
      planner_indicators: 'Key Performance Indicators (KPIs)',
      planner_resources: 'Required Resources & Logistics:',
      planner_risks: 'Identified Risks & Mitigation',
      planner_partners: 'Strategic Recommended Partners:',
      planner_save_btn: 'Save Project to History',
      planner_saved_success: 'Project saved successfully in your local history!',
      planner_no_ods_selected: 'Please select at least 1 SDG to generate planning details.',

      calculator_title: 'Impact & Tradeoff Simulator',
      calculator_subtitle: 'Model project performance across different resource configurations and external risk scenarios.',
      calculator_input_beneficiaries: 'Estimated Beneficiaries:',
      calculator_input_budget: 'Allocated Budget (USD):',
      calculator_input_duration: 'Project Duration (Months):',
      calculator_input_team: 'Team Size:',
      calculator_input_risk: 'External Instability/Risk Level:',
      calculator_risk_low: 'Low (Stable)',
      calculator_risk_medium: 'Medium (Uncertain)',
      calculator_risk_high: 'High (Climate/Political Crisis)',
      
      calculator_score_impact: 'Social Impact Index',
      calculator_score_reach: 'Estimated Reach',
      calculator_score_sustainability: 'Sustainability Scale',
      calculator_score_alignment: 'SDG Alignment Score',
      calculator_explain_title: 'Score Decomposition (Explainability)',
      calculator_tradeoffs_title: 'Systems Tradeoffs & Synergies Analysis',
      calculator_no_tradeoffs: 'No severe conflicts identified. Excellent synergy between ecological and social goals.',

      map_title: 'SDG Synergies Radial Map',
      map_subtitle: 'Interactive radial visualization mapping systemic linkages and reciprocal reinforcement coefficients between project SDGs.',
      map_explanation: 'Lines connecting active SDGs represent synergy strength. Full blue lines indicate high synergy (+); dashed red lines show tradeoffs (-) requiring mitigation.',

      dashboard_title: 'Civic Intelligence Dashboard',
      dashboard_subtitle: 'Aggregated analytics, simulated project logs, and statistical distribution.',
      dashboard_stat_projects: 'Projects Created',
      dashboard_stat_beneficiaries: 'Total Beneficiaries',
      dashboard_stat_impact: 'Average Impact',
      dashboard_stat_sustainability: 'Average Sustainability',
      dashboard_frequency_chart: 'SDG Choice Frequency',
      dashboard_history_title: 'Saved Projects & Simulations',
      dashboard_export_btn: 'Export Dashboard Data',
      dashboard_no_projects: 'No projects saved in local history yet. Develop a plan and click Save.',
      
      export_docx: 'Export DOCX (Word Report)',
      export_pdf: 'Export PDF (Print Report)',
      export_csv: 'Export CSV',
      export_json: 'Export JSON',
      
      toast_project_saved: 'Project added to local history!',
      toast_theme_changed: 'Theme updated successfully!',
      toast_lang_changed: 'Language updated successfully!',
      toast_selection_cleared: 'Selection cleared.',
      toast_project_deleted: 'Project removed from history.'
    }
  },
  'es-ES': {
    translation: {
      app_title: 'Plataforma Cívica ODS',
      app_subtitle: 'Inteligencia de Decisión y Modelado',
      nav_selection: '1. Seleccionar ODS',
      nav_shuffler: '2. Sorteador',
      nav_planner: '3. Planificador',
      nav_calculator: '4. Simulador e Impacto',
      nav_map: '5. Mapa Radial',
      nav_dashboard: '6. Dashboard',
      
      theme_light: 'Modo Claro',
      theme_dark: 'Modo Oscuro',
      theme_contrast: 'Alto Contraste',
      lang_pt: 'Português',
      lang_en: 'English',
      lang_es: 'Español',

      onboarding_title: 'Bienvenido a Inteligencia Cívica ODS',
      onboarding_subtitle: 'Tu espacio para diseñar, simular y optimizar proyectos alineados con los Objetivos Globales de la ONU.',
      onboarding_step1_title: '1. Seleccionar Metas',
      onboarding_step1_desc: 'Elige manualmente qué ODS (Objetivos de Desarrollo Sostenible) abordará tu proyecto (entre 1 y 17).',
      onboarding_step2_title: '2. Simular Escenarios',
      onboarding_step2_desc: 'Introduce recursos como presupuesto, beneficiarios, tamaño del equipo y duración para modelar resiliencia.',
      onboarding_step3_title: '3. Analizar Sinergias',
      onboarding_step3_desc: 'Comprende cómo los ODS se refuerzan y dónde existen conflictos de recursos o emisiones con el motor de tradeoffs.',
      onboarding_btn_next: 'Siguiente',
      onboarding_btn_start: 'Empezar Planificación',
      onboarding_skip: 'Omitir Tutorial',

      selection_title: 'Selecciona ODS para tu Proyecto',
      selection_subtitle: 'Selecciona entre 1 y 17 ODS para estructurar tu modelo de inteligencia cívica.',
      selection_manual: 'Selección Manual',
      selection_random_btn: 'Sorteo Rápido Aleatorio',
      selection_clear_btn: 'Limpiar Selección',
      selection_all_btn: 'Seleccionar Todos',
      selection_next_shuffler: 'Ir al Sorteador',
      selection_next_planner: 'Proceder a Planificación',
      selection_count_warning: 'Por favor, selecciona al menos 1 ODS para continuar.',

      shuffler_title: 'Sorteador Inteligente de ODS',
      shuffler_subtitle: 'Realiza un sorteo dinámico para generar escenarios aleatorios estructurados de planificación cívica.',
      shuffler_draw_count: 'Número de ODS a sortear:',
      shuffler_start_btn: 'Iniciar Sorteo',
      shuffler_reshuffle_btn: 'Sortear de Nuevo',
      shuffler_drawing_active: 'Barajando ODS...',
      shuffler_success_msg: '¡ODS Sorteados con Éxito! Procede al planificador para dar forma a tu iniciativa.',

      planner_title: 'Planificador de Proyecto Cívico',
      planner_subtitle: 'Crea y edita tu plan de acción sostenible alineado con los objetivos de la ONU.',
      planner_suggested_name: 'Nombre Sugerido del Proyecto:',
      planner_project_summary: 'Resumen Ejecutivo:',
      planner_objectives: 'Metas e Iniciativas Operativas',
      planner_target_audience: 'Beneficiarios Objetivos:',
      planner_timeline: 'Cronograma Estimado de Ciclo de Vida:',
      planner_indicators: 'Indicadores Clave de Impacto (KPIs)',
      planner_resources: 'Recursos Requeridos y Logística:',
      planner_risks: 'Riesgos Identificados y Mitigación',
      planner_partners: 'Socios Estratégicos Recomendados:',
      planner_save_btn: 'Guardar Proyecto en el Historial',
      planner_saved_success: '¡Proyecto guardado con éxito en su historial local!',
      planner_no_ods_selected: 'Por favor, seleccione al menos 1 ODS para generar los detalles de planificación.',

      calculator_title: 'Simulador de Impacto y Tradeoffs',
      calculator_subtitle: 'Simula el comportamiento del proyecto con diferentes recursos y escenarios de riesgo externo.',
      calculator_input_beneficiaries: 'Beneficiarios Estimados:',
      calculator_input_budget: 'Presupuesto Alocado (USD):',
      calculator_input_duration: 'Duración del Proyecto (Meses):',
      calculator_input_team: 'Tamaño del Equipo:',
      calculator_input_risk: 'Cenário de Inestabilidad/Riesgo Externo:',
      calculator_risk_low: 'Bajo (Estable)',
      calculator_risk_medium: 'Medio (Incierto)',
      calculator_risk_high: 'Alto (Crisis Climática/Política)',
      
      calculator_score_impact: 'Índice de Impacto Social',
      calculator_score_reach: 'Alcance Estimado',
      calculator_score_sustainability: 'Escala de Sostenibilidad',
      calculator_score_alignment: 'Alineación ODS',
      calculator_explain_title: 'Descomposición del Score (Explicabilidad)',
      calculator_tradeoffs_title: 'Análisis de Tradeoffs y Sinergias (Sistemas)',
      calculator_no_tradeoffs: 'Ningún conflicto severo identificado. Sinergia excelente entre metas ecológicas y sociales.',

      map_title: 'Mapa de Sinergias ODS',
      map_subtitle: 'Visualización radial interactiva que muestra las conexiones de red y coeficientes de refuerzo mutuo.',
      map_explanation: 'Las líneas representan el grado de sinergia. Las líneas azules sólidas indican alta sinergia (+); las líneas rojas discontinuas indican tradeoffs (-) que requieren mitigación.',

      dashboard_title: 'Dashboard de Inteligencia Cívica',
      dashboard_subtitle: 'Métricas agregadas, historial de proyectos y distribución estadística.',
      dashboard_stat_projects: 'Proyectos Creados',
      dashboard_stat_beneficiaries: 'Total de Beneficiarios',
      dashboard_stat_impact: 'Promedio de Impacto',
      dashboard_stat_sustainability: 'Promedio Sostenibilidad',
      dashboard_frequency_chart: 'Frecuencia de ODS Elegidos',
      dashboard_history_title: 'Historial de Proyectos Salvados',
      dashboard_export_btn: 'Exportar Datos del Panel',
      dashboard_no_projects: 'Ningún proyecto guardado en el historial local. Diseñe un plan y haga clic en Guardar.',
      
      export_docx: 'Exportar DOCX (Relatorio Word)',
      export_pdf: 'Exportar PDF (Imprimir)',
      export_csv: 'Exportar CSV',
      export_json: 'Exportar JSON',
      
      toast_project_saved: '¡Proyecto añadido al historial local!',
      toast_theme_changed: '¡Tema actualizado con éxito!',
      toast_lang_changed: '¡Idioma actualizado con éxito!',
      toast_selection_cleared: 'Selección limpia.',
      toast_project_deleted: 'Proyecto eliminado del historial.'
    }
  }
};

i18next.init({
  lng: savedLanguage,
  fallbackLng: 'en-US',
  resources,
  interpolation: {
    escapeValue: false
  }
});

export default i18next;

// Custom Preact Translation Hook
export function useTranslation() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleLangChange = () => setTick(t => t + 1);
    i18next.on('languageChanged', handleLangChange);
    return () => {
      i18next.off('languageChanged', handleLangChange);
    };
  }, []);

  return {
    t: (key: string) => i18next.t(key),
    i18n: i18next
  };
}
