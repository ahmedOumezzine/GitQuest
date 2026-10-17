import type { LevelDefinition, Point, TiledMapData, TiledMapJson, TiledObject } from '../models/game';

/** Resolve a named Tiled anchor while keeping a data-definition fallback. */
export function resolveTiledObjectPoint(objects: TiledObject[], type: string, name: string, fallback: Point): Point {
  const object = objects.find((candidate) => candidate.type.toLowerCase() === type.toLowerCase() && candidate.name.toLowerCase() === name.toLowerCase());
  return object ? { x: object.x + object.width / 2, y: object.y + object.height / 2 } : fallback;
}

export class LevelManager {
  private readonly levels = new Map<string, LevelDefinition>();
  private readonly maps = new Map<string, TiledMapData>();

  public constructor(
    private readonly levelIndexPath = '/data/levels/index.json',
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  public async loadAll(): Promise<LevelDefinition[]> {
    const index = await this.fetchJson<{ levels: string[] }>(this.levelIndexPath);
    const definitions = await Promise.all(index.levels.map((path) => this.loadDefinition(path)));
    return definitions.sort((a, b) => a.order - b.order);
  }

  public async loadDefinition(path: string): Promise<LevelDefinition> {
    const level = await this.fetchJson<LevelDefinition>(path);
    this.validateLevel(level);
    this.levels.set(level.id, level);
    return level;
  }

  public async loadMap(level: LevelDefinition): Promise<TiledMapData> {
    const cached = this.maps.get(level.map.path);
    if (cached) return cached;
    const map = await this.fetchJson<TiledMapJson>(level.map.path);
    const data = TiledMapAdapter.fromJson(map);
    this.maps.set(level.map.path, data);
    return data;
  }

  public primeMap(level: LevelDefinition, map: TiledMapJson): void {
    this.maps.set(level.map.path, TiledMapAdapter.fromJson(map));
  }

  public get(id: string): LevelDefinition {
    const level = this.levels.get(id);
    if (!level) throw new Error('Niveau non chargé : ' + id);
    return level;
  }

  private async fetchJson<T>(path: string): Promise<T> {
    // Window.fetch est une méthode Web qui exige son contexte Window.
    // L’appeler via this.fetcher(path) peut déclencher "Illegal invocation" dans Chrome.
    const response = await this.fetcher.call(globalThis, path);
    if (!response.ok) throw new Error('Impossible de charger ' + path + ' (' + response.status + ')');
    return response.json() as Promise<T>;
  }

  private validateLevel(level: LevelDefinition): void {
    if (!level.id || !level.map?.path || !level.quest?.steps?.length || !level.key?.itemId || !level.exit?.requiredItemId) {
      throw new Error('Schéma de niveau invalide : ' + (level.id || 'inconnu'));
    }
  }
}

export class TiledMapAdapter {
  public static fromJson(map: TiledMapJson): TiledMapData {
    const colliderLayer = map.layers.find((layer) => layer.type === 'objectgroup' && ['collisions', 'colliders'].includes(layer.name.toLowerCase()));
    const groundLayer = map.layers.find((layer) => layer.type === 'tilelayer' && layer.name.toLowerCase() === 'ground');
    const decorationLayer = map.layers.find((layer) => layer.type === 'objectgroup' && layer.name.toLowerCase() === 'decorations');
    const objectLayer = map.layers.find((layer) => layer.type === 'objectgroup' && layer.name.toLowerCase() === 'objects');
    return {
      width: map.width,
      height: map.height,
      tileWidth: map.tilewidth,
      tileHeight: map.tileheight,
      ground: groundLayer?.data ?? [],
      decorations: decorationLayer?.objects ?? [],
      objects: objectLayer?.objects ?? [],
      colliders: (colliderLayer?.objects ?? []).map((object) => ({
        x: object.x, y: object.y, width: object.width, height: object.height,
      })),
    };
  }
}
