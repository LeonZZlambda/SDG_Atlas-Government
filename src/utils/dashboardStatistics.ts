/**
 * Dashboard Statistics Utilities
 * Calculates statistics for dashboard display
 */

export interface DashboardStatistics {
  totalProjects: number;
  totalBeneficiaries: number;
  avgImpact: number;
  avgSustain: number;
  odsCounts: Record<number, number>;
  maxCount: number;
}

/**
 * Calculate dashboard statistics from saved projects
 * @param projects - Array of saved projects
 * @returns Dashboard statistics
 */
export function calculateDashboardStatistics(projects: Array<{ inputs: { beneficiaries: number }; generatedData: any; odsIds: number[] }>): DashboardStatistics {
  const totalProjects = projects.length;
  const totalBeneficiaries = projects.reduce((acc, p) => acc + p.inputs.beneficiaries, 0);
  const avgImpact = totalProjects > 0
    ? Math.round(projects.reduce((acc, p) => acc + p.generatedData.overallImpactScore, 0) / totalProjects)
    : 0;
  const avgSustain = totalProjects > 0
    ? Math.round(projects.reduce((acc, p) => acc + p.generatedData.sustainabilityIndex, 0) / totalProjects)
    : 0;

  // Compile ODS frequencies (1 to 17)
  const odsCounts: Record<number, number> = {};
  for (let i = 1; i <= 17; i++) odsCounts[i] = 0;

  projects.forEach(p => {
    p.odsIds.forEach(id => {
      if (odsCounts[id] !== undefined) odsCounts[id]++;
    });
  });

  const maxCount = Math.max(...Object.values(odsCounts), 1);

  return {
    totalProjects,
    totalBeneficiaries,
    avgImpact,
    avgSustain,
    odsCounts,
    maxCount
  };
}
