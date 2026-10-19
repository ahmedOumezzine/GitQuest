import assert from 'node:assert/strict';
import test from 'node:test';
import { GameSession } from '../src/core/GameSession';
import { I18nManager } from '../src/managers/I18nManager';
import { getProfessorOctoCoursePages } from '../src/ui/course/ProfessorOctoCourseContent';
import { getProfessorOctoQuizQuestions } from '../src/ui/course/ProfessorOctoQuizContent';
import { ProfessorOctoQuizSession } from '../src/ui/course/ProfessorOctoQuizLogic';

test('Professor Octo course contains six pages in pedagogical order', () => {
  const french = getProfessorOctoCoursePages(new I18nManager('fr'));
  assert.equal(french.length, 6);
  assert.deepEqual(french.map((page) => page.title), [
    'Ta première aventure avec Git',
    'Qu’est-ce qu’un dépôt Git ?',
    'À quoi sert git init ?',
    'Que se passe-t-il après ?',
    'Exemple concret',
    'À toi de jouer !',
  ]);
  assert.equal(french[2].command, 'git init');
  assert.match(french[3].text, /\.git/);
  assert.match(french[4].steps ?? '', /git init/);
  assert.match(french[4].result ?? '', /Exemple/);
  assert.equal(french[5].action, 'practice');
});

test('Professor Octo course is complete and localized in French, English and Arabic', () => {
  for (const locale of ['fr', 'en', 'ar'] as const) {
    const pages = getProfessorOctoCoursePages(new I18nManager(locale));
    assert.equal(pages.length, 6);
    pages.forEach((page) => {
      assert.ok(page.title.length > 0);
      assert.ok(page.text.length > 0);
    });
    assert.equal(pages[2].command, 'git init');
    assert.match(pages[3].text, /\.git/);
    assert.match(pages[4].steps ?? '', /git init/);
    assert.equal(pages[5].action, 'practice');
    assert.ok(new I18nManager(locale).text('coursePractice').length > 0);
  }
  assert.equal(new I18nManager('ar').direction, 'rtl');
});

test('Professor Octo course can be reopened without changing lesson data or rewards', () => {
  const french = new I18nManager('fr');
  const firstRead = getProfessorOctoCoursePages(french);
  const secondRead = getProfessorOctoCoursePages(french);
  assert.notStrictEqual(firstRead, secondRead);
  assert.deepEqual(secondRead, firstRead);
  assert.equal(firstRead.some((page) => 'rewardXp' in page || 'xp' in page), false);
  assert.equal(firstRead[5].action, 'practice');
  assert.match(french.interactionHint('professor-octo'), /Octo/);
});

test('Professor Octo quiz accepts the three correct answers and calculates 3/3', () => {
  const quiz = new ProfessorOctoQuizSession(getProfessorOctoQuizQuestions(new I18nManager('fr')));
  assert.equal(quiz.answer(1)?.correct, true);
  assert.equal(quiz.next(), true);
  assert.equal(quiz.answer(0)?.correct, true);
  assert.equal(quiz.next(), true);
  assert.equal(quiz.answer(1)?.correct, true);
  assert.equal(quiz.score, 3);
  assert.equal(quiz.complete, true);
});

test('Professor Octo quiz gives feedback for wrong answers and remains replayable', () => {
  const quiz = new ProfessorOctoQuizSession(getProfessorOctoQuizQuestions(new I18nManager('fr')));
  assert.equal(quiz.answer(0)?.correct, false);
  assert.equal(quiz.answer(1), null);
  assert.equal(quiz.next(), true);
  assert.equal(quiz.answer(2)?.correct, false);
  assert.equal(quiz.next(), true);
  assert.equal(quiz.answer(2)?.correct, false);
  assert.equal(quiz.score, 0);
  quiz.restart();
  assert.equal(quiz.currentIndex, 0);
  assert.equal(quiz.score, 0);
  assert.equal(quiz.answeredCurrent, false);
  assert.equal(quiz.complete, false);
});

test('Professor Octo quiz stays optional, localized and free of progression rewards', () => {
  const course = getProfessorOctoCoursePages(new I18nManager('fr'));
  assert.equal(course[5].action, 'practice');
  assert.equal(course.some((page) => 'rewardXp' in page || 'xp' in page), false);
  for (const locale of ['fr', 'en', 'ar'] as const) {
    const questions = getProfessorOctoQuizQuestions(new I18nManager(locale));
    assert.equal(questions.length, 3);
    questions.forEach((question) => {
      assert.ok(question.prompt.length > 0);
      assert.equal(question.answers.length, 3);
      assert.ok(question.correctFeedback.length > 0);
      assert.ok(question.incorrectFeedback.length > 0);
    });
    assert.match(questions[0].prompt, /git init/);
    assert.match(questions[1].answers[0], /\.git/);
    assert.equal(new I18nManager(locale).direction, locale === 'ar' ? 'rtl' : 'ltr');
  }
});

test('Professor Octo quiz does not alter XP, Git state or quest progression state', () => {
  const session = new GameSession();
  const quiz = new ProfessorOctoQuizSession(getProfessorOctoQuizQuestions(new I18nManager('fr')));
  quiz.answer(1);
  quiz.next();
  quiz.answer(0);
  quiz.next();
  quiz.answer(1);
  assert.equal(session.xp.value, 0);
  assert.equal(session.git.initialized, false);
  assert.equal(session.getQuest('level-01'), undefined);
});
