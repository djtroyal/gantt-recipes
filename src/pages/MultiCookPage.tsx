import { useEffect, useState } from 'react';
import { useRecipeStore } from '../stores/recipe-store';
import { GanttChart } from '../components/gantt/GanttChart';
import { zoneColors } from '../lib/color-palette';
import type { Recipe, HeatZone } from '../types/recipe';

export function MultiCookPage() {
  const { initialize, recipes } = useRecipeStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const toggleRecipe = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectedRecipes = recipes.filter((r) => selectedIds.includes(r.id));

  // Analyze zone conflicts
  const conflicts = analyzeZoneConflicts(selectedRecipes);
  const maxTime = Math.max(...selectedRecipes.map((r) => r.totalTimeMinutes), 8);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Multi-Cook Planner</h1>
      <p className="text-sm text-gray-500 mb-4">
        Select 2+ recipes to see zone conflicts and parallel cook opportunities
      </p>

      {/* Recipe selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {recipes.map((r) => (
          <button
            key={r.id}
            onClick={() => toggleRecipe(r.id)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              selectedIds.includes(r.id)
                ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {r.title}
          </button>
        ))}
      </div>

      {selectedRecipes.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          Select recipes above to compare
        </div>
      )}

      {/* Zone conflict analysis */}
      {conflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <h3 className="text-sm font-semibold text-red-700 mb-1">Zone Conflicts</h3>
          <ul className="space-y-1">
            {conflicts.map((c, i) => (
              <li key={i} className="text-xs text-red-600 flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: zoneColors[c.zone].fill }}
                />
                {c.zone} zone: {c.recipes.join(' & ')} overlap at {c.startMinute.toFixed(1)}–{c.endMinute.toFixed(1)} min
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedRecipes.length >= 2 && conflicts.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <h3 className="text-sm font-semibold text-green-700">No zone conflicts!</h3>
          <p className="text-xs text-green-600">These recipes can run in parallel on the same griddle.</p>
        </div>
      )}

      {/* Side-by-side charts on shared time axis */}
      {selectedRecipes.length > 0 && (
        <div className="space-y-6">
          {selectedRecipes.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">{recipe.title}</h3>
              <div className="overflow-x-auto">
                <GanttChart
                  recipe={{ ...recipe, totalTimeMinutes: maxTime }}
                  width={900}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Combined zone timeline */}
      {selectedRecipes.length >= 2 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Zone Occupancy Timeline</h3>
          <ZoneTimeline recipes={selectedRecipes} maxTime={maxTime} />
        </div>
      )}
    </div>
  );
}

interface ZoneConflict {
  zone: HeatZone;
  recipes: string[];
  startMinute: number;
  endMinute: number;
}

function analyzeZoneConflicts(recipes: Recipe[]): ZoneConflict[] {
  const conflicts: ZoneConflict[] = [];
  const zones: HeatZone[] = ['high', 'medium', 'cool'];

  for (const zone of zones) {
    const occupancies: { recipe: string; start: number; end: number }[] = [];

    for (const recipe of recipes) {
      for (const ing of recipe.ingredients) {
        for (const seg of ing.segments) {
          if (seg.zone === zone && seg.pattern === 'solid') {
            occupancies.push({ recipe: recipe.title, start: seg.startMinute, end: seg.endMinute });
          }
        }
      }
    }

    // Check for overlaps between different recipes
    for (let i = 0; i < occupancies.length; i++) {
      for (let j = i + 1; j < occupancies.length; j++) {
        const a = occupancies[i];
        const b = occupancies[j];
        if (a.recipe === b.recipe) continue;
        const overlapStart = Math.max(a.start, b.start);
        const overlapEnd = Math.min(a.end, b.end);
        if (overlapStart < overlapEnd) {
          const existing = conflicts.find(
            (c) => c.zone === zone && c.recipes.includes(a.recipe) && c.recipes.includes(b.recipe)
          );
          if (!existing) {
            conflicts.push({
              zone,
              recipes: [a.recipe, b.recipe],
              startMinute: overlapStart,
              endMinute: overlapEnd,
            });
          }
        }
      }
    }
  }
  return conflicts;
}

function ZoneTimeline({ recipes, maxTime }: { recipes: Recipe[]; maxTime: number }) {
  const zones: HeatZone[] = ['high', 'medium', 'cool'];
  const width = 800;
  const rowHeight = 30;
  const leftPad = 80;

  return (
    <svg width={width + leftPad + 20} height={zones.length * rowHeight + 40}>
      {zones.map((zone, zi) => {
        const y = zi * rowHeight + 10;
        const c = zoneColors[zone];

        // Collect all solid segments in this zone across all recipes
        const segments: { start: number; end: number; recipe: string }[] = [];
        for (const recipe of recipes) {
          for (const ing of recipe.ingredients) {
            for (const seg of ing.segments) {
              if (seg.zone === zone && seg.pattern === 'solid') {
                segments.push({ start: seg.startMinute, end: seg.endMinute, recipe: recipe.title });
              }
            }
          }
        }

        return (
          <g key={zone}>
            <text x={leftPad - 8} y={y + rowHeight / 2 + 1} textAnchor="end" fontSize={11} fill="#6b7280" dominantBaseline="central">
              {zone}
            </text>
            <rect x={leftPad} y={y} width={width} height={rowHeight - 4} rx={3} fill="#f9fafb" stroke="#e5e7eb" strokeWidth={0.5} />
            {segments.map((seg, si) => {
              const x = leftPad + (seg.start / maxTime) * width;
              const w = ((seg.end - seg.start) / maxTime) * width;
              return (
                <rect key={si} x={x} y={y + 3} width={w} height={rowHeight - 10} rx={2} fill={c.fill} opacity={0.7}>
                  <title>{seg.recipe}: {seg.start}–{seg.end}m</title>
                </rect>
              );
            })}
          </g>
        );
      })}
      {/* Time ticks */}
      {Array.from({ length: Math.ceil(maxTime) + 1 }, (_, i) => i).map((m) => (
        <text key={m} x={leftPad + (m / maxTime) * width} y={zones.length * rowHeight + 20} textAnchor="middle" fontSize={10} fill="#9ca3af">
          {m}
        </text>
      ))}
    </svg>
  );
}
