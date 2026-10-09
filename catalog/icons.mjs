// Registry-synchronized reader-facing guidance, composed from bounded modules.
// Geometry and icon identity remain solely in icons/registry.json.
import {foundationIconDocs} from "./icons/foundation.mjs";
import {applicationIconDocs} from "./icons/applications.mjs";

const docs = {...foundationIconDocs, ...applicationIconDocs};
const count = Object.keys(foundationIconDocs).length + Object.keys(applicationIconDocs).length;
if (Object.keys(docs).length !== count) throw new Error("Duplicate Forma icon guidance ID across modules");
export const iconDocs = Object.freeze(docs);
