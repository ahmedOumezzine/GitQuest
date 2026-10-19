import type { I18nManager } from '../../managers/I18nManager';

export interface ProfessorOctoCoursePage {
  title: string;
  text: string;
  command?: string;
  steps?: string;
  result?: string;
  action?: 'practice';
}

/**
 * The lesson content is kept outside the scenes so later levels can provide
 * their own small, localized course packs without growing WorldScene.
 */
export function getProfessorOctoCoursePages(i18n: I18nManager): ProfessorOctoCoursePage[] {
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
