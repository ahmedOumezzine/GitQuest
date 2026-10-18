import type { Point } from '../../models/game';

export function directionArrow(from: Point, to: Point): string {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const index = (Math.round(angle / (Math.PI / 4)) + 8) % 8;
  return ['→', '↘', '↓', '↙', '←', '↖', '↑', '↗'][index];
}
