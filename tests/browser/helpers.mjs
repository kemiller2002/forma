export async function openFixture(page) {
  await page.goto("/tests/browser/fixture/index.html");
}

export async function formData(page) {
  return page.evaluate(() => Object.fromEntries(new FormData(document.querySelector("#settings")).entries()));
}

// Resolve once every running animation on the page has finished. Uses the
// browser's own animation promises rather than elapsed time, so audits and
// screenshots observe settled presentation without arbitrary sleeps.
export async function motionSettled(page) {
  await page.evaluate(() => Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => null))));
}
