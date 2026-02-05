import type { RestClient } from "../rest/RestClient.ts";
import type { GetCategoriesParams } from "../../types/api";

/**
 * CategoriesAPI provides access to Kick Category APIs.
 *
 * @example
 * const categories = await kick.api.categories.get({ limit: 10 });
 * console.log(categories.data);
 */
export class CategoriesAPI {
  constructor(private readonly rest: RestClient) {}

  /**
   * Retrieve categories based on filters.
   * * Allows filtering by cursor, limit, names, tags, or specific IDs.
   *
   * @param params Query parameters
   * @returns Kick category data
   *
   * @example
   * // Get categories with a limit
   * const categories = await kick.api.categories.get({ limit: 5 });
   *
   * @example
   * // Get specific categories by name
   * const categories = await kick.api.categories.get({ name: ["Just Chatting", "Slots"] });
   */
  async get(params: GetCategoriesParams = {}): Promise<unknown> {
    const search = new URLSearchParams();

    if (params.cursor) search.set("cursor", params.cursor.toString());
    if (params.limit) search.set("limit", params.limit.toString());
    if (params.name) params.name.forEach((name) => search.append("name", name));
    if (params.tags) params.tags.forEach((tag) => search.append("tags", tag));
    if (params.id)
      params.id.forEach((id) => search.append("id", id.toString()));

    const query = search.toString();

    return this.rest.fetch(`/public/v2/categories${query ? `?${query}` : ""}`, {
      method: "GET",
    });
  }
}
