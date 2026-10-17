export type Locale = 'fr' | 'en' | 'ar';
export type TouchControlsMode = 'auto' | 'always';
export type LocalizedText = { fr: string; en?: string; ar?: string };
export type Point = { x: number; y: number };
export type Rectangle = { x: number; y: number; width: number; height: number };

export type LevelObjectKind = 'crystal' | 'chest' | 'scroll';

export interface LevelObjectDefinition {
  id: string;
  kind: LevelObjectKind;
  position: Point;
  xp?: number;
  itemId?: string;
  dialogueId?: string;
}

export interface DialogueDefinition {
  id: string;
  speaker: string;
  text: LocalizedText;
}

export type QuestStepKind = 'dialogue' | 'git-command' | 'collect' | 'open-exit';

export interface QuestStepDefinition {
  id: string;
  kind: QuestStepKind;
  dialogueId?: string;
  operation?: GitOperation;
  objectId?: string;
  itemId?: string;
}

export interface QuestDefinition {
  id: string;
  title: LocalizedText;
  steps: QuestStepDefinition[];
}

export type GitOperation = 'init' | 'add' | 'commit' | 'push' | 'pull' | 'branch' | 'switch' | 'merge';

export interface LevelDefinition {
  id: string;
  order: number;
  title: LocalizedText;
  map: { path: string };
  theme: { sky: string; ground: string; accent: string };
  playerSpawn: Point;
  mentor: Point;
  objects: LevelObjectDefinition[];
  dialogues: DialogueDefinition[];
  quest: QuestDefinition;
  gitCommands: GitOperation[];
  key: { itemId: string; objectId: string };
  exit: { position: Point; requiredItemId: string };
}

export interface TiledMapJson {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: Array<{
    name: string;
    type: string;
    data?: number[];
    objects?: TiledObject[];
  }>;
}

export interface TiledObject {
  id: number;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TiledMapData {
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  ground: number[];
  decorations: TiledObject[];
  objects: TiledObject[];
  colliders: Rectangle[];
}
