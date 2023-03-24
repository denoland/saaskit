import type { PageProps } from "$fresh/server.ts";
import Head from "@/components/Head.tsx";
import AuthForm from "@/components/AuthForm.tsx";
import Notice from "@/components/Notice.tsx";
import Button from "@/components/Button.tsx";
import type { Provider } from "@supabase/supabase-js";

function capitalize(value: string) {
  return value[0].toUpperCase() + value.slice(1);
}

interface OAuthLoginButtonProps {
  provider: Provider;
}

function OAuthLoginButton(props: OAuthLoginButtonProps) {
  return (
    <form action="/api/oauth" method="POST">
      <input type="hidden" value={props.provider} name="provider" />
      <Button
        type="submit"
        class="w-full bg-white! text-black border-black border-2"
      >
        Log in with {capitalize(props.provider)}
      </Button>
    </form>
  );
}

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
          <div class="space-y-4">
            <OAuthLoginButton provider="github" />
          </div>
          <AuthForm type="Login" />
          <div class="text-center text-gray-500 hover:text-black">
            <a href="/signup">Don't have an account? Sign up</a>
          </div>
        </div>
      </div>
    </>
  );
}
