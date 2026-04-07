import type { Recipe } from '../types/recipe';
import smashBurgers from './recipes/smash-burgers.json';
import flankSteakStirFry from './recipes/flank-steak-stir-fry.json';
import friedRice from './recipes/fried-rice.json';

export const sampleRecipes: Recipe[] = [
  smashBurgers as Recipe,
  flankSteakStirFry as Recipe,
  friedRice as Recipe,
];

export function getRecipeBySlug(slug: string): Recipe | undefined {
  return sampleRecipes.find((r) => r.slug === slug);
}
