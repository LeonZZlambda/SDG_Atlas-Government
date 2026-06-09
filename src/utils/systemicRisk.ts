import type { Initiative } from '../types/initiative';

/**
 * Systemic Risk Detection Engine
 * Identifies risks that affect multiple initiatives or the entire system
 */

export interface SystemicRisk {
  id: string;
  type: 'resource' | 'dependency' | 'timeline' | 'strategic' | 'external';
  severity: 'low' | 'medium' | 'high' | 'critical';
  scope: 'initiative' | 'portfolio' | 'systemic';
  description: string;
  affectedInitiatives: string[];
  propagationPath: string[]; // IDs of initiatives in propagation path
  mitigationStrategies: string[];
  earlyWarningIndicators: string[];
}

export interface SystemicRiskReport {
  risks: SystemicRisk[];
  overallSystemicRiskScore: number; // 0-100
  riskClusters: RiskCluster[];
  cascadingRisks: CascadingRisk[];
  recommendations: string[];
}

export interface RiskCluster {
  id: string;
  type: string;
  initiatives: string[];
  sharedRisks: string[];
  clusterSeverity: 'low' | 'medium' | 'high' | 'critical';
}

export interface CascadingRisk {
  triggerInitiative: string;
  affectedInitiatives: string[];
  cascadePath: string[];
  probability: number;
  impact: number;
  timeline: number; // months to cascade
}

/**
 * Detect systemic risks across initiatives
 */
export function detectSystemicRisks(initiatives: Initiative[]): SystemicRiskReport {
  const risks: SystemicRisk[] = [];
  
  // Resource concentration risks
  risks.push(...detectResourceConcentrationRisks(initiatives));
  
  // Dependency chain risks
  risks.push(...detectDependencyChainRisks(initiatives));
  
  // Timeline synchronization risks
  risks.push(...detectTimelineRisks(initiatives));
  
  // Strategic misalignment risks
  risks.push(...detectStrategicMisalignmentRisks(initiatives));
  
  // External shock vulnerabilities
  risks.push(...detectExternalShockVulnerabilities(initiatives));
  
  const riskClusters = identifyRiskClusters(initiatives, risks);
  const cascadingRisks = analyzeCascadingRisks(initiatives, risks);
  const overallSystemicRiskScore = calculateSystemicRiskScore(risks);
  const recommendations = generateSystemicRiskRecommendations(risks, cascadingRisks);
  
  return {
    risks,
    overallSystemicRiskScore,
    riskClusters,
    cascadingRisks,
    recommendations
  };
}

/**
 * Detect resource concentration risks
 */
function detectResourceConcentrationRisks(initiatives: Initiative[]): SystemicRisk[] {
  const risks: SystemicRisk[] = [];
  
  // Budget concentration
  const totalBudget = initiatives.reduce((sum, i) => sum + i.estimatedBudget, 0);
  const maxBudget = Math.max(...initiatives.map(i => i.estimatedBudget));
  const budgetConcentration = maxBudget / totalBudget;
  
  if (budgetConcentration > 0.5) {
    const highBudgetInitiative = initiatives.find(i => i.estimatedBudget === maxBudget);
    if (highBudgetInitiative) {
      risks.push({
        id: 'budget_concentration_' + highBudgetInitiative.id,
        type: 'resource',
        severity: budgetConcentration > 0.7 ? 'critical' : 'high',
        scope: 'portfolio',
        description: `${(budgetConcentration * 100).toFixed(0)}% of total portfolio budget concentrated in single initiative`,
        affectedInitiatives: [highBudgetInitiative.id],
        propagationPath: initiatives.map(i => i.id),
        mitigationStrategies: [
          'Diversify budget allocation',
          'Implement milestone-based funding',
          'Create contingency reserves'
        ],
        earlyWarningIndicators: [
          'Budget variance > 15%',
          'Single initiative > 50% of total budget',
          'Funding source concentration'
        ]
      });
    }
  }
  
  // Staff concentration
  const totalStaff = initiatives.reduce((sum, i) => sum + i.requiredStaff, 0);
  const maxStaff = Math.max(...initiatives.map(i => i.requiredStaff));
  const staffConcentration = totalStaff > 0 ? maxStaff / totalStaff : 0;
  
  if (staffConcentration > 0.6) {
    const highStaffInitiative = initiatives.find(i => i.requiredStaff === maxStaff);
    if (highStaffInitiative) {
      risks.push({
        id: 'staff_concentration_' + highStaffInitiative.id,
        type: 'resource',
        severity: staffConcentration > 0.8 ? 'critical' : 'high',
        scope: 'portfolio',
        description: `${(staffConcentration * 100).toFixed(0)}% of total staff allocated to single initiative`,
        affectedInitiatives: [highStaffInitiative.id],
        propagationPath: initiatives.map(i => i.id),
        mitigationStrategies: [
          'Cross-train staff across initiatives',
          'Implement flexible staffing model',
          'Use external contractors for peak periods'
        ],
        earlyWarningIndicators: [
          'Staff utilization > 90%',
          'Single initiative > 60% of staff',
          'Skill concentration in few individuals'
        ]
      });
    }
  }
  
  return risks;
}

/**
 * Detect dependency chain risks
 */
function detectDependencyChainRisks(initiatives: Initiative[]): SystemicRisk[] {
  const risks: SystemicRisk[] = [];
  
  // Build dependency graph
  const dependencyGraph = new Map<string, string[]>();
  initiatives.forEach(initiative => {
    const blockingDeps = initiative.dependencies
      .filter(d => d.blocking)
      .map(d => d.id);
    dependencyGraph.set(initiative.id, blockingDeps);
  });
  
  // Detect circular dependencies
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  function detectCycle(node: string, path: string[]): boolean {
    if (recursionStack.has(node)) {
      const cycleStart = path.indexOf(node);
      const cycle = path.slice(cycleStart);
      
      risks.push({
        id: 'circular_dependency_' + cycle.join('_'),
        type: 'dependency',
        severity: 'critical',
        scope: 'portfolio',
        description: `Circular dependency detected: ${cycle.join(' → ')} → ${node}`,
        affectedInitiatives: cycle,
        propagationPath: cycle,
        mitigationStrategies: [
          'Break circular dependency by removing one link',
          'Restructure initiative sequence',
          'Implement parallel execution where possible'
        ],
        earlyWarningIndicators: [
          'Initiatives waiting on each other',
          'No progress in dependency chain',
          'Extended timeline without clear blockers'
        ]
      });
      
      return true;
    }
    
    if (visited.has(node)) return false;
    
    visited.add(node);
    recursionStack.add(node);
    
    const deps = dependencyGraph.get(node) || [];
    for (const dep of deps) {
      if (detectCycle(dep, [...path, node])) {
        return true;
      }
    }
    
    recursionStack.delete(node);
    return false;
  }
  
  initiatives.forEach(initiative => {
    if (!visited.has(initiative.id)) {
      detectCycle(initiative.id, []);
    }
  });
  
  // Detect single points of failure
  const dependencyCounts = new Map<string, number>();
  initiatives.forEach(initiative => {
    initiative.dependencies.forEach(dep => {
      dependencyCounts.set(dep.id, (dependencyCounts.get(dep.id) || 0) + 1);
    });
  });
  
  dependencyCounts.forEach((count, depId) => {
    if (count >= 3) {
      const dependentInitiatives = initiatives
        .filter(i => i.dependencies.some(d => d.id === depId))
        .map(i => i.id);
      
      risks.push({
        id: 'single_point_failure_' + depId,
        type: 'dependency',
        severity: 'critical',
        scope: 'systemic',
        description: `Dependency "${depId}" is a single point of failure affecting ${count} initiatives`,
        affectedInitiatives: dependentInitiatives,
        propagationPath: dependentInitiatives,
        mitigationStrategies: [
          'Create redundancy for critical dependency',
          'Develop alternative solutions',
          'Phased implementation to reduce dependency'
        ],
        earlyWarningIndicators: [
          'Multiple initiatives blocked by same dependency',
          'No alternative paths available',
          'Dependency resolution delays'
        ]
      });
    }
  });
  
  return risks;
}

/**
 * Detect timeline synchronization risks
 */
function detectTimelineRisks(initiatives: Initiative[]): SystemicRisk[] {
  const risks: SystemicRisk[] = [];
  
  // Overlapping critical periods
  const timelineClusters: Record<number, string[]> = {};
  initiatives.forEach(initiative => {
    const timelineBucket = Math.floor(initiative.timeline / 12); // Group by year
    if (!timelineClusters[timelineBucket]) {
      timelineClusters[timelineBucket] = [];
    }
    timelineClusters[timelineBucket].push(initiative.id);
  });
  
  Object.entries(timelineClusters).forEach(([bucket, initiativeIds]) => {
    if (initiativeIds.length >= 3) {
      risks.push({
        id: 'timeline_cluster_' + bucket,
        type: 'timeline',
        severity: initiativeIds.length >= 5 ? 'high' : 'medium',
        scope: 'portfolio',
        description: `${initiativeIds.length} initiatives with similar timelines may create resource contention`,
        affectedInitiatives: initiativeIds,
        propagationPath: initiativeIds,
        mitigationStrategies: [
          'Stagger initiative start dates',
          'Phase implementation by priority',
          'Increase resource capacity during peak periods'
        ],
        earlyWarningIndicators: [
          'Multiple initiatives in same timeline phase',
          'Resource utilization spikes',
          'Timeline compression requests'
        ]
      });
    }
  });
  
  // Extended timeline risks
  const longTimelineInitiatives = initiatives.filter(i => i.timeline > 48);
  if (longTimelineInitiatives.length > 0) {
    risks.push({
      id: 'extended_timeline_risk',
      type: 'timeline',
      severity: 'medium',
      scope: 'portfolio',
      description: `${longTimelineInitiatives.length} initiative(s) with timelines > 4 years increase uncertainty`,
      affectedInitiatives: longTimelineInitiatives.map(i => i.id),
      propagationPath: longTimelineInitiatives.map(i => i.id),
      mitigationStrategies: [
        'Break into smaller phases',
        'Set intermediate milestones',
        'Build in flexibility for course correction'
      ],
      earlyWarningIndicators: [
        'Timeline extensions requested',
        'Scope creep detected',
        'External delays impacting multiple initiatives'
      ]
    });
  }
  
  return risks;
}

/**
 * Detect strategic misalignment risks
 */
function detectStrategicMisalignmentRisks(initiatives: Initiative[]): SystemicRisk[] {
  const risks: SystemicRisk[] = [];
  
  // SDG misalignment across portfolio
  const sdgOverlap = new Map<number, string[]>();
  
  initiatives.forEach(initiative => {
    initiative.sdgIds.forEach(sdgId => {
      if (!sdgOverlap.has(sdgId)) {
        sdgOverlap.set(sdgId, []);
      }
      sdgOverlap.get(sdgId)!.push(initiative.id);
    });
  });
  
  // Check for conflicting SDG focus
  const conflictingPairs: [number, number][] = [
    [8, 9], // Decent Work vs Industry
    [9, 13], // Industry vs Climate Action
    [12, 8], // Responsible Consumption vs Decent Work
  ];
  
  conflictingPairs.forEach(([sdg1, sdg2]) => {
    const sdg1Initiatives = sdgOverlap.get(sdg1) || [];
    const sdg2Initiatives = sdgOverlap.get(sdg2) || [];
    
    if (sdg1Initiatives.length > 0 && sdg2Initiatives.length > 0) {
      const overlap = [...new Set([...sdg1Initiatives, ...sdg2Initiatives])];
      risks.push({
        id: 'sdg_conflict_' + sdg1 + '_' + sdg2,
        type: 'strategic',
        severity: 'medium',
        scope: 'portfolio',
        description: `Potential strategic conflict between SDG ${sdg1} and SDG ${sdg2} initiatives`,
        affectedInitiatives: overlap,
        propagationPath: overlap,
        mitigationStrategies: [
          'Prioritize one SDG focus per initiative',
          'Create integration strategy for conflicting SDGs',
          'Monitor for tradeoffs during implementation'
        ],
        earlyWarningIndicators: [
          'Resource competition between SDG-focused initiatives',
          'Conflicting policy requirements',
          'Stakeholder misalignment'
        ]
      });
    }
  });
  
  return risks;
}

/**
 * Detect external shock vulnerabilities
 */
function detectExternalShockVulnerabilities(initiatives: Initiative[]): SystemicRisk[] {
  const risks: SystemicRisk[] = [];
  
  // Funding source concentration
  const initiativesWithHighBudget = initiatives.filter(i => i.estimatedBudget > 500000);
  if (initiativesWithHighBudget.length >= 2) {
    risks.push({
      id: 'funding_concentration_risk',
      type: 'external',
      severity: 'high',
      scope: 'systemic',
      description: `${initiativesWithHighBudget.length} high-budget initiatives vulnerable to funding disruptions`,
      affectedInitiatives: initiativesWithHighBudget.map(i => i.id),
      propagationPath: initiativesWithHighBudget.map(i => i.id),
      mitigationStrategies: [
        'Diversify funding sources',
        'Build contingency reserves',
        'Create phased funding approach'
      ],
      earlyWarningIndicators: [
        'Funding delays or reductions',
        'Donor concentration',
        'Economic downturn indicators'
      ]
    });
  }
  
  // Geographic concentration (if location data available)
  // This would require location data in the Initiative schema
  
  return risks;
}

/**
 * Identify risk clusters
 */
function identifyRiskClusters(initiatives: Initiative[], risks: SystemicRisk[]): RiskCluster[] {
  const clusters: RiskCluster[] = [];
  const initiativeRiskMap = new Map<string, SystemicRisk[]>();
  
  initiatives.forEach(initiative => {
    const initiativeRisks = risks.filter(r => r.affectedInitiatives.includes(initiative.id));
    initiativeRiskMap.set(initiative.id, initiativeRisks);
  });
  
  // Group initiatives by shared risks
  const sharedRiskGroups = new Map<string, Set<string>>();
  risks.forEach(risk => {
    const key = risk.type + '_' + risk.severity;
    if (!sharedRiskGroups.has(key)) {
      sharedRiskGroups.set(key, new Set());
    }
    risk.affectedInitiatives.forEach(id => sharedRiskGroups.get(key)!.add(id));
  });
  
  sharedRiskGroups.forEach((initiativeIds, key) => {
    const [type, severity] = key.split('_');
    clusters.push({
      id: 'cluster_' + key,
      type,
      initiatives: Array.from(initiativeIds),
      sharedRisks: risks
        .filter(r => r.type === type && r.severity === severity)
        .map(r => r.id),
      clusterSeverity: severity as 'low' | 'medium' | 'high' | 'critical'
    });
  });
  
  return clusters;
}

/**
 * Analyze cascading risks
 */
function analyzeCascadingRisks(initiatives: Initiative[], risks: SystemicRisk[]): CascadingRisk[] {
  const cascadingRisks: CascadingRisk[] = [];
  
  // Build dependency graph for cascade analysis
  const dependencyGraph = new Map<string, string[]>();
  initiatives.forEach(initiative => {
    const blockingDeps = initiative.dependencies
      .filter(d => d.blocking)
      .map(d => d.id);
    dependencyGraph.set(initiative.id, blockingDeps);
  });
  
  // Analyze potential cascades from high-severity risks
  const highSeverityRisks = risks.filter(r => r.severity === 'critical' || r.severity === 'high');
  
  highSeverityRisks.forEach(risk => {
    risk.affectedInitiatives.forEach(triggerId => {
      const affected = new Set<string>();
      const visited = new Set<string>();
      
      function propagate(node: string) {
        if (visited.has(node)) return;
        visited.add(node);
        
        const deps = dependencyGraph.get(node) || [];
        deps.forEach(dep => {
          affected.add(dep);
          propagate(dep);
        });
      }
      
      propagate(triggerId);
      
      if (affected.size > 1) {
        cascadingRisks.push({
          triggerInitiative: triggerId,
          affectedInitiatives: Array.from(affected),
          cascadePath: [triggerId, ...Array.from(affected)],
          probability: risk.severity === 'critical' ? 0.8 : 0.5,
          impact: affected.size * 0.2, // 20% impact per affected initiative
          timeline: affected.size * 3 // 3 months per level
        });
      }
    });
  });
  
  return cascadingRisks;
}

/**
 * Calculate overall systemic risk score
 */
function calculateSystemicRiskScore(risks: SystemicRisk[]): number {
  if (risks.length === 0) return 0;
  
  const severityWeights = {
    low: 10,
    medium: 30,
    high: 60,
    critical: 100
  };
  
  const scopeWeights = {
    initiative: 0.3,
    portfolio: 0.6,
    systemic: 1.0
  };
  
  const totalRisk = risks.reduce((sum, risk) => {
    const severityScore = severityWeights[risk.severity];
    const scopeMultiplier = scopeWeights[risk.scope];
    return sum + (severityScore * scopeMultiplier);
  }, 0);
  
  const maxPossibleRisk = risks.length * 100;
  return Math.min(100, (totalRisk / maxPossibleRisk) * 100);
}

/**
 * Generate systemic risk recommendations
 */
function generateSystemicRiskRecommendations(risks: SystemicRisk[], cascadingRisks: CascadingRisk[]): string[] {
  const recommendations: string[] = [];
  
  const criticalRisks = risks.filter(r => r.severity === 'critical');
  if (criticalRisks.length > 0) {
    recommendations.push(`Address ${criticalRisks.length} critical systemic risk(s) immediately to prevent system-wide failure.`);
  }
  
  const cascadingRiskCount = cascadingRisks.filter(r => r.probability > 0.6).length;
  if (cascadingRiskCount > 0) {
    recommendations.push(`Implement cascade prevention measures for ${cascadingRiskCount} high-probability cascading risks.`);
  }
  
  const systemicRisks = risks.filter(r => r.scope === 'systemic');
  if (systemicRisks.length > 0) {
    recommendations.push('Develop systemic risk monitoring and early warning system.');
  }
  
  const resourceRisks = risks.filter(r => r.type === 'resource');
  if (resourceRisks.length > 0) {
    recommendations.push('Diversify resource allocation to reduce concentration risks.');
  }
  
  return recommendations;
}
