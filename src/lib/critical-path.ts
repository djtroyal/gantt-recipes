import type { Recipe, Ingredient } from '../types/recipe';

export function identifyCriticalPath(recipe: Recipe): string | null {
  // The critical path is the ingredient with the longest total active (solid pattern) cooking time
  let maxActive = 0;
  let criticalId: string | null = null;

  for (const ing of recipe.ingredients) {
    const activeTime = ing.segments
      .filter((s) => s.pattern === 'solid')
      .reduce((sum, s) => sum + (s.endMinute - s.startMinute), 0);
    if (activeTime > maxActive) {
      maxActive = activeTime;
      criticalId = ing.id;
    }
  }
  return criticalId;
}

export function getIngredientActiveRange(ing: Ingredient): { start: number; end: number } {
  const solidSegs = ing.segments.filter((s) => s.pattern === 'solid');
  if (solidSegs.length === 0) return { start: 0, end: 0 };
  return {
    start: Math.min(...solidSegs.map((s) => s.startMinute)),
    end: Math.max(...solidSegs.map((s) => s.endMinute)),
  };
}
