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

function stripQueryHash(p: string): string {
  return p.replace(/[?#].*$/, "");
}

function matchFile(files: ArtifactFile[], wanted: string): ArtifactFile | undefined {
  const cleaned = stripQueryHash(wanted);
  const target = cleaned.replace(/^\.?\/+/, "");
  return files.find(
    (f) => f.name === target || f.name === cleaned || f.name === wanted,
  );
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function dataUrlFor(file: ArtifactFile): string {
  const mime = file.type || "application/octet-stream";
  if (file.encoding === "base64") {
    return `data:${mime};base64,${file.content}`;
  }
  return `data:${mime};charset=utf-8,${encodeURIComponent(file.content)}`;
}

function inlineCssUrls(css: string, files: ArtifactFile[]): string {
  return css.replace(
    /url\(\s*(["']?)([^"')]+)\1\s*\)/gi,
    (match, _q, raw: string) => {
      if (/^(?:https?:|data:|#|\/\/)/i.test(raw)) return match;
      const file = matchFile(files, raw);
      if (!file) return match;
      return `url("${dataUrlFor(file)}")`;
    },
  );
}

function inlineLinks(
  html: string,
  files: ArtifactFile[],
  visited: Set<string> = new Set(),
): string {
  let out = html.replace(
    /<link\b[^>]*?href=["']([^"']+?\.css(?:[?#][^"']*)?)["'][^>]*?>/gi,
    (match, href) => {
      const file = matchFile(files, href);
      return file
        ? `<style>\n${inlineCssUrls(file.content, files)}\n</style>`
        : match;
    },
  );
  out = out.replace(
    /<script\b([^>]*?)\bsrc=["']([^"']+?\.m?js(?:[?#][^"']*)?)["']([^>]*)><\/script>/gi,
    (match, _pre, src) => {
      const file = matchFile(files, src);
      return file ? `<script>\n${file.content}\n<\/script>` : match;
    },
  );
  // Inline nested HTML iframes so a folder of pages (e.g. an outer page that
  // embeds <iframe src="hmi.html">) renders correctly inside srcdoc, where
  // relative URLs can't resolve.
  out = out.replace(
    /<iframe\b([^>]*?)\bsrc=["']([^"']+?\.html?(?:[?#][^"']*)?)["']([^>]*)>/gi,
    (match, pre: string, src: string, post: string) => {
      const file = matchFile(files, src);
      if (!file) return match;
      const key = file.name;
      if (visited.has(key)) return match;
      const nestedVisited = new Set(visited).add(key);
      const inner = inlineLinks(file.content, files, nestedVisited);
      return `<iframe${pre}srcdoc="${escapeAttr(inner)}"${post}>`;
    },
  );
  // Inline <img>, <source>, and <link rel="icon"> references to bundled image
  // files as data: URLs. Without this, the iframe srcdoc resolves the relative
  // src against the parent page and gets a 404.
  out = out.replace(
    /<img\b([^>]*?)\bsrc=["']([^"']+)["']([^>]*)>/gi,
    (match, pre: string, src: string, post: string) => {
      if (!isImagePath(stripQueryHash(src))) return match;
      const file = matchFile(files, src);
      if (!file) return match;
      return `<img${pre}src="${dataUrlFor(file)}"${post}>`;
    },
  );
  out = out.replace(
    /<source\b([^>]*?)\bsrc=["']([^"']+)["']([^>]*)>/gi,
    (match, pre: string, src: string, post: string) => {
      if (!isImagePath(stripQueryHash(src))) return match;
      const file = matchFile(files, src);
      if (!file) return match;
      return `<source${pre}src="${dataUrlFor(file)}"${post}>`;
    },
  );
  out = out.replace(
    /<link\b([^>]*?\brel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*?)\bhref=["']([^"']+)["']([^>]*)>/gi,
    (match, pre: string, href: string, post: string) => {
      const file = matchFile(files, href);
      if (!file) return match;
      return `<link${pre}href="${dataUrlFor(file)}"${post}>`;
    },
  );
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
    return inlineLinks(indexFile.content, files);
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

/**
 * Encode a UTF-8 string as base64 in a way that works on both Node and the
 * browser. The artifact document embeds the user's source as base64 so we
 * don't have to wrestle with arbitrary characters inside an HTML/JS string.
 */
function encodeBase64(s: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(s, "utf8").toString("base64");
  }
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  // btoa exists in the browser
  return btoa(bin);
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
