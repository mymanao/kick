import type { RestClient } from "../rest/RestClient";
import type {
  ModerationBanRequest,
  ModerationUnbanRequest,
  KickOkResponse,
} from "../../types/api";

/**
 * ModerationAPI provides access to Kick Moderation APIs.
 *
 * Required scope:
 * - moderation:ban
 *
 * @example
 * await kick.api.moderation.ban({ broadcaster_user_id: 123, user_id: 333, reason: "Not vibing" });
 * await kick.api.moderation.timeout({ broadcaster_user_id: 123, user_id: 333, duration: 10 });
 * await kick.api.moderation.unban({ broadcaster_user_id: 123, user_id: 333 });
 */
export class ModerationAPI {
  constructor(private readonly rest: RestClient) {}

  /**
   * Ban a user (permanent ban).
   * Omit `duration (minutes)` to ban permanently.
   */
  async ban(
    body: Omit<ModerationBanRequest, "duration">,
  ): Promise<KickOkResponse> {
    return this.rest.fetch("/public/v1/moderation/bans", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  /**
   * Timeout a user for `duration` minutes.
   */
  async timeout(body: ModerationBanRequest): Promise<KickOkResponse> {
    if (typeof body.duration !== "number") {
      throw new Error(
        "ModerationAPI.timeout(): duration is required (minutes)",
      );
    }

    return this.rest.fetch("/public/v1/moderation/bans", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  /**
   * Unban a user OR remove an active timeout.
   */
  async unban(body: ModerationUnbanRequest): Promise<KickOkResponse> {
    return this.rest.fetch("/public/v1/moderation/bans", {
      method: "DELETE",
      body: JSON.stringify(body),
    });
  }
}
