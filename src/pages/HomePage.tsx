import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRecipeStore } from '../stores/recipe-store';
import { RecipeGrid } from '../components/browse/RecipeGrid';
import { SearchBar } from '../components/browse/SearchBar';

export function HomePage() {
  const {
    initialize,
    searchQuery,
    setSearchQuery,
    selectedTags,
    setSelectedTags,
    getFilteredRecipes,
    getAllTags,
  } = useRecipeStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const recipes = getFilteredRecipes();
  const tags = getAllTags();

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Griddle Recipes</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Visual cook maps for griddle mastery
          </p>
        </div>
        <Link
          to="/editor"
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          + New Recipe
        </Link>
      </div>

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        tags={tags}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
      />

      <RecipeGrid recipes={recipes} />
    </div>
  );
}
