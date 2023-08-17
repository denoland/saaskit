// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { JSX } from "preact";

// See https://tabler-icons-tsx.deno.dev/
import IconBrandGithub from "tabler_icons_tsx/brand-github.tsx";
import IconBrandDiscord from "tabler_icons_tsx/brand-discord.tsx";
import IconBrandFacebook from "tabler_icons_tsx/brand-facebook.tsx";
import IconBrandLinkedin from "tabler_icons_tsx/brand-linkedin.tsx";
import IconBrandReddit from "tabler_icons_tsx/brand-reddit.tsx";
import IconBrandTwitter from "tabler_icons_tsx/brand-twitter.tsx";
import IconRss from "tabler_icons_tsx/rss.tsx";
import IconCheckCircle from "tabler_icons_tsx/circle-check.tsx";
import IconCircleX from "tabler_icons_tsx/circle-x.tsx";
import IconBell from "tabler_icons_tsx/bell.tsx";
import IconMenu from "tabler_icons_tsx/menu-2.tsx";
import IconX from "tabler_icons_tsx/x.tsx";
import IconInfo from "tabler_icons_tsx/info-circle.tsx";

export type IconProps = JSX.SVGAttributes<SVGSVGElement> & {
  size?: number | undefined;
  color?: string | undefined;
  stroke?: number | undefined;
};

export function GitHub(props: IconProps) {
  return <IconBrandGithub {...props} />;
}

export function Discord(props: IconProps) {
  return <IconBrandDiscord {...props} />;
}

export function Facebook(props: IconProps) {
  return <IconBrandFacebook {...props} />;
}

export function LinkedIn(props: IconProps) {
  return <IconBrandLinkedin {...props} />;
}

export function Reddit(props: IconProps) {
  return <IconBrandReddit {...props} />;
}

export function Twitter(props: IconProps) {
  return <IconBrandTwitter {...props} />;
}

export function Bell(props: IconProps) {
  return <IconBell {...props} />;
}

export function CheckCircle(props: IconProps) {
  return <IconCheckCircle {...props} />;
}

export function XCircle(props: IconProps) {
  return <IconCircleX {...props} />;
}

export function Rss(props: IconProps) {
  return <IconRss {...props} />;
}

export function Menu(props: IconProps) {
  return <IconMenu {...props} />;
}

export function X(props: IconProps) {
  return <IconX {...props} />;
}

export function Info(props: IconProps) {
  return <IconInfo {...props} />;
}
