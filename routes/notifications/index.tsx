// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers, PageProps } from "$fresh/server.ts";
import Head from "@/components/Head.tsx";
import { SITE_WIDTH_STYLES } from "@/utils/constants.ts";
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
    //getItem(id)

    return ctx.render({ ...ctx.state, notifications });
  },
};

interface RowProps {
  userFrom: string;
  origin: string;
  createdAt: Date;
}

function Row(props: RowProps) {
  return (
    <li class="py-4">
      <strong>New comment!</strong>
      {props.createdAt.toISOString().split("T")[0]}
      {
        /* <img
        //adding the extra parameter to resize the github avatar
        src={props.user.avatarUrl + "&s=36"}
        alt={props.user.login}
        crossOrigin="anonymous"
        class="h-6 w-auto rounded-full aspect-square inline-block mr-1 align-bottom"
      />
      <a class="hover:underline" href={`/user/${props.user.login}`}>
        {props.user.login}
      </a>{" "} */
      }
      <p>
        {props.userFrom} commented on your post {props.origin}
      </p>
    </li>
  );
}

export default function NotificationPage(props: PageProps<NotificationState>) {
  return (
    <>
      <Head title="Notifications" href={props.url.href} />

      <div class={`${SITE_WIDTH_STYLES} flex-1 px-4`}>
        <h1 class="text-3xl font-bold py-4">Notification Center</h1>
        <ul>
          {props.data.notifications
            ? props.data.notifications.map((notif) => (
              <Row
                userFrom={notif.userFrom}
                origin={notif.origin}
                createdAt={notif.createdAt}
              />
            ))
            : "No notifications for you"}
        </ul>
      </div>
    </>
  );
}
