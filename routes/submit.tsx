// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import Head from "@/components/Head.tsx";
import IconCheckCircle from "@preact-icons/tb/TbCircleCheck";
import IconCircleX from "@preact-icons/tb/TbCircleX";
import IconMusic from "@preact-icons/tb/TbMusic";
import { defineRoute, Handlers } from "$fresh/server.ts";
import { createItem } from "@/utils/db.ts";
import { redirect } from "@/utils/http.ts";
import {
  assertSignedIn,
  type SignedInState,
  State,
} from "@/plugins/session.ts";
import { ulid } from "@std/ulid/ulid";
import IconInfo from "@preact-icons/tb/TbInfoCircle";
import { SITE_NAME } from "@/utils/constants.ts";
import { BrandSlogan } from "@/components/branding/index.ts";

export const handler: Handlers<undefined, SignedInState> = {
  async POST(req, ctx) {
    assertSignedIn(ctx);
    const form = await req.formData();
    const title = form.get("title");
    const url = form.get("url");

    if (
      typeof url !== "string" || !URL.canParse(url) ||
      typeof title !== "string" || title === ""
    ) {
      return redirect("/submit?error");
    }

    await createItem({
      id: ulid(),
      userLogin: ctx.state.sessionUser.login,
      title,
      url,
      score: 0,
    });
    return redirect("/");
  },
};

export default defineRoute<State>((_req, ctx) => {
  return (
    <>
      <Head title="Submit" href={ctx.url.href} />
      <main class="flex-1 section-padding-lg">
        <div class="container-max">
          {/* Header */}
          <div class="text-center mb-16">
            <div class="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-logo flex items-center justify-center shadow-glow">
              <IconMusic class="size-10 text-black" />
            </div>
            <h1 class="font-heading font-black text-h1 md:text-h2 gradient-text mb-6">
              Share Your Discovery
            </h1>
            <p class="text-foreground-muted text-body-lg max-w-2xl mx-auto mb-8">
              Help the community discover the next big music trend
            </p>
            <BrandSlogan variant="product" />
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Guidelines */}
            <div class="space-y-6 bg-background-card/40 border border-border rounded-2xl p-8">
              <h2 class="font-heading font-bold text-2xl text-foreground mb-6">
                Submission Guidelines
              </h2>
              <div class="space-y-4">
                <div class="flex items-start gap-3">
                  <IconCircleX class="size-5 text-error shrink-0 mt-0.5" />
                  <div>
                    <p class="text-foreground font-medium">
                      Don't post duplicates
                    </p>
                    <p class="text-foreground-muted text-sm">
                      Check if the content has already been shared
                    </p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <IconCircleX class="size-5 text-error shrink-0 mt-0.5" />
                  <div>
                    <p class="text-foreground font-medium">No test posts</p>
                    <p class="text-foreground-muted text-sm">
                      Only submit real, valuable music discoveries
                    </p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <IconCheckCircle class="size-5 text-success shrink-0 mt-0.5" />
                  <div>
                    <p class="text-foreground font-medium">Include context</p>
                    <p class="text-foreground-muted text-sm">
                      E.g. "Emerging artist from London - Electronic"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form
              class="bg-background-card/40 border border-border rounded-2xl p-8"
              method="post"
            >
              <div>
                <label
                  htmlFor="submit_title"
                  class="block text-sm font-medium text-foreground mb-2"
                >
                  Title
                </label>
                <input
                  id="submit_title"
                  class="w-full bg-background-elevated border border-border rounded-lg px-4 py-3 text-foreground placeholder-foreground-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  type="text"
                  name="title"
                  required
                  placeholder="Emerging artist track name"
                  disabled={!ctx.state.sessionUser}
                />
              </div>

              <div class="mt-6">
                <label
                  htmlFor="submit_url"
                  class="block text-sm font-medium text-foreground mb-2"
                >
                  URL
                </label>
                <input
                  id="submit_url"
                  class="w-full bg-background-elevated border border-border rounded-lg px-4 py-3 text-foreground placeholder-foreground-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  type="url"
                  name="url"
                  required
                  placeholder="https://..."
                  disabled={!ctx.state.sessionUser}
                />
              </div>

              {ctx.url.searchParams.has("error") && (
                <div class="mt-6 flex items-center gap-3 bg-error/10 border-l-4 border-error rounded-lg p-4">
                  <IconInfo class="size-5 shrink-0" />
                  <span>Title and valid URL are required</span>
                </div>
              )}

              <div class="mt-8">
                {!ctx.state.sessionUser
                  ? (
                    <a
                      href="/signin"
                      class="inline-flex items-center justify-center w-full py-4 px-6 bg-gradient-logo text-black font-heading font-bold rounded-xl hover:scale-105 hover:shadow-glow transition-all"
                    >
                      Sign in to submit
                      <span class="ml-2">→</span>
                    </a>
                  )
                  : (
                    <button
                      type="submit"
                      class="inline-flex items-center justify-center w-full py-4 px-6 bg-gradient-logo text-black font-heading font-bold rounded-xl hover:scale-105 hover:shadow-glow transition-all"
                    >
                      Submit Discovery
                    </button>
                  )}
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
});
