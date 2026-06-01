export type ArtifactKind = "html" | "jsx";

export type ArtifactEncoding = "utf8" | "base64";

export type ArtifactFile = {
  name: string;
  content: string;
  type: string;
  encoding?: ArtifactEncoding;
};

export type Artifact = {
  id: string;
  title: string;
  kind: ArtifactKind;
  files: ArtifactFile[];
  entry?: string | null;
};

const isHtml = (n: string) => /\.html?$/i.test(n);
const isCss = (n: string) => /\.css$/i.test(n);
const isJs = (n: string) => /\.m?js$/i.test(n) && !/\.jsx?$/i.test(n);
const isJsx = (n: string) => /\.(jsx|tsx)$/i.test(n);
const isReactSource = (n: string) => /\.(jsx|tsx|js|ts)$/i.test(n);
const isImagePath = (n: string) =>
  /\.(png|jpe?g|gif|webp|avif|svg|ico|bmp)$/i.test(n);
const isScript = (n: string) => /\.m?js$/i.test(n);

type ModuleUrlCache = Map<string, string>;

function stripQueryHash(p: string): string {
  return p.replace(/[?#].*$/, "");
}

function normalizePath(p: string): string {
  const parts: string[] = [];
  for (const part of stripQueryHash(p).replace(/\\/g, "/").split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      parts.pop();
    } else {
      parts.push(part);
    }
  }
  return parts.join("/");
}

function dirname(p: string): string {
  const normalized = normalizePath(p);
  const idx = normalized.lastIndexOf("/");
  return idx === -1 ? "" : normalized.slice(0, idx);
}

function isExternalReference(p: string): boolean {
  return /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(p);
}

function resolveFrom(baseFileName: string | undefined, wanted: string): string {
  const cleaned = stripQueryHash(wanted);
  if (!baseFileName || cleaned.startsWith("/")) return normalizePath(cleaned);
  const baseDir = dirname(baseFileName);
  return normalizePath(baseDir ? `${baseDir}/${cleaned}` : cleaned);
}

function matchFile(
  files: ArtifactFile[],
  wanted: string,
  baseFileName?: string,
): ArtifactFile | undefined {
  if (isExternalReference(wanted)) return undefined;

  const cleaned = stripQueryHash(wanted);
  const targets = new Set([
    normalizePath(cleaned),
    resolveFrom(baseFileName, cleaned),
  ]);

  return files.find((f) => {
    const name = normalizePath(f.name);
    return targets.has(name) || f.name === cleaned || f.name === wanted;
  });
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Encode a UTF-8 string as base64 in a way that works on both Node and the
 * browser. The artifact document embeds user source as base64 so we do not
 * have to wrestle with arbitrary characters inside an HTML/JS string.
 */
function encodeBase64(s: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(s, "utf8").toString("base64");
  }
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function dataUrlFor(file: ArtifactFile): string {
  const mime = file.type || "application/octet-stream";
  if (file.encoding === "base64") {
    return `data:${mime};base64,${file.content}`;
  }
  return `data:${mime};charset=utf-8,${encodeURIComponent(file.content)}`;
}

function scriptSafe(s: string): string {
  return s.replace(/<\/script/gi, "<\\/script");
}

function inlineCssUrls(
  css: string,
  files: ArtifactFile[],
  baseFileName?: string,
  quote = '"',
): string {
  return css.replace(
    /url\(\s*(["']?)([^"')]+)\1\s*\)/gi,
    (match, _q, raw: string) => {
      if (isExternalReference(raw)) return match;
      const file = matchFile(files, raw, baseFileName);
      if (!file) return match;
      return `url(${quote}${dataUrlFor(file)}${quote})`;
    },
  );
}

function hasModuleType(attrs: string): boolean {
  return /\btype\s*=\s*(["'])module\1/i.test(attrs);
}

function resolveScriptModule(
  files: ArtifactFile[],
  specifier: string,
  baseFileName: string,
): ArtifactFile | undefined {
  if (isExternalReference(specifier)) return undefined;

  const direct = matchFile(files, specifier, baseFileName);
  if (direct) return direct;

  const cleaned = stripQueryHash(specifier);
  const extensions = [".js", ".mjs", "/index.js", "/index.mjs"];
  for (const ext of extensions) {
    const file = matchFile(files, `${cleaned}${ext}`, baseFileName);
    if (file) return file;
  }

  return undefined;
}

function moduleDataUrl(
  file: ArtifactFile,
  files: ArtifactFile[],
  cache: ModuleUrlCache,
  stack: Set<string>,
): string | null {
  const key = normalizePath(file.name);
  const cached = cache.get(key);
  if (cached) return cached;
  if (stack.has(key)) return null;

  const transformed = transformModuleSource(
    file.content,
    file.name,
    files,
    cache,
    new Set(stack).add(key),
  );
  const url = `data:text/javascript;charset=utf-8;base64,${encodeBase64(
    transformed,
  )}`;
  cache.set(key, url);
  return url;
}

function transformModuleSource(
  source: string,
  baseFileName: string,
  files: ArtifactFile[],
  cache: ModuleUrlCache,
  stack = new Set<string>(),
): string {
  const replaceSpecifier = (
    match: string,
    pre: string,
    specifier: string,
    post: string,
  ) => {
    const file = resolveScriptModule(files, specifier, baseFileName);
    if (!file || !isScript(file.name)) return match;
    const url = moduleDataUrl(file, files, cache, stack);
    return url ? `${pre}${url}${post}` : match;
  };

  return source
    .replace(
      /(\bimport\s+(?:[\s\S]*?\s+from\s*)?["'])([^"']+)(["'])/g,
      replaceSpecifier,
    )
    .replace(
      /(\bexport\s+[\s\S]*?\s+from\s*["'])([^"']+)(["'])/g,
      replaceSpecifier,
    )
    .replace(
      /(\bimport\(\s*["'])([^"']+)(["']\s*\))/g,
      replaceSpecifier,
    );
}

// Rewrite each candidate in a srcset list (e.g. `a.svg 1x, b.svg 2x`) to a
// data: URL. data: URLs never contain a raw comma or space (encodeURIComponent
// percent-encodes both, and base64 has neither), so splitting on commas and
// spaces stays unambiguous after substitution.
function inlineSrcset(
  value: string,
  files: ArtifactFile[],
  baseFileName?: string,
): string {
  return value
    .split(",")
    .map((part) => {
      const seg = part.trim();
      if (!seg) return part;
      const sp = seg.indexOf(" ");
      const url = sp === -1 ? seg : seg.slice(0, sp);
      const desc = sp === -1 ? "" : seg.slice(sp);
      if (isExternalReference(url)) return part;
      if (!isImagePath(stripQueryHash(url))) return part;
      const file = matchFile(files, url, baseFileName);
      if (!file) return part;
      return `${dataUrlFor(file)}${desc}`;
    })
    .join(",");
}

// SVG sprite references (<use href="icons.svg#star">) can't be turned into a
// data: URL the way <img> can — Safari refuses external <use> targets entirely,
// even as data: URLs. Instead we inline each referenced sprite file once into a
// hidden container and rewrite the <use> to a same-document fragment, which
// every browser resolves locally.
function inlineUseSprites(
  html: string,
  files: ArtifactFile[],
  baseFileName?: string,
): string {
  const sprites = new Map<string, ArtifactFile>();
  let out = html.replace(
    /<use\b([^>]*?)\b(xlink:href|href)=["']([^"']+)["']([^>]*?)(\/?)>/gi,
    (match, pre: string, attr: string, ref: string, post: string, slash: string) => {
      if (isExternalReference(ref)) return match;
      const hashIdx = ref.indexOf("#");
      const fileRef = hashIdx === -1 ? ref : ref.slice(0, hashIdx);
      const frag = hashIdx === -1 ? "" : ref.slice(hashIdx);
      // Already a same-document reference (e.g. href="#star") — leave it.
      if (fileRef === "") return match;
      if (!isImagePath(stripQueryHash(fileRef))) return match;
      const file = matchFile(files, fileRef, baseFileName);
      if (!file) return match;
      if (frag === "") {
        // Whole-file reference with no fragment: data: URL is fine here.
        return `<use${pre}${attr}="${dataUrlFor(file)}"${post}${slash}>`;
      }
      sprites.set(file.name, file);
      return `<use${pre}${attr}="${frag}"${post}${slash}>`;
    },
  );
  if (sprites.size === 0) return out;
  const blob = [...sprites.values()].map((f) => f.content).join("\n");
  const container = `<div aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">${blob}</div>`;
  if (/<body\b[^>]*>/i.test(out)) {
    out = out.replace(/(<body\b[^>]*>)/i, `$1\n${container}`);
  } else {
    out = container + out;
  }
  return out;
}

function inlineLinks(
  html: string,
  files: ArtifactFile[],
  visited: Set<string> = new Set(),
  baseFileName?: string,
  moduleCache: ModuleUrlCache = new Map(),
): string {
  let out = html.replace(
    /<link\b[^>]*?href=["']([^"']+?\.css(?:[?#][^"']*)?)["'][^>]*?>/gi,
    (match, href) => {
      const file = matchFile(files, href, baseFileName);
      return file
        ? `<style>\n${inlineCssUrls(file.content, files, file.name)}\n</style>`
        : match;
    },
  );
  out = out.replace(
    /<script\b([^>]*?)\bsrc=["']([^"']+?\.m?js(?:[?#][^"']*)?)["']([^>]*)><\/script>/gi,
    (match, pre: string, src: string, post: string) => {
      const file = matchFile(files, src, baseFileName);
      if (!file) return match;
      const attrs = `${pre}${post}`;
      const content = hasModuleType(attrs)
        ? transformModuleSource(file.content, file.name, files, moduleCache)
        : file.content;
      return `<script${attrs}>\n${scriptSafe(content)}\n<\/script>`;
    },
  );
  out = out.replace(
    /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
    (match, attrs: string, content: string) => {
      if (!hasModuleType(attrs) || /\bsrc\s*=/.test(attrs)) return match;
      const transformed = transformModuleSource(
        content,
        baseFileName ?? "",
        files,
        moduleCache,
      );
      return `<script${attrs}>\n${scriptSafe(transformed)}\n<\/script>`;
    },
  );
  // Inline nested HTML iframes so a folder of pages (e.g. an outer page that
  // embeds <iframe src="hmi.html">) renders correctly inside srcdoc, where
  // relative URLs can't resolve.
  out = out.replace(
    /<iframe\b([^>]*?)\bsrc=["']([^"']+?\.html?(?:[?#][^"']*)?)["']([^>]*)>/gi,
    (match, pre: string, src: string, post: string) => {
      const file = matchFile(files, src, baseFileName);
      if (!file) return match;
      const key = file.name;
      if (visited.has(key)) return match;
      const nestedVisited = new Set(visited).add(key);
      const inner = inlineLinks(
        file.content,
        files,
        nestedVisited,
        file.name,
        moduleCache,
      );
      return `<iframe${pre}srcdoc="${escapeAttr(inner)}"${post}>`;
    },
  );
  // Inline url() references inside embedded <style> blocks. (External .css
  // files are handled above; without this, an inline <style> with
  // background:url(logo.svg) keeps a relative URL that 404s in srcdoc.)
  out = out.replace(
    /<style\b([^>]*)>([\s\S]*?)<\/style>/gi,
    (_match, attrs: string, css: string) =>
      `<style${attrs}>${inlineCssUrls(css, files, baseFileName)}</style>`,
  );
  // Inline url() references inside inline style="" attributes. Gate on a
  // preceding space so we match real attributes, not `el.style=` in scripts,
  // and on the presence of url( so plain styles are left untouched. The data:
  // URL is wrapped in the opposite quote to keep the attribute well-formed.
  out = out.replace(
    /(\s)style=(["'])((?:(?!\2).)*)\2/gi,
    (match, sp: string, q: string, css: string) => {
      if (!/url\(/i.test(css)) return match;
      const altQuote = q === '"' ? "'" : '"';
      return `${sp}style=${q}${inlineCssUrls(css, files, baseFileName, altQuote)}${q}`;
    },
  );
  // Inline <img>, <source>, and <link rel="icon"> references to bundled image
  // files as data: URLs. Without this, the iframe srcdoc resolves the relative
  // src against the parent page and gets a 404.
  out = out.replace(
    /<img\b([^>]*?)\bsrc=["']([^"']+)["']([^>]*)>/gi,
    (match, pre: string, src: string, post: string) => {
      if (!isImagePath(stripQueryHash(src))) return match;
      const file = matchFile(files, src, baseFileName);
      if (!file) return match;
      return `<img${pre}src="${dataUrlFor(file)}"${post}>`;
    },
  );
  out = out.replace(
    /<source\b([^>]*?)\bsrc=["']([^"']+)["']([^>]*)>/gi,
    (match, pre: string, src: string, post: string) => {
      if (!isImagePath(stripQueryHash(src))) return match;
      const file = matchFile(files, src, baseFileName);
      if (!file) return match;
      return `<source${pre}src="${dataUrlFor(file)}"${post}>`;
    },
  );
  // <object data> / <embed src> can point at an SVG document directly.
  out = out.replace(
    /<object\b([^>]*?)\bdata=["']([^"']+)["']([^>]*)>/gi,
    (match, pre: string, data: string, post: string) => {
      if (!isImagePath(stripQueryHash(data))) return match;
      const file = matchFile(files, data, baseFileName);
      if (!file) return match;
      return `<object${pre}data="${dataUrlFor(file)}"${post}>`;
    },
  );
  out = out.replace(
    /<embed\b([^>]*?)\bsrc=["']([^"']+)["']([^>]*)>/gi,
    (match, pre: string, src: string, post: string) => {
      if (!isImagePath(stripQueryHash(src))) return match;
      const file = matchFile(files, src, baseFileName);
      if (!file) return match;
      return `<embed${pre}src="${dataUrlFor(file)}"${post}>`;
    },
  );
  // SVG's <image> element references its source via href / xlink:href.
  out = out.replace(
    /<image\b([^>]*?)\b(xlink:href|href)=["']([^"']+)["']([^>]*?)(\/?)>/gi,
    (match, pre: string, attr: string, ref: string, post: string, slash: string) => {
      if (!isImagePath(stripQueryHash(ref))) return match;
      const file = matchFile(files, ref, baseFileName);
      if (!file) return match;
      return `<image${pre}${attr}="${dataUrlFor(file)}"${post}${slash}>`;
    },
  );
  // Responsive srcset on <img>/<source>. Gate on a preceding space to avoid
  // matching srcset-like text in scripts.
  out = out.replace(
    /(\s)srcset=(["'])((?:(?!\2).)*)\2/gi,
    (_match, sp: string, q: string, value: string) =>
      `${sp}srcset=${q}${inlineSrcset(value, files, baseFileName)}${q}`,
  );
  out = out.replace(
    /<link\b([^>]*?\brel=["'](?:icon|shortcut icon|apple-touch-icon|mask-icon)["'][^>]*?)\bhref=["']([^"']+)["']([^>]*)>/gi,
    (match, pre: string, href: string, post: string) => {
      const file = matchFile(files, href, baseFileName);
      if (!file) return match;
      return `<link${pre}href="${dataUrlFor(file)}"${post}>`;
    },
  );
  // SVG sprite <use> references — inline the sprite and rewrite to a
  // same-document fragment (done last so the <use> markup is otherwise final).
  out = inlineUseSprites(out, files, baseFileName);
  return out;
}

export function buildHtmlDocument(
  files: ArtifactFile[],
  entry?: string | null,
): string {
  const indexFile =
    (entry && matchFile(files, entry)) ||
    files.find((f) => /^index\.html?$/i.test(f.name)) ||
    files.find((f) => isHtml(f.name));

  if (indexFile) {
    return inlineLinks(
      indexFile.content,
      files,
      new Set([indexFile.name]),
      indexFile.name,
    );
  }

  // No HTML — synthesize a basic document from css + js
  const cssBlock = files
    .filter((f) => isCss(f.name))
    .map((f) => f.content)
    .join("\n\n");
  const jsBlock = files
    .filter((f) => isJs(f.name))
    .map((f) => f.content)
    .join("\n\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Artifact</title>
<style>${cssBlock}</style>
</head>
<body>
<script>${jsBlock}<\/script>
</body>
</html>`;
}

export function buildJsxDocument(
  files: ArtifactFile[],
  entry?: string | null,
): string {
  const sourceFiles = files.filter((f) => isReactSource(f.name));
  if (sourceFiles.length === 0) {
    return `<!doctype html><html><body><pre style="color:crimson;padding:1rem;font-family:ui-monospace">No JSX/TSX file found in this artifact.</pre></body></html>`;
  }

  const entryFile =
    (entry && sourceFiles.find((f) => f.name === entry)) ||
    sourceFiles.find((f) =>
      /^(App|Main|index|Page)\.(jsx|tsx|js|ts)$/i.test(f.name),
    ) ||
    sourceFiles.find((f) => isJsx(f.name)) ||
    sourceFiles[0];

  const ordered = [
    ...sourceFiles.filter((f) => f !== entryFile),
    entryFile,
  ];

  // Strip ESM syntax — Babel standalone doesn't link modules.
  const stripped = ordered
    .map((f) => `// === ${f.name} ===\n${f.content}`)
    .join("\n\n")
    .replace(/^\s*import\s+[^;\n]+;?\s*$/gm, "")
    .replace(/^\s*export\s+default\s+/gm, "var __default = ")
    .replace(/^\s*export\s+/gm, "");

  const css = files
    .filter((f) => isCss(f.name))
    .map((f) => f.content)
    .join("\n\n");

  const codeB64 = encodeBase64(stripped);
  const cssB64 = encodeBase64(css);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Artifact</title>
<style>
  html, body { margin: 0; padding: 0; }
  body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  .__artifact-error {
    color: #b00020;
    background: #fff5f5;
    border: 1px solid #ffd0d0;
    padding: 1rem;
    margin: 1rem;
    border-radius: 8px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 13px;
    white-space: pre-wrap;
  }
</style>
<style id="__artifact-user-css"></style>
<script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone@7/babel.min.js"></script>
<script>
  window.__USER_CODE_B64__ = ${JSON.stringify(codeB64)};
  window.__USER_CSS_B64__ = ${JSON.stringify(cssB64)};
</script>
</head>
<body>
<div id="root"></div>
<script>
(function () {
  function showError(message) {
    var div = document.createElement('div');
    div.className = '__artifact-error';
    div.textContent = String(message);
    document.body.appendChild(div);
  }
  function b64decode(s) {
    var bin = atob(s);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder('utf-8').decode(bytes);
  }
  try {
    document.getElementById('__artifact-user-css').textContent =
      b64decode(window.__USER_CSS_B64__);

    var source = b64decode(window.__USER_CODE_B64__);
    var presets = ['react'];
    if (/\\.tsx?\\b/i.test(source)) presets.push('typescript');

    var transformed = Babel.transform(source, {
      presets: presets,
      filename: 'artifact.tsx',
    }).code;

    var mount = [
      '',
      'var __C = (typeof __default !== "undefined" ? __default :',
      '          typeof App !== "undefined" ? App :',
      '          typeof Page !== "undefined" ? Page :',
      '          typeof Main !== "undefined" ? Main : null);',
      'if (!__C) {',
      '  throw new Error("No component to render. Use \`export default\` or define a function named App, Page, or Main.");',
      '}',
      'ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(__C));',
    ].join('\\n');

    new Function('React', 'ReactDOM', transformed + mount)(React, ReactDOM);
  } catch (e) {
    showError((e && (e.stack || e.message)) || 'Render failed');
  }
})();
<\/script>
</body>
</html>`;
}

export function buildArtifactDocument(artifact: {
  kind: ArtifactKind;
  files: ArtifactFile[];
  entry?: string | null;
}): string {
  return artifact.kind === "jsx"
    ? buildJsxDocument(artifact.files, artifact.entry)
    : buildHtmlDocument(artifact.files, artifact.entry);
}

/**
 * Infer the artifact kind from the file list. Used during upload when the
 * user hasn't explicitly chosen.
 */
export function inferKind(files: { name: string }[]): ArtifactKind {
  return files.some((f) => isJsx(f.name)) ? "jsx" : "html";
}
