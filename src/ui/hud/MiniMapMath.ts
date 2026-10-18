import type { Point } from '../../models/game';

export function minimapPoint(point: Point, mapWidth: number, mapHeight: number, tileWidth: number, tileHeight: number, width: number, height: number): Point {
  return {
    x: Math.max(0, Math.min(width, (point.x / (mapWidth * tileWidth)) * width)),
    y: Math.max(0, Math.min(height, (point.y / (mapHeight * tileHeight)) * height)),
  };
}

export function minimapGroundColor(gid: number): number {
  if (gid === 0) return 0x18233e;
  if (gid === 3) return 0x2d9bb7;
  if (gid >= 70) return 0x5d8e5a;
  return [0x6f9b5c, 0x7fa866, 0x8da96a, 0x78945d][gid % 4];
}
