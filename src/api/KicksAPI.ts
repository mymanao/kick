import type { RestClient } from "../rest/RestClient";
import type { KickLeaderboardResponse } from "../../types/api";

/**
 * KicksAPI provides access to Kick KICKs APIs.
 *
 * Required scope:
 * - kicks:read
 *
 * @example
 * const leaderboard = await kick.api.kicks.getLeaderboard({ top: 10 });
 */
export class KicksAPI {
  constructor(private readonly rest: RestClient) {}

  /**
   * Get KICKs leaderboard for the authenticated broadcaster.
   *
   * @param params Optional query params
   */
  async getLeaderboard(params?: {
    top?: number;
  }): Promise<KickLeaderboardResponse> {
    const search = new URLSearchParams();

    if (params?.top) {
      search.set("top", String(params.top));
    }

    const query = search.toString();

    return this.rest.fetch(
      `/public/v1/kicks/leaderboard${query ? `?${query}` : ""}`,
      { method: "GET" },
    );
  }
}
