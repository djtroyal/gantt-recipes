import type { GanttLayout } from '../../types/gantt';
import type { Recipe } from '../../types/recipe';

interface ConnectorLineProps {
  recipe: Recipe;
  layout: GanttLayout;
}

export function ConnectorLines({ recipe, layout }: ConnectorLineProps) {
  const lines: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];

  for (const ing of recipe.ingredients) {
    if (!ing.dependsOn?.length) continue;
    const targetPos = layout.ingredientPositions.find((p) => p.id === ing.id);
    if (!targetPos) continue;

    // Find the start of the first segment of this ingredient
    const targetBar = layout.bars.find((b) => b.ingredientId === ing.id);
    if (!targetBar) continue;

    for (const depId of ing.dependsOn) {
      const sourcePos = layout.ingredientPositions.find((p) => p.id === depId);
      if (!sourcePos) continue;

      // Find the end of the last segment of the dependency
      const sourceBars = layout.bars.filter((b) => b.ingredientId === depId);
      const lastSourceBar = sourceBars[sourceBars.length - 1];
      if (!lastSourceBar) continue;

      lines.push({
        x1: lastSourceBar.x + lastSourceBar.width,
        y1: sourcePos.y,
        x2: targetBar.x,
        y2: targetPos.y,
        key: `${depId}-${ing.id}`,
      });
    }
  }

  return (
    <g className="connector-lines">
      {lines.map((line) => (
        <g key={line.key}>
          <line
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="#9ca3af"
            strokeWidth={1}
            strokeDasharray="3,3"
            markerEnd="url(#arrowhead)"
          />
        </g>
      ))}
      {lines.length > 0 && (
        <defs>
          <marker
            id="arrowhead"
            markerWidth="6"
            markerHeight="4"
            refX="6"
            refY="2"
            orient="auto"
          >
            <polygon points="0 0, 6 2, 0 4" fill="#9ca3af" />
          </marker>
        </defs>
      )}
    </g>
  );
}
