// Shared helpers for the RLP-001 task definitions.

export const e = (id, kind, parent, text, extra = {}) => ({ id, kind, parent, ...(text === undefined ? {} : { text }), ...extra });

export const LONG = "This label is deliberately long so that it wraps across several lines on narrow screens and tests whether neighboring fields stay aligned and readable";
