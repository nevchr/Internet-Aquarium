import { seededRandom } from '../../shared/domain';

export function environment(width: number, height: number, night: boolean, population: number, variety: number, activeHours = 0) {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const water = ctx.createLinearGradient(0, 0, width * .3, height);
  water.addColorStop(0, night ? '#0c2b37' : '#205c63'); water.addColorStop(.45, '#0b3543'); water.addColorStop(1, '#061c2c');
  ctx.fillStyle = water; ctx.fillRect(0, 0, width, height);
  const random = seededRandom(731);
  // Static layers are painted once per size/lighting/ecosystem change, not once per frame.
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = .45;
  ctx.filter = 'blur(25px)';
  for (let i = 0; i < 7; i++) {
    const x = width * (.28 + i * .105);
    const beam = ctx.createLinearGradient(x, 0, x - width * .25, height * .8);
    beam.addColorStop(0, night ? '#619da009' : '#b1dab41c'); beam.addColorStop(1, '#8bbbae00');
    ctx.fillStyle = beam; ctx.beginPath(); ctx.moveTo(x, -10); ctx.lineTo(x + width * .035, -10); ctx.lineTo(x - width * .21, height * .85); ctx.lineTo(x - width * .4, height * .85); ctx.fill();
  }
  ctx.restore();
  const abundance = Math.min(1, Math.log1p(population) / 7 + Math.log1p(activeHours) / 30);
  // Backwater silhouettes create depth without competing with the fish.
  for (let i = 0; i < 16 + abundance * 12; i++) {
    const x = random() * width, base = height * (.88 + random() * .08);
    plant(ctx, x, base, 50 + random() * 160, '#163d4270', random() * 7, .7);
  }
  for (let layer = 0; layer < 3; layer++) {
    const y = height - 83 + layer * 20;
    const sand = ctx.createLinearGradient(0, y - 30, 0, height);
    sand.addColorStop(0, ['#355452', '#3b5951', '#1e3738'][layer]); sand.addColorStop(1, '#0b252c');
    ctx.fillStyle = sand; ctx.beginPath(); ctx.moveTo(0, y);
    ctx.bezierCurveTo(width * .2, y - 35, width * .36, y + 32, width * .56, y + 5);
    ctx.bezierCurveTo(width * .75, y - 23, width * .88, y - 19, width, y + 4);
    ctx.lineTo(width, height); ctx.lineTo(0, height); ctx.fill();
  }
  for (let i = 0; i < width * 1.4; i++) {
    const x = random() * width, y = height - random() * 48;
    ctx.fillStyle = random() > .5 ? '#c7c4a321' : '#051c2855';
    ctx.beginPath(); ctx.ellipse(x, y, .4 + random() * 1.5, .3 + random(), 0, 0, Math.PI * 2); ctx.fill();
  }
  const rock = (x: number, y: number, w: number, h: number) => {
    const gradient = ctx.createLinearGradient(x, y - h, x + w * .5, y); gradient.addColorStop(0, '#56716a'); gradient.addColorStop(.4, '#304d4b'); gradient.addColorStop(1, '#102e34'); ctx.fillStyle = gradient;
    ctx.beginPath(); ctx.moveTo(x - w, y); ctx.bezierCurveTo(x - w * 1.15, y - h * .35, x - w * .4, y - h, x - w * .12, y - h); ctx.bezierCurveTo(x + w * .4, y - h * 1.08, x + w * .77, y - h * .5, x + w, y); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#9da99220'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - w * .7, y - h * .37); ctx.quadraticCurveTo(x - w * .35, y - h * .88, x + w * .18, y - h * .86); ctx.stroke();
    ctx.strokeStyle = '#061f2933'; ctx.beginPath(); ctx.moveTo(x - w * .1, y - h * .95); ctx.lineTo(x + w * .2, y - h * .35); ctx.lineTo(x + w * .6, y - h * .22); ctx.stroke();
  };
  for (let i = 0; i < 7 + abundance * 10; i++) { const x = random() * width; rock(x, height - 44 + random() * 29, 9 + random() * 24, 8 + random() * 27); }
  rock(width * .15, height - 42, width * .06 + 20, 70); rock(width * .89, height - 50, width * .08, 96);
  const left = [0, .025, .05, .08, .115, .16], right = [.82, .87, .92, .96, .99, 1.025];
  for (const [side, positions] of [left, right].entries()) for (const [i, fraction] of positions.entries()) {
    const h = (side ? 135 : 165) + random() * 145 + abundance * 40;
    plant(ctx, width * fraction, height - 32 + random() * 14, h, ['#244f4d', '#2c655a', '#357263', '#417b65'][i % 4], random() * 5, 1);
  }
  // Delicate branching corals become more varied as local categories accumulate.
  const branch = (x: number, y: number, length: number, angle: number, depth: number) => {
    if (!depth) return;
    const endX = x + Math.cos(angle) * length, endY = y + Math.sin(angle) * length;
    ctx.lineWidth = depth * 1.4; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(angle + .2) * length * .6, y + Math.sin(angle + .2) * length * .6, endX, endY); ctx.stroke();
    branch(endX, endY, length * .68, angle - .48 - random() * .2, depth - 1); branch(endX, endY, length * .73, angle + .4 + random() * .2, depth - 1);
  };
  ctx.lineCap = 'round';
  for (let i = 0; i < 1 + Math.min(3, Math.floor(variety / 3)); i++) { ctx.strokeStyle = ['#967e775e', '#b19b826b', '#678f8666', '#92937f66'][i]; branch(width * (.22 + i * .19), height - 46, 25 + random() * 15, -Math.PI / 2, 4); }
  const vignette = ctx.createRadialGradient(width * .52, height * .38, width * .2, width * .52, height * .38, Math.max(width, height) * .72); vignette.addColorStop(0, '#00152100'); vignette.addColorStop(1, '#0015219c'); ctx.fillStyle = vignette; ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#c6dfcb0c'; ctx.strokeRect(9, 9, width - 18, height - 18);
  return canvas;
}

function plant(ctx: CanvasRenderingContext2D, x: number, base: number, height: number, color: string, phase: number, width: number) {
  ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = 2 * width;
  const lean = Math.sin(phase) * 35;
  ctx.beginPath(); ctx.moveTo(x, base); ctx.bezierCurveTo(x + lean * 1.4, base - height * .35, x - lean * .5, base - height * .75, x + lean, base - height); ctx.stroke();
  for (let i = 1; i < 10; i++) {
    const t = i / 10, stemX = x + Math.sin(t * 5 + phase) * 9 + lean * t * .4, y = base - height * t;
    const length = (1 - t * .58) * (22 + height * .06) * width;
    for (const side of [-1, 1]) { ctx.beginPath(); ctx.moveTo(stemX, y); ctx.bezierCurveTo(stemX + side * length * .4, y - length * .65, stemX + side * length, y - length * 1.15, stemX + side * length * .85, y - length * 1.5); ctx.bezierCurveTo(stemX + side * length * 1.35, y - length * .1, stemX + side * length * .5, y + length * .1, stemX, y); ctx.fill(); }
  }
}
