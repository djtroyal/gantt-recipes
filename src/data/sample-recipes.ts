import type { Recipe } from '../types/recipe';
import smashBurgers from './recipes/smash-burgers.json';
import flankSteakStirFry from './recipes/flank-steak-stir-fry.json';
import friedRice from './recipes/fried-rice.json';
import phillyCheesesteak from './recipes/philly-cheesesteak.json';
import chickenQuesadillas from './recipes/chicken-quesadillas.json';
import breakfastSmashHash from './recipes/breakfast-smash-hash.json';
import blackstoneHibachi from './recipes/blackstone-hibachi.json';
import birriaTacos from './recipes/birria-tacos.json';
import oklahomaOnionBurgers from './recipes/oklahoma-onion-burgers.json';
import teriyakiChicken from './recipes/teriyaki-chicken.json';

export const sampleRecipes: Recipe[] = [
  smashBurgers as Recipe,
  flankSteakStirFry as Recipe,
  friedRice as Recipe,
  phillyCheesesteak as Recipe,
  chickenQuesadillas as Recipe,
  breakfastSmashHash as Recipe,
  blackstoneHibachi as Recipe,
  birriaTacos as Recipe,
  oklahomaOnionBurgers as Recipe,
  teriyakiChicken as Recipe,
];

export function getRecipeBySlug(slug: string): Recipe | undefined {
  return sampleRecipes.find((r) => r.slug === slug);
}
