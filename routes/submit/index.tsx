// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers, PageProps } from "$fresh/server.ts";
import { HEADING_STYLES, INPUT_STYLES } from "@/utils/constants.ts";
import {
  collectValues,
  createItem,
  getUserBySession,
  type Item,
  listItemsByUser,
  newItemProps,
} from "@/utils/db.ts";
import { isPublicUrl, isValidUrl, redirect } from "@/utils/http.ts";
import Head from "@/components/Head.tsx";
import IconCheckCircle from "tabler_icons_tsx/circle-check.tsx";
import IconCircleX from "tabler_icons_tsx/circle-x.tsx";
import { SignedInState } from "@/utils/middleware.ts";

export const handler: Handlers<SignedInState, SignedInState> = {
  async POST(req, ctx) {
    const form = await req.formData();
    const title = form.get("title");
    const url = form.get("url");

    if (typeof title !== "string" || typeof url !== "string") {
      return new Response("Item URL or title are either invalid or missing.", {
        status: 400,
      });
    }

    try {
      if (!isValidUrl(url) || !isPublicUrl(url)) {
        return new Response("Item URL must be valid and publicly available.", {
          status: 400,
        });
      }
    } catch {
      return new Response("An error occurred while validating the URL.", {
        status: 500,
      });
    }

    const user = await getUserBySession(ctx.state.sessionId);

    if (user === null) {
      return new Response("You must be logged in to submit a new item.", {
        status: 401,
      });
    }

    const items = await collectValues(listItemsByUser(user.login));

    if (items.some((item) => item.url === url || item.title === title)) {
      return new Response(
        "You already submitted an item which contains the same title or URL.",
        { status: 409 },
      );
    }

    const item: Item = {
      userLogin: user.login,
      title,
      url,
      ...newItemProps(),
    };
    await createItem(item);

    return redirect(`/items/${item!.id}`);
  },
};

export default function SubmitPage(props: PageProps) {
  return (
    <>
      <Head title="Submit" href={props.url.href} />
      <main class="flex-1 flex flex-col justify-center mx-auto w-full space-y-16 p-4 max-w-6xl">
        <div class="text-center">
          <h1 class={HEADING_STYLES}>
            Share your project
          </h1>
          <p class="text-gray-500">
            Let the community know about your Deno-related blog post, video or
            module!
          </p>
        </div>
        <div class="flex flex-col md:flex-row gap-8 md:gap-16 md:items-center">
          <div class="flex-1 space-y-6">
            <p>
              <IconCircleX class="inline-block mr-2" />
              <strong>Don't</strong> post duplicate content
            </p>
            <p>
              <IconCircleX class="inline-block mr-2" />
              <strong>Don't</strong> share dummy or test posts
            </p>
            <div>
              <IconCheckCircle class="inline-block mr-2" />
              <strong>Do</strong> include a description with your title.

              <div class="text-sm text-gray-500">
                E.g. “Deno Hunt: the best place to share your Deno project”
              </div>
            </div>
            <p>
            </p>
          </div>
          <form
            class="flex-1 flex flex-col justify-center"
            method="post"
          >
            <div class="mt-4">
              <label
                htmlFor="submit_title"
                class="block text-sm font-medium leading-6 text-gray-900"
              >
                Title
              </label>
              <input
                id="submit_title"
                class={`${INPUT_STYLES} w-full mt-2`}
                type="text"
                name="title"
                required
                placeholder="Deno Hunt: the best place to share your Deno project"
              />
            </div>

            <div class="mt-4">
              <label
                htmlFor="submit_title"
                class="block text-sm font-medium leading-6 text-gray-900"
              >
                URL
              </label>
              <input
                class={`${INPUT_STYLES} w-full mt-2`}
                type="url"
                name="url"
                required
                placeholder="https://my-awesome-project.com"
              />
            </div>
            <div class="w-full rounded-lg bg-gradient-to-tr from-secondary to-primary p-px mt-8">
              <button class="w-full text-white text-center rounded-[7px] transition duration-300 px-4 py-2 block hover:(bg-white text-black dark:(bg-gray-900 !text-white))">
                Submit
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
