// Copyright 2023 the Deno authors. All rights reserved. MIT license.
export function RedirectHelper(localPath: string, statusCode: number) {
  return new Response("", {
    status: statusCode,
    headers: { Location: localPath },
  });
}
