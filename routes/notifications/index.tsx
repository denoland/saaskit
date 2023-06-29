// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { Handlers, PageProps } from "$fresh/server.ts";
import Head from "@/components/Head.tsx";
import { SITE_WIDTH_STYLES } from "@/utils/constants.ts";
import type { AccountState } from "./_middleware.ts";
import {
  deleteNotification,
  getNotification,
  getNotificationsByUser,
  Notification,
} from "@/utils/db.ts";
import { redirect } from "@/utils/redirect.ts";

export interface NotificationState extends AccountState {
  notifications: Notification[];
}

export const handler: Handlers<NotificationState, AccountState> = {
  async GET(_request, ctx) {
    const notifications = await getNotificationsByUser(ctx.state.user.id);
    return ctx.render({ ...ctx.state, notifications });
  },
  async POST(req, ctx) {
    const form = await req.formData();
    const itemId = form.get("itemId")!;
    const notifId = form.get("notifId");

    if (typeof itemId !== "string" || typeof notifId !== "string") {
      return new Response(null, { status: 400 });
    }

    const notif = await getNotification(notifId);
    await deleteNotification(notif!);

    return redirect(`/item/${itemId}`);
  },
};

interface RowProps {
  notification: Notification;
}

function Row(props: RowProps) {
  return (
    <li class="py-4">
      <form method="post">
        <input
          type="hidden"
          name="itemId"
          value={props.notification.originId}
        />
        <input type="hidden" name="notifId" value={props.notification.id} />
        <button class="text-left" type="submit">
          <strong>New comment!</strong>
          <span class="text-gray-500 text-sm">
            {" " + props.notification.createdAt.toISOString().split("T")[0]}
          </span>
          <p>
            {props.notification.userFromLogin} commented on your post:{" "}
            {props.notification.originTitle}
          </p>
        </button>
      </form>
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
          {props.data.notifications.length > 0
            ? props.data.notifications.map((notif) => (
              <Row
                notification={notif}
              />
            ))
            : "No notifications yet"}
        </ul>
      </div>
    </>
  );
}
