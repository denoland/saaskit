export function RedirectHelper(localPath: string, statusCode: number) {
  return new Response("", {
    status: statusCode,
    headers: { Location: localPath },
  });
}
