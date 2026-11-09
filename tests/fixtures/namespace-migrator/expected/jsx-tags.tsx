// Forma 1.0.2: `>` inside a JSX expression or a quoted value does not end the tag.
export const A = () => <a onClick={() => go()} href={"ef-docs"} className="forma-link">x</a>;
export const B = () => <img onLoad={() => x > 1} src="ef-asset" className="forma-img" />;
export const config = ".ef-config.json"; export const rc = "/.ef-rc.json";
