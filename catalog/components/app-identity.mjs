export default {
  name: "Application identity",
  category: "workspaces",
  behavior: "Native HTML",
  basicInteraction: { kind: "static", reasons: ["placeholder-navigation"] },
  summary: "An application's own mark and name: an inline SVG mark that takes the theme accent, or an external mark with light and dark variants and a text monogram the browser shows natively when the asset fails to load.",
  purpose: {
    description: "Application identity shows which application the person is in: the application's mark and its name, usually as the home link at the start of the shell header and on the start-up screen. The application supplies the mark, the name and, for an external mark, the monogram letter; Forma ships no organization's mark and lays them out with theme tokens. Prefer an inline SVG mark drawn with currentColor: there is nothing to fetch, so nothing can fail during a slow start, it works under a strict Content-Security-Policy (`object-src 'none'`), and it takes the theme's accent color. An external mark is an object element whose fallback content is the monogram, so a missing or blocked asset degrades to a readable monogram rather than a broken image, with no script. A plain img also works but has no native fallback.",
    useWhen: [
      "The application header or shell needs the application's mark and name.",
      "A start-up, offline, error or about surface must say which application this is.",
      "Several applications from one organization need distinct identities on a shared visual system."
    ],
    avoidWhen: [
      "Decorating every panel or card with the logo: identity belongs in the shell and on whole-page states.",
      "Showing a product or partner logo inside content: use an ordinary image with its own alternative text.",
      "Marketing-site headers: use [[site-header]], which owns the marketing brand slot."
    ],
    characteristics: [
      "One accessible name: the visible name text. The mark and monogram are hidden from assistive technology.",
      "Four sizes, 16, 24, 32 and 64 pixels, set with data-forma-size.",
      "An inline SVG mark drawn with currentColor takes --forma-color-accent-primary, so one mark adapts to every theme and brand.",
      "External mark variants for light and dark themes (.forma-app-identity__variant with data-forma-scheme) follow the active data-forma-theme or, with no explicit theme, the operating-system preference.",
      "The monogram tile uses the theme's accent and inverse text tokens and becomes a bordered system-color tile in forced colors."
    ]
  },
  examples: [
    {
      id: "header-with-context",
      interaction: { kind: "static", reasons: ["placeholder-navigation"] },
      title: "Application header with a context line",
      description: "The identity is the home link at the start of an application header. The context line names the parent organization in smaller secondary text, inside the link, so the link has one accessible name made of the visible text.",
      html: `<forma-app-identity class="forma-component-tag">
  <a class="forma-app-identity" href="#app-identity-header-with-context">
    <span class="forma-app-identity__mark">
      <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="M6 0h20a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6V6a6 6 0 0 1 6-6Zm10 8-8 14h16Z"/></svg>
    </span>
    <span class="forma-app-identity__name">Northwind Ledger <span class="forma-app-identity__context">Northwind Trading Company</span></span>
  </a>
</forma-app-identity>`
    },
    {
      id: "missing-asset",
      title: "External mark that fails to load",
      description: "The mark URL does not resolve. The browser renders the object element's fallback content, so the application shows its text monogram on an accent tile instead of a broken-image icon or an empty box. No script is involved. The same fallback appears when the page's Content-Security-Policy blocks object elements (`object-src 'none'`); that is why an inline SVG mark is preferred.",
      html: `<forma-app-identity class="forma-component-tag">
  <span class="forma-app-identity">
    <span class="forma-app-identity__mark">
      <object type="image/svg+xml" data="/assets/does-not-exist/northwind-mark.svg" aria-hidden="true" tabindex="-1">
        <span class="forma-app-identity__monogram" aria-hidden="true">N</span>
      </object>
    </span>
    <span class="forma-app-identity__name">Northwind Ledger</span>
  </span>
</forma-app-identity>`
    },
    {
      id: "light-and-dark-marks",
      title: "Separate light and dark marks",
      description: "Two external mark variants are siblings with the class `forma-app-identity__variant`, marked `data-forma-scheme=\"light\"` and `data-forma-scheme=\"dark\"`. Forma shows the one that matches the active theme: the operating-system preference when no theme is set, an explicit `data-forma-theme` otherwise. This page sets no explicit theme, so the documentation theme or your operating-system preference decides which variant both copies show.",
      html: `<forma-app-identity class="forma-component-tag">
  <div class="forma-cluster">
    <div class="forma-surface">
      <span class="forma-app-identity">
        <span class="forma-app-identity__mark">
          <object type="image/svg+xml" data="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23234'/%3E%3Cpath d='M8 22 L16 8 L24 22 Z' fill='none' stroke='%23fff' stroke-width='3' stroke-linejoin='round'/%3E%3C/svg%3E" aria-hidden="true" tabindex="-1" class="forma-app-identity__variant" data-forma-scheme="light">
        <span class="forma-app-identity__monogram" aria-hidden="true">N</span>
      </object>
          <object type="image/svg+xml" data="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23e8eef2'/%3E%3Cpath d='M8 22 L16 8 L24 22 Z' fill='none' stroke='%23123' stroke-width='3' stroke-linejoin='round'/%3E%3C/svg%3E" aria-hidden="true" tabindex="-1" class="forma-app-identity__variant" data-forma-scheme="dark">
        <span class="forma-app-identity__monogram" aria-hidden="true">N</span>
      </object>
        </span>
        <span class="forma-app-identity__name">Northwind Ledger</span>
      </span>
    </div>
    <div class="forma-surface">
      <span class="forma-app-identity">
        <span class="forma-app-identity__mark">
          <object type="image/svg+xml" data="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23234'/%3E%3Cpath d='M8 22 L16 8 L24 22 Z' fill='none' stroke='%23fff' stroke-width='3' stroke-linejoin='round'/%3E%3C/svg%3E" aria-hidden="true" tabindex="-1" class="forma-app-identity__variant" data-forma-scheme="light">
        <span class="forma-app-identity__monogram" aria-hidden="true">N</span>
      </object>
          <object type="image/svg+xml" data="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23e8eef2'/%3E%3Cpath d='M8 22 L16 8 L24 22 Z' fill='none' stroke='%23123' stroke-width='3' stroke-linejoin='round'/%3E%3C/svg%3E" aria-hidden="true" tabindex="-1" class="forma-app-identity__variant" data-forma-scheme="dark">
        <span class="forma-app-identity__monogram" aria-hidden="true">N</span>
      </object>
        </span>
        <span class="forma-app-identity__name">Northwind Ledger</span>
      </span>
    </div>
  </div>
</forma-app-identity>`
    },
    {
      id: "sizes",
      title: "Small-size legibility (16, 24, 32 and 64 pixels)",
      description: "The same mark at each supported size. Check a new mark at 16 pixels before approving it: detail that disappears there disappears in a browser tab and a compact header.",
      html: `<forma-app-identity class="forma-component-tag">
  <div class="forma-stack">
    <span class="forma-app-identity" data-forma-size="16"><span class="forma-app-identity__mark"><svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="M6 0h20a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6V6a6 6 0 0 1 6-6Zm10 8-8 14h16Z"/></svg></span><span class="forma-app-identity__name">16 pixels</span></span>
    <span class="forma-app-identity" data-forma-size="24"><span class="forma-app-identity__mark"><svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="M6 0h20a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6V6a6 6 0 0 1 6-6Zm10 8-8 14h16Z"/></svg></span><span class="forma-app-identity__name">24 pixels</span></span>
    <span class="forma-app-identity" data-forma-size="32"><span class="forma-app-identity__mark"><svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="M6 0h20a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6V6a6 6 0 0 1 6-6Zm10 8-8 14h16Z"/></svg></span><span class="forma-app-identity__name">32 pixels</span></span>
    <span class="forma-app-identity" data-forma-size="64"><span class="forma-app-identity__mark"><svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="M6 0h20a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6V6a6 6 0 0 1 6-6Zm10 8-8 14h16Z"/></svg></span><span class="forma-app-identity__name">64 pixels</span></span>
  </div>
</forma-app-identity>`
    },
    {
      id: "mobile-compact-header",
      interaction: { kind: "static", reasons: ["placeholder-navigation"] },
      title: "Compact phone header, mark only",
      description: "On a narrow header the name is visually hidden, and the link keeps it as its accessible name.",
      mobile: {
        height: 160,
        notes: ["The link keeps a 44 pixel minimum height, so the mark is a full-size touch target even at 24 pixels.","The visually hidden name remains the accessible name; the mark itself is hidden from assistive technology.","A long name wraps inside the identity rather than pushing the header past 320 pixels."]
      },
      html: `<forma-app-identity class="forma-component-tag">
  <a class="forma-app-identity" data-forma-size="24" href="#app-identity-mobile-compact-header">
    <span class="forma-app-identity__mark">
      <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="M6 0h20a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6V6a6 6 0 0 1 6-6Zm10 8-8 14h16Z"/></svg>
    </span>
    <span class="forma-app-identity__name forma-visually-hidden">Northwind Ledger home</span>
  </a>
</forma-app-identity>`
    }
  ],
  api: {
    attributes: [
      { name: "href", on: "a.forma-app-identity", values: "URL", default: "—", description: "Makes the identity the home link. Use a span when it is not a link, such as on a start-up screen." },
      { name: "data-forma-size", on: ".forma-app-identity", values: "16 | 24 | 32 | 64", default: "32", description: "Mark size in CSS pixels. 64 also enlarges the name, for start-up and about surfaces." },
      { name: "focusable", on: "svg (inline mark)", values: "false", default: "—", description: "Preferred mark: an inline SVG drawn with fill=\"currentColor\", with aria-hidden=\"true\" and focusable=\"false\" so it is neither announced nor focused. It takes the theme accent and needs no request." },
      { name: "type", on: "object", values: "image/svg+xml | image/png | image/webp", default: "—", description: "The mark asset's media type. Serve a trusted, same-origin, script-free asset: an object element renders SVG as a document." },
      { name: "data", on: "object", values: "URL", default: "—", description: "The mark asset. When it cannot be loaded the browser renders the object's content, the monogram." },
      { name: "aria-hidden", on: "object and .forma-app-identity__monogram", values: "true", default: "—", description: "Hides the mark; the name is the accessible name." },
      { name: "tabindex", on: "object", values: "-1", default: "—", description: "Keeps the embedded mark out of the tab order." },
      { name: "data-forma-scheme", on: ".forma-app-identity__variant", values: "light | dark", default: "absent (shown in every theme)", description: "Marks a variant for one color scheme. Forma shows the variant that matches the active theme." }
    ],
    hooks: {
      "forma-app-identity": "Root: an inline row of mark and name. A link root gets a 44 pixel minimum height.",
      "forma-app-identity__mark": "Square slot sized by --forma-app-identity-size that holds the mark (inline svg, object or img); its color is the theme accent, which an inline currentColor mark takes.",
      "forma-app-identity__variant": "A light or dark variant of an external mark, selected by data-forma-scheme and the active theme.",
      "forma-app-identity__monogram": "Fallback content of the mark object: one or two letters on an accent tile.",
      "forma-app-identity__name": "The application name, and the accessible name of a link root.",
      "forma-app-identity__context": "Optional smaller secondary line inside the name, for the parent organization or environment.",
      "--forma-app-identity-size": "The mark's edge length. Set it through data-forma-size; override it only for a size the four steps do not cover.",
      "data-forma-size": "Selects --forma-app-identity-size: 1rem, 1.5rem, 2rem or 4rem.",
      "data-forma-scheme": "Variant selector on .forma-app-identity__variant."
    },
    keyboard: [
      { keys: "Tab", action: "Reaches the link root once; the embedded mark is not focusable." },
      { keys: "Enter", action: "Follows the home link." }
    ],
    events: [
      { name: "click", description: "Native link activation when the root is a link. Forma adds no events." }
    ],
    form: "Not a form control."
  },
  states: [
    { name: "Inline mark", how: "an inline svg in .forma-app-identity__mark", description: "Always shown; drawn in the theme accent when it uses currentColor." },
    { name: "Mark loaded", how: "an object's data resolves", description: "The application's external mark is shown at the selected size." },
    { name: "Mark unavailable", how: "an object's data fails or is blocked, including by object-src 'none'", description: "The browser renders the monogram tile instead; the name is unchanged." },
    { name: "Dark theme", how: "data-forma-theme=\"dark\" (or dark-restrained, dark-technical) on an ancestor, or a dark operating-system preference with no explicit theme", description: "A dark-scheme mark variant replaces the light one." },
    { name: "Hover", how: ":hover on a link root", description: "The name is underlined; the mark does not move." },
    { name: "Forced colors", how: "forced-colors: active", description: "The monogram tile becomes a bordered Canvas tile with CanvasText letters." }
  ],
  accessibility: {
    forma: [
      "Keeps the mark out of the accessibility tree and the tab order, so the name is announced once.",
      "Gives a link root a 44 pixel minimum height whatever the mark size.",
      "Draws the monogram with the theme's accent and inverse-text pair and a forced-colors fallback.",
      "Uses no color literal; every color comes from the active theme or brand."
    ],
    consumer: [
      "Supply the visible name, or a visually hidden one when only the mark shows. Do not rely on the mark's own title for the name.",
      "Serve marks that are legible at 16 pixels and keep enough contrast on both light and dark surfaces.",
      "Prefer an inline SVG mark. For an external mark, serve only trusted, script-free, same-origin files, and allow them in the page's object-src if you want them shown rather than the monogram. A same-origin object SVG runs its own script with the page origin's access, so never use object for a customer-supplied mark.",
      "Choose a monogram letter that identifies the application, not the parent organization."
    ]
  },
  responsive: [
    "The name wraps beside the mark; the mark never shrinks below its size.",
    "On narrow headers, visually hide the name rather than removing it.",
    "The root never exceeds its container's width."
  ],
  motion: [
    "None. Hover changes only the underline."
  ],
  guidance: {
    do: [
      "Give every application its own mark and monogram; a parent organization's mark alone is not an application identity.",
      "Use the same identity in the shell header, on the start-up screen and on whole-page error and offline states."
    ],
    avoid: [
      "Text-only placeholders as a final identity.",
      "Recoloring a multi-color external mark with CSS: ship light and dark variants, or draw a single-color inline mark with currentColor."
    ]
  },
  related: [
    { slug: "startup", note: "The pre-runtime start-up surface that shows the identity while the application loads." },
    { slug: "navigation-shell", note: "The application shell whose header usually starts with the identity." },
    { slug: "site-header", note: "The marketing-site header, which has its own brand slot." }
  ]
};
