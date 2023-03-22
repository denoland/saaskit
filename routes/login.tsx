import type { PageProps } from "$fresh/server.ts";
import Head from "@/components/Head.tsx";
import AuthForm from "@/components/AuthForm.tsx";
import Notice from "@/components/Notice.tsx";

export default function LoginPage(props: PageProps) {
  const errorMessage = props.url.searchParams.get("error");

  return (
    <>
      <Head title="Login" />
      <div class="max-w-xs flex h-screen m-auto">
        <div class="m-auto space-y-8 w-72">
          <a href="/">
            <img
              src="/logo.png"
              alt="Logo"
              class="h-24 w-auto mx-auto"
            />
          </a>
          {errorMessage === "Invalid login credentials" && (
            <Notice message={errorMessage} color="yellow" />
          )}
          <AuthForm type="Login" />
          <div class="text-center text-gray-500 hover:text-black">
            <a href="/signup">Don't have an account? Sign up</a>
          </div>
          <form action="/api/oauth" method="POST">
            <input type="hidden" value="google" name="provider" />
            <button type="submit">Google</button>
          </form>
        </div>
      </div>
    </>
  );
}
