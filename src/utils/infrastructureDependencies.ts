/**
 * Infrastructure Dependency Modeling Engine
 * Detects critical infrastructure dependencies based on project characteristics
 */

export interface InfrastructureDependency {
  category: 'education' | 'digital' | 'operational' | 'physical' | 'institutional';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  rationale: string;
  mitigation?: string;
}

/**
 * Generate infrastructure dependencies based on project inputs and SDGs
 */
export function generateInfrastructureDependencies(inputs: {
  budget: number;
  beneficiaries: number;
  duration: number;
  teamSize: number;
  riskLevel: number;
}, selectedSDGs: number[]): InfrastructureDependency[] {
  const dependencies: InfrastructureDependency[] = [];
  
  // Analyze based on SDG focus
  const educationSDGs = [4]; // Quality Education
  const digitalSDGs = [9]; // Industry, Innovation and Infrastructure
  const urbanSDGs = [11]; // Sustainable Cities and Communities
  const climateSDGs = [13]; // Climate Action
  const waterSDGs = [6]; // Clean Water and Sanitation
  
  const hasEducation = selectedSDGs.some(sdg => educationSDGs.includes(sdg));
  const hasDigital = selectedSDGs.some(sdg => digitalSDGs.includes(sdg));
  const hasUrban = selectedSDGs.some(sdg => urbanSDGs.includes(sdg));
  const hasClimate = selectedSDGs.some(sdg => climateSDGs.includes(sdg));
  const hasWater = selectedSDGs.some(sdg => waterSDGs.includes(sdg));
  
  // Education-specific dependencies
  if (hasEducation) {
    const educationDeps = analyzeEducationDependencies(inputs);
    dependencies.push(...educationDeps);
  }
  
  // Digital/infrastructure dependencies
  if (hasDigital || hasUrban) {
    const digitalDeps = analyzeDigitalDependencies(inputs);
    dependencies.push(...digitalDeps);
  }
  
  // Climate/environmental dependencies
  if (hasClimate || hasWater) {
    const environmentalDeps = analyzeEnvironmentalDependencies(inputs);
    dependencies.push(...environmentalDeps);
  }
  
  // Scale-based dependencies
  const scaleDeps = analyzeScaleDependencies(inputs);
  dependencies.push(...scaleDeps);
  
  // Budget-based dependencies
  const budgetDeps = analyzeBudgetDependencies(inputs);
  dependencies.push(...budgetDeps);
  
  return dependencies;
}

/**
 * Analyze education-specific infrastructure dependencies
 */
function analyzeEducationDependencies(inputs: {
  budget: number;
  beneficiaries: number;
  duration: number;
  teamSize: number;
  riskLevel: number;
}): InfrastructureDependency[] {
  const deps: InfrastructureDependency[] = [];
  
  // Teacher training dependency
  const budgetPerBeneficiary = inputs.budget / inputs.beneficiaries;
  if (budgetPerBeneficiary < 30 && inputs.beneficiaries > 500) {
    deps.push({
      category: 'education',
      severity: 'critical',
      description: 'Formação Docente Especializada',
      rationale: 'Iniciativa educacional de grande escala com orçamento limitado requer investimento significativo em capacitação de professores.',
      mitigation: 'Estabelecer parcerias com instituições de formação docente e programas de mentoria.'
    });
  } else if (budgetPerBeneficiary < 50) {
    deps.push({
      category: 'education',
      severity: 'high',
      description: 'Capacitação Pedagógica Contínua',
      rationale: 'Projeto educacional requer programas contínuos de desenvolvimento profissional para equipe docente.',
      mitigation: 'Implementar sistema de treinamento em serviço com parcerias institucionais.'
    });
  }
  
  // Learning materials dependency
  if (inputs.beneficiaries > 1000) {
    deps.push({
      category: 'education',
      severity: 'high',
      description: 'Materiais Didáticos e Recursos de Aprendizagem',
      rationale: `Escala de ${inputs.beneficiaries} beneficiários requer infraestrutura robusta de materiais educacionais.`,
      mitigation: 'Desenvolver sistema de produção e distribuição de materiais com custos otimizados.'
    });
  }
  
  return deps;
}

/**
 * Analyze digital/infrastructure dependencies
 */
function analyzeDigitalDependencies(inputs: {
  budget: number;
  beneficiaries: number;
  duration: number;
  teamSize: number;
  riskLevel: number;
}): InfrastructureDependency[] {
  const deps: InfrastructureDependency[] = [];
  
  // Digital infrastructure dependency
  if (inputs.beneficiaries > 500) {
    deps.push({
      category: 'digital',
      severity: inputs.beneficiaries > 2000 ? 'critical' : 'high',
      description: 'Infraestrutura Digital Contínua',
      rationale: `Operacionalização em escala requer infraestrutura digital estável para gestão de dados, comunicação e monitoramento.`,
      mitigation: 'Estabelecer SLAs com provedores de serviços e planos de contingência de conectividade.'
    });
  }
  
  // Technical support dependency
  const beneficiariesPerTech = inputs.beneficiaries / (inputs.teamSize * 0.2); // Assuming 20% technical staff
  if (beneficiariesPerTech > 500) {
    deps.push({
      category: 'digital',
      severity: 'high',
      description: 'Suporte Técnico Especializado',
      rationale: 'Ratio de suporte técnico insuficiente para escala operacional planejada.',
      mitigation: 'Alocar recursos para equipe de suporte técnico ou terceirizar serviços especializados.'
    });
  }
  
  return deps;
}

/**
 * Analyze environmental/climate dependencies
 */
function analyzeEnvironmentalDependencies(inputs: {
  budget: number;
  beneficiaries: number;
  duration: number;
  teamSize: number;
  riskLevel: number;
}): InfrastructureDependency[] {
  const deps: InfrastructureDependency[] = [];
  
  // Long-term monitoring dependency
  if (inputs.duration > 18) {
    deps.push({
      category: 'institutional',
      severity: 'high',
      description: 'Sistemas de Monitoramento Ambiental de Longo Prazo',
      rationale: `Duração de ${inputs.duration} meses requer infraestrutura sustentada de monitoramento e coleta de dados ambientais.`,
      mitigation: 'Implementar sistemas automatizados de monitoramento com parcerias institucionais.'
    });
  }
  
  // Climate resilience dependency
  if (inputs.riskLevel > 0.5) {
    deps.push({
      category: 'physical',
      severity: 'high',
      description: 'Infraestrutura de Resiliência Climática',
      rationale: 'Nível de risco elevado requer investimentos em adaptação e resiliência climática da infraestrutura física.',
      mitigation: 'Integrar avaliação de riscos climáticos no planejamento de infraestrutura.'
    });
  }
  
  return deps;
}

/**
 * Analyze scale-based dependencies
 */
function analyzeScaleDependencies(inputs: {
  budget: number;
  beneficiaries: number;
  duration: number;
  teamSize: number;
  riskLevel: number;
}): InfrastructureDependency[] {
  const deps: InfrastructureDependency[] = [];
  
  // Operational maintenance dependency
  if (inputs.beneficiaries > 2000) {
    deps.push({
      category: 'operational',
      severity: 'critical',
      description: 'Manutenção Operacional Recorrente',
      rationale: `Escala de ${inputs.beneficiaries} beneficiários requer orçamento contínuo para manutenção operacional e suporte.`,
      mitigation: 'Estabelecer fundo de manutenção operacional com fontes de financiamento diversificadas.'
    });
  } else if (inputs.beneficiaries > 1000) {
    deps.push({
      category: 'operational',
      severity: 'high',
      description: 'Suporte Operacional Estruturado',
      rationale: 'Escala significativa requer estrutura operacional dedicada para suporte contínuo.',
      mitigation: 'Desenvolver plano de operações com alocação clara de recursos.'
    });
  }
  
  // Logistics and distribution dependency
  if (inputs.beneficiaries > 1500) {
    deps.push({
      category: 'physical',
      severity: 'high',
      description: 'Logística e Distribuição Geográfica',
      rationale: 'Alcance geográfico amplo requer infraestrutura logística para distribuição de recursos e serviços.',
      mitigation: 'Estabelecer parcerias logísticas e otimizar rotas de distribuição.'
    });
  }
  
  return deps;
}

/**
 * Analyze budget-based dependencies
 */
function analyzeBudgetDependencies(inputs: {
  budget: number;
  beneficiaries: number;
  duration: number;
  teamSize: number;
  riskLevel: number;
}): InfrastructureDependency[] {
  const deps: InfrastructureDependency[] = [];
  
  const monthlyBudget = inputs.budget / inputs.duration;
  
  // Cash flow dependency
  if (monthlyBudget < 5000 && inputs.beneficiaries > 500) {
    deps.push({
      category: 'institutional',
      severity: 'critical',
      description: 'Fluxo de Caixa e Disponibilidade de Recursos',
      rationale: `Orçamento mensal de $${monthlyBudget.toFixed(0)} insuficiente para escala operacional planejada.`,
      mitigation: 'Diversificar fontes de financiamento e estabelecer reservas de contingência.'
    });
  }
  
  // Procurement dependency
  if (inputs.budget < 20000 && inputs.beneficiaries > 1000) {
    deps.push({
      category: 'institutional',
      severity: 'high',
      description: 'Capacidade de Procurement e Aquisições',
      rationale: 'Orçamento limitado com escala elevada requer processos eficientes de procurement e negociação.',
      mitigation: 'Implementar sistema de compras centralizadas e parcerias estratégicas com fornecedores.'
    });
  }
  
  return deps;
}
