import { useRef, useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import type { CreateCompletionResponse } from "openai";

interface SearchDialogProperties {
  withPadding?: boolean;
}

const SearchDialog = ({ withPadding = false }: SearchDialogProperties) => {
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const onSubmit = (e: Event) => {
    e.preventDefault();
    setAnswer("");
    setIsLoading(true);

    const query = new URLSearchParams({ query: inputRef.current!.value });
    const eventSource = new EventSource(`/api/vector-search?${query}`);

    eventSource.addEventListener("error", (err) => {
      setIsLoading(false);
      console.error(err);
    });
    eventSource.addEventListener("message", (e: MessageEvent) => {
      setIsLoading(false);

      if (e.data === "[DONE]") {
        eventSource.close();
        return;
      }

      const completionResponse: CreateCompletionResponse = JSON.parse(e.data);
      const text = completionResponse.choices[0].text;

      setAnswer((prevAnswer) => prevAnswer + text);
    });

    setIsLoading(true);
  };

  return (
    <div
      class={`mx-auto max-w-7xl ${
        withPadding && "py-12 lg:py-16"
      } px-4 sm:px-6 lg:px-8`}
    >
      <form onSubmit={onSubmit} class="flex gap-2 w-full mb-4">
        <input
          name="search"
          ref={inputRef}
          placeholder={`Search: e.g. try "What are the colors used for products in the marketplace?"`}
          disabled={!IS_BROWSER}
          class={`flex-1 px-4 py-2 bg-white rounded-md border-1 border-gray-300 hover:border-green-400 transition duration-300 outline-none disabled:(opacity-50 cursor-not-allowed)`}
        />
        <button
          disabled={!IS_BROWSER}
          class="px-4 py-2 rounded-md bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Search
        </button>
      </form>
      <p>{isLoading ? "Loading..." : answer}</p>
    </div>
  );
};

export default SearchDialog;
