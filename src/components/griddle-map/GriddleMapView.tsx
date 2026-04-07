import { useRef, useEffect } from 'react';
import type { Recipe, HeatZone } from '../../types/recipe';
import { zoneColors } from '../../lib/color-palette';

interface GriddleMapViewProps {
  recipe: Recipe;
  cursorMinute: number;
}

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 450;
const PADDING = 20;

interface RenderedPlacement {
  ingredientId: string;
  zone: HeatZone;
  posX: number;
  posY: number;
  name: string;
  progress: number;
  isCoolZone: boolean;
}

export function GriddleMapView({ recipe, cursorMinute }: GriddleMapViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const griddleX = PADDING;
    const griddleY = PADDING;
    const griddleW = CANVAS_WIDTH - PADDING * 2;
    const griddleH = CANVAS_HEIGHT - PADDING * 2;

    // Griddle background
    ctx.fillStyle = '#374151';
    ctx.beginPath();
    ctx.roundRect(griddleX, griddleY, griddleW, griddleH, 12);
    ctx.fill();

    // Heat zones
    const zoneWidth = griddleW / 3;
    const zones = [
      { zone: 'high' as const, label: 'HIGH', x: griddleX },
      { zone: 'medium' as const, label: 'MED', x: griddleX + zoneWidth },
      { zone: 'cool' as const, label: 'COOL', x: griddleX + zoneWidth * 2 },
    ];

    zones.forEach(({ zone, label, x }) => {
      const c = zoneColors[zone];
      ctx.fillStyle = c.fill + '30';
      ctx.fillRect(x, griddleY, zoneWidth, griddleH);

      ctx.fillStyle = c.fill + '80';
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(label, x + zoneWidth / 2, griddleY + 20);

      if (x > griddleX) {
        ctx.strokeStyle = '#ffffff20';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(x, griddleY);
        ctx.lineTo(x, griddleY + griddleH);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // Collect all placements to render
    const placements: RenderedPlacement[] = [];
    const renderedIngredientIds = new Set<string>();

    // 1. Explicit griddlePlacements (high/medium zone items)
    for (const placement of recipe.griddlePlacements) {
      if (cursorMinute < placement.startMinute || cursorMinute > placement.endMinute) continue;

      const ingredient = recipe.ingredients.find((i) => i.id === placement.ingredientId);
      if (!ingredient) continue;

      const zoneIndex = placement.zone === 'high' ? 0 : placement.zone === 'medium' ? 1 : 2;
      const baseX = griddleX + zoneIndex * zoneWidth;
      const posX = baseX + (placement.position?.x ?? 0.5) * zoneWidth;
      const posY = griddleY + (placement.position?.y ?? 0.5) * griddleH;
      const progress = (cursorMinute - placement.startMinute) / (placement.endMinute - placement.startMinute);

      placements.push({
        ingredientId: placement.ingredientId,
        zone: placement.zone,
        posX,
        posY,
        name: ingredient.name,
        progress: Math.min(1, Math.max(0, progress)),
        isCoolZone: false,
      });
      renderedIngredientIds.add(placement.ingredientId);
    }

    // 2. Derive cool-zone placements from ingredient segments
    recipe.ingredients.forEach((ing, ingIndex) => {
      // Check if any cool segment is active now
      const activeCoolSeg = ing.segments.find(
        (seg) => seg.zone === 'cool' && cursorMinute >= seg.startMinute && cursorMinute <= seg.endMinute
      );
      if (!activeCoolSeg) return;

      // Don't duplicate if already shown via griddlePlacements
      if (renderedIngredientIds.has(ing.id)) {
        // Check if the current explicit placement is covering this time
        const hasExplicitNow = recipe.griddlePlacements.some(
          (p) => p.ingredientId === ing.id && cursorMinute >= p.startMinute && cursorMinute <= p.endMinute
        );
        if (hasExplicitNow) return;
      }

      // Deterministic position in cool zone
      const coolBaseX = griddleX + 2 * zoneWidth;
      const col = ingIndex % 3;
      const row = Math.floor(ingIndex / 3);
      const posX = coolBaseX + (0.2 + col * 0.3) * zoneWidth;
      const posY = griddleY + (0.25 + row * 0.25) * griddleH;
      const progress = (cursorMinute - activeCoolSeg.startMinute) / (activeCoolSeg.endMinute - activeCoolSeg.startMinute);

      placements.push({
        ingredientId: ing.id,
        zone: 'cool',
        posX,
        posY,
        name: ing.name,
        progress: Math.min(1, Math.max(0, progress)),
        isCoolZone: true,
      });
    });

    // Render all placements
    for (const p of placements) {
      const c = zoneColors[p.zone];
      const radius = 24;

      // Circle
      ctx.beginPath();
      ctx.arc(p.posX, p.posY, radius, 0, Math.PI * 2);
      ctx.fillStyle = c.fill;
      ctx.globalAlpha = p.isCoolZone ? 0.55 : 0.8;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = c.stroke;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const shortName = p.name.split(' ')[0].substring(0, 8);
      ctx.fillText(shortName, p.posX, p.posY);

      // Progress arc
      ctx.beginPath();
      ctx.arc(p.posX, p.posY, radius + 4, -Math.PI / 2, -Math.PI / 2 + p.progress * Math.PI * 2);
      ctx.strokeStyle = '#ffffff60';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Time display
    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px system-ui';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`${cursorMinute.toFixed(1)} min`, CANVAS_WIDTH - PADDING, PADDING / 2);
  }, [recipe, cursorMinute]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
      className="rounded-lg"
    />
  );
}
