// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers, PageProps } from "$fresh/server.ts";
import Head from "@/components/Head.tsx";
import Layout from "@/components/Layout.tsx";
import { BUTTON_STYLES, NOTICE_STYLES } from "@/utils/constants.ts";
import { ComponentChild } from "preact";
import { getUserByLogin, type User } from "@/utils/db.ts";
import type { State } from "@/routes/_middleware.ts";

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

    return ctx.render({
      ...ctx.state,
      user: user!,
    });
  },
};

interface RowProps {
  title: string;
  children?: ComponentChild;
  text: string;
}

function Row(props: RowProps) {
  return (
    <li class="py-4">
      <div class="flex flex-wrap justify-between">
        <div>
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
        {props.img && (
          <img
            height="48"
            width="48"
            src={props.img}
            alt="user avatar"
            class="rounded-full"
          />
        )}
      </div>
    </li>
  );
}

export default function UserPage(props: PageProps<UserData>) {
  return (
    <>
      <Head title="User" href={props.url.href} />
      <Layout session={props.data.sessionId}>
        <div class="max-w-lg m-auto w-full flex-1 p-4 flex flex-col justify-center">
          <h1 class="text-3xl mb-4">
            <strong>User</strong>
          </h1>
          <ul>
            <Row
              title="id"
              text={props.data.user.id}
            />
            <Row
              title="Username"
              text={props.data.user.login}
              img={props.data.user.avatarUrl}
            />
          </ul>
        </div>
      </Layout>
    </>
  );
}
