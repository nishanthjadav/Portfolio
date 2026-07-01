"use client";

import { Fragment, type ReactNode } from "react";
import { findByPath } from "../fileSystem";

// Matches http(s):// URLs, bare www.* URLs, and email addresses. The URL branch
// is greedy up to whitespace; we trim trailing punctuation after the fact so
// something like "see https://foo.com." doesn't include the period.
const LINK_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
const TRAILING_PUNCTUATION = /[.,;:!?)\]}>'"]+$/;

/**
 * Walk a line of text, wrapping each URL/email match in an <a>. Everything
 * else passes through as a plain string so `white-space: pre` still lays out
 * the surrounding ASCII formatting exactly like Notepad would.
 */
function linkify(line: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of line.matchAll(LINK_REGEX)) {
    const raw = match[0];
    const start = match.index ?? 0;

    // Peel off trailing punctuation so it lives outside the link.
    const trailing = raw.match(TRAILING_PUNCTUATION)?.[0] ?? "";
    const clean = trailing ? raw.slice(0, -trailing.length) : raw;

    // Preserve any leading text between the last match and this one.
    if (start > lastIndex) {
      nodes.push(line.slice(lastIndex, start));
    }

    const isEmail = clean.includes("@") && !clean.includes("://");
    const href = isEmail
      ? `mailto:${clean}`
      : clean.startsWith("http")
      ? clean
      : `https://${clean}`;

    nodes.push(
      <a
        key={key++}
        href={href}
        target={isEmail ? undefined : "_blank"}
        rel={isEmail ? undefined : "noreferrer"}
        style={{ color: "#0b48b6", textDecoration: "underline" }}
      >
        {clean}
      </a>
    );

    if (trailing) nodes.push(trailing);
    lastIndex = start + raw.length;
  }

  if (lastIndex < line.length) nodes.push(line.slice(lastIndex));
  return nodes;
}

export default function Notepad({ payload }: { payload: unknown }) {
  const path = typeof payload === "object" && payload && "path" in payload ? String((payload as { path: unknown }).path) : null;
  const node = path ? findByPath(path) : null;

  const body =
    node?.type === "text"
      ? node.content
      : "This file could not be opened.\n\n(Or it was moved. Or deleted. Or never existed.)";

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Fake menu bar — non-functional but sells the vibe */}
      <div
        className="flex items-center gap-3 px-2 h-[22px] border-b"
        style={{ borderColor: "#a7a7a7", background: "#f0f0f0", fontSize: 11 }}
      >
        {["File", "Edit", "Format", "View", "Help"].map((label) => (
          <span key={label} className="cursor-default">
            <span className="underline">{label[0]}</span>
            {label.slice(1)}
          </span>
        ))}
      </div>

      {/*
        Replaces the readonly <textarea> with a styled scroll div. Trade-off:
        no native "select all + copy across the whole doc" UX, but URLs are
        now clickable. Text selection within the div still works normally.
      */}
      <div
        className="flex-1 w-full p-2 overflow-auto bg-white"
        style={{
          fontFamily: '"Lucida Console", "Courier New", monospace',
          fontSize: 12,
          color: "#111",
          lineHeight: 1.4,
          whiteSpace: "pre",
        }}
      >
        {body.split("\n").map((line, i, arr) => (
          <Fragment key={i}>
            {linkify(line)}
            {i < arr.length - 1 ? "\n" : null}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
