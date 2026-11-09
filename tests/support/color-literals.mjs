// Color-literal detection for rules that must take every color from tokens
// (AIS-001.4: the application identity, start-up and pending-action rules).
import fs from "node:fs";

const HEX = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})\b/gi;
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "));

// Every way of writing a literal color other than a system color or keyword:
// hex (3, 4, 6, 8 digits), color functions, and CSS named colors. Used on
// rules that must take every color from tokens (the AIS-001 block).
const COLOR_FUNCTION = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/gi;
const NAMED_COLORS = "aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen".split(" ");
const NAMED = new RegExp(`:[^;{}]*\\b(?:${NAMED_COLORS.join("|")})\\b`, "gi");
const declarationValues = (css) => stripComments(css).replace(/"[^"]*"|'[^']*'/g, '""');

export const colorLiterals = (css) => {
  const values = declarationValues(css);
  return [
    ...(values.match(HEX) ?? []),
    ...(values.match(COLOR_FUNCTION) ?? []),
    ...[...values.matchAll(NAMED)].map((match) => match[0].trim())
  ];
};

// The AIS-001 block: from its opening marker to the end of components.css.
export const AIS_MARKER = "AIS-001: application identity, pre-runtime startup and pending actions.";
export const aisBlock = (root = ".") => {
  const css = fs.readFileSync(`${root}/src/styles/components.css`, "utf8");
  const start = css.indexOf(AIS_MARKER);
  return start < 0 ? null : css.slice(start);
};

