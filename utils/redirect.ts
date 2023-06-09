// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { redirect } from "@/utils/http.ts";
import { deleteCookie, getCookies, setCookie } from "std/http/cookie.ts";

const REDIRECT_URL_COOKIE_NAME = "redirectUrl";

export function redirectToLogin(url: string) {
  return redirect(`/signin?from=${url}`);
}

export function setRedirectUrlCookie(req: Request, res: Response) {
  const from = new URL(req.url).searchParams.get("from");
  setCookie(res.headers, {
    name: REDIRECT_URL_COOKIE_NAME,
    value: from ? from : req.headers.get("referer")!,
    path: "/",
  });
}

function setHeaderLocation(headers: Headers, url: string) {
  headers.set("location", url);
}

function deleteRedirectUrlCookie(headers: Headers) {
  deleteCookie(headers, REDIRECT_URL_COOKIE_NAME);
}

export function setCallbackHeaders(req: Request, res: Response) {
  const { redirectUrl } = getCookies(req.headers);
  setHeaderLocation(res.headers, redirectUrl);
  deleteRedirectUrlCookie(res.headers);
}
