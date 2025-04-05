// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import { defineRoute } from "$fresh/src/server/defines.ts";
import Head from "@/components/Head.tsx";
import { isGitHubSetup } from "@/utils/github.ts";

function SetupInstruction() {
  return (
    <div class="bg-green-50 dark:bg-gray-900 dark:border dark:border-green-800 rounded-xl max-w-screen-sm mx-auto p-8 space-y-2">
    </div>
  );
}

export default defineRoute((_req, ctx) => {
  return (
    <>
      <Head title="Welcome" href={ctx.url.href} />
      <main class="flex-1 flex justify-center items-center">
        {!isGitHubSetup() && <SetupInstruction />}
      </main>
    </>
  );
});
