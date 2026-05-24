export interface QuestionResult {
  question: string;
  options: string[];
  correct: number;
}

export interface VerificationEmailOptions {
  to: string;
  name: string;
  url: string;
}
