import type { Point } from '../models/game';

/**
 * Converts a finger offset into a bounded analog vector.
 *
 * The vector keeps its analog strength outside the dead zone, but its length
 * is never greater than one. This is what makes diagonal movement as fast as
 * cardinal movement instead of accidentally multiplying the speed by √2.
 */
export function joystickVectorFromOffset(
  offset: Point,
  radius: number,
  deadZone: number,
): Point {
  const safeRadius = Math.max(1, radius);
  const distance = Math.hypot(offset.x, offset.y);
  if (!Number.isFinite(distance) || distance <= Math.max(0, deadZone)) return { x: 0, y: 0 };

  const strength = Math.min(1, distance / safeRadius);
  return {
    x: (offset.x / distance) * strength,
    y: (offset.y / distance) * strength,
  };
}

/** Keeps the visual joystick knob inside its circular track. */
export function clampJoystickOffset(offset: Point, radius: number): Point {
  const safeRadius = Math.max(0, radius);
  const distance = Math.hypot(offset.x, offset.y);
  if (!Number.isFinite(distance) || distance <= safeRadius || distance === 0) return { ...offset };
  return { x: (offset.x / distance) * safeRadius, y: (offset.y / distance) * safeRadius };
}
