// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { RouteContext } from "$fresh/server.ts";
import { ComponentChild } from "preact";
import type { State } from "@/routes/_middleware.ts";
import ItemSummary from "@/components/ItemSummary.tsx";
import { calcLastPage, calcPageNum, PAGE_LENGTH } from "@/utils/pagination.ts";
import PageSelector from "@/components/PageSelector.tsx";
import {
  compareScore,
  getAreVotedBySessionId,
  getItemsByUser,
  getUserByLogin,
} from "@/utils/db.ts";
import { pluralize } from "@/utils/display.ts";
import { GitHub } from "@/components/Icons.tsx";
import { LINK_STYLES } from "@/utils/constants.ts";
import Head from "@/components/Head.tsx";

function Row(
  props: {
    title: string;
    text: string;
    img?: string;
    children?: ComponentChild;
  },
) {
  return (
    <div class="flex flex-wrap py-8">
      {props.img && (
        <img
          height="48"
          width="48"
          src={props.img}
          alt="user avatar"
          class="rounded-full"
        />
      )}
      <div class="px-4">
        <div class="flex flex-wrap justify-between">
          <span>
            <strong>{props.title}</strong>
          </span>
          {props.children && <span class="ml-2">{props.children}</span>}
        </div>
        <p>
          {props.text}
        </p>
      </div>
    </div>
  );
}

export default async function UserPage(
  req: Request,
  ctx: RouteContext<unknown, State>,
) {
  const { username } = ctx.params;
  const url = new URL(req.url);
  const pageNum = calcPageNum(url);

  const user = await getUserByLogin(username);
  if (user === null) {
    return ctx.renderNotFound();
  }

  const allItems = await getItemsByUser(user.id);
  const itemsCount = allItems.length;

  const items = allItems.sort(compareScore).slice(
    (pageNum - 1) * PAGE_LENGTH,
    pageNum * PAGE_LENGTH,
  );

  const areVoted = await getAreVotedBySessionId(
    items,
    ctx.state.sessionId,
  );

  const lastPage = calcLastPage(allItems.length, PAGE_LENGTH);

  return (
    <>
      <Head title={user.login} href={ctx.url.href} />
      <main class="flex-1 p-4">
        <Row
          title={user.login}
          text={pluralize(itemsCount, "submission")}
          img={user.avatarUrl}
        >
          <a
            href={`https://github.com/${user.login}`}
            alt={`to ${user.login}'s GitHub profile`}
            aria-label={`${user.login}'s GitHub profile`}
            class={LINK_STYLES}
            target="_blank"
          >
            <GitHub class="text-sm w-6" />
          </a>
        </Row>
        {items.map((item, index) => (
          <ItemSummary
            item={item}
            isVoted={areVoted[index]}
            user={user}
          />
        ))}
        {lastPage > 1 && (
          <PageSelector
            currentPage={calcPageNum(ctx.url)}
            lastPage={lastPage}
          />
        )}
      </main>
    </>
  );
}
