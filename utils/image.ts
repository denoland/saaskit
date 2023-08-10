export function resizeImage(
  originalUrl: string,
  { width, quality, fit, height }: ImageOptionsType,
): string {
  if (originalUrl.startsWith("data:image") || originalUrl.startsWith("/")) {
    return originalUrl;
  }

  const cloudflarePrefix = `/cdn-cgi/image/width=${width},${
    height ? `height=${height},` : ""
  }format=auto,quality=${quality ?? 70}${fit ? `,fit=${fit}` : ""}`;
  const cleanedUrl = originalUrl.replace(/\/cdn-cgi\/image\/.*?\//, "/");
  const urlObject = new URL(cleanedUrl);

  urlObject.pathname = cloudflarePrefix + urlObject.pathname;

  return urlObject.href;
}

export function generateImageSrcSet(
  originalUrl: string,
  options: ImageOptionsType[],
): string[] {
  return options.map((option) => resizeImage(originalUrl, option));
}
