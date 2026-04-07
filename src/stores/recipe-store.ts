import { create } from 'zustand';
import type { Recipe } from '../types/recipe';
import { sampleRecipes } from '../data/sample-recipes';
import { loadUserRecipes, saveUserRecipe, deleteUserRecipe } from '../lib/storage';

interface RecipeStore {
  recipes: Recipe[];
  searchQuery: string;
  selectedTags: string[];
  initialized: boolean;

  initialize: () => Promise<void>;
  setSearchQuery: (q: string) => void;
  setSelectedTags: (tags: string[]) => void;
  addRecipe: (recipe: Recipe) => Promise<void>;
  removeRecipe: (id: string) => Promise<void>;
  getFilteredRecipes: () => Recipe[];
  getRecipeBySlug: (slug: string) => Recipe | undefined;
  getAllTags: () => string[];
}

export const useRecipeStore = create<RecipeStore>((set, get) => ({
  recipes: [...sampleRecipes],
  searchQuery: '',
  selectedTags: [],
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;
    try {
      const userRecipes = await loadUserRecipes();
      set({
        recipes: [...sampleRecipes, ...userRecipes],
        initialized: true,
      });
    } catch {
      set({ initialized: true });
    }
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  setSelectedTags: (tags) => set({ selectedTags: tags }),

  addRecipe: async (recipe) => {
    await saveUserRecipe(recipe);
    set((state) => ({
      recipes: [...state.recipes.filter((r) => r.id !== recipe.id), recipe],
    }));
  },

  removeRecipe: async (id) => {
    await deleteUserRecipe(id);
    set((state) => ({
      recipes: state.recipes.filter((r) => r.id !== id),
    }));
  },

  getFilteredRecipes: () => {
    const { recipes, searchQuery, selectedTags } = get();
    let filtered = recipes;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (selectedTags.length > 0) {
      filtered = filtered.filter((r) =>
        selectedTags.every((tag) => r.tags.includes(tag))
      );
    }
    return filtered;
  },

  getRecipeBySlug: (slug) => get().recipes.find((r) => r.slug === slug),

  getAllTags: () => {
    const tags = new Set<string>();
    get().recipes.forEach((r) => r.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  },
}));
