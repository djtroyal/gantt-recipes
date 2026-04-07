import type { Recipe } from '../../types/recipe';
import { zoneColors } from '../../lib/color-palette';

interface ActiveTaskPanelProps {
  recipe: Recipe;
  cursorMinute: number;
}

export function ActiveTaskPanel({ recipe, cursorMinute }: ActiveTaskPanelProps) {
  const activeTasks: {
    ingredient: string;
    zone: string;
    action: string;
    pattern: string;
  }[] = [];

  for (const ing of recipe.ingredients) {
    for (const seg of ing.segments) {
      if (cursorMinute >= seg.startMinute && cursorMinute <= seg.endMinute) {
        const activeAction = seg.actions.find(
          (a) => Math.abs(a.minuteMark - cursorMinute) < 0.3
        );
        activeTasks.push({
          ingredient: ing.name,
          zone: seg.zone,
          action: activeAction?.note || (seg.pattern === 'hatched' ? 'Leave it alone' : seg.pattern === 'dotted' ? 'Resting' : 'Active'),
          pattern: seg.pattern,
        });
      }
    }
  }

  if (activeTasks.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        Right Now ({cursorMinute.toFixed(1)} min)
      </div>
      <div className="space-y-1.5">
        {activeTasks.map((task, i) => (
          <div key={i} className="flex items-start gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0"
              style={{ backgroundColor: zoneColors[task.zone as keyof typeof zoneColors]?.fill }}
            />
            <div>
              <div className="text-sm font-medium text-gray-800">{task.ingredient}</div>
              <div className="text-xs text-gray-500">{task.action}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
