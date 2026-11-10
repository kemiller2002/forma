// FORMA-NS-001 codemod fuzzer (Forma 1.0.2 review rounds 7-8). Generates
// script files whose tags carry `href="ef-T<id>"` and `className="ef-C<id>"`
// among adversarial noise (strings, regexes, generics, comments inside tags,
// unquoted URL values in string tags), runs one --check and one write over the
// folder, and counts per target: kept, lost but reviewed, SILENT_LOST, and
// silently unmigrated names. Failing files are saved as f4fail-*.txt.
//
// Usage: node tools/NamespaceMigrator/fuzz/fuzz.mjs <forma-namespace-migrator.dll> [files] [tsx|jsx|ts|js] [seed] [crlf]
// Env: NOURL=1 drops the unquoted-URL string tag; SPOT=n re-checks n files one
// by one and compares with the batched result. Not part of npm test.
import { spawnSync } from "node:child_process"; import fs from "node:fs"; import path from "node:path"; 
const bin = path.resolve(process.argv[2]); const N = +(process.argv[3] || 300); const ext = process.argv[4] || "tsx";
let seed = +(process.argv[5] || 1); const crlf = process.argv[6] === "crlf";
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648; const pick = (a) => a[Math.floor(rnd() * a.length)];
const jsx = ext === "tsx" || ext === "jsx" || ext === "js";
const noise = [
 'const s = "it\'s {";', "const t = 'a \"}\" b';", 'const u = `x ${y} {`;', "const re = /[{}'\"`]/g;", "const d = (a + b) / 2;", "const n = s.split(/[/]/);",
 "// don't { }", "/* it's } { */", "if (a <b && c) { go(); }", "const m = s.replace(/'/g, \"\");", "function q() { return /{/.test(z); }",
 "const v = i++ / 2;", "const w = `${`${'}'}`}`;", "const of = 4; const y1 = of / 2;", "label: for (;;) { break label; }",
 "const k = a?.b / c?.d;", "const nn = x! / 2;", "enum E { A = '}', B = \"{\" }", "type C<T> = T extends string ? { a: '}' } : never;",
 "const g1 = f<string>(x);", "const g2 = new Map<string, { a: number }>();", "class K { #p = '{'; static s = /}/; @dec() m() { return '}'; } }",
 "@Component({ selector: 'x', styles: ['a { color: red }'] })\nclass Cmp {}", "const o = { a: 1 } as const;", "const sat = { a: '}' } satisfies Rec;",
 "const asy = async <T,>(x: T) => x;", "export abstract class B<T extends { a: string }> { }", "declare module 'x' { }",
 "const css = styled.div`\n  &:hover { color: red; }\n`;", "const h = html`<p>${x}</p>`;", "const big = {\n a: 1,\n b: '}',\n};",
 "const ent = <p>&lt;a&gt; &#123; {'}'}</p>;", "x = y\n/re/g.test(z);",
 ...(ext === "ts" ? ["const idf = <T>(x: T): T => x;", "const idg = <T,>(x: T) => x;", "function gen<T extends { a: '}' }>(x: T) { return x; }"] : []),
 ...(jsx ? ["const g = <T,>(x: T) => x;", "const f = <T extends unknown>(x: T) => x;", "const cf = <const T,>(x: T) => x;", "const kf = <K extends keyof X>(k: K) => k;", "const df = <T = string,>(x: T) => x;"] : []),
];
const handlers = ['{() => n! / 2}', '{() => setW(w! / 2)}', '{() => { i++; return /\'/.test(s); }}', '{() => !/"/.test(s)}', '{go}', '{() => go()}', '{() => { /* don\'t */ go(); }}', '{() => s.replace(/"/g, "")}', '{() => setW((a + b) / 2)}', '{() => f("}")}', '{() => /[{]/.test(s)}', '{`${a}}`}', '{() => (x as Array<string>).map(f)}', "{() => a / b + \"'\"}", "{(e: Event<{ a: 1 }>) => go(e)}", "{() => n! / 2}"];
const tagsJsx = [
 (h, id) => `<a\n  // it's the link, see \`ref\` />\n  onClick=${h}\n  /* a > b, "q */\n  href="ef-T${id}"\n  className="ef-C${id}"\n/>`,
 (h, id) => `<a onClick=${h} data-p="${'p'.repeat(Math.floor(rnd()*3000))}" href="ef-T${id}" className="ef-C${id}">x</a>`,
 (h, id) => `<a onClick=${h} href="ef-T${id}" className="ef-C${id}">x</a>`,
 (h, id) => `<a onClick=${h} href="ef-T${id}" className="ef-C${id}" />`,
 (h, id) => `<svg:a onClick=${h} xlink:href="ef-T${id}" className="ef-C${id}"/>`,
 (h, id) => `<a\n  onClick=${h}\n  {...rest}\n  href="ef-T${id}"\n  className="ef-C${id}"\n>x</a>`,
 (h, id) => `<Foo.Bar render=${h} src={"ef-T${id}"} className="ef-C${id}"/>`,
];
const tagsStr = [ ...(process.env.NOURL ? [] : [(h, id) => `'<a data-u=http://x.com/y href="ef-T${id}" class="ef-C${id}">x</a>'`]), (h, id) => `'<a onclick="go()" href="ef-T${id}" class="ef-C${id}">x</a>'`, (h, id) => `\`<a data-x="\${y}" href="ef-T${id}" class="ef-C${id}">x</a>\``, (h, id) => `html\`<a @click=\${() => go("}")} href="ef-T${id}" class="ef-C${id}">\`` ];
const wrapJsx = [(t, id) => `export const A${id} = () => ${t};`, (t, id) => `function B${id}() {\n  return (\n    <div>\n      <p>Read: see (the) ${t}</p>\n    </div>\n  );\n}`, (t, id) => `const C${id} = ok ? ${t} : null;`, (t, id) => `const D${id} = [${t}];`, (t, id) => `@decorate()\nclass E${id} { render() { return ${t}; } }`];
const wrapStr = [(t, id) => `const S${id} = ${t};`, (t, id) => `el.innerHTML = ${t};`];

const dir = fs.mkdtempSync(path.resolve("fz3b-")); const meta = [];
for (let n = 0; n < N; n++) {
  const parts = []; const targets = [];
  for (let k = 0; k < 6; k++) {
    for (let r = 0; r < 3; r++) parts.push(pick(noise));
    const id = `${n}_${k}`; targets.push(id);
    if (jsx && rnd() < 0.7) parts.push(pick(wrapJsx)(pick(tagsJsx)(pick(handlers), id), id)); else parts.push(pick(wrapStr)(pick(tagsStr)(pick(handlers), id), id));
  }
  let text = parts.join("\n") + "\n"; if (crlf) text = text.replace(/\n/g, "\r\n");
  const f = path.join(dir, `f${n}.${ext}`); fs.writeFileSync(f, text); meta.push({ n, f, text, targets });
}
const chk = spawnSync(process.env.DOTNET || "dotnet", [bin, "--check", dir], { encoding: "utf8", maxBuffer: 1 << 28 });
const reviewed = new Set(); for (const line of chk.stdout.split("\n")) { const m = /^review: .*\/(f\d+)\.\w+:?\d* .*(certainty|may be a tag|holds a Forma name)/.exec(line); if (m) reviewed.add(m[1]); }
spawnSync(process.env.DOTNET || "dotnet", [bin, dir], { encoding: "utf8", maxBuffer: 1 << 28 });
let silent = 0, rev = 0, ok = 0, silentNames = 0;
for (const { n, f, text, targets } of meta) {
  const out = fs.readFileSync(f, "utf8"); const hasReview = reviewed.has(`f${n}`);
  for (const id of targets) {
    const lost = !new RegExp(`(href|src)=\\{?"ef-T${id}"`).test(out); const nm = !new RegExp(`(className|class)="forma-C${id}"`).test(out);
    if (lost && !hasReview) { silent++; fs.writeFileSync(`f4fail-${ext}${crlf ? "crlf" : ""}-${n}-${id}.txt`, text); } else if (lost) rev++; else ok++;
    if (nm && !hasReview) { silentNames++; fs.writeFileSync(`f4name-${ext}-${n}-${id}.txt`, text); }
  }
}
let eqOk = 0, eqBad = 0; const sd = fs.mkdtempSync(path.resolve("fz3s-"));
for (const { n, text } of meta.slice(0, +(process.env.SPOT || 0))) {
  const g = path.join(sd, `f${n}.${ext}`); fs.writeFileSync(g, text);
  const c1 = spawnSync(process.env.DOTNET || "dotnet", [bin, "--check", g], { encoding: "utf8" }).stdout;
  const r1 = /review: .*(certainty|may be a tag|holds a Forma name)/.test(c1);
  spawnSync(process.env.DOTNET || "dotnet", [bin, g]);
  const same = fs.readFileSync(g, "utf8") === fs.readFileSync(path.join(dir, `f${n}.${ext}`), "utf8") && r1 === reviewed.has(`f${n}`);
  same ? eqOk++ : eqBad++;
}
fs.rmSync(sd, { recursive: true });
console.log(JSON.stringify({ ext, spotEqual: eqOk, spotDiffer: eqBad, crlf, seed: process.argv[5], files: N, targets: N * 6, ok, lostButReviewed: rev, SILENT_LOST: silent, silentUnmigratedNames: silentNames, filesWithTagReview: reviewed.size }));
if (process.argv[7] !== "keep") fs.rmSync(dir, { recursive: true }); else console.log("kept", dir);
