import i18next from 'i18next';
import { useState, useEffect } from 'preact/hooks';

// Load initial language from localStorage or browser settings
const savedLanguage = localStorage.getItem('sdg_platform_lang') || 'pt-BR';

const resources = {
  'pt-BR': {
    translation: {
      app_title: 'Plataforma de Inteligência de Decisão Cívica',
      app_subtitle: 'Análise de Impacto Sistêmico e Planejamento Estratégico',
      nav_selection: '1. Seleção Estratégica',
      nav_shuffler: '2. Exploração Cenários',
      nav_planner: '3. Planejamento de Políticas',
      nav_calculator: '4. Análise de Impacto',
      nav_map: '5. Visualização de Rede',
      nav_dashboard: '6. Painel de Inteligência',
      
      theme_light: 'Modo Claro',
      theme_dark: 'Modo Escuro',
      theme_contrast: 'Alto Contraste',
      lang_pt: 'Português',
      lang_en: 'English',
      lang_es: 'Español',

      onboarding_title: 'Bem-vindo à Plataforma de Inteligência de Decisão Cívica',
      onboarding_subtitle: 'Sistema profissional de suporte à decisão para planejamento estratégico, análise de impacto sistêmico e design de políticas públicas.',
      onboarding_step1_title: '1. Defina Portfólio Estratégico',
      onboarding_step1_desc: 'Selecione os ODS que estruturarão sua iniciativa de política pública ou projeto de inovação social.',
      onboarding_step2_title: '2. Modele Cenários de Implementação',
      onboarding_step2_desc: 'Configure parâmetros operacionais para simular viabilidade, resiliência e impacto sistêmico da iniciativa.',
      onboarding_step3_title: '3. Analise Interações Sistêmicas',
      onboarding_step3_desc: 'Identifique sinergias, trade-offs e dependências institucionais através de análise de redes e algoritmos de decisão.',
      onboarding_btn_next: 'Próximo',
      onboarding_btn_start: 'Começar Planejamento',
      onboarding_skip: 'Pular Tutorial',

      selection_title: 'Seleção de Portfólio Estratégico',
      selection_subtitle: 'Defina o escopo de sua iniciativa de política pública ou projeto social através da seleção de ODS.',
      selection_manual: 'Seleção Manual',
      selection_random_btn: 'Exploração Estratégica',
      selection_clear_btn: 'Limpar Seleção',
      selection_all_btn: 'Selecionar Todos',
      selection_next_shuffler: 'Ir para Explorador',
      selection_next_planner: 'Prosseguir para Planejamento',
      selection_count_warning: 'Selecione pelo menos 1 ODS para prosseguir.',

      shuffler_title: 'Gerador de Cenários Estratégicos',
      shuffler_subtitle: 'Explore combinações de ODS para identificar portfólios de alto impacto e viabilidade institucional.',
      shuffler_draw_count: 'Quantidade de ODS a Sortear:',
      shuffler_start_btn: 'Iniciar Sorteio Dinâmico',
      shuffler_reshuffle_btn: 'Realizar Novo Sorteio',
      shuffler_drawing_active: 'Embaralhando ODS...',
      shuffler_success_msg: 'ODS Sorteados com Sucesso! Prossiga para o planejador para criar sua iniciativa.',

      planner_title: 'Planejador de Políticas Públicas',
      planner_subtitle: 'Desenvolva planos de ação detalhados com análise de viabilidade, alocação de recursos e indicadores de impacto.',
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

      calculator_title: 'Análise de Impacto Sistêmico',
      calculator_subtitle: 'Modele impactos, trade-offs e viabilidade através de simulação multicritério e análise de redes.',
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

      map_title: 'Visualização de Rede de Impacto',
      map_subtitle: 'Mapeamento sistêmico de interações, sinergias e dependências entre os ODS selecionados.',
      map_explanation: 'As linhas conectando os ODS ativos representam o grau de sinergia. Linhas azuis cheias indicam sinergia alta (+); linhas tracejadas ou avermelhadas indicam tradeoffs (-) que necessitam de mitigação de recursos adicionais.',

      dashboard_title: 'Painel de Inteligência de Decisão',
      dashboard_subtitle: 'Visão agregada de portfólios, métricas de impacto sistêmico e insights estratégicos.',
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
      toast_project_deleted: 'Projeto removido do histórico.',

      // ODSGrid complexity warnings
      complexity_high: 'Complexidade Operacional Elevada Detectada',
      complexity_moderate: 'Complexidade Operacional Moderada',
      complexity_analysis: 'Análise de Complexidade',
      complexity_high_1: 'Coordenação interinstitucional necessária para múltiplos ODS',
      complexity_high_2: 'Escopo amplo pode reduzir viabilidade de implementação',
      complexity_high_3: 'Requer alocação significativa de recursos e capacitação técnica',
      complexity_moderate_1: 'Coordenação moderada entre instituições recomendada',
      complexity_moderate_2: 'Planejamento detalhado para integração de ODS',
      complexity_low: 'Escalo manejável com potencial para implementação focada.',
      systemic_analysis_detected: 'Análise Sistêmica Detectada',
      ods_selected_max: 'ODS Selecionados (Max 17)',

      // ODSMap
      map_aligned: '✓ Alinhado ao Projeto',
      map_aligned_to_project: '✓ Alinhado ao Projeto',
      map_not_selected: '✗ Não selecionado',
      map_interrelation: 'Interrelação de Metas',
      map_tradeoff_desc: 'Compromisso identificado. O progresso em uma meta pode pressionar a outra.',
      map_synergy_desc: 'Sinergia positiva. O avanço em uma meta apoia a outra mutuamente.',
      map_synergy_title: 'Mapa de Sinergias',
      map_hover_hint: 'Passe o cursor sobre os nós ou linhas para ver a análise de sinergias.',

      // ConfidenceIndicator
      confidence_label: 'Nível de confiança estatística',
      confidence_high: 'Alta',
      confidence_medium: 'Média',
      confidence_low: 'Baixa',

      // Dashboard
      dashboard_analysis_tools: 'Ferramentas de Análise Avançada',
      dashboard_analysis_tools_desc: 'Simulação de cenários, comparação de projetos e análise de sensibilidade',
      dashboard_network_viz: 'Visualização de Rede de Impacto',
      dashboard_network_viz_desc: 'Análise sistêmica de interações, sinergias e dependências entre os ODS selecionados',
      dashboard_widgets: 'Widgets de Análise Estratégica',
      dashboard_high_complexity: 'Maior Complexidade',

      // ProjectComparison
      comparison_title: 'Comparação de Projetos',
      comparison_subtitle: 'Análise comparativa de múltiplos projetos para decisão estratégica',
      comparison_auto_analysis: 'Análise Automática',

      // ODSCard
      card_complexity: 'Complexidade',
      card_high: 'Alta',
      card_medium: 'Média',
      card_low: 'Baixa',

      // ProjectPlanner export
      export_csv_field: 'Campo',
      export_csv_detail: 'Detalhe',
      export_csv_project: 'Projeto',
      export_csv_summary: 'Resumo',
      export_csv_ods_aligned: 'ODS Alinhados',
      export_csv_budget: 'Orçamento Alocado (USD)',
      export_csv_beneficiaries: 'Público Beneficiado',
      export_csv_duration: 'Duração (Meses)',
      export_csv_team: 'Equipe de Execução',
      export_csv_impact: 'Índice de Impacto',
      export_csv_sustainability: 'Escala de Sustentabilidade',
      export_csv_alignment: 'Alinhamento ODS',
      export_docx_title: 'Relatório Executivo de Alinhamento ODS & Modelagem de Impacto',
      export_docx_executive_summary: '1. Resumo Executivo',
      export_docx_metrics_title: '2. Parâmetros de Recursos e Metas de Impacto',
      export_docx_metric_param: 'Métrica/Parâmetro',
      export_docx_metric_value: 'Valor Estimado',
      export_docx_operational_duration: 'Duração Operacional',
      export_docx_months: 'Meses',
      export_docx_impact_index: 'Índice de Impacto Geral',
      export_docx_risks_partners: '4. Riscos, Mitigações e Redes de Parcerias',
      export_docx_team_size: 'Tamanho de Equipe',
      export_docx_collaborators: 'Colaboradores',
      export_docx_partners: 'Parceiros Recomendados',
      export_docx_initiatives: '3. Iniciativas Operacionais ODS',
      export_docx_initiative: 'Iniciativa',

      // Dashboard remaining
      dashboard_selected_sdgs: 'ODS selecionados',
      dashboard_strong_synergies: 'Sinergias fortes',
      dashboard_avg_synergy: 'Sinergia média',
      dashboard_tradeoffs: 'Trade-offs',
      dashboard_network_density: 'Densidade de rede',
      dashboard_clustering: 'Agrupamento',
      dashboard_centralization: 'Centralização',

      // ProjectPlanner remaining
      planner_operational_metrics: 'Métricas Operacionais',
      planner_kpis_recommended: 'KPIs Recomendados',
      planner_cost_per_beneficiary: 'Custo por Beneficiário',
      planner_impact_index: 'Índice de Impacto',
      planner_sustainability: 'Sustentabilidade',
      planner_alignment_ods: 'Alinhamento ODS',
      planner_estimated_reach: 'Alcance Estimado',
      planner_export_center: 'Centro de Exportação',
      planner_risk_ods: 'Risco ODS',

      // ProjectComparison insights
      comparison_higher_impact: 'demonstra impacto sistêmico significativamente superior',
      comparison_higher_resilience: 'apresenta maior resiliência sistêmica e viabilidade de longo prazo',
      comparison_lower_coordination: 'possui menor complexidade de coordenação',
      comparison_more_efficient: 'é mais eficiente em termos de recursos (orçamento menor)',
      comparison_select_projects: 'Selecionar Projetos (mínimo 2)',
      comparison_comparative_metrics: 'Métricas Comparativas',
      comparison_metric: 'Métrica',
      comparison_radar_chart: 'Gráfico Radar Multidimensional',

      // SDGNetworkVisualization
      network_influence: 'Influência',

      // ODSCard
      card_complexity_low: 'Baixa',
      card_complexity_medium: 'Média',
      card_complexity_high: 'Alta',
      card_impact_low: 'Baixo',
      card_impact_medium: 'Médio',
      card_impact_high: 'Elevado',
      card_dependency_low: 'Baixa',
      card_dependency_medium: 'Média',
      card_dependency_high: 'Alta',

      // ImpactCalculator
      calculator_scenario_params: 'Parâmetros do Cenário',
      calculator_critical_dependencies: 'Dependências Críticas Detectadas',
      calculator_additional_dependencies: 'dependências adicionais detectadas',
      calculator_systemic_index: 'Índice Sistêmico',
      calculator_feasibility_index: 'Índice de Viabilidade',
      calculator_high_risk: 'ALTO RISCO',
      calculator_medium_risk: 'MÉDIO RISCO',
      calculator_moderate_risk: 'RISCO MODERADO',

      // ODSRandomizer
      randomizer_draw_params: 'Parâmetros de Sorteio'
    }
  },
  'en-US': {
    translation: {
      app_title: 'Civic Decision Intelligence Platform',
      app_subtitle: 'Systemic Impact Analysis & Strategic Planning',
      nav_selection: '1. Strategic Selection',
      nav_shuffler: '2. Scenario Exploration',
      nav_planner: '3. Policy Planning',
      nav_calculator: '4. Impact Analysis',
      nav_map: '5. Network Visualization',
      nav_dashboard: '6. Intelligence Dashboard',
      
      theme_light: 'Light Mode',
      theme_dark: 'Dark Mode',
      theme_contrast: 'High Contrast',
      lang_pt: 'Português',
      lang_en: 'English',
      lang_es: 'Español',

      onboarding_title: 'Welcome to Civic Decision Intelligence Platform',
      onboarding_subtitle: 'Professional decision support system for strategic planning, systemic impact analysis, and public policy design.',
      onboarding_step1_title: '1. Define Strategic Portfolio',
      onboarding_step1_desc: 'Select SDGs that will structure your public policy initiative or social innovation project.',
      onboarding_step2_title: '2. Model Implementation Scenarios',
      onboarding_step2_desc: 'Configure operational parameters to simulate initiative viability, resilience, and systemic impact.',
      onboarding_step3_title: '3. Analyze Systemic Interactions',
      onboarding_step3_desc: 'Identify synergies, trade-offs, and institutional dependencies through network analysis and decision algorithms.',
      onboarding_btn_next: 'Next',
      onboarding_btn_start: 'Start Planning',
      onboarding_skip: 'Skip Tutorial',

      selection_title: 'Strategic Portfolio Selection',
      selection_subtitle: 'Define the scope of your public policy initiative or social project through SDG selection.',
      selection_manual: 'Manual Selection',
      selection_random_btn: 'Quick Random Draw',
      selection_clear_btn: 'Clear Selection',
      selection_all_btn: 'Select All',
      selection_next_shuffler: 'Go to Shuffler',
      selection_next_planner: 'Proceed to Planning',
      selection_count_warning: 'Please select at least 1 SDG to proceed.',

      shuffler_title: 'Strategic Scenario Generator',
      shuffler_subtitle: 'Explore SDG combinations to identify high-impact portfolios and institutional viability.',
      shuffler_draw_count: 'Number of SDGs to draw:',
      shuffler_start_btn: 'Start Shuffler',
      shuffler_reshuffle_btn: 'Draw Again',
      shuffler_drawing_active: 'Shuffling SDGs...',
      shuffler_success_msg: 'SDGs Drawn Successfully! Proceed to the planner to shape your initiative.',

      planner_title: 'Public Policy Planner',
      planner_subtitle: 'Develop detailed action plans with viability analysis, resource allocation, and impact indicators.',
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

      calculator_title: 'Systemic Impact Analysis',
      calculator_subtitle: 'Model impacts, trade-offs, and viability through multi-criteria simulation and network analysis.',
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

      map_title: 'Impact Network Visualization',
      map_subtitle: 'Systemic mapping of interactions, synergies, and dependencies between selected SDGs.',
      map_explanation: 'Lines connecting active SDGs represent synergy strength. Full blue lines indicate high synergy (+); dashed red lines show tradeoffs (-) requiring mitigation.',

      dashboard_title: 'Decision Intelligence Dashboard',
      dashboard_subtitle: 'Aggregated view of portfolios, systemic impact metrics, and strategic insights.',
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
      toast_project_deleted: 'Project removed from history.',

      // ODSGrid complexity warnings
      complexity_high: 'High Operational Complexity Detected',
      complexity_moderate: 'Moderate Operational Complexity',
      complexity_analysis: 'Complexity Analysis',
      complexity_high_1: 'Inter-institutional coordination required for multiple SDGs',
      complexity_high_2: 'Broad scope may reduce implementation viability',
      complexity_high_3: 'Requires significant resource allocation and technical capacity',
      complexity_moderate_1: 'Moderate coordination between institutions recommended',
      complexity_moderate_2: 'Detailed planning for SDG integration',
      complexity_low: 'Manageable scale with potential for focused implementation.',
      systemic_analysis_detected: 'Systemic Analysis Detected',
      ods_selected_max: 'SDGs Selected (Max 17)',

      // ODSMap
      map_aligned: '✓ Aligned to Project',
      map_aligned_to_project: '✓ Aligned to Project',
      map_not_selected: '✗ Not selected',
      map_interrelation: 'Goal Interrelation',
      map_tradeoff_desc: 'Tradeoff identified. Progress on one goal may pressure the other.',
      map_synergy_desc: 'Positive synergy. Progress on one goal mutually supports the other.',
      map_synergy_title: 'Synergy Map',
      map_hover_hint: 'Hover over nodes or edges to explore synergies and conflicts.',

      // ConfidenceIndicator
      confidence_label: 'Statistical confidence level',
      confidence_high: 'High',
      confidence_medium: 'Medium',
      confidence_low: 'Low',

      // Dashboard
      dashboard_analysis_tools: 'Advanced Analysis Tools',
      dashboard_analysis_tools_desc: 'Scenario simulation, project comparison, and sensitivity analysis',
      dashboard_network_viz: 'Impact Network Visualization',
      dashboard_network_viz_desc: 'Systemic analysis of interactions, synergies, and dependencies between selected SDGs',
      dashboard_widgets: 'Strategic Analysis Widgets',
      dashboard_high_complexity: 'Highest Complexity',

      // ProjectComparison
      comparison_title: 'Project Comparison',
      comparison_subtitle: 'Comparative analysis of multiple projects for strategic decision-making',
      comparison_auto_analysis: 'Automated Analysis',

      // ODSCard
      card_complexity: 'Complexity',
      card_high: 'High',
      card_medium: 'Medium',
      card_low: 'Low',

      // ProjectPlanner export
      export_csv_field: 'Field',
      export_csv_detail: 'Detail',
      export_csv_project: 'Project',
      export_csv_summary: 'Summary',
      export_csv_ods_aligned: 'Aligned SDGs',
      export_csv_budget: 'Allocated Budget (USD)',
      export_csv_beneficiaries: 'Beneficiaries Reached',
      export_csv_duration: 'Duration (Months)',
      export_csv_team: 'Execution Team',
      export_csv_impact: 'Impact Index',
      export_csv_sustainability: 'Sustainability Scale',
      export_csv_alignment: 'SDG Alignment',
      export_docx_title: 'SDG Alignment & Impact Modeling Executive Report',
      export_docx_executive_summary: '1. Executive Summary',
      export_docx_metrics_title: '2. Resource Parameters & Impact Goals',
      export_docx_metric_param: 'Metric/Parameter',
      export_docx_metric_value: 'Estimated Value',
      export_docx_operational_duration: 'Operational Duration',
      export_docx_months: 'Months',
      export_docx_impact_index: 'Overall Impact Index',
      export_docx_risks_partners: '4. Risks, Mitigations & Partnership Networks',
      export_docx_team_size: 'Team Size',
      export_docx_collaborators: 'Collaborators',
      export_docx_partners: 'Recommended Partners',
      export_docx_initiatives: '3. SDG Operational Initiatives',
      export_docx_initiative: 'Initiative',

      // Dashboard remaining
      dashboard_selected_sdgs: 'Selected SDGs',
      dashboard_strong_synergies: 'Strong synergies',
      dashboard_avg_synergy: 'Average synergy',
      dashboard_tradeoffs: 'Trade-offs',
      dashboard_network_density: 'Network density',
      dashboard_clustering: 'Clustering',
      dashboard_centralization: 'Centralization'
    }
  },
  'es-ES': {
    translation: {
      app_title: 'Plataforma de Inteligencia de Decisión Cívica',
      app_subtitle: 'Análisis de Impacto Sistémico y Planificación Estratégica',
      nav_selection: '1. Selección Estratégica',
      nav_shuffler: '2. Exploración de Escenarios',
      nav_planner: '3. Planificación de Políticas',
      nav_calculator: '4. Análisis de Impacto',
      nav_map: '5. Visualización de Red',
      nav_dashboard: '6. Panel de Inteligencia',
      
      theme_light: 'Modo Claro',
      theme_dark: 'Modo Oscuro',
      theme_contrast: 'Alto Contraste',
      lang_pt: 'Português',
      lang_en: 'English',
      lang_es: 'Español',

      onboarding_title: 'Bienvenido a la Plataforma de Inteligencia de Decisión Cívica',
      onboarding_subtitle: 'Sistema profesional de soporte a la decisión para planificación estratégica, análisis de impacto sistémico y diseño de políticas públicas.',
      onboarding_step1_title: '1. Defina Portafolio Estratégico',
      onboarding_step1_desc: 'Seleccione los ODS que estructurarán su iniciativa de política pública o proyecto de innovación social.',
      onboarding_step2_title: '2. Modele Escenarios de Implementación',
      onboarding_step2_desc: 'Configure parámetros operacionales para simular viabilidad, resiliencia e impacto sistémico de la iniciativa.',
      onboarding_step3_title: '3. Analice Interacciones Sistémicas',
      onboarding_step3_desc: 'Identifique sinergias, trade-offs y dependencias institucionales a través de análisis de redes y algoritmos de decisión.',
      onboarding_btn_next: 'Siguiente',
      onboarding_btn_start: 'Empezar Planificación',
      onboarding_skip: 'Omitir Tutorial',

      selection_title: 'Selección de Portafolio Estratégico',
      selection_subtitle: 'Defina el alcance de su iniciativa de política pública o proyecto social a través de la selección de ODS.',
      selection_manual: 'Selección Manual',
      selection_random_btn: 'Sorteo Rápido Aleatorio',
      selection_clear_btn: 'Limpiar Selección',
      selection_all_btn: 'Seleccionar Todos',
      selection_next_shuffler: 'Ir al Sorteador',
      selection_next_planner: 'Proceder a Planificación',
      selection_count_warning: 'Por favor, selecciona al menos 1 ODS para continuar.',

      shuffler_title: 'Generador de Escenarios Estratégicos',
      shuffler_subtitle: 'Explore combinaciones de ODS para identificar portafolios de alto impacto y viabilidad institucional.',
      shuffler_draw_count: 'Número de ODS a sortear:',
      shuffler_start_btn: 'Iniciar Sorteo',
      shuffler_reshuffle_btn: 'Sortear de Nuevo',
      shuffler_drawing_active: 'Barajando ODS...',
      shuffler_success_msg: '¡ODS Sorteados con Éxito! Procede al planificador para dar forma a tu iniciativa.',

      planner_title: 'Planificador de Políticas Públicas',
      planner_subtitle: 'Desarrolle planes de acción detallados con análisis de viabilidad, asignación de recursos e indicadores de impacto.',
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

      calculator_title: 'Análisis de Impacto Sistémico',
      calculator_subtitle: 'Modele impactos, trade-offs y viabilidad a través de simulación multicriterio y análisis de redes.',
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

      map_title: 'Visualización de Red de Impacto',
      map_subtitle: 'Mapeo sistémico de interacciones, sinergias y dependencias entre los ODS seleccionados.',
      map_explanation: 'Las líneas representan el grado de sinergia. Las líneas azules sólidas indican alta sinergia (+); las líneas rojas discontinuas indican tradeoffs (-) que requieren mitigación.',

      dashboard_title: 'Panel de Inteligencia de Decisión',
      dashboard_subtitle: 'Visión agregada de portafolios, métricas de impacto sistémico e insights estratégicos.',
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
