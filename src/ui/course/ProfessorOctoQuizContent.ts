import type { I18nManager } from '../../managers/I18nManager';

export interface ProfessorOctoQuizQuestion {
  prompt: string;
  answers: string[];
  correctIndex: number;
  correctFeedback: string;
  incorrectFeedback: string;
}

/** Quiz packs are selected by level so future lessons can register their own pack. */
export function hasProfessorOctoQuiz(levelId: string): boolean {
  return levelId === 'level-01' || levelId === 'level-02';
}

/** Localized question data stays separate from the quiz state and renderer. */
export function getProfessorOctoQuizQuestions(i18n: I18nManager, levelId = 'level-01'): ProfessorOctoQuizQuestion[] {
  if (levelId === 'level-02') {
    return [
      {
        prompt: i18n.text('quizForestQuestion1'),
        answers: [i18n.text('quizForestQuestion1A'), i18n.text('quizForestQuestion1B'), i18n.text('quizForestQuestion1C')],
        correctIndex: 1,
        correctFeedback: i18n.text('quizForestQuestion1Correct'),
        incorrectFeedback: i18n.text('quizForestQuestion1Incorrect'),
      },
      {
        prompt: i18n.text('quizForestQuestion2'),
        answers: [i18n.text('quizForestQuestion2A'), i18n.text('quizForestQuestion2B'), i18n.text('quizForestQuestion2C')],
        correctIndex: 0,
        correctFeedback: i18n.text('quizForestQuestion2Correct'),
        incorrectFeedback: i18n.text('quizForestQuestion2Incorrect'),
      },
      {
        prompt: i18n.text('quizForestQuestion3'),
        answers: [i18n.text('quizForestQuestion3A'), i18n.text('quizForestQuestion3B'), i18n.text('quizForestQuestion3C')],
        correctIndex: 1,
        correctFeedback: i18n.text('quizForestQuestion3Correct'),
        incorrectFeedback: i18n.text('quizForestQuestion3Incorrect'),
      },
    ];
  }
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
