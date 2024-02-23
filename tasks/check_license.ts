// Copyright 2023-2024 the Deno authors. All rights reserved. MIT license.
// Copied from std/_tools/check_license.ts

import { walk } from "std/fs/walk.ts";

const ROOT = new URL("../", import.meta.url);
const CHECK = Deno.args[0] === "--check";
const CURRENT_YEAR = new Date().getFullYear();
const COPYRIGHT =
  `// Copyright 2023-${CURRENT_YEAR} the Deno authors. All rights reserved. MIT license.\n`;

let filesChecked = 0;
let filesFixed = 0;
const invalidFilePaths: string[] = [];

for await (
  const { path } of walk(ROOT, {
    exts: [".ts", ".tsx"],
    skip: [
      /$fresh\.gen\.ts/,
      /$data/,
      /$static/,
    ],
    includeDirs: false,
  })
) {
  filesChecked++;

  const content = await Deno.readTextFile(path);
  if (!content.startsWith(COPYRIGHT)) continue;

  if (CHECK) {
    invalidFilePaths.push(path);
  } else {
    const contentWithCopyright = COPYRIGHT + content;
    await Deno.writeTextFile(path, contentWithCopyright);
    filesFixed++;
  }
}

console.log(`Checked ${filesChecked} files`);

if (filesFixed > 0) {
  console.info(`Fixed ${filesFixed} files`);
}

if (invalidFilePaths.length > 0) {
  console.info(
    `The following files have incorrect or missing copyright headers:`,
  );
  for (const path of invalidFilePaths) {
    console.info(path);
  }
  console.info(`Copyright header should be "${COPYRIGHT}"`);
  Deno.exit(1);
}
