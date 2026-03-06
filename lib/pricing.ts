// Pricing Intelligence Module
// Suggests rates based on job analysis and historical data

export interface JobAnalysis {
  skills: string[];
  complexity: 'low' | 'medium' | 'high' | 'expert';
  estimatedHours: number;
  scope: 'small' | 'medium' | 'large' | 'enterprise';
  category: string;
}

export interface RateSuggestion {
  hourlyRate: {
    min: number;
    recommended: number;
    max: number;
  };
  projectRate: {
    min: number;
    recommended: number;
    max: number;
  };
  confidence: 'low' | 'medium' | 'high';
  reasoning: string;
  factors: string[];
}

// Skill-based rate categories (base rates in USD)
const SKILL_RATES: Record<string, { min: number; base: number; max: number }> = {
  // Data & AI - Premium rates
  'python': { min: 75, base: 125, max: 200 },
  'machine learning': { min: 100, base: 150, max: 250 },
  'data engineering': { min: 100, base: 140, max: 220 },
  'nlp': { min: 100, base: 150, max: 250 },
  'llm': { min: 125, base: 175, max: 300 },
  'ai': { min: 100, base: 150, max: 250 },
  
  // Web Development
  'react': { min: 75, base: 100, max: 175 },
  'next.js': { min: 75, base: 110, max: 175 },
  'typescript': { min: 75, base: 100, max: 175 },
  'node.js': { min: 70, base: 100, max: 160 },
  'javascript': { min: 60, base: 90, max: 150 },
  'html': { min: 40, base: 60, max: 100 },
  'css': { min: 40, base: 60, max: 100 },
  
  // Backend
  'postgresql': { min: 75, base: 110, max: 175 },
  'mongodb': { min: 70, base: 100, max: 160 },
  'aws': { min: 80, base: 125, max: 200 },
  'docker': { min: 70, base: 100, max: 160 },
  'kubernetes': { min: 90, base: 130, max: 200 },
  'api': { min: 70, base: 100, max: 160 },
  
  // Data Analysis
  'sql': { min: 60, base: 90, max: 150 },
  'etl': { min: 75, base: 110, max: 175 },
  'analytics': { min: 60, base: 90, max: 140 },
  'tableau': { min: 60, base: 90, max: 140 },
  'looker': { min: 60, base: 95, max: 150 },
  
  // Automation
  'automation': { min: 70, base: 100, max: 160 },
  'scripting': { min: 60, base: 85, max: 130 },
  'integration': { min: 75, base: 110, max: 175 },
  
  // General
  'consulting': { min: 100, base: 150, max: 300 },
  'architecture': { min: 125, base: 175, max: 300 },
  'review': { min: 75, base: 100, max: 150 },
  'audit': { min: 80, base: 120, max: 200 },
};

// Complexity multipliers
const COMPLEXITY_MULTIPLIERS = {
  'low': 0.8,
  'medium': 1.0,
  'high': 1.3,
  'expert': 1.6,
};

// Scope multipliers (for project rates)
const SCOPE_MULTIPLIERS = {
  'small': { min: 0.5, max: 2 },
  'medium': { min: 2, max: 8 },
  'large': { min: 8, max: 20 },
  'enterprise': { min: 20, max: 50 },
};

// Keywords for complexity assessment
const EXPERT_KEYWORDS = ['architecture', 'system design', 'performance optimization', 'security audit', 'migration', 'replatforming'];
const HIGH_KEYWORDS = ['custom development', 'integration', 'api development', 'database design', 'machine learning'];
const MEDIUM_KEYWORDS = ['feature development', 'bug fix', 'enhancement', 'refactoring', 'testing'];

// Keywords for scope assessment
const ENTERPRISE_KEYWORDS = ['enterprise', 'large scale', 'multi-tenant', 'high availability', 'mission critical', '10,000', '10k+'];
const LARGE_KEYWORDS = ['full website', 'complete', 'end-to-end', 'comprehensive', 'multiple', 'platform'];
const SMALL_KEYWORDS = ['simple', 'quick', 'small', 'one page', 'landing page', 'fix'];

// Extract skills from job description
export function extractSkills(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const foundSkills: string[] = [];
  
  for (const skill of Object.keys(SKILL_RATES)) {
    if (text.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  }
  
  // Add common categories
  if (foundSkills.some(s => ['python', 'machine learning', 'nlp', 'llm', 'ai'].includes(s))) {
    foundSkills.push('data-ai');
  }
  if (foundSkills.some(s => ['react', 'next.js', 'javascript'].includes(s))) {
    foundSkills.push('frontend');
  }
  if (foundSkills.some(s => ['node.js', 'api', 'postgresql', 'mongodb'].includes(s))) {
    foundSkills.push('backend');
  }
  
  return [...new Set(foundSkills)]; // Dedupe
}

// Assess job complexity
export function assessComplexity(title: string, description: string): 'low' | 'medium' | 'high' | 'expert' {
  const text = `${title} ${description}`.toLowerCase();
  
  if (EXPERT_KEYWORDS.some(k => text.includes(k))) return 'expert';
  if (HIGH_KEYWORDS.some(k => text.includes(k))) return 'high';
  if (MEDIUM_KEYWORDS.some(k => text.includes(k))) return 'medium';
  return 'low';
}

// Assess project scope
export function assessScope(title: string, description: string, budget: string | null): 'small' | 'medium' | 'large' | 'enterprise' {
  const text = `${title} ${description}`.toLowerCase();
  
  // Check budget for hints
  if (budget) {
    const budgetNum = parseBudget(budget);
    if (budgetNum > 20000) return 'enterprise';
    if (budgetNum > 5000) return 'large';
    if (budgetNum > 1000) return 'medium';
  }
  
  if (ENTERPRISE_KEYWORDS.some(k => text.includes(k))) return 'enterprise';
  if (LARGE_KEYWORDS.some(k => text.includes(k))) return 'large';
  if (SMALL_KEYWORDS.some(k => text.includes(k))) return 'small';
  return 'medium';
}

// Parse budget string to number
function parseBudget(budget: string): number {
  // Handle ranges like "500-1000"
  const range = budget.replace(/[^0-9-]/g, '');
  if (range.includes('-')) {
    const [min, max] = range.split('-').map(Number);
    return (min + max) / 2;
  }
  return parseInt(range) || 0;
}

// Estimate hours based on scope
export function estimateHours(scope: 'small' | 'medium' | 'large' | 'enterprise'): number {
  const estimates = {
    'small': 5,
    'medium': 20,
    'large': 60,
    'enterprise': 160,
  };
  return estimates[scope];
}

// Main pricing suggestion function
export function suggestRates(
  title: string,
  description: string,
  budget: string | null,
  historicalRates?: number[]
): RateSuggestion {
  const skills = extractSkills(title, description);
  const complexity = assessComplexity(title, description);
  const scope = assessScope(title, description, budget);
  const estimatedHours = estimateHours(scope);
  
  // Calculate base rate from skills
  let baseRates: number[] = [];
  if (skills.length > 0) {
    for (const skill of skills) {
      if (SKILL_RATES[skill]) {
        baseRates.push(SKILL_RATES[skill].base);
      }
    }
  }
  
  // Default rate if no skills matched
  if (baseRates.length === 0) {
    baseRates = [75]; // Default base rate
  }
  
  // Use highest rate for multi-skill jobs (premium for breadth)
  const skillRate = Math.max(...baseRates);
  
  // Apply complexity multiplier
  const complexityMult = COMPLEXITY_MULTIPLIERS[complexity];
  const adjustedRate = skillRate * complexityMult;
  
  // Calculate confidence based on data available
  let confidence: 'low' | 'medium' | 'high' = 'medium';
  let factors: string[] = [];
  
  if (skills.length >= 3) {
    confidence = 'high';
    factors.push('Multiple matched skills');
  } else if (skills.length >= 1) {
    factors.push('Skill match found');
  } else {
    confidence = 'low';
    factors.push('No skill matches - used default rate');
  }
  
  if (historicalRates && historicalRates.length > 0) {
    confidence = 'high';
    const avgHistorical = historicalRates.reduce((a, b) => a + b, 0) / historicalRates.length;
    factors.push(`Based on ${historicalRates.length} historical projects`);
    
    // Blend historical with skill-based
    const blendedRate = (adjustedRate * 0.4) + (avgHistorical * 0.6);
    return buildSuggestion(blendedRate, scope, estimatedHours, confidence, factors, complexity);
  }
  
  return buildSuggestion(adjustedRate, scope, estimatedHours, confidence, factors, complexity);
}

function buildSuggestion(
  rate: number,
  scope: 'small' | 'medium' | 'large' | 'enterprise',
  hours: number,
  confidence: 'low' | 'medium' | 'high',
  factors: string[],
  complexity: string
): RateSuggestion {
  // Base project hours estimate for the scope
  const scopeHours = {
    'small': 10,
    'medium': 40,
    'large': 100,
    'enterprise': 300,
  };
  
  const estimatedProjectHours = scopeHours[scope];
  
  // Build reasoning
  const reasoning = `Based on ${complexity} complexity, ${scope} scope, and market rates`;
  
  return {
    hourlyRate: {
      min: Math.round(rate * 0.8),
      recommended: Math.round(rate),
      max: Math.round(rate * 1.25),
    },
    projectRate: {
      min: Math.round(rate * estimatedProjectHours * 0.7),
      recommended: Math.round(rate * estimatedProjectHours),
      max: Math.round(rate * estimatedProjectHours * 1.4),
    },
    confidence,
    reasoning,
    factors,
  };
}

// Format rate for display
export function formatRate(rate: number): string {
  return `$${rate.toLocaleString()}`;
}

// Get rate range string
export function formatRateRange(suggestion: RateSuggestion, type: 'hourly' | 'project'): string {
  if (type === 'hourly') {
    return `$${suggestion.hourlyRate.min}-${suggestion.hourlyRate.max}/hr`;
  }
  return `$${suggestion.projectRate.min.toLocaleString()}-${suggestion.projectRate.max.toLocaleString()}`;
}
