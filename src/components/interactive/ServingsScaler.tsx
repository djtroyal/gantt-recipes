interface ServingsScalerProps {
  defaultServings: number;
  multiplier: number;
  onChange: (multiplier: number) => void;
}

export function ServingsScaler({ defaultServings, multiplier, onChange }: ServingsScalerProps) {
  const currentServings = Math.round(defaultServings * multiplier);

  return (
    <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 px-3 py-2">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Servings</span>
      <button
        onClick={() => onChange(Math.max(0.5, multiplier - 0.5))}
        className="w-6 h-6 rounded bg-gray-100 text-gray-600 text-sm font-bold hover:bg-gray-200"
      >
        -
      </button>
      <span className="text-sm font-semibold text-gray-900 min-w-[1.5rem] text-center">
        {currentServings}
      </span>
      <button
        onClick={() => onChange(Math.min(4, multiplier + 0.5))}
        className="w-6 h-6 rounded bg-gray-100 text-gray-600 text-sm font-bold hover:bg-gray-200"
      >
        +
      </button>
    </div>
  );
}
