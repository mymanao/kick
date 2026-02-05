import type { RestClient } from "../rest/RestClient";
import type {
  KickLivestream,
  KickLivestreamStatsResponse,
  KickLivestreamsResponse,
} from "../../types/api";

/**
 * LivestreamsAPI provides access to Kick Livestream APIs.
 *
 * @example
 * const streams = await kick.api.livestreams.get({ limit: 10 });
 */
export class LivestreamsAPI {
  constructor(private readonly rest: RestClient) {}

  /**
   * Get livestreams with optional filters.
   *
   * Supported filters:
   * - broadcaster_user_id[]
   * - category_id
   * - language
   * - limit
   * - sort ("viewer_count" | "started_at")
   */
  async get(params?: {
    broadcaster_user_id?: number[];
    category_id?: number;
    language?: string;
    limit?: number;
    sort?: "viewer_count" | "started_at";
  }): Promise<KickLivestreamsResponse> {
    const search = new URLSearchParams();

    params?.broadcaster_user_id?.forEach((id) =>
      search.append("broadcaster_user_id", String(id)),
    );

    if (params?.category_id)
      search.set("category_id", String(params.category_id));
    if (params?.language) search.set("language", params.language);
    if (params?.limit) search.set("limit", String(params.limit));
    if (params?.sort) search.set("sort", params.sort);

    const query = search.toString();

    return this.rest.fetch(
      `/public/v1/livestreams${query ? `?${query}` : ""}`,
      { method: "GET" },
    );
  }

  /**
   * Get livestream statistics.
   *
   * @example
   * const stats = await kick.api.livestreams.getStats();
   */
  async getStats(): Promise<KickLivestreamStatsResponse> {
    return this.rest.fetch("/public/v1/livestreams/stats", {
      method: "GET",
    });
  }
}
