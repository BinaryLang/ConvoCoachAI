export enum RoleId {
  INTERVIEWER = 'interviewer',
  IELTS = 'ielts',
  SALES_CUSTOMER = 'sales_customer',
  ANGRY_CLIENT = 'angry_client',
  CASUAL = 'casual'
}

export interface Role {
  id: RoleId;
  title: string;
  description: string;
  emoji: string;
  systemInstruction: string;
  color: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface FeedbackMetric {
  score: number; // 0-100
  reasoning: string;
}

export interface FeedbackSuggestion {
  original: string;
  improved: string;
  explanation: string;
}

export interface ConversationFeedback {
  clarity: FeedbackMetric;
  confidence: FeedbackMetric;
  fillerWords: string[];
  suggestions: FeedbackSuggestion[];
  overallSummary: string;
}

export type ChatStatus = 'idle' | 'active' | 'analyzing' | 'finished';