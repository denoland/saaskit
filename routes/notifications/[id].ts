import type { RouteContext } from "$fresh/server.ts";
import { deleteNotification, getNotification } from "@/utils/db.ts";
import { redirect } from "@/utils/redirect.ts";
import type { SignedInState } from "@/utils/middleware.ts";

export default async function NotificationPage(
  _req: Request,
  ctx: RouteContext<unknown, SignedInState>,
) {
  const notification = await getNotification(ctx.params.id);
  if (notification === null) return await ctx.renderNotFound();

  await deleteNotification(notification);
  return redirect(notification.originUrl);
}
