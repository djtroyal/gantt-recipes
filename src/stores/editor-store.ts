import { create } from 'zustand';
import type { Recipe, Ingredient, Phase, PrepTask, BarSegment } from '../types/recipe';

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function createEmptyRecipe(): Recipe {
  return {
    id: generateId(),
    slug: '',
    title: '',
    description: '',
    totalTimeMinutes: 8,
    defaultServings: 2,
    tags: [],
    phases: [{ id: generateId(), name: 'Cook', startMinute: 0, endMinute: 8 }],
    ingredients: [],
    prepTasks: [],
    griddlePlacements: [],
    plateUpStartMinute: 7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function createEmptyIngredient(): Ingredient {
  return {
    id: generateId(),
    name: '',
    quantity: '',
    segments: [],
    sensoryMarkers: [],
    failureModes: [],
  };
}

interface EditorStore {
  recipe: Recipe;
  selectedIngredientId: string | null;
  isDirty: boolean;

  setRecipe: (recipe: Recipe) => void;
  resetRecipe: () => void;
  loadRecipe: (recipe: Recipe) => void;

  updateField: <K extends keyof Recipe>(key: K, value: Recipe[K]) => void;
  setTitle: (title: string) => void;
  setDescription: (desc: string) => void;
  setTotalTime: (minutes: number) => void;
  setTags: (tags: string[]) => void;

  addIngredient: () => void;
  removeIngredient: (id: string) => void;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  selectIngredient: (id: string | null) => void;

  addSegment: (ingredientId: string, segment: BarSegment) => void;
  removeSegment: (ingredientId: string, segmentIndex: number) => void;
  updateSegment: (ingredientId: string, segmentIndex: number, updates: Partial<BarSegment>) => void;

  addPhase: () => void;
  removePhase: (id: string) => void;
  updatePhase: (id: string, updates: Partial<Phase>) => void;

  addPrepTask: () => void;
  removePrepTask: (id: string) => void;
  updatePrepTask: (id: string, updates: Partial<PrepTask>) => void;

  getRecipe: () => Recipe;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  recipe: createEmptyRecipe(),
  selectedIngredientId: null,
  isDirty: false,

  setRecipe: (recipe) => set({ recipe, isDirty: true }),
  resetRecipe: () => set({ recipe: createEmptyRecipe(), isDirty: false, selectedIngredientId: null }),
  loadRecipe: (recipe) => set({ recipe: { ...recipe }, isDirty: false, selectedIngredientId: null }),

  updateField: (key, value) =>
    set((s) => ({ recipe: { ...s.recipe, [key]: value }, isDirty: true })),

  setTitle: (title) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    set((s) => ({ recipe: { ...s.recipe, title, slug }, isDirty: true }));
  },
  setDescription: (description) =>
    set((s) => ({ recipe: { ...s.recipe, description }, isDirty: true })),
  setTotalTime: (totalTimeMinutes) =>
    set((s) => ({ recipe: { ...s.recipe, totalTimeMinutes }, isDirty: true })),
  setTags: (tags) =>
    set((s) => ({ recipe: { ...s.recipe, tags }, isDirty: true })),

  addIngredient: () =>
    set((s) => {
      const ing = createEmptyIngredient();
      return {
        recipe: { ...s.recipe, ingredients: [...s.recipe.ingredients, ing] },
        selectedIngredientId: ing.id,
        isDirty: true,
      };
    }),

  removeIngredient: (id) =>
    set((s) => ({
      recipe: { ...s.recipe, ingredients: s.recipe.ingredients.filter((i) => i.id !== id) },
      selectedIngredientId: s.selectedIngredientId === id ? null : s.selectedIngredientId,
      isDirty: true,
    })),

  updateIngredient: (id, updates) =>
    set((s) => ({
      recipe: {
        ...s.recipe,
        ingredients: s.recipe.ingredients.map((i) => (i.id === id ? { ...i, ...updates } : i)),
      },
      isDirty: true,
    })),

  selectIngredient: (id) => set({ selectedIngredientId: id }),

  addSegment: (ingredientId, segment) =>
    set((s) => ({
      recipe: {
        ...s.recipe,
        ingredients: s.recipe.ingredients.map((i) =>
          i.id === ingredientId ? { ...i, segments: [...i.segments, segment] } : i
        ),
      },
      isDirty: true,
    })),

  removeSegment: (ingredientId, segmentIndex) =>
    set((s) => ({
      recipe: {
        ...s.recipe,
        ingredients: s.recipe.ingredients.map((i) =>
          i.id === ingredientId
            ? { ...i, segments: i.segments.filter((_, idx) => idx !== segmentIndex) }
            : i
        ),
      },
      isDirty: true,
    })),

  updateSegment: (ingredientId, segmentIndex, updates) =>
    set((s) => ({
      recipe: {
        ...s.recipe,
        ingredients: s.recipe.ingredients.map((i) =>
          i.id === ingredientId
            ? {
                ...i,
                segments: i.segments.map((seg, idx) =>
                  idx === segmentIndex ? { ...seg, ...updates } : seg
                ),
              }
            : i
        ),
      },
      isDirty: true,
    })),

  addPhase: () =>
    set((s) => {
      const last = s.recipe.phases[s.recipe.phases.length - 1];
      const start = last ? last.endMinute : 0;
      return {
        recipe: {
          ...s.recipe,
          phases: [
            ...s.recipe.phases,
            { id: generateId(), name: 'New Phase', startMinute: start, endMinute: start + 2 },
          ],
        },
        isDirty: true,
      };
    }),

  removePhase: (id) =>
    set((s) => ({
      recipe: { ...s.recipe, phases: s.recipe.phases.filter((p) => p.id !== id) },
      isDirty: true,
    })),

  updatePhase: (id, updates) =>
    set((s) => ({
      recipe: {
        ...s.recipe,
        phases: s.recipe.phases.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      },
      isDirty: true,
    })),

  addPrepTask: () =>
    set((s) => ({
      recipe: {
        ...s.recipe,
        prepTasks: [
          ...s.recipe.prepTasks,
          { id: generateId(), timing: 'day-of', icon: 'slice', description: '', ingredientIds: [] },
        ],
      },
      isDirty: true,
    })),

  removePrepTask: (id) =>
    set((s) => ({
      recipe: { ...s.recipe, prepTasks: s.recipe.prepTasks.filter((p) => p.id !== id) },
      isDirty: true,
    })),

  updatePrepTask: (id, updates) =>
    set((s) => ({
      recipe: {
        ...s.recipe,
        prepTasks: s.recipe.prepTasks.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      },
      isDirty: true,
    })),

  getRecipe: () => {
    const r = get().recipe;
    return { ...r, updatedAt: new Date().toISOString() };
  },
}));
