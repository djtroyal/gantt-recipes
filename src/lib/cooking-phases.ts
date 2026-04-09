export interface CookingPhaseTemplate {
  id: string;
  name: string;
  description: string;
  typicalOrder: number;
}

export const COOKING_PHASES: CookingPhaseTemplate[] = [
  { id: 'prep', name: 'Prep', description: 'Mise en place, final cuts, oil the griddle', typicalOrder: 0 },
  { id: 'preheat', name: 'Preheat', description: 'Bring griddle to target temperature', typicalOrder: 1 },
  { id: 'sear', name: 'Sear', description: 'High-heat browning and crust formation', typicalOrder: 2 },
  { id: 'toast', name: 'Toast', description: 'Toasting buns, bread, or tortillas', typicalOrder: 3 },
  { id: 'steam', name: 'Steam', description: 'Covered steaming for melt or cook-through', typicalOrder: 4 },
  { id: 'saute', name: 'Sauté', description: 'Active tossing and stirring at medium-high heat', typicalOrder: 5 },
  { id: 'crisp', name: 'Crisp', description: 'Hands-off crisping with minimal contact', typicalOrder: 6 },
  { id: 'sauce', name: 'Sauce', description: 'Deglazing, reducing, or applying sauce', typicalOrder: 7 },
  { id: 'build', name: 'Build', description: 'Assembly and stacking on the griddle', typicalOrder: 8 },
  { id: 'rest', name: 'Rest', description: 'Cool-zone resting before plate-up', typicalOrder: 9 },
  { id: 'plate', name: 'Plate', description: 'Final plating and garnish', typicalOrder: 10 },
];

export const PHASE_NAMES = COOKING_PHASES.map((p) => p.name);
