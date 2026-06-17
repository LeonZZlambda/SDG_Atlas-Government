import i18n from '../i18n';

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
      title: i18n.t('emergent_team_capacity_insufficient'),
      description: i18n.t('emergent_team_capacity_insufficient_desc', { ratio: beneficiariesPerTeamMember.toFixed(0) }),
      affectedVariables: ['beneficiaries', 'teamSize'],
      recommendation: i18n.t('emergent_team_capacity_insufficient_rec')
    };
  }
  
  if (beneficiariesPerTeamMember > 300) {
    return {
      type: 'warning',
      severity: 'high',
      category: 'capacity',
      title: i18n.t('emergent_operational_pressure'),
      description: i18n.t('emergent_operational_pressure_desc', { ratio: beneficiariesPerTeamMember.toFixed(0) }),
      affectedVariables: ['beneficiaries', 'teamSize'],
      recommendation: i18n.t('emergent_operational_pressure_rec')
    };
  }
  
  if (beneficiariesPerTeamMember > 200) {
    return {
      type: 'warning',
      severity: 'medium',
      category: 'capacity',
      title: i18n.t('emergent_moderate_capacity'),
      description: i18n.t('emergent_moderate_capacity_desc', { ratio: beneficiariesPerTeamMember.toFixed(0) }),
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
      title: i18n.t('emergent_financial_risk'),
      description: i18n.t('emergent_financial_risk_desc', { amount: budgetPerBeneficiary.toFixed(2) }),
      affectedVariables: ['budget', 'beneficiaries'],
      recommendation: i18n.t('emergent_financial_risk_rec')
    };
  }
  
  if (budgetPerBeneficiary < 20 && inputs.beneficiaries > 2000) {
    return {
      type: 'warning',
      severity: 'high',
      category: 'sustainability',
      title: i18n.t('emergent_financial_pressure'),
      description: i18n.t('emergent_financial_pressure_desc', { amount: budgetPerBeneficiary.toFixed(2) }),
      affectedVariables: ['budget', 'beneficiaries'],
      recommendation: i18n.t('emergent_financial_pressure_rec')
    };
  }
  
  if (budgetPerBeneficiary >= 50 && inputs.beneficiaries > 500) {
    return {
      type: 'opportunity',
      severity: 'medium',
      category: 'sustainability',
      title: i18n.t('emergent_robust_financial'),
      description: i18n.t('emergent_robust_financial_desc', { amount: budgetPerBeneficiary.toFixed(2) }),
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
      title: i18n.t('emergent_institutional_exposure'),
      description: i18n.t('emergent_institutional_exposure_desc', { months: inputs.duration }),
      affectedVariables: ['duration'],
      recommendation: i18n.t('emergent_institutional_exposure_rec')
    };
  }
  
  if (inputs.duration > 18) {
    return {
      type: 'warning',
      severity: 'medium',
      category: 'dependency',
      title: i18n.t('emergent_moderate_dependency'),
      description: i18n.t('emergent_moderate_dependency_desc', { months: inputs.duration }),
      affectedVariables: ['duration'],
      recommendation: i18n.t('emergent_moderate_dependency_rec')
    };
  }
  
  // Short duration with large scale may indicate rushed implementation
  if (inputs.duration < 6 && inputs.beneficiaries > 1000) {
    return {
      type: 'warning',
      severity: 'high',
      category: 'efficiency',
      title: i18n.t('emergent_rushed_implementation'),
      description: i18n.t('emergent_rushed_implementation_desc', { months: inputs.duration, beneficiaries: inputs.beneficiaries }),
      affectedVariables: ['duration', 'beneficiaries'],
      recommendation: i18n.t('emergent_rushed_implementation_rec')
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
      title: i18n.t('emergent_resource_inefficiency'),
      description: i18n.t('emergent_resource_inefficiency_desc', { amount: budgetPerTeamMemberPerMonth.toFixed(2) }),
      affectedVariables: ['budget', 'teamSize', 'duration'],
      recommendation: i18n.t('emergent_resource_inefficiency_rec')
    };
  }
  
  // Low budget per team member may indicate under-resourcing
  if (budgetPerTeamMemberPerMonth < 1000) {
    return {
      type: 'warning',
      severity: 'high',
      category: 'efficiency',
      title: i18n.t('emergent_underfunding'),
      description: i18n.t('emergent_underfunding_desc', { amount: budgetPerTeamMemberPerMonth.toFixed(2) }),
      affectedVariables: ['budget', 'teamSize', 'duration'],
      recommendation: i18n.t('emergent_underfunding_rec')
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
      title: i18n.t('emergent_critical_risk'),
      description: i18n.t('emergent_critical_risk_desc', { beneficiaries: inputs.beneficiaries }),
      affectedVariables: ['riskLevel', 'beneficiaries'],
      recommendation: i18n.t('emergent_critical_risk_rec')
    };
  }
  
  if (inputs.riskLevel > 0.4 && inputs.beneficiaries > 1000) {
    return {
      type: 'warning',
      severity: 'medium',
      category: 'dependency',
      title: i18n.t('emergent_moderate_risk'),
      description: i18n.t('emergent_moderate_risk_desc'),
      affectedVariables: ['riskLevel', 'beneficiaries']
    };
  }
  
  return null;
}
