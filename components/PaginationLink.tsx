// Copyright 2023 the Deno authors. All rights reserved. MIT license.
export default function Pagination(
  props: {
    url: URL;
    cursor?: string;
    /** @todo https://github.com/denoland/deno/issues/20173 */
    done?: boolean;
  },
) {
  const url = new URL(props.url);
  let text: string;
  if (props.cursor && !props.done) {
    url.searchParams.set("cursor", props.cursor);
    text = "Next ›";
  } else {
    url.searchParams.delete("cursor");
    text = "Back to start ↻";
  }
  return props.url.href === url.href ? null : (
    <a
      href={url.href}
      class="px-4 py-2 transition duration-300 rounded-lg hover:(bg-gray-100 dark:bg-gray-800)"
    >
      {text}
    </a>
  );
}
