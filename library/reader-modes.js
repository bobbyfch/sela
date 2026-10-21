// Generated from app/library/reader-modes.ts by npm run build. Do not edit.
const reflowableFormats = /* @__PURE__ */ new Set(["epub", "txt", "md", "html", "fb2", "docx", "odt"]);
export function isReflowableBookFormat(format) {
  return typeof format === "string" && reflowableFormats.has(format.toLowerCase());
}
