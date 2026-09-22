import assert from 'node:assert/strict';

/** Real pointer input against the actual scene, isolated from drifting demo fish. */
export async function checkDragging(browser, base) {
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 }, deviceScaleFactor: 2, hasTouch: true });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.route(base + '/__drag_test', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><html><body style="margin:0"><canvas id="tank" style="width:100vw;height:100vh;display:block;touch-action:none"></canvas></body></html>' }));
  try {
    await page.goto(base + '/__drag_test');
    await page.evaluate(async () => {
      const [{ AquariumScene }, { newDomain }, { emptyData }] = await Promise.all([
        import('/src/aquarium/AquariumScene.ts'), import('/src/shared/domain.ts'), import('/src/shared/models.ts')
      ]);
      const data = emptyData(); data.onboarded = true;
      data.domains = [newDomain('github.com'), newDomain('youtube.com')];
      data.settings.cursor = false; data.settings.bubbles = false; data.settings.particles = false;
      window.dragSelections = [];
      window.dragScene = new AquariumScene(document.getElementById('tank'), (record, locate) => window.dragSelections.push({ hostname: record.hostname, locate }), () => {});
      window.dragScene.setData(data);
    });
    await page.waitForTimeout(100);
    const place = () => page.evaluate(() => {
      const actor = window.dragScene.simulation.actors.find(a => a.record.hostname === 'github.com');
      actor.x = 400; actor.y = 350; actor.vx = 18; actor.vy = 0; actor.turn = 1;
      return { x: actor.x, y: actor.y };
    });
    const state = () => page.evaluate(() => ({
      actors: window.dragScene.simulation.actors.map(a => ({ hostname: a.record.hostname, x: a.x, y: a.y })),
      held: window.dragScene.drag?.hostname ?? null,
      selections: window.dragSelections,
      cursor: document.getElementById('tank').style.cursor
    }));
    const fish = value => value.actors.find(a => a.hostname === 'github.com');
    await place();
    await page.mouse.move(400, 350); await page.mouse.down();
    const before = await state();
    assert.equal(before.held, 'github.com');
    await page.mouse.move(680, 490, { steps: 10 });
    const held = await state();
    assert.ok(Math.abs(fish(held).x - 680) < 5 && Math.abs(fish(held).y - 490) < 5, 'Fish follows mouse at DPR 2');
    await page.waitForTimeout(250);
    const stillHeld = await state();
    assert.deepEqual(fish(stillHeld), fish(held), 'Simulation does not move a held fish');
    assert.notDeepEqual(stillHeld.actors.find(a => a.hostname === 'youtube.com'), before.actors.find(a => a.hostname === 'youtube.com'), 'Other fish keep swimming');
    // A local storage update may replace the actor while the pointer is captured.
    await page.evaluate(() => {
      const data = structuredClone(window.dragScene.data); data.domains[0].customName = 'Pearl';
      window.dragScene.setData(data);
    });
    await page.mouse.move(710, 470);
    await page.screenshot({ path: 'test-results/drag-highlight.png' });
    await page.mouse.up();
    const released = await state();
    assert.equal(released.held, null);
    assert.deepEqual(released.selections, [{ hostname: 'github.com', locate: false }], 'One selection, without recentering on drop');
    await page.waitForTimeout(250);
    assert.notDeepEqual(fish(await state()), fish(released), 'Released fish resumes swimming');

    await page.emulateMedia({ reducedMotion: 'reduce' }); await place();
    await page.mouse.move(400, 350); await page.mouse.down();
    await page.mouse.move(-100, -100, { steps: 10 });
    const bounded = fish(await state());
    assert.ok(bounded.x > 0 && bounded.x < 1000 && bounded.y > 0 && bounded.y < 700, 'Dragging beyond canvas stays within tank');
    await page.mouse.up();
    assert.equal((await state()).held, null, 'Outside release ends pointer capture');

    await place();
    const cdp = await page.context().newCDPSession(page);
    const touch = (type, points = []) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points.map(([x, y]) => ({ x, y, id: 0, radiusX: 3, radiusY: 3 })) });
    await touch('touchStart', [[400, 350]]); await touch('touchMove', [[560, 450]]); await touch('touchEnd');
    assert.ok(Math.abs(fish(await state()).x - 560) < 2, 'Touch drag moves fish with reduced motion enabled');
    const stationary = fish(await state()); await page.waitForTimeout(200);
    assert.deepEqual(fish(await state()), stationary, 'Reduced motion remains respected after dragging');
    await touch('touchStart', [[stationary.x, stationary.y]]); await touch('touchMove', [[600, 460]]); await touch('touchCancel');
    assert.equal((await state()).held, null, 'Touch cancellation releases fish');
    assert.equal((await state()).cursor, 'default');

    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.evaluate(() => { const data = structuredClone(window.dragScene.data); data.settings.motion = false; window.dragScene.setData(data); });
    await place(); await page.mouse.move(400, 350); await page.mouse.down(); await page.mouse.move(630, 500); await page.mouse.up();
    const paused = fish(await state()); await page.waitForTimeout(200);
    assert.ok(Math.abs(paused.x - 630) < 2); assert.deepEqual(fish(await state()), paused, 'Dragging works while motion is paused');
    await page.mouse.move(paused.x, paused.y); await page.mouse.down();
    await page.evaluate(() => { const data = structuredClone(window.dragScene.data); data.domains = []; window.dragScene.setData(data); });
    assert.equal((await state()).held, null, 'Reset during drag cannot leave a stuck pointer');
    await page.mouse.up();
    assert.deepEqual(errors, []);
    return ['mouse drag at DPR 2', 'held fish stability and continued schooling', 'drag survives record updates', 'release resumes swimming without recentering', 'tank bounds and outside release', 'touch drag and cancel', 'reduced motion and paused motion', 'reset during drag'];
  } finally { await page.close(); }
}
