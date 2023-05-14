// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers, PageProps } from "$fresh/server.ts";
import Head from "@/components/Head.tsx";
import Layout from "@/components/Layout.tsx";
import { BUTTON_STYLES, INPUT_STYLES } from "@/utils/constants.ts";
import type { State } from "@/routes/_middleware.ts";
import { createItem } from "@/utils/db.ts";
import { redirect } from "@/utils/http.ts";
import { Status } from "std/http/http_status.ts";
export const handler: Handlers<State, State> = {
  GET(req, ctx) {
    if (!ctx.state.session) {
      return redirect(`/login?redirect_url=${encodeURIComponent(req.url)}`);
    }

    return ctx.render(ctx.state);
  },
  async POST(req, ctx) {
    if (!ctx.state.session) {
      await req.body?.cancel();
      return new Response(null, { status: 401 });
    }

    const form = await req.formData();
    const title = form.get("title");
    const url = form.get("url");

    if (typeof title !== "string" || typeof url !== "string") {
      return new Response(null, { status: 400 });
    }

    try {
      // Throws if an invalid URL
      new URL(url);
    } catch {
      return new Response(null, { status: 400 });
    }

    const item = await createItem({
      userId: ctx.state.session!.user.id,
      title,
      url,
    });

    return redirect(`/item/${item!.id}`);
  },
};

function Form() {
  return (
    <form class=" space-y-2" method="post">
      <input
        class={INPUT_STYLES}
        type="text"
        name="title"
        required
        placeholder="Title"
      />
      <input
        class={INPUT_STYLES}
        type="url"
        name="url"
        required
        placeholder="URL"
      />
      <button class={`${BUTTON_STYLES} block w-full`} type="submit">
        Submit
      </button>
    </form>
  );
}

export default function SubmitPage(props: PageProps<State>) {
  return (
    <>
      <Head title="Submit" href={props.url.href} />
      <Layout session={props.data.session}>
        <div class="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full space-y-8">
          <h1 class="text-center text-2xl font-bold">Share your project</h1>
          <Form />
        </div>
      </Layout>
    </>
  );
}
