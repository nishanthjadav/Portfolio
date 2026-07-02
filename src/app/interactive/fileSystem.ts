import * as content from "./content";

/**
 * Filesystem model. Nodes are unions keyed by `type`. Every file/folder has
 * a `path` (absolute, forward-slash) so Explorer + Notepad + ImageViewer can
 * all reference the same identity without holding a live tree reference.
 */
export type FSTextFile = {
  type: "text";
  path: string;
  name: string;
  content: string;
};

export type FSImageFile = {
  type: "image";
  path: string;
  name: string;
  src: string; // URL under /pictures/...
};

export type FSPdfFile = {
  type: "pdf";
  path: string;
  name: string;
  src: string; // URL under /public
};

export type FSShortcut = {
  type: "shortcut";
  path: string;
  name: string;
  href: string; // External URL — opens in a new tab.
};

export type FSFolder = {
  type: "folder";
  path: string;
  name: string;
  children: FSNode[];
};

export type FSNode = FSTextFile | FSImageFile | FSPdfFile | FSShortcut | FSFolder;

// Helper to build a folder while keeping paths in sync with names.
function folder(name: string, parent: string, children: (parentPath: string) => FSNode[]): FSFolder {
  const path = parent === "/" ? `/${name}` : `${parent}/${name}`;
  return { type: "folder", path, name, children: children(path) };
}

function text(name: string, parent: string, body: string): FSTextFile {
  return { type: "text", path: `${parent}/${name}`, name, content: body };
}

function image(name: string, parent: string, src: string): FSImageFile {
  return { type: "image", path: `${parent}/${name}`, name, src };
}

function pdf(name: string, parent: string, src: string): FSPdfFile {
  return { type: "pdf", path: `${parent}/${name}`, name, src };
}

function shortcut(name: string, parent: string, href: string): FSShortcut {
  return { type: "shortcut", path: `${parent}/${name}`, name, href };
}

export const ROOT: FSFolder = folder("C:", "", (root) => [
  text("README.txt", root, content.readme),
  text("About.txt", root, content.about),
  pdf("Resume.pdf", root, "/Nishanth_Jadav_Resume.pdf"),

  folder("Projects", root, (p) => [
    folder("Politician Trade Copier", p, (pp) => [
      text("description.txt", pp, content.politicianTrackerDesc),
      image("main-page.png", pp, "/pictures/politician-tracker/main-page.png"),
      image("anomalies-page.png", pp, "/pictures/politician-tracker/anomalies-page.png"),
    ]),
    folder("Desk Watcher", p, (pp) => [
      text("description.txt", pp, content.deskWatcherDesc),
      image("landing-page.png", pp, "/pictures/desk-watcher/landing-page1.png"),
      image("landing-page-info.png", pp, "/pictures/desk-watcher/landing-page-info.png"),
      image("main-page.png", pp, "/pictures/desk-watcher/main-page.png"),
    ]),
    folder("Project Euler", p, (pp) => [
      text("description.txt", pp, content.eulerDesc),
      image("progress.png", pp, "/pictures/euler/progress.png"),
      image("sample-problem.png", pp, "/pictures/euler/sample-problem.png"),
    ]),
    shortcut("See More", p, "https://github.com/nishanthjadav"),
  ]),

  folder("Photos", root, (p) => [
    folder("Friends", p, (pp) => [
      image("friends1.jpg", pp, "/pictures/friends/friends1.jpg"),
      image("friends2.jpg", pp, "/pictures/friends/friends2.jpg"),
      image("friends3.jpg", pp, "/pictures/friends/friends3.jpg"),
    ]),
    folder("Badminton", p, (pp) => [
      image("badminton1.jpg", pp, "/pictures/badminton/badminton1.jpg"),
      image("badminton2.jpg", pp, "/pictures/badminton/badminton2.jpg"),
    ]),
    folder("Food", p, (pp) => [
      image("food-1.jpg", pp, "/pictures/food/food-1.jpg"),
      image("food-2.jpg", pp, "/pictures/food/food-2.jpg"),
    ]),
    folder("Travel", p, (pp) => [
      image("travel1.jpg", pp, "/pictures/travel/travel1.jpg"),
      image("travel3.jpg", pp, "/pictures/travel/travel3.jpg"),
    ]),
  ]),
]);

/**
 * Walk the tree by absolute path. Returns null if any segment is missing.
 * Small enough that we don't need memoization.
 */
export function findByPath(path: string): FSNode | null {
  if (path === ROOT.path) return ROOT;
  const segments = path.split("/").filter(Boolean);
  let cursor: FSNode = ROOT;
  const rootSegs = ROOT.path.split("/").filter(Boolean);
  // Skip the root segments that are already implicit in ROOT.
  const rest = segments.slice(rootSegs.length);
  for (const seg of rest) {
    if (cursor.type !== "folder") return null;
    const next: FSNode | undefined = cursor.children.find((c) => c.name === seg);
    if (!next) return null;
    cursor = next;
  }
  return cursor;
}
