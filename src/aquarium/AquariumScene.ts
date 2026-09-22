import type { AquariumData, Period, DomainRecord } from '../shared/models';
import { periodStart } from '../shared/fish';
import { drawFish } from './fish/paint';
import { environment } from './environment/environment';
import { makeActor, refreshActivity, Simulation, type Actor } from './simulation/simulation';

export class AquariumScene {
  private ctx: CanvasRenderingContext2D; private simulation = new Simulation(); private observer: ResizeObserver;
  private width = 0; private height = 0; private frame = 0; private previous = 0; private elapsed = 0;
  private background?: HTMLCanvasElement; private data?: AquariumData; private pointer: { x: number; y: number } | null = null;
  private selected: string | null = null; private focusUntil = 0; private period: Period = 'All Time'; private night = false;
  private reduced = matchMedia('(prefers-reduced-motion: reduce)'); private fpsFrames = 0; private fpsStart = 0; private quality = 1;
  private backgroundKey = ''; private lastMinute = -1;
  fps = 0;
  constructor(private canvas: HTMLCanvasElement, private onSelect: (record: DomainRecord) => void, private onHover: (record: DomainRecord | null, x: number, y: number) => void) {
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.observer = new ResizeObserver(() => this.resize()); this.observer.observe(canvas);
    canvas.addEventListener('pointermove', this.move); canvas.addEventListener('pointerleave', this.leave); canvas.addEventListener('click', this.click);
    document.addEventListener('visibilitychange', this.visibility); this.resize(); this.frame = requestAnimationFrame(this.render);
  }
  setData(data: AquariumData) {
    this.data = data;
    const old = new Map(this.simulation.actors.map(actor => [actor.record.hostname, actor]));
    const sorted = [...data.domains].sort((a, b) => Number(b.hostname === this.selected) - Number(a.hostname === this.selected) || Number(b.pinned) - Number(a.pinned) || b.lastVisitedAt - a.lastVisitedAt);
    this.simulation.actors = sorted.slice(0, data.settings.fishCount).map(record => {
      const existing = old.get(record.hostname);
      if (existing && JSON.stringify(existing.record) === JSON.stringify(record)) return existing;
      const actor = makeActor(record, this.width, this.height);
      if (existing) { actor.x = existing.x; actor.y = existing.y; actor.vx = existing.vx; actor.vy = existing.vy; actor.turn = existing.turn; }
      return actor;
    }).sort((a, b) => b.depth - a.depth);
    for (const actor of this.simulation.actors) refreshActivity(actor, this.width, data.domains.length > 200);
    this.makeBackground();
  }
  select(hostname: string | null, locate = false) { this.selected = hostname; this.focusUntil = locate ? performance.now() + 8000 : 0; if (this.data && hostname && !this.simulation.actors.some(a => a.record.hostname === hostname)) this.setData(this.data); }
  setPeriod(period: Period) { this.period = period; }
  capture(): Promise<Blob> { return new Promise((resolve, reject) => this.canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not capture aquarium.')), 'image/png')); }
  private makeBackground() {
    const hour = new Date().getHours(); this.night = !!this.data?.settings.dayNight && (hour < 7 || hour >= 19);
    const count = this.data?.domains.length ?? 0, variety = new Set(this.data?.domains.map(d => d.category)).size;
    const hours = Math.floor((this.data?.domains.reduce((total, d) => total + d.activeTimeSeconds, 0) ?? 0) / 3600);
    const key = `${this.width}:${this.height}:${this.night}:${count}:${variety}:${hours}`;
    if (key === this.backgroundKey) return; this.backgroundKey = key;
    this.background = environment(this.width, this.height, this.night, count, variety, hours);
  }
  private resize() {
    const oldWidth = this.width, oldHeight = this.height;
    const rect = this.canvas.getBoundingClientRect(); this.width = Math.max(1, rect.width); this.height = Math.max(1, rect.height);
    if (oldWidth && oldHeight) for (const actor of this.simulation.actors) {
      actor.x *= this.width / oldWidth; actor.y *= this.height / oldHeight;
      refreshActivity(actor, this.width, (this.data?.domains.length ?? 0) > 200);
    }
    const ratio = Math.min(devicePixelRatio || 1, 2); this.canvas.width = this.width * ratio; this.canvas.height = this.height * ratio;
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0); this.makeBackground();
  }
  private hit(x: number, y: number): Actor | undefined { return [...this.simulation.actors].reverse().find(a => ((x - a.x) / (58 * a.scale)) ** 2 + ((y - a.y) / (30 * a.scale)) ** 2 < 1); }
  private move = (event: PointerEvent) => { const rect = this.canvas.getBoundingClientRect(); this.pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top }; const actor = this.hit(this.pointer.x, this.pointer.y); this.canvas.style.cursor = actor ? 'pointer' : 'default'; this.onHover(actor?.record ?? null, event.clientX, event.clientY); };
  private leave = () => { this.pointer = null; this.onHover(null, 0, 0); };
  private click = (event: MouseEvent) => { const rect = this.canvas.getBoundingClientRect(); const actor = this.hit(event.clientX - rect.left, event.clientY - rect.top); if (actor) this.onSelect(actor.record); };
  private visibility = () => { cancelAnimationFrame(this.frame); if (!document.hidden) { this.previous = 0; this.frame = requestAnimationFrame(this.render); } };
  private render = (now: number) => {
    const dt = this.previous ? Math.min(.04, (now - this.previous) / 1000) : 0; this.previous = now;
    const motion = this.data?.settings.motion && !this.reduced.matches;
    const minute = Math.floor(Date.now() / 60000);
    if (minute !== this.lastMinute) {
      this.lastMinute = minute; this.makeBackground();
      for (const actor of this.simulation.actors) refreshActivity(actor, this.width, (this.data?.domains.length ?? 0) > 200);
    }
    if (motion) this.elapsed += dt;
    const ctx = this.ctx;
    if (this.background) ctx.drawImage(this.background, 0, 0, this.width, this.height);
    if (motion) this.simulation.step(dt, this.elapsed, this.width, this.height, this.data?.settings.cursor ? this.pointer : null, now < this.focusUntil ? this.selected : null);
    const cutoff = periodStart(this.period);
    for (const actor of this.simulation.actors) {
      const chosen = actor.record.hostname === this.selected;
      ctx.globalAlpha = chosen ? 1 : (actor.record.lastVisitedAt >= cutoff ? 1 : .18) * (1 - actor.depth * .48);
      if (chosen) { ctx.strokeStyle = '#e7dba4'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(actor.x, actor.y, 75 * actor.scale, 42 * actor.scale, 0, 0, Math.PI * 2); ctx.stroke(); }
      if (this.night && actor.texture.traits.bioluminescent) { ctx.shadowBlur = 16; ctx.shadowColor = '#80f0cf'; }
      drawFish(ctx, actor.texture, actor.x, actor.y + Math.sin(this.elapsed * 1.6 + actor.phase) * 2, actor.scale, actor.turn || .01, this.elapsed + actor.phase);
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
    this.effects();
    if (++this.fpsFrames >= 60) { this.fps = Math.round(60000 / (now - this.fpsStart)); this.fpsStart = now; this.fpsFrames = 0; if (this.fps < 40) this.quality = .5; }
    this.canvas.dataset.fps = String(this.fps); this.canvas.dataset.fishCount = String(this.simulation.actors.length);
    this.frame = requestAnimationFrame(this.render);
  };
  private effects() {
    const ctx = this.ctx;
    if (this.data?.settings.particles) {
      ctx.fillStyle = '#bad2cb';
      for (let i = 0; i < 45 * this.quality; i++) { const x = (i * 177.7 + this.elapsed * (2 + i % 3)) % this.width; const y = (i * 91.3 + Math.sin(this.elapsed * .12 + i) * 12) % this.height; ctx.globalAlpha = .08 + (i % 4) * .025; ctx.beginPath(); ctx.arc(x, y, i % 3 === 0 ? 1.5 : .7, 0, Math.PI * 2); ctx.fill(); }
    }
    if (this.data?.settings.bubbles) {
      ctx.strokeStyle = '#a7c8c2'; ctx.lineWidth = .6; ctx.globalAlpha = .2;
      for (let i = 0; i < 15 * this.quality; i++) { const y = this.height - (i * 83 + this.elapsed * (12 + i % 4)) % this.height; const x = this.width * (i % 2 ? .84 : .12) + Math.sin(y * .025 + i) * 9 + i * 2; ctx.beginPath(); ctx.arc(x, y, 1.5 + i % 4, 0, Math.PI * 2); ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
  }
  destroy() { cancelAnimationFrame(this.frame); this.observer.disconnect(); this.canvas.removeEventListener('pointermove', this.move); this.canvas.removeEventListener('pointerleave', this.leave); this.canvas.removeEventListener('click', this.click); document.removeEventListener('visibilitychange', this.visibility); }
}
