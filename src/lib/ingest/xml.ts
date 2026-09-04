// Minimal, dependency-free XML parser sufficient for RSS 2.0 / Atom feeds.
// Handles nested elements, attributes, CDATA and common entity references.

export interface XmlNode {
  tag: string;
  attrs: Record<string, string>;
  children: XmlNode[];
  text: string;
}

const CDATA_OPEN = new RegExp("<!\\[CDATA\\[", "g");
const CDATA_CLOSE = new RegExp("\\]\\]>", "g");
const ENTITY_NUM = /&#(\d+);/g;

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(ENTITY_NUM, (_m, n: string) => String.fromCodePoint(parseInt(n, 10)));
}

export function parseXml(input: string): XmlNode {
  const xml = input.replace(/<\?xml[^>]*\?>/i, "").trim();
  const stack: XmlNode[] = [];
  let root: XmlNode | null = null;
  let i = 0;

  const textOf = (s: string) => decodeEntities(s.replace(CDATA_OPEN, "").replace(CDATA_CLOSE, "").trim());

  while (i < xml.length) {
    const lt = xml.indexOf("<", i);
    if (lt === -1) break;
    if (lt > i) {
      const text = textOf(xml.slice(i, lt));
      if (text && stack.length) stack[stack.length - 1].text += text;
    }
    if (xml.startsWith("<!--", lt)) {
      const end = xml.indexOf("-->", lt);
      i = end === -1 ? xml.length : end + 3;
      continue;
    }
    const close = xml.indexOf(">", lt);
    if (close === -1) break;
    const tagRaw = xml.slice(lt + 1, close).trim();
    i = close + 1;

    if (tagRaw.startsWith("/")) {
      stack.pop();
      if (stack.length === 0 && root) break;
      continue;
    }
    if (tagRaw.endsWith("/")) {
      // self-closing
      continue;
    }
    if (tagRaw.startsWith("!")) continue; // doctype / declarations

    const tagMatch = tagRaw.match(/^([a-zA-Z0-9:_-]+)/);
    if (!tagMatch) continue;
    const tag = tagMatch[1];
    const attrs: Record<string, string> = {};
    const attrRe = /([a-zA-Z0-9:_-]+)\s*=\s*"([^"]*)"/g;
    let m: RegExpExecArray | null;
    while ((m = attrRe.exec(tagRaw))) attrs[m[1]] = decodeEntities(m[2]);

    const node: XmlNode = { tag, attrs, children: [], text: "" };
    if (!root) {
      root = node;
    } else if (stack.length) {
      stack[stack.length - 1].children.push(node);
    }
    stack.push(node);
  }
  if (!root) throw new Error("No root element found in XML");
  return root;
}

/** Collect all descendants with a given tag name. */
export function findAll(root: XmlNode, tag: string): XmlNode[] {
  const out: XmlNode[] = [];
  const walk = (n: XmlNode) => {
    for (const c of n.children) {
      if (c.tag === tag) out.push(c);
      walk(c);
    }
  };
  walk(root);
  return out;
}

/** Get the trimmed text of the first descendant with the given tag. */
export function findText(root: XmlNode, tag: string): string {
  const nodes = findAll(root, tag);
  if (!nodes.length) return "";
  return nodes[0].text.trim();
}

export function childText(node: XmlNode, tag: string): string {
  const child = node.children.find((c) => c.tag === tag);
  return child ? child.text.trim() : "";
}