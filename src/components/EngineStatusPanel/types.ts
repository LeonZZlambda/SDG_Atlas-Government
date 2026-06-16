export interface EngineMetric {
  label: string;
  value: string;
  sub?: string;
  confidence?: 'high' | 'medium' | 'low';
}

export interface ScoreBreakdown {
  component: string;
  value: number;
  weight: number;
  contribution: number;
  formula?: string;
  normalized?: { raw: number; normalized: number; method: string };
}

export interface Recommendation {
  sdgId: number;
  type: 'add' | 'remove';
  expectedImpact: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ExecutiveInsight {
  type: 'opportunity' | 'risk' | 'consideration';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Engine {
  id: string;
  name: string;
  tagline: string;
  color: string;
  accentBg: string;
  icon: preact.ComponentChild;
  status: 'active' | 'idle' | 'computing';
  metrics: EngineMetric[];
  formula?: { label: string; expr: string; explanation?: string }[];
  detail: string;
  breakdowns?: ScoreBreakdown[];
  methodology?: string[];
  assumptions?: string[];
  classification?: string;
  pipeline?: string[];
  clickableBreakdown?: boolean;
  benchmark?: { label: string; color: string; icon: string };
  academicReferences?: { concept: string; explanation: string; references: string[] }[];
}
