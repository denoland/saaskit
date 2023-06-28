// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers, PageProps } from "$fresh/server.ts";
import Head from "@/components/Head.tsx";
import type { AccountState } from "./_middleware.ts";
import { getNotificationsByUser, Notification } from "@/utils/db.ts";

export interface NotificationState extends AccountState {
  notifications: Notification[];
}

export const handler: Handlers<NotificationState, AccountState> = {
  async GET(_request, ctx) {
    // TODO: Remove it after debug
    console.log(ctx.state.user);
    const notifications = await getNotificationsByUser(ctx.state.user.id);
    // TODO: Remove it after debug
    console.log(notifications);
    return ctx.render({ ...ctx.state, notifications });
  },
};

interface RowProps {
  title: string;
  text: string;
}

function Row(props: RowProps) {
  return (
    <li class="py-4">
      <div class="flex flex-wrap justify-between">
        <span>
          <strong>{props.title}</strong>
        </span>
      </div>
      <p>
        {props.text}
      </p>
    </li>
  );
}

export default function NotificationPage(props: PageProps<NotificationState>) {
  return (
    <>
      <Head title="Notifications" href={props.url.href} />
      <div class="max-w-lg m-auto w-full flex-1 p-4 flex flex-col justify-center">
        <ul>
          {props.data.notifications
            ? props.data.notifications.map((notif) => (
              <Row
                title={notif.userFrom}
                text={notif.origin}
              />
            ))
            : "No notifications for you"}
        </ul>
      </div>
    </>
  );
}
