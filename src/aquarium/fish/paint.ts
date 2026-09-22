import { generateFish, maturity, type FishTraits } from '../../shared/fish';
import { seededRandom } from '../../shared/domain';
import type { DomainRecord } from '../../shared/models';
export interface FishTexture { body: HTMLCanvasElement; tail: HTMLCanvasElement; traits: FishTraits }
export function fishTexture(record: DomainRecord): FishTexture {
  const traits = generateFish(record); const mature = maturity(record);
  const w = 36 * traits.bodyLength, h = 36 * traits.bodyHeight;
  const body = document.createElement('canvas');
  body.width = Math.ceil(w * 2 + 10); body.height = Math.ceil((h * (traits.finType === 'Flowing' ? 2.2 : 1.8) + mature * 6 + 3) * 2);
  const ctx = body.getContext('2d')!; ctx.translate(body.width / 2, body.height / 2);
  const color = (light: number, alpha = 1) => `hsla(${traits.hue},${traits.saturation}%,${light}%,${alpha})`;
  ctx.fillStyle = color(65, .55);
  ctx.beginPath(); ctx.moveTo(-w * .7, -h * .5);
  ctx.quadraticCurveTo(-w * .1, -h * (traits.finType === 'Flowing' ? 2.2 : 1.7) - mature * 6, w * .45, -h * .65); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-w * .5, h * .5); ctx.quadraticCurveTo(-w * .25, h * 1.8, w * .35, h * .65); ctx.fill();
  const outline = new Path2D(); outline.moveTo(w, 0);
  outline.bezierCurveTo(w * .65, -h * 1.3, -w * .6, -h * 1.2, -w, 0);
  outline.bezierCurveTo(-w * .5, h * 1.15, w * .65, h * 1.15, w, 0);
  const gradient = ctx.createLinearGradient(0, -h, 0, h);
  gradient.addColorStop(0, color(79)); gradient.addColorStop(.35, color(traits.brightness)); gradient.addColorStop(1, color(28));
  ctx.fillStyle = gradient; ctx.fill(outline); ctx.save(); ctx.clip(outline);
  ctx.globalAlpha = traits.translucent ? .2 : .35;
  ctx.strokeStyle = color(18); ctx.fillStyle = color(90); ctx.lineWidth = 5;
  if (traits.stripePattern === 'Vertical') for (let x = -w; x < w; x += 12) { ctx.beginPath(); ctx.moveTo(x, -h); ctx.lineTo(x - 7, h); ctx.stroke(); }
  if (traits.stripePattern === 'Horizontal') { ctx.fillRect(-w, -2, w * 2, 5); ctx.fillRect(-w, h * .4, w * 2, 2); }
  if (traits.stripePattern === 'Two-tone') { ctx.fillStyle = color(15); ctx.fillRect(-w, -h, w, h * 2); }
  if (traits.stripePattern === 'Spotted' || traits.stripePattern === 'Speckled') {
    const random = seededRandom(traits.seed); for (let i = 0; i < (traits.stripePattern === 'Spotted' ? 10 : 32); i++) { ctx.beginPath(); ctx.arc((random() * 2 - 1) * w, (random() * 2 - 1) * h, traits.stripePattern === 'Spotted' ? 3 : 1.2, 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();
  ctx.strokeStyle = color(90, .32); ctx.lineWidth = .8; ctx.stroke(outline);
  ctx.fillStyle = color(80, .45); ctx.beginPath(); ctx.moveTo(w * .12, 0); ctx.quadraticCurveTo(-w * .4, h * 1.3, -w * .5, h * .12); ctx.fill();
  if (mature > .3) { ctx.strokeStyle = color(95, .25); ctx.lineWidth = .6; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(w * .12, 0); ctx.lineTo(-w * (.1 + i * .12), h * (.65 - i * .12)); ctx.stroke(); } }
  ctx.fillStyle = '#e7e4ce'; ctx.beginPath(); ctx.arc(w * .61, -h * .17, traits.eyeSize + .7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0b2630'; ctx.beginPath(); ctx.arc(w * .65, -h * .17, traits.eyeSize * .65, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(w * .65 + .6, -h * .17 - .7, .65, 0, Math.PI * 2); ctx.fill();
  const length = traits.tailType === 'Long' ? 58 + mature * 8 : 32;
  const spread = traits.tailType === 'Fan' ? 29 : traits.tailType === 'Double' ? 27 : 20;
  const tail = document.createElement('canvas'); tail.width = Math.ceil(length * 1.2 + 12); tail.height = spread * 2 + 12;
  const t = tail.getContext('2d')!; t.translate(tail.width - 8, tail.height / 2);
  const tg = t.createLinearGradient(-length, 0, 0, 0); tg.addColorStop(0, color(70, .3)); tg.addColorStop(1, color(65, .9)); t.fillStyle = tg;
  t.beginPath(); t.moveTo(0, 0);
  t.quadraticCurveTo(-length * .35, -5, -length, -spread);
  if (traits.tailType === 'Round' || traits.tailType === 'Fan') t.quadraticCurveTo(-length * 1.2, 0, -length, spread);
  else { t.lineTo(-length * (traits.tailType === 'Forked' || traits.tailType === 'Double' ? .45 : 1), 0); t.lineTo(-length, spread); }
  t.quadraticCurveTo(-length * .35, 5, 0, 0); t.fill();
  t.strokeStyle = color(90, .25); t.lineWidth = .6;
  for (let i = -2; i <= 2; i++) { t.beginPath(); t.moveTo(0, 0); t.lineTo(-length * .9, i * spread / 2.3); t.stroke(); }
  return { body, tail, traits };
}
export function drawFish(ctx: CanvasRenderingContext2D, texture: FishTexture, x: number, y: number, scale: number, direction = 1, time = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale * direction, scale);
  ctx.save(); ctx.translate(-36 * texture.traits.bodyLength, 0); ctx.scale(.83 + Math.sin(time * 5) * .17, 1);
  ctx.drawImage(texture.tail, -(texture.tail.width - 8), -texture.tail.height / 2); ctx.restore(); ctx.drawImage(texture.body, -texture.body.width / 2, -texture.body.height / 2); ctx.restore();
}
