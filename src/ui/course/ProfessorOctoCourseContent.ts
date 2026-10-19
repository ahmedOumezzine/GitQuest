import type { I18nManager } from '../../managers/I18nManager';

export interface ProfessorOctoCoursePage {
  title: string;
  text: string;
  command?: string;
  steps?: string;
  result?: string;
  action?: 'practice' | 'close';
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
