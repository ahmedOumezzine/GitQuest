import type { I18nManager } from '../../managers/I18nManager';

export interface ProfessorOctoCoursePage {
  title: string;
  text: string;
  command?: string;
  steps?: string;
  result?: string;
  action?: 'practice' | 'close';
}

export function professorOctoCourseTitleKey(levelId: string): string {
  if (levelId === 'level-02') return 'courseForestPanelTitle';
  if (levelId === 'level-03') return 'courseCavePanelTitle';
  if (levelId === 'level-04') return 'courseHarborPanelTitle';
  if (levelId === 'level-05') return 'courseMountainPanelTitle';
  if (levelId === 'level-06') return 'courseCastlePanelTitle';
  return 'courseLessonTitle';
}

/**
 * The lesson content is kept outside the scenes so later levels can provide
 * their own small, localized course packs without growing WorldScene.
 */
export function getProfessorOctoCoursePages(i18n: I18nManager, levelId = 'level-01'): ProfessorOctoCoursePage[] {
  if (levelId === 'level-02') {
    return [
      { title: i18n.text('courseForestPage1Title'), text: i18n.text('courseForestPage1Text') },
      { title: i18n.text('courseForestPage2Title'), text: i18n.text('courseForestPage2Text') },
      { title: i18n.text('courseForestPage3Title'), text: i18n.text('courseForestPage3Text'), command: 'git add fichier.txt' },
      { title: i18n.text('courseForestPage4Title'), text: i18n.text('courseForestPage4Text'), command: i18n.text('courseForestPage4Commands') },
      {
        title: i18n.text('courseForestPage5Title'),
        text: i18n.text('courseForestPage5Text'),
        steps: i18n.text('courseForestPage5Steps'),
        result: i18n.text('courseForestPage5Result'),
      },
      { title: i18n.text('courseForestPage6Title'), text: i18n.text('courseForestPage6Text'), action: 'practice' },
    ];
  }
  if (levelId === 'level-03') {
    return [
      { title: i18n.text('courseCavePage1Title'), text: i18n.text('courseCavePage1Text') },
      { title: i18n.text('courseCavePage2Title'), text: i18n.text('courseCavePage2Text') },
      { title: i18n.text('courseCavePage3Title'), text: i18n.text('courseCavePage3Text'), command: 'git commit -m "Mon premier souvenir"' },
      { title: i18n.text('courseCavePage4Title'), text: i18n.text('courseCavePage4Text'), command: i18n.text('courseCavePage4Commands') },
      {
        title: i18n.text('courseCavePage5Title'),
        text: i18n.text('courseCavePage5Text'),
        steps: i18n.text('courseCavePage5Steps'),
        result: i18n.text('courseCavePage5Result'),
      },
      { title: i18n.text('courseCavePage6Title'), text: i18n.text('courseCavePage6Text'), action: 'practice' },
    ];
  }
  if (levelId === 'level-04') {
    return [
      { title: i18n.text('courseHarborPage1Title'), text: i18n.text('courseHarborPage1Text') },
      { title: i18n.text('courseHarborPage2Title'), text: i18n.text('courseHarborPage2Text') },
      { title: i18n.text('courseHarborPage3Title'), text: i18n.text('courseHarborPage3Text'), command: 'git push origin main' },
      { title: i18n.text('courseHarborPage4Title'), text: i18n.text('courseHarborPage4Text'), command: 'git pull origin main' },
      {
        title: i18n.text('courseHarborPage5Title'),
        text: i18n.text('courseHarborPage5Text'),
        steps: i18n.text('courseHarborPage5Steps'),
        result: i18n.text('courseHarborPage5Result'),
      },
      { title: i18n.text('courseHarborPage6Title'), text: i18n.text('courseHarborPage6Text'), action: 'practice' },
    ];
  }
  if (levelId === 'level-05') {
    return [
      { title: i18n.text('courseMountainPage1Title'), text: i18n.text('courseMountainPage1Text') },
      { title: i18n.text('courseMountainPage2Title'), text: i18n.text('courseMountainPage2Text') },
      { title: i18n.text('courseMountainPage3Title'), text: i18n.text('courseMountainPage3Text'), command: 'git branch feature' },
      { title: i18n.text('courseMountainPage4Title'), text: i18n.text('courseMountainPage4Text'), command: i18n.text('courseMountainPage4Commands') },
      {
        title: i18n.text('courseMountainPage5Title'),
        text: i18n.text('courseMountainPage5Text'),
        steps: i18n.text('courseMountainPage5Steps'),
        result: i18n.text('courseMountainPage5Result'),
      },
      { title: i18n.text('courseMountainPage6Title'), text: i18n.text('courseMountainPage6Text'), action: 'practice' },
    ];
  }
  if (levelId === 'level-06') {
    return [
      { title: i18n.text('courseCastlePage1Title'), text: i18n.text('courseCastlePage1Text') },
      { title: i18n.text('courseCastlePage2Title'), text: i18n.text('courseCastlePage2Text') },
      { title: i18n.text('courseCastlePage3Title'), text: i18n.text('courseCastlePage3Text'), command: 'git merge main' },
      { title: i18n.text('courseCastlePage4Title'), text: i18n.text('courseCastlePage4Text'), command: i18n.text('courseCastlePage4Commands') },
      {
        title: i18n.text('courseCastlePage5Title'),
        text: i18n.text('courseCastlePage5Text'),
        steps: i18n.text('courseCastlePage5Steps'),
        result: i18n.text('courseCastlePage5Result'),
      },
      { title: i18n.text('courseCastlePage6Title'), text: i18n.text('courseCastlePage6Text'), action: 'practice' },
    ];
  }
  return [
    { title: i18n.text('coursePage1Title'), text: i18n.text('coursePage1Text') },
    { title: i18n.text('coursePage2Title'), text: i18n.text('coursePage2Text') },
    { title: i18n.text('coursePage3Title'), text: i18n.text('coursePage3Text'), command: 'git init' },
    { title: i18n.text('coursePage4Title'), text: i18n.text('coursePage4Text') },
    {
      title: i18n.text('coursePage5Title'),
      text: i18n.text('coursePage5Text'),
      steps: i18n.text('coursePage5Steps'),
      result: i18n.text('coursePage5Result'),
    },
    { title: i18n.text('coursePage6Title'), text: i18n.text('coursePage6Text'), action: 'practice' },
  ];
}
