import { useState, useRef } from 'react';
import { useEditorStore } from '../stores/editor-store';
import { useRecipeStore } from '../stores/recipe-store';
import { GanttChart } from '../components/gantt/GanttChart';
import { PrepSection } from '../components/prep/PrepSection';
import type { Recipe, HeatZone, BarPattern, PrepIconType, PrepTiming, CookActionIcon } from '../types/recipe';

const ZONES: HeatZone[] = ['high', 'medium', 'cool'];
const PATTERNS: BarPattern[] = ['solid', 'hatched', 'dotted'];
const PREP_ICONS: PrepIconType[] = ['whisk', 'marinate', 'temper', 'slice', 'pat-dry', 'preheat'];
const PREP_TIMINGS: PrepTiming[] = ['night-before', 'day-of', 'last-30-seconds'];
const ACTION_ICONS: CookActionIcon[] = ['hands-off', 'flip', 'cover', 'toss', 'steam', 'oil-squirt', 'liquid-squirt'];

export function EditorPage() {
  const store = useEditorStore();
  const { addRecipe } = useRecipeStore();
  const [importJson, setImportJson] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    const recipe = store.getRecipe();
    if (!recipe.title) return;
    await addRecipe(recipe);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const recipe = store.getRecipe();
    const blob = new Blob([JSON.stringify(recipe, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recipe.slug || 'recipe'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      const recipe = JSON.parse(importJson) as Recipe;
      store.loadRecipe(recipe);
      setShowImport(false);
      setImportJson('');
    } catch {
      alert('Invalid JSON');
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const recipe = JSON.parse(ev.target?.result as string) as Recipe;
        store.loadRecipe(recipe);
      } catch {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const selectedIng = store.recipe.ingredients.find((i) => i.id === store.selectedIngredientId);

  return (
    <div className="flex gap-6">
      {/* Editor Panel */}
      <div className="w-[420px] flex-shrink-0 space-y-4 max-h-[calc(100vh-100px)] overflow-y-auto pr-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Recipe Editor</h1>
          <div className="flex gap-2">
            <button onClick={() => setShowImport(!showImport)} className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">
              Import
            </button>
            <button onClick={handleExport} className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200">
              Export
            </button>
            <button onClick={handleSave} className={`text-xs px-3 py-1 rounded font-medium ${saved ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
              {saved ? 'Saved!' : 'Save'}
            </button>
          </div>
        </div>

        {/* Import Section */}
        {showImport && (
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder="Paste recipe JSON here..."
              className="w-full h-32 text-xs font-mono p-2 border border-gray-200 rounded bg-white"
            />
            <div className="flex gap-2">
              <button onClick={handleImport} className="text-xs px-3 py-1 bg-blue-600 text-white rounded">
                Import JSON
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="text-xs px-3 py-1 bg-gray-200 rounded">
                Upload File
              </button>
              <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileImport} className="hidden" />
            </div>
          </div>
        )}

        {/* Basic Info */}
        <section className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Basics</h2>
          <input
            value={store.recipe.title}
            onChange={(e) => store.setTitle(e.target.value)}
            placeholder="Recipe title"
            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded"
          />
          <textarea
            value={store.recipe.description}
            onChange={(e) => store.setDescription(e.target.value)}
            placeholder="Short description"
            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded h-16"
          />
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-gray-400">Total Time (min)</label>
              <input
                type="number"
                value={store.recipe.totalTimeMinutes}
                onChange={(e) => store.setTotalTime(Number(e.target.value))}
                className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-gray-400">Servings</label>
              <input
                type="number"
                value={store.recipe.defaultServings}
                onChange={(e) => store.updateField('defaultServings', Number(e.target.value))}
                className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-gray-400">Tags (comma separated)</label>
            <input
              value={store.recipe.tags.join(', ')}
              onChange={(e) => store.setTags(e.target.value.split(',').map((t) => t.trim()).filter(Boolean))}
              placeholder="quick, beef, weeknight"
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
            />
          </div>
        </section>

        {/* Phases */}
        <section className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Phases</h2>
            <button onClick={() => store.addPhase()} className="text-xs text-blue-600 hover:text-blue-800">+ Add</button>
          </div>
          {store.recipe.phases.map((phase) => (
            <div key={phase.id} className="flex gap-1 items-center">
              <input
                value={phase.name}
                onChange={(e) => store.updatePhase(phase.id, { name: e.target.value })}
                className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded"
              />
              <input
                type="number"
                value={phase.startMinute}
                onChange={(e) => store.updatePhase(phase.id, { startMinute: Number(e.target.value) })}
                className="w-14 px-1 py-1 text-xs border border-gray-200 rounded text-center"
                step={0.5}
              />
              <span className="text-xs text-gray-400">-</span>
              <input
                type="number"
                value={phase.endMinute}
                onChange={(e) => store.updatePhase(phase.id, { endMinute: Number(e.target.value) })}
                className="w-14 px-1 py-1 text-xs border border-gray-200 rounded text-center"
                step={0.5}
              />
              <button onClick={() => store.removePhase(phase.id)} className="text-xs text-red-400 hover:text-red-600 px-1">x</button>
            </div>
          ))}
        </section>

        {/* Ingredients */}
        <section className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Ingredients</h2>
            <button onClick={() => store.addIngredient()} className="text-xs text-blue-600 hover:text-blue-800">+ Add</button>
          </div>
          {store.recipe.ingredients.map((ing) => (
            <div
              key={ing.id}
              onClick={() => store.selectIngredient(ing.id)}
              className={`flex gap-1 items-center p-1.5 rounded cursor-pointer ${
                store.selectedIngredientId === ing.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
              }`}
            >
              <input
                value={ing.name}
                onChange={(e) => store.updateIngredient(ing.id, { name: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                placeholder="Ingredient name"
                className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded"
              />
              <input
                value={ing.quantity}
                onChange={(e) => store.updateIngredient(ing.id, { quantity: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                placeholder="Qty"
                className="w-24 px-2 py-1 text-xs border border-gray-200 rounded"
              />
              <button
                onClick={(e) => { e.stopPropagation(); store.removeIngredient(ing.id); }}
                className="text-xs text-red-400 hover:text-red-600 px-1"
              >x</button>
            </div>
          ))}
        </section>

        {/* Selected Ingredient Segments */}
        {selectedIng && (
          <section className="bg-white rounded-lg border border-blue-200 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                {selectedIng.name || 'Untitled'} — Segments
              </h2>
              <button
                onClick={() =>
                  store.addSegment(selectedIng.id, {
                    startMinute: 0, endMinute: 1, zone: 'high', pattern: 'solid', actions: [],
                  })
                }
                className="text-xs text-blue-600 hover:text-blue-800"
              >+ Add Segment</button>
            </div>
            {selectedIng.segments.map((seg, idx) => (
              <div key={idx} className="bg-gray-50 rounded p-2 space-y-1.5">
                <div className="flex gap-1 items-center">
                  <select
                    value={seg.zone}
                    onChange={(e) => store.updateSegment(selectedIng.id, idx, { zone: e.target.value as HeatZone })}
                    className="px-1 py-1 text-xs border border-gray-200 rounded"
                  >
                    {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
                  </select>
                  <select
                    value={seg.pattern}
                    onChange={(e) => store.updateSegment(selectedIng.id, idx, { pattern: e.target.value as BarPattern })}
                    className="px-1 py-1 text-xs border border-gray-200 rounded"
                  >
                    {PATTERNS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <input
                    type="number"
                    value={seg.startMinute}
                    onChange={(e) => store.updateSegment(selectedIng.id, idx, { startMinute: Number(e.target.value) })}
                    className="w-14 px-1 py-1 text-xs border border-gray-200 rounded text-center"
                    step={0.25}
                  />
                  <span className="text-xs text-gray-400">-</span>
                  <input
                    type="number"
                    value={seg.endMinute}
                    onChange={(e) => store.updateSegment(selectedIng.id, idx, { endMinute: Number(e.target.value) })}
                    className="w-14 px-1 py-1 text-xs border border-gray-200 rounded text-center"
                    step={0.25}
                  />
                  <button
                    onClick={() => store.removeSegment(selectedIng.id, idx)}
                    className="text-xs text-red-400 hover:text-red-600 px-1"
                  >x</button>
                </div>
                {/* Actions on segment */}
                <div className="pl-2">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] text-gray-400">Actions:</span>
                    {seg.actions.map((action, ai) => (
                      <span key={ai} className="text-[10px] bg-white border border-gray-200 rounded px-1.5 py-0.5 flex items-center gap-1">
                        {action.icon}@{action.minuteMark}m
                        <button
                          onClick={() => {
                            const newActions = seg.actions.filter((_, i) => i !== ai);
                            store.updateSegment(selectedIng.id, idx, { actions: newActions });
                          }}
                          className="text-red-400"
                        >x</button>
                      </span>
                    ))}
                    <button
                      onClick={() => {
                        const icon = ACTION_ICONS[0];
                        const minuteMark = seg.startMinute;
                        store.updateSegment(selectedIng.id, idx, {
                          actions: [...seg.actions, { minuteMark, icon }],
                        });
                      }}
                      className="text-[10px] text-blue-500"
                    >+</button>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2 pt-1">
              <label className="flex items-center gap-1 text-xs text-gray-500">
                <input
                  type="checkbox"
                  checked={selectedIng.isCriticalPath ?? false}
                  onChange={(e) => store.updateIngredient(selectedIng.id, { isCriticalPath: e.target.checked })}
                />
                Critical path
              </label>
            </div>
          </section>
        )}

        {/* Prep Tasks */}
        <section className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Prep Tasks</h2>
            <button onClick={() => store.addPrepTask()} className="text-xs text-blue-600 hover:text-blue-800">+ Add</button>
          </div>
          {store.recipe.prepTasks.map((task) => (
            <div key={task.id} className="flex gap-1 items-center">
              <select
                value={task.timing}
                onChange={(e) => store.updatePrepTask(task.id, { timing: e.target.value as PrepTiming })}
                className="px-1 py-1 text-[10px] border border-gray-200 rounded"
              >
                {PREP_TIMINGS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select
                value={task.icon}
                onChange={(e) => store.updatePrepTask(task.id, { icon: e.target.value as PrepIconType })}
                className="px-1 py-1 text-[10px] border border-gray-200 rounded"
              >
                {PREP_ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
              <input
                value={task.description}
                onChange={(e) => store.updatePrepTask(task.id, { description: e.target.value })}
                placeholder="Description"
                className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded"
              />
              <button onClick={() => store.removePrepTask(task.id)} className="text-xs text-red-400 hover:text-red-600 px-1">x</button>
            </div>
          ))}
        </section>
      </div>

      {/* Live Preview */}
      <div className="flex-1 min-w-0">
        <div className="sticky top-20">
          <h2 className="text-sm font-semibold text-gray-500 mb-2">Live Preview</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-4 overflow-x-auto">
            {store.recipe.title && (
              <div className="mb-3">
                <h3 className="text-lg font-bold text-gray-900">{store.recipe.title}</h3>
                <p className="text-xs text-gray-500">{store.recipe.description}</p>
              </div>
            )}
            {store.recipe.prepTasks.length > 0 && (
              <PrepSection prepTasks={store.recipe.prepTasks} />
            )}
            {store.recipe.ingredients.length > 0 ? (
              <GanttChart recipe={store.recipe} width={Math.max(700, 900)} />
            ) : (
              <div className="text-center py-12 text-gray-300">
                <p>Add ingredients and segments to see the chart</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
