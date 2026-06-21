export const AI_MESSAGE_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
} as const;

export type AiMessageRole =
  (typeof AI_MESSAGE_ROLES)[keyof typeof AI_MESSAGE_ROLES];
