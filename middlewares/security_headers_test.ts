import { App } from "fresh";
import { securityHeaders } from "@/middlewares/security_headers.ts";
import { assertEquals } from "@std/assert/equals";

const handler = await new App()
  .get("/", securityHeaders, () => new Response("Hello World!"))
  .handler();

Deno.test("securityHeaders()", async () => {
  const res = await handler(new Request("http://localhost:8080"));
  assertEquals(
    res.headers.get("Strict-Transport-Security"),
    "max-age=63072000;",
  );
  assertEquals(
    res.headers.get("Referrer-Policy"),
    "strict-origin-when-cross-origin",
  );
  assertEquals(res.headers.get("X-Content-Type-Options"), "nosniff");
  assertEquals(res.headers.get("X-Frame-Options"), "SAMEORIGIN");
  assertEquals(res.headers.get("X-XSS-Protection"), "1; mode=block");
});
