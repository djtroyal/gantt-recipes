import { Link } from 'react-router-dom';
import type { Recipe } from '../../types/recipe';
import { GanttChart } from '../gantt/GanttChart';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link
      to={`/recipe/${recipe.slug}`}
      className="block bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all overflow-hidden"
    >
      <div className="p-4 overflow-hidden" style={{ maxHeight: 180 }}>
        <div className="transform scale-[0.45] origin-top-left" style={{ width: '220%' }}>
          <GanttChart recipe={recipe} width={900} />
        </div>
      </div>
      <div className="px-4 pb-4 pt-0">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-900 text-base">{recipe.title}</h3>
          <Link
            to={`/editor/${recipe.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-gray-400 hover:text-blue-600 px-1.5 py-0.5 rounded hover:bg-blue-50 transition-colors flex-shrink-0"
          >
            Edit
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{recipe.description}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {recipe.totalTimeMinutes} min
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {recipe.ingredients.length} ingredients
          </span>
          {recipe.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
