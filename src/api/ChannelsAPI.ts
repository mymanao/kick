import type { RestClient } from "../rest/RestClient";
import type { KickChannel } from "../../types/api";

/**
 * ChannelsAPI provides access to Kick Channel APIs.
 *
 * @example
 * const channels = await kick.api.channels.get();
 * const channels = await kick.api.channels.get({ slug: ["manaobot"] });
 */
export class ChannelsAPI {
  constructor(private readonly rest: RestClient) {}

  /**
   * Retrieve channel information.
   *
   * - Provided no params, returns current authorized channel
   * - Provide broadcaster_user_id[] OR slug[] only, not both
   */
  async get(params?: {
    broadcaster_user_id?: number[];
    slug?: string[];
  }): Promise<{ data: KickChannel[] }> {
    const search = new URLSearchParams();

    if (params?.broadcaster_user_id && params?.slug) {
      throw new Error(
        "ChannelsClient.get(): cannot mix broadcaster_user_id and slug",
      );
    }

    params?.broadcaster_user_id?.forEach((id) =>
      search.append("broadcaster_user_id", String(id)),
    );

    params?.slug?.forEach((s) => search.append("slug", s));

    const query = search.toString();

    return this.rest.fetch(`/public/v1/channels${query ? `?${query}` : ""}`, {
      method: "GET",
    });
  }

  /**
   * Update livestream metadata for the authorized channel.
   *
   * Requires scope: channel:write
   */
  async update(body: {
    category_id?: number;
    custom_tags?: string[];
    stream_title?: string;
  }): Promise<void> {
    await this.rest.fetch(`/public/v1/channels`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  }
}
