import { libraryRequest } from "./libraryClient";

/**
 * The two user-owned collections served by `server/`. They are the same shape
 * on purpose (the backend builds both routers from one factory), so the
 * frontend addresses them by name rather than duplicating six functions.
 */
export type CollectionName = "favorites" | "watched";

interface CollectionResponse {
  animeIds: number[];
}

/** `GET /api/{collection}` → the user's saved AniList media ids, newest first. */
export async function getCollection(
  collection: CollectionName,
): Promise<number[]> {
  const body = await libraryRequest<CollectionResponse>(
    "get",
    `/api/${collection}`,
  );
  return body.animeIds ?? [];
}

/**
 * `POST /api/{collection}` — idempotent. Adding a title that is already saved
 * returns the existing row rather than a 409, so an optimistic UI that
 * double-fires cannot wedge itself.
 */
export async function addToCollection(
  collection: CollectionName,
  animeId: number,
): Promise<void> {
  await libraryRequest("post", `/api/${collection}`, { animeId });
}

/**
 * `DELETE /api/{collection}/:animeId` — also idempotent: removing something
 * that is not saved is a 204, not a 404.
 */
export async function removeFromCollection(
  collection: CollectionName,
  animeId: number,
): Promise<void> {
  await libraryRequest("delete", `/api/${collection}/${animeId}`);
}
