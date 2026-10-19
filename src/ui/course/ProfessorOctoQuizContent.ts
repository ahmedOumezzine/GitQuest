import type { I18nManager } from '../../managers/I18nManager';

export interface ProfessorOctoQuizQuestion {
  prompt: string;
  answers: string[];
  correctIndex: number;
  correctFeedback: string;
  incorrectFeedback: string;
}

/** Localized question data stays separate from the quiz state and renderer. */
export function getProfessorOctoQuizQuestions(i18n: I18nManager): ProfessorOctoQuizQuestion[] {
  return [
    {
      prompt: i18n.text('quizQuestion1'),
      answers: [i18n.text('quizQuestion1A'), i18n.text('quizQuestion1B'), i18n.text('quizQuestion1C')],
      correctIndex: 1,
      correctFeedback: i18n.text('quizQuestion1Correct'),
      incorrectFeedback: i18n.text('quizQuestion1Incorrect'),
    },
    {
      prompt: i18n.text('quizQuestion2'),
      answers: [i18n.text('quizQuestion2A'), i18n.text('quizQuestion2B'), i18n.text('quizQuestion2C')],
      correctIndex: 0,
      correctFeedback: i18n.text('quizQuestion2Correct'),
      incorrectFeedback: i18n.text('quizQuestion2Incorrect'),
    },
    {
      prompt: i18n.text('quizQuestion3'),
      answers: [i18n.text('quizQuestion3A'), i18n.text('quizQuestion3B'), i18n.text('quizQuestion3C')],
      correctIndex: 1,
      correctFeedback: i18n.text('quizQuestion3Correct'),
      incorrectFeedback: i18n.text('quizQuestion3Incorrect'),
    },
  ];
}
