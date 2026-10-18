import type { Point, TiledObject } from '../models/game';

/**
 * Data-driven access rules for the Git terminal.
 *
 * A terminal is represented by a shrine/altar/sanctuary object in the Tiled
 * Decorations layer. Keeping this rule outside WorldScene makes it easy to
 * reuse for future maps and straightforward to test without booting Phaser.
 */
export const TERMINAL_ZONE_RADIUS = 128;

export function isTerminalZone(definition: Pick<TiledObject, 'type' | 'name'>): boolean {
  return /shrine|altar|sanctuary|terminal/i.test(`${definition.type} ${definition.name}`);
}

export function terminalZoneCenter(definition: Pick<TiledObject, 'x' | 'y' | 'width' | 'height'>): Point {
  return {
    x: definition.x + (definition.width || 96) / 2,
    y: definition.y + (definition.height || 96) / 2,
  };
}

export function findNearbyTerminal(
  player: Point,
  decorations: TiledObject[],
  radius = TERMINAL_ZONE_RADIUS,
): TiledObject | undefined {
  return decorations.find((definition) => {
    if (!isTerminalZone(definition)) return false;
    const center = terminalZoneCenter(definition);
    return Math.hypot(player.x - center.x, player.y - center.y) <= radius;
  });
}
