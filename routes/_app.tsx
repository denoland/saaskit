// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { AppProps } from "$fresh/server.ts";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";

export default function App({ Component, data }: AppProps) {
  return (
    <div class="flex flex-col min-h-screen dark:bg-gray-900 dark:text-white">
      <div class="mx-auto max-w-7xl w-full">
        <Header sessionId={data?.sessionId} />
        <Component />
        <Footer />
      </div>
    </div>
  );
}
