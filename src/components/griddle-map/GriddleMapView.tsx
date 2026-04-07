import { useRef, useEffect } from 'react';
import type { Recipe } from '../../types/recipe';
import { zoneColors } from '../../lib/color-palette';

interface GriddleMapViewProps {
  recipe: Recipe;
  cursorMinute: number;
}

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 300;
const PADDING = 20;

export function GriddleMapView({ recipe, cursorMinute }: GriddleMapViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Scale for retina
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw griddle surface
    const griddleX = PADDING;
    const griddleY = PADDING;
    const griddleW = CANVAS_WIDTH - PADDING * 2;
    const griddleH = CANVAS_HEIGHT - PADDING * 2;

    // Griddle background
    ctx.fillStyle = '#374151';
    ctx.beginPath();
    ctx.roundRect(griddleX, griddleY, griddleW, griddleH, 12);
    ctx.fill();

    // Heat zones (left = high, center = medium, right = cool)
    const zoneWidth = griddleW / 3;
    const zones = [
      { zone: 'high' as const, label: 'HIGH', x: griddleX },
      { zone: 'medium' as const, label: 'MED', x: griddleX + zoneWidth },
      { zone: 'cool' as const, label: 'COOL', x: griddleX + zoneWidth * 2 },
    ];

    zones.forEach(({ zone, label, x }) => {
      const c = zoneColors[zone];
      ctx.fillStyle = c.fill + '30'; // Low opacity background
      ctx.fillRect(x, griddleY, zoneWidth, griddleH);

      // Zone label
      ctx.fillStyle = c.fill + '80';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(label, x + zoneWidth / 2, griddleY + 16);

      // Zone divider
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

    // Draw ingredients at current time
    recipe.griddlePlacements.forEach((placement) => {
      if (cursorMinute < placement.startMinute || cursorMinute > placement.endMinute) return;

      const ingredient = recipe.ingredients.find((i) => i.id === placement.ingredientId);
      if (!ingredient) return;

      // Map zone to x position
      const zoneIndex = placement.zone === 'high' ? 0 : placement.zone === 'medium' ? 1 : 2;
      const baseX = griddleX + zoneIndex * zoneWidth;
      const posX = baseX + (placement.position?.x ?? 0.5) * zoneWidth;
      const posY = griddleY + (placement.position?.y ?? 0.5) * griddleH;

      const c = zoneColors[placement.zone];

      // Pulsing glow for active ingredients
      const progress = (cursorMinute - placement.startMinute) / (placement.endMinute - placement.startMinute);
      const pulse = 1 + Math.sin(Date.now() / 300) * 0.1;

      // Ingredient circle
      const radius = 22 * pulse;
      ctx.beginPath();
      ctx.arc(posX, posY, radius, 0, Math.PI * 2);
      ctx.fillStyle = c.fill;
      ctx.globalAlpha = 0.8;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = c.stroke;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const shortName = ingredient.name.split(' ')[0].substring(0, 8);
      ctx.fillText(shortName, posX, posY);

      // Progress arc
      ctx.beginPath();
      ctx.arc(posX, posY, radius + 4, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
      ctx.strokeStyle = '#ffffff60';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Time display
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px system-ui';
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
