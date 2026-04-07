import type { Recipe } from '../types/recipe';

export function computeSpatulaCounts(
  recipe: Recipe,
  timeScale: (m: number) => number,
  chartLeft: number
): { minute: number; x: number; count: number }[] {
  const result: { minute: number; x: number; count: number }[] = [];
  const step = 0.5;

  for (let m = 0; m <= recipe.totalTimeMinutes; m += step) {
    let count = 0;
    for (const ing of recipe.ingredients) {
      for (const seg of ing.segments) {
        if (seg.pattern === 'solid' && m >= seg.startMinute && m < seg.endMinute) {
          count++;
          break;
        }
      }
    }
    result.push({
      minute: m,
      x: chartLeft + timeScale(m),
      count,
    });
  }
  return result;
}
