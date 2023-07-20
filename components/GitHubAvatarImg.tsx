// Copyright 2023 the Deno authors. All rights reserved. MIT license.
export default function GitHubAvatarImg(
  props: { login: string; size: number; class?: string },
) {
  return (
    <img
      height={props.size}
      width={props.size}
      src={`https://avatars.githubusercontent.com/${props.login}?s=${
        props.size * 2
      }`}
      alt={`GitHub avatar of ${props.login}`}
      class={`rounded-full inline-block aspect-square h-[${props.size}px] w-[${props.size}px] ${
        props.class ?? ""
      }`}
      crossOrigin="anonymous"
      loading="lazy"
    />
  );
}
