// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { BASE_BUTTON_STYLES, BASE_INPUT_STYLES } from "@/utils/constants.ts";
import type { Handlers, PageProps } from "$fresh/server.ts";
import { createSupabaseClient } from "@/utils/supabase.ts";
import Logo from "@/components/Logo.tsx";
import Head from "@/components/Head.tsx";
import { BASE_NOTICE_STYLES } from "@/utils/constants.ts";

export const handler: Handlers = {
  async GET(request, ctx) {
    const headers = new Headers();
    const { error } = await createSupabaseClient(request.headers, headers)
      .auth.getSession();

    if (error) {
      return new Response(null, {
        headers: { location: `/reset-password?error=${error.message}` },
        status: 302,
      });
    }

    return ctx.render();
  },
  async POST(request) {
    const form = await request.formData();
    const password = form.get("password") as string;

    const headers = new Headers();
    const { data, error } = await createSupabaseClient(request.headers, headers)
      .auth.updateUser({ password });

    console.log({ data, error });

    let redirectUrl = "/dashboard/account?has_reset_password=1";
    if (error) {
      redirectUrl = `/reset-password?error=${error.message}`;
    }

    headers.set("location", redirectUrl);
    return new Response(null, { headers, status: 302 });
  },
};

export default function ResetPassword(props: PageProps) {
  const errorMessage = props.url.searchParams.get("error");

  return (
    <>
      <Head title="Login" />
      <div class="max-w-xs flex h-screen m-auto">
        <div class="m-auto w-72">
          <a href="/">
            <Logo class="mb-8" />
          </a>
          <h1 class="text-center my-8 text-2xl font-bold">Reset password</h1>
          {errorMessage && <div class={BASE_NOTICE_STYLES}>{errorMessage}</div>}
          <form method="POST" class="space-y-4">
            <input
              type="password"
              placeholder="Password"
              name="Password"
              required
              class={`${BASE_INPUT_STYLES} w-full`}
            />
            <button type="submit" class={`${BASE_BUTTON_STYLES} w-full`}>
              Update password
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
