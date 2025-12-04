
export enum AppPhase {
  DASHBOARD = 'DASHBOARD',
  GOAL_SETTING = 'GOAL_SETTING',
  PLANNING = 'PLANNING',
  MOTIVATION = 'MOTIVATION',
  REFLECTION = 'REFLECTION'
}

export enum GoalStatus {
  ACTIVE = 'ACTIVE',
  READY_FOR_REFLECTION = 'READY_FOR_REFLECTION',
  COMPLETED = 'COMPLETED'
}

export enum LearningStrategy {
  MEMORIZE = 'MEMORIZE', // Onthouden/Stampen
  UNDERSTAND = 'UNDERSTAND', // Begrijpen/Samenvatten
  APPLY = 'APPLY', // Toepassen/Oefenen
  ANALYZE = 'ANALYZE' // Analyseren/Onderzoeken
}

export enum ReflectionMethod {
  STARR = 'STARR',
  KORTHAGEN = 'KORTHAGEN',
  FOUR_LS = 'FOUR_LS'
}

export interface SmartGoalAnalysis {
  isSmart: boolean;
  shortTitle: string; // New: Summary for dashboard
  feedback: string;
  suggestion: string;
  strategyAdvice?: string;
}

export interface PlanAnalysis {
  isValid: boolean;
  feedback: string;
  tip: string;
}

export interface PlanStep {
  id: string;
  description: string;
  durationMinutes: number;
  completed: boolean;
  targetDate?: string; // YYYY-MM-DD
}

export interface Goal {
  id: string;
  title: string;
  shortTitle?: string; // New: Display title
  strategy: LearningStrategy;
  status: GoalStatus;
  plan: PlanStep[];
  progress: number; // 0-100
  createdAt: number;
  motivationScore?: number;
  reflectionText?: string;
  reflectionMethod?: ReflectionMethod;
  reflectionFeedback?: string; // Stores the AI feedback on reflection
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  points: number;
}

export interface UserProfile {
  points: number;
  level: number;
  completedCycles: number;
  achievements: Achievement[];
}

export interface GeminiResponse {
  text: string;
}
