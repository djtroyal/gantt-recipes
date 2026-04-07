import { useRef, useEffect } from 'react';
import type { Recipe } from '../../types/recipe';
import { zoneColors } from '../../lib/color-palette';

interface GriddleMapViewProps {
  recipe: Recipe;
  cursorMinute: number;
}

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 450;
const PADDING = 20;
const RADIUS = 28;
const MIN_DIST = RADIUS * 2 + 10;
const TWEEN_SPEED = 8; // exponential smoothing constant

// Zone layout helpers
function zoneXRange(zoneIndex: number, griddleX: number, zoneWidth: number) {
  return { left: griddleX + zoneIndex * zoneWidth, right: griddleX + (zoneIndex + 1) * zoneWidth };
}

function zoneIndexOf(zone: 'high' | 'medium' | 'cool') {
  return zone === 'high' ? 0 : zone === 'medium' ? 1 : 2;
}

function getInitials(name: string): string {
  const words = name.split(/[\s+\-]+/).filter(Boolean);
  if (words.length === 1) return name.slice(0, 3).toUpperCase();
  return words.slice(0, 3).map((w) => w[0].toUpperCase()).join('');
}

interface ActiveItem {
  key: string;
  ingredientId: string;
  name: string;
  zoneIndex: number;
  targetX: number;
  targetY: number;
  isAddedTo: boolean;
  parentIds: string[];
  isCoolZone: boolean;
  progress: number;
}

function computeActiveItems(
  recipe: Recipe,
  cursor: number,
  griddleX: number,
  griddleY: number,
  zoneWidth: number,
  griddleH: number
): ActiveItem[] {
  const items: ActiveItem[] = [];
  const coveredByPlacement = new Set<string>();

  // 1. Explicit griddlePlacements
  for (const p of recipe.griddlePlacements) {
    if (cursor < p.startMinute || cursor > p.endMinute) continue;
    const ing = recipe.ingredients.find((i) => i.id === p.ingredientId);
    if (!ing) continue;

    const zi = zoneIndexOf(p.zone);
    const { left } = zoneXRange(zi, griddleX, zoneWidth);
    const posX = left + (p.position?.x ?? 0.5) * zoneWidth;
    const posY = griddleY + (p.position?.y ?? 0.5) * griddleH;
    const progress = (cursor - p.startMinute) / (p.endMinute - p.startMinute);

    items.push({
      key: `${p.ingredientId}-${p.startMinute}`,
      ingredientId: p.ingredientId,
      name: ing.name,
      zoneIndex: zi,
      targetX: posX,
      targetY: posY,
      isAddedTo: (ing.dependsOn?.length ?? 0) > 0,
      parentIds: ing.dependsOn ?? [],
      isCoolZone: p.zone === 'cool',
      progress: Math.min(1, Math.max(0, progress)),
    });
    coveredByPlacement.add(p.ingredientId);
  }

  // 2. Derive cool-zone items from segment data
  recipe.ingredients.forEach((ing, ingIndex) => {
    const coolSeg = ing.segments.find(
      (s) => s.zone === 'cool' && cursor >= s.startMinute && cursor <= s.endMinute
    );
    if (!coolSeg) return;

    // Skip if currently shown via a griddlePlacement
    const hasExplicitNow = recipe.griddlePlacements.some(
      (p) => p.ingredientId === ing.id && cursor >= p.startMinute && cursor <= p.endMinute
    );
    if (hasExplicitNow) return;

    const zi = 2; // cool zone
    const { left } = zoneXRange(zi, griddleX, zoneWidth);
    // Deterministic starting position within cool zone (will be separated)
    const col = ingIndex % 3;
    const row = Math.floor(ingIndex / 3) % 3;
    const posX = left + (0.2 + col * 0.28) * zoneWidth;
    const posY = griddleY + (0.2 + row * 0.3) * griddleH;
    const progress = (cursor - coolSeg.startMinute) / (coolSeg.endMinute - coolSeg.startMinute);

    items.push({
      key: `${ing.id}-cool`,
      ingredientId: ing.id,
      name: ing.name,
      zoneIndex: zi,
      targetX: posX,
      targetY: posY,
      isAddedTo: (ing.dependsOn?.length ?? 0) > 0,
      parentIds: ing.dependsOn ?? [],
      isCoolZone: true,
      progress: Math.min(1, Math.max(0, progress)),
    });
  });

  return items;
}

function separateItems(
  items: ActiveItem[],
  griddleX: number,
  griddleY: number,
  zoneWidth: number,
  griddleH: number
) {
  // Only separate non-addedTo items (badges follow parents naturally)
  const placed = items.filter((i) => !i.isAddedTo);

  for (let iter = 0; iter < 12; iter++) {
    for (let a = 0; a < placed.length; a++) {
      for (let b = a + 1; b < placed.length; b++) {
        const pa = placed[a];
        const pb = placed[b];
        const dx = pb.targetX - pa.targetX;
        const dy = pb.targetY - pa.targetY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        if (dist >= MIN_DIST) continue;

        const overlap = (MIN_DIST - dist) / 2;
        const nx = dx / dist;
        const ny = dy / dist;

        pa.targetX -= nx * overlap;
        pa.targetY -= ny * overlap;
        pb.targetX += nx * overlap;
        pb.targetY += ny * overlap;

        // Clamp each to its zone
        const clamp = (item: ActiveItem) => {
          const { left, right } = zoneXRange(item.zoneIndex, griddleX, zoneWidth);
          const margin = RADIUS + 2;
          item.targetX = Math.max(left + margin, Math.min(right - margin, item.targetX));
          item.targetY = Math.max(griddleY + margin, Math.min(griddleY + griddleH - margin, item.targetY));
        };
        clamp(pa);
        clamp(pb);
      }
    }
  }
}

function drawLabelPill(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  name: string,
  fillColor: string
) {
  const words = name.split(' ');
  const line1 = words.slice(0, 2).join(' ');
  const line2 = words.length > 2 ? words.slice(2).join(' ') : '';

  ctx.font = '8px system-ui, sans-serif';
  const w = Math.max(
    ctx.measureText(line1).width,
    line2 ? ctx.measureText(line2).width : 0
  ) + 10;
  const lineH = 11;
  const h = line2 ? lineH * 2 + 4 : lineH + 4;
  const pillX = cx - w / 2;
  const pillY = cy + RADIUS + 3;

  ctx.fillStyle = fillColor + '35';
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, w, h, 3);
  ctx.fill();

  ctx.fillStyle = '#f9fafb';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(line1, cx, pillY + 2);
  if (line2) ctx.fillText(line2, cx, pillY + lineH + 2);
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  griddleX: number,
  griddleY: number,
  griddleW: number,
  griddleH: number,
  zoneWidth: number
) {
  ctx.fillStyle = '#374151';
  ctx.beginPath();
  ctx.roundRect(griddleX, griddleY, griddleW, griddleH, 12);
  ctx.fill();

  const zones = [
    { zone: 'high' as const, label: 'HIGH', x: griddleX },
    { zone: 'medium' as const, label: 'MED', x: griddleX + zoneWidth },
    { zone: 'cool' as const, label: 'COOL', x: griddleX + zoneWidth * 2 },
  ];

  zones.forEach(({ zone, label, x }) => {
    const c = zoneColors[zone];
    ctx.fillStyle = c.fill + '28';
    ctx.fillRect(x, griddleY, zoneWidth, griddleH);

    ctx.fillStyle = c.fill + '90';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(label, x + zoneWidth / 2, griddleY + 8);

    if (x > griddleX) {
      ctx.strokeStyle = '#ffffff18';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(x, griddleY);
      ctx.lineTo(x, griddleY + griddleH);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  });
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  recipe: Recipe,
  cursor: number,
  dt: number,
  positions: Map<string, { x: number; y: number }>
) {
  const griddleX = PADDING;
  const griddleY = PADDING;
  const griddleW = CANVAS_WIDTH - PADDING * 2;
  const griddleH = CANVAS_HEIGHT - PADDING * 2;
  const zoneWidth = griddleW / 3;

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawBackground(ctx, griddleX, griddleY, griddleW, griddleH, zoneWidth);

  const items = computeActiveItems(recipe, cursor, griddleX, griddleY, zoneWidth, griddleH);
  separateItems(items, griddleX, griddleY, zoneWidth, griddleH);

  // Update rendered positions via exponential smoothing
  const alpha = 1 - Math.exp(-dt * TWEEN_SPEED);
  for (const item of items) {
    const cur = positions.get(item.key);
    if (!cur) {
      // First appearance: teleport
      positions.set(item.key, { x: item.targetX, y: item.targetY });
    } else {
      cur.x += (item.targetX - cur.x) * alpha;
      cur.y += (item.targetY - cur.y) * alpha;
    }
  }
  // Remove stale positions
  const activeKeys = new Set(items.map((i) => i.key));
  for (const key of positions.keys()) {
    if (!activeKeys.has(key)) positions.delete(key);
  }

  // Build a lookup of rendered positions by ingredientId for badge parent computation
  const renderedById = new Map<string, { x: number; y: number }>();
  for (const item of items) {
    if (!item.isAddedTo) {
      const p = positions.get(item.key);
      if (p) renderedById.set(item.ingredientId, p);
    }
  }

  // Draw non-addedTo items first
  for (const item of items) {
    if (item.isAddedTo) continue;
    const pos = positions.get(item.key);
    if (!pos) continue;

    const c = zoneColors[item.zoneIndex === 0 ? 'high' : item.zoneIndex === 1 ? 'medium' : 'cool'];
    const opacity = item.isCoolZone ? 0.6 : 0.88;

    // Circle
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = c.fill;
    ctx.globalAlpha = opacity;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = c.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Initials inside circle
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(getInitials(item.name), pos.x, pos.y);

    // Progress arc
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, RADIUS + 5, -Math.PI / 2, -Math.PI / 2 + item.progress * Math.PI * 2);
    ctx.strokeStyle = '#ffffff50';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Label pill below circle
    drawLabelPill(ctx, pos.x, pos.y, item.name, c.fill);
  }

  // Draw "added to" badges
  for (const item of items) {
    if (!item.isAddedTo) continue;

    // Find parent rendered positions
    const parentPositions = item.parentIds
      .map((pid) => renderedById.get(pid))
      .filter((p): p is { x: number; y: number } => !!p);

    if (parentPositions.length === 0) continue;

    // Centroid of parents
    const centX = parentPositions.reduce((s, p) => s + p.x, 0) / parentPositions.length;
    const centY = parentPositions.reduce((s, p) => s + p.y, 0) / parentPositions.length;

    const badgeX = centX;
    const badgeY = centY - RADIUS - 28;
    const bw = 52, bh = 22;

    // Determine zone from first parent
    const firstParent = items.find((i) => i.ingredientId === item.parentIds[0] && !i.isAddedTo);
    const zone = firstParent
      ? (firstParent.zoneIndex === 0 ? 'high' : firstParent.zoneIndex === 1 ? 'medium' : 'cool')
      : 'medium';
    const c = zoneColors[zone];

    // Dotted lines to each parent
    ctx.setLineDash([2, 3]);
    ctx.strokeStyle = c.fill + '70';
    ctx.lineWidth = 1;
    for (const pp of parentPositions) {
      ctx.beginPath();
      ctx.moveTo(centX, centY - RADIUS - 4);
      ctx.lineTo(pp.x, pp.y - RADIUS + 4);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Badge background
    ctx.fillStyle = c.fill + '30';
    ctx.strokeStyle = c.stroke;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 2]);
    ctx.beginPath();
    ctx.roundRect(badgeX - bw / 2, badgeY - bh / 2, bw, bh, 4);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    // Badge label: "+ name"
    ctx.fillStyle = '#f9fafb';
    ctx.font = 'bold 8px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const short = item.name.split(' ').slice(0, 2).join(' ');
    ctx.fillText(`+ ${short}`, badgeX, badgeY);
  }

  // Time display
  ctx.fillStyle = '#9ca3af';
  ctx.font = '14px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(`${cursor.toFixed(1)} min`, CANVAS_WIDTH - PADDING, PADDING / 2);
}

export function GriddleMapView({ recipe, cursorMinute }: GriddleMapViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const cursorRef = useRef(cursorMinute);
  const positionsRef = useRef(new Map<string, { x: number; y: number }>());
  const recipeRef = useRef(recipe);

  // Keep refs in sync without restarting the animation loop
  useEffect(() => { cursorRef.current = cursorMinute; }, [cursorMinute]);
  useEffect(() => { recipeRef.current = recipe; }, [recipe]);

  // One-time canvas setup (DPR scaling)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
  }, []);

  // Persistent animation loop — only restarts when recipe changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset positions when recipe changes
    positionsRef.current.clear();

    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      drawFrame(ctx, recipeRef.current, cursorRef.current, dt, positionsRef.current);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [recipe.id]); // Only restart when switching recipes

  return (
    <canvas
      ref={canvasRef}
      style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
      className="rounded-lg"
    />
  );
}
