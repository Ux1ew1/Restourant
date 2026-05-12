export const PUBLIC_API_REVALIDATE_SECONDS = 60;
export const PUBLIC_API_STALE_SECONDS = 300;

export const PUBLIC_API_CACHE_CONTROL = `public, s-maxage=${PUBLIC_API_REVALIDATE_SECONDS}, stale-while-revalidate=${PUBLIC_API_STALE_SECONDS}`;

export function jsonWithPublicCache<T>(body: T, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", PUBLIC_API_CACHE_CONTROL);

  return Response.json(body, {
    ...init,
    headers,
  });
}
