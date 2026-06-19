import type { Engine } from '../components/EngineStatusPanel/types';
import { SDG_METADATA } from './projectGenerator';
import { getImpactCategory, getSustainabilityCategory } from './benchmarking';
import { normalizeValue } from './normalization';

interface EngineConfigContext {
  hasSdgs: boolean;
  selectedSDGs: number[];
  graph: { edges: Array<{ weight: number }> };
  positiveEdges: number;
  negativeEdges: number;
  networkDensity: string;
  avgClustering: string;
  lcr: string;
  mcdaScore: string;
  impactScore: string;
  sustainScore: string;
  sbi: number | null;
  project: any;
  inputs: { beneficiaries: number; duration: number; teamSize: number };
  degCentrality: Map<number, number> | null;
  pageRank: Map<number, number> | null;
  betweennessCentrality: Map<number, number> | null;
  graphStats: { density: number; averageClusteringCoefficient: number } | null;
  getImpactClassification: (score: number) => string;
  getSustainabilityClassification: (score: number) => string;
  t: (key: string, params?: any) => string;
  IconGraph: React.ReactNode;
  IconMCDA: React.ReactNode;
  IconImpact: React.ReactNode;
  IconSustain: React.ReactNode;
  IconGenerator: React.ReactNode;
}

export function getEngines(context: EngineConfigContext): Engine[] {
  const {
    hasSdgs,
    selectedSDGs,
    graph,
    positiveEdges,
    negativeEdges,
    networkDensity,
    avgClustering,
    lcr,
    mcdaScore,
    impactScore,
    sustainScore,
    sbi,
    project,
    inputs,
    degCentrality,
    pageRank,
    betweennessCentrality,
    graphStats,
    getImpactClassification,
    getSustainabilityClassification,
    t,
    IconGraph,
    IconMCDA,
    IconImpact,
    IconSustain,
    IconGenerator,
  } = context;

  return [
    {
      id: 'graph',
      name: 'Graph Algorithms Engine',
      tagline: 'Análise de rede, centralidade e comunidades',
      color: '#6366f1',
      accentBg: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.04) 100%)',
      icon: IconGraph,
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
      icon: IconMCDA,
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
      icon: IconImpact,
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
      icon: IconSustain,
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
          value: (inputs.duration / 24) * 35,
          weight: 0.35,
          contribution: (inputs.duration / 24) * 35,
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
      icon: IconGenerator,
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
          value: inputs.beneficiaries,
          weight: 0.4,
          contribution: inputs.beneficiaries,
          formula: `Beneficiários = ${inputs.beneficiaries.toLocaleString()}`,
          normalized: normalizeValue(inputs.beneficiaries, 'log', 100000),
        },
        {
          component: 'Multiplicador de Sinergia',
          value: 1 + ((sbi || 0) * 0.3),
          weight: 0.3,
          contribution: inputs.beneficiaries * ((sbi || 0) * 0.3),
          formula: `1 + SBI×0.3 = ${(1 + ((sbi || 0) * 0.3)).toFixed(3)}`,
        },
        {
          component: 'Multiplicador de Eficiência',
          value: Math.min(1.5, inputs.teamSize / Math.max(1, inputs.beneficiaries * 0.01)),
          weight: 0.3,
          contribution: inputs.beneficiaries * (Math.min(1.5, inputs.teamSize / Math.max(1, inputs.beneficiaries * 0.01)) - 1),
          formula: `Team/Benef×0.01 = ${Math.min(1.5, inputs.teamSize / Math.max(1, inputs.beneficiaries * 0.01)).toFixed(3)}`,
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
}
