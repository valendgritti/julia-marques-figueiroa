import assert from "node:assert/strict";
import configureEleventy from "../eleventy.config.js";

const filters = {};
configureEleventy({
  addAsyncShortcode() {},
  addFilter(name, filter) { filters[name] = filter; },
  addGlobalData() {},
  addPassthroughCopy() {},
});

const escapedLines = filters.nl2br('<img src=x onerror="alert(1)">\nTexto seguro');
assert.equal(escapedLines, "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;<br />Texto seguro");

const sanitized = filters.sanitizeContent('<p>Texto seguro</p><script>alert(1)</script><a href="javascript:alert(1)" target="_blank">Link</a>');
assert.match(sanitized, /<p>Texto seguro<\/p>/);
assert.doesNotMatch(sanitized, /<script|javascript:|alert\(1\)/i);
assert.match(sanitized, /rel="noopener noreferrer"/);

assert.throws(() => filters.safeExternalUrl("javascript:alert(1)"), /HTTPS/);
assert.equal(filters.safeExternalUrl("https://example.com/path"), "https://example.com/path");

const json = filters.jsonStringify({ value: "</script><script>alert(1)</script>" });
assert.doesNotMatch(json, /<script|<\/script/i);
assert.match(json, /\\u003c/);

console.log("Filtros de renderização segura validados com sucesso.");
