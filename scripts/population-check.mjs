import assert from 'node:assert/strict';

export async function checkPopulation(browser, base) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.route(base + '/__population_test', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><body style="margin:0"><canvas id="tank" style="width:100vw;height:100vh;display:block"></canvas></body>' }));
  try {
    await page.goto(base + '/__population_test');
    const initial = await page.evaluate(async () => {
      const [{ AquariumScene }, { demoData }] = await Promise.all([import('/src/aquarium/AquariumScene.ts'), import('/src/shared/demo.ts')]);
      const data = demoData(500); data.settings.motion = false;
      // Equal age, traits and maturity isolate visit-driven size from species/depth.
      data.domains.forEach((r, i) => { r.totalVisits = i + 1; r.lastVisitedAt = Date.now() + 60000; r.fishSeed = 123; r.category = 'Other'; r.activeTimeSeconds = 0; });
      data.domains[0].customName = 'Pearl';
      window.populationScene = new AquariumScene(document.getElementById('tank'), () => {}, () => {});
      window.populationScene.setData(data);
      const scene = window.populationScene;
      return { count: scene.simulation.actors.length, minVisits: Math.min(...scene.simulation.actors.map(a => a.record.totalVisits)), saved: scene.data.domains.length };
    });
    assert.deepEqual(initial, { count: 82, minVisits: 419, saved: 500 });
    const growth = await page.evaluate(() => {
      const scene = window.populationScene, hostname = scene.data.domains[0].hostname;
      scene.select(hostname, true);
      const original = scene.simulation.actors.find(a => a.record.hostname === hostname).scale;
      const data = structuredClone(scene.data); data.domains[0].totalVisits = 500; scene.setData(data);
      const grown = scene.simulation.actors.find(a => a.record.hostname === hostname).scale;
      data.domains[0].totalVisits = 1e9; scene.setData(structuredClone(data));
      const capped = scene.simulation.actors.find(a => a.record.hostname === hostname).scale;
      scene.select(null);
      return { original, grown, capped, retained: scene.simulation.actors.some(a => a.record.hostname === hostname), name: scene.data.domains[0].customName };
    });
    assert.ok(growth.grown > growth.original * 1.8, 'Repeated visits visibly grow the same fish');
    assert.equal(growth.grown, growth.capped, 'Extreme visit counts never exceed the visual size cap');
    assert.equal(growth.retained, true, 'Newly popular fish stays after dismissal');
    assert.equal(growth.name, 'Pearl');
    const located = await page.evaluate(() => {
      const scene = window.populationScene, hostname = scene.data.domains[1].hostname;
      scene.select(hostname, true);
      const present = scene.simulation.actors.some(a => a.record.hostname === hostname);
      scene.select(null);
      return { present, dismissed: !scene.simulation.actors.some(a => a.record.hostname === hostname), saved: scene.data.domains.length };
    });
    assert.deepEqual(located, { present: true, dismissed: true, saved: 500 });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForFunction(() => window.populationScene.simulation.actors.length === 19);
    assert.equal(await page.evaluate(() => window.populationScene.data.domains.length), 500);
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.waitForFunction(() => window.populationScene.simulation.actors.length === 82);
    assert.deepEqual(errors, []);
    return ['visit-driven rendered growth', 'extreme popularity size cap', 'least-visited eviction with 500 saved records', 'newly popular fish returns', 'locate resting fish and restore ranking on dismissal', 'responsive capacity on resize'];
  } finally { await page.close(); }
}
