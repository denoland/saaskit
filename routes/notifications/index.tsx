// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import type { RouteContext } from "$fresh/server.ts";
import type { SignedInState } from "@/utils/middleware.ts";
import { getNotificationsByUser, Notification } from "@/utils/db.ts";
import { timeAgo } from "@/utils/display.ts";
import Head from "@/components/Head.tsx";

function compareCreatedAt(a: Notification, b: Notification) {
  return Number(b.createdAt) - Number(a.createdAt);
}

function Row(props: { notification: Notification }) {
  return (
    <li class="py-4 space-y-1">
      <a href={"/notifications/" + props.notification.id}>
        <span class="mr-4">
          <strong>New {props.notification.type}!</strong>
        </span>
        <span class="text-gray-500">
          {" " + timeAgo(props.notification.createdAt)} ago
        </span>
        <br />
        <span>{props.notification.text}</span>
      </a>
    </li>
  );
}

export default async function NotificationsPage(
  _req: Request,
  ctx: RouteContext<unknown, SignedInState>,
) {
  const notifications = await getNotificationsByUser(ctx.state.user.id);

  return (
    <>
      <Head title="Notifications" href={ctx.url.href} />
      <main class="flex-1 p-4">
        <h1 class="text-3xl font-bold py-4">Notifications</h1>
        <ul class="divide-y">
          {notifications.length > 0
            ? notifications
              .toSorted(compareCreatedAt)
              .map((notification) => (
                <Row
                  notification={notification}
                />
              ))
            : "No notifications yet"}
        </ul>
      </main>
    </>
  );
}