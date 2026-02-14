import { CategoriesAPI } from "../src/api/CategoriesAPI.ts";
import { UsersAPI } from "../src/api/UsersAPI.ts";
import { ChannelsAPI } from "../src/api/ChannelsAPI.ts";
import { ChannelRewardsAPI } from "../src/api/ChannelRewardsAPI.ts";
import { LivestreamsAPI } from "../src/api/LivestreamsAPI.ts";
import { ModerationAPI } from "../src/api/ModerationAPI.ts";
import { KicksAPI } from "../src/api/KicksAPI.ts";

/**
 * @type GetCategoriesParams
 * @property {number?} [cursor] - The cursor for pagination. (Minimum: 4, Maximum: 28)
 * @property {number?} [limit] - The maximum number of categories to return. (Minimum: 1, Maximum: 1000)
 * @property {string[]?} [name] - Category names.
 * @property {string[]?} [tags] - Tags associated with the categories.
 * @property {number[]?} [id] - Category IDs.
 */
export type GetCategoriesParams = {
  cursor?: number;
  limit?: number;
  name?: string[];
  tags?: string[];
  id?: number[];
};

/**
 * @interface KickChannel
 * @property {string} slug - The unique identifier for the channel.
 * @property {string} stream_title - The title of the current stream.
 * @property {object} [category] - The category of the stream, if available.
 * @property {number} category.id - The unique identifier for the category.
 * @property {string} category.name - The name of the category.
 */
export interface KickChannel {
  slug: string;
  stream_title: string;
  category?: {
    id: number;
    name: string;
  };
}

export interface ChannelRewardBase {
  background_color?: string;
  cost: number;
  description: string;
  is_enabled?: boolean;
  is_user_input_required?: boolean;
  should_redemptions_skip_request_queue?: boolean;
  title: string;
}

export interface KickChannelReward extends ChannelRewardBase {
  id: string;
  is_paused: boolean;
}

export interface GetChannelRewardsResponse {
  data: KickChannelReward[];
  message: string;
}

export interface GetRedemptionsParams {
  reward_id?: string;
  status?: "pending" | "fulfilled" | "canceled";
  id?: string[];
  cursor?: string;
}

export interface KickRedemption {
  id: string;
  redeemed_at: string;
  redeemer: {
    user_id: number;
  };
  status: string;
  user_input?: string;
}

export interface RedemptionData {
  redemptions: KickRedemption[];
  reward: {
    can_manage: boolean;
    cost: number;
    description: string;
    id: string;
    is_deleted: boolean;
    title: string;
  };
}

export interface GetRedemptionsResponse {
  data: RedemptionData[];
  message: string;
  pagination: {
    next_cursor: string | null;
  };
}

export interface RedemptionActionResponse {
  data: { id: string; reason: string }[];
  message: string;
}

export type KickOkResponse = {
  data: Record<string, never> | {};
  message: string;
};

export type ModerationBanRequest = {
  broadcaster_user_id: number;
  user_id: number;
  reason?: string;
  duration?: number;
};

export type ModerationUnbanRequest = {
  broadcaster_user_id: number;
  user_id: number;
};

export type KickLivestream = {
  broadcaster_user_id: number;
  channel_id: number;
  slug: string;
  stream_title: string;
  viewer_count: number;
  language: string;
  has_mature_content: boolean;
  started_at: string;
  thumbnail: string;
  profile_picture: string;
  custom_tags: string[];
  category: {
    id: number;
    name: string;
    thumbnail: string;
  };
};

export type KickLivestreamsResponse = {
  data: KickLivestream[];
  message: string;
};

export type KickLivestreamStatsResponse = {
  data: {
    total_count: number;
  };
  message: string;
};

export type KickLeaderboardEntry = {
  gifted_amount: number;
  rank: number;
  user_id: number;
  username: string;
};

export type KickLeaderboardResponse = {
  data: {
    lifetime: KickLeaderboardEntry[];
    month: KickLeaderboardEntry[];
    week: KickLeaderboardEntry[];
  };
  message: string;
};

export interface KickAPIClient {
  categories: CategoriesAPI;
  users: UsersAPI;
  channels: ChannelsAPI;
  rewards: ChannelRewardsAPI;
  livestreams: LivestreamsAPI;
  moderation: ModerationAPI;
  kicks: KicksAPI;
}
