import { growth, recency } from '../../shared/fish';
import { seededRandom } from '../../shared/domain';
import type { DomainRecord } from '../../shared/models';
import { fishTexture, type FishTexture } from '../fish/paint';
export const TUNING = { gridSize: 100, neighborLimit: 18, boundary: 90, maxDelta: .04, maxFish: 500 };
export const viewportScale = (width: number) => Math.min(1, Math.max(.4, width / 900));
export interface Actor { record: DomainRecord; texture: FishTexture; x: number; y: number; vx: number; vy: number; depth: number; scale: number; activity: number; phase: number; turn: number }
export function refreshActivity(actor: Actor, width: number, compact: boolean) {
  actor.activity = recency(actor.record.lastVisitedAt);
  actor.depth = actor.texture.traits.depthPreference * .6 + (1 - actor.activity) * .4;
  actor.scale = growth(actor.record) * (.38 + (1 - actor.depth) * .26) * viewportScale(width) * (compact ? .7 : 1);
}
export function makeActor(record: DomainRecord, width: number, height: number): Actor {
  const texture = fishTexture(record); const random = seededRandom(record.fishSeed);
  const activity = recency(record.lastVisitedAt); const depth = texture.traits.depthPreference * .6 + (1 - activity) * .4;
  const scale = growth(record) * (.38 + (1 - depth) * .26) * viewportScale(width);
  let x = 100 + random() * Math.max(1, width - 200);
  const y = 130 + random() * Math.max(1, height - 270), vx = (random() > .5 ? 1 : -1) * 20;
  if (width > 900 && x < 460 && y < 410) x = 470 + random() * (width - 580);
  return { record, texture, x, y, vx, vy: 0, depth, scale, activity, phase: random() * Math.PI * 2, turn: vx >= 0 ? 1 : -1 };
}
export class Simulation {
  actors: Actor[] = [];
  private grid = new Map<number, Actor[]>();
  private bucketPool: Actor[][] = [];
  step(dt: number, time: number, width: number, height: number, pointer: { x: number; y: number } | null, focus: string | null) {
    dt = Math.min(TUNING.maxDelta, dt);
    for (const bucket of this.grid.values()) { bucket.length = 0; this.bucketPool.push(bucket); }
    this.grid.clear();
    const columns = Math.ceil(width / TUNING.gridSize) + 2;
    for (const fish of this.actors) {
      const key = Math.floor(fish.x / TUNING.gridSize) + Math.floor(fish.y / TUNING.gridSize) * columns;
      let bucket = this.grid.get(key); if (!bucket) { bucket = this.bucketPool.pop() ?? []; this.grid.set(key, bucket); } bucket.push(fish);
    }
    for (const fish of this.actors) {
      const traits = fish.texture.traits;
      let ax = Math.cos(time * .19 + fish.phase) * 5, ay = Math.sin(time * .27 + fish.phase) * 3;
      const margin = Math.min(Math.max(TUNING.boundary, 125 * fish.scale), width * .3);
      const top = Math.min(115, height * .22), bottom = height - Math.min(105, height * .22);
      if (fish.x < margin) ax += (margin - fish.x) * 1.5;
      if (fish.x > width - margin) ax -= (fish.x - width + margin) * 1.5;
      if (fish.y < top) ay += (top - fish.y) * 1.5;
      if (fish.y > bottom) ay -= (fish.y - bottom) * 1.5;
      // Leave the introductory text a quiet pocket of water on wider screens.
      if (width > 900 && fish.x < 440 && fish.y < 390) { ax += (440 - fish.x) * .09; ay += (390 - fish.y) * .04; }
      ay += (top + traits.depthPreference * (bottom - top) - fish.y) * .007;
      const gx = Math.floor(fish.x / TUNING.gridSize), gy = Math.floor(fish.y / TUNING.gridSize);
      let neighbors = 0;
      for (let yy = -1; yy <= 1 && neighbors < TUNING.neighborLimit; yy++) for (let xx = -1; xx <= 1 && neighbors < TUNING.neighborLimit; xx++) {
        const bucket = this.grid.get(gx + xx + (gy + yy) * columns); if (!bucket) continue;
        for (const other of bucket) {
          if (other === fish) continue;
          const dx = other.x - fish.x, dy = other.y - fish.y, distance = dx * dx + dy * dy;
          if (distance > 10000 || distance < .01) continue;
          neighbors++;
          if (distance < 1700) { ax -= dx * 38 / distance; ay -= dy * 38 / distance; }
          ax += ((other.vx - fish.vx) * .024 + dx * .003) * traits.schoolingTendency;
          ay += ((other.vy - fish.vy) * .024 + dy * .003) * traits.schoolingTendency;
          if (neighbors >= TUNING.neighborLimit) break;
        }
      }
      if (pointer) { const dx = pointer.x - fish.x, dy = pointer.y - fish.y; if (dx * dx + dy * dy < 40000) { ax += dx * (traits.curiosity - .45) * .065; ay += dy * (traits.curiosity - .45) * .065; } }
      if (focus === fish.record.hostname) { ax += (width * .53 - fish.x) * .18; ay += (height * .5 - fish.y) * .18; }
      else if (fish.record.pinned) ay += (height * .52 - fish.y) * .008;
      fish.vx += ax * dt; fish.vy += ay * dt;
      const speed = Math.hypot(fish.vx, fish.vy) || 1, preferred = traits.swimSpeed * (.45 + fish.activity) * (1 - fish.depth * .25) * viewportScale(width);
      const correction = 1 + (preferred / speed - 1) * Math.min(1, dt * 1.5);
      fish.vx *= correction; fish.vy *= correction;
      fish.x += fish.vx * dt; fish.y += fish.vy * dt;
      // Steering does the turning; a final clamp contains resize and unusually long frames.
      const radius = Math.min(125 * fish.scale, width * .3);
      fish.x = Math.max(radius, Math.min(width - radius, fish.x)); fish.y = Math.max(55 * fish.scale, Math.min(height - 55 * fish.scale, fish.y));
      const facing = fish.vx >= 0 ? 1 : -1; fish.turn += (facing - fish.turn) * Math.min(1, dt * 5);
    }
  }
}
