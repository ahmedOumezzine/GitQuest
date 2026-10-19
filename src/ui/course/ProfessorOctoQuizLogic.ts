import type { ProfessorOctoQuizQuestion } from './ProfessorOctoQuizContent';

export interface ProfessorOctoQuizAnswerResult {
  correct: boolean;
  questionIndex: number;
  selectedIndex: number;
  correctIndex: number;
  feedback: string;
}

/** Ephemeral quiz state: it deliberately has no save, XP or quest dependencies. */
export class ProfessorOctoQuizSession {
  private questionIndex = 0;
  private totalScore = 0;
  private answered = false;
  private readonly answers = new Map<number, number>();

  public constructor(private readonly questions: ProfessorOctoQuizQuestion[]) {}

  public get currentQuestion(): ProfessorOctoQuizQuestion | undefined { return this.questions[this.questionIndex]; }
  public get currentIndex(): number { return this.questionIndex; }
  public get score(): number { return this.totalScore; }
  public get answeredCurrent(): boolean { return this.answered; }
  public get complete(): boolean { return this.questionIndex >= this.questions.length - 1 && this.answered; }
  public get questionCount(): number { return this.questions.length; }

  public answer(selectedIndex: number): ProfessorOctoQuizAnswerResult | null {
    const question = this.currentQuestion;
    if (!question || this.answered || selectedIndex < 0 || selectedIndex >= question.answers.length) return null;
    const correct = selectedIndex === question.correctIndex;
    if (correct) this.totalScore += 1;
    this.answers.set(this.questionIndex, selectedIndex);
    this.answered = true;
    return {
      correct,
      questionIndex: this.questionIndex,
      selectedIndex,
      correctIndex: question.correctIndex,
      feedback: correct ? question.correctFeedback : question.incorrectFeedback,
    };
  }

  public next(): boolean {
    if (!this.answered || this.questionIndex >= this.questions.length - 1) return false;
    this.questionIndex += 1;
    this.answered = false;
    return true;
  }

  public restart(): void {
    this.questionIndex = 0;
    this.totalScore = 0;
    this.answered = false;
    this.answers.clear();
  }
}
