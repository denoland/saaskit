import { AppProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

export default function App({ Component }: AppProps) {
  return (
    <div class="h-screen">
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="stylesheet" href="/app.css" />
      </Head>

      <Component />
    </div>
  );
}
