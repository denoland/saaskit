import RAW_TOC from "./docs/toc.json" assert { type: "json" };
import "https://deno.land/std@0.192.0/dotenv/load.ts";

type RawTableOfContents = Record<string, RawTableOfContentsEntry>;

interface RawTableOfContentsEntry {
  title: string;
  pages?: [string, string][];
}

export interface TableOfContentsEntry {
  slug: string;
  title: string;
  category?: string;
  href: string;
  file: string;
}

export interface TableOfContentsCategory {
  title: string;
  href: string;
  entries: TableOfContentsCategoryEntry[];
}

export interface TableOfContentsCategoryEntry {
  title: string;
  href: string;
}

export const TABLE_OF_CONTENTS: Record<string, TableOfContentsEntry> = {};
export const categories: TableOfContentsCategory[] = [];

for (const parent in (RAW_TOC as unknown as RawTableOfContents)) {
  const rawEntry = (RAW_TOC as unknown as RawTableOfContents)[parent];
  const href = `/docs/${parent}`;
  const file = `docs/${parent}/index.md`;
  const entry = {
    slug: parent,
    title: rawEntry.title,
    href,
    file,
  };
  TABLE_OF_CONTENTS[parent] = entry;
  const category: TableOfContentsCategory = {
    title: rawEntry.title,
    href,
    entries: [],
  };
  categories.push(category);
  if (rawEntry.pages) {
    for (const [id, title] of rawEntry.pages) {
      const slug = `${parent}/${id}`;
      const href = `/docs/${slug}`;
      const file = `docs/${slug}.md`;
      const entry = {
        slug,
        title,
        category: parent,
        href,
        file,
      };
      TABLE_OF_CONTENTS[slug] = entry;
      category.entries.push({
        title,
        href,
      });
    }
  }
}

export interface Page {
  path: string;
  content: string;
  metadata?: {
    author?: string;
    date?: string;
    title?: string;
    images?: string[];
    tags?: string[];
  };
}

export const SLUGS = Object.keys(TABLE_OF_CONTENTS);
