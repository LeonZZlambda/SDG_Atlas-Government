import type { Initiative, Dependency, Bottleneck, DependencySeverity, DependencyCategory } from '../types/initiative';

/**
 * Dependency Detection Engine
 * Analyzes dependencies between initiatives and detects critical bottlenecks
 */

/**
 * Analyze dependencies across multiple initiatives
 */
export function analyzeDependencies(initiatives: Initiative[]): Dependency[] {
  const allDependencies: Dependency[] = [];
  
  // Collect all dependencies from initiatives
  initiatives.forEach(initiative => {
    initiative.dependencies.forEach(dep => {
      allDependencies.push({
        ...dep,
        id: `${initiative.id}-${dep.id}`
      });
    });
  });
  
  return allDependencies;
}

/**
 * Detect critical bottlenecks based on dependencies
 */
export function detectBottlenecks(initiatives: Initiative[]): Bottleneck[] {
  const bottlenecks: Bottleneck[] = [];
  const allDependencies = analyzeDependencies(initiatives);
  
  // Group dependencies by category
  const dependenciesByCategory = allDependencies.reduce((acc, dep) => {
    if (!acc[dep.category]) {
      acc[dep.category] = [];
    }
    acc[dep.category].push(dep);
    return acc;
  }, {} as Record<DependencyCategory, Dependency[]>);
  
  // Analyze each category for bottlenecks
  Object.entries(dependenciesByCategory).forEach(([category, deps]) => {
    const highSeverityDeps = deps.filter(d => d.severity === 'high');
    const blockingDeps = deps.filter(d => d.blocking);
    
    if (highSeverityDeps.length >= 3) {
      bottlenecks.push({
        type: 'dependency',
        severity: 'critical',
        description: `Multiple high-severity ${category} dependencies detected`,
        affectedInitiatives: initiatives.map(i => i.id),
        recommendation: `Prioritize resolving ${category} dependencies before proceeding`
      });
    } else if (blockingDeps.length >= 2) {
      bottlenecks.push({
        type: 'dependency',
        severity: 'high',
        description: `Multiple blocking ${category} dependencies`,
        affectedInitiatives: initiatives.map(i => i.id),
        recommendation: `Address blocking ${category} dependencies to unblock progress`
      });
    }
  });
  
  // Check for resource bottlenecks
  const totalBudget = initiatives.reduce((sum, i) => sum + i.estimatedBudget, 0);
  const totalStaff = initiatives.reduce((sum, i) => sum + i.requiredStaff, 0);
  
  if (totalBudget > 5000000) { // 5M threshold
    bottlenecks.push({
      type: 'resource',
      severity: 'high',
      description: 'High total budget requirement across initiatives',
      affectedInitiatives: initiatives.map(i => i.id),
      recommendation: 'Consider phasing initiatives or seeking additional funding'
    });
  }
  
  if (totalStaff > 100) { // 100 staff threshold
    bottlenecks.push({
      type: 'resource',
      severity: 'medium',
      description: 'High staff requirement across initiatives',
      affectedInitiatives: initiatives.map(i => i.id),
      recommendation: 'Evaluate staffing capacity and consider resource allocation'
    });
  }
  
  // Check for timeline bottlenecks
  const longTimelineInitiatives = initiatives.filter(i => i.timeline > 36);
  if (longTimelineInitiatives.length >= 2) {
    bottlenecks.push({
      type: 'timeline',
      severity: 'medium',
      description: 'Multiple initiatives with extended timelines',
      affectedInitiatives: longTimelineInitiatives.map(i => i.id),
      recommendation: 'Review timeline feasibility and consider milestone-based delivery'
    });
  }
  
  // Check for risk bottlenecks
  initiatives.forEach(initiative => {
    const highRisks = initiative.risks.filter(r => r.probability > 0.7 && r.impact > 0.7);
    if (highRisks.length >= 2) {
      bottlenecks.push({
        type: 'risk',
        severity: 'high',
        description: `High-risk factors in initiative: ${initiative.name}`,
        affectedInitiatives: [initiative.id],
        recommendation: 'Develop mitigation strategies for high-probability, high-impact risks'
      });
    }
  });
  
  return bottlenecks;
}

/**
 * Calculate critical path through initiatives based on dependencies
 */
export function calculateCriticalPath(initiatives: Initiative[]): string[] {
  // Build dependency graph
  const dependencyMap = new Map<string, string[]>();
  
  initiatives.forEach(initiative => {
    const blockingDeps = initiative.dependencies
      .filter(d => d.blocking)
      .map(d => d.id);
    dependencyMap.set(initiative.id, blockingDeps);
  });
  
  // Simple critical path detection (topological sort)
  const visited = new Set<string>();
  const criticalPath: string[] = [];
  
  function visit(initiativeId: string) {
    if (visited.has(initiativeId)) return;
    visited.add(initiativeId);
    
    const deps = dependencyMap.get(initiativeId) || [];
    deps.forEach(dep => visit(dep));
    
    criticalPath.push(initiativeId);
  }
  
  initiatives.forEach(initiative => visit(initiative.id));
  
  return criticalPath;
}

/**
 * Get dependency severity description
 */
export function getSeverityDescription(severity: DependencySeverity): string {
  switch (severity) {
    case 'low':
      return 'Minor impact, can be resolved with standard resources';
    case 'medium':
      return 'Moderate impact, requires attention and planning';
    case 'high':
      return 'Major impact, critical for success, requires immediate action';
  }
}

/**
 * Get dependency category description
 */
export function getCategoryDescription(category: DependencyCategory): string {
  switch (category) {
    case 'infrastructure':
      return 'Physical or technical infrastructure requirements';
    case 'staff':
      return 'Human resources and personnel requirements';
    case 'institutional':
      return 'Organizational and procedural requirements';
    case 'policy':
      return 'Regulatory and policy compliance requirements';
    case 'financial':
      return 'Budget and funding requirements';
  }
}
