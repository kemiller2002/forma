import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const output = path.join(root, "site-dist");
const patterns = fs.readdirSync(path.join(root, "patterns"))
  .filter(file => file.endsWith(".html"))
  .map(file => path.basename(file, ".html"))
  .sort();

test("site documents every implemented Forma pattern", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(output, "site-manifest.json"), "utf8"));
  assert.equal(manifest.componentCount, patterns.length);
  assert.deepEqual(manifest.components.map(item => item.slug).sort(), patterns);

  for (const slug of patterns) {
    assert.ok(
      fs.existsSync(path.join(output, "components", slug, "index.html")),
      `missing component page for ${slug}`
    );
  }
});

test("every component page renders at least three examples", () => {
  for (const slug of patterns) {
    const html = fs.readFileSync(path.join(output, "components", slug, "index.html"), "utf8");
    const count = (html.match(/data-example="/g) ?? []).length;
    assert.ok(count >= 3, `${slug} has only ${count} examples`);
  }
});

test("every component page documents and renders its ef custom authoring tag", () => {
  for (const slug of patterns) {
    const html = fs.readFileSync(path.join(output, "components", slug, "index.html"), "utf8");
    const mobile = fs.readFileSync(path.join(output, "components", slug, "mobile.html"), "utf8");
    const escapedTag = `&lt;ef-${slug}&gt;`;
    const openingTag = new RegExp(`<ef-${slug}\\b[^>]*class="[^"]*ef-component-tag[^"]*"`);

    assert.match(html, new RegExp(escapedTag), `${slug} does not publish its authoring tag label`);
    assert.match(html, openingTag, `${slug} examples do not render the ef custom authoring tag`);
    assert.match(mobile, openingTag, `${slug} mobile example does not render the ef custom authoring tag`);
  }
});

test("ef authoring tags remain inert and zero-runtime", () => {
  const css = fs.readFileSync(path.join(output, "assets", "forma.css"), "utf8");
  assert.match(css, /\.ef-component-tag\s*\{[^}]*display:\s*contents/s);

  for (const slug of patterns) {
    const html = fs.readFileSync(path.join(output, "components", slug, "index.html"), "utf8");
    assert.equal(/customElements\.define\s*\(/.test(html), false, `${slug} attempts to register an ef tag`);
    assert.equal(/<script\b/i.test(html), false, `${slug} added runtime script`);
  }
});

test("physics-enabled surface pages publish explicit light standard heavy examples", () => {
  const physicsSlugs = [
    "alert",
    "command-palette",
    "dialog",
    "disclosure",
    "flyout",
    "fault-notification",
    "fault-banner",
    "fault-blocking",
    "menu",
    "popover",
    "tabs",
    "toast"
  ];

  for (const slug of physicsSlugs) {
    const html = fs.readFileSync(path.join(output, "components", slug, "index.html"), "utf8");
    const count = (html.match(/data-example="/g) ?? []).length;

    assert.ok(count >= 4, `${slug} is missing its explicit physics example`);
    assert.match(html, new RegExp(`data-physics-motion-example="${slug}"`));
    assert.match(html, /data-motion-weight="light"/);
    assert.match(html, /data-motion-weight="standard"/);
    assert.match(html, /data-motion-weight="heavy"/);
    assert.match(html, /Motion weights/);
    assert.match(html, /presentation only/i);
  }
});

test("physics examples remain zero-runtime and namespaced", () => {
  for (const slug of ["dialog", "flyout", "menu", "popover", "toast", "command-palette"]) {
    const html = fs.readFileSync(path.join(output, "components", slug, "index.html"), "utf8");
    assert.equal(/<script\b/i.test(html), false);
    assert.match(html, new RegExp(`motion-${slug}-light-`));
    assert.match(html, new RegExp(`motion-${slug}-standard-`));
    assert.match(html, new RegExp(`motion-${slug}-heavy-`));
  }
});

test("published Forma documentation has no runtime script elements", () => {
  const files = [];
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".html")) files.push(full);
    }
  };

  walk(output);
  for (const file of files) {
    const html = fs.readFileSync(file, "utf8");
    assert.equal(/<script\b/i.test(html), false, `runtime script found in ${path.relative(root, file)}`);
  }
});

test("index and agent documentation are complete", () => {
  const index = fs.readFileSync(path.join(output, "components", "index.html"), "utf8");
  for (const slug of patterns) {
    assert.match(index, new RegExp(`components/${slug}/`));
  }

  assert.ok(fs.existsSync(path.join(output, "agents", "index.html")));
  assert.ok(fs.existsSync(path.join(output, "assets", "forma.css")));
  assert.ok(fs.existsSync(path.join(output, "assets", "site.css")));
  assert.ok(fs.existsSync(path.join(output, ".nojekyll")));
});


test("site chrome preserves the canonical Echelon Foundry visual system", () => {
  const css = fs.readFileSync(path.join(output, "assets", "site.css"), "utf8");
  const index = fs.readFileSync(path.join(output, "index.html"), "utf8");

  for (const value of [
    "#202421",
    "#3a403c",
    "#f2efe7",
    "#905831",
    "#47756b",
    "#171a18",
    "#686d68",
    "#e3e0d7"
  ]) {
    assert.match(css, new RegExp(value.replace("#", "\\#"), "i"), `missing Echelon Foundry palette value ${value}`);
  }

  assert.match(css, /background-size:\s*48px\s+48px/);
  assert.match(css, /rgb\(242 239 231 \/ \.94\)/);
  assert.match(css, /backdrop-filter:\s*blur\(14px\)/);
  assert.match(index, /family=IBM\+Plex\+Mono/);
  assert.match(index, /family=Manrope/);
  assert.match(index, /family=Newsreader/);
  assert.match(index, /Forma \/ Interface system/);
});


test("every component page publishes an explicit 320px mobile example", () => {
  for (const slug of patterns) {
    const html = fs.readFileSync(path.join(output, "components", slug, "index.html"), "utf8");
    assert.match(html, /Mobile · 320px/, `${slug} is missing the explicit mobile example title`);
    assert.match(html, /example-canvas--mobile/, `${slug} is missing the mobile example canvas`);
    assert.match(html, /class="example-mobile-frame"/, `${slug} is missing the true mobile iframe`);
    const mobilePath = path.join(output, "components", slug, "mobile.html");
    assert.ok(fs.existsSync(mobilePath), `${slug} is missing mobile.html`);
    const mobile = fs.readFileSync(mobilePath, "utf8");
    assert.match(mobile, /width=device-width/);
    assert.equal(/<script\b/i.test(mobile), false, `runtime script found in mobile preview for ${slug}`);
  }

  const css = fs.readFileSync(path.join(output, "assets", "site.css"), "utf8");
  assert.match(css, /max-inline-size:\s*320px/);
  assert.match(css, /320px mobile viewport/);
});


test("brand laboratory proves scoped brands and skins without runtime script", () => {
  const brandPage = path.join(output, "branding", "index.html");
  assert.ok(fs.existsSync(brandPage), "missing Brand Laboratory page");

  const html = fs.readFileSync(brandPage, "utf8");
  assert.match(html, /data-ef-brand="echelon"/);
  assert.match(html, /data-ef-brand="example-harbor"/);
  assert.match(html, /data-ef-theme="dark"/);
  assert.match(html, /data-ef-skin="compact"/);
  assert.match(html, /data-ef-skin="comfortable"/);
  assert.match(html, /data-ef-skin="square"/);
  assert.equal(/<script\b/i.test(html), false);

  for (const file of ["echelon.css", "example-harbor.css", "index.json"]) {
    assert.ok(
      fs.existsSync(path.join(output, "assets", "brands", file)),
      "missing published brand artifact " + file
    );
  }
});


test("Aegis fault pages publish safe presentation contracts", () => {
  for (const slug of [
    "fault",
    "fault-inline",
    "fault-notification",
    "fault-banner",
    "fault-blocking",
    "fault-summary",
    "recovery-actions",
    "fault-reference",
    "diagnostic-status",
    "fault-details"
  ]) {
    const html = fs.readFileSync(path.join(output, "components", slug, "index.html"), "utf8");
    assert.match(html, new RegExp(`&lt;ef-${slug}&gt;`));
    assert.equal(/TechnicalDetails|StackTrace|ExceptionDetail/.test(html), false, `${slug} leaks developer-only Aegis fields`);
  }

  const actions = fs.readFileSync(path.join(output, "components", "recovery-actions", "index.html"), "utf8");
  assert.match(actions, /data-ef-aegis-capability/);
});


test("every component page publishes Visual Engineering stress screens", () => {
  for (const slug of patterns) {
    const html = fs.readFileSync(path.join(output, "components", slug, "index.html"), "utf8");
    assert.match(html, new RegExp(`data-ve-verification="${slug}"`), `${slug} is missing VE verification specimens`);
    for (const screen of ["content-stress", "text-spacing", "grayscale", "reduced-contrast"]) {
      assert.match(html, new RegExp(`data-ve-stress="${screen}"`), `${slug} is missing ${screen}`);
    }
    assert.match(html, /engineering screen/i);
    assert.match(html, /human-subject validation/i);
  }
});

test("Visual Engineering stress screens remain zero-runtime and preserve custom tags", () => {
  for (const slug of patterns) {
    const html = fs.readFileSync(path.join(output, "components", slug, "index.html"), "utf8");
    assert.equal(/<script\b/i.test(html), false);
    const stress = html.split('<div class="ve-stress-grid"')[1]?.split('<nav class="pager"')[0] ?? "";
    assert.match(stress, new RegExp(`<ef-${slug}\\b`), `${slug} stress specimens lost the public authoring tag`);
  }
});


test("gallery exposes every registry icon as static, named, copyable HTML", () => {
  const registry = JSON.parse(fs.readFileSync("icons/registry.json", "utf8"));
  const html = fs.readFileSync(path.join(output, "icons/index.html"), "utf8");
  assert.equal((html.match(/class="icon-gallery__card"/g) ?? []).length, registry.icons.length);
  for (const icon of registry.icons) {
    assert.ok(html.includes(`data-ef-icon="${icon.name}"`), `missing preview for ${icon.name}`);
    assert.ok(html.includes(`<code>${icon.name}</code>`), `missing named documentation for ${icon.name}`);
  }
  assert.equal(html.includes("<script"), false);
  assert.ok(fs.readFileSync(path.join(output, "site-manifest.json"), "utf8").includes('"iconGalleryUrl": "icons/"'));
});

test("every registry icon has a generated page, downloadable SVG and raw configuration sources", () => {
  const registry = JSON.parse(fs.readFileSync("icons/registry.json", "utf8"));
  const manifest = JSON.parse(fs.readFileSync(path.join(output, "site-manifest.json"), "utf8"));
  assert.deepEqual(manifest.icons.map(icon => icon.name), registry.icons.map(icon => icon.name).sort());
  for (const icon of manifest.icons) {
    const dir = path.join(output, "icons", icon.name);
    assert.equal(icon.docsUrl, `icons/${icon.name}/`);
    const html = fs.readFileSync(path.join(dir, "index.html"), "utf8");
    assert.ok(html.includes(`data-icon="${icon.name}"`), `${icon.name}: page is not the icon page`);
    assert.equal(html.includes("<script"), false, `${icon.name}: page contains script`);
    // The download is byte-identical to the packaged release asset.
    assert.deepEqual(fs.readFileSync(path.join(dir, `${icon.name}.svg`)), fs.readFileSync(path.join("dist/icons", `${icon.name}.svg`)));
    assert.equal(fs.readFileSync(path.join(dir, "decorative.txt"), "utf8"), fs.readFileSync(path.join("dist/icons/html", `${icon.name}.html`), "utf8"));
    for (const raw of [...html.matchAll(/href="([a-z-]+\.txt)"/g)].map(match => match[1])) {
      assert.ok(fs.existsSync(path.join(dir, raw)), `${icon.name}: linked raw source ${raw} was not generated`);
    }
  }
});


test("Forma 0.6.0 publishes a dedicated, complete and machine-navigable page for each of the forty new icons", async () => {
  const { applicationIconDocs } = await import("../catalog/icons/applications.mjs");
  const names = Object.keys(applicationIconDocs).sort();
  const source = JSON.parse(fs.readFileSync(path.join(root, "icons", "registry.json"), "utf8"));
  const manifest = JSON.parse(fs.readFileSync(path.join(output, "site-manifest.json"), "utf8"));
  const gallery = fs.readFileSync(path.join(output, "icons", "index.html"), "utf8");
  const recent = fs.readFileSync(path.join(output, "icons", "new", "index.html"), "utf8");
  assert.equal(names.length, 40, "the 0.6.0 additions should contain exactly 40 named glyphs");
  assert.equal(source.icons.length, 80, "legacy icons must be retained");
  assert.equal(manifest.newIconGalleryUrl, "icons/new/");
  assert.equal(manifest.iconRelease, "0.6.0");
  assert.ok(gallery.includes('href="../icons/new/"'), "main gallery must link to the new collection");
  assert.equal((recent.match(/class="icon-gallery__card" data-new-icon=/g) ?? []).length, 40);
  assert.equal(/<script\b|\son[a-z]+\s*=/i.test(recent), false, "new-icons index must remain static and safe");

  for (const name of names) {
    const record = manifest.icons.find(icon => icon.name === name);
    assert.equal(record?.introducedIn, "0.6.0", name + ": missing release metadata");
    assert.equal(record.docsUrl, `icons/${name}/`, name + ": link changed");
    assert.ok(recent.includes(`href="../../icons/${name}/"`), name + ": missing new-icons navigation link");
    const dir = path.join(output, "icons", name);
    const page = fs.readFileSync(path.join(dir, "index.html"), "utf8");
    assert.ok(page.includes('href="../../icons/new/"'), name + ": no release-backlink");
    assert.ok(page.includes("Introduced in Forma 0.6.0"), name + ": introduction note missing");
    assert.ok(page.includes('id="section-configurations-title"'), name + ": configurations missing");
    assert.ok(page.includes('id="section-accessibility-title"'), name + ": accessibility guidance missing");
    assert.deepEqual(
      fs.readFileSync(path.join(dir, name + ".svg")),
      fs.readFileSync(path.join(root, "dist", "icons", name + ".svg")),
      name + ": site SVG differs from package"
    );
    for (const raw of ["decorative", "with-text", "icon-only", "inline-text", "custom-size", "custom-colour", "meaningful-image", "decorative-image"]) {
      assert.ok(fs.existsSync(path.join(dir, raw + ".txt")), name + ": " + raw + " copyable source missing");
    }
  }
  const legacy = manifest.icons.filter(icon => !names.includes(icon.name));
  assert.equal(legacy.length, 40, "original forty were changed or lost");
  assert.ok(legacy.every(icon => icon.introducedIn === "0.5.0"), "original icons keep correct version provenance");
});


test("top navigation selects only the owning section, never permanent Agent use", () => {
  const cases = [
    ["index.html", "Overview", "page"],
    ["components/index.html", "Components", "page"],
    ["components/date-time-field/index.html", "Components", "location"],
    ["icons/index.html", "Icons", "page"],
    ["icons/new/index.html", "Icons", "location"],
    ["icons/email/index.html", "Icons", "location"],
    ["compositions/index.html", "Compositions", "page"],
    ["accessibility/index.html", "Accessibility", "page"],
    ["agents/index.html", "Agent use", "page"]
  ];
  for (const [file, active, expectedCurrent] of cases) {
    const source = fs.readFileSync(path.join(output, file), "utf8");
    const nav = source.match(/<nav class="site-nav"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
    assert.ok(nav, file + ": missing primary navigation");
    const selected = [...nav.matchAll(/<a\b([^>]*)>([^<]+)<\/a>/g)]
      .filter(([, attrs]) => attrs.includes("aria-current"))
      .map(([, attrs, text]) => ({
        name: text.trim(),
        current: attrs.match(/aria-current="([^"]+)"/)?.[1] ?? ""
      }));
    assert.deepEqual(selected, [{ name: active, current: expectedCurrent }], file + ": navigation active state incorrect");
    assert.ok(!nav.includes("pill-link"), file + ": permanent Agent use highlight returned");
  }
});


test("icon pages use US English for user-facing color terminology without breaking stable automation links", () => {
  const gallery = fs.readFileSync(path.join(output, "icons", "index.html"), "utf8");
  const newer = fs.readFileSync(path.join(output, "icons", "new", "index.html"), "utf8");
  assert.match(gallery, /sizes, color and contrast modes/);
  assert.match(newer, /size and color guidance/);
  for (const name of ["add", "email", "attachment"]) {
    const dir = path.join(output, "icons", name);
    const html = fs.readFileSync(path.join(dir, "index.html"), "utf8");
    for (const heading of ["Color and contrast modes", "Forced colors and high contrast", "Custom color"]) {
      assert.ok(html.includes(heading), name + ": missing US-English heading " + heading);
    }
    assert.doesNotMatch(html, /Colour|recolour|forced-colour modes|parent’s colour role/);
    // These IDs and source links predate the copy edit and remain valid for
    // agents and bookmarks even though their visible descriptions say "color".
    assert.ok(html.includes('id="colour"'), name + ": existing section anchor changed");
    assert.ok(html.includes('data-colour-context="primary"'), name + ": selector changed");
    assert.ok(fs.existsSync(path.join(dir, "custom-colour.txt")),
      name + ": backwards-compatible example source path changed");
  }
});
