/**
 * Emergent Behavior Detection Engine
 * Detects interactions between simulator variables that create emergent risks and opportunities
 */

export interface EmergentInsight {
  type: 'warning' | 'opportunity' | 'neutral';
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'capacity' | 'sustainability' | 'dependency' | 'efficiency';
  title: string;
  description: string;
  affectedVariables: string[];
  recommendation?: string;
}

/**
 * Generate emergent insights based on simulator inputs
 */
export function generateEmergentInsights(inputs: {
  budget: number;
  beneficiaries: number;
  duration: number;
  teamSize: number;
  riskLevel: number;
}): EmergentInsight[] {
  const insights: EmergentInsight[] = [];
  
  // Team capacity analysis
  const teamCapacityInsight = analyzeTeamCapacity(inputs);
  if (teamCapacityInsight) insights.push(teamCapacityInsight);
  
  // Budget-reach sustainability analysis
  const budgetReachInsight = analyzeBudgetReachSustainability(inputs);
  if (budgetReachInsight) insights.push(budgetReachInsight);
  
  // Duration-dependency analysis
  const durationDependencyInsight = analyzeDurationDependency(inputs);
  if (durationDependencyInsight) insights.push(durationDependencyInsight);
  
  // Efficiency analysis
  const efficiencyInsight = analyzeEfficiency(inputs);
  if (efficiencyInsight) insights.push(efficiencyInsight);
  
  // Risk amplification analysis
  const riskAmplificationInsight = analyzeRiskAmplification(inputs);
  if (riskAmplificationInsight) insights.push(riskAmplificationInsight);
  
  return insights;
}

/**
 * Analyze team capacity relative to beneficiary scale
 */
function analyzeTeamCapacity(inputs: {
  budget: number;
  beneficiaries: number;
  duration: number;
  teamSize: number;
  riskLevel: number;
}): EmergentInsight | null {
  const beneficiariesPerTeamMember = inputs.beneficiaries / inputs.teamSize;
  
  // High beneficiary-to-team ratio indicates insufficient capacity
  if (beneficiariesPerTeamMember > 500) {
    return {
      type: 'warning',
      severity: 'critical',
      category: 'capacity',
      title: 'Capacidade de Equipe Insuficiente',
      description: `Capacidade da equipe insuficiente para escala atual de beneficiários. Cada membro da equipe seria responsável por ${beneficiariesPerTeamMember.toFixed(0)} beneficiários.`,
      affectedVariables: ['beneficiaries', 'teamSize'],
      recommendation: 'Aumentar tamanho da equipe ou reduzir escala de beneficiários para viabilidade operacional.'
    };
  }
  
  if (beneficiariesPerTeamMember > 300) {
    return {
      type: 'warning',
      severity: 'high',
      category: 'capacity',
      title: 'Pressão Operacional Elevada',
      description: `Alta pressão operacional detectada. Cada membro da equipe seria responsável por ${beneficiariesPerTeamMember.toFixed(0)} beneficiários.`,
      affectedVariables: ['beneficiaries', 'teamSize'],
      recommendation: 'Considerar aumento moderado da equipe ou especialização de funções.'
    };
  }
  
  if (beneficiariesPerTeamMember > 200) {
    return {
      type: 'warning',
      severity: 'medium',
      category: 'capacity',
      title: 'Capacidade Operacional Moderada',
      description: `Capacidade operacional em nível moderado. Cada membro da equipe seria responsável por ${beneficiariesPerTeamMember.toFixed(0)} beneficiários.`,
      affectedVariables: ['beneficiaries', 'teamSize']
    };
  }
  
  return null;
}

/**
 * Analyze budget-reach sustainability relationship
 */
function analyzeBudgetReachSustainability(inputs: {
  budget: number;
  beneficiaries: number;
  duration: number;
  teamSize: number;
  riskLevel: number;
}): EmergentInsight | null {
  const budgetPerBeneficiary = inputs.budget / inputs.beneficiaries;
  
  // Low budget per beneficiary with high reach reduces sustainability
  if (budgetPerBeneficiary < 10 && inputs.beneficiaries > 1000) {
    return {
      type: 'warning',
      severity: 'critical',
      category: 'sustainability',
      title: 'Sustentabilidade Financeira em Risco',
      description: `Alto alcance operacional com orçamento limitado pode reduzir sustentabilidade. Orçamento de $${budgetPerBeneficiary.toFixed(2)} por beneficiário é insuficiente.`,
      affectedVariables: ['budget', 'beneficiaries'],
      recommendation: 'Aumentar orçamento ou reduzir escala para garantir viabilidade financeira.'
    };
  }
  
  if (budgetPerBeneficiary < 20 && inputs.beneficiaries > 2000) {
    return {
      type: 'warning',
      severity: 'high',
      category: 'sustainability',
      title: 'Pressão Financeira Significativa',
      description: `Pressão financeira significativa detectada. Orçamento de $${budgetPerBeneficiary.toFixed(2)} por beneficiário exige otimização de recursos.`,
      affectedVariables: ['budget', 'beneficiaries'],
      recommendation: 'Revisar alocação de recursos ou buscar fontes adicionais de financiamento.'
    };
  }
  
  if (budgetPerBeneficiary >= 50 && inputs.beneficiaries > 500) {
    return {
      type: 'opportunity',
      severity: 'medium',
      category: 'sustainability',
      title: 'Posição Financeira Robusta',
      description: `✓ Posição financeira robusta com orçamento de $${budgetPerBeneficiary.toFixed(2)} por beneficiário. Alta sustentabilidade potencial.`,
      affectedVariables: ['budget', 'beneficiaries']
    };
  }
  
  return null;
}

/**
 * Analyze duration-dependency relationship
 */
function analyzeDurationDependency(inputs: {
  budget: number;
  beneficiaries: number;
  duration: number;
  teamSize: number;
  riskLevel: number;
}): EmergentInsight | null {
  // Long project duration increases institutional dependency exposure
  if (inputs.duration > 24) {
    return {
      type: 'warning',
      severity: 'high',
      category: 'dependency',
      title: 'Exposição à Dependência Institucional Elevada',
      description: `Duração do projeto de ${inputs.duration} meses aumenta exposição à dependência institucional e volatilidade política.`,
      affectedVariables: ['duration'],
      recommendation: 'Considerar estruturação em fases ou diversificação de parceiros institucionais.'
    };
  }
  
  if (inputs.duration > 18) {
    return {
      type: 'warning',
      severity: 'medium',
      category: 'dependency',
      title: 'Dependência Institucional Moderada',
      description: `Duração do projeto de ${inputs.duration} meses requer coordenação institucional sustentada ao longo do tempo.`,
      affectedVariables: ['duration'],
      recommendation: 'Estabelecer mecanismos de governança e continuidade institucional.'
    };
  }
  
  // Short duration with large scale may indicate rushed implementation
  if (inputs.duration < 6 && inputs.beneficiaries > 1000) {
    return {
      type: 'warning',
      severity: 'high',
      category: 'efficiency',
      title: 'Risco de Implementação Acelerada',
      description: `Duração curta de ${inputs.duration} meses com escala de ${inputs.beneficiaries} beneficiários pode comprometer qualidade de implementação.`,
      affectedVariables: ['duration', 'beneficiaries'],
      recommendation: 'Aumentar duração ou reduzir escala para garantir qualidade de implementação.'
    };
  }
  
  return null;
}

/**
 * Analyze efficiency metrics
 */
function analyzeEfficiency(inputs: {
  budget: number;
  beneficiaries: number;
  duration: number;
  teamSize: number;
  riskLevel: number;
}): EmergentInsight | null {
  const budgetPerTeamMemberPerMonth = inputs.budget / (inputs.teamSize * inputs.duration);
  
  // High budget per team member may indicate inefficiency
  if (budgetPerTeamMemberPerMonth > 10000) {
    return {
      type: 'warning',
      severity: 'medium',
      category: 'efficiency',
      title: 'Eficiência de Recursos Questionável',
      description: `Orçamento de $${budgetPerTeamMemberPerMonth.toFixed(2)} por membro da equipe por mês pode indicar ineficiência na alocação de recursos.`,
      affectedVariables: ['budget', 'teamSize', 'duration'],
      recommendation: 'Revisar estrutura de custos e otimizar alocação de recursos humanos.'
    };
  }
  
  // Low budget per team member may indicate under-resourcing
  if (budgetPerTeamMemberPerMonth < 1000) {
    return {
      type: 'warning',
      severity: 'high',
      category: 'efficiency',
      title: 'Sub-financiamento de Equipe',
      description: `Orçamento de $${budgetPerTeamMemberPerMonth.toFixed(2)} por membro da equipe por mês pode indicar sub-financiamento de recursos humanos.`,
      affectedVariables: ['budget', 'teamSize', 'duration'],
      recommendation: 'Aumentar orçamento ou reduzir tamanho da equipe para níveis sustentáveis.'
    };
  }
  
  return null;
}

/**
 * Analyze risk amplification based on scale and duration
 */
function analyzeRiskAmplification(inputs: {
  budget: number;
  beneficiaries: number;
  duration: number;
  teamSize: number;
  riskLevel: number;
}): EmergentInsight | null {
  // High risk level with large scale amplifies overall risk
  if (inputs.riskLevel > 0.6 && inputs.beneficiaries > 2000) {
    return {
      type: 'warning',
      severity: 'critical',
      category: 'dependency',
      title: 'Amplificação de Risco Crítica',
      description: `Nível de risco alto combinado com escala de ${inputs.beneficiaries} beneficiários cria amplificação crítica de riscos operacionais.`,
      affectedVariables: ['riskLevel', 'beneficiaries'],
      recommendation: 'Implementar mecanismos robustos de mitigação de riscos e monitoramento contínuo.'
    };
  }
  
  if (inputs.riskLevel > 0.4 && inputs.beneficiaries > 1000) {
    return {
      type: 'warning',
      severity: 'medium',
      category: 'dependency',
      title: 'Amplificação de Risco Moderada',
      description: `Nível de risco moderado com escala significativa requer atenção especial à gestão de riscos.`,
      affectedVariables: ['riskLevel', 'beneficiaries']
    };
  }
  
  return null;
}
