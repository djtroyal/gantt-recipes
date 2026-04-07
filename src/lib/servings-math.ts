/**
 * Time does not scale linearly with quantity for most cooking operations.
 * Doubling the steak does not double sear time.
 * Uses a diminishing-returns curve.
 */
export function scaleTime(baseMinutes: number, servingsMultiplier: number): number {
  if (servingsMultiplier <= 0) return baseMinutes;
  return baseMinutes * Math.pow(servingsMultiplier, 0.3);
}

export function scaleQuantity(baseQuantity: number, servingsMultiplier: number): number {
  return baseQuantity * servingsMultiplier;
}
