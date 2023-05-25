// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers, PageProps } from "$fresh/server.ts";
import Head from "@/components/Head.tsx";
import Layout from "@/components/Layout.tsx";
import { ComponentChild } from "preact";
import { getUserByLogin, type User } from "@/utils/db.ts";
import type { State } from "@/routes/_middleware.ts";
import { SITE_WIDTH_STYLES } from "@/utils/constants.ts";

export interface UserData extends State {
  user: User;
}

export const handler: Handlers<UserData, State> = {
  async GET(_request, ctx) {
    const { username } = ctx.params;

    const user = await getUserByLogin(username);
    if (user === null) {
      return ctx.renderNotFound();
    }

    return ctx.render({ ...ctx.state, user });
  },
};

interface RowProps {
  title: string;
  children?: ComponentChild;
  text: string;
  img?: string;
}

function Row(props: RowProps) {
  return (
    <div class="flex flex-wrap">
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
          {props.children && <span>{props.children}</span>}
        </div>
        <p>
          {props.text}
        </p>
      </div>
    </div>
  );
}

export default function UserPage(props: PageProps<UserData>) {
  return (
    <>
      <Head title={props.data.user.login} href={props.url.href} />
      <Layout session={props.data.sessionId}>
        <div class={`${SITE_WIDTH_STYLES} flex-1 px-4`}>
          <Row
            title="Username"
            text={props.data.user.login}
            img={props.data.user.avatarUrl}
          />
        </div>
      </Layout>
    </>
  );
}
