import { get, set, del, keys } from 'idb-keyval';
import type { Recipe } from '../types/recipe';

const PREFIX = 'gantt-recipe-';

export async function saveUserRecipe(recipe: Recipe): Promise<void> {
  await set(PREFIX + recipe.id, recipe);
}

export async function loadUserRecipes(): Promise<Recipe[]> {
  const allKeys = await keys();
  const recipeKeys = allKeys.filter(
    (k) => typeof k === 'string' && k.startsWith(PREFIX)
  );
  const recipes: Recipe[] = [];
  for (const key of recipeKeys) {
    const recipe = await get<Recipe>(key);
    if (recipe) recipes.push(recipe);
  }
  return recipes;
}

export async function deleteUserRecipe(id: string): Promise<void> {
  await del(PREFIX + id);
}

export async function getUserRecipe(id: string): Promise<Recipe | undefined> {
  return get<Recipe>(PREFIX + id);
}
