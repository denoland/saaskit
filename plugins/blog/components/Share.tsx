// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import IconBrandFacebook from "tabler_icons_tsx/brand-facebook.tsx";
import IconBrandLinkedin from "tabler_icons_tsx/brand-linkedin.tsx";
import IconBrandReddit from "tabler_icons_tsx/brand-reddit.tsx";
import IconBrandTwitter from "tabler_icons_tsx/brand-twitter.tsx";

interface ShareProps {
  url: URL;
  title: string;
}

/**
 * Dynamically generates links for sharing the current content on the major
 * social media platforms.
 *
 * @see {@link https://schier.co/blog/pure-html-share-buttons}
 */
export default function Share(props: ShareProps) {
  return (
    <div class="flex flex-row gap-4 my-4">
      <span class="align-middle">Share</span>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${
          encodeURIComponent(props.url.href)
        }`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Share ${props.title} on Facebook`}
      >
        <IconBrandFacebook />
      </a>
      <a
        href={`https://www.linkedin.com/shareArticle?url=${
          encodeURIComponent(props.url.href)
        }&title=${encodeURIComponent(props.title)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Share ${props.title} on LinkedIn`}
      >
        <IconBrandLinkedin />
      </a>
      <a
        href={`https://reddit.com/submit?url=${
          encodeURIComponent(props.url.href)
        }&title=${encodeURIComponent(props.title)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Share ${props.title} on Reddit`}
      >
        <IconBrandReddit />
      </a>
      <a
        href={`https://twitter.com/share?url=${
          encodeURIComponent(props.url.href)
        }&text=${encodeURIComponent(props.title)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Share ${props.title} on Twitter`}
      >
        <IconBrandTwitter />
      </a>
    </div>
  );
}
