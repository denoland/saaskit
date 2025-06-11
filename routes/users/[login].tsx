// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import { getUser } from "@/utils/db.ts";
import IconBrandGithub from "@preact-icons/tb/TbBrandGithub";
import Head from "@/components/Head.tsx";
import GitHubAvatarImg from "@/components/GitHubAvatarImg.tsx";
import ItemsList from "@/islands/ItemsList.tsx";
import { PremiumBadge } from "@/components/PremiumBadge.tsx";
import { define } from "@/utils/define.ts";
import { HttpError } from "fresh";

interface UserProfileProps {
  login: string;
  isSubscribed: boolean;
}

function UserProfile(props: UserProfileProps) {
  return (
    <div class="flex flex-col items-center w-[16rem]">
      <GitHubAvatarImg login={props.login} size={200} />
      <div class="flex gap-x-2 px-4 mt-4 items-center">
        <div class="font-semibold text-xl">
          {props.login}
        </div>
        {props.isSubscribed && <PremiumBadge class="size-6 inline" />}
        <a
          href={`https://github.com/${props.login}`}
          aria-label={`${props.login}'s GitHub profile`}
          class="link-styles"
          target="_blank"
          rel="noopener noreferrer"
        >
          <IconBrandGithub class="w-6" />
        </a>
      </div>
    </div>
  );
}

export default define.page(
  async (ctx) => {
    const { login } = ctx.params;
    const user = await getUser(login);
    if (user === null) throw new HttpError(404, "User not found");

    const isSignedIn = ctx.state.sessionUser !== undefined;
    const endpoint = `/api/users/${login}/items`;

    return (
      <>
        <Head title={user.login} href={ctx.url.href}>
          <link
            as="fetch"
            crossOrigin="anonymous"
            href={endpoint}
            rel="preload"
          />
          {isSignedIn && (
            <link
              as="fetch"
              crossOrigin="anonymous"
              href="/api/me/votes"
              rel="preload"
            />
          )}
        </Head>
        <main class="flex-1 p-4 flex flex-col md:flex-row gap-8">
          <div class="flex justify-center p-4">
            <UserProfile {...user} />
          </div>
          <ItemsList
            endpoint={endpoint}
            isSignedIn={isSignedIn}
          />
        </main>
      </>
    );
  },
);
