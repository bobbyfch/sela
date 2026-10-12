// Generated from app/site/product-language.ts by npm run build. Do not edit.
import { translate } from "../dist/source/src/i18n.js";
function apply() {
  const locale = document.documentElement.lang || "en-US";
  for (const element of document.querySelectorAll("[data-en][data-id]")) {
    element.textContent = translate(element.dataset.en || "", element.dataset.id || "", locale);
  }
}
new MutationObserver(apply).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
apply();
