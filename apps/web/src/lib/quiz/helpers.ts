import type { CreateQuizQuestionPayload, QuestionType, QuizQuestion } from '@/types/assessment';

const AVATAR_COLORS = ['#2747E0', '#15706A', '#D97757', '#5C3A1E', '#7C3AED'];

export function avatarColor(name: string): string {
  let hash = 0;
  for (const char of name) {
    hash = (hash + char.charCodeAt(0)) % AVATAR_COLORS.length;
  }
  return AVATAR_COLORS[hash];
}

export function formatRelativeTime(iso: string | null): string {
  if (!iso) return 'Unknown';
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function formatStudentAnswer(
  answer: Record<string, unknown> | null,
  type: QuestionType
): string {
  if (!answer) return '(no answer submitted)';
  if (typeof answer.text === 'string') return answer.text;
  if (answer.selected != null) return String(answer.selected);
  if (answer.value !== undefined) return String(answer.value);
  if (Array.isArray(answer.blanks)) return answer.blanks.join(', ');
  if (Array.isArray(answer.pairs)) return JSON.stringify(answer.pairs);
  if (answer.matches && typeof answer.matches === 'object') {
    return JSON.stringify(answer.matches);
  }
  if (typeof answer.output === 'string') return answer.output;
  if (type === 'upload' && typeof answer.filename === 'string') return answer.filename;
  return JSON.stringify(answer);
}

export function getMcqOptions(q: QuizQuestion) {
  return (q.config.options as { id: string; text: string }[] | undefined) ?? [];
}

export function getMatchPairs(q: QuizQuestion) {
  return (q.config.pairs as { l: string; r?: string }[] | undefined) ?? [];
}

export function answerToPayload(
  questionId: string,
  type: QuestionType,
  value: unknown
): { question_id: string; answer: Record<string, unknown> | null } {
  switch (type) {
    case 'mcq':
      return { question_id: questionId, answer: { selected: value } };
    case 'tf':
      return { question_id: questionId, answer: { value } };
    case 'fib':
      return { question_id: questionId, answer: { blanks: value } };
    case 'short':
    case 'essay':
      return { question_id: questionId, answer: { text: value } };
    case 'match':
      return { question_id: questionId, answer: { matches: value } };
    case 'code':
      return { question_id: questionId, answer: { output: value } };
    case 'upload':
      return { question_id: questionId, answer: { filename: value } };
    default:
      return { question_id: questionId, answer: value as Record<string, unknown> };
  }
}

interface BuilderQuestion {
  type: QuestionType;
  prompt: string;
  points: number;
  options?: { id: string; text: string }[];
  answer?: string;
  tfAnswer?: boolean | null;
  blanks?: string[];
  pairs?: { l: string; r: string }[];
  rubric?: string;
  wordMin?: number;
  wordMax?: number;
  language?: string;
  expectedOutput?: string;
}

export function countWords(value: unknown): number {
  const text = textAnswerValue(value);
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function textAnswerValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'text' in value) {
    const text = (value as { text: unknown }).text;
    return typeof text === 'string' ? text : '';
  }
  return '';
}

export function builderQuestionToPayload(
  q: BuilderQuestion,
  sortOrder: number
): CreateQuizQuestionPayload {
  const config: Record<string, unknown> = {};

  switch (q.type) {
    case 'mcq':
      config.options = q.options ?? [];
      config.answer = q.answer;
      break;
    case 'tf':
      config.answer = q.tfAnswer;
      break;
    case 'fib':
      config.blanks = q.blanks ?? [];
      break;
    case 'match':
      config.pairs = q.pairs ?? [];
      break;
    case 'short':
    case 'essay':
      if (q.rubric) config.rubric = q.rubric;
      if (q.wordMin != null) config.word_min = q.wordMin;
      if (q.wordMax != null) config.word_max = q.wordMax;
      break;
    case 'code':
      config.language = q.language ?? 'javascript';
      if (q.expectedOutput) config.expected_output = q.expectedOutput;
      break;
    default:
      break;
  }

  return {
    type: q.type,
    prompt: q.prompt,
    points: q.points,
    config,
    sort_order: sortOrder,
  };
}
