export default {
  name: "Image choice",
  category: "selection",
  behavior: "Native HTML",
  summary: "Choice cards that pair media with visible text while keeping the native radio or checkbox as the input.",
  purpose: {
    description: "Image choice is the [[choice-group]] card with a picture. Adding `ef-choice--media` to an `ef-choice` label turns it into a two-column card: an `ef-choice__media` frame with a 4:3 aspect ratio beside the usual bold label and supporting text. The input stays a native radio (single choice) or checkbox (several choices), so selection, keyboard behavior and form submission are unchanged. The image supports recognition; the visible text is the accessible name and must carry the whole meaning, because images never replace text.",
    useWhen: [
      "Options are visual (layouts, themes, chart types, product variants) and a preview helps people recognise them.",
      "Each option still has a clear text name that works without the image.",
      "Two to about six options are compared in a list."
    ],
    avoidWhen: [
      "The picture is decoration with no recognition value: use a plain [[choice-group]].",
      "The meaning lives only in the image (for example a color swatch with no name): add a text name first, or reconsider the question.",
      "There are many options that users filter or search: use [[select]] or [[combobox]]."
    ],
    characteristics: [
      "Media frame and text sit side by side above 44rem and stack (media on top) at 44rem and below.",
      "The drawn round/square indicator of the plain choice card is hidden in the media variant.",
      "The selected card is shown by an accent border and a secondary surface; forced-colors mode fills it with Highlight.",
      "Images are cropped to the frame with `object-fit: cover` and never widen the card."
    ]
  },
  examples: [
    {
      id: "chart-type-checkboxes",
      title: "Chart types, several allowed",
      description: "Checkbox-backed media cards for a dashboard builder, with two chosen. The previews are inline SVG marked aria-hidden, so each option is announced only by its visible name and description.",
      html: `<ef-image-choice class="ef-component-tag">
  <fieldset class="ef-choice-group">
    <legend class="ef-choice-group__legend">Which charts should the dashboard include?</legend>
    <label class="ef-choice ef-choice--media">
      <input type="checkbox" name="image-choice-chart-type-checkboxes" value="line" checked>
      <span class="ef-choice__media">
        <svg viewBox="0 0 120 90" width="120" height="90" aria-hidden="true" focusable="false"><polyline points="10,70 40,45 65,55 110,20" fill="none" stroke="currentColor" stroke-width="4"/></svg>
      </span>
      <span class="ef-choice__content"><strong>Line chart</strong><span>Change over time for one or two measures.</span></span>
    </label>
    <label class="ef-choice ef-choice--media">
      <input type="checkbox" name="image-choice-chart-type-checkboxes" value="bar" checked>
      <span class="ef-choice__media">
        <svg viewBox="0 0 120 90" width="120" height="90" aria-hidden="true" focusable="false"><rect x="15" y="40" width="18" height="40" fill="currentColor"/><rect x="45" y="20" width="18" height="60" fill="currentColor"/><rect x="75" y="50" width="18" height="30" fill="currentColor"/></svg>
      </span>
      <span class="ef-choice__content"><strong>Bar chart</strong><span>Compare totals across categories.</span></span>
    </label>
    <label class="ef-choice ef-choice--media">
      <input type="checkbox" name="image-choice-chart-type-checkboxes" value="table">
      <span class="ef-choice__media">
        <svg viewBox="0 0 120 90" width="120" height="90" aria-hidden="true" focusable="false"><rect x="10" y="15" width="100" height="60" fill="none" stroke="currentColor" stroke-width="3"/><line x1="10" y1="35" x2="110" y2="35" stroke="currentColor" stroke-width="3"/><line x1="10" y1="55" x2="110" y2="55" stroke="currentColor" stroke-width="3"/><line x1="50" y1="15" x2="50" y2="75" stroke="currentColor" stroke-width="3"/></svg>
      </span>
      <span class="ef-choice__content"><strong>Table</strong><span>Exact values with sorting.</span></span>
    </label>
  </fieldset>
</ef-image-choice>`
    },
    {
      id: "theme-preselected",
      title: "Preselected theme with an unavailable option",
      description: "A single-choice radio set with the current theme checked and one option natively disabled by the application. Because the media variant has no drawn indicator, the visible text (\"Current theme\") also states which option is active.",
      html: `<ef-image-choice class="ef-component-tag">
  <fieldset class="ef-choice-group">
    <legend class="ef-choice-group__legend">Workspace theme</legend>
    <label class="ef-choice ef-choice--media">
      <input type="radio" name="image-choice-theme-preselected" value="light" checked>
      <span class="ef-choice__media">
        <svg viewBox="0 0 120 90" width="120" height="90" aria-hidden="true" focusable="false"><rect x="8" y="8" width="104" height="74" fill="none" stroke="currentColor" stroke-width="3"/><rect x="8" y="8" width="30" height="74" fill="currentColor" opacity="0.2"/></svg>
      </span>
      <span class="ef-choice__content"><strong>Light</strong><span>Current theme. Dark text on a pale surface.</span></span>
    </label>
    <label class="ef-choice ef-choice--media">
      <input type="radio" name="image-choice-theme-preselected" value="dark">
      <span class="ef-choice__media">
        <svg viewBox="0 0 120 90" width="120" height="90" aria-hidden="true" focusable="false"><rect x="8" y="8" width="104" height="74" fill="currentColor"/></svg>
      </span>
      <span class="ef-choice__content"><strong>Dark</strong><span>Pale text on a dark surface.</span></span>
    </label>
    <label class="ef-choice ef-choice--media">
      <input type="radio" name="image-choice-theme-preselected" value="brand" disabled>
      <span class="ef-choice__media">
        <svg viewBox="0 0 120 90" width="120" height="90" aria-hidden="true" focusable="false"><circle cx="60" cy="45" r="28" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="6 6"/></svg>
      </span>
      <span class="ef-choice__content"><strong>Organization brand</strong><span>Unavailable: your administrator has not published a brand yet.</span></span>
    </label>
  </fieldset>
</ef-image-choice>`
    },
    {
      id: "mobile-stacked-media",
      title: "Stacked media on a phone",
      description: "Two layout previews at phone width. Each card stacks its media frame above the text so the preview keeps a usable size and the text keeps the full width.",
      mobile: {
        height: 520,
        notes: [
          "At 44rem and below `ef-choice--media` switches to one column: the 4:3 media frame spans the card width above the label and description.",
          "The whole card, image included, is the tap target for the radio.",
          "Images scale to the frame (`max-inline-size: 100%`, `object-fit: cover`), so large source images cannot cause horizontal overflow at 320px.",
          "Cards become taller in portrait; plan for the list to scroll vertically rather than shrinking previews."
        ]
      },
      html: `<ef-image-choice class="ef-component-tag">
  <fieldset class="ef-choice-group">
    <legend class="ef-choice-group__legend">Which layout is easiest to scan?</legend>
    <label class="ef-choice ef-choice--media">
      <input type="radio" name="image-choice-mobile-stacked-media" value="list" required>
      <span class="ef-choice__media">
        <svg viewBox="0 0 120 90" width="120" height="90" aria-hidden="true" focusable="false"><rect x="10" y="12" width="100" height="14" fill="currentColor"/><rect x="10" y="38" width="100" height="14" fill="currentColor"/><rect x="10" y="64" width="100" height="14" fill="currentColor"/></svg>
      </span>
      <span class="ef-choice__content"><strong>List</strong><span>One item per row with the most detail.</span></span>
    </label>
    <label class="ef-choice ef-choice--media">
      <input type="radio" name="image-choice-mobile-stacked-media" value="grid">
      <span class="ef-choice__media">
        <svg viewBox="0 0 120 90" width="120" height="90" aria-hidden="true" focusable="false"><rect x="10" y="10" width="45" height="32" fill="currentColor"/><rect x="65" y="10" width="45" height="32" fill="currentColor"/><rect x="10" y="50" width="45" height="32" fill="currentColor"/><rect x="65" y="50" width="45" height="32" fill="currentColor"/></svg>
      </span>
      <span class="ef-choice__content"><strong>Grid</strong><span>Cards with a thumbnail and title.</span></span>
    </label>
  </fieldset>
</ef-image-choice>`
    }
  ],
  api: {
    attributes: [
      { name: "type", on: "input", values: "radio | checkbox", default: "—", description: "Radio for one answer, checkbox for several. The media variant draws no indicator for either." },
      { name: "name", on: "input", values: "string", default: "—", description: "Shared by the options of one question; unique per question on the page." },
      { name: "value", on: "input", values: "string", default: "\"on\"", description: "Submitted value for each chosen option." },
      { name: "checked", on: "input", values: "boolean", default: "absent", description: "Initial selection." },
      { name: "required", on: "input", values: "boolean", default: "absent", description: "Native constraint for radio groups." },
      { name: "disabled", on: "input", values: "boolean", default: "absent", description: "Makes an option unavailable and dims the whole card." },
      { name: "alt", on: "img", values: "\"\" or text", default: "—", description: "Use `alt=\"\"` when the visible text fully names the option, so the name is not announced twice. Give real alt text only when the image adds information the text does not." },
      { name: "aria-hidden", on: "inline svg", values: "true", default: "—", description: "Hides decorative inline SVG previews from assistive technology." }
    ],
    hooks: {
      "ef-choice--media": "Owned by [[choice-group]]. Turns an `ef-choice` card into the media layout: two columns, inline-start padding reduced, drawn indicator hidden. One column at 44rem and below.",
      "ef-choice__media": "The media frame: 4:3 aspect ratio, subtle border, secondary surface, content centred and clipped. A child `img` is scaled to fit with `object-fit: cover`.",
      "ef-choice__content": "The bold option name and supporting text, as in every choice card."
    },
    keyboard: [
      { keys: "Tab / Shift+Tab", action: "Radios: the group is one tab stop. Checkboxes: each option is a tab stop." },
      { keys: "Arrow keys", action: "Radios only: move to and select the next or previous option (native behavior)." },
      { keys: "Space", action: "Toggles a checkbox, or selects the focused radio when none is selected." }
    ],
    events: [
      { name: "input / change", description: "Native events from the radio or checkbox. Forma adds none." }
    ],
    form: "Identical to [[choice-group]] (radios) or [[multi-choice]] (checkboxes): checked options submit name=value, required applies to radio groups, and reset restores initial state."
  },
  states: [
    { name: "Unselected", how: "no checked attribute", description: "Functional border, primary surface, no indicator." },
    { name: "Selected", how: ":checked", description: "Accent border and secondary surface. There is no shape indicator in this variant, so the change is a border and surface color change; forced-colors mode uses a Highlight fill." },
    { name: "Focus", how: ":focus-visible on the input", description: "Two-tone focus ring around the whole card." },
    { name: "Disabled", how: "disabled attribute", description: "Card at reduced opacity with a not-allowed cursor." }
  ],
  accessibility: {
    forma: [
      "Keeps a native radio or checkbox inside the card, so the accessible name is the visible text and the state is programmatic.",
      "Makes the whole card, including the media, the click and touch target.",
      "Keeps the media inside a bounded frame so images cannot break layout at 320px or 400% zoom.",
      "Uses Highlight/HighlightText for selected cards in forced-colors mode."
    ],
    consumer: [
      "Give every option a visible text name that works without the image.",
      "Use `alt=\"\"` or aria-hidden for previews that repeat the text, and real alt text only for information the text lacks.",
      "Because the selected state has no shape cue in this variant, consider stating the current choice in text (as in \"Current theme\") where it matters.",
      "Supply images at a 4:3 ratio, or accept cropping by `object-fit: cover`."
    ]
  },
  responsive: [
    "Above 44rem the card is a two-column grid: a `minmax(5rem, 8rem)` media column and a flexible text column.",
    "At 44rem and below the card is one column with the media on top.",
    "The media frame keeps a 4:3 aspect ratio and clips overflow; images scale down to fit.",
    "Text wraps in its column; no horizontal overflow at 320px."
  ],
  motion: [
    "Border, background and text color change by perceptual interpolation (about 120ms), shared with every choice card; nothing moves and selection is immediate.",
    "Images are not animated. Under `prefers-reduced-motion: reduce` the color transition is effectively instant."
  ],
  guidance: {
    do: [
      "Use previews that differ in structure, not only in color.",
      "Keep option names short and put the distinguishing detail in the supporting text."
    ],
    avoid: [
      "Image-only options without a visible text name.",
      "Photographs whose important detail disappears when cropped to 4:3 or shown at 8rem wide.",
      "Mixing media and plain cards in the same question."
    ]
  },
  related: [
    { slug: "choice-group", note: "Plain single-choice cards without media, and the owner of the `ef-choice--media` hook." },
    { slug: "multi-choice", note: "Adds guidance and status text for several selections; combine it with media cards." },
    { slug: "segmented-control", note: "Use for a few short text options side by side." },
    { slug: "select", note: "Use for long lists of options where previews do not help." }
  ]
};
