/**
 * Infrastructure Dependency Modeling Engine
 * Detects critical infrastructure dependencies based on project characteristics
 */
import i18n from '../i18n';

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
      description: i18n.t('infra_teacher_training'),
      rationale: i18n.t('infra_teacher_training_desc'),
      mitigation: i18n.t('infra_teacher_training_mit')
    });
  } else if (budgetPerBeneficiary < 50) {
    deps.push({
      category: 'education',
      severity: 'high',
      description: i18n.t('infra_pedagogical'),
      rationale: i18n.t('infra_pedagogical_desc'),
      mitigation: i18n.t('infra_pedagogical_mit')
    });
  }
  
  // Learning materials dependency
  if (inputs.beneficiaries > 1000) {
    deps.push({
      category: 'education',
      severity: 'high',
      description: i18n.t('infra_learning_materials'),
      rationale: i18n.t('infra_learning_materials_desc', { count: inputs.beneficiaries }),
      mitigation: i18n.t('infra_learning_materials_mit')
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
      description: i18n.t('infra_digital'),
      rationale: i18n.t('infra_digital_desc'),
      mitigation: i18n.t('infra_digital_mit')
    });
  }
  
  // Technical support dependency
  const beneficiariesPerTech = inputs.beneficiaries / (inputs.teamSize * 0.2); // Assuming 20% technical staff
  if (beneficiariesPerTech > 500) {
    deps.push({
      category: 'digital',
      severity: 'high',
      description: i18n.t('infra_tech_support'),
      rationale: i18n.t('infra_tech_support_desc'),
      mitigation: i18n.t('infra_tech_support_mit')
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
      description: i18n.t('infra_env_monitoring'),
      rationale: i18n.t('infra_env_monitoring_desc', { months: inputs.duration }),
      mitigation: i18n.t('infra_env_monitoring_mit')
    });
  }
  
  // Climate resilience dependency
  if (inputs.riskLevel > 0.5) {
    deps.push({
      category: 'physical',
      severity: 'high',
      description: i18n.t('infra_climate_resilience'),
      rationale: i18n.t('infra_climate_resilience_desc'),
      mitigation: i18n.t('infra_climate_resilience_mit')
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
      description: i18n.t('infra_operational_maintenance'),
      rationale: i18n.t('infra_operational_maintenance_desc', { count: inputs.beneficiaries }),
      mitigation: i18n.t('infra_operational_maintenance_mit')
    });
  } else if (inputs.beneficiaries > 1000) {
    deps.push({
      category: 'operational',
      severity: 'high',
      description: i18n.t('infra_operational_support'),
      rationale: i18n.t('infra_operational_support_desc'),
      mitigation: i18n.t('infra_operational_support_mit')
    });
  }
  
  // Logistics and distribution dependency
  if (inputs.beneficiaries > 1500) {
    deps.push({
      category: 'physical',
      severity: 'high',
      description: i18n.t('infra_logistics'),
      rationale: i18n.t('infra_logistics_desc'),
      mitigation: i18n.t('infra_logistics_mit')
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
      description: i18n.t('infra_cashflow'),
      rationale: i18n.t('infra_cashflow_desc', { amount: monthlyBudget.toFixed(0) }),
      mitigation: i18n.t('infra_cashflow_mit')
    });
  }
  
  // Procurement dependency
  if (inputs.budget < 20000 && inputs.beneficiaries > 1000) {
    deps.push({
      category: 'institutional',
      severity: 'high',
      description: i18n.t('infra_procurement'),
      rationale: i18n.t('infra_procurement_desc'),
      mitigation: i18n.t('infra_procurement_mit')
    });
  }
  
  return deps;
}
