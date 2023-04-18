// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { BASE_BUTTON_STYLES, BASE_INPUT_STYLES } from "@/utils/constants.ts";
import type { Handlers, PageProps } from "$fresh/server.ts";
import { supabaseAdminClient } from "@/utils/supabase.ts";
import Logo from "@/components/Logo.tsx";
import Head from "@/components/Head.tsx";
import { BASE_NOTICE_STYLES } from "@/utils/constants.ts";

export const handler: Handlers = {
  async POST(request) {
    const form = await request.formData();
    const email = form.get("email") as string;
    const { origin } = new URL(request.url);

    const { error } = await supabaseAdminClient.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: origin + "/login/success?redirect_to=" +
          encodeURIComponent("/reset-password"),
      },
    );

    let redirectUrl = "/forgot-password?success=1";
    if (error) {
      redirectUrl = `/forgot-password?error=${
        encodeURIComponent(error.message)
      }`;
    }
    const headers = new Headers({ location: redirectUrl });
    return new Response(null, { headers, status: 302 });
  },
};

export default function ForgotPassword(props: PageProps) {
  const successMessage = props.url.searchParams.get("success");
  const errorMessage = props.url.searchParams.get("error");

  return (
    <>
      <Head title="Login" />
      <div class="max-w-xs flex h-screen m-auto">
        <div class="m-auto w-72">
          <a href="/">
            <Logo class="mb-8" />
          </a>
          <h1 class="text-center my-8 text-2xl font-bold">Forgot password</h1>
          {successMessage && (
            <div class={BASE_NOTICE_STYLES}>
              Reset password link sent to email
            </div>
          )}
          {errorMessage && <div class={BASE_NOTICE_STYLES}>{errorMessage}</div>}
          <form method="POST" class="space-y-4">
            <input
              placeholder="Email"
              name="email"
              type="email"
              required
              class={`${BASE_INPUT_STYLES} w-full`}
            />
            <button type="submit" class={`${BASE_BUTTON_STYLES} w-full`}>
              Send
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
