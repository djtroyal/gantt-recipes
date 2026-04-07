interface IngredientPosition {
  id: string;
  name: string;
  y: number;
  hasPrepDot: boolean;
}

interface IngredientAxisProps {
  ingredients: IngredientPosition[];
  chartLeft: number;
}

export function IngredientAxis({ ingredients, chartLeft }: IngredientAxisProps) {
  return (
    <g className="ingredient-axis">
      {ingredients.map((ing) => (
        <g key={ing.id}>
          <text
            x={chartLeft - 12}
            y={ing.y}
            textAnchor="end"
            dominantBaseline="central"
            fontSize={12}
            fontWeight={500}
            fill="#374151"
            fontFamily="system-ui, sans-serif"
          >
            {ing.name}
          </text>
          {ing.hasPrepDot && (
            <circle
              cx={chartLeft - 6}
              cy={ing.y - 8}
              r={3}
              fill="#f59e0b"
              stroke="#d97706"
              strokeWidth={0.5}
            />
          )}
        </g>
      ))}
    </g>
  );
}
