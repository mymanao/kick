import type { RestClient } from "../rest/RestClient";
import type {
  KickChannelReward,
  ChannelRewardBase,
  GetChannelRewardsResponse,
  GetRedemptionsParams,
  GetRedemptionsResponse,
  RedemptionActionResponse,
} from "../../types/api";

/**
 * ChannelRewardsAPI provides access to Kick Channel Rewards APIs.
 *
 * Requires scopes:
 * - channel:rewards:read
 * - channel:rewards:write
 *
 * @example
 * const rewards = await kick.api.channelRewards.get();
 */
export class ChannelRewardsAPI {
  constructor(private readonly rest: RestClient) {}

  /**
   * Get all channel rewards for the authorized broadcaster.
   */
  async get(): Promise<GetChannelRewardsResponse> {
    return this.rest.fetch("/public/v1/channels/rewards", {
      method: "GET",
    });
  }

  /**
   * Create a new channel reward.
   */
  async create(
    body: ChannelRewardBase,
  ): Promise<{ data: KickChannelReward; message: string }> {
    return this.rest.fetch("/public/v1/channels/rewards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  }

  /**
   * Update an existing reward.
   *
   * Only the creating app can update a reward.
   */
  async update(
    id: string,
    body: Partial<ChannelRewardBase>,
  ): Promise<{ data: KickChannelReward; message: string }> {
    return this.rest.fetch(`/public/v1/channels/rewards/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  }

  /**
   * Delete a channel reward.
   */
  async delete(id: string): Promise<void> {
    await this.rest.fetch(`/public/v1/channels/rewards/${id}`, {
      method: "DELETE",
    });
  }

  /**
   * Retrieve reward redemptions.
   */
  async getRedemptions(
    params: GetRedemptionsParams = {},
  ): Promise<GetRedemptionsResponse> {
    const search = new URLSearchParams();

    if (params.reward_id) search.append("reward_id", params.reward_id);
    if (params.status) search.append("status", params.status);
    if (params.cursor) search.append("cursor", params.cursor);
    params.id?.forEach((v) => search.append("id", v));

    const query = search.toString();

    return this.rest.fetch(
      `/public/v1/channels/rewards/redemptions${query ? `?${query}` : ""}`,
      { method: "GET" },
    );
  }

  /**
   * Accept redemptions (max 25).
   */
  async accept(ids: string[]): Promise<RedemptionActionResponse> {
    return this.rest.fetch("/public/v1/channels/rewards/redemptions/accept", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids }),
    });
  }

  /**
   * Reject redemptions (max 25).
   */
  async reject(ids: string[]): Promise<RedemptionActionResponse> {
    return this.rest.fetch("/public/v1/channels/rewards/redemptions/reject", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids }),
    });
  }
}
