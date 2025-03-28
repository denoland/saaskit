// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import IconBrandFacebook from "@preact-icons/tb/TbBrandFacebook";
import IconBrandLinkedin from "@preact-icons/tb/TbBrandLinkedin";
import IconBrandReddit from "@preact-icons/tb/TbBrandReddit";
import IconBrandTwitter from "@preact-icons/tb/TbBrandTwitter";

/**
 * Dynamically generates links for sharing the current content on the major
 * social media platforms.
 *
 * @see {@link https://schier.co/blog/pure-html-share-buttons}
 */
export default function Share(props: { url: URL; title: string }) {
  return (
    <div class="flex flex-row gap-4 my-4">
      <span class="align-middle">Share</span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${
          encodeURIComponent(props.url.href)
        }`}
        target="_blank"
        aria-label={`Share ${props.title} on Facebook`}
      >
        <IconBrandFacebook />
      </a>
      <a
        href={`https://www.linkedin.com/shareArticle?url=${
          encodeURIComponent(props.url.href)
        }&title=${encodeURIComponent(props.title)}`}
        target="_blank"
        aria-label={`Share ${props.title} on LinkedIn`}
      >
        <IconBrandLinkedin />
      </a>
      <a
        href={`https://reddit.com/submit?url=${
          encodeURIComponent(props.url.href)
        }&title=${encodeURIComponent(props.title)}`}
        target="_blank"
        aria-label={`Share ${props.title} on Reddit`}
      >
        <IconBrandReddit />
      </a>
      <a
        href={`https://twitter.com/share?url=${
          encodeURIComponent(props.url.href)
        }&text=${encodeURIComponent(props.title)}`}
        target="_blank"
        aria-label={`Share ${props.title} on Twitter`}
      >
        <IconBrandTwitter />
      </a>
    </div>
  );
}
