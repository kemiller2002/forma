export default {
  name: "Frame",
  category: "layout",
  behavior: "Native CSS",
  summary: "Constrains media to an explicit aspect ratio while keeping content contained.",
  purpose: {
    description: "A frame reserves a box of a declared aspect ratio and fills it with an image, video or SVG, cropping with `object-fit: cover` rather than distorting. Because the box has a ratio before the media loads, the page does not shift when the image arrives. The frame is a figure, so a caption can travel with the media. It owns proportion and containment only; the media itself, its alt text and its caption are content.",
    useWhen: [
      "Images of different source sizes must line up at one proportion, such as thumbnails in a grid.",
      "Space should be reserved for media before it loads to avoid layout shift.",
      "A figure needs a caption associated with its media."
    ],
    avoidWhen: [
      "The whole image must remain visible (diagrams, screenshots with text at the edges): cover cropping may cut content, so use a plain img or figure.",
      "The media is a data visualization with its own layout: use [[diagram]].",
      "The image is a selectable option: use [[image-choice]]."
    ],
    characteristics: [
      "Default ratio is 16 / 9; any ratio is set with `--ef-frame-ratio`.",
      "Media is cropped from the center; nothing overflows the frame.",
      "The figure has no margin, so it sits flush in stacks and grids."
    ]
  },
  examples: [
    {
      id: "square-thumbnails",
      title: "Square product thumbnails",
      description: "Product photos of different source proportions shown as 1 / 1 frames in a grid. Every thumbnail lines up; each image keeps meaningful alt text and the caption names the product.",
      html: `<ef-frame class="ef-component-tag">
  <ul class="ef-grid" role="list" aria-label="Recently viewed" style="--ef-grid-min: 9rem">
    <li>
      <figure class="ef-frame" style="--ef-frame-ratio: 1 / 1">
        <div class="ef-frame__media"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect width='100%25' height='100%25' fill='%23c9c4b8'/%3E%3C/svg%3E" alt="Oak desk with two drawers, front view"></div>
        <figcaption>Oak desk</figcaption>
      </figure>
    </li>
    <li>
      <figure class="ef-frame" style="--ef-frame-ratio: 1 / 1">
        <div class="ef-frame__media"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='500'%3E%3Crect width='100%25' height='100%25' fill='%23b5b0a4'/%3E%3C/svg%3E" alt="Tall bookcase with five shelves"></div>
        <figcaption>Bookcase</figcaption>
      </figure>
    </li>
    <li>
      <figure class="ef-frame" style="--ef-frame-ratio: 1 / 1">
        <div class="ef-frame__media"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500'%3E%3Crect width='100%25' height='100%25' fill='%23ddd8cc'/%3E%3C/svg%3E" alt="Grey fabric desk chair"></div>
        <figcaption>Desk chair</figcaption>
      </figure>
    </li>
  </ul>
</ef-frame>`
    },
    {
      id: "inline-svg-banner",
      title: "Wide banner with inline SVG",
      description: "A 21 / 9 frame holding an inline SVG illustration. The SVG has role=\"img\" and a title, so it is announced as one image with a name, and it draws with currentColor so it follows the theme and forced colors.",
      html: `<ef-frame class="ef-component-tag">
  <figure class="ef-frame" style="--ef-frame-ratio: 21 / 9">
    <div class="ef-frame__media">
      <svg viewBox="0 0 210 90" role="img" aria-labelledby="frame-inline-svg-banner-title" preserveAspectRatio="xMidYMid slice">
        <title id="frame-inline-svg-banner-title">Three connected servers representing a replicated database</title>
        <rect x="20" y="30" width="40" height="30" fill="currentColor"/>
        <rect x="85" y="30" width="40" height="30" fill="currentColor"/>
        <rect x="150" y="30" width="40" height="30" fill="currentColor"/>
        <path d="M60 45 H85 M125 45 H150" stroke="currentColor" stroke-width="3"/>
      </svg>
    </div>
    <figcaption>Replication keeps three copies of every write across availability zones.</figcaption>
  </figure>
</ef-frame>`
    },
    {
      id: "mobile-article-image",
      title: "Mobile article image",
      description: "A 4 / 3 lead image and caption at phone width. The frame scales down with the column and keeps its proportion.",
      mobile: {
        height: 380,
        notes: [
          "The frame is as wide as its parent, so at 320px the image is 320px minus the page gutter and its height follows the 4 / 3 ratio.",
          "The reserved ratio prevents content below from jumping when the image loads on a slow connection.",
          "The caption wraps under the image at any width; it never overlaps the media.",
          "In landscape the frame widens and grows taller in proportion; cropping stays centered."
        ]
      },
      html: `<ef-frame class="ef-component-tag">
  <figure class="ef-frame" style="--ef-frame-ratio: 4 / 3">
    <div class="ef-frame__media"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'%3E%3Crect width='100%25' height='100%25' fill='%23c9c4b8'/%3E%3C/svg%3E" alt="Warehouse floor with packing stations along the wall"></div>
    <figcaption>The new packing line in the Rotterdam warehouse handles 4,000 orders a day.</figcaption>
  </figure>
</ef-frame>`
    }
  ],
  api: {
    attributes: [
      { name: "style", on: ".ef-frame", values: "--ef-frame-ratio: <ratio>", default: "16 / 9", description: "Per-instance aspect ratio, for example 1 / 1 or 4 / 3." },
      { name: "alt", on: "img", values: "string", default: "—", description: "Required on images. Describe the content; use alt=\"\" only when the image is decorative and the caption carries the meaning." },
      { name: "role", on: "svg", values: "img", default: "—", description: "Makes an inline SVG a single named image." },
      { name: "aria-labelledby", on: "svg", values: "id of the SVG title", default: "—", description: "Names the SVG image from its title element." },
      { name: "aria-label", on: "list wrapper", values: "string", default: "—", description: "Names a grid of framed images." }
    ],
    hooks: {
      "ef-frame": "Figure wrapper with zero margin. Declares the ratio variable.",
      "ef-frame__media": "Box with `aspect-ratio: var(--ef-frame-ratio)` and hidden overflow.",
      "--ef-frame-ratio": "Aspect ratio of the media box. Default 16 / 9."
    },
    keyboard: [],
    events: [],
    form: "Not a form control."
  },
  states: [
    { name: "Framed", how: "img, video, iframe or svg as a direct child of .ef-frame__media", description: "Media fills the box and is cropped with object-fit: cover." }
  ],
  accessibility: {
    forma: [
      "Uses figure and figcaption, so the caption is associated with the media.",
      "Reserves space before load, avoiding layout shift that moves content under the user's pointer or focus.",
      "Adds no roles to the media."
    ],
    consumer: [
      "Provide alt text that describes what matters in the image, accounting for any cropping.",
      "Do not frame media whose meaning depends on its edges; cover cropping can remove it.",
      "Give video captions and controls through the native video element."
    ]
  },
  responsive: [
    "Fluid width: the frame fills its parent and height follows the ratio.",
    "No breakpoints; change the ratio per context with `--ef-frame-ratio` if a different proportion suits narrow screens.",
    "Media cannot overflow the frame, so large images never cause horizontal scrolling."
  ],
  motion: [
    "No animation: the frame is static. Video playback is controlled by the native element and the user."
  ],
  guidance: {
    do: [
      "Choose one ratio per collection so items align.",
      "Keep the subject of photos centered, since cropping is centered."
    ],
    avoid: [
      "Framing screenshots or charts that contain text near the edges.",
      "Putting the media inside extra wrappers; only direct children of `.ef-frame__media` are sized."
    ]
  },
  related: [
    { slug: "grid", note: "Lays out a collection of framed images." },
    { slug: "diagram", note: "Structured diagrams that must not be cropped." },
    { slug: "image-choice", note: "Images used as selectable options." }
  ]
};
