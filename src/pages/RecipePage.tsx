import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useRecipeStore } from '../stores/recipe-store';
import { useInteractiveStore } from '../stores/interactive-store';
import { GanttChart } from '../components/gantt/GanttChart';
import { PrepSection } from '../components/prep/PrepSection';
import { ActiveTaskPanel } from '../components/interactive/ActiveTaskPanel';
import { ServingsScaler } from '../components/interactive/ServingsScaler';
import { GriddleMapView } from '../components/griddle-map/GriddleMapView';

const SPEED_OPTIONS = [
  { label: '1x', value: 1 },
  { label: '2x', value: 2 },
  { label: '4x', value: 4 },
  { label: 'Real-time', value: 1 / 60 },
];

export function RecipePage() {
  const { slug } = useParams<{ slug: string }>();
  const { initialize, getRecipeBySlug } = useRecipeStore();
  const {
    cursorMinute, setCursorMinute,
    isPlaying, setIsPlaying,
    playbackSpeed, setPlaybackSpeed,
    servingsMultiplier, setServingsMultiplier,
  } = useInteractiveStore();

  const [showGriddleMap, setShowGriddleMap] = useState(true);
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const recipe = getRecipeBySlug(slug || '');

  // Playback animation loop
  // At 1x: 1 recipe-minute = 1 real second
  // At real-time (1/60): 1 recipe-minute = 60 real seconds
  useEffect(() => {
    if (!isPlaying || !recipe) return;
    lastTimeRef.current = performance.now();

    const animate = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000; // real seconds elapsed
      lastTimeRef.current = now;
      const current = cursorMinute ?? 0;
      const next = current + dt * playbackSpeed; // recipe-minutes advanced
      if (next >= recipe.totalTimeMinutes) {
        setCursorMinute(recipe.totalTimeMinutes);
        setIsPlaying(false);
        return;
      }
      setCursorMinute(next);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, recipe, cursorMinute, setCursorMinute, setIsPlaying, playbackSpeed]);

  const handlePlayPause = useCallback(() => {
    if (!recipe) return;
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (cursorMinute === null || cursorMinute >= recipe.totalTimeMinutes) {
        setCursorMinute(0);
      }
      setIsPlaying(true);
    }
  }, [isPlaying, cursorMinute, recipe, setIsPlaying, setCursorMinute]);

  // Keyboard controls
  useEffect(() => {
    if (!recipe) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ') { e.preventDefault(); handlePlayPause(); }
      if (e.key === 'ArrowRight') {
        setCursorMinute(Math.min(recipe.totalTimeMinutes, (cursorMinute ?? 0) + 0.25));
      }
      if (e.key === 'ArrowLeft') {
        setCursorMinute(Math.max(0, (cursorMinute ?? 0) - 0.25));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [recipe, cursorMinute, handlePlayPause, setCursorMinute]);

  if (!recipe) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-lg">Recipe not found</p>
        <Link to="/" className="text-blue-500 text-sm mt-2 inline-block">Back to browse</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 mb-1 inline-block no-print">
            &larr; All recipes
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{recipe.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{recipe.description}</p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <ServingsScaler
            defaultServings={recipe.defaultServings}
            multiplier={servingsMultiplier}
            onChange={setServingsMultiplier}
          />
          <Link
            to={`/editor/${recipe.slug}`}
            className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Edit
          </Link>
          <button
            onClick={() => window.print()}
            className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Print
          </button>
        </div>
      </div>

      {/* Prep Section */}
      <PrepSection prepTasks={recipe.prepTasks} />

      {/* Interactive Controls */}
      <div className="flex items-center gap-3 mb-3 no-print">
        <button
          onClick={handlePlayPause}
          className="px-3 py-1.5 text-sm font-medium bg-gray-900 text-white rounded-md hover:bg-gray-800"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        {/* Speed selector */}
        <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
          {SPEED_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => setPlaybackSpeed(opt.value)}
              className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                playbackSpeed === opt.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <input
          type="range"
          min={0}
          max={recipe.totalTimeMinutes}
          step={0.1}
          value={cursorMinute ?? 0}
          onChange={(e) => setCursorMinute(parseFloat(e.target.value))}
          className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />

        <button
          onClick={() => setShowGriddleMap(!showGriddleMap)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md border ${
            showGriddleMap
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          Griddle Map
        </button>
        <span className="text-xs text-gray-400">Space = play/pause, Arrows = step</span>
      </div>

      {/* Main Chart Area — fixed layout, ActiveTaskPanel always present */}
      <div className="flex gap-4">
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4 overflow-x-auto">
          <GanttChart
            recipe={recipe}
            width={900}
            interactive
            cursorMinute={cursorMinute}
            servingsMultiplier={servingsMultiplier}
          />
        </div>

        {/* Active Task Panel — always rendered for stable layout */}
        <div className="w-56 flex-shrink-0 no-print">
          {cursorMinute !== null ? (
            <ActiveTaskPanel recipe={recipe} cursorMinute={cursorMinute} />
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-3 text-xs text-gray-300">
              Play or drag the slider to see active tasks
            </div>
          )}
        </div>
      </div>

      {/* Griddle Map View */}
      {showGriddleMap && (
        <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4 no-print">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Top-Down Griddle View</h3>
          <GriddleMapView recipe={recipe} cursorMinute={cursorMinute ?? 0} />
        </div>
      )}
    </div>
  );
}
