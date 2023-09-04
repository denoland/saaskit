// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { Plugin } from "$fresh/server.ts";
import { ensureSignedIn, type State } from "@/middleware/session.ts";

/**
 * Adds middleware to the defined protected routes. The middleware throws a
 * {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401|HTTP 401 Unauthorized}-equivalent
 * error if `ctx.state.sessionUser` is `undefined` by
 * {@linkcode ensureSignedIn}.
 *
 * The thrown error is then handled by {@linkcode handleNotSignedInWebpage}, or
 * {@linkcode handleNotSignedInRest} if the request is made to a REST API
 * endpoint.
 *
 * @example
 * ```ts
 * import { FreshOptions } from "$fresh/server.ts";
 * import protectedRoutes from "@/plugins/protected_routes.ts";
 *
 * const options: FreshOptions = {
 *   plugins: [protectedRoutes]
 * }
 * ```
 *
 * @see {@link https://fresh.deno.dev/docs/concepts/plugins|Plugins documentation}
 * for more information on Fresh's plugin functionality.
 */
const middleware = { handler: ensureSignedIn };
export default {
  name: "protected-routes",
  middlewares: [
    {
      path: "/account",
      middleware,
    },
    {
      path: "/dashboard",
      middleware,
    },
    {
      path: "/notifications",
      middleware,
    },
    {
      path: "/submit",
      middleware,
    },
    {
      path: "/api/me",
      middleware,
    },
  ],
} as Plugin<State>;
