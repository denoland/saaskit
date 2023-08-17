import { RouteContext } from "$fresh/server.ts";
import { listCommentsByItem, valuesFromIter } from "@/utils/db.ts";
import { getCursor } from "@/utils/pagination.ts";

export default async function getCommentsByItem(
  _req: Request,
  ctx: RouteContext,
) {
  const iter = listCommentsByItem(ctx.params.id, {
    cursor: getCursor(ctx.url),
    limit: 10,
  });
  const comments = await valuesFromIter(iter);
  return Response.json({ comments, cursor: iter.cursor });
}
