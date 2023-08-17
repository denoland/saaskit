import { walk } from "https://deno.land/std/fs/mod.ts";
import { OpenAI } from "https://deno.land/x/openai/mod.ts";
import { parse } from "https://deno.land/std@0.192.0/yaml/mod.ts";
import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import "https://deno.land/std@0.192.0/dotenv/load.ts";
import type { Page } from "../data/docs.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;
const DB_DATABASE = Deno.env.get("DB_DATABASE")!;
const DB_HOSTNAME = Deno.env.get("DB_HOSTNAME")!;
const DB_PASSWORD = Deno.env.get("DB_PASSWORD")!;
const DB_PORT = Deno.env.get("DB_PORT")!;
const DB_USER = Deno.env.get("DB_USER")!;

const pool = new Pool({
  database: DB_DATABASE,
  hostname: DB_HOSTNAME,
  password: DB_PASSWORD,
  port: DB_PORT,
  user: DB_USER,
}, 3);

async function generatePage(
  path: string,
  content: string,
  meta: Record<string, unknown>,
) {
  const connection = await pool.connect();

  try {
    const sections = content.split(/\n(?=#+\s)/);

    const { rows: existingPages } = await connection.queryArray(
      `SELECT TRUE FROM page WHERE path = $1 AND checksum = md5($2);`,
      [path, content],
    );

    if ((existingPages).length === 0) {
      const openAI = new OpenAI(OPENAI_API_KEY);

      await connection.queryArray(
        `UPDATE page SET checksum = NULL WHERE path = $1;`,
        [path],
      );
      await connection.queryArray(
        `DELETE FROM page_section WHERE EXISTS (SELECT 1 FROM page WHERE path = $1 AND page.id = page_section.page_id);`,
        [path],
      );

      console.log(`Inserting a new page for path "${path}"`);

      const { rows: newPages } = await connection.queryArray(
        `INSERT INTO page (path, meta) VALUES ($1, $2)
        ON CONFLICT (path) DO UPDATE SET meta = $2 RETURNING id;`,
        [path, meta],
      );

      const pageId = newPages[0][0];

      for (const section of sections) {
        const lines = section.split("\n");
        const heading = lines[0].replace(/#+\s/, "").trim();
        const sectionContent = lines.slice(1).join("\n").replace(/\n/g, " ")
          .trim();
        const openAiContent = `${heading} ${sectionContent}`.trim();

        if (openAiContent === "") {
          continue;
        }

        const embeddingResponse = await openAI.createEmbeddings({
          model: "text-embedding-ada-002",
          input: openAiContent,
        });

        if (!embeddingResponse.data) {
          throw new Error("embeddingResponse.data is undefined");
        }

        const [responseData] = embeddingResponse.data;

        await connection.queryArray(
          `INSERT INTO page_section 
          (page_id, heading, content, embedding) 
          VALUES ($1, $2, $3, $4::numeric[]::vector(1536)) ON CONFLICT (md5(embedding::text)) DO NOTHING;`,
          [pageId, heading, sectionContent, responseData.embedding],
        );
      }

      await connection.queryArray(
        `UPDATE page SET checksum = md5($2) WHERE id = $1;`,
        [pageId, content],
      );
    }
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function getPages(): Promise<Page[]> {
  const pages: Page[] = [];
  const docsDirectory = new URL("../data/docs", import.meta.url).pathname;

  for await (const entry of walk(docsDirectory)) {
    if (entry.isFile && entry.name.endsWith(".md")) {
      const content = Deno.readTextFileSync(entry.path);
      const metadataMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      let metadata = {};
      let mainContent = content;
      if (metadataMatch) {
        metadata = parse(metadataMatch[1]) as Record<string, unknown>;
        mainContent = metadataMatch[2];
      }

      pages.push({ path: entry.path, content: mainContent, metadata });
    }
  }

  return pages;
}

async function deleteRemovedPages(presentPagePaths: Set<string>) {
  try {
    const connection = await pool.connect();

    try {
      const { rows } = await connection.queryArray<[string]>(
        `SELECT path FROM page;`,
      );

      const removedPagePaths = rows
        .filter(([path]) => !presentPagePaths.has(path))
        .map(([path]) => path);

      if (removedPagePaths.length > 0) {
        await connection.queryArray(
          `DELETE FROM page WHERE path = ANY($1::text[]);`,
          [removedPagePaths],
        );
      }
    } finally {
      if (connection) {
        connection.release();
      }
    }
  } catch (error) {
    console.error(`Failed to delete removed pages: ${error}`);
  }
}

console.log("\nUpdating pages and page section embeddings...");

getPages().then((pages) => {
  const presentPagePaths = new Set<string>();
  const generatePagePromises = [];

  for (const page of pages) {
    presentPagePaths.add(page.path);
    generatePagePromises.push(
      generatePage(page.path, page.content, page.metadata || {}),
    );
  }

  return Promise.all(generatePagePromises).then(() => {
    return deleteRemovedPages(presentPagePaths);
  });
}).then(() => {
  console.log("Done!\n");
  Deno.exit(0);
}).catch((error) => {
  console.error(`An error occurred: ${error}`);
  Deno.exit(1);
});
