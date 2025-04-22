import { FreshContext } from "fresh";

/**
 * Applies HTTP security headers to the response, as recommended by
 * {@link https://securityheaders.com/}.
 *
 * @todo (Jabolol) Implement `Content-Security-Policy` once
 * https://github.com/denoland/fresh/pull/1787 lands.
 *
 * @example Basic usage
 * ```ts
 * import { App } from "fresh";
 * import { securityHeaders } from "@/middlewares/security_headers.ts";
 * import { assertEquals } from "@std/assert/equals";
 *
 * const app = new App()
 *   .use(securityHeaders)
 *   .get("/", () => new Response("Hello World!"));
 *
 * const handler = await app.handler();
 *
 * const res = await handler(new Request("http://localhost:8080"));
 * assertEquals(res.headers.get("Strict-Transport-Security"), "max-age=63072000;");
 * assertEquals(res.headers.get("Referrer-Policy"), "strict-origin-when-cross-origin");
 * assertEquals(res.headers.get("X-Content-Type-Options"), "nosniff");
 * assertEquals(res.headers.get("X-Frame-Options"), "SAMEORIGIN");
 * assertEquals(res.headers.get("X-XSS-Protection"), "1; mode=block");
 * ```
 */
export const securityHeaders = async <T = unknown>(ctx: FreshContext<T>) => {
  const res = await ctx.next();

  res.headers.set("Strict-Transport-Security", "max-age=63072000;");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("X-XSS-Protection", "1; mode=block");

  return res;
};
