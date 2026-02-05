/**
 * Represents a message in a chat interface.
 * - `content`: The text content of the message.
 * - `type`: The type of message, either from a "bot" or a "user". Defaults to "bot" if not specified.
 *
 * @interface ChatMessage
 * @property {string} content - The text content of the message.
 * @property {"bot" | "user"} [type] - The type of message, either "bot" or "user".
 *
 */
export interface ChatMessage {
  content: string;
  type?: "bot" | "user";
}
