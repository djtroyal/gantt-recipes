import type { PrepTask, PrepIconType } from '../../types/recipe';
import {
  WhiskIcon, MarinateIcon, TemperIcon,
  SliceIcon, PatDryIcon, PreheatIcon,
} from '../../icons';

interface PrepSectionProps {
  prepTasks: PrepTask[];
}

const timingLabels = {
  'night-before': 'Night Before',
  'day-of': 'Day Of',
  'last-30-seconds': 'Last 30 Sec',
} as const;

const timingOrder: PrepTask['timing'][] = ['night-before', 'day-of', 'last-30-seconds'];

function PrepIconComponent({ icon, size = 18 }: { icon: PrepIconType; size?: number }) {
  const props = { size, color: '#6b7280' };
  switch (icon) {
    case 'whisk': return <WhiskIcon {...props} />;
    case 'marinate': return <MarinateIcon {...props} />;
    case 'temper': return <TemperIcon {...props} />;
    case 'slice': return <SliceIcon {...props} />;
    case 'pat-dry': return <PatDryIcon {...props} />;
    case 'preheat': return <PreheatIcon {...props} />;
  }
}

export function PrepSection({ prepTasks }: PrepSectionProps) {
  if (prepTasks.length === 0) return null;

  const grouped = timingOrder.map((timing) => ({
    timing,
    label: timingLabels[timing],
    tasks: prepTasks.filter((t) => t.timing === timing),
  }));

  return (
    <div className="prep-section mb-4 px-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
        Prep
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {grouped.map((group) => (
          <div key={group.timing} className="min-h-[40px]">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5 border-b border-gray-200 pb-1">
              {group.label}
            </div>
            <ul className="space-y-1">
              {group.tasks.map((task) => (
                <li key={task.id} className="flex items-start gap-1.5 text-xs text-gray-600">
                  <span className="flex-shrink-0 mt-0.5">
                    <PrepIconComponent icon={task.icon} size={14} />
                  </span>
                  <span>{task.description}</span>
                </li>
              ))}
              {group.tasks.length === 0 && (
                <li className="text-[10px] text-gray-300 italic">—</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
