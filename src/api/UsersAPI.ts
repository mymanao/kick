import type { RestClient } from "../rest/RestClient";

/**
 * Parameters for retrieving users.
 */
export interface GetUsersParams {
  /**
   * User IDs to retrieve.
   * If omitted, returns the currently authorized user.
   */
  id?: number[];
}

/**
 * Kick User object returned by the API.
 */
export interface KickUser {
  email?: string;
  name: string;
  profile_picture: string;
  user_id: number;
}

/**
 * Response returned from GET /public/v1/users
 */
export interface GetUsersResponse {
  data: KickUser[];
  message: string;
}

/**
 * UsersAPI provides access to Kick User APIs.
 *
 * @example
 * const users = await kick.api.users.get();
 * console.log(users.data);
 */
export class UsersAPI {
  constructor(private readonly rest: RestClient) {}

  /**
   * Retrieve user information.
   *
   * If no IDs are provided, the currently authorized user is returned.
   *
   * Requires scope:
   * - user:read
   *
   * @param params Query parameters
   * @returns Kick user data
   *
   * @example
   * // Get current user
   * const me = await kick.api.users.get();
   *
   * @example
   * // Get specific users
   * const users = await kick.api.users.get({ id: [123, 456] });
   */
  async get(params: GetUsersParams = {}): Promise<GetUsersResponse> {
    const search = new URLSearchParams();

    params.id?.forEach((v) => search.append("id", String(v)));

    const query = search.toString();

    return this.rest.fetch(`/public/v1/users${query ? `?${query}` : ""}`, {
      method: "GET",
    });
  }
}
