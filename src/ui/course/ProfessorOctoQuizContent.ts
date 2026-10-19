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
  return levelId === 'level-01' || levelId === 'level-02' || levelId === 'level-03' || levelId === 'level-04' || levelId === 'level-05' || levelId === 'level-06';
}

export function professorOctoQuizResultKey(levelId: string, score: number, questionCount: number): string {
  if (levelId === 'level-04') {
    return score === questionCount ? 'quizHarborExcellent' : score === 0 ? 'quizHarborZero' : 'quizHarborGood';
  }
  if (levelId === 'level-03') {
    return score === questionCount ? 'quizCaveExcellent' : score === 0 ? 'quizCaveZero' : 'quizCaveGood';
  }
  if (levelId === 'level-05') {
    return score === questionCount ? 'quizMountainExcellent' : score === 0 ? 'quizMountainZero' : 'quizMountainGood';
  }
  if (levelId === 'level-06') {
    return score === questionCount ? 'quizCastleExcellent' : score === 0 ? 'quizCastleZero' : 'quizCastleGood';
  }
  if (levelId === 'level-02') {
    return score === questionCount ? 'quizForestExcellent' : score === 0 ? 'quizForestZero' : 'quizForestGood';
  }
  return score === questionCount ? 'quizExcellent' : score === 0 ? 'quizZero' : 'quizGood';
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
  if (levelId === 'level-03') {
    return [
      {
        prompt: i18n.text('quizCaveQuestion1'),
        answers: [i18n.text('quizCaveQuestion1A'), i18n.text('quizCaveQuestion1B'), i18n.text('quizCaveQuestion1C')],
        correctIndex: 1,
        correctFeedback: i18n.text('quizCaveQuestion1Correct'),
        incorrectFeedback: i18n.text('quizCaveQuestion1Incorrect'),
      },
      {
        prompt: i18n.text('quizCaveQuestion2'),
        answers: [i18n.text('quizCaveQuestion2A'), i18n.text('quizCaveQuestion2B'), i18n.text('quizCaveQuestion2C')],
        correctIndex: 1,
        correctFeedback: i18n.text('quizCaveQuestion2Correct'),
        incorrectFeedback: i18n.text('quizCaveQuestion2Incorrect'),
      },
      {
        prompt: i18n.text('quizCaveQuestion3'),
        answers: [i18n.text('quizCaveQuestion3A'), i18n.text('quizCaveQuestion3B'), i18n.text('quizCaveQuestion3C')],
        correctIndex: 0,
        correctFeedback: i18n.text('quizCaveQuestion3Correct'),
        incorrectFeedback: i18n.text('quizCaveQuestion3Incorrect'),
      },
    ];
  }
  if (levelId === 'level-04') {
    return [
      {
        prompt: i18n.text('quizHarborQuestion1'),
        answers: [i18n.text('quizHarborQuestion1A'), i18n.text('quizHarborQuestion1B'), i18n.text('quizHarborQuestion1C')],
        correctIndex: 1,
        correctFeedback: i18n.text('quizHarborQuestion1Correct'),
        incorrectFeedback: i18n.text('quizHarborQuestion1Incorrect'),
      },
      {
        prompt: i18n.text('quizHarborQuestion2'),
        answers: [i18n.text('quizHarborQuestion2A'), i18n.text('quizHarborQuestion2B'), i18n.text('quizHarborQuestion2C')],
        correctIndex: 0,
        correctFeedback: i18n.text('quizHarborQuestion2Correct'),
        incorrectFeedback: i18n.text('quizHarborQuestion2Incorrect'),
      },
      {
        prompt: i18n.text('quizHarborQuestion3'),
        answers: [i18n.text('quizHarborQuestion3A'), i18n.text('quizHarborQuestion3B'), i18n.text('quizHarborQuestion3C')],
        correctIndex: 1,
        correctFeedback: i18n.text('quizHarborQuestion3Correct'),
        incorrectFeedback: i18n.text('quizHarborQuestion3Incorrect'),
      },
    ];
  }
  if (levelId === 'level-05') {
    return [
      {
        prompt: i18n.text('quizMountainQuestion1'),
        answers: [i18n.text('quizMountainQuestion1A'), i18n.text('quizMountainQuestion1B'), i18n.text('quizMountainQuestion1C')],
        correctIndex: 1,
        correctFeedback: i18n.text('quizMountainQuestion1Correct'),
        incorrectFeedback: i18n.text('quizMountainQuestion1Incorrect'),
      },
      {
        prompt: i18n.text('quizMountainQuestion2'),
        answers: [i18n.text('quizMountainQuestion2A'), i18n.text('quizMountainQuestion2B'), i18n.text('quizMountainQuestion2C')],
        correctIndex: 0,
        correctFeedback: i18n.text('quizMountainQuestion2Correct'),
        incorrectFeedback: i18n.text('quizMountainQuestion2Incorrect'),
      },
      {
        prompt: i18n.text('quizMountainQuestion3'),
        answers: [i18n.text('quizMountainQuestion3A'), i18n.text('quizMountainQuestion3B'), i18n.text('quizMountainQuestion3C')],
        correctIndex: 1,
        correctFeedback: i18n.text('quizMountainQuestion3Correct'),
        incorrectFeedback: i18n.text('quizMountainQuestion3Incorrect'),
      },
    ];
  }
  if (levelId === 'level-06') {
    return [
      {
        prompt: i18n.text('quizCastleQuestion1'),
        answers: [i18n.text('quizCastleQuestion1A'), i18n.text('quizCastleQuestion1B'), i18n.text('quizCastleQuestion1C')],
        correctIndex: 1,
        correctFeedback: i18n.text('quizCastleQuestion1Correct'),
        incorrectFeedback: i18n.text('quizCastleQuestion1Incorrect'),
      },
      {
        prompt: i18n.text('quizCastleQuestion2'),
        answers: [i18n.text('quizCastleQuestion2A'), i18n.text('quizCastleQuestion2B'), i18n.text('quizCastleQuestion2C')],
        correctIndex: 0,
        correctFeedback: i18n.text('quizCastleQuestion2Correct'),
        incorrectFeedback: i18n.text('quizCastleQuestion2Incorrect'),
      },
      {
        prompt: i18n.text('quizCastleQuestion3'),
        answers: [i18n.text('quizCastleQuestion3A'), i18n.text('quizCastleQuestion3B'), i18n.text('quizCastleQuestion3C')],
        correctIndex: 1,
        correctFeedback: i18n.text('quizCastleQuestion3Correct'),
        incorrectFeedback: i18n.text('quizCastleQuestion3Incorrect'),
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
